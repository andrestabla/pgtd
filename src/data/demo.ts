// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Datos ilustrativos de la Universidad Popular del Cesar.
// Fuente única: alimenta el modo demo de la UI y el seed de Prisma.
// Los valores son de ejemplo; la primera medición real se produce en Fase 0.
// ─────────────────────────────────────────────────────────────────────────────

export const INSTITUTION = {
  slug: "upc",
  name: "Universidad Popular del Cesar",
  shortName: "UPC",
  city: "Valledupar",
  department: "Cesar",
};

export const LINES = [
  { n: 1, code: "4.1", name: "Academia y Virtualidad", short: "Academia", color: "#0e93b4" },
  { n: 2, code: "4.2", name: "Investigación y CTeI", short: "Investigación", color: "#7c5cd6" },
  { n: 3, code: "4.3", name: "Extensión, Relacionamiento y Rankings", short: "Extensión", color: "#e0913f" },
  { n: 4, code: "4.4", name: "Arquitectura Empresarial y Gobierno Digital", short: "Arquitectura", color: "#3f9d8c" },
] as const;

export const DIMENSIONS = [
  { key: "organizacional", name: "Organizacional" },
  { key: "misional", name: "Misional / pedagógica" },
  { key: "tecnologica", name: "Tecnológica" },
  { key: "datos", name: "Datos e información" },
] as const;

export const LEVELS = [
  { n: 1, name: "Inicial", color: "var(--n1)", desc: "Prácticas informales, dependientes de personas; sin registro sistemático." },
  { n: 2, name: "En desarrollo", color: "var(--n2)", desc: "Documentadas en algunas unidades; herramientas aisladas, sin integración." },
  { n: 3, name: "Definido", color: "var(--n3)", desc: "Procesos institucionalizados; responsables asignados; datos consistentes." },
  { n: 4, name: "Gestionado", color: "var(--n4)", desc: "Procesos medidos con indicadores; decisiones con datos; interoperabilidad." },
  { n: 5, name: "Optimizado", color: "var(--n5)", desc: "Mejora continua sobre evidencia; analítica avanzada; capacidad de referente." },
] as const;

// line → dimension → { value, target } — derivado de la medición publicada vigente
import { currentAssessment, previousAssessment } from "./cmi";
export const SCORES = currentAssessment().scores!;

export const lineScore = (n: number) => {
  const dims = Object.values(SCORES[n]);
  return dims.reduce((a, d) => a + d.value, 0) / dims.length;
};
export const lineTarget = (n: number) => {
  const dims = Object.values(SCORES[n]);
  return dims.reduce((a, d) => a + d.target, 0) / dims.length;
};
export const institutionScore = () =>
  LINES.reduce((a, l) => a + lineScore(l.n), 0) / LINES.length;

// Medición anterior: promedio por línea del corte publicado previo
export const PREV_SCORES: Record<number, number> = Object.fromEntries(
  [1, 2, 3, 4].map((n) => {
    const prev = previousAssessment();
    if (!prev?.scores) return [n, lineScore(n)];
    const dims = Object.values(prev.scores[n]);
    return [n, dims.reduce((acc, d) => acc + d.value, 0) / dims.length];
  }),
);

// Evidencias, KPI e iniciativas: la fuente detallada vive en ./cmi
// (catálogo CMI, responsables, acciones y bitácora). Aquí se adaptan al
// contrato que consumen las páginas.
import {
  KPI_CATALOG, INITIATIVES_FULL, EVIDENCE_CATALOG, responsible,
} from "./cmi";

export const EVIDENCES = EVIDENCE_CATALOG.map((e) => ({
  ...e,
  source: responsible(e.sourceId).dependencia,
}));

// ─── Capacidades y mapa estratégico ─────────────────────────────────────────

export const OBJECTIVES = [
  { id: "ob1", name: "Ampliar cobertura con modalidades flexibles" },
  { id: "ob2", name: "Elevar la visibilidad científica institucional" },
  { id: "ob3", name: "Decisiones basadas en evidencia" },
];

