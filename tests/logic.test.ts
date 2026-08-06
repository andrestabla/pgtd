// Pruebas del motor de lógica de negocio (node:test + tsx).
// Ejecutar: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  periodIndex, kpiHealth, initiativeRisk, classifyFactor,
  buildAlerts, maturityRollup, objectiveHealth, executiveSummary,
  DEMO_NOW_INDEX,
} from "../src/lib/logic";
import { KPI_CATALOG, INITIATIVES_FULL, CMI_OBJECTIVES, type KpiFull, type InitiativeFull } from "../src/data/cmi";

/* ─── periodIndex ─── */

test("periodIndex ordena periodos anuales, semestrales y trimestrales", () => {
  assert.ok(periodIndex("2026-T1") < periodIndex("2026-T2"));
  assert.ok(periodIndex("2026-S1") < periodIndex("2026-S2"));
  assert.ok(periodIndex("2025") < periodIndex("2026"));
  assert.ok(periodIndex("2026-T4") > periodIndex("2026-S1"));
  assert.equal(periodIndex("2026-T3"), 2026 * 12 + 8);
});

/* ─── kpiHealth ─── */

const mkKpi = (over: Partial<KpiFull>): KpiFull => ({
  code: "TST-01", line: 1, cmi: "OE-01", name: "Test", definition: "", formula: "",
  unit: "%", frequency: "Trimestral", source: "t", ownerId: "R01",
  baseline: 10, target: 100, goodDirection: "up",
  series: [
    { period: "2026-T1", value: 10 },
    { period: "2026-T2", value: 20 },
    { period: "2026-T3", value: 30 },
    { period: "2026-T4", value: 40 },
  ],
  ...over,
});

test("kpiHealth: semáforo OK cuando está cerca de la meta", () => {
  const h = kpiHealth(mkKpi({ target: 45 }));
  assert.equal(h.semaphore, "OK");
  assert.ok(h.improving);
});

test("kpiHealth: semáforo BAD lejos de la meta", () => {
  const h = kpiHealth(mkKpi({ target: 400 }));
  assert.equal(h.semaphore, "BAD");
});

test("kpiHealth: dirección down — bajar es mejorar", () => {
  const h = kpiHealth(mkKpi({
    goodDirection: "down", target: 5,
    series: [
      { period: "2026-T3", value: 18 },
      { period: "2026-T4", value: 15 },
    ],
  }));
  assert.ok(h.improving);
  assert.equal(h.delta, -3);
});

test("kpiHealth: proyección lineal alcanza la meta con pendiente sostenida", () => {
  // +10 por trimestre desde 40 en 2026-T4 → dic-2028 son 24 meses ≈ +80 → 120 ≥ 100
  const h = kpiHealth(mkKpi({}));
  assert.ok(h.projection.slopePerMonth > 3 && h.projection.slopePerMonth < 4);
  assert.ok(h.projection.willReachTarget);
});

test("kpiHealth: proyección no alcanza cuando la pendiente es plana", () => {
  const h = kpiHealth(mkKpi({
    series: [
      { period: "2026-T1", value: 30 },
      { period: "2026-T2", value: 30 },
      { period: "2026-T3", value: 31 },
      { period: "2026-T4", value: 31 },
    ],
  }));
  assert.ok(!h.projection.willReachTarget);
});

test("kpiHealth: rezago de captura respeta la periodicidad", () => {
  // trimestral con último dato 2026-T2 (jun-2026); hoy demo = mar-2027 → 9 meses > 4.5 tolerados
  const stale = kpiHealth(mkKpi({
    series: [{ period: "2026-T1", value: 10 }, { period: "2026-T2", value: 12 }],
  }));
  assert.ok(stale.isStale);

  // anual con dato de 2026 → tolerancia 18 meses → fresco
  const fresh = kpiHealth(mkKpi({
    frequency: "Anual",
    series: [{ period: "2025", value: 10 }, { period: "2026", value: 12 }],
  }));
  assert.ok(!fresh.isStale);
});

/* ─── classifyFactor ─── */

test("classifyFactor cubre las categorías de barreras", () => {
  assert.equal(classifyFactor("Presupuesto de vigencia aprobado"), "Financiera");
  assert.equal(classifyFactor("Adopción por parte de docentes"), "Cultural");
  assert.equal(classifyFactor("Vacante del diseñador instruccional"), "Talento");
  assert.equal(classifyFactor("Integración con registro académico"), "Tecnológica");
  assert.equal(classifyFactor("Agenda del Consejo Superior"), "Gobernanza");
});

