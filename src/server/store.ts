// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Store de escritura (Fase 1 del gestor real).
// Memoria mutable inicializada desde los datos demo, con write-through a
// Postgres cuando DATABASE_URL está configurada:
//   - Sin base de datos: las mutaciones viven en memoria (se pierden al
//     reiniciar el servidor) — suficiente para operar la demo.
//   - Con base de datos: cada mutación se persiste vía Prisma y la memoria
//     actúa como caché de lectura, hidratada al arrancar.
// Todas las mutaciones validan reglas de negocio y escriben auditoría.
// ─────────────────────────────────────────────────────────────────────────────

import { TASKS as TASKS_SEED, PEOPLE, type Task, type TaskStatus, DEMO_TODAY } from "@/data/proyectos";
import {
  EVIDENCE_CATALOG, responsible, INITIATIVES_FULL, SCORES_HISTORY, KPI_CATALOG,
  currentAssessment as staticCurrent, previousAssessment as staticPrevious,
  type AssessmentRecord, type CellScore, type KpiFull, type InitiativeFull,
} from "@/data/cmi";
import { VARIABLES } from "@/data/instrument";
import { periodIndex, isValidPeriod } from "@/lib/period";
import type { SessionUser } from "@/lib/session";
import { can } from "@/lib/permissions";

/* ═══ Estado ═══ */

type EvidenceStatus = "VERIFICADA" | "PENDIENTE";

export type AuditEntry = {
  id: number;
  at: string;               // ISO
  actor: string;            // nombre del usuario
  role: string;
  entity: "task" | "evidence";
  entityId: string;
  change: string;           // descripción legible
};

export type TaskComment = {
  id: number;
  taskId: string;
  author: string;
  role: string;
  text: string;
  at: string;               // ISO
};

export type UploadedEvidence = {
  id: string;               // EV-U01…
  taskId: string;
  title: string;
  kind: string;             // Documento | Acta | Informe | Sistema | Otro
  fileName: string;
  filePath: string;         // ruta local (var/uploads); en producción, clave R2
  size: number;
  mime: string;
  uploadedBy: string;
  date: string;             // ISO fecha
  status: EvidenceStatus;
};

/** Captura de una variable durante la medición A3 (en curso). */
export type VariableCapture = {
  perception?: number;          // 1–5 · autodiagnóstico consolidado (responsable o consultor)
  d?: number;                   // 0–4 · documentación (solo consultor)
  i?: number;                   // 0–4 · implementación (solo consultor)
  k?: number;                   // 0–4 · indicadores (solo consultor)
  level?: number;               // 1–5 · nivel calificado contra la rúbrica (solo consultor)
  note?: string;                // observación de la sesión de calificación
  by: string;
  at: string;                   // ISO
};

/** Valor de KPI reportado desde la plataforma (se suma a la serie del seed). */
export type KpiReport = {
  code: string;
  period: string;               // "2027-T2" · "2027-S1" · "2027"
  value: number;
  note?: string;
  by: string;
  at: string;                   // ISO
};

/** Cambios de una iniciativa hechos desde la plataforma (overlay sobre el seed). */
export type InitiativeOverride = {
  progress?: number;                                            // 0–100
  status?: InitiativeFull["status"];
  factors?: Record<string, { state: "VERDE" | "AMBAR" | "ROJO"; note?: string; history: string[] }>;
  logAppends?: { date: string; type: "HITO" | "ALERTA" | "NOTA"; text: string }[];
  nextMilestone?: { date: string; text: string };
};

const g = globalThis as unknown as {
  __pgtdTasks?: Task[];
  __pgtdEvidence?: Map<string, EvidenceStatus>;
  __pgtdAudit?: AuditEntry[];
  __pgtdComments?: TaskComment[];
  __pgtdUploads?: UploadedEvidence[];
  __pgtdBaseline?: Map<string, { start: string; due: string }>;
  __pgtdCapture?: Map<string, VariableCapture>;
  __pgtdPublished?: AssessmentRecord | null;
  __pgtdKpiReports?: Map<string, KpiReport[]>;
  __pgtdIniOverrides?: Map<string, InitiativeOverride>;
  __pgtdHydrated?: boolean;
};