export const CAPABILITIES = [
  { id: "c1", line: 1, objective: "ob1", name: "Diseño instruccional digital", current: 2, target: 4, owner: "Vicerrectoría Académica" },
  { id: "c2", line: 1, objective: "ob1", name: "Analítica de aprendizaje", current: 1, target: 3, owner: "División de TI" },
  { id: "c3", line: 2, objective: "ob2", name: "Gestión de producción CTeI", current: 2, target: 4, owner: "Vicerrectoría de Investigación" },
  { id: "c4", line: 2, objective: "ob2", name: "Visibilidad y ciencia abierta", current: 1, target: 3, owner: "Biblioteca" },
  { id: "c5", line: 3, objective: "ob2", name: "Inteligencia de rankings", current: 1, target: 3, owner: "Planeación" },
  { id: "c6", line: 4, objective: "ob3", name: "Gobierno de datos", current: 1, target: 4, owner: "Planeación" },
  { id: "c7", line: 4, objective: "ob3", name: "Interoperabilidad de sistemas", current: 2, target: 4, owner: "División de TI" },
];

// ─── KPI ─────────────────────────────────────────────────────────────────────

export const KPIS = KPI_CATALOG.map((k) => ({
  ...k,
  owner: responsible(k.ownerId).dependencia,
}));
export type KpiDemo = (typeof KPIS)[number];

// ─── Iniciativas ─────────────────────────────────────────────────────────────

export const INITIATIVES = INITIATIVES_FULL.map((i) => ({
  ...i,
  owner: responsible(i.ownerId).dependencia,
}));
export type InitiativeDemo = (typeof INITIATIVES)[number];

// ─── Territorio · municipios del Cesar ──────────────────────────────────────

export type Muni = {
  name: string; lon: number; lat: number;
  weight: 1 | 2 | 3;               // proxy de matrícula
  coverage: "alta" | "media" | "baja";
  subregion: "Norte" | "Centro" | "Sur";
  label?: { anchor: "start" | "end"; dx: number; dy: number };
};

export const MUNICIPALITIES: Muni[] = [
  { name: "Valledupar", lon: -73.25, lat: 10.46, weight: 3, coverage: "alta", subregion: "Norte", label: { anchor: "end", dx: -19, dy: 2 } },
  { name: "Pueblo Bello", lon: -73.59, lat: 10.42, weight: 1, coverage: "baja", subregion: "Norte", label: { anchor: "end", dx: -10, dy: 14 } },
  { name: "La Paz", lon: -73.17, lat: 10.38, weight: 1, coverage: "media", subregion: "Norte" },
  { name: "Manaure", lon: -73.03, lat: 10.39, weight: 1, coverage: "baja", subregion: "Norte" },
  { name: "San Diego", lon: -73.18, lat: 10.33, weight: 1, coverage: "baja", subregion: "Norte" },
  { name: "Agustín Codazzi", lon: -73.24, lat: 10.03, weight: 2, coverage: "media", subregion: "Norte", label: { anchor: "end", dx: -10, dy: -5 } },
  { name: "El Copey", lon: -73.96, lat: 10.15, weight: 1, coverage: "media", subregion: "Norte", label: { anchor: "start", dx: 10, dy: 3 } },
  { name: "Bosconia", lon: -73.89, lat: 9.97, weight: 2, coverage: "media", subregion: "Centro", label: { anchor: "end", dx: -9, dy: 15 } },
  { name: "Becerril", lon: -73.28, lat: 9.7, weight: 1, coverage: "baja", subregion: "Norte" },
  { name: "El Paso", lon: -73.75, lat: 9.66, weight: 1, coverage: "baja", subregion: "Centro" },
  { name: "La Jagua de Ibirico", lon: -73.33, lat: 9.56, weight: 2, coverage: "media", subregion: "Centro", label: { anchor: "end", dx: -10, dy: 3 } },
  { name: "Astrea", lon: -73.97, lat: 9.5, weight: 1, coverage: "baja", subregion: "Centro" },
  { name: "Chiriguaná", lon: -73.6, lat: 9.36, weight: 1, coverage: "media", subregion: "Centro", label: { anchor: "start", dx: 9, dy: -3 } },
  { name: "Chimichagua", lon: -73.81, lat: 9.26, weight: 1, coverage: "baja", subregion: "Centro", label: { anchor: "end", dx: -9, dy: 3 } },
  { name: "Curumaní", lon: -73.54, lat: 9.2, weight: 2, coverage: "media", subregion: "Centro", label: { anchor: "start", dx: 9, dy: 9 } },
  { name: "Pailitas", lon: -73.62, lat: 8.95, weight: 1, coverage: "baja", subregion: "Centro" },
  { name: "Tamalameque", lon: -73.81, lat: 8.86, weight: 1, coverage: "baja", subregion: "Sur" },
  { name: "Pelaya", lon: -73.67, lat: 8.69, weight: 1, coverage: "baja", subregion: "Sur" },
  { name: "La Gloria", lon: -73.8, lat: 8.62, weight: 1, coverage: "baja", subregion: "Sur" },
  { name: "González", lon: -73.38, lat: 8.39, weight: 1, coverage: "baja", subregion: "Sur" },
  { name: "Gamarra", lon: -73.74, lat: 8.32, weight: 1, coverage: "baja", subregion: "Sur" },
  { name: "Aguachica", lon: -73.61, lat: 8.31, weight: 3, coverage: "alta", subregion: "Sur", label: { anchor: "start", dx: 11, dy: 3 } },
  { name: "Río de Oro", lon: -73.39, lat: 8.29, weight: 1, coverage: "baja", subregion: "Sur" },
  { name: "San Martín", lon: -73.51, lat: 8.0, weight: 1, coverage: "baja", subregion: "Sur" },
  { name: "San Alberto", lon: -73.39, lat: 7.76, weight: 2, coverage: "media", subregion: "Sur", label: { anchor: "start", dx: 9, dy: 3 } },
];

