// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Motor AlgoritmoT-IES.
// Implementa la metodología del deep-research-report (docs/marco-conceptual
// §1.11): puntuación percepción/evidencia, brecha P−E, niveles 0–100,
// índices por línea misional y dimensión transversal, IIES, AIQ-IES con
// salvaguardas, cobertura de evidencia y priorización compuesta.
// Funciones puras y deterministas, cubiertas por tests.
// ─────────────────────────────────────────────────────────────────────────────

import { VARIABLES, type Variable, type D7 } from "@/data/instrument";
import { INITIATIVES_FULL, type InitiativeFull } from "@/data/cmi";
import { initiativeRisk, objectiveHealth } from "@/lib/logic";

/* ═══ Puntuación por variable ═══ */

/** Percepción normalizada: Likert 1–5 → 0–100. */
export const P = (v: Variable) => ((v.perception - 1) / 4) * 100;

/** Evidencia normalizada: E = 0,25·D + 0,35·I + 0,40·K (cada uno 0–4 → 0–100).
    Mayor peso al resultado: una política sin uso ni medición no crea valor. */
export const E = (v: Variable) =>
  0.25 * (v.evidence.d / 4) * 100 +
  0.35 * (v.evidence.i / 4) * 100 +
  0.40 * (v.evidence.k / 4) * 100;

/** Puntuación verificada del ítem: S = 0,40·P + 0,60·E. */
export const S = (v: Variable) => 0.4 * P(v) + 0.6 * E(v);

/** Brecha percepción−evidencia. |Δ| > 20 es hallazgo de gestión. */
export const gapPE = (v: Variable) => P(v) - E(v);

export type GapReading = "SOBREESTIMACION" | "CONVERGENCIA" | "PRACTICA_INVISIBLE";
export const gapReading = (v: Variable): GapReading => {
  const d = gapPE(v);
  if (d > 20) return "SOBREESTIMACION";
  if (d < -20) return "PRACTICA_INVISIBLE";
  return "CONVERGENCIA";
};

/* ═══ Niveles 0–100 ═══ */

export const IES_LEVELS = [
  { name: "Inicial", min: 0, max: 19, color: "var(--n1)", desc: "Sin dirección común; acciones reactivas; riesgos no gestionados." },
  { name: "Emergente", min: 20, max: 39, color: "var(--n2)", desc: "Intenciones y pilotos; cobertura desigual; beneficios no demostrados." },
  { name: "Gestionado", min: 40, max: 59, color: "var(--n3)", desc: "Políticas y responsables definidos; KPI y revisiones; mejoras fragmentadas." },
  { name: "Integrado", min: 60, max: 79, color: "var(--n4)", desc: "Gobierno articulado con misión; prácticas interoperables; decisiones con datos." },
  { name: "Transformador", min: 80, max: 100, color: "var(--n5)", desc: "Prácticas escaladas y sostenibles; impacto demostrable; aprendizaje continuo." },
] as const;

export const levelOf = (score: number) =>
  IES_LEVELS.find((l) => score <= l.max) ?? IES_LEVELS[IES_LEVELS.length - 1];

/* ═══ Agregaciones ═══ */

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Índice de una línea misional (promedio simple de S en la primera versión;
    pesos por ítem iguales hasta que exista fundamento psicométrico). */
export const lineIndex = (line: number) =>
  mean(VARIABLES.filter((v) => v.line === line).map(S));

/** IIES = 0,30·Formación + 0,25·Investigación + 0,20·Extensión + 0,25·Gestión.
    Las líneas UPC 4.1–4.4 corresponden una a una a las misionales del modelo. */
export const IIES_WEIGHTS: Record<number, number> = { 1: 0.30, 2: 0.25, 3: 0.20, 4: 0.25 };

export const iies = () =>
  [1, 2, 3, 4].reduce((acc, l) => acc + IIES_WEIGHTS[l] * lineIndex(l), 0);

/** Índice por dimensión transversal DT_d, con los mismos pesos misionales. */
export const dimensionIndex = (d7: D7) => {
  const byLine = [1, 2, 3, 4].map((l) => {
    const vars = VARIABLES.filter((v) => v.line === l && v.d7 === d7);
    return vars.length ? { l, s: mean(vars.map(S)) } : null;
  }).filter(Boolean) as { l: number; s: number }[];
  const wSum = byLine.reduce((a, x) => a + IIES_WEIGHTS[x.l], 0) || 1;
  return byLine.reduce((a, x) => a + (IIES_WEIGHTS[x.l] / wSum) * x.s, 0);
};

