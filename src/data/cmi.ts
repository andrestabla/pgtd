// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Modelo de gestión detallado (estructura del modelo de educación
// digital de Algoritmo T, adaptado a la UPC): Cuadro de Mando Integral de
// 5 perspectivas, responsables por cargo, iniciativas con acciones y metas
// de resultado, bitácora de seguimiento y evidencias tipificadas.
// Valores ilustrativos — la información real se produce en las Fases 0 a 4.
// ─────────────────────────────────────────────────────────────────────────────

/* ═══ Directorio de responsables (cargos, no personas) ═══ */

export type Responsible = {
  id: string;
  cargo: string;
  dependencia: string;
  rolPlataforma: "LIDER" | "RESPONSABLE" | "APORTA" | "CONSULTA";
};

export const RESPONSIBLES: Responsible[] = [
  { id: "R01", cargo: "Vicerrector(a) Académico(a)", dependencia: "Vicerrectoría Académica", rolPlataforma: "RESPONSABLE" },
  { id: "R02", cargo: "Vicerrector(a) de Investigación y Extensión", dependencia: "Vicerrectoría de Investigación y Extensión", rolPlataforma: "RESPONSABLE" },
  { id: "R03", cargo: "Jefe de la Oficina Asesora de Planeación", dependencia: "Oficina Asesora de Planeación", rolPlataforma: "LIDER" },
  { id: "R04", cargo: "Jefe de la División de Recursos Tecnológicos", dependencia: "División de Recursos Tecnológicos", rolPlataforma: "RESPONSABLE" },
  { id: "R05", cargo: "Coordinador(a) de Biblioteca", dependencia: "Biblioteca Central", rolPlataforma: "APORTA" },
  { id: "R06", cargo: "Director(a) de Bienestar Universitario", dependencia: "Bienestar Universitario", rolPlataforma: "APORTA" },
  { id: "R07", cargo: "Coordinador(a) de Educación Virtual", dependencia: "Unidad de Educación Digital (por crear)", rolPlataforma: "RESPONSABLE" },
  { id: "R08", cargo: "Jefe de la Oficina de Extensión", dependencia: "Oficina de Extensión y Proyección Social", rolPlataforma: "APORTA" },
  { id: "R09", cargo: "Coordinador(a) de Autoevaluación y Acreditación", dependencia: "Oficina de Autoevaluación", rolPlataforma: "APORTA" },
  { id: "R10", cargo: "Rector(a)", dependencia: "Rectoría", rolPlataforma: "CONSULTA" },
];

export const responsible = (id: string) => RESPONSIBLES.find((r) => r.id === id)!;

/* ═══ Cuadro de Mando Integral · 5 perspectivas ═══ */

export const PERSPECTIVES = [
  { id: "impacto", name: "Impacto", sub: "Social", color: "#1a2d5a", desc: "El efecto de la transformación sobre la región y las funciones misionales." },
  { id: "sostenibilidad", name: "Sostenibilidad", sub: "Económica", color: "#0b6f88", desc: "Recursos y eficiencia administrativa que hacen viable la transformación." },
  { id: "comunidad", name: "Comunidad", sub: "Estudiantes y egresados", color: "#0e93b4", desc: "Éxito estudiantil, reputación y empleabilidad." },
  { id: "procesos", name: "Procesos", sub: "Operación institucional", color: "#3f9d8c", desc: "Calidad académica y eficiencia de las operaciones." },
  { id: "innovacion", name: "Innovación", sub: "Aprendizaje y crecimiento", color: "#a87a14", desc: "Talento, tecnología y capacidad de renovarse." },
] as const;

export type CmiObjective = {
  id: string;          // OE-01…
  perspective: string; // id de perspectiva
  name: string;
  kpis: string[];      // códigos de KPI
  line?: number;       // línea 4.x dominante
};

export const CMI_OBJECTIVES: CmiObjective[] = [
  // Impacto
  { id: "OE-01", perspective: "impacto", name: "Lograr mayor cobertura de la educación superior en el Cesar con educación digital", kpis: ["AV-01", "AV-04"], line: 1 },
  { id: "OE-02", perspective: "impacto", name: "Incrementar y mejorar los procesos y prácticas de investigación con educación digital", kpis: ["IN-01", "IN-02"], line: 2 },
  { id: "OE-03", perspective: "impacto", name: "Promover el emprendimiento y la extensión vía canales digitales", kpis: ["EX-01"], line: 3 },
  // Sostenibilidad
  { id: "OE-04", perspective: "sostenibilidad", name: "Incrementar los ingresos por matrículas en programas apoyados digitalmente", kpis: ["SO-01"], line: 1 },
  { id: "OE-05", perspective: "sostenibilidad", name: "Mejorar el punto de equilibrio del portafolio de programas", kpis: ["SO-02"], line: 4 },
  { id: "OE-06", perspective: "sostenibilidad", name: "Usar palancas digitales en currículos transversales y de alta matricialidad", kpis: ["AV-05"], line: 1 },
  // Comunidad
  { id: "OE-07", perspective: "comunidad", name: "Mejorar el éxito estudiantil", kpis: ["AV-03", "CO-01"], line: 1 },
  { id: "OE-08", perspective: "comunidad", name: "Mejorar la reputación y visibilidad institucional", kpis: ["EX-02", "IN-02"], line: 3 },
  { id: "OE-09", perspective: "comunidad", name: "Mejorar la empleabilidad y el vínculo con egresados", kpis: ["CO-02"], line: 3 },
  // Procesos
  { id: "OE-10", perspective: "procesos", name: "Garantizar la calidad académica en las modalidades digitales", kpis: ["AV-01", "PR-01"], line: 1 },
  { id: "OE-11", perspective: "procesos", name: "Mejorar la eficiencia y la eficacia de las operaciones institucionales", kpis: ["AR-01", "AR-02"], line: 4 },
  { id: "OE-12", perspective: "procesos", name: "Desarrollar una oferta académica robusta y diferenciada con proyección territorial", kpis: ["AV-04", "PR-02"], line: 1 },
  // Innovación
  { id: "OE-13", perspective: "innovacion", name: "Fortalecer el compromiso y desarrollo del talento humano docente", kpis: ["AV-02"], line: 1 },
  { id: "OE-14", perspective: "innovacion", name: "Garantizar el gobierno de los datos institucionales", kpis: ["AR-03"], line: 4 },
  { id: "OE-15", perspective: "innovacion", name: "Apalancar los procesos de enseñanza-aprendizaje con innovación y tecnología", kpis: ["AV-01", "AR-02"], line: 1 },
];

/* ═══ Catálogo de KPI con ficha completa ═══ */

export type KpiFull = {
  code: string;
  line: number;
  cmi: string;               // objetivo OE-xx
  name: string;
  definition: string;        // definición operativa
  formula: string;
  unit: string;
  frequency: "Mensual" | "Trimestral" | "Semestral" | "Anual";
  source: string;            // sistema o dependencia que produce el dato
  ownerId: string;           // responsable del dato (directorio)
  baseline: number;
  target: number;
  goodDirection: "up" | "down";
  series: { period: string; value: number; note?: string }[];
};

