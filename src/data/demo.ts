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

// line → dimension → { value, target }
export const SCORES: Record<number, Record<string, { value: number; target: number }>> = {
  1: {
    organizacional: { value: 2, target: 4 },
    misional: { value: 3, target: 4 },
    tecnologica: { value: 2, target: 4 },
    datos: { value: 2, target: 3 },
  },
  2: {
    organizacional: { value: 2, target: 3 },
    misional: { value: 2, target: 4 },
    tecnologica: { value: 3, target: 4 },
    datos: { value: 1, target: 3 },
  },
  3: {
    organizacional: { value: 3, target: 4 },
    misional: { value: 2, target: 3 },
    tecnologica: { value: 2, target: 3 },
    datos: { value: 1, target: 3 },
  },
  4: {
    organizacional: { value: 2, target: 4 },
    misional: { value: 1, target: 3 },
    tecnologica: { value: 2, target: 4 },
    datos: { value: 1, target: 3 },
  },
};

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

// Medición anterior (para mostrar avance): ligera variación hacia abajo
export const PREV_SCORES: Record<number, number> = { 1: 2.1, 2: 1.7, 3: 1.9, 4: 1.4 };

export const EVIDENCES = [
  { line: 1, dimension: "misional", title: "Modelo pedagógico institucional 2024", source: "Vicerrectoría Académica" },
  { line: 1, dimension: "tecnologica", title: "Inventario de aulas con LMS activo", source: "División de TI" },
  { line: 2, dimension: "tecnologica", title: "Plataforma de gestión de investigación en uso", source: "Vicerrectoría de Investigación" },
  { line: 2, dimension: "datos", title: "Reporte de CvLAC/GrupLAC desactualizados", source: "Oficina de Investigación" },
  { line: 3, dimension: "organizacional", title: "Portafolio de convenios vigentes", source: "Oficina de Extensión" },
  { line: 4, dimension: "datos", title: "Diagnóstico de calidad de datos SNIES", source: "Planeación" },
];

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

export type KpiDemo = {
  code: string; line: number; name: string; unit: string;
  frequency: string; source: string; owner: string;
  baseline: number; target: number; goodDirection: "up" | "down";
  series: { period: string; value: number }[];
};