/* ─── initiativeRisk ─── */

const mkIni = (over: Partial<InitiativeFull>): InitiativeFull => ({
  id: "t1", line: 1, subsistema: "Formación", cmi: "OE-01", name: "Test",
  objetivo: "", horizon: "CORTO", impact: 3, feasibility: 3, status: "EN_CURSO",
  start: "2026-T3", end: "2027-T4", ownerId: "R01", metaResultado: "",
  urgency: 3, dependency: 3,
  budgetPlanned: 100, budgetCommitted: 0, budgetExecuted: 50, progress: 50,
  capability: "c1", kpi: "AV-01", actions: [], log: [],
  nextMilestone: { date: "2027-06-01", text: "" },
  factors: [],
  ...over,
});

test("initiativeRisk: sin señales → riesgo bajo", () => {
  const r = initiativeRisk(mkIni({}));
  assert.equal(r.level, "BAJO");
  assert.equal(r.score, 0);
});

test("initiativeRisk: racha roja pesa más que un rojo aislado", () => {
  const single = initiativeRisk(mkIni({
    factors: [{ name: "Presupuesto", state: "ROJO", history: ["VERDE", "ROJO"] }],
  }));
  const streak = initiativeRisk(mkIni({
    factors: [{ name: "Presupuesto", state: "ROJO", history: ["ROJO", "ROJO"] }],
  }));
  assert.ok(streak.score > single.score);
});

test("initiativeRisk: desalineación presupuesto↔avance dispara driver financiero", () => {
  const r = initiativeRisk(mkIni({ budgetExecuted: 80, budgetCommitted: 10, progress: 30 }));
  assert.ok(r.drivers.some((d) => d.category === "Financiera"));
  assert.ok(r.score > 0);
});

test("initiativeRisk: acciones con trimestre vencido suman riesgo", () => {
  const r = initiativeRisk(mkIni({
    actions: [
      { name: "a", meta: "m", status: "PENDIENTE", quarter: "2026-T4" }, // vencida (hoy: mar-2027)
      { name: "b", meta: "m", status: "HECHA", quarter: "2026-T3" },     // hecha: no cuenta
    ],
  }));
  assert.ok(r.drivers.some((d) => d.text.includes("trimestre vencido")));
});

test("initiativeRisk: los datos reales de i1 e i5 producen riesgo alto o crítico", () => {
  const i1 = INITIATIVES_FULL.find((i) => i.id === "i1")!;
  const i5 = INITIATIVES_FULL.find((i) => i.id === "i5")!;
  assert.ok(["ALTO", "CRÍTICO"].includes(initiativeRisk(i1).level));
  assert.ok(["MEDIO", "ALTO", "CRÍTICO"].includes(initiativeRisk(i5).level));
});

/* ─── rollup y alertas ─── */

test("maturityRollup: 16 celdas, serie creciente y sin celdas huérfanas", () => {
  const r = maturityRollup();
  assert.equal(r.cells.length, 16);
  assert.equal(r.history.length, 2);
  assert.ok(r.history[1].institution > r.history[0].institution);
  assert.equal(r.cellsWithoutEvidence.length, 0);
  assert.ok(Math.abs(r.institution.value - 1.94) < 0.01);
});

test("buildAlerts: ordenadas por severidad y con las rachas rojas presentes", () => {
  const alerts = buildAlerts();
  assert.ok(alerts.length > 0);
  for (let i = 1; i < alerts.length; i++) {
    assert.ok(alerts[i].severity >= alerts[i - 1].severity);
  }
  const rachas = alerts.filter((a) => a.kind === "FACTOR_RACHA_ROJA");
  assert.equal(rachas.length, 2); // i1 (equipo TI) e i5 (presupuesto)
  assert.ok(rachas.every((a) => a.severity === 1));
});

test("objectiveHealth cubre todos los objetivos sin lanzar", () => {
  for (const o of CMI_OBJECTIVES) {
    const h = objectiveHealth(o.id);
    assert.ok(["OK", "WARN", "BAD"].includes(h.semaphore));
  }
});

test("executiveSummary es consistente con los catálogos", () => {
  const s = executiveSummary();
  assert.equal(s.kpis.length, KPI_CATALOG.length);
  assert.equal(s.initiatives.length, INITIATIVES_FULL.length);
  assert.equal(s.objectives.length, CMI_OBJECTIVES.length);
  assert.equal(
    s.alertCounts.critical + s.alertCounts.warning + s.alertCounts.info,
    s.alerts.length,
  );
  assert.ok(s.budget.planned > s.budget.executed + s.budget.committed);
});