export const KPI_CATALOG: KpiFull[] = [
  {
    code: "AV-01", line: 1, cmi: "OE-10",
    name: "Cursos con aula virtual activa",
    definition: "Proporción de cursos del periodo con aula creada en el LMS y actividad docente y estudiantil registrada en las últimas 4 semanas.",
    formula: "(cursos con aula activa / cursos ofertados del periodo) × 100",
    unit: "%", frequency: "Trimestral", source: "LMS institucional", ownerId: "R01",
    baseline: 22, target: 60, goodDirection: "up",
    series: [
      { period: "2025-T1", value: 17 },
      { period: "2025-T2", value: 19 },
      { period: "2025-T3", value: 22, note: "Línea base" },
      { period: "2025-T4", value: 26 },
      { period: "2026-T1", value: 32, note: "Inicio del estándar de aula" },
      { period: "2026-T2", value: 38 },
      { period: "2026-T3", value: 41 },
      { period: "2026-T4", value: 45, note: "Despliegue a 3 facultades" },
    ],
  },
  {
    code: "AV-02", line: 1, cmi: "OE-13",
    name: "Docentes formados en educación digital",
    definition: "Docentes de planta y catedráticos que completaron al menos un curso de la ruta institucional de formación digital (marco INTEF).",
    formula: "conteo acumulado de docentes certificados en la vigencia",
    unit: "docentes", frequency: "Semestral", source: "Registro de formación docente", ownerId: "R01",
    baseline: 74, target: 300, goodDirection: "up",
    series: [
      { period: "2025-S1", value: 74, note: "Línea base" },
      { period: "2025-S2", value: 96 },
      { period: "2026-S1", value: 142, note: "Cohorte ampliada con Fase 4" },
      { period: "2026-S2", value: 178 },
    ],
  },
  {
    code: "AV-03", line: 1, cmi: "OE-07",
    name: "Deserción en modalidad virtual",
    definition: "Tasa de deserción por periodo de los estudiantes matriculados en cursos o programas con componente virtual.",
    formula: "(desertores del periodo / matriculados del periodo) × 100",
    unit: "%", frequency: "Semestral", source: "SPADIES · Registro académico", ownerId: "R06",
    baseline: 18.4, target: 12, goodDirection: "down",
    series: [
      { period: "2025-S1", value: 18.4, note: "Línea base" },
      { period: "2025-S2", value: 17.1 },
      { period: "2026-S1", value: 16.2, note: "Efecto del modelo de servicio" },
      { period: "2026-S2", value: 15.4 },
    ],
  },
  {
    code: "AV-04", line: 1, cmi: "OE-12",
    name: "Programas con componente virtual",
    definition: "Programas del portafolio vigente con al menos 20 % de créditos desarrollados en modalidad virtual o híbrida.",
    formula: "(programas con componente virtual / programas vigentes) × 100",
    unit: "%", frequency: "Semestral", source: "SNIES · Registro académico", ownerId: "R01",
    baseline: 11, target: 40, goodDirection: "up",
    series: [
      { period: "2025-S1", value: 11, note: "Línea base" },
      { period: "2025-S2", value: 12 },
      { period: "2026-S1", value: 15 },
      { period: "2026-S2", value: 17, note: "Dos programas suman componente virtual" },
    ],
  },
  {
    code: "AV-05", line: 1, cmi: "OE-06",
    name: "Cursos transversales digitalizados",
    definition: "Cursos del componente básico institucional (alta matricialidad) con contenido virtualizado y disponibles en plataforma.",
    formula: "conteo de cursos transversales digitalizados",
    unit: "cursos", frequency: "Semestral", source: "Unidad de Educación Digital", ownerId: "R07",
    baseline: 0, target: 12, goodDirection: "up",
    series: [
      { period: "2025-S2", value: 0, note: "Línea base" },
      { period: "2026-S1", value: 3, note: "Primer paquete piloto" },
      { period: "2026-S2", value: 4 },
    ],
  },
  {
    code: "IN-01", line: 2, cmi: "OE-02",
    name: "Producción indexada por profesor",
    definition: "Artículos en revistas indexadas (Scopus/WoS) publicados en la vigencia, normalizados por docente de tiempo completo equivalente.",
    formula: "artículos indexados de la vigencia / docentes TCE",
    unit: "razón", frequency: "Anual", source: "Scopus · WoS · CvLAC", ownerId: "R02",
    baseline: 0.44, target: 0.7, goodDirection: "up",
    series: [
      { period: "2021", value: 0.38 },
      { period: "2022", value: 0.42 },
      { period: "2023", value: 0.44 },
      { period: "2024", value: 0.46 },
      { period: "2025", value: 0.41, note: "Caída por salida de dos investigadores" },
      { period: "2026", value: 0.45, note: "Recuperación con semilleros digitales" },
    ],
  },
  {
    code: "IN-02", line: 2, cmi: "OE-02",
    name: "Producción en acceso abierto",
    definition: "Proporción de la producción académica de la vigencia depositada en el repositorio institucional con licencia abierta.",
    formula: "(productos en acceso abierto / producción total) × 100",
    unit: "%", frequency: "Anual", source: "Repositorio institucional", ownerId: "R05",
    baseline: 31, target: 55, goodDirection: "up",
    series: [
      { period: "2023", value: 31 },
      { period: "2024", value: 34 },
      { period: "2025", value: 39, note: "Política de autoarchivo en trámite" },
      { period: "2026", value: 44, note: "Repositorio en producción" },
    ],
  },
  {
    code: "EX-01", line: 3, cmi: "OE-03",
    name: "Convenios de extensión activos",
    definition: "Convenios de extensión y proyección social con ejecución verificable en la vigencia (actividades o recursos reportados).",
    formula: "conteo de convenios con ejecución en el periodo",
    unit: "convenios", frequency: "Trimestral", source: "Oficina de Extensión", ownerId: "R08",
    baseline: 48, target: 80, goodDirection: "up",
    series: [
      { period: "2025-T3", value: 48 }, { period: "2025-T4", value: 52 },
      { period: "2026-T1", value: 55 }, { period: "2026-T2", value: 61 },
    ],
  },
  {
    code: "EX-02", line: 3, cmi: "OE-08",
    name: "Posición Sapiens Research",
    definition: "Puesto de la UPC en el ranking U-Sapiens de instituciones de educación superior colombianas.",
    formula: "posición publicada en la edición anual",
    unit: "puesto", frequency: "Anual", source: "Sapiens Research", ownerId: "R03",
    baseline: 78, target: 60, goodDirection: "down",
    series: [
      { period: "2024", value: 78 }, { period: "2025", value: 74 },
      { period: "2026", value: 71, note: "Mejora por visibilidad de revistas" },
    ],
  },
  {
    code: "CO-01", line: 3, cmi: "OE-07",
    name: "Satisfacción del estudiante",
    definition: "Índice de satisfacción del estudiante con los servicios académicos y de apoyo (escala 1–100), medido por encuesta institucional.",
    formula: "promedio ponderado de la encuesta semestral",
    unit: "índice", frequency: "Semestral", source: "Bienestar Universitario", ownerId: "R06",
    baseline: 64, target: 80, goodDirection: "up",
    series: [
      { period: "2024-S1", value: 61 }, { period: "2024-S2", value: 63 },
      { period: "2025-S1", value: 64 }, { period: "2025-S2", value: 66 },
      { period: "2026-S1", value: 69 }, { period: "2026-S2", value: 71, note: "Efecto de la mesa de ayuda" },
    ],
  },
  {
    code: "CO-02", line: 3, cmi: "OE-09",
    name: "Tasa de empleabilidad de egresados",
    definition: "Egresados con vinculación laboral formal a los 12 meses del grado, según OLE.",
    formula: "(egresados vinculados a 12 meses / egresados del periodo) × 100",
    unit: "%", frequency: "Anual", source: "Observatorio Laboral (OLE)", ownerId: "R08",
    baseline: 61, target: 72, goodDirection: "up",
    series: [
      { period: "2023", value: 61 }, { period: "2024", value: 62 }, { period: "2025", value: 64 },
      { period: "2026", value: 65 },
    ],
  },
  {
    code: "SO-01", line: 1, cmi: "OE-04",
    name: "Ingresos por matrícula digital",
    definition: "Ingresos de la vigencia por matrículas en programas o cursos con componente virtual, incluida educación continuada.",
    formula: "suma de ingresos por matrícula digital (millones COP)",
    unit: "M COP", frequency: "Semestral", source: "División Financiera", ownerId: "R03",
    baseline: 320, target: 900, goodDirection: "up",
    series: [
      { period: "2025-S1", value: 320 }, { period: "2025-S2", value: 355 },
      { period: "2026-S1", value: 410 },
      { period: "2026-S2", value: 452 },
    ],
  },
  {
    code: "SO-02", line: 4, cmi: "OE-05",
    name: "Programas por debajo del punto de equilibrio",
    definition: "Programas del portafolio cuyo costo unitario de operación supera el ingreso por estudiante (modelo de costos por sede y jornada).",
    formula: "conteo de programas con margen operacional negativo",
    unit: "programas", frequency: "Anual", source: "Modelo de costos institucional", ownerId: "R03",
    baseline: 14, target: 6, goodDirection: "down",
    series: [
      { period: "2024", value: 14, note: "Primera corrida del modelo" },
      { period: "2025", value: 13 },
      { period: "2026", value: 13, note: "Sin cierre de brecha aún" },
    ],
  },
  {
    code: "PR-01", line: 1, cmi: "OE-10",
    name: "Resultados Saber Pro en programas con virtualidad",
    definition: "Promedio institucional en Saber Pro de los programas con componente virtual, frente al promedio nacional.",
    formula: "puntaje promedio (escala 0–300)",
    unit: "puntos", frequency: "Anual", source: "ICFES", ownerId: "R09",
    baseline: 138, target: 150, goodDirection: "up",
    series: [
      { period: "2024", value: 138 }, { period: "2025", value: 141 },
      { period: "2026", value: 143 },
    ],
  },
  {
    code: "PR-02", line: 1, cmi: "OE-12",
    name: "Programas nuevos en construcción",
    definition: "Programas en diseño con documento maestro en elaboración o radicado ante el MEN (Decreto 1330 de 2019).",
    formula: "conteo de programas en pipeline",
    unit: "programas", frequency: "Semestral", source: "Vicerrectoría Académica", ownerId: "R01",
    baseline: 1, target: 5, goodDirection: "up",
    series: [
      { period: "2025-S2", value: 1 }, { period: "2026-S1", value: 2, note: "Maestría virtual priorizada" },
      { period: "2026-S2", value: 3 },
    ],
  },
  {
    code: "AR-01", line: 4, cmi: "OE-11",
    name: "Procesos críticos documentados",
    definition: "Procesos del mapa institucional clasificados como críticos con caracterización vigente en el sistema de gestión de calidad.",
    formula: "(procesos críticos documentados / procesos críticos identificados) × 100",
    unit: "%", frequency: "Trimestral", source: "Sistema de gestión de calidad", ownerId: "R03",
    baseline: 12, target: 80, goodDirection: "up",
    series: [
      { period: "2025-T3", value: 12 }, { period: "2025-T4", value: 15 },
      { period: "2026-T1", value: 21 }, { period: "2026-T2", value: 27 },
    ],
  },
  {
    code: "AR-02", line: 4, cmi: "OE-11",
    name: "Sistemas integrados por interoperabilidad",
    definition: "Sistemas de información institucionales que intercambian datos mediante servicios (no por archivos planos ni redigitación).",
    formula: "conteo de sistemas con al menos una integración por servicios",
    unit: "sistemas", frequency: "Semestral", source: "División de Recursos Tecnológicos", ownerId: "R04",
    baseline: 2, target: 9, goodDirection: "up",
    series: [
      { period: "2025-S1", value: 2 }, { period: "2025-S2", value: 3 },
      { period: "2026-S1", value: 4, note: "LMS ↔ registro académico" },
      { period: "2026-S2", value: 5 },
    ],
  },
  {
    code: "AR-03", line: 4, cmi: "OE-14",
    name: "Datos maestros con dueño asignado",
    definition: "Entidades de datos maestros (estudiante, docente, programa, curso…) con dueño de dato formalmente designado y acta de responsabilidad.",
    formula: "(entidades con dueño / entidades del catálogo) × 100",
    unit: "%", frequency: "Trimestral", source: "Programa de gobierno de datos", ownerId: "R03",
    baseline: 0, target: 90, goodDirection: "up",
    series: [
      { period: "2025-T4", value: 0, note: "Catálogo definido" },
      { period: "2026-T1", value: 10 },
      { period: "2026-T2", value: 24, note: "Comité de datos operando" },
      { period: "2026-T3", value: 33 },
      { period: "2026-T4", value: 43, note: "9 de 21 entidades con dueño" },
    ],
  },
];