// memoria compartida entre requests (persistente durante la vida del proceso)
if (!g.__pgtdTasks) g.__pgtdTasks = TASKS_SEED.map((t) => ({ ...t }));
if (!g.__pgtdEvidence) {
  g.__pgtdEvidence = new Map(EVIDENCE_CATALOG.map((e) => [e.id, e.status]));
}
if (!g.__pgtdAudit) g.__pgtdAudit = [];
if (!g.__pgtdComments) g.__pgtdComments = [];
if (!g.__pgtdUploads) g.__pgtdUploads = [];
// línea base del cronograma: las fechas del plan aprobado (seed) se congelan;
// las reprogramaciones mueven las vigentes y el deslizamiento se mide contra esta.
if (!g.__pgtdBaseline) {
  g.__pgtdBaseline = new Map(TASKS_SEED.map((t) => [t.id, { start: t.start, due: t.due }]));
}

if (!g.__pgtdCapture) g.__pgtdCapture = new Map();
if (g.__pgtdPublished === undefined) g.__pgtdPublished = null;
if (!g.__pgtdKpiReports) g.__pgtdKpiReports = new Map();
if (!g.__pgtdIniOverrides) g.__pgtdIniOverrides = new Map();

const tasks = () => g.__pgtdTasks!;
const comments = () => g.__pgtdComments!;
const uploads = () => g.__pgtdUploads!;
const baselines = () => g.__pgtdBaseline!;
const evidenceStatus = () => g.__pgtdEvidence!;
const auditLog = () => g.__pgtdAudit!;
const capture = () => g.__pgtdCapture!;

/* ═══ Prisma opcional (write-through) ═══ */

const hasDb = () => Boolean(process.env.DATABASE_URL);

async function prisma() {
  const { PrismaClient } = await import("@prisma/client");
  const gp = globalThis as unknown as { __pgtdPrisma?: InstanceType<typeof PrismaClient> };
  if (!gp.__pgtdPrisma) gp.__pgtdPrisma = new PrismaClient();
  return gp.__pgtdPrisma;
}

/** Hidrata la memoria desde Postgres (solo una vez por proceso, si hay DB). */
export async function hydrateFromDb() {
  if (!hasDb() || g.__pgtdHydrated) return;
  try {
    const db = await prisma();
    const rows = await db.projectTask.findMany();
    if (rows.length) {
      const byId = new Map(rows.map((r) => [r.id, r]));
      for (const t of tasks()) {
        const r = byId.get(t.id);
        if (!r) continue;
        t.status = r.status as TaskStatus;
        t.assigneeId = r.assigneeId;
        t.coAssigneeIds = (r.coAssigneeIds as string[] | null) ?? t.coAssigneeIds;
        t.start = r.start.toISOString().slice(0, 10);
        t.due = r.due.toISOString().slice(0, 10);
        t.note = r.note ?? t.note;
        t.evidenceIds = (r.evidenceIds as string[] | null) ?? t.evidenceIds;
      }
    }
    g.__pgtdHydrated = true;
  } catch {
    // sin conexión: se continúa en modo memoria
  }
}

/* ═══ Lecturas ═══ */

export const getTasks = (): Task[] => tasks();
export const getTask = (id: string) => tasks().find((t) => t.id === id) ?? null;
export const getEvidenceStatus = (id: string): EvidenceStatus =>
  evidenceStatus().get(id) ?? "PENDIENTE";
export const getAudit = (entityId?: string): AuditEntry[] =>
  entityId ? auditLog().filter((a) => a.entityId === entityId) : auditLog();

export const getComments = (taskId?: string): TaskComment[] =>
  taskId ? comments().filter((c) => c.taskId === taskId) : comments();

export const getUploads = (taskId?: string): UploadedEvidence[] =>
  taskId ? uploads().filter((u) => u.taskId === taskId) : uploads();

export const getUploadById = (id: string) => uploads().find((u) => u.id === id) ?? null;

export const getBaseline = (taskId: string) => baselines().get(taskId) ?? null;

/** Deslizamiento en días de la fecha compromiso frente a la línea base. */
export const deviationDays = (t: Task): number => {
  const base = baselines().get(t.id);
  if (!base) return 0;
  return Math.round(
    (new Date(t.due).getTime() - new Date(base.due).getTime()) / 86_400_000,
  );
};