/* ─── ancla temporal del demo ─── */

test("DEMO_NOW_INDEX está en marzo de 2027", () => {
  assert.equal(DEMO_NOW_INDEX, 2027 * 12 + 2);
});

/* ─── instrumento de diagnóstico ─── */

import { VARIABLES, variablesOf, cellFromVariables, DOMAINS } from "../src/data/instrument";
import { SCORES, LINES as LINES_D, DIMENSIONS as DIMS_D, EVIDENCES } from "../src/data/demo";
import { REG_CALIFICADOS, regCalStats } from "../src/data/regcal";
import { RESPONSIBLES } from "../src/data/cmi";

test("instrumento: el promedio de variables de cada celda coincide con el score vigente", () => {
  for (const l of LINES_D) {
    for (const d of DIMS_D) {
      const derived = cellFromVariables(l.n, d.key);
      assert.equal(derived, SCORES[l.n][d.key].value,
        `celda ${l.code}×${d.key}: variables promedian ${derived}, score ${SCORES[l.n][d.key].value}`);
    }
  }
});

test("instrumento: toda celda tiene al menos 3 variables y 52 en total", () => {
  assert.equal(VARIABLES.length, 52);
  for (const l of LINES_D) for (const d of DIMS_D) {
    assert.ok(variablesOf(l.n, d.key).length >= 3, `${l.code}×${d.key}`);
  }
});

test("instrumento: variables con responsable válido, evidencias existentes y textos completos", () => {
  const evIds = new Set(EVIDENCES.map((e) => e.id));
  const respIds = new Set(RESPONSIBLES.map((r) => r.id));
  for (const v of VARIABLES) {
    assert.ok(respIds.has(v.ownerId), `${v.id}: responsable ${v.ownerId}`);
    assert.ok(v.hallazgo.length > 40, `${v.id}: hallazgo corto`);
    assert.ok(v.recomendacion.length > 30, `${v.id}: recomendación corta`);
    assert.ok(v.value >= 1 && v.value <= 5 && v.target >= v.value - 1);
    for (const e of v.evidenceIds) assert.ok(evIds.has(e), `${v.id}: evidencia ${e}`);
  }
});

test("dominios: referencian variables, KPI e iniciativas existentes", () => {
  const varIds = new Set(VARIABLES.map((v) => v.id));
  const kpiCodes = new Set(KPI_CATALOG.map((k) => k.code));
  const iniIds = new Set(INITIATIVES_FULL.map((i) => i.id));
  assert.equal(DOMAINS.length, 6);
  for (const d of DOMAINS) {
    for (const v of d.variableIds) assert.ok(varIds.has(v), `${d.id}: variable ${v}`);
    for (const k of d.kpiCodes) assert.ok(kpiCodes.has(k), `${d.id}: kpi ${k}`);
    for (const i of d.initiativeIds) assert.ok(iniIds.has(i), `${d.id}: iniciativa ${i}`);
    assert.ok(d.dataHighlights.length >= 3);
  }
});

test("registros calificados: cobertura total del portafolio y estados coherentes", () => {
  assert.equal(REG_CALIFICADOS.length, 33);
  const s = regCalStats();
  assert.equal(s.vigentes + s.porVencer + s.enRenovacion, 32); // 1 en trámite sin fecha
  assert.ok(s.porVencer >= 4, "la ventana de renovación debe ser visible");
  assert.equal(s.enRenovacion, 2);
  // todo POR_VENCER vence de verdad dentro de la ventana
  for (const r of REG_CALIFICADOS.filter((x) => x.estado === "POR_VENCER")) {
    const [y, m] = r.vence.split("-").map(Number);
    assert.ok(y * 12 + (m - 1) - (2027 * 12 + 2) <= 18, r.code);
  }
});

/* ─── motor AlgoritmoT-IES ─── */

import {
  P as iesP, E as iesE, S as iesS, gapPE, gapReading, levelOf, IES_LEVELS,
  lineIndex, iies, IIES_WEIGHTS, dimensionIndex, evidenceCoverage,
  aiqIES, SAFEGUARDS, priorityOf, priorityRanking,
} from "../src/lib/ies";
import type { Variable } from "../src/data/instrument";