export const D7_META: Record<D7, { name: string; short: string }> = {
  D1: { name: "Estrategia, gobierno y aseguramiento de la calidad", short: "Estrategia y gobierno" },
  D2: { name: "Cultura, talento y competencias", short: "Talento" },
  D3: { name: "Diseño y gestión de procesos misionales", short: "Procesos" },
  D4: { name: "Datos, analítica y gestión del conocimiento", short: "Datos" },
  D5: { name: "Infraestructura, arquitectura y seguridad", short: "Infraestructura" },
  D6: { name: "Experiencia, inclusión y participación", short: "Experiencia" },
  D7: { name: "Innovación, ecosistemas e impacto", short: "Innovación" },
};

/** Celda de la matriz 4×7 (null si la línea no tiene variables en esa dimensión). */
export const matrixCell = (line: number, d7: D7) => {
  const vars = VARIABLES.filter((v) => v.line === line && v.d7 === d7);
  return vars.length ? { s: mean(vars.map(S)), n: vars.length } : null;
};

/* ═══ Cobertura de evidencia ═══
   Un ítem tiene evidencia suficiente cuando está documentado e implementado
   (D≥2, I≥2) y al menos cuenta ocasionalmente (K≥1). El tablero debe mostrar
   puntaje y cobertura juntos: 80 con cobertura 25 % no es 80 con 95 %. */

export const hasSufficientEvidence = (v: Variable) =>
  v.evidence.d >= 2 && v.evidence.i >= 2 && v.evidence.k >= 1;

export const evidenceCoverage = () =>
  (VARIABLES.filter(hasSufficientEvidence).length / VARIABLES.length) * 100;

/* ═══ Salvaguardas ═══
   El promedio no oculta riesgos críticos: una salvaguarda en FALLA capa el
   AIQ-IES (59 o 39 según la regla del informe). PARCIAL genera alerta. */

export type Safeguard = {
  id: string;
  rule: string;
  status: "CUMPLE" | "PARCIAL" | "FALLA";
  cap: number | null;         // tope de AIQ si FALLA
  note: string;
};

export const SAFEGUARDS: Safeguard[] = [
  {
    id: "SG-1",
    rule: "Inventario de sistemas de IA con responsable institucional",
    status: "FALLA", cap: 59,
    note: "No existe registro de sistemas de IA en uso (herramientas docentes, chatbots de prueba, análisis de datos): nadie sabe cuántos hay ni quién responde por ellos.",
  },
  {
    id: "SG-2",
    rule: "Revisión humana en decisiones académicas o de bienestar de alto impacto",
    status: "CUMPLE", cap: 59,
    note: "No operan decisiones automatizadas de alto impacto; el riesgo aparecerá con la analítica de aprendizaje (AV-DAT-1) y el modelo de abandono (i13).",
  },
  {
    id: "SG-3",
    rule: "Evaluación de privacidad o ética para tratamientos de alto riesgo",
    status: "PARCIAL", cap: 59,
    note: "Existe política de datos personales (Ley 1581), pero no evaluaciones de impacto ex ante para nuevos tratamientos; exigible antes del CRM estudiantil.",
  },
  {
    id: "SG-4",
    rule: "Sin tratamiento irregular conocido de datos personales ni incidentes graves sin gestionar",
    status: "CUMPLE", cap: 39,
    note: "Sin incidentes reportados en la vigencia.",
  },
  {
    id: "SG-5",
    rule: "Integridad académica no gestionada únicamente con detección automatizada",
    status: "CUMPLE", cap: null,
    note: "La integridad se gestiona por reglamento y comités; no se usa detección automatizada como mecanismo único.",
  },
];

/* ═══ AIQ-IES ═══
   Seis componentes con los pesos del informe. Se calculan sobre las variables
   etiquetadas ai:true, mapeadas por contenido. */

export type AiqComponent = {
  key: string; name: string; weight: number; variableIds: string[];
};