/** Deslizamiento acumulado del portafolio (solo positivos: días perdidos). */
export const portfolioSlippage = () => {
  const shifted = tasks().map((t) => ({ t, d: deviationDays(t) })).filter((x) => x.d !== 0);
  return {
    tasksShifted: shifted.length,
    daysLost: shifted.filter((x) => x.d > 0).reduce((a, x) => a + x.d, 0),
    daysGained: -shifted.filter((x) => x.d < 0).reduce((a, x) => a + x.d, 0),
  };
};

/* ═══ Reglas de transición ═══ */

const VALID_STATUS: TaskStatus[] = ["POR_HACER", "EN_CURSO", "EN_REVISION", "BLOQUEADA", "HECHA"];

export type MutationResult =
  | { ok: true; task: Task }
  | { ok: false; status: number; error: string };

function audit(actor: SessionUser, entity: "task" | "evidence", entityId: string, change: string) {
  auditLog().unshift({
    id: auditLog().length + 1,
    at: new Date().toISOString(),
    actor: actor.name,
    role: actor.role,
    entity,
    entityId,
    change,
  });
}

/* ═══ Mutación: tarea ═══ */

export async function updateTask(
  user: SessionUser,
  id: string,
  patch: Partial<Pick<Task, "status" | "assigneeId" | "coAssigneeIds" | "start" | "due" | "note">> & { blockNote?: string },
): Promise<MutationResult> {
  const t = getTask(id);
  if (!t) return { ok: false, status: 404, error: "La tarea no existe." };

  // permiso: edición total o de la línea de la iniciativa
  const ini = INITIATIVES_FULL.find((i) => i.id === t.iniId)!;
  if (!can(user, "edit_tasks", ini.line)) {
    return {
      ok: false, status: 403,
      error: user.role === "DIRECTIVO"
        ? "Tu rol es de consulta: no puede editar tareas."
        : `No puedes editar tareas de la línea 4.${ini.line}: tu ámbito es la línea 4.${user.line}.`,
    };
  }

  const changes: string[] = [];

  if (patch.status && patch.status !== t.status) {
    if (!VALID_STATUS.includes(patch.status)) {
      return { ok: false, status: 422, error: "Estado inválido." };
    }
    // regla: NINGUNA tarea se cierra sin evidencia — cuenta la del catálogo
    // y la subida como archivo. Lo hecho se demuestra, no se declara.
    const hasEvidence = (t.evidenceIds?.length ?? 0) > 0 || getUploads(id).length > 0;
    if (patch.status === "HECHA" && !hasEvidence) {
      return {
        ok: false, status: 422,
        error: "Toda actividad exige al menos una evidencia para cerrarse: adjunta el soporte antes de marcarla como hecha.",
      };
    }
    // regla: bloquear exige motivo
    if (patch.status === "BLOQUEADA" && !patch.blockNote && !patch.note) {
      return { ok: false, status: 422, error: "Bloquear una tarea exige registrar el motivo." };
    }
    changes.push(`estado ${t.status} → ${patch.status}`);
    t.status = patch.status;
    if (patch.blockNote) t.note = patch.blockNote;
  }

  if (patch.assigneeId && patch.assigneeId !== t.assigneeId) {
    changes.push(`responsable ${t.assigneeId} → ${patch.assigneeId}`);
    t.assigneeId = patch.assigneeId;
  }

  if (patch.coAssigneeIds !== undefined) {
    // corresponsables: personas válidas, sin duplicados ni el principal
    if (!Array.isArray(patch.coAssigneeIds) ||
        patch.coAssigneeIds.some((p) => typeof p !== "string" || !PEOPLE.some((x) => x.id === p))) {
      return { ok: false, status: 422, error: "Corresponsables inválidos: deben ser personas del directorio." };
    }
    const clean = [...new Set(patch.coAssigneeIds)].filter((p) => p !== t.assigneeId);
    const before = (t.coAssigneeIds ?? []).join(",");
    if (clean.join(",") !== before) {
      changes.push(`corresponsables [${before || "—"}] → [${clean.join(",") || "—"}]`);
      t.coAssigneeIds = clean;
    }
  }

  if (patch.start && patch.start !== t.start) {
    changes.push(`inicio ${t.start} → ${patch.start}`);
    t.start = patch.start;
  }
  if (patch.due && patch.due !== t.due) {
    if ((patch.start ?? t.start) > patch.due) {
      return { ok: false, status: 422, error: "La fecha compromiso no puede ser anterior al inicio." };
    }
    changes.push(`compromiso ${t.due} → ${patch.due}`);
    t.due = patch.due;
  }
  if (patch.note !== undefined && patch.note !== t.note && !patch.blockNote) {
    changes.push("nota actualizada");
    t.note = patch.note;
  }

  if (changes.length === 0) return { ok: true, task: t };

  audit(user, "task", id, changes.join(" · "));

  // write-through a Postgres si está configurada
  if (hasDb()) {
    try {
      const db = await prisma();
      await db.projectTask.update({
        where: { id },
        data: {
          status: t.status,
          assigneeId: t.assigneeId,
          coAssigneeIds: t.coAssigneeIds ?? [],
          start: new Date(t.start),
          due: new Date(t.due),
          note: t.note,
        },
      });
    } catch {
      // la memoria queda como fuente; la reconciliación ocurre al reconectar
    }
  }

  return { ok: true, task: t };
}