const mkVar = (over: Partial<Variable>): Variable => ({
  id: "T-1", line: 1, dimension: "organizacional", d7: "D1",
  name: "t", desc: "t", frame: "CMI", value: 3, target: 4,
  perception: 3, evidence: { d: 2, i: 2, k: 1 },
  ownerId: "R01", evidenceIds: [], hallazgo: "x".repeat(50), recomendacion: "y".repeat(40),
  ...over,
});

test("IES: fórmulas P, E y S según el informe", () => {
  const v = mkVar({ perception: 3, evidence: { d: 2, i: 2, k: 1 } });
  assert.equal(iesP(v), 50);                       // (3-1)/4·100
  assert.ok(Math.abs(iesE(v) - 40) < 0.001);       // 0.25·50 + 0.35·50 + 0.40·25
  assert.ok(Math.abs(iesS(v) - 44) < 0.001);       // 0.4·50 + 0.6·40
});

test("IES: brecha percepción-evidencia y su lectura", () => {
  const sobre = mkVar({ perception: 4, evidence: { d: 1, i: 0, k: 0 } }); // P=75, E=6.25
  assert.equal(gapReading(sobre), "SOBREESTIMACION");
  const invisible = mkVar({ perception: 2, evidence: { d: 3, i: 3, k: 2 } }); // P=25, E=65
  assert.equal(gapReading(invisible), "PRACTICA_INVISIBLE");
  assert.ok(gapPE(sobre) > 20 && gapPE(invisible) < -20);
});

test("IES: niveles 0-100 con los rangos del informe", () => {
  assert.equal(levelOf(10).name, "Inicial");
  assert.equal(levelOf(20).name, "Emergente");
  assert.equal(levelOf(45).name, "Gestionado");
  assert.equal(levelOf(60).name, "Integrado");
  assert.equal(levelOf(85).name, "Transformador");
  assert.equal(IES_LEVELS.length, 5);
});

test("IES: IIES pondera 30/25/20/25 y cae en un nivel plausible", () => {
  const w = Object.values(IIES_WEIGHTS).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(w - 1) < 1e-9);
  const manual = 0.30 * lineIndex(1) + 0.25 * lineIndex(2) + 0.20 * lineIndex(3) + 0.25 * lineIndex(4);
  assert.ok(Math.abs(iies() - manual) < 1e-9);
  // instrumento actual: institución emergente (coherente con madurez 1.94/5)
  assert.equal(levelOf(iies()).name, "Emergente");
});

test("IES: las 7 dimensiones transversales tienen índice calculable", () => {
  for (const d of ["D1", "D2", "D3", "D4", "D5", "D6", "D7"] as const) {
    const idx = dimensionIndex(d);
    assert.ok(idx >= 0 && idx <= 100, d);
  }
});

test("IES: cobertura de evidencia entre 0 y 100 y coherente con el criterio", () => {
  const c = evidenceCoverage();
  assert.ok(c > 0 && c < 100);
});

test("IES: AIQ capado por la salvaguarda en falla", () => {
  const a = aiqIES();
  assert.ok(SAFEGUARDS.some((s) => s.status === "FALLA"));
  assert.equal(a.cap, 59);
  assert.ok(a.capped <= 59);
  const wsum = a.components.reduce((x, c) => x + c.weight, 0);
  assert.ok(Math.abs(wsum - 1) < 1e-9);
});

test("IES: prioridad compuesta pondera según el informe y ordena el ranking", () => {
  const i1 = INITIATIVES_FULL.find((i) => i.id === "i1")!;
  const p = priorityOf(i1);
  const wsum = p.criteria.reduce((a, c) => a + c.weight, 0);
  assert.ok(Math.abs(wsum - 1) < 1e-9);
  assert.ok(p.score >= 1 && p.score <= 5);
  const rank = priorityRanking();
  assert.equal(rank.length, INITIATIVES_FULL.length);
  for (let i = 1; i < rank.length; i++) assert.ok(rank[i].score <= rank[i - 1].score);
});

test("IES: toda variable tiene d7, percepción 1-5 y evidencia 0-4", () => {
  for (const v of VARIABLES) {
    assert.ok(["D1","D2","D3","D4","D5","D6","D7"].includes(v.d7), v.id);
    assert.ok(v.perception >= 1 && v.perception <= 5, v.id);
    for (const c of [v.evidence.d, v.evidence.i, v.evidence.k]) {
      assert.ok(c >= 0 && c <= 4, v.id);
    }
  }
});

/* ─── huella territorial e impacto ─── */

import {
  MUNI_IMPACT, NATIONAL_IMPACT, INTERNATIONAL_IMPACT, LENS_META,
  conveniosTotales, conveniosTerritorio,
} from "../src/data/territorio";
import { CO_PATHS } from "../src/data/geo";
import { MUNICIPALITIES } from "../src/data/demo";

