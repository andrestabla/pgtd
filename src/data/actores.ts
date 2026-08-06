// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Percepción por grupo de actores (AlgoritmoT-IES, deep-research-report).
// El resultado agregado no es un promedio directo de participantes: primero se
// calcula el promedio por grupo y luego se aplican pesos explícitos, para que
// una población numerosa no domine asuntos que corresponden a otros actores.
// Los desacuerdos entre grupos (rango ≥ 2) son hallazgos de gestión.
// Respuestas ilustrativas — se capturan con el instrumento en la Fase 0.
// ─────────────────────────────────────────────────────────────────────────────

import { VARIABLES } from "./instrument";

export type ActorGroup = "directivos" | "docentes" | "administrativos" | "estudiantes" | "aliados";

export const ACTOR_GROUPS: { key: ActorGroup; label: string; weight: number }[] = [
  { key: "directivos", label: "Gobierno y directivos", weight: 0.20 },
  { key: "docentes", label: "Docentes e investigadores", weight: 0.25 },
  { key: "administrativos", label: "Personal profesional y administrativo", weight: 0.20 },
  { key: "estudiantes", label: "Estudiantes", weight: 0.25 },
  { key: "aliados", label: "Egresados y actores externos", weight: 0.10 },
];

// Cada patrón desplaza como máximo un grupo en ±1 (rango ≤ 1): la variación
// normal entre grupos no es hallazgo. El disenso (rango ≥ 2) solo existe
// donde el diagnóstico lo encontró (overrides).
const PATTERNS: Record<string, Partial<Record<ActorGroup, number>>> = {
  plano: {},
  dirLeve: { directivos: 1 },
  docLeve: { docentes: -1 },
  estLeve: { estudiantes: -1 },
  admLeve: { administrativos: 1 },
  aliLeve: { aliados: 1 },
};
const PATTERN_KEYS = Object.keys(PATTERNS);

// Desacuerdos con historia propia (hallazgos del diagnóstico):
const OVERRIDES: Record<string, Partial<Record<ActorGroup, number>>> = {
  // La ruta docente: los directivos la ven consolidada; los docentes viven la carga.
  "AV-MIS-1": { directivos: 4, docentes: 2, administrativos: 3, estudiantes: 3, aliados: 3 },
  // El aula estándar: piloto muy visible arriba, experiencia desigual abajo.
  "AV-MIS-2": { directivos: 5, docentes: 3, administrativos: 4, estudiantes: 3, aliados: 4 },
  // Conectividad en sedes: en Valledupar se percibe bien; quien estudia en el sur, no.
  "AV-TEC-3": { directivos: 3, docentes: 2, administrativos: 3, estudiantes: 1, aliados: 2 },
  // Mesa de ayuda: nadie fuera de Bienestar sabe que existe el piloto.
  "EX-TEC-3": { directivos: 2, docentes: 1, administrativos: 2, estudiantes: 1, aliados: 1 },
  // Canales de atención: los estudiantes los sufren.
  "EX-TEC-1": { directivos: 3, docentes: 3, administrativos: 3, estudiantes: 1, aliados: 2 },
  // Datos SNIES: Planeación (administrativos) sabe la verdad; los directivos no.
  "AR-DAT-2": { directivos: 3, docentes: 2, administrativos: 1, estudiantes: 2, aliados: 2 },
  // Repositorio: biblioteca y aliados lo valoran; la comunidad no lo conoce.
  "IN-TEC-2": { directivos: 2, docentes: 2, administrativos: 4, estudiantes: 1, aliados: 3 },
  // Relacionamiento con egresados: los aliados lo califican peor que la casa.
  "EX-ORG-3": { directivos: 3, docentes: 2, administrativos: 2, estudiantes: 2, aliados: 1 },
};

const clamp = (x: number) => Math.max(1, Math.min(5, x));
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7);

/** Respuesta media del grupo a la variable (Likert 1–5). */
export function groupResponse(varId: string, group: ActorGroup): number {
  const ovr = OVERRIDES[varId];
  if (ovr?.[group] !== undefined) return ovr[group]!;
  const v = VARIABLES.find((x) => x.id === varId)!;
  const pattern = PATTERNS[PATTERN_KEYS[hash(varId) % PATTERN_KEYS.length]];
  return clamp(v.perception + (pattern[group] ?? 0));
}

export const responsesOf = (varId: string): Record<ActorGroup, number> =>
  Object.fromEntries(ACTOR_GROUPS.map((g) => [g.key, groupResponse(varId, g.key)])) as Record<ActorGroup, number>;

/** Percepción ponderada por estrato (la agregación que manda el informe). */
export function weightedPerception(varId: string): number {
  return ACTOR_GROUPS.reduce((a, g) => a + g.weight * groupResponse(varId, g.key), 0);
}

/** Disenso: rango entre el grupo que mejor y peor califica. ≥ 2 es hallazgo. */
export function dissensusOf(varId: string) {
  const r = responsesOf(varId);
  const entries = Object.entries(r) as [ActorGroup, number][];
  const max = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const min = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  return { range: max[1] - min[1], highGroup: max[0], lowGroup: min[0], responses: r };
}

export function topDissensus(minRange = 2) {
  return VARIABLES
    .map((v) => ({ id: v.id, name: v.name, ...dissensusOf(v.id) }))
    .filter((d) => d.range >= minRange)
    .sort((a, b) => b.range - a.range);
}