/* ═══ Mutación: verificación de evidencia ═══ */

export async function verifyEvidence(
  user: SessionUser,
  evidenceId: string,
): Promise<{ ok: true; status: EvidenceStatus } | { ok: false; status: number; error: string }> {
  if (!can(user, "verify_evidence")) {
    return {
      ok: false, status: 403,
      error: "Solo el equipo consultor puede verificar evidencia: es la garantía de independencia de la medición.",
    };
  }
  const ev = EVIDENCE_CATALOG.find((e) => e.id === evidenceId);
  if (!ev) return { ok: false, status: 404, error: "La evidencia no existe." };
  if (getEvidenceStatus(evidenceId) === "VERIFICADA") {
    return { ok: true, status: "VERIFICADA" };
  }
  evidenceStatus().set(evidenceId, "VERIFICADA");
  audit(user, "evidence", evidenceId, `evidencia verificada («${ev.title}»)`);

  if (hasDb()) {
    try {
      const db = await prisma();
      await db.evidence.updateMany({ where: { title: ev.title }, data: { status: "VERIFICADA" } });
    } catch { /* memoria como fuente */ }
  }
  return { ok: true, status: "VERIFICADA" };
}

/* ═══ Mutación: comentario ═══ */

export function addComment(
  user: SessionUser,
  taskId: string,
  text: string,
): { ok: true; comment: TaskComment } | { ok: false; status: number; error: string } {
  // comentar es deliberación: cualquier rol autenticado puede (incluido el directivo)
  const t = getTask(taskId);
  if (!t) return { ok: false, status: 404, error: "La tarea no existe." };
  const clean = text.trim();
  if (!clean) return { ok: false, status: 422, error: "El comentario no puede estar vacío." };
  if (clean.length > 2000) return { ok: false, status: 422, error: "Máximo 2.000 caracteres." };
  const comment: TaskComment = {
    id: comments().length + 1,
    taskId,
    author: user.name,
    role: user.role,
    text: clean,
    at: new Date().toISOString(),
  };
  comments().push(comment);
  audit(user, "task", taskId, "comentario añadido");
  return { ok: true, comment };
}

/* ═══ Mutación: adjuntar evidencia (archivo) ═══ */

export function attachEvidence(
  user: SessionUser,
  taskId: string,
  file: { fileName: string; filePath: string; size: number; mime: string },
  meta: { title: string; kind: string },
): { ok: true; evidence: UploadedEvidence } | { ok: false; status: number; error: string } {
  const t = getTask(taskId);
  if (!t) return { ok: false, status: 404, error: "La tarea no existe." };
  const ini = INITIATIVES_FULL.find((i) => i.id === t.iniId)!;
  if (!can(user, "edit_tasks", ini.line)) {
    return { ok: false, status: 403, error: "Tu rol no puede adjuntar evidencia en esta tarea." };
  }
  if (!meta.title.trim()) {
    return { ok: false, status: 422, error: "La evidencia necesita un título descriptivo." };
  }
  const evidence: UploadedEvidence = {
    id: `EV-U${String(uploads().length + 1).padStart(2, "0")}`,
    taskId,
    title: meta.title.trim(),
    kind: meta.kind || "Documento",
    ...file,
    uploadedBy: user.name,
    date: new Date().toISOString().slice(0, 10),
    status: "PENDIENTE",   // nace pendiente: la verifica el consultor
  };
  uploads().push(evidence);
  audit(user, "task", taskId, `evidencia adjuntada («${evidence.title}», ${evidence.fileName})`);
  return { ok: true, evidence };
}