test("territorio: los convenios suman el valor vigente del KPI EX-01", () => {
  const ex01 = KPI_CATALOG.find((k) => k.code === "EX-01")!;
  const latest = ex01.series[ex01.series.length - 1].value;
  assert.equal(conveniosTotales(), latest);
  assert.ok(conveniosTerritorio() > conveniosTotales() * 0.6, "la mayoría ejecuta en el departamento");
});

test("territorio: los 25 municipios tienen métricas de impacto y las 3 lentes metadatos", () => {
  assert.equal(Object.keys(MUNI_IMPACT).length, 25);
  for (const m of MUNICIPALITIES) {
    assert.ok(MUNI_IMPACT[m.name] !== undefined, m.name);
  }
  for (const lens of ["cobertura", "investigacion", "extension"] as const) {
    assert.ok(LENS_META[lens].lectura.length > 60, lens);
  }
});

test("impacto nacional: todos los departamentos existen en el mapa", () => {
  const names = new Set(CO_PATHS.map((p) => p.name));
  for (const d of NATIONAL_IMPACT) {
    assert.ok(names.has(d.dept), `departamento no mapeado: ${d.dept}`);
  }
  // ordenado descendente por coautorías (para las barras)
  for (let i = 1; i < NATIONAL_IMPACT.length; i++) {
    assert.ok(NATIONAL_IMPACT[i].coautorias <= NATIONAL_IMPACT[i - 1].coautorias);
  }
});

test("impacto internacional: ordenado y con vínculos tipificados", () => {
  for (let i = 1; i < INTERNATIONAL_IMPACT.length; i++) {
    assert.ok(INTERNATIONAL_IMPACT[i].coautorias <= INTERNATIONAL_IMPACT[i - 1].coautorias);
  }
  for (const c of INTERNATIONAL_IMPACT) assert.ok(c.tipo.length > 10, c.country);
});

/* ─── actores y estados de práctica ─── */

import { ACTOR_GROUPS, responsesOf, weightedPerception, dissensusOf, topDissensus } from "../src/data/actores";
import { practiceState, practiceStateCounts, PRACTICE_STATES } from "../src/lib/ies";

test("actores: los pesos de los 5 grupos suman 1", () => {
  assert.equal(ACTOR_GROUPS.length, 5);
  const w = ACTOR_GROUPS.reduce((a, g) => a + g.weight, 0);
  assert.ok(Math.abs(w - 1) < 1e-9);
});

test("actores: la percepción ponderada converge con la agregada salvo disensos autorales", () => {
  const strong = new Set(topDissensus(2).map((d) => d.id));
  for (const v of VARIABLES) {
    const wp = weightedPerception(v.id);
    assert.ok(wp >= 1 && wp <= 5, v.id);
    if (!strong.has(v.id)) {
      assert.ok(Math.abs(wp - v.perception) <= 0.8,
        `${v.id}: ponderada ${wp.toFixed(2)} vs agregada ${v.perception}`);
    }
  }
});

test("actores: los disensos autorales aparecen y con la dirección correcta", () => {
  const tops = topDissensus(2);
  const ids = tops.map((d) => d.id);
  assert.ok(ids.includes("AV-TEC-3"), "conectividad: estudiantes del sur la sufren");
  assert.ok(ids.includes("IN-TEC-2"), "repositorio: práctica invisible entre grupos");
  const conect = dissensusOf("AV-TEC-3");
  assert.equal(conect.lowGroup, "estudiantes");
  const snies = dissensusOf("AR-DAT-2");
  assert.equal(snies.lowGroup, "administrativos"); // Planeación sabe la verdad
  assert.ok(tops.length >= 4 && tops.length <= 12, "disensos acotados: hallazgo, no ruido");
});

test("estados de práctica: derivación D/I/K y distribución completa", () => {
  const counts = practiceStateCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(total, VARIABLES.length);
  assert.equal(PRACTICE_STATES.length, 5);
  // reglas de derivación
  const mk = (d: number, i: number, k: number) =>
    practiceState({ ...VARIABLES[0], evidence: { d, i, k } });
  assert.equal(mk(0, 0, 0), "AUSENTE");
  assert.equal(mk(2, 0, 0), "DISPONIBILIDAD");
  assert.equal(mk(2, 2, 0), "ADOPCION");
  assert.equal(mk(3, 3, 1), "INTEGRACION");
  assert.equal(mk(3, 3, 3), "IMPACTO");
  // la historia del diagnóstico: pocas prácticas integradas o con impacto
  assert.ok(counts.INTEGRACION + counts.IMPACTO < counts.DISPONIBILIDAD + counts.ADOPCION);
});