export const KPIS: KpiDemo[] = [
  {
    code: "AV-01", line: 1, name: "Cursos con aula virtual activa", unit: "%",
    frequency: "Trimestral", source: "LMS institucional", owner: "Vicerrectoría Académica",
    baseline: 22, target: 60, goodDirection: "up",
    series: [
      { period: "2025-T3", value: 22 }, { period: "2025-T4", value: 26 },
      { period: "2026-T1", value: 32 }, { period: "2026-T2", value: 38 },
    ],
  },
  {
    code: "AV-02", line: 1, name: "Docentes formados en educación digital", unit: "docentes",
    frequency: "Semestral", source: "Registro de formación", owner: "Vicerrectoría Académica",
    baseline: 74, target: 300, goodDirection: "up",
    series: [
      { period: "2025-S1", value: 74 }, { period: "2025-S2", value: 96 },
      { period: "2026-S1", value: 142 },
    ],
  },
  {
    code: "AV-03", line: 1, name: "Deserción en modalidad virtual", unit: "%",
    frequency: "Semestral", source: "SPADIES / Registro", owner: "Bienestar",
    baseline: 18.4, target: 12, goodDirection: "down",
    series: [
      { period: "2025-S1", value: 18.4 }, { period: "2025-S2", value: 17.1 },
      { period: "2026-S1", value: 16.2 },
    ],
  },
  {
    code: "IN-01", line: 2, name: "Producción indexada por profesor", unit: "razón",
    frequency: "Anual", source: "Scopus / WoS", owner: "Vicerrectoría de Investigación",
    baseline: 0.44, target: 0.7, goodDirection: "up",
    series: [
      { period: "2023", value: 0.44 }, { period: "2024", value: 0.46 },
      { period: "2025", value: 0.41 },
    ],
  },
  {
    code: "IN-02", line: 2, name: "Producción en acceso abierto", unit: "%",
    frequency: "Anual", source: "Repositorio institucional", owner: "Biblioteca",
    baseline: 31, target: 55, goodDirection: "up",
    series: [
      { period: "2023", value: 31 }, { period: "2024", value: 34 }, { period: "2025", value: 39 },
    ],
  },
  {
    code: "EX-01", line: 3, name: "Convenios de extensión activos", unit: "convenios",
    frequency: "Trimestral", source: "Oficina de Extensión", owner: "Extensión",
    baseline: 48, target: 80, goodDirection: "up",
    series: [
      { period: "2025-T3", value: 48 }, { period: "2025-T4", value: 52 },
      { period: "2026-T1", value: 55 }, { period: "2026-T2", value: 61 },
    ],
  },
  {
    code: "EX-02", line: 3, name: "Posición Sapiens Research", unit: "puesto",
    frequency: "Anual", source: "Sapiens Research", owner: "Planeación",
    baseline: 78, target: 60, goodDirection: "down",
    series: [
      { period: "2024", value: 78 }, { period: "2025", value: 74 }, { period: "2026", value: 71 },
    ],
  },
  {
    code: "AR-01", line: 4, name: "Procesos críticos documentados", unit: "%",
    frequency: "Trimestral", source: "Planeación", owner: "Planeación",
    baseline: 12, target: 80, goodDirection: "up",
    series: [
      { period: "2025-T3", value: 12 }, { period: "2025-T4", value: 15 },
      { period: "2026-T1", value: 21 }, { period: "2026-T2", value: 27 },
    ],
  },
  {
    code: "AR-02", line: 4, name: "Sistemas integrados por interoperabilidad", unit: "sistemas",
    frequency: "Semestral", source: "División de TI", owner: "División de TI",
    baseline: 2, target: 9, goodDirection: "up",
    series: [
      { period: "2025-S1", value: 2 }, { period: "2025-S2", value: 3 }, { period: "2026-S1", value: 4 },
    ],
  },
  {
    code: "AR-03", line: 4, name: "Datos maestros con dueño asignado", unit: "%",
    frequency: "Trimestral", source: "Gobierno de datos", owner: "Planeación",
    baseline: 0, target: 90, goodDirection: "up",
    series: [
      { period: "2025-T4", value: 0 }, { period: "2026-T1", value: 10 }, { period: "2026-T2", value: 24 },
    ],
  },
];

// ─── Iniciativas ─────────────────────────────────────────────────────────────

export type InitiativeDemo = {
  id: string; line: number; name: string; horizon: "CORTO" | "MEDIANO";
  impact: number; feasibility: number;
  status: "PLANEADA" | "EN_CURSO" | "EN_RIESGO" | "COMPLETADA";
  start: string; end: string; owner: string;
  budgetPlanned: number; budgetCommitted: number; budgetExecuted: number;
  progress: number; capability: string; kpi: string;
  factors: { name: string; state: "VERDE" | "AMBAR" | "ROJO"; history: string[] }[];
};