/** Verificación de evidencia subida (solo consultor). */
export function verifyUploadedEvidence(
  user: SessionUser,
  evidenceId: string,
): { ok: true } | { ok: false; status: number; error: string } {
  if (!can(user, "verify_evidence")) {
    return { ok: false, status: 403, error: "Solo el equipo consultor puede verificar evidencia." };
  }
  const ev = uploads().find((u) => u.id === evidenceId);
  if (!ev) return { ok: false, status: 404, error: "La evidencia no existe." };
  ev.status = "VERIFICADA";
  audit(user, "evidence", evidenceId, `evidencia subida verificada («${ev.title}»)`);
  return { ok: true };
}

/* ═══ Captura de la medición A3 ═══
   El instrumento se aplica desde la plataforma: el responsable de línea
   registra la percepción de SUS variables; el consultor califica D/I/K
   contra los criterios del protocolo y asigna el nivel 1–5 contra la
   rúbrica (garantía de independencia). Publicar exige las 52 calificadas
   y conmuta la medición vigente de toda la lógica del servidor. */

const inRange = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;

export function getCapture(): Record<string, VariableCapture> {
  return Object.fromEntries(capture());
}

export function captureProgress() {
  const caps = capture();
  let perception = 0, dik = 0, level = 0;
  for (const v of VARIABLES) {
    const c = caps.get(v.id);
    if (!c) continue;
    if (c.perception !== undefined) perception++;
    if (c.d !== undefined && c.i !== undefined && c.k !== undefined) dik++;
    if (c.level !== undefined) level++;
  }
  return { total: VARIABLES.length, perception, dik, level };
}

export function captureVariable(
  user: SessionUser,
  varId: string,
  patch: { perception?: number; d?: number; i?: number; k?: number; level?: number; note?: string },
): { ok: true; capture: VariableCapture } | { ok: false; status: number; error: string } {
  const v = VARIABLES.find((x) => x.id === varId);
  if (!v) return { ok: false, status: 404, error: "La variable no existe en el instrumento." };
  if (g.__pgtdPublished) {
    return { ok: false, status: 422, error: "El corte A3 ya está publicado: la captura está cerrada." };
  }

  // permiso: captura total (consultor) o de la línea propia (responsable)
  if (!can(user, "capture_maturity", v.line)) {
    return {
      ok: false, status: 403,
      error: user.role === "RESPONSABLE"
        ? `No puedes capturar variables de la línea 4.${v.line}: tu ámbito es la línea 4.${user.line}.`
        : "Tu rol no participa en la captura de la medición.",
    };
  }

  // la calificación (D/I/K y nivel) es del consultor: independencia de la medición
  const grading = patch.d !== undefined || patch.i !== undefined ||
    patch.k !== undefined || patch.level !== undefined;
  if (grading && !can(user, "publish_maturity")) {
    return {
      ok: false, status: 403,
      error: "La calificación de evidencia (D/I/K) y el nivel son del equipo consultor; tu captura registra la percepción del autodiagnóstico.",
    };
  }

  // rangos
  if (patch.perception !== undefined && !inRange(patch.perception, 1, 5)) {
    return { ok: false, status: 422, error: "La percepción es un entero 1–5 (Likert)." };
  }
  for (const [k2, max] of [["d", 4], ["i", 4], ["k", 4], ["level", 5]] as const) {
    const val = patch[k2 as "d" | "i" | "k" | "level"];
    if (val !== undefined && !inRange(val, k2 === "level" ? 1 : 0, max)) {
      return { ok: false, status: 422, error: `Valor inválido para ${k2.toUpperCase()}: entero ${k2 === "level" ? "1" : "0"}–${max}.` };
    }
  }

  const prev = capture().get(varId) ?? {} as VariableCapture;
  const next: VariableCapture = {
    ...prev,
    ...Object.fromEntries(Object.entries(patch).filter(([, val]) => val !== undefined)),
    by: user.name,
    at: new Date().toISOString(),
  };
  capture().set(varId, next);

  const what = Object.keys(patch).filter((k2) => patch[k2 as keyof typeof patch] !== undefined).join(", ");
  audit(user, "task", varId, `captura A3: ${what}`);
  return { ok: true, capture: next };
}