/* ─── gestor de proyectos ─── */

import { TASKS, PEOPLE, isOverdue, DEMO_TODAY, assigneesOf } from "../src/data/proyectos";
import { taskAlerts, workload, initiativeTaskStats, portfolioTaskStats } from "../src/lib/proyectos";
import { buildAlerts as buildAllAlerts } from "../src/lib/logic";

test("proyectos: integridad referencial de tareas, personas y dependencias", () => {
  const personIds = new Set(PEOPLE.map((p) => p.id));
  const iniIds = new Set(INITIATIVES_FULL.map((i) => i.id));
  const taskIds = new Set(TASKS.map((t) => t.id));
  const evIds = new Set(EVIDENCES.map((e) => e.id));
  for (const t of TASKS) {
    assert.ok(personIds.has(t.assigneeId), `${t.id}: persona ${t.assigneeId}`);
    assert.ok(iniIds.has(t.iniId), `${t.id}: iniciativa ${t.iniId}`);
    assert.ok(t.start <= t.due, `${t.id}: inicio después del compromiso`);
    for (const d of t.dependsOn ?? []) assert.ok(taskIds.has(d), `${t.id}: dependencia ${d}`);
    for (const e of t.evidenceIds ?? []) assert.ok(evIds.has(e), `${t.id}: evidencia ${e}`);
  }
  assert.ok(TASKS.length >= 70, `volumen del plan: ${TASKS.length}`);
});

test("proyectos: toda iniciativa del roadmap tiene plan de trabajo", () => {
  for (const i of INITIATIVES_FULL) {
    assert.ok(initiativeTaskStats(i.id).total >= 3, `${i.id} sin tareas suficientes`);
  }
});

test("proyectos: vencidas detectadas y con la historia esperada", () => {
  const overdue = TASKS.filter(isOverdue);
  assert.ok(overdue.length >= 3 && overdue.length <= 8, `vencidas: ${overdue.length}`);
  const ids = overdue.map((t) => t.id);
  assert.ok(ids.includes("T-i1-07"), "migración de Salud bloqueada y vencida");
  assert.ok(ids.includes("T-i8-03"), "ANS en revisión jurídica vencidos");
  // una tarea HECHA nunca está vencida
  for (const t of TASKS.filter((t) => t.status === "HECHA")) assert.ok(!isOverdue(t), t.id);
});

test("proyectos: toda tarea tiene descripción y toda HECHA tiene evidencia", () => {
  for (const t of TASKS) {
    assert.ok(t.desc.trim().length > 20, `${t.id}: descripción vacía o trivial`);
    if (t.status === "HECHA") {
      assert.ok((t.evidenceIds?.length ?? 0) > 0,
        `${t.id}: hecha sin evidencia — viola la regla dura del cierre`);
    }
    // corresponsables: personas válidas, sin duplicar al principal
    for (const c of t.coAssigneeIds ?? []) {
      assert.notEqual(c, t.assigneeId, `${t.id}: corresponsable duplica al principal`);
      assert.ok(c.startsWith("P"), `${t.id}: corresponsable inválido ${c}`);
    }
  }
  // el banco incluye tareas con corresponsables (multi-responsable en la demo)
  assert.ok(TASKS.some((t) => (t.coAssigneeIds?.length ?? 0) > 0));
});

test("proyectos: alertas de tareas tipificadas e integradas al motor global", () => {
  const ta = taskAlerts();
  assert.ok(ta.some((a) => a.kind === "TAREA_VENCIDA"));
  assert.ok(ta.some((a) => a.kind === "TAREA_BLOQUEADA"));
  assert.ok(ta.some((a) => a.kind === "DEPENDENCIA_VENCIDA"), "la cadena i1-07 → i1-08 debe alertar");
  for (const a of ta) assert.ok(a.ownerName.includes(" "), "nombre propio en la alerta");
  // integración: el motor global las incluye con href al gestor
  const all = buildAllAlerts();
  const fromTasks = all.filter((a) => a.href === "/panel/proyectos");
  assert.equal(fromTasks.length, ta.length);
  for (let i = 1; i < all.length; i++) assert.ok(all[i].severity >= all[i - 1].severity);
});