/* ═══ Evidencias tipificadas ═══ */

export type EvidenceFull = {
  id: string;
  line: number;
  dimension: string;
  title: string;
  kind: "Documento" | "Acta" | "Normativa" | "Informe" | "Sistema" | "Encuesta";
  date: string;              // ISO
  status: "VERIFICADA" | "PENDIENTE";
  sourceId: string;          // responsable que la aporta
  note?: string;
};

export const EVIDENCE_CATALOG: EvidenceFull[] = [
  { id: "EV-01", line: 1, dimension: "misional", title: "Modelo pedagógico institucional 2024", kind: "Documento", date: "2026-08-05", status: "VERIFICADA", sourceId: "R01", note: "Versión aprobada por Consejo Académico." },
  { id: "EV-02", line: 1, dimension: "misional", title: "Lineamientos curriculares para modalidad virtual (borrador)", kind: "Documento", date: "2026-08-12", status: "PENDIENTE", sourceId: "R01", note: "En revisión de comités curriculares." },
  { id: "EV-03", line: 1, dimension: "tecnologica", title: "Inventario de aulas con LMS activo 2026-1", kind: "Sistema", date: "2026-08-08", status: "VERIFICADA", sourceId: "R04", note: "Exportado del LMS institucional." },
  { id: "EV-04", line: 1, dimension: "organizacional", title: "Acuerdo de creación de la línea de virtualidad", kind: "Normativa", date: "2026-08-15", status: "PENDIENTE", sourceId: "R01", note: "Pendiente sanción del Consejo Superior." },
  { id: "EV-05", line: 1, dimension: "datos", title: "Reporte de completitud de registro académico", kind: "Informe", date: "2026-08-10", status: "VERIFICADA", sourceId: "R03" },
  { id: "EV-06", line: 2, dimension: "tecnologica", title: "Plataforma de gestión de investigación en uso", kind: "Sistema", date: "2026-08-06", status: "VERIFICADA", sourceId: "R02" },
  { id: "EV-07", line: 2, dimension: "datos", title: "Reporte de CvLAC/GrupLAC desactualizados", kind: "Informe", date: "2026-08-09", status: "VERIFICADA", sourceId: "R02", note: "43 % de hojas de vida sin actualizar." },
  { id: "EV-08", line: 2, dimension: "organizacional", title: "Acta del comité de investigaciones · priorización CTeI", kind: "Acta", date: "2026-08-11", status: "VERIFICADA", sourceId: "R02" },
  { id: "EV-09", line: 3, dimension: "organizacional", title: "Portafolio de convenios vigentes 2026", kind: "Documento", date: "2026-08-07", status: "VERIFICADA", sourceId: "R08" },
  { id: "EV-10", line: 3, dimension: "datos", title: "Base de egresados: diagnóstico de calidad", kind: "Informe", date: "2026-08-14", status: "PENDIENTE", sourceId: "R08", note: "Cobertura de contacto del 38 %." },
  { id: "EV-11", line: 3, dimension: "misional", title: "Encuesta de satisfacción estudiantil 2026-1", kind: "Encuesta", date: "2026-08-05", status: "VERIFICADA", sourceId: "R06" },
  { id: "EV-12", line: 4, dimension: "datos", title: "Diagnóstico de calidad de datos SNIES", kind: "Informe", date: "2026-08-08", status: "VERIFICADA", sourceId: "R03", note: "12 inconsistencias críticas identificadas." },
  { id: "EV-13", line: 4, dimension: "tecnologica", title: "Inventario de sistemas de información y sus integraciones", kind: "Sistema", date: "2026-08-12", status: "VERIFICADA", sourceId: "R04" },
  { id: "EV-14", line: 4, dimension: "organizacional", title: "Acta de constitución del comité de gobierno de datos", kind: "Acta", date: "2026-08-13", status: "VERIFICADA", sourceId: "R03" },
  { id: "EV-15", line: 4, dimension: "misional", title: "Mapa de procesos institucional (versión vigente)", kind: "Documento", date: "2026-08-06", status: "VERIFICADA", sourceId: "R03", note: "Sin caracterización de procesos de virtualidad." },
  { id: "EV-16", line: 1, dimension: "organizacional", title: "Resolución de creación del comité de virtualidad", kind: "Normativa", date: "2026-09-02", status: "VERIFICADA", sourceId: "R01" },
  { id: "EV-17", line: 1, dimension: "misional", title: "Plantilla institucional de aula virtual (Acta 014)", kind: "Acta", date: "2026-09-12", status: "VERIFICADA", sourceId: "R01" },
  { id: "EV-18", line: 1, dimension: "tecnologica", title: "Reporte de disponibilidad del LMS 2026", kind: "Sistema", date: "2026-10-01", status: "VERIFICADA", sourceId: "R04", note: "99,1 % de disponibilidad semestral." },
  { id: "EV-19", line: 1, dimension: "datos", title: "Tablero de actividad de aulas (corte piloto)", kind: "Sistema", date: "2026-11-03", status: "VERIFICADA", sourceId: "R07" },
  { id: "EV-20", line: 1, dimension: "misional", title: "Ruta de formación docente por niveles (marco INTEF)", kind: "Documento", date: "2026-10-05", status: "VERIFICADA", sourceId: "R01" },
  { id: "EV-21", line: 2, dimension: "misional", title: "Política de acceso abierto (borrador para Consejo)", kind: "Documento", date: "2027-01-20", status: "PENDIENTE", sourceId: "R05" },
  { id: "EV-22", line: 2, dimension: "tecnologica", title: "Repositorio DSpace en producción", kind: "Sistema", date: "2026-11-28", status: "VERIFICADA", sourceId: "R05" },
  { id: "EV-23", line: 2, dimension: "datos", title: "Validación de metadatos del acervo migrado", kind: "Informe", date: "2027-01-30", status: "VERIFICADA", sourceId: "R05", note: "92 % de registros válidos." },
  { id: "EV-24", line: 2, dimension: "organizacional", title: "Líneas de investigación en educación digital aprobadas", kind: "Acta", date: "2026-12-15", status: "VERIFICADA", sourceId: "R02" },
  { id: "EV-25", line: 3, dimension: "misional", title: "Mapa de experiencia del estudiante virtual", kind: "Documento", date: "2026-12-10", status: "VERIFICADA", sourceId: "R06" },
  { id: "EV-26", line: 3, dimension: "tecnologica", title: "Piloto de mesa de ayuda: reporte de tickets", kind: "Sistema", date: "2027-02-01", status: "VERIFICADA", sourceId: "R06", note: "120 tickets, TMR 9 h." },
  { id: "EV-27", line: 3, dimension: "datos", title: "Matriz indicador ↔ fuente para rankings", kind: "Documento", date: "2027-02-12", status: "PENDIENTE", sourceId: "R03" },
  { id: "EV-28", line: 3, dimension: "organizacional", title: "Convenio marco con alcaldía de Aguachica", kind: "Documento", date: "2026-10-18", status: "VERIFICADA", sourceId: "R08" },
  { id: "EV-29", line: 4, dimension: "organizacional", title: "Catálogo de datos maestros (21 entidades)", kind: "Documento", date: "2026-10-20", status: "VERIFICADA", sourceId: "R03" },
  { id: "EV-30", line: 4, dimension: "tecnologica", title: "Integración LMS ↔ registro académico en pruebas", kind: "Sistema", date: "2027-01-25", status: "PENDIENTE", sourceId: "R04" },
  { id: "EV-31", line: 4, dimension: "datos", title: "Actas de designación de dueños de dato (9)", kind: "Acta", date: "2027-02-08", status: "VERIFICADA", sourceId: "R03" },
  { id: "EV-32", line: 4, dimension: "misional", title: "Caracterización de 8 procesos de virtualidad", kind: "Documento", date: "2027-01-12", status: "PENDIENTE", sourceId: "R03", note: "En revisión del sistema de calidad." },
];

