// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Lógica del gestor de proyectos.
// Alertas de tareas (vencidas, bloqueadas, entregables sin evidencia,
// dependencias rotas), carga por persona y estadísticas por iniciativa.
// Funciones puras sobre los datos de proyectos; cubiertas por tests.
// ─────────────────────────────────────────────────────────────────────────────

import {
  PEOPLE, person, isOverdue, dueSoon, DEMO_TODAY, assigneesOf,
  type Task, type TaskStatus,
} from "@/data/proyectos";
import { getTasks } from "@/server/store";
import { INITIATIVES_FULL } from "@/data/cmi";

// Fuente de tareas: el store mutable (memoria + write-through a Postgres).
const TASKS = () => getTasks();
const tasksOf = (iniId: string) => TASKS().filter((t) => t.iniId === iniId);

/* ═══ Alertas de tareas ═══ */

export type TaskAlert = {
  id: string;
  kind: "TAREA_VENCIDA" | "TAREA_BLOQUEADA" | "ENTREGABLE_SIN_EVIDENCIA" | "DEPENDENCIA_VENCIDA";
  severity: 1 | 2 | 3;
  taskId: string;
  title: string;
  detail: string;
  ownerName: string;
  line: number;               // línea de la iniciativa (para dirigir notificaciones)
};

const daysLate = (t: Task) =>
  Math.round((new Date(DEMO_TODAY).getTime() - new Date(t.due).getTime()) / 86_400_000);

export function taskAlerts(): TaskAlert[] {
  const alerts: TaskAlert[] = [];
  const byId = new Map(TASKS().map((t) => [t.id, t]));

  for (const t of TASKS()) {
    const ini = INITIATIVES_FULL.find((i) => i.id === t.iniId)!;
    const who = person(t.assigneeId).name;
    const line = ini.line;

    if (isOverdue(t)) {
      const late = daysLate(t);
      alerts.push({
        id: `tv-${t.id}`,
        kind: "TAREA_VENCIDA",
        severity: late > 21 ? 1 : 2,
        taskId: t.id,
        line,
        title: t.title,
        detail: `Vencida hace ${late} día${late === 1 ? "" : "s"} en «${ini.name}».${t.note ? " " + t.note : ""}`,
        ownerName: who,
      });
    }

    if (t.status === "BLOQUEADA") {
      alerts.push({
        id: `tb-${t.id}`,
        kind: "TAREA_BLOQUEADA",
        severity: 2,
        taskId: t.id,
        line,
        title: t.title,
        detail: `Bloqueada en «${ini.name}».${t.note ? " " + t.note : ""}`,
        ownerName: who,
      });
    }

    // toda tarea hecha debe tener al menos una evidencia (regla dura del cierre)
    if (t.status === "HECHA" && !(t.evidenceIds?.length)) {
      alerts.push({
        id: `te-${t.id}`,
        kind: "ENTREGABLE_SIN_EVIDENCIA",
        severity: 3,
        taskId: t.id,
        line,
        title: t.title,
        detail: `Cerrada sin evidencia adjunta en «${ini.name}»: toda actividad exige soporte verificable al cierre.`,
        ownerName: who,
      });
    }

    // dependencia vencida: la tarea espera un prerrequisito que ya venció
    if (t.status === "POR_HACER" && t.dependsOn?.length) {
      const lateDep = t.dependsOn.map((d) => byId.get(d)).find((d) => d && isOverdue(d));
      if (lateDep) {
        alerts.push({
          id: `td-${t.id}`,
          kind: "DEPENDENCIA_VENCIDA",
          severity: 3,
          taskId: t.id,
          line,
          title: t.title,
          detail: `Su prerrequisito «${lateDep.title}» está vencido: el cronograma de «${ini.name}» se corre en cadena.`,
          ownerName: who,
        });
      }
    }
  }
  return alerts.sort((a, b) => a.severity - b.severity);
}

/* ═══ Carga por persona ═══ */

export type Workload = {
  personId: string;
  name: string;
  cargo: string;
  open: number;        // tareas no cerradas
  overdue: number;
  dueSoon: number;     // vencen en ≤ 14 días
  done: number;
  total: number;
};

export function workload(): Workload[] {
  return PEOPLE.map((p) => {
    // cuenta como suya toda tarea donde es principal o corresponsable
    const mine = TASKS().filter((t) => assigneesOf(t).includes(p.id));
    return {
      personId: p.id,
      name: p.name,
      cargo: p.cargo,
      open: mine.filter((t) => t.status !== "HECHA").length,
      overdue: mine.filter(isOverdue).length,
      dueSoon: mine.filter((t) => dueSoon(t)).length,
      done: mine.filter((t) => t.status === "HECHA").length,
      total: mine.length,
    };
  }).filter((w) => w.total > 0)
    .sort((a, b) => b.overdue - a.overdue || b.open - a.open);
}

/* ═══ Estadísticas por iniciativa ═══ */

export function initiativeTaskStats(iniId: string) {
  const mine = tasksOf(iniId);
  return {
    total: mine.length,
    done: mine.filter((t) => t.status === "HECHA").length,
    overdue: mine.filter(isOverdue).length,
    blocked: mine.filter((t) => t.status === "BLOQUEADA").length,
    nextDue: mine
      .filter((t) => t.status !== "HECHA" && !isOverdue(t))
      .sort((a, b) => a.due.localeCompare(b.due))[0] ?? null,
  };
}

export function portfolioTaskStats() {
  const byStatus: Record<TaskStatus, number> = {
    POR_HACER: 0, EN_CURSO: 0, EN_REVISION: 0, BLOQUEADA: 0, HECHA: 0,
  };
  for (const t of TASKS()) byStatus[t.status]++;
  return {
    total: TASKS().length,
    byStatus,
    overdue: TASKS().filter(isOverdue).length,
    dueSoon: TASKS().filter((t) => dueSoon(t)).length,
    withEvidence: TASKS().filter((t) => (t.evidenceIds?.length ?? 0) > 0).length,
    people: PEOPLE.filter((p) => TASKS().some((t) => assigneesOf(t).includes(p.id))).length,
  };
}