export const SUBREGIONS = [
  {
    name: "Norte",
    reading: "Concentra la matrícula y la sede principal; la virtualización libera capacidad instalada.",
  },
  {
    name: "Centro",
    reading: "Corredor minero-agroindustrial con demanda técnica y tecnológica desatendida.",
  },
  {
    name: "Sur",
    reading: "Mayor distancia a la sede principal: es donde la modalidad virtual e híbrida más aumenta la cobertura.",
  },
] as const;

// Benchmark ilustrativo (pares comparables)
export const BENCHMARK = {
  metric: "Programas con componente virtual",
  nationalAvg: 22,
  peers: [
    { name: "Par A", value: 31 },
    { name: "Par B", value: 26 },
    { name: "UPC", value: 15, self: true },
    { name: "Par C", value: 12 },
    { name: "Par D", value: 9 },
  ],
};

export const QUADRANT = {
  // pertinencia territorial: oferta (x, 0-1) vs demanda (y, 0-1)
  points: [
    { name: "Cesar", x: 0.2, y: 0.78, self: true },
    { name: "Dpto. 2", x: 0.65, y: 0.75 },
    { name: "Dpto. 3", x: 0.8, y: 0.62 },
    { name: "Dpto. 4", x: 0.35, y: 0.3 },
    { name: "Dpto. 5", x: 0.7, y: 0.25 },
    { name: "Dpto. 6", x: 0.25, y: 0.18 },
  ],
};

export const DEMO_USERS = [
  { email: "consultor@algoritmot.com", name: "Equipo Algoritmo T", role: "CONSULTOR", password: "pgtd-demo-2026" },
  { email: "lider@unicesar.edu.co", name: "Líder Institucional", role: "LIDER", password: "pgtd-demo-2026" },
  { email: "academica@unicesar.edu.co", name: "Responsable Academia", role: "RESPONSABLE", line: 1, password: "pgtd-demo-2026" },
  { email: "rectoria@unicesar.edu.co", name: "Rectoría", role: "DIRECTIVO", password: "pgtd-demo-2026" },
] as const;

export const fmtCOP = (v: number) =>
  "$ " + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(v);

export const fmtNum = (v: number, d = 1) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: d }).format(v);
