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

import { TASKS as TASKS_SEED, type Task, type TaskStatus, DEMO_TODAY } from "@/data/proyectos";
import { EVIDENCE_CATALOG, responsible } from "@/data/cmi";
import type { SessionUser } from "@/lib/session";
import { can } from "@/lib/permissions";
import { INITIATIVES_FULL } from "@/data/cmi";

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

const g = globalThis as unknown as {
  __pgtdTasks?: Task[];
  __pgtdEvidence?: Map<string, EvidenceStatus>;
  __pgtdAudit?: AuditEntry[];
  __pgtdHydrated?: boolean;
};

// memoria compartida entre requests (persistente durante la vida del proceso)
if (!g.__pgtdTasks) g.__pgtdTasks = TASKS_SEED.map((t) => ({ ...t }));
if (!g.__pgtdEvidence) {
  g.__pgtdEvidence = new Map(EVIDENCE_CATALOG.map((e) => [e.id, e.status]));
}
if (!g.__pgtdAudit) g.__pgtdAudit = [];

const tasks = () => g.__pgtdTasks!;
const evidenceStatus = () => g.__pgtdEvidence!;
const auditLog = () => g.__pgtdAudit!;

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
  patch: Partial<Pick<Task, "status" | "assigneeId" | "start" | "due" | "note">> & { blockNote?: string },
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
    // regla: cerrar exige evidencia cuando la tarea la requiere
    if (patch.status === "HECHA" && t.requiresEvidence && !(t.evidenceIds?.length)) {
      return {
        ok: false, status: 422,
        error: "Esta tarea exige evidencia para cerrarse: adjunta el soporte antes de marcarla como hecha.",
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

/* ═══ Utilidad para la demo ═══ */

export function resetStore() {
  g.__pgtdTasks = TASKS_SEED.map((t) => ({ ...t }));
  g.__pgtdEvidence = new Map(EVIDENCE_CATALOG.map((e) => [e.id, e.status]));
  g.__pgtdAudit = [];
}

export { DEMO_TODAY, responsible };