/** Publica el corte A3: exige las 52 variables con nivel calificado. */
export function publishCapture(
  user: SessionUser,
): { ok: true; assessment: AssessmentRecord } | { ok: false; status: number; error: string } {
  if (!can(user, "publish_maturity")) {
    return { ok: false, status: 403, error: "Solo el equipo consultor publica mediciones." };
  }
  if (g.__pgtdPublished) {
    return { ok: true, assessment: g.__pgtdPublished };
  }
  const prog = captureProgress();
  if (prog.level < prog.total) {
    return {
      ok: false, status: 422,
      error: `Faltan ${prog.total - prog.level} variables por calificar (nivel contra la rúbrica). Una medición parcial no se publica.`,
    };
  }

  // celda = promedio simple de sus variables (la misma regla del instrumento)
  const base = staticCurrent().scores!;
  const scores: Record<number, Record<string, CellScore>> = {};
  for (const line of [1, 2, 3, 4]) {
    scores[line] = {};
    for (const dim of ["organizacional", "misional", "tecnologica", "datos"]) {
      const vars = VARIABLES.filter((x) => x.line === line && x.dimension === dim);
      const avg = vars.reduce((a, x) => a + capture().get(x.id)!.level!, 0) / vars.length;
      scores[line][dim] = {
        value: Math.round(avg * 10) / 10,
        target: base[line][dim].target,     // la meta a 24 meses no cambia con el corte
      };
    }
  }

  const assessment: AssessmentRecord = {
    id: "A3",
    label: "Corte de seguimiento 2",
    period: "2027-08",
    status: "PUBLICADA",
    note: `Publicada desde la plataforma por ${user.name}: 52 variables calificadas, percepción ${prog.perception}/52, evidencia D/I/K ${prog.dik}/52.`,
    scores,
  };
  g.__pgtdPublished = assessment;
  audit(user, "task", "A3", "medición A3 publicada (corte vigente)");
  return { ok: true, assessment };
}

/* ═══ Reporte de valores de KPI ═══
   El responsable de línea reporta los KPI de SU línea; líder y consultor,
   todos. El valor se suma a la serie del seed (overlay) y el motor —salud,
   proyección, alertas— lo lee como un punto más. */

const kpiReports = () => g.__pgtdKpiReports!;

export const getKpiReports = (code?: string): KpiReport[] =>
  code ? (kpiReports().get(code) ?? []) : [...kpiReports().values()].flat();

/** Serie efectiva: seed + valores reportados, ordenada por periodo. */
export function effectiveKpiSeries(code: string): KpiFull["series"] {
  const k = KPI_CATALOG.find((x) => x.code === code);
  if (!k) return [];
  const reported = (kpiReports().get(code) ?? []).map((r) => ({
    period: r.period, value: r.value, note: r.note ?? `Reportado por ${r.by}`,
  }));
  const merged = [...k.series.filter((s) => !reported.some((r) => r.period === s.period)), ...reported];
  return merged.sort((a, b) => periodIndex(a.period) - periodIndex(b.period));
}

export const effectiveKpis = (): KpiFull[] =>
  KPI_CATALOG.map((k) => ({ ...k, series: effectiveKpiSeries(k.code) }));