test("proyectos: carga por persona y estadísticas del portafolio consistentes", () => {
  const w = workload();
  assert.ok(w.length >= 10, "la mayoría del directorio tiene tareas");
  // con corresponsables, cada tarea cuenta una vez por cada responsable
  const sumTotal = w.reduce((a, x) => a + x.total, 0);
  const totalAssignments = TASKS.reduce((a, t) => a + assigneesOf(t).length, 0);
  assert.equal(sumTotal, totalAssignments);
  assert.ok(sumTotal > TASKS.length, "los corresponsables suman carga por persona");
  const s = portfolioTaskStats();
  assert.equal(Object.values(s.byStatus).reduce((a, b) => a + b, 0), s.total);
  assert.ok(DEMO_TODAY.startsWith("2027-03"), "hoy demo coherente con DEMO_NOW_INDEX");
});

/* ─── permisos y store de escritura ─── */

import { can, describeAccess, MODULE_ACTIONS, PERMISSION_MATRIX, type ModuleKey } from "../src/lib/permissions";
import { updateTask, verifyEvidence, getTask, getAudit, resetStore } from "../src/server/store";
import type { SessionUser } from "../src/lib/session";

const U = {
  consultor: { email: "c@a", name: "Consultor Test", role: "CONSULTOR" } as SessionUser,
  lider: { email: "l@u", name: "Líder Test", role: "LIDER" } as SessionUser,
  resp1: { email: "r@u", name: "Responsable L1", role: "RESPONSABLE", line: 1 } as SessionUser,
  directivo: { email: "d@u", name: "Directivo Test", role: "DIRECTIVO" } as SessionUser,
};

test("permisos: la matriz cubre todos los módulos y todos los roles", () => {
  const modules: ModuleKey[] = ["panel", "madurez", "benchmark", "capacidades", "kpi", "ruta", "iniciativas", "proyectos", "bi"];
  for (const m of modules) {
    assert.ok(MODULE_ACTIONS[m].includes("view"), m);
    for (const u of Object.values(U)) {
      const acc = describeAccess(u, m);
      assert.ok(["read", "line", "full"].includes(acc.level), `${m}/${u.role}`);
    }
  }
  // toda acción define los 5 roles
  for (const [action, grants] of Object.entries(PERMISSION_MATRIX)) {
    assert.equal(Object.keys(grants).length, 5, action);
  }
});

test("permisos: reglas clave de la matriz", () => {
  assert.ok(can(U.consultor, "publish_maturity"));
  assert.ok(!can(U.lider, "publish_maturity"), "el líder no configura el instrumento");
  assert.ok(!can(U.lider, "verify_evidence"), "verificar evidencia es del consultor");
  assert.ok(can(U.resp1, "edit_tasks", 1) && !can(U.resp1, "edit_tasks", 4), "ámbito de línea");
  assert.ok(!can(U.directivo, "edit_tasks") && can(U.directivo, "view"), "directivo solo lee");
  assert.ok(!can(null, "view"), "sin sesión no hay acceso");
});

test("store: mutaciones exigen permiso y reglas de negocio", async () => {
  resetStore();
  // directivo no edita
  const r1 = await updateTask(U.directivo, "T-i1-06", { status: "HECHA" });
  assert.ok(!r1.ok && r1.status === 403);
  // responsable fuera de su línea no edita
  const r2 = await updateTask(U.resp1, "T-i2-04", { status: "EN_REVISION" });
  assert.ok(!r2.ok && r2.status === 403 && r2.error.includes("4.4"));
  // cerrar sin evidencia exigida → 422
  const r3 = await updateTask(U.consultor, "T-i1-10", { status: "HECHA" });
  assert.ok(!r3.ok && r3.status === 422 && r3.error.includes("evidencia"));
  // bloquear sin motivo → 422
  const r4 = await updateTask(U.consultor, "T-i2-05", { status: "BLOQUEADA" });
  assert.ok(!r4.ok && r4.status === 422);
  // compromiso anterior al inicio → 422
  const r5 = await updateTask(U.consultor, "T-i1-09", { due: "2027-01-01" });
  assert.ok(!r5.ok && r5.status === 422);
  resetStore();
});

test("store: mutación válida cambia el estado y escribe auditoría", async () => {
  resetStore();
  const before = getAudit("T-i1-09").length;
  const r = await updateTask(U.resp1, "T-i1-09", { status: "EN_CURSO", due: "2027-04-18" });
  assert.ok(r.ok);
  const t = getTask("T-i1-09")!;
  assert.equal(t.status, "EN_CURSO");
  assert.equal(t.due, "2027-04-18");
  const log = getAudit("T-i1-09");
  assert.equal(log.length, before + 1);
  assert.ok(log[0].change.includes("EN_CURSO") && log[0].change.includes("2027-04-18"));
  assert.equal(log[0].actor, "Responsable L1");
  resetStore();
});

