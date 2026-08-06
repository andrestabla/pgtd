// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Lógica de negocio pura.
// Cada regla cita su origen en docs/marco-conceptual.md (§2).
// Sin dependencias de UI ni de red: funciones deterministas y testeables,
// consumidas por las páginas y expuestas por /api/td/*.
// ─────────────────────────────────────────────────────────────────────────────

import {
  KPI_CATALOG, INITIATIVES_FULL, EVIDENCE_CATALOG, SCORES_HISTORY,
  CMI_OBJECTIVES, responsible, currentAssessment, previousAssessment,
  type KpiFull, type InitiativeFull,
} from "@/data/cmi";
import { LINES, DIMENSIONS } from "@/data/demo";
import { taskAlerts } from "@/lib/proyectos";

/* ═══ Utilidades de periodo ═══ */

// Periodos soportados: "2026", "2026-S1", "2026-T3". Se mapean a un índice
// mensual comparable para calcular rezago y proyecciones.
export function periodIndex(period: string): number {
  const m = period.match(/^(\d{4})(?:-([ST])(\d))?$/);
  if (!m) return 0;
  const year = Number(m[1]);
  if (!m[2]) return year * 12 + 6;                       // anual → mitad de año
  if (m[2] === "S") return year * 12 + (Number(m[3]) === 1 ? 3 : 9);
  return year * 12 + (Number(m[3]) * 3 - 1);            // trimestre → mes final
}

const FREQ_MONTHS: Record<KpiFull["frequency"], number> = {
  Mensual: 1, Trimestral: 3, Semestral: 6, Anual: 12,
};

// "Hoy" del modo demo: coherente con la historia de los datos (Fase 5+12m).
export const DEMO_NOW_INDEX = 2027 * 12 + 2; // marzo de 2027

/* ═══ Salud de un KPI ═══
   Reglas: semáforo frente a meta (1.1), rezago de captura según periodicidad
   (1.6) y proyección lineal a fecha meta sobre la serie (1.1, 1.5). */

export type KpiHealth = {
  code: string;
  latest: number;
  latestPeriod: string;
  delta: number;
  improving: boolean;
  pctToTarget: number;               // 0–100+ (capado a 999)
  semaphore: "OK" | "WARN" | "BAD";
  isStale: boolean;                  // sin dato fresco según su periodicidad
  staleBy: number;                   // meses de rezago sobre lo tolerado
  projection: {
    slopePerMonth: number;
    projectedAtTarget: number;       // valor proyectado a la fecha meta (dic-2028)
    willReachTarget: boolean;
  };
};

const TARGET_DATE_INDEX = 2028 * 12 + 11; // horizonte del roadmap: dic-2028

export function kpiHealth(k: KpiFull): KpiHealth {
  const series = k.series;
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const delta = prev ? last.value - prev.value : 0;
  const improving = k.goodDirection === "up" ? delta >= 0 : delta <= 0;

  const pctToTarget = Math.min(
    999,
    Math.round(
      k.goodDirection === "up"
        ? (last.value / k.target) * 100
        : (k.target / Math.max(last.value, 0.0001)) * 100,
    ),
  );
  const semaphore = pctToTarget >= 85 ? "OK" : pctToTarget >= 55 ? "WARN" : "BAD";

  // rezago de captura: si pasaron > 1.5 periodos desde el último dato
  const tolerance = FREQ_MONTHS[k.frequency] * 1.5;
  const monthsSince = DEMO_NOW_INDEX - periodIndex(last.period);
  const isStale = monthsSince > tolerance;

  // proyección lineal (mínimos cuadrados sobre índice mensual)
  const pts = series.map((s) => ({ x: periodIndex(s.period), y: s.value }));
  const n = pts.length;
  const mx = pts.reduce((a, p) => a + p.x, 0) / n;
  const my = pts.reduce((a, p) => a + p.y, 0) / n;
  const den = pts.reduce((a, p) => a + (p.x - mx) ** 2, 0) || 1;
  const slope = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / den;
  const projected = last.value + slope * (TARGET_DATE_INDEX - periodIndex(last.period));
  const willReach = k.goodDirection === "up" ? projected >= k.target : projected <= k.target;

  return {
    code: k.code,
    latest: last.value,
    latestPeriod: last.period,
    delta,
    improving,
    pctToTarget,
    semaphore,
    isStale,
    staleBy: Math.max(0, Math.round(monthsSince - tolerance)),
    projection: {
      slopePerMonth: slope,
      projectedAtTarget: Math.round(projected * 100) / 100,
      willReachTarget: willReach,
    },
  };
}