export const INITIATIVES: InitiativeDemo[] = [
  {
    id: "i1", line: 1, name: "Aula virtual estándar institucional", horizon: "CORTO",
    impact: 5, feasibility: 4, status: "EN_CURSO", start: "2026-T3", end: "2027-T2",
    owner: "Vicerrectoría Académica",
    budgetPlanned: 180_000_000, budgetCommitted: 47_000_000, budgetExecuted: 79_000_000,
    progress: 42, capability: "c1", kpi: "AV-01",
    factors: [
      { name: "Patrocinio de Vicerrectoría Académica", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
      { name: "Modelo pedagógico aprobado", state: "VERDE", history: ["AMBAR", "VERDE", "VERDE"] },
      { name: "Adopción por parte de docentes", state: "AMBAR", history: ["VERDE", "AMBAR", "AMBAR"] },
      { name: "Disponibilidad del equipo de TI", state: "ROJO", history: ["AMBAR", "ROJO", "ROJO"] },
      { name: "Conectividad en sedes", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
    ],
  },
  {
    id: "i2", line: 4, name: "Programa de gobierno de datos", horizon: "CORTO",
    impact: 5, feasibility: 3, status: "EN_CURSO", start: "2026-T3", end: "2027-T1",
    owner: "Planeación",
    budgetPlanned: 95_000_000, budgetCommitted: 17_000_000, budgetExecuted: 21_000_000,
    progress: 25, capability: "c6", kpi: "AR-03",
    factors: [
      { name: "Comité de datos constituido", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
      { name: "Dedicación de los dueños de dato", state: "AMBAR", history: ["AMBAR", "AMBAR", "AMBAR"] },
      { name: "Acceso a sistemas fuente", state: "VERDE", history: ["ROJO", "AMBAR", "VERDE"] },
    ],
  },
  {
    id: "i3", line: 2, name: "Repositorio institucional y ciencia abierta", horizon: "CORTO",
    impact: 4, feasibility: 4, status: "EN_CURSO", start: "2026-T4", end: "2027-T2",
    owner: "Biblioteca",
    budgetPlanned: 62_000_000, budgetCommitted: 15_000_000, budgetExecuted: 44_000_000,
    progress: 71, capability: "c4", kpi: "IN-02",
    factors: [
      { name: "Política de acceso abierto aprobada", state: "VERDE", history: ["AMBAR", "VERDE", "VERDE"] },
      { name: "Digitalización del acervo", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
    ],
  },
  {
    id: "i4", line: 1, name: "Formación docente en educación digital", horizon: "CORTO",
    impact: 4, feasibility: 5, status: "EN_CURSO", start: "2026-T3", end: "2027-T4",
    owner: "Vicerrectoría Académica",
    budgetPlanned: 48_000_000, budgetCommitted: 9_000_000, budgetExecuted: 18_000_000,
    progress: 38, capability: "c1", kpi: "AV-02",
    factors: [
      { name: "Oferta de cursos publicada", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
      { name: "Participación docente", state: "AMBAR", history: ["VERDE", "AMBAR", "AMBAR"] },
    ],
  },
  {
    id: "i5", line: 4, name: "Bus de interoperabilidad institucional", horizon: "MEDIANO",
    impact: 5, feasibility: 2, status: "PLANEADA", start: "2027-T1", end: "2028-T2",
    owner: "División de TI",
    budgetPlanned: 240_000_000, budgetCommitted: 0, budgetExecuted: 0,
    progress: 0, capability: "c7", kpi: "AR-02",
    factors: [
      { name: "Arquitectura de referencia definida", state: "AMBAR", history: ["AMBAR", "AMBAR"] },
      { name: "Presupuesto de vigencia aprobado", state: "ROJO", history: ["ROJO", "ROJO"] },
    ],
  },
  {
    id: "i6", line: 3, name: "Observatorio de rankings e indicadores", horizon: "MEDIANO",
    impact: 3, feasibility: 4, status: "PLANEADA", start: "2027-T2", end: "2027-T4",
    owner: "Planeación",
    budgetPlanned: 55_000_000, budgetCommitted: 0, budgetExecuted: 0,
    progress: 0, capability: "c5", kpi: "EX-02",
    factors: [{ name: "Acceso a fuentes de datos externas", state: "VERDE", history: ["VERDE"] }],
  },
  {
    id: "i7", line: 1, name: "Nuevos programas virtuales para el sur del Cesar", horizon: "MEDIANO",
    impact: 5, feasibility: 3, status: "PLANEADA", start: "2027-T3", end: "2028-T4",
    owner: "Vicerrectoría Académica",
    budgetPlanned: 320_000_000, budgetCommitted: 0, budgetExecuted: 0,
    progress: 0, capability: "c1", kpi: "AV-01",
    factors: [
      { name: "Registros calificados en trámite", state: "AMBAR", history: ["AMBAR"] },
      { name: "Estudio de demanda territorial", state: "VERDE", history: ["VERDE"] },
    ],
  },
];

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