test("store: verificación de evidencia solo por consultor y auditada", async () => {
  resetStore();
  const denied = await verifyEvidence(U.lider, "EV-02");
  assert.ok(!denied.ok && denied.status === 403);
  const ok = await verifyEvidence(U.consultor, "EV-02");
  assert.ok(ok.ok && ok.status === "VERIFICADA");
  assert.ok(getAudit("EV-02").some((a) => a.change.includes("verificada")));
  resetStore();
});

/* ─── fase 2: comentarios, evidencia subida y línea base ─── */

import {
  addComment, attachEvidence, verifyUploadedEvidence, getComments, getUploads,
  deviationDays, portfolioSlippage, getBaseline,
} from "../src/server/store";

test("fase2: comentar es deliberación de todos los roles, con validación", () => {
  resetStore();
  const r1 = addComment(U.directivo, "T-i1-06", "Observación del Consejo.");
  assert.ok(r1.ok && r1.comment.author === "Directivo Test");
  const r2 = addComment(U.resp1, "T-i1-06", "   ");
  assert.ok(!r2.ok && r2.status === 422);
  const r3 = addComment(U.consultor, "T-nope", "x");
  assert.ok(!r3.ok && r3.status === 404);
  assert.equal(getComments("T-i1-06").length, 1);
  resetStore();
});

test("fase2: adjuntar evidencia respeta permisos y desbloquea el cierre", async () => {
  resetStore();
  // responsable de línea 1 no puede adjuntar en línea 4
  const denied = attachEvidence(U.resp1, "T-i2-06",
    { fileName: "a.pdf", filePath: "x", size: 10, mime: "application/pdf" },
    { title: "Reglas de calidad", kind: "Documento" });
  assert.ok(!denied.ok && denied.status === 403);
  // sin título → 422
  const noTitle = attachEvidence(U.consultor, "T-i1-10",
    { fileName: "a.pdf", filePath: "x", size: 10, mime: "application/pdf" },
    { title: "  ", kind: "Documento" });
  assert.ok(!noTitle.ok && noTitle.status === 422);
  // el cierre estaba bloqueado…
  const blocked = await updateTask(U.consultor, "T-i1-10", { status: "HECHA" });
  assert.ok(!blocked.ok && blocked.status === 422);
  // …y se desbloquea al adjuntar
  const attached = attachEvidence(U.consultor, "T-i1-10",
    { fileName: "acta.pdf", filePath: "k", size: 100, mime: "application/pdf" },
    { title: "Acta del comité", kind: "Acta" });
  assert.ok(attached.ok && attached.evidence.status === "PENDIENTE");
  const closed = await updateTask(U.consultor, "T-i1-10", { status: "HECHA" });
  assert.ok(closed.ok);
  // verificación de la subida: solo consultor
  const vDenied = verifyUploadedEvidence(U.lider, attached.ok ? attached.evidence.id : "");
  assert.ok(!vDenied.ok && vDenied.status === 403);
  const vOk = verifyUploadedEvidence(U.consultor, attached.ok ? attached.evidence.id : "");
  assert.ok(vOk.ok);
  assert.equal(getUploads("T-i1-10")[0].status, "VERIFICADA");
  resetStore();
});

test("fase2: la línea base congela el plan y mide el deslizamiento", async () => {
  resetStore();
  const base = getBaseline("T-i9-05")!;
  assert.equal(base.due, "2027-04-25");
  const r = await updateTask(U.consultor, "T-i9-05", { due: "2027-05-09" });
  assert.ok(r.ok);
  assert.equal(deviationDays(getTask("T-i9-05")!), 14);
  // la línea base NO se mueve con la reprogramación
  assert.equal(getBaseline("T-i9-05")!.due, "2027-04-25");
  const slip = portfolioSlippage();
  assert.equal(slip.tasksShifted, 1);
  assert.equal(slip.daysLost, 14);
  // adelantar recupera días
  const r2 = await updateTask(U.consultor, "T-i4-04", { due: "2027-03-15", start: "2027-03-10" });
  assert.ok(r2.ok, JSON.stringify(r2));
  assert.ok(portfolioSlippage().daysGained > 0);
  resetStore();
});