/* ═══ Riesgo compuesto de una iniciativa ═══
   Barreras BID/Carmo como categorías (1.2, 1.3); racha de factores (1.3);
   sub-ejecución presupuestal frente a avance (1.4). */

export type RiskCategory = "Financiera" | "Cultural" | "Talento" | "Tecnológica" | "Gobernanza";

const RISK_KEYWORDS: [RegExp, RiskCategory][] = [
  [/presupuest|vigencia|recursos|financier/i, "Financiera"],
  [/adopci|particip|resistencia|apropiaci|cultura|consenso/i, "Cultural"],
  [/equipo|personal|vacante|dedicaci|talento|docente/i, "Talento"],
  [/integraci|sistema|plataforma|conectividad|arquitect|TI\b/i, "Tecnológica"],
  [/consejo|comit|agenda|acuerdo|normativ|patrocinio|respaldo/i, "Gobernanza"],
];

export function classifyFactor(name: string, note?: string): RiskCategory {
  const text = `${name} ${note ?? ""}`;
  for (const [re, cat] of RISK_KEYWORDS) if (re.test(text)) return cat;
  return "Gobernanza";
}

export type InitiativeRisk = {
  id: string;
  score: number;                    // 0–100
  level: "BAJO" | "MEDIO" | "ALTO" | "CRÍTICO";
  drivers: { text: string; category: RiskCategory; weight: number }[];
};

export function initiativeRisk(i: InitiativeFull): InitiativeRisk {
  const drivers: InitiativeRisk["drivers"] = [];
  let score = 0;

  // 1 · factores: rojo=18, ámbar=7; racha (≥2 últimos iguales al estado malo) ×1.6
  for (const f of i.factors) {
    if (f.state === "VERDE") continue;
    const streak = [...f.history].reverse().findIndex((h) => h !== f.state);
    const streakLen = streak === -1 ? f.history.length : streak;
    const base = f.state === "ROJO" ? 18 : 7;
    const w = Math.round(base * (streakLen >= 2 ? 1.6 : 1));
    score += w;
    drivers.push({
      text: `${f.name}${streakLen >= 2 ? ` (${streakLen} revisiones en ${f.state.toLowerCase()})` : ""}`,
      category: classifyFactor(f.name, f.note),
      weight: w,
    });
  }

  // 2 · desalineación presupuesto ↔ avance: ejecutar sin avanzar o avanzar sin ejecutar
  if (i.status !== "PLANEADA" && i.budgetPlanned > 0) {
    const spent = (i.budgetExecuted + i.budgetCommitted) / i.budgetPlanned;
    const gap = spent - i.progress / 100;
    if (gap > 0.25) {
      const w = Math.round(gap * 40);
      score += w;
      drivers.push({ text: `Ejecución presupuestal (${Math.round(spent * 100)} %) supera el avance físico (${i.progress} %)`, category: "Financiera", weight: w });
    } else if (gap < -0.3) {
      const w = 8;
      score += w;
      drivers.push({ text: `Avance físico sin respaldo de ejecución presupuestal`, category: "Financiera", weight: w });
    }
  }

  // 3 · acciones vencidas: pendientes o en curso con trimestre ya pasado
  const late = i.actions.filter(
    (a) => a.status !== "HECHA" && periodIndex(a.quarter) < DEMO_NOW_INDEX,
  );
  if (late.length) {
    const w = late.length * 6;
    score += w;
    drivers.push({ text: `${late.length} acción(es) con trimestre vencido`, category: "Gobernanza", weight: w });
  }

  score = Math.min(100, score);
  const level = score >= 55 ? "CRÍTICO" : score >= 35 ? "ALTO" : score >= 15 ? "MEDIO" : "BAJO";
  drivers.sort((a, b) => b.weight - a.weight);
  return { id: i.id, score, level, drivers };
}