/* ═══ Iniciativas con acciones, metas de resultado y bitácora ═══ */

export type ActionStatus = "HECHA" | "EN_CURSO" | "PENDIENTE";

export type InitiativeFull = {
  id: string;
  line: number;
  subsistema: "Administrativo" | "Formación" | "Investigación" | "Proyección social" | "Bienestar";
  cmi: string;                 // objetivo OE-xx
  name: string;
  objetivo: string;            // objetivo de la iniciativa
  horizon: "CORTO" | "MEDIANO";
  impact: number; feasibility: number;
  status: "PLANEADA" | "EN_CURSO" | "EN_RIESGO" | "COMPLETADA";
  start: string; end: string;
  ownerId: string;
  metaResultado: string;       // meta de resultado global
  budgetPlanned: number; budgetCommitted: number; budgetExecuted: number;
  progress: number;
  capability: string; kpi: string;
  actions: { name: string; meta: string; status: ActionStatus; quarter: string }[];
  log: { date: string; type: "HITO" | "ALERTA" | "NOTA"; text: string }[];
  nextMilestone: { date: string; text: string };
  factors: { name: string; state: "VERDE" | "AMBAR" | "ROJO"; history: string[]; note?: string }[];
};

export const INITIATIVES_FULL: InitiativeFull[] = [
  {
    id: "i1", line: 1, subsistema: "Formación", cmi: "OE-10",
    name: "Aula virtual estándar institucional",
    objetivo: "Estandarizar la experiencia del aula virtual en todos los cursos con componente digital, con plantilla institucional, criterios de calidad y seguimiento de actividad.",
    horizon: "CORTO", impact: 5, feasibility: 4, status: "EN_CURSO",
    start: "2026-T3", end: "2027-T2", ownerId: "R01",
    metaResultado: "El 60 % de los cursos del periodo opera sobre el aula virtual estándar con actividad verificable.",
    budgetPlanned: 180_000_000, budgetCommitted: 47_000_000, budgetExecuted: 79_000_000,
    progress: 42, capability: "c1", kpi: "AV-01",
    actions: [
      { name: "Definir la plantilla institucional de aula con criterios de calidad", meta: "1 plantilla aprobada por Consejo Académico", status: "HECHA", quarter: "2026-T3" },
      { name: "Pilotear la plantilla en los cursos del componente básico", meta: "8 cursos piloto operando", status: "HECHA", quarter: "2026-T4" },
      { name: "Formar a los docentes de los cursos de alta matricialidad", meta: "120 docentes formados en el estándar", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Desplegar el estándar a todas las facultades", meta: "60 % de cursos sobre el estándar", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Tablero de actividad de aulas para decanaturas", meta: "1 tablero operando con corte semanal", status: "PENDIENTE", quarter: "2027-T2" },
    ],
    log: [
      { date: "2026-09-12", type: "HITO", text: "Plantilla institucional aprobada por Consejo Académico (Acta 014)." },
      { date: "2026-11-03", type: "HITO", text: "Piloto cerrado: 8 cursos, 612 estudiantes, satisfacción 4,2/5." },
      { date: "2027-02-10", type: "ALERTA", text: "TI redujo dedicación al despliegue; factor en rojo por segunda revisión." },
      { date: "2027-02-24", type: "NOTA", text: "Vicerrectoría negocia bolsa de horas con la División de Recursos Tecnológicos." },
    ],
    nextMilestone: { date: "2027-03-15", text: "Comité de seguimiento: plan de recuperación del despliegue con TI." },
    factors: [
      { name: "Patrocinio de Vicerrectoría Académica", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
      { name: "Modelo pedagógico aprobado", state: "VERDE", history: ["AMBAR", "VERDE", "VERDE"] },
      { name: "Adopción por parte de docentes", state: "AMBAR", history: ["VERDE", "AMBAR", "AMBAR"], note: "Facultades de Salud e Ingeniería por debajo del 30 % de adopción." },
      { name: "Disponibilidad del equipo de TI", state: "ROJO", history: ["AMBAR", "ROJO", "ROJO"], note: "2 revisiones seguidas en rojo → escalado a comité." },
      { name: "Conectividad en sedes", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
    ],
  },
  {
    id: "i2", line: 4, subsistema: "Administrativo", cmi: "OE-14",
    name: "Programa de gobierno de datos",
    objetivo: "Constituir el gobierno de datos institucional: comité, catálogo de datos maestros, dueños de dato y reglas de calidad sobre los sistemas fuente.",
    horizon: "CORTO", impact: 5, feasibility: 3, status: "EN_CURSO",
    start: "2026-T3", end: "2027-T1", ownerId: "R03",
    metaResultado: "El 90 % de las entidades maestras tiene dueño designado y reglas de calidad en operación.",
    budgetPlanned: 95_000_000, budgetCommitted: 17_000_000, budgetExecuted: 21_000_000,
    progress: 25, capability: "c6", kpi: "AR-03",
    actions: [
      { name: "Constituir el comité de gobierno de datos", meta: "1 comité con acta de constitución y reglamento", status: "HECHA", quarter: "2026-T3" },
      { name: "Levantar el catálogo de datos maestros", meta: "1 catálogo con 21 entidades priorizadas", status: "HECHA", quarter: "2026-T4" },
      { name: "Designar dueños de dato con acta de responsabilidad", meta: "90 % de entidades con dueño", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Definir reglas de calidad para SNIES y registro académico", meta: "Reglas activas en los 2 sistemas críticos", status: "PENDIENTE", quarter: "2027-T1" },
    ],
    log: [
      { date: "2026-08-13", type: "HITO", text: "Comité de datos constituido (Acta 001) con delegados de 6 dependencias." },
      { date: "2026-10-20", type: "HITO", text: "Catálogo de datos maestros aprobado: 21 entidades." },
      { date: "2027-01-15", type: "ALERTA", text: "Dueños de dato designados avanzan lento: 24 % contra 50 % esperado." },
    ],
    nextMilestone: { date: "2027-02-28", text: "Corte de designación de dueños: meta 50 % de entidades." },
    factors: [
      { name: "Comité de datos constituido", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
      { name: "Dedicación de los dueños de dato", state: "AMBAR", history: ["AMBAR", "AMBAR", "AMBAR"], note: "Los dueños no tienen descarga horaria asignada." },
      { name: "Acceso a sistemas fuente", state: "VERDE", history: ["ROJO", "AMBAR", "VERDE"] },
    ],
  },
  {
    id: "i3", line: 2, subsistema: "Investigación", cmi: "OE-02",
    name: "Repositorio institucional y ciencia abierta",
    objetivo: "Poner en operación el repositorio institucional con política de autoarchivo, y elevar la proporción de producción en acceso abierto.",
    horizon: "CORTO", impact: 4, feasibility: 4, status: "EN_CURSO",
    start: "2026-T4", end: "2027-T2", ownerId: "R05",
    metaResultado: "55 % de la producción de la vigencia depositada en acceso abierto.",
    budgetPlanned: 62_000_000, budgetCommitted: 15_000_000, budgetExecuted: 44_000_000,
    progress: 71, capability: "c4", kpi: "IN-02",
    actions: [
      { name: "Instalar y parametrizar el repositorio (DSpace)", meta: "1 repositorio en producción", status: "HECHA", quarter: "2026-T4" },
      { name: "Migrar el acervo digital existente", meta: "3.800 objetos migrados con metadatos", status: "HECHA", quarter: "2027-T1" },
      { name: "Aprobar la política de acceso abierto y autoarchivo", meta: "1 acuerdo del Consejo Académico", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Integrar el repositorio con CvLAC y Google Scholar", meta: "Cosecha OAI-PMH activa", status: "PENDIENTE", quarter: "2027-T2" },
    ],
    log: [
      { date: "2026-11-28", type: "HITO", text: "Repositorio en producción con el acervo de tesis migrado." },
      { date: "2027-01-30", type: "HITO", text: "3.800 objetos migrados; validación de metadatos al 92 %." },
    ],
    nextMilestone: { date: "2027-03-10", text: "Presentación de la política de acceso abierto al Consejo Académico." },
    factors: [
      { name: "Política de acceso abierto aprobada", state: "VERDE", history: ["AMBAR", "VERDE", "VERDE"] },
      { name: "Digitalización del acervo", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
    ],
  },
  {
    id: "i4", line: 1, subsistema: "Formación", cmi: "OE-13",
    name: "Ruta de formación docente en educación digital",
    objetivo: "Desplegar la ruta institucional de formación docente por niveles (según el marco INTEF), con certificación y reconocimiento en la carrera docente.",
    horizon: "CORTO", impact: 4, feasibility: 5, status: "EN_CURSO",
    start: "2026-T3", end: "2027-T4", ownerId: "R01",
    metaResultado: "300 docentes certificados en al menos un nivel de la ruta.",
    budgetPlanned: 48_000_000, budgetCommitted: 9_000_000, budgetExecuted: 18_000_000,
    progress: 38, capability: "c1", kpi: "AV-02",
    actions: [
      { name: "Diseñar la ruta por niveles con el marco INTEF", meta: "1 ruta con 3 niveles y rúbricas", status: "HECHA", quarter: "2026-T3" },
      { name: "Abrir la primera cohorte (nivel básico)", meta: "80 docentes inscritos", status: "HECHA", quarter: "2026-T4" },
      { name: "Certificar la primera cohorte", meta: "60 docentes certificados", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Gestionar el reconocimiento en la carrera docente", meta: "1 acuerdo de reconocimiento", status: "PENDIENTE", quarter: "2027-T3" },
    ],
    log: [
      { date: "2026-10-05", type: "HITO", text: "Ruta aprobada; primera cohorte con 84 inscritos (105 % de la meta)." },
      { date: "2027-01-22", type: "NOTA", text: "Participación semanal cae al 61 %; se activa acompañamiento por facultad." },
    ],
    nextMilestone: { date: "2027-03-20", text: "Cierre de la primera cohorte y examen de certificación." },
    factors: [
      { name: "Oferta de cursos publicada", state: "VERDE", history: ["VERDE", "VERDE", "VERDE"] },
      { name: "Participación docente", state: "AMBAR", history: ["VERDE", "AMBAR", "AMBAR"], note: "Caída de participación en semanas de parciales." },
    ],
  },
  {
    id: "i5", line: 4, subsistema: "Administrativo", cmi: "OE-11",
    name: "Bus de interoperabilidad institucional",
    objetivo: "Integrar los sistemas de información críticos (registro académico, LMS, financiero, investigación) mediante servicios, eliminando redigitación.",
    horizon: "MEDIANO", impact: 5, feasibility: 2, status: "PLANEADA",
    start: "2027-T1", end: "2028-T2", ownerId: "R04",
    metaResultado: "9 sistemas intercambiando datos por servicios; cero redigitación en matrícula.",
    budgetPlanned: 240_000_000, budgetCommitted: 0, budgetExecuted: 0,
    progress: 0, capability: "c7", kpi: "AR-02",
    actions: [
      { name: "Definir la arquitectura de referencia de integración", meta: "1 documento de arquitectura aprobado", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Contratar la plataforma de integración", meta: "1 contrato adjudicado", status: "PENDIENTE", quarter: "2027-T2" },
      { name: "Integrar registro académico ↔ LMS", meta: "Matrícula sincronizada sin redigitación", status: "PENDIENTE", quarter: "2027-T4" },
      { name: "Integrar financiero e investigación", meta: "4 sistemas adicionales integrados", status: "PENDIENTE", quarter: "2028-T2" },
    ],
    log: [
      { date: "2027-01-10", type: "NOTA", text: "Arquitectura de referencia en borrador; revisión con el comité TIC." },
      { date: "2027-02-05", type: "ALERTA", text: "El presupuesto de la vigencia no incluyó la plataforma de integración." },
    ],
    nextMilestone: { date: "2027-04-01", text: "Decisión de vigencias futuras para la contratación de la plataforma." },
    factors: [
      { name: "Arquitectura de referencia definida", state: "AMBAR", history: ["AMBAR", "AMBAR"] },
      { name: "Presupuesto de vigencia aprobado", state: "ROJO", history: ["ROJO", "ROJO"], note: "Sin partida en la vigencia actual; se tramitan vigencias futuras." },
    ],
  },
  {
    id: "i6", line: 3, subsistema: "Proyección social", cmi: "OE-08",
    name: "Observatorio de rankings e indicadores",
    objetivo: "Sistematizar la línea base y el seguimiento de los indicadores que alimentan Sapiens, Scimago, THE Impact y QS, con responsables por indicador.",
    horizon: "MEDIANO", impact: 3, feasibility: 4, status: "PLANEADA",
    start: "2027-T2", end: "2027-T4", ownerId: "R03",
    metaResultado: "1 tablero de rankings operando con corte trimestral y responsables asignados.",
    budgetPlanned: 55_000_000, budgetCommitted: 0, budgetExecuted: 0,
    progress: 0, capability: "c5", kpi: "EX-02",
    actions: [
      { name: "Mapear los indicadores de cada ranking a fuentes internas", meta: "1 matriz indicador ↔ fuente ↔ responsable", status: "PENDIENTE", quarter: "2027-T2" },
      { name: "Construir el tablero de línea base", meta: "1 tablero con 4 rankings", status: "PENDIENTE", quarter: "2027-T3" },
      { name: "Instalar la rutina trimestral de seguimiento", meta: "4 cortes al año con acta", status: "PENDIENTE", quarter: "2027-T4" },
    ],
    log: [],
    nextMilestone: { date: "2027-04-15", text: "Arranque: taller de mapeo de indicadores con Planeación." },
    factors: [
      { name: "Acceso a fuentes de datos externas", state: "VERDE", history: ["VERDE"] },
    ],
  },
  {
    id: "i7", line: 1, subsistema: "Formación", cmi: "OE-01",
    name: "Programas virtuales para el sur del Cesar",
    objetivo: "Diseñar y radicar ante el MEN dos programas en modalidad virtual dirigidos a la demanda del sur del departamento (Aguachica como nodo).",
    horizon: "MEDIANO", impact: 5, feasibility: 3, status: "PLANEADA",
    start: "2027-T3", end: "2028-T4", ownerId: "R01",
    metaResultado: "2 programas virtuales con registro calificado y primera cohorte matriculada.",
    budgetPlanned: 320_000_000, budgetCommitted: 0, budgetExecuted: 0,
    progress: 0, capability: "c1", kpi: "AV-04",
    actions: [
      { name: "Estudio de demanda territorial (módulo M2)", meta: "1 estudio con priorización de programas", status: "HECHA", quarter: "2027-T3" },
      { name: "Elaborar documentos maestros (Decreto 1330)", meta: "2 documentos maestros radicados", status: "PENDIENTE", quarter: "2028-T1" },
      { name: "Producir los contenidos del primer año", meta: "16 cursos virtualizados", status: "PENDIENTE", quarter: "2028-T3" },
      { name: "Abrir la primera cohorte", meta: "120 estudiantes matriculados", status: "PENDIENTE", quarter: "2028-T4" },
    ],
    log: [
      { date: "2027-06-20", type: "HITO", text: "Estudio de demanda cerrado: administración y tecnologías agroindustriales priorizadas." },
    ],
    nextMilestone: { date: "2027-09-30", text: "Inicio de la elaboración de los documentos maestros." },
    factors: [
      { name: "Registros calificados en trámite", state: "AMBAR", history: ["AMBAR"], note: "Tiempos del MEN fuera del control institucional." },
      { name: "Estudio de demanda territorial", state: "VERDE", history: ["VERDE"] },
    ],
  },
  {
    id: "i8", line: 3, subsistema: "Bienestar", cmi: "OE-07",
    name: "Modelo de servicio al estudiante virtual",
    objetivo: "Definir y sistematizar el modelo de atención al interesado y al estudiante virtual: momentos de contacto, tiempos de respuesta y canales.",
    horizon: "CORTO", impact: 4, feasibility: 4, status: "EN_CURSO",
    start: "2026-T4", end: "2027-T2", ownerId: "R06",
    metaResultado: "1 modelo de servicio con indicadores, mesa de ayuda y base de conocimiento operando.",
    budgetPlanned: 40_000_000, budgetCommitted: 8_000_000, budgetExecuted: 12_000_000,
    progress: 35, capability: "c2", kpi: "CO-01",
    actions: [
      { name: "Mapear los momentos de contacto del estudiante virtual", meta: "1 mapa de experiencia con 14 momentos", status: "HECHA", quarter: "2026-T4" },
      { name: "Definir acuerdos de nivel de servicio por canal", meta: "ANS publicados para 4 canales", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Habilitar la mesa de ayuda con base de conocimiento", meta: "1 mesa operando con 50 artículos", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Habilitar punto de atención virtual en Aguachica", meta: "1 punto de atención operando", status: "PENDIENTE", quarter: "2027-T2" },
    ],
    log: [
      { date: "2026-12-10", type: "HITO", text: "Mapa de experiencia validado con estudiantes de tres facultades." },
      { date: "2027-02-01", type: "NOTA", text: "Piloto de mesa de ayuda con 120 tickets; tiempo medio de respuesta 9 h." },
    ],
    nextMilestone: { date: "2027-03-05", text: "Publicación de los ANS y apertura oficial de la mesa de ayuda." },
    factors: [
      { name: "Canales de atención definidos", state: "VERDE", history: ["AMBAR", "VERDE"] },
      { name: "Personal de la mesa de ayuda", state: "AMBAR", history: ["AMBAR", "AMBAR"], note: "1 de 2 posiciones cubiertas." },
    ],
  },
  {
    id: "i9", line: 1, subsistema: "Formación", cmi: "OE-06",
    name: "Virtualización del componente básico institucional",
    objetivo: "Virtualizar los 12 cursos transversales de alta matricialidad para liberar capacidad instalada y pilotear la oferta virtual.",
    horizon: "CORTO", impact: 5, feasibility: 4, status: "EN_CURSO",
    start: "2026-T4", end: "2027-T4", ownerId: "R07",
    metaResultado: "12 cursos transversales virtualizados con estudiantes matriculados.",
    budgetPlanned: 96_000_000, budgetCommitted: 22_000_000, budgetExecuted: 24_000_000,
    progress: 25, capability: "c1", kpi: "AV-05",
    actions: [
      { name: "Priorizar los cursos por matricialidad", meta: "12 cursos priorizados por comité", status: "HECHA", quarter: "2026-T4" },
      { name: "Rediseño microcurricular de los primeros 4", meta: "4 microdiseños aprobados", status: "HECHA", quarter: "2027-T1" },
      { name: "Producción de contenidos del primer paquete", meta: "4 cursos en plataforma", status: "EN_CURSO", quarter: "2027-T2" },
      { name: "Matrícula piloto y evaluación", meta: "600 estudiantes cursando", status: "PENDIENTE", quarter: "2027-T3" },
    ],
    log: [
      { date: "2026-12-05", type: "HITO", text: "Comité curricular priorizó los 12 cursos (Acta 021)." },
      { date: "2027-02-15", type: "NOTA", text: "Producción del primer paquete al 60 %; guion de video atrasado una semana." },
    ],
    nextMilestone: { date: "2027-04-30", text: "Primer paquete de 4 cursos publicado en plataforma." },
    factors: [
      { name: "Equipo de producción de contenidos", state: "AMBAR", history: ["VERDE", "AMBAR"], note: "Diseñador instruccional renunció; vacante en concurso." },
      { name: "Aprobación de comités curriculares", state: "VERDE", history: ["VERDE", "VERDE"] },
    ],
  },
  {
    id: "i10", line: 1, subsistema: "Administrativo", cmi: "OE-12",
    name: "Actualización de la normatividad interna para la virtualidad",
    objetivo: "Reglamentar el desarrollo de asignaturas y programas virtuales: estatuto general, reglamento estudiantil, calendario y acuerdos de autoevaluación.",
    horizon: "CORTO", impact: 4, feasibility: 3, status: "EN_CURSO",
    start: "2026-T3", end: "2027-T2", ownerId: "R01",
    metaResultado: "Normatividad habilitante sancionada para operar programas 100 % virtuales.",
    budgetPlanned: 28_000_000, budgetCommitted: 4_000_000, budgetExecuted: 9_000_000,
    progress: 40, capability: "c1", kpi: "AV-04",
    actions: [
      { name: "Inventario de normas que tocan la virtualidad", meta: "1 matriz normativa con 14 instrumentos", status: "HECHA", quarter: "2026-T3" },
      { name: "Proyecto de acuerdo para el Consejo Superior", meta: "1 proyecto radicado", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Ajustes al reglamento estudiantil de posgrado", meta: "Apartado virtual sancionado", status: "PENDIENTE", quarter: "2027-T2" },
    ],
    log: [
      { date: "2026-10-30", type: "HITO", text: "Matriz normativa cerrada: 14 instrumentos requieren ajuste." },
      { date: "2027-01-28", type: "ALERTA", text: "Agenda del Consejo Superior desplazó el proyecto un mes." },
    ],
    nextMilestone: { date: "2027-03-25", text: "Primera discusión del acuerdo en Consejo Superior." },
    factors: [
      { name: "Agenda del Consejo Superior", state: "AMBAR", history: ["VERDE", "AMBAR"], note: "Coyuntura electoral interna reduce sesiones." },
      { name: "Consenso jurídico interno", state: "VERDE", history: ["VERDE", "VERDE"] },
    ],
  },
  {
    id: "i11", line: 1, subsistema: "Formación", cmi: "OE-15",
    name: "Unidad de Educación Digital",
    objetivo: "Crear la unidad académico-administrativa que coordina la educación digital: célula de trabajo, gobierno y modelo de operación.",
    horizon: "CORTO", impact: 5, feasibility: 3, status: "EN_CURSO",
    start: "2026-T4", end: "2027-T3", ownerId: "R10",
    metaResultado: "1 unidad operando con equipo base y presupuesto de vigencia.",
    budgetPlanned: 130_000_000, budgetCommitted: 35_000_000, budgetExecuted: 30_000_000,
    progress: 30, capability: "c1", kpi: "AV-01",
    actions: [
      { name: "Diseño de la estructura y perfiles", meta: "1 estudio técnico aprobado", status: "HECHA", quarter: "2026-T4" },
      { name: "Acuerdo de creación en Consejo Superior", meta: "1 acuerdo sancionado", status: "EN_CURSO", quarter: "2027-T1" },
      { name: "Vinculación del equipo base (4 posiciones)", meta: "4 profesionales vinculados", status: "PENDIENTE", quarter: "2027-T2" },
    ],
    log: [
      { date: "2026-12-18", type: "HITO", text: "Estudio técnico aprobado por comité de planta." },
    ],
    nextMilestone: { date: "2027-03-25", text: "Acuerdo de creación en agenda del Consejo Superior." },
    factors: [
      { name: "Disponibilidad presupuestal de planta", state: "AMBAR", history: ["AMBAR", "AMBAR"], note: "Depende del cupo de vigencia 2027." },
      { name: "Respaldo de Rectoría", state: "VERDE", history: ["VERDE", "VERDE"] },
    ],
  },
  {
    id: "i12", line: 4, subsistema: "Administrativo", cmi: "OE-05",
    name: "Modelo de costos unitarios por programa, sede y jornada",
    objetivo: "Determinar el punto de equilibrio operacional de cada programa para decidir dónde la virtualidad mejora la sostenibilidad.",
    horizon: "CORTO", impact: 4, feasibility: 4, status: "EN_CURSO",
    start: "2026-T4", end: "2027-T2", ownerId: "R03",
    metaResultado: "1 modelo de costos operando con corte anual y escenarios de sensibilidad.",
    budgetPlanned: 45_000_000, budgetCommitted: 6_000_000, budgetExecuted: 21_000_000,
    progress: 55, capability: "c6", kpi: "SO-02",
    actions: [
      { name: "Inventario de costos por programa (docencia, operación, bienestar)", meta: "1 base de costos completa", status: "HECHA", quarter: "2026-T4" },
      { name: "Primera corrida del modelo por sede y jornada", meta: "Modelo corrido para 33 programas", status: "HECHA", quarter: "2027-T1" },
      { name: "Escenarios de sensibilidad con permanencia", meta: "3 escenarios documentados", status: "EN_CURSO", quarter: "2027-T2" },
    ],
    log: [
      { date: "2027-01-20", type: "HITO", text: "Primera corrida: 13 programas bajo el punto de equilibrio." },
      { date: "2027-02-18", type: "NOTA", text: "Decanaturas piden desagregación por cohorte para el análisis." },
    ],
    nextMilestone: { date: "2027-04-10", text: "Presentación de escenarios al comité financiero." },
    factors: [
      { name: "Calidad de la información financiera", state: "VERDE", history: ["AMBAR", "VERDE"] },
      { name: "Apropiación por decanaturas", state: "AMBAR", history: ["AMBAR", "AMBAR"] },
    ],
  },
  {
    id: "i13", line: 3, subsistema: "Bienestar", cmi: "OE-07",
    name: "Gestión del ciclo de vida del estudiante (CRM y riesgo de abandono)",
    objetivo: "Vista 360° del estudiante con modelo predictivo de riesgo de abandono y planes de acción por segmento.",
    horizon: "MEDIANO", impact: 5, feasibility: 3, status: "PLANEADA",
    start: "2027-T2", end: "2028-T2", ownerId: "R06",
    metaResultado: "1 CRM operando con modelo de riesgo y reducción verificable del abandono.",
    budgetPlanned: 150_000_000, budgetCommitted: 0, budgetExecuted: 0,
    progress: 0, capability: "c2", kpi: "AV-03",
    actions: [
      { name: "Sistematizar estados del estudiante e integrar con registro", meta: "1 CRM implementado", status: "PENDIENTE", quarter: "2027-T3" },
      { name: "Modelo de calificación de riesgo de abandono", meta: "1 modelo predictivo en producción", status: "PENDIENTE", quarter: "2027-T4" },
      { name: "Planes de acción por segmento", meta: "Disminución del % de abandono", status: "PENDIENTE", quarter: "2028-T1" },
    ],
    log: [],
    nextMilestone: { date: "2027-05-15", text: "Levantamiento de requerimientos con Bienestar y Registro." },
    factors: [
      { name: "Integración con registro académico", state: "AMBAR", history: ["AMBAR"], note: "Depende del bus de interoperabilidad (i5)." },
    ],
  },
  {
    id: "i14", line: 2, subsistema: "Investigación", cmi: "OE-08",
    name: "Biblioteca digital y servicios CRAI",
    objetivo: "Evolucionar la biblioteca a Centro de Recursos para el Aprendizaje y la Investigación: buscador centralizado y servicios de apoyo al investigador.",
    horizon: "MEDIANO", impact: 3, feasibility: 4, status: "PLANEADA",
    start: "2027-T3", end: "2028-T1", ownerId: "R05",
    metaResultado: "1 motor de búsqueda centralizado y 4 servicios CRAI operando.",
    budgetPlanned: 85_000_000, budgetCommitted: 0, budgetExecuted: 0,
    progress: 0, capability: "c4", kpi: "IN-02",
    actions: [
      { name: "Buscador centralizado sobre colecciones y bases", meta: "1 motor de descubrimiento en producción", status: "PENDIENTE", quarter: "2027-T4" },
      { name: "Servicios de apoyo al investigador (bibliometría, datos)", meta: "4 servicios publicados", status: "PENDIENTE", quarter: "2028-T1" },
    ],
    log: [],
    nextMilestone: { date: "2027-08-15", text: "Estudio de mercado de motores de descubrimiento." },
    factors: [
      { name: "Renovación de suscripciones a bases", state: "VERDE", history: ["VERDE"] },
    ],
  },
];

/* ═══ Ciclo de medición: historial completo (48 celdas en 3 cortes) ═══ */

export type CellScore = { value: number; target: number };
export type AssessmentRecord = {
  id: string; label: string; period: string;
  status: "PUBLICADA" | "EN_CAPTURA";
  note: string;
  scores: Record<number, Record<string, CellScore>> | null; // null = en captura parcial
};

const T = (value: number, target: number): CellScore => ({ value, target });

export const SCORES_HISTORY: AssessmentRecord[] = [
  {
    id: "A1", label: "Línea base · Fase 0", period: "2026-08", status: "PUBLICADA",
    note: "Primera aplicación del instrumento: 16 celdas, 15 evidencias.",
    scores: {
      1: { organizacional: T(2, 4), misional: T(2, 4), tecnologica: T(2, 4), datos: T(1, 3) },
      2: { organizacional: T(1, 3), misional: T(2, 4), tecnologica: T(2, 4), datos: T(1, 3) },
      3: { organizacional: T(2, 4), misional: T(2, 3), tecnologica: T(1, 3), datos: T(1, 3) },
      4: { organizacional: T(1, 4), misional: T(1, 3), tecnologica: T(2, 4), datos: T(1, 3) },
    },
  },
  {
    id: "A2", label: "Corte de seguimiento 1", period: "2027-02", status: "PUBLICADA",
    note: "Re-medición semestral completa: sube datos (gobierno) y misional (aula estándar).",
    scores: {
      1: { organizacional: T(2, 4), misional: T(3, 4), tecnologica: T(2, 4), datos: T(2, 3) },
      2: { organizacional: T(2, 3), misional: T(2, 4), tecnologica: T(3, 4), datos: T(1, 3) },
      3: { organizacional: T(3, 4), misional: T(2, 3), tecnologica: T(2, 3), datos: T(1, 3) },
      4: { organizacional: T(2, 4), misional: T(1, 3), tecnologica: T(2, 4), datos: T(1, 3) },
    },
  },
  {
    id: "A3", label: "Corte de seguimiento 2", period: "2027-08", status: "EN_CAPTURA",
    note: "En captura: 6 de 16 celdas actualizadas por los responsables de línea.",
    scores: null,
  },
];

export const ASSESSMENTS = SCORES_HISTORY.map(({ id, label, period, status, note }) => ({
  id, label, period, status, note,
}));

/** Medición publicada vigente (la más reciente con scores). */
export const currentAssessment = () =>
  [...SCORES_HISTORY].reverse().find((a) => a.status === "PUBLICADA" && a.scores)!;
export const previousAssessment = () => {
  const pubs = SCORES_HISTORY.filter((a) => a.status === "PUBLICADA" && a.scores);
  return pubs.length > 1 ? pubs[pubs.length - 2] : null;
};