export const AIQ_COMPONENTS: AiqComponent[] = [
  { key: "A_G", name: "Gobierno, ética y riesgos", weight: 0.20, variableIds: ["AR-ORG-1", "AR-DAT-1"] },
  { key: "A_T", name: "Datos, infraestructura, privacidad y seguridad", weight: 0.20, variableIds: ["AR-TEC-3", "AV-TEC-4"] },
  { key: "A_C", name: "Talento y competencias de IA", weight: 0.15, variableIds: ["AV-MIS-1"] },
  { key: "A_F", name: "Enseñanza, aprendizaje y evaluación", weight: 0.20, variableIds: ["AV-MIS-4", "AV-DAT-1"] },
  { key: "A_R", name: "Investigación, innovación y creación", weight: 0.15, variableIds: ["IN-TEC-3", "IN-DAT-3"] },
  { key: "A_X", name: "Extensión, proyección social y gestión", weight: 0.10, variableIds: ["EX-TEC-1", "EX-DAT-2", "AR-DAT-3"] },
];

const componentScore = (c: AiqComponent) =>
  mean(VARIABLES.filter((v) => c.variableIds.includes(v.id)).map(S));

export function aiqIES() {
  const components = AIQ_COMPONENTS.map((c) => ({ ...c, score: componentScore(c) }));
  const raw = components.reduce((a, c) => a + c.weight * c.score, 0);

  const failing = SAFEGUARDS.filter((s) => s.status === "FALLA" && s.cap !== null);
  const cap = failing.length ? Math.min(...failing.map((s) => s.cap!)) : 100;
  const capped = Math.min(raw, cap);

  // subíndices del informe: preparación (gobierno, datos/infra, talento)
  // y adopción e impacto (enseñanza, investigación, extensión/gestión)
  const prep = ["A_G", "A_T", "A_C"];
  const prepScore = mean(components.filter((c) => prep.includes(c.key)).map((c) => c.score));
  const adoptScore = mean(components.filter((c) => !prep.includes(c.key)).map((c) => c.score));

  return {
    raw, capped, capApplied: capped < raw, cap: failing.length ? cap : null,
    components,
    preparacion: prepScore,
    adopcion: adoptScore,
    safeguards: SAFEGUARDS,
  };
}

/* ═══ Priorización compuesta de iniciativas ═══
   Prioridad = 0,30·Impacto + 0,20·Urgencia + 0,15·Riesgo + 0,15·Alineación
             + 0,10·Factibilidad + 0,10·Dependencia   (criterios 1–5) */

export type PriorityBreakdown = {
  id: string;
  name: string;
  score: number;             // 1–5 ponderado
  criteria: { key: string; label: string; value: number; weight: number }[];
};

export function priorityOf(i: InitiativeFull): PriorityBreakdown {
  const risk = initiativeRisk(i);
  const riskCrit = Math.min(5, Math.max(1, Math.round(risk.score / 20) + 1));
  const oh = objectiveHealth(i.cmi);
  const align = oh.semaphore === "BAD" ? 5 : oh.semaphore === "WARN" ? 4 : 3;

  const criteria = [
    { key: "impacto", label: "Impacto", value: i.impact, weight: 0.30 },
    { key: "urgencia", label: "Urgencia", value: i.urgency, weight: 0.20 },
    { key: "riesgo", label: "Riesgo", value: riskCrit, weight: 0.15 },
    { key: "alineacion", label: "Alineación", value: align, weight: 0.15 },
    { key: "factibilidad", label: "Factibilidad", value: i.feasibility, weight: 0.10 },
    { key: "dependencia", label: "Dependencia (habilita otras)", value: i.dependency, weight: 0.10 },
  ];
  return {
    id: i.id, name: i.name,
    score: criteria.reduce((a, c) => a + c.weight * c.value, 0),
    criteria,
  };
}

export const priorityRanking = () =>
  INITIATIVES_FULL.map(priorityOf).sort((a, b) => b.score - a.score);

/* ═══ Resumen IES para el tablero ═══ */

export function iesSummary() {
  const lines = [1, 2, 3, 4].map((l) => ({ line: l, index: lineIndex(l) }));
  const dims = (Object.keys(D7_META) as D7[]).map((d) => ({
    d7: d, ...D7_META[d], index: dimensionIndex(d),
  }));
  const gaps = VARIABLES
    .map((v) => ({ id: v.id, name: v.name, p: P(v), e: E(v), delta: gapPE(v), reading: gapReading(v) }))
    .filter((g) => g.reading !== "CONVERGENCIA")
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return {
    iies: iies(),
    level: levelOf(iies()),
    lines,
    dims,
    matrix: [1, 2, 3, 4].map((l) => ({
      line: l,
      cells: (Object.keys(D7_META) as D7[]).map((d) => ({ d7: d, cell: matrixCell(l, d) })),
    })),
    coverage: evidenceCoverage(),
    gaps,
    aiq: aiqIES(),
  };
}