/* ═══ Salud de un objetivo CMI ═══
   La cadena causal es lo que se gestiona (1.9): objetivo sano = KPI al día y
   en dirección + iniciativas sin riesgo alto. */

export type ObjectiveHealth = {
  id: string;
  semaphore: "OK" | "WARN" | "BAD";
  kpiOk: number; kpiTotal: number;
  worstInitiativeRisk: InitiativeRisk["level"] | null;
};

export function objectiveHealth(objId: string): ObjectiveHealth {
  const obj = CMI_OBJECTIVES.find((o) => o.id === objId)!;
  const healths = obj.kpis
    .map((c) => KPI_CATALOG.find((k) => k.code === c))
    .filter(Boolean)
    .map((k) => kpiHealth(k!));
  const kpiOk = healths.filter((h) => h.semaphore !== "BAD" && h.improving).length;

  const inis = INITIATIVES_FULL.filter((i) => i.cmi === objId);
  const risks = inis.map(initiativeRisk);
  const worst = risks.length
    ? (["CRÍTICO", "ALTO", "MEDIO", "BAJO"] as const).find((l) => risks.some((r) => r.level === l))!
    : null;

  const bad = healths.some((h) => h.semaphore === "BAD" && !h.improving) || worst === "CRÍTICO";
  const warn = healths.some((h) => h.semaphore !== "OK") || worst === "ALTO" || worst === "MEDIO";
  return {
    id: objId,
    semaphore: bad ? "BAD" : warn ? "WARN" : "OK",
    kpiOk, kpiTotal: healths.length,
    worstInitiativeRisk: worst,
  };
}

/* ═══ Rollup de madurez ═══
   La madurez es una serie, no una foto (1.1): deltas entre cortes y celdas
   sin evidencia como hallazgo (1.10). */

export function maturityRollup() {
  const cur = currentAssessment();
  const prev = previousAssessment();
  const cells = LINES.flatMap((l) =>
    DIMENSIONS.map((d) => {
      const c = cur.scores![l.n][d.key];
      const p = prev?.scores?.[l.n]?.[d.key];
      const evidences = EVIDENCE_CATALOG.filter((e) => e.line === l.n && e.dimension === d.key);
      return {
        line: l.n, dimension: d.key,
        value: c.value, target: c.target,
        delta: p ? c.value - p.value : 0,
        evidences: evidences.length,
        verified: evidences.filter((e) => e.status === "VERIFICADA").length,
      };
    }),
  );
  const lineAvg = (n: number, which: "value" | "target") =>
    cells.filter((c) => c.line === n).reduce((a, c) => a + c[which], 0) / DIMENSIONS.length;
  return {
    assessment: { id: cur.id, label: cur.label, period: cur.period },
    previous: prev ? { id: prev.id, label: prev.label, period: prev.period } : null,
    cells,
    lines: LINES.map((l) => ({
      n: l.n, code: l.code, name: l.name,
      value: lineAvg(l.n, "value"), target: lineAvg(l.n, "target"),
      prev: prev?.scores
        ? Object.values(prev.scores[l.n]).reduce((a, d) => a + d.value, 0) / DIMENSIONS.length
        : null,
    })),
    institution: {
      value: LINES.reduce((a, l) => a + lineAvg(l.n, "value"), 0) / LINES.length,
      target: LINES.reduce((a, l) => a + lineAvg(l.n, "target"), 0) / LINES.length,
    },
    cellsWithoutEvidence: cells.filter((c) => c.evidences === 0),
    unverifiedEvidences: EVIDENCE_CATALOG.filter((e) => e.status === "PENDIENTE").length,
    history: SCORES_HISTORY.filter((a) => a.scores).map((a) => ({
      id: a.id, period: a.period,
      institution:
        LINES.reduce(
          (acc, l) =>
            acc + Object.values(a.scores![l.n]).reduce((x, d) => x + d.value, 0) / DIMENSIONS.length,
          0,
        ) / LINES.length,
    })),
  };
}