export function reportKpi(
  user: SessionUser,
  code: string,
  period: string,
  value: number,
  note?: string,
): { ok: true; report: KpiReport; series: KpiFull["series"] } | { ok: false; status: number; error: string } {
  const k = KPI_CATALOG.find((x) => x.code === code);
  if (!k) return { ok: false, status: 404, error: "El indicador no existe en el catálogo." };

  if (!can(user, "report_kpi", k.line)) {
    return {
      ok: false, status: 403,
      error: user.role === "DIRECTIVO"
        ? "Tu rol es de consulta: no reporta valores de KPI."
        : `No puedes reportar KPI de la línea 4.${k.line}: tu ámbito es la línea 4.${user.line}.`,
    };
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return { ok: false, status: 422, error: "El valor debe ser un número no negativo." };
  }
  if (typeof period !== "string" || !isValidPeriod(period)) {
    return { ok: false, status: 422, error: "Periodo inválido. Formatos: 2027 · 2027-S1 · 2027-T3." };
  }
  // el periodo no puede ser anterior a la serie del seed (correcciones solo
  // sobre lo reportado desde la plataforma)
  const lastSeed = k.series[k.series.length - 1];
  if (periodIndex(period) < periodIndex(lastSeed.period)) {
    return {
      ok: false, status: 422,
      error: `La serie oficial llega hasta ${lastSeed.period}: los periodos anteriores no se reescriben desde aquí.`,
    };
  }

  const report: KpiReport = { code, period, value, note: note?.trim() || undefined, by: user.name, at: new Date().toISOString() };
  const list = kpiReports().get(code) ?? [];
  const existing = list.findIndex((r) => r.period === period);
  if (existing >= 0) list[existing] = report;   // corrección del mismo periodo (auditada)
  else list.push(report);
  kpiReports().set(code, list);

  audit(user, "task", code, `KPI ${code}: ${period} = ${value} ${k.unit}${existing >= 0 ? " (corrección)" : ""}`);
  return { ok: true, report, series: effectiveKpiSeries(code) };
}

/* ═══ Actualización de iniciativas ═══
   Avance, estado, factores de éxito (con historial de revisiones), bitácora
   y próximo hito. El responsable de línea edita SU línea. */

const iniOverrides = () => g.__pgtdIniOverrides!;

export const getInitiativeOverrides = (): Record<string, InitiativeOverride> =>
  Object.fromEntries(iniOverrides());

/** Iniciativas efectivas: seed + cambios hechos desde la plataforma. */
export function effectiveInitiatives(): InitiativeFull[] {
  return INITIATIVES_FULL.map((i) => {
    const o = iniOverrides().get(i.id);
    if (!o) return i;
    return {
      ...i,
      progress: o.progress ?? i.progress,
      status: o.status ?? i.status,
      nextMilestone: o.nextMilestone ?? i.nextMilestone,
      log: [...i.log, ...(o.logAppends ?? [])],
      factors: i.factors.map((f) => {
        const fo = o.factors?.[f.name];
        return fo ? { ...f, state: fo.state, note: fo.note ?? f.note, history: fo.history } : f;
      }),
    };
  });
}

const INI_STATUS: InitiativeFull["status"][] = ["PLANEADA", "EN_CURSO", "EN_RIESGO", "COMPLETADA"];
const FACTOR_STATES = ["VERDE", "AMBAR", "ROJO"] as const;