/* ═══ Motor de alertas ═══
   Consolida todas las reglas en una lista tipada y priorizada (§2 completo). */

export type Alert = {
  id: string;
  kind:
    | "FACTOR_RACHA_ROJA"
    | "KPI_CONTRA_META"
    | "KPI_REZAGO_CAPTURA"
    | "PROYECCION_INSUFICIENTE"
    | "DESALINEACION_PRESUPUESTAL"
    | "ACCION_VENCIDA"
    | "CELDA_SIN_EVIDENCIA"
    | "EVIDENCIA_SIN_VERIFICAR"
    | "TAREA_VENCIDA"
    | "TAREA_BLOQUEADA"
    | "ENTREGABLE_SIN_EVIDENCIA"
    | "DEPENDENCIA_VENCIDA";
  severity: 1 | 2 | 3;              // 1 = crítica
  title: string;
  detail: string;
  href: string;
  owner?: string;
};

export function buildAlerts(): Alert[] {
  const alerts: Alert[] = [];

  // tareas del gestor de proyectos (vencidas, bloqueadas, sin evidencia, en cadena)
  for (const ta of taskAlerts()) {
    alerts.push({
      id: ta.id,
      kind: ta.kind,
      severity: ta.severity,
      title: ta.title,
      detail: ta.detail,
      href: "/panel/proyectos",
      owner: ta.ownerName,
    });
  }

  // factores en racha roja
  for (const i of INITIATIVES_FULL) {
    for (const f of i.factors) {
      if (f.state !== "ROJO") continue;
      const streak = [...f.history].reverse().findIndex((h) => h !== "ROJO");
      const len = streak === -1 ? f.history.length : streak;
      if (len >= 2) {
        alerts.push({
          id: `racha-${i.id}-${f.name}`,
          kind: "FACTOR_RACHA_ROJA", severity: 1,
          title: f.name,
          detail: `${len} revisiones seguidas en rojo en «${i.name}». ${f.note ?? ""}`.trim(),
          href: "/panel/iniciativas",
          owner: responsible(i.ownerId).dependencia,
        });
      }
    }
  }

  // KPI en contra y proyección insuficiente
  for (const k of KPI_CATALOG) {
    const h = kpiHealth(k);
    if (!h.improving && h.semaphore !== "OK") {
      alerts.push({
        id: `contra-${k.code}`,
        kind: "KPI_CONTRA_META", severity: h.semaphore === "BAD" ? 1 : 2,
        title: k.name,
        detail: `Último dato (${h.latestPeriod}): ${h.latest} ${k.unit}, en dirección contraria a la meta de ${k.target}.`,
        href: "/panel/kpi",
        owner: responsible(k.ownerId).dependencia,
      });
    }
    if (h.isStale) {
      alerts.push({
        id: `stale-${k.code}`,
        kind: "KPI_REZAGO_CAPTURA", severity: 2,
        title: `${k.name}: dato rezagado`,
        detail: `Periodicidad ${k.frequency.toLowerCase()}; el último dato es de ${h.latestPeriod} (${h.staleBy} meses sobre lo tolerado).`,
        href: "/panel/kpi",
        owner: responsible(k.ownerId).dependencia,
      });
    }
    if (h.improving && !h.projection.willReachTarget && h.semaphore !== "OK") {
      alerts.push({
        id: `proy-${k.code}`,
        kind: "PROYECCION_INSUFICIENTE", severity: 3,
        title: `${k.name}: el ritmo no alcanza`,
        detail: `Mejora, pero al ritmo actual llegaría a ${h.projection.projectedAtTarget} ${k.unit} en dic-2028, frente a una meta de ${k.target}.`,
        href: "/panel/kpi",
        owner: responsible(k.ownerId).dependencia,
      });
    }
  }

  // riesgo de iniciativas (desalineación y acciones vencidas)
  for (const i of INITIATIVES_FULL) {
    const r = initiativeRisk(i);
    for (const d of r.drivers) {
      if (d.text.startsWith("Ejecución presupuestal")) {
        alerts.push({
          id: `budget-${i.id}`,
          kind: "DESALINEACION_PRESUPUESTAL", severity: 2,
          title: i.name,
          detail: d.text + ".",
          href: "/panel/iniciativas",
          owner: responsible(i.ownerId).dependencia,
        });
      }
      if (d.text.includes("trimestre vencido")) {
        alerts.push({
          id: `late-${i.id}`,
          kind: "ACCION_VENCIDA", severity: 2,
          title: i.name,
          detail: d.text + ".",
          href: "/panel/iniciativas",
          owner: responsible(i.ownerId).dependencia,
        });
      }
    }
  }

  // instrumento: celdas sin evidencia y evidencias sin verificar
  const roll = maturityRollup();
  for (const c of roll.cellsWithoutEvidence) {
    const line = LINES.find((l) => l.n === c.line)!;
    const dim = DIMENSIONS.find((d) => d.key === c.dimension)!;
    alerts.push({
      id: `noev-${c.line}-${c.dimension}`,
      kind: "CELDA_SIN_EVIDENCIA", severity: 3,
      title: `${line.code} · ${dim.name} sin evidencia`,
      detail: "La calificación de esta celda no tiene soporte documental cargado.",
      href: "/panel/madurez",
    });
  }
  if (roll.unverifiedEvidences > 0) {
    alerts.push({
      id: "ev-pend",
      kind: "EVIDENCIA_SIN_VERIFICAR", severity: 3,
      title: `${roll.unverifiedEvidences} evidencias pendientes de verificación`,
      detail: "Soportes cargados que aún no han sido validados por el equipo consultor.",
      href: "/panel/madurez",
    });
  }

  return alerts.sort((a, b) => a.severity - b.severity);
}