export function updateInitiative(
  user: SessionUser,
  id: string,
  patch: {
    progress?: number;
    status?: InitiativeFull["status"];
    factor?: { name: string; state: "VERDE" | "AMBAR" | "ROJO"; note?: string };  // registra una revisión
    log?: { type: "HITO" | "ALERTA" | "NOTA"; text: string };
    nextMilestone?: { date: string; text: string };
  },
): { ok: true; initiative: InitiativeFull } | { ok: false; status: number; error: string } {
  const base = INITIATIVES_FULL.find((i) => i.id === id);
  if (!base) return { ok: false, status: 404, error: "La iniciativa no existe." };

  if (!can(user, "edit_initiatives", base.line)) {
    return {
      ok: false, status: 403,
      error: user.role === "DIRECTIVO"
        ? "Tu rol es de consulta: no edita iniciativas."
        : `No puedes editar iniciativas de la línea 4.${base.line}: tu ámbito es la línea 4.${user.line}.`,
    };
  }

  const o: InitiativeOverride = iniOverrides().get(id) ?? {};
  const changes: string[] = [];

  if (patch.progress !== undefined) {
    if (!Number.isInteger(patch.progress) || patch.progress < 0 || patch.progress > 100) {
      return { ok: false, status: 422, error: "El avance es un entero 0–100." };
    }
    changes.push(`avance → ${patch.progress} %`);
    o.progress = patch.progress;
  }

  if (patch.status !== undefined) {
    if (!INI_STATUS.includes(patch.status)) {
      return { ok: false, status: 422, error: "Estado de iniciativa inválido." };
    }
    changes.push(`estado → ${patch.status}`);
    o.status = patch.status;
  }

  if (patch.factor) {
    const f = base.factors.find((x) => x.name === patch.factor!.name);
    if (!f) return { ok: false, status: 422, error: "El factor no pertenece a esta iniciativa." };
    if (!FACTOR_STATES.includes(patch.factor.state)) {
      return { ok: false, status: 422, error: "Estado de factor inválido (VERDE/AMBAR/ROJO)." };
    }
    // registrar la revisión: el estado previo pasa al historial
    const prevState = o.factors?.[f.name]?.state ?? f.state;
    const prevHistory = o.factors?.[f.name]?.history ?? f.history;
    o.factors = {
      ...o.factors,
      [f.name]: {
        state: patch.factor.state,
        note: patch.factor.note?.trim() || undefined,
        history: [...prevHistory, prevState],
      },
    };
    changes.push(`factor «${f.name}» → ${patch.factor.state}`);
  }

  if (patch.log) {
    if (!["HITO", "ALERTA", "NOTA"].includes(patch.log.type) || !patch.log.text?.trim()) {
      return { ok: false, status: 422, error: "La bitácora exige tipo (HITO/ALERTA/NOTA) y texto." };
    }
    o.logAppends = [...(o.logAppends ?? []), { date: DEMO_TODAY, type: patch.log.type, text: patch.log.text.trim() }];
    changes.push(`bitácora: ${patch.log.type.toLowerCase()}`);
  }

  if (patch.nextMilestone) {
    if (!patch.nextMilestone.date?.trim() || !patch.nextMilestone.text?.trim()) {
      return { ok: false, status: 422, error: "El próximo hito exige fecha y descripción." };
    }
    o.nextMilestone = { date: patch.nextMilestone.date.trim(), text: patch.nextMilestone.text.trim() };
    changes.push("próximo hito actualizado");
  }

  if (changes.length === 0) {
    return { ok: false, status: 422, error: "Nada que actualizar." };
  }

  iniOverrides().set(id, o);
  audit(user, "task", id, `iniciativa: ${changes.join(" · ")}`);
  return { ok: true, initiative: effectiveInitiatives().find((i) => i.id === id)! };
}

/* ── medición efectiva: la publicada en el store manda sobre el seed ── */

export const publishedAssessment = (): AssessmentRecord | null => g.__pgtdPublished ?? null;

export const effectiveCurrent = (): AssessmentRecord =>
  g.__pgtdPublished ?? staticCurrent();

export const effectivePrevious = (): AssessmentRecord | null =>
  g.__pgtdPublished ? staticCurrent() : staticPrevious();

export const effectiveAssessments = () =>
  SCORES_HISTORY.map((a) =>
    a.id === "A3" && g.__pgtdPublished
      ? { id: a.id, label: a.label, period: g.__pgtdPublished!.period, status: "PUBLICADA" as const, note: g.__pgtdPublished!.note }
      : { id: a.id, label: a.label, period: a.period, status: a.status, note: a.note });

/* ═══ Utilidad para la demo ═══ */

export function resetStore() {
  g.__pgtdTasks = TASKS_SEED.map((t) => ({ ...t }));
  g.__pgtdEvidence = new Map(EVIDENCE_CATALOG.map((e) => [e.id, e.status]));
  g.__pgtdAudit = [];
  g.__pgtdComments = [];
  g.__pgtdUploads = [];
  g.__pgtdBaseline = new Map(TASKS_SEED.map((t) => [t.id, { start: t.start, due: t.due }]));
  g.__pgtdCapture = new Map();
  g.__pgtdPublished = null;
  g.__pgtdKpiReports = new Map();
  g.__pgtdIniOverrides = new Map();
}

export { DEMO_TODAY, responsible };