/* ═══ Resumen ejecutivo (para el panel y /api/td/summary) ═══ */

export function executiveSummary() {
  const roll = maturityRollup();
  const risks = INITIATIVES_FULL.map((i) => ({ i, r: initiativeRisk(i) }));
  const budget = INITIATIVES_FULL.reduce(
    (a, i) => ({
      planned: a.planned + i.budgetPlanned,
      committed: a.committed + i.budgetCommitted,
      executed: a.executed + i.budgetExecuted,
    }),
    { planned: 0, committed: 0, executed: 0 },
  );
  const actions = INITIATIVES_FULL.flatMap((i) => i.actions);
  const alerts = buildAlerts();
  return {
    maturity: roll,
    kpis: KPI_CATALOG.map((k) => ({ code: k.code, name: k.name, health: kpiHealth(k) })),
    initiatives: risks.map(({ i, r }) => ({
      id: i.id, name: i.name, status: i.status, progress: i.progress, risk: r,
    })),
    budget,
    actions: {
      total: actions.length,
      done: actions.filter((a) => a.status === "HECHA").length,
      late: INITIATIVES_FULL.flatMap((i) =>
        i.actions.filter((a) => a.status !== "HECHA" && periodIndex(a.quarter) < DEMO_NOW_INDEX),
      ).length,
    },
    objectives: CMI_OBJECTIVES.map((o) => objectiveHealth(o.id)),
    alerts,
    alertCounts: {
      critical: alerts.filter((a) => a.severity === 1).length,
      warning: alerts.filter((a) => a.severity === 2).length,
      info: alerts.filter((a) => a.severity === 3).length,
    },
  };
}
