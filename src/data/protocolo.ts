// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Protocolo de indagación del instrumento.
// Para cada una de las 52 variables define QUÉ se pregunta (ítems, con tipo y
// audiencia por grupo de actores), QUÉ evidencia se solicita (por componente
// D/I/K con criterio de aceptación) y CÓMO se determina el nivel (rúbrica
// anclada 1–5). Es la operacionalización de la metodología AlgoritmoT-IES:
// la percepción sale de los ítems, la evidencia puntúa D/I/K contra las
// anclas, y el nivel 1–5 se asigna contra la rúbrica en sesión de calificación.
// Consistencia protegida por tests: toda variable tiene protocolo completo.
// ─────────────────────────────────────────────────────────────────────────────

import type { ActorGroup } from "./actores";

/* ═══ Tipos ═══ */

export type ItemType = "likert" | "verificacion" | "dato" | "abierta";

export type ProtocolItem = {
  text: string;               // el ítem tal como se formula
  type: ItemType;             // likert 1–5 · verificación sí/no · dato · abierta
  audiences: ActorGroup[];    // a qué grupos se aplica
};

export type EvidenceComponent = "D" | "I" | "K";

export type EvidenceRequest = {
  component: EvidenceComponent;
  what: string;               // qué documento/registro/dato se solicita
  criterio: string;           // qué debe cumplir para puntuar alto (3–4)
};

export type VariableProtocol = {
  items: ProtocolItem[];
  evidence: EvidenceRequest[];
  rubric: [string, string, string, string, string];  // niveles 1..5
};

/* ═══ Anclas de calificación D/I/K (0–4) ═══
   Las mismas para todo el instrumento: el criterio de cada solicitud dice qué
   se acepta; estas anclas dicen cuánto puntúa lo aceptado. */

export const DIK_ANCHORS: Record<EvidenceComponent, { label: string; question: string; levels: [string, string, string, string, string] }> = {
  D: {
    label: "Documentación",
    question: "¿Está escrito, aprobado y vigente?",
    levels: [
      "No existe documento",
      "Borrador o práctica informal sin aprobar",
      "Aprobado, con difusión limitada",
      "Aprobado, difundido y conocido",
      "Institucionalizado y revisado periódicamente",
    ],
  },
  I: {
    label: "Implementación",
    question: "¿Se practica realmente?",
    levels: [
      "No implementado",
      "Piloto aislado o esfuerzo individual",
      "Parcial: opera en algunas unidades",
      "Desplegado en la mayoría de la institución",
      "Sistemático, sostenible y con mejora",
    ],
  },
  K: {
    label: "Indicadores",
    question: "¿Se mide y se usa para decidir?",
    levels: [
      "Sin datos",
      "Datos ocasionales o anecdóticos",
      "Medición regular sin metas",
      "KPI con metas y seguimiento",
      "KPI usados para decidir y mejorar",
    ],
  },
};

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  likert: "Likert 1–5",
  verificacion: "Verificación",
  dato: "Dato",
  abierta: "Abierta",
};

/* ═══ Helpers de autoría (mantienen el banco legible) ═══ */

const L = (text: string, audiences: ActorGroup[]): ProtocolItem => ({ text, type: "likert", audiences });
const V = (text: string, audiences: ActorGroup[]): ProtocolItem => ({ text, type: "verificacion", audiences });
const N = (text: string, audiences: ActorGroup[]): ProtocolItem => ({ text, type: "dato", audiences });
const A = (text: string, audiences: ActorGroup[]): ProtocolItem => ({ text, type: "abierta", audiences });

const D = (what: string, criterio: string): EvidenceRequest => ({ component: "D", what, criterio });
const I = (what: string, criterio: string): EvidenceRequest => ({ component: "I", what, criterio });
const K = (what: string, criterio: string): EvidenceRequest => ({ component: "K", what, criterio });

/* ═══ Banco de protocolos ═══ */

export const PROTOCOLS: Record<string, VariableProtocol> = {

  /* ════════ 4.1 ACADEMIA Y VIRTUALIDAD ════════ */

  "AV-ORG-1": {
    items: [
      L("La institución cuenta con una política de educación digital vigente, conocida y aplicada.", ["directivos", "docentes", "administrativos"]),
      V("La política fue sancionada por el órgano de gobierno competente y está publicada en la normativa institucional.", ["administrativos"]),
      A("Mencione una decisión reciente sobre modalidades o virtualidad y la norma que la amparó.", ["directivos"]),
    ],
    evidence: [
      D("Acuerdo o resolución que sanciona la política, con fecha, órgano emisor y publicación", "Sancionada por Consejo Superior o Académico, vigente y publicada en la normativa"),
      I("Decisiones o actos administrativos del último año que citan la política como fundamento", "Al menos dos decisiones institucionales la aplican de forma verificable"),
      K("Indicador de despliegue de la política (unidades que reportan cumplimiento)", "Medición periódica con meta, responsable y presentación a órgano de gobierno"),
    ],
    rubric: [
      "No existe política ni lineamiento; cada decisión sobre lo digital es casuística.",
      "Borrador o acuerdo en trámite; las decisiones se amparan en resoluciones puntuales.",
      "Política sancionada y difundida que define modalidades y su gobierno.",
      "Política aplicada con indicadores de despliegue y revisión periódica.",
      "Política evaluada y ajustada por ciclos; sirve de referente a otras IES.",
    ],
  },

  "AV-ORG-2": {
    items: [
      L("La institución sabe tramitar y sostener registros calificados en modalidad virtual o híbrida.", ["directivos", "administrativos"]),
      N("¿Cuántos registros calificados vigentes incluyen modalidad virtual o híbrida, y cuántos vencen en los próximos 24 meses?", ["administrativos"]),
      A("¿Qué ajustes exigiría el procedimiento actual de registro para incorporar las condiciones de calidad de la virtualidad (Decreto 1330)?", ["administrativos", "directivos"]),
    ],
    evidence: [
      D("Procedimiento documentado de trámite de registros con las condiciones de virtualidad incorporadas", "Incluye mediaciones, tutores, soporte y recursos educativos exigidos por el Decreto 1330"),
      I("Radicados o renovaciones recientes tramitados con componente virtual", "Al menos una renovación del último ciclo incorporó modalidad virtual o híbrida"),
      K("Tablero de vencimientos de registros con semáforo y responsable por programa", "Cubre el 100 % del portafolio y alimenta el plan de renovaciones"),
    ],
    rubric: [
      "Dominio exclusivo del trámite presencial; los vencimientos se atienden de forma reactiva.",
      "Vencimientos identificados, pero el procedimiento no contempla la virtualidad.",
      "Procedimiento ajustado al Decreto 1330 para virtualidad y calendario de renovaciones activo.",
      "Renovaciones planificadas con componente digital y seguimiento por indicadores.",
      "Gestión anticipada del portafolio de registros; la modalidad se decide con datos de demanda.",
    ],
  },

  "AV-ORG-3": {
    items: [
      L("Existe una unidad responsable de la educación digital con mandato, equipo y presupuesto suficientes.", ["directivos", "docentes", "administrativos"]),
      V("La unidad (o su estudio técnico de creación) cuenta con acto administrativo aprobado.", ["administrativos"]),
      A("Cuando necesita apoyo para un curso virtual, ¿a quién acude y qué respuesta obtiene?", ["docentes"]),
    ],
    evidence: [
      D("Acuerdo de creación de la unidad: estructura, funciones, planta y dependencia jerárquica", "Aprobado por el órgano competente, con planta viabilizada presupuestalmente"),
      I("Portafolio de servicios operando (acompañamiento, producción, formación) con registros de atención", "La unidad presta servicios regulares a todas las facultades"),
      K("Informe de gestión de la unidad con indicadores de servicio", "Reporte periódico con metas de cobertura y satisfacción"),
    ],
    rubric: [
      "Funciones dispersas entre dependencias y voluntarios; nadie responde por la virtualidad.",
      "Estudio técnico o propuesta de unidad en trámite; servicios parciales sin formalizar.",
      "Unidad creada con mandato, equipo básico y portafolio de servicios definido.",
      "Unidad consolidada que atiende toda la institución con indicadores de servicio.",
      "Unidad que innova y transfiere (cursos, metodologías) dentro y fuera de la institución.",
    ],
  },

  "AV-ORG-4": {
    items: [
      L("El portafolio de programas se crea, revisa y cierra con criterios explícitos de demanda, sostenibilidad y pertinencia.", ["directivos", "administrativos"]),
      N("¿Cuántos programas operan por debajo del punto de equilibrio y cuántos tienen plan de intervención?", ["administrativos"]),
      A("Describa la última decisión de apertura o cierre de programa y los datos que la sustentaron.", ["directivos"]),
    ],
    evidence: [
      D("Reglamento o procedimiento del ciclo de vida del portafolio con criterios de decisión", "Define umbrales de demanda, equilibrio financiero y pertinencia territorial"),
      I("Actas de la revisión anual del portafolio con decisiones tomadas por programa", "La revisión cubre el 100 % del portafolio y produce decisiones documentadas"),
      K("Modelo de costos por programa y análisis de demanda territorial", "Punto de equilibrio calculado por programa y contrastado con matrícula real"),
    ],
    rubric: [
      "El portafolio crece por iniciativas aisladas; no se revisa ni se cierra oferta.",
      "Revisión ocasional sin criterios documentados ni datos de costos.",
      "Revisión anual institucionalizada con criterios explícitos por programa.",
      "Decisiones de portafolio sustentadas en costos, demanda y pertinencia medidos.",
      "Portafolio gestionado como cartera: simulación de escenarios y apertura basada en brechas territoriales.",
    ],
  },

  "AV-MIS-1": {
    items: [
      L("La ruta de formación en competencia digital docente está disponible, es pertinente y tiene reconocimiento.", ["docentes", "directivos"]),
      N("¿Qué porcentaje de la planta docente está certificado en algún nivel de la ruta (INTEF/DigCompEdu)?", ["administrativos"]),
      L("La formación recibida cambió mi práctica de enseñanza con tecnología.", ["docentes"]),
      V("El reconocimiento de la certificación en la carrera docente está aprobado en el estatuto o en acuerdo laboral.", ["administrativos"]),
    ],
    evidence: [
      D("Documento de la ruta formativa por niveles con su referente (INTEF) y mecanismo de certificación", "Ruta aprobada, con niveles, créditos y certificación verificable"),
      I("Registros de cohortes: inscritos, asistencia, certificados por nivel y por facultad", "Cohortes regulares con participación sostenida (≥ 70 % de asistencia)"),
      K("Indicador de docentes certificados frente a meta y su correlación con adopción del LMS", "Meta anual definida; el dato alimenta decisiones de programación"),
    ],
    rubric: [
      "Capacitaciones sueltas sin ruta ni certificación; participación voluntaria y ocasional.",
      "Ruta diseñada o piloteada en algunas facultades; sin reconocimiento formal.",
      "Ruta institucional por niveles operando con certificación y cohortes regulares.",
      "Cobertura significativa de la planta (≥ 40 %) con reconocimiento en la carrera docente.",
      "Competencia digital integrada a la evaluación y el desarrollo docente; la ruta se ajusta con datos de impacto en aula.",
    ],
  },

  "AV-MIS-2": {
    items: [
      L("Los cursos se diseñan con estándares institucionales que hacen previsibles esfuerzo, costo y tiempo de producción.", ["docentes", "administrativos"]),
      V("Existe una plantilla o estándar institucional de aula virtual aprobado.", ["administrativos"]),
      A("¿Qué elementos del diseño de un curso virtual cambian entre facultades y cuáles deberían ser comunes?", ["docentes"]),
    ],
    evidence: [
      D("Estándar o catálogo de diseños instruccionales por tipología de curso (teórico, teórico-práctico, práctico)", "Aprobado y con parámetros de esfuerzo y tiempos por tipología"),
      I("Cursos producidos bajo el estándar y evaluación de su aplicación (piloto)", "El estándar se aplica en la producción regular, no solo en pilotos"),
      K("Métricas del piloto/producción: satisfacción, tiempos reales vs. estimados", "Los datos de producción retroalimentan el estándar"),
    ],
    rubric: [
      "Cada docente diseña a su manera; el esfuerzo de producción es impredecible.",
      "Plantilla de aula aprobada o piloteada; sin estándar de diseño instruccional.",
      "Catálogo de diseños por tipología adoptado en la producción institucional.",
      "Producción estandarizada con tiempos y costos medidos por tipo de curso.",
      "Estándares en mejora continua con datos de aprendizaje y costos; producción escalable.",
    ],
  },

  "AV-MIS-3": {
    items: [
      L("Los lineamientos curriculares vigentes contemplan las modalidades virtual e híbrida.", ["docentes", "directivos"]),
      V("El comité curricular aprobó la adaptación de lineamientos para virtualidad.", ["administrativos"]),
      A("¿Qué reglas curriculares actuales (prerrequisitos, presencialidad, interacción) impiden ofrecer unidades virtuales?", ["docentes"]),
    ],
    evidence: [
      D("Lineamientos curriculares con capítulo o adaptación para modalidades digitales", "Aprobados por el órgano curricular competente"),
      I("Programas o cursos rediseñados bajo los nuevos lineamientos", "Al menos el componente básico aplica los lineamientos adaptados"),
      K("Seguimiento del rediseño microcurricular (cursos adaptados / total)", "Avance medido contra el plan de virtualización"),
    ],
    rubric: [
      "Lineamientos exclusivamente presenciales; la virtualidad carece de marco curricular.",
      "Borrador de adaptación en discusión de comités, sin aprobación.",
      "Lineamientos para virtualidad aprobados y difundidos a los programas.",
      "Rediseño curricular en ejecución medida sobre los programas priorizados.",
      "Currículo flexible por diseño: las modalidades se combinan según pertinencia y datos de aprendizaje.",
    ],
  },

  "AV-MIS-4": {
    items: [
      L("La evaluación de aprendizajes mediada por plataforma es confiable, variada y cuida la integridad académica.", ["docentes", "estudiantes"]),
      L("Las evaluaciones en plataforma reflejan lo que aprendo en el curso.", ["estudiantes"]),
      V("Existen rúbricas y bancos de preguntas institucionales para los cursos virtualizados.", ["docentes"]),
    ],
    evidence: [
      D("Lineamiento o guía institucional de evaluación en entornos digitales (formativa, sumativa, integridad)", "Documentada como estándar, no como práctica del piloto"),
      I("Cursos que aplican rúbricas y bancos de preguntas en plataforma", "Práctica extendida en los cursos virtualizados, con revisión entre pares"),
      K("Datos de uso y resultados: intentos, distribución de notas, incidentes de integridad", "Métricas revisadas por los comités curriculares"),
    ],
    rubric: [
      "Evaluación digital inexistente o limitada a subir archivos.",
      "Experiencias aisladas de evaluación en plataforma sin lineamiento común.",
      "Práctica documentada con rúbricas y bancos de preguntas en los cursos activos.",
      "Evaluación digital desplegada con métricas de calidad e integridad revisadas.",
      "Analítica de evaluación usada para mejorar diseño de cursos y detectar riesgo académico.",
    ],
  },

  "AV-TEC-1": {
    items: [
      L("El LMS institucional es estable, suficiente y está bien administrado.", ["docentes", "estudiantes", "administrativos"]),
      N("Disponibilidad del LMS en los últimos 12 meses y % de cursos con aula activa.", ["administrativos"]),
      A("¿Qué le impide usar más el aula virtual en sus cursos?", ["docentes"]),
    ],
    evidence: [
      D("Acuerdos de nivel de servicio, roles de administración y procedimiento de gestión de cambios del LMS", "Roles formalizados (≥ 2 administradores) y ambiente de pruebas definido"),
      I("Operación verificable: monitoreo de disponibilidad, respaldos, gestión de incidentes", "Disponibilidad ≥ 99 % sostenida y sin dependencia de una sola persona"),
      K("Tablero de adopción: aulas activas, usuarios recurrentes, uso por facultad", "Publicado periódicamente y usado en decisiones académicas"),
    ],
    rubric: [
      "Sin LMS institucional o con uso marginal y administración informal.",
      "LMS operando con administración dependiente de personas y sin ambiente de pruebas.",
      "LMS estable con roles formalizados, respaldo y monitoreo de disponibilidad.",
      "Adopción medida y gestionada (aulas activas, uso docente) con metas por facultad.",
      "LMS como núcleo del ecosistema: integrado, con analítica y evolución planificada.",
    ],
  },

  "AV-TEC-2": {
    items: [
      L("La institución produce recursos educativos digitales con calidad y ritmo suficientes.", ["docentes", "administrativos"]),
      N("Cursos producidos por año y tamaño/roles del equipo de producción.", ["administrativos"]),
      A("¿Dónde se atasca hoy el flujo de producción de un curso (guion, diseño, montaje, revisión)?", ["administrativos", "docentes"]),
    ],
    evidence: [
      D("Modelo de producción documentado: flujo, roles, estándares de calidad y cronograma anual", "Define capacidad instalada y modalidad (in-house, contratada, mixta)"),
      I("Producción real del periodo: cursos terminados, en curso, tiempos por fase", "Flujo operando sin cuellos de botella de personal"),
      K("Indicadores de producción: costo por curso, tiempo medio, cumplimiento del plan", "Medidos y comparados contra el estándar de diseño"),
    ],
    rubric: [
      "Sin equipo ni flujo de producción; los cursos dependen del esfuerzo docente individual.",
      "Equipo incompleto produciendo el primer paquete; flujo definido pero frenado.",
      "Equipo completo y flujo estable con cronograma anual de producción.",
      "Producción medida (costos, tiempos) cumpliendo el plan de virtualización.",
      "Fábrica de contenidos escalable con reuso, actualización programada y estándares propios.",
    ],
  },

  "AV-TEC-3": {
    items: [
      L("La conectividad y los equipos de mi sede permiten estudiar o enseñar con tecnología sin interrupciones.", ["docentes", "estudiantes", "administrativos"]),
      N("Ancho de banda, redundancia y aulas con equipos funcionales por sede.", ["administrativos"]),
      A("¿En qué horarios y espacios falla la conectividad de su sede?", ["estudiantes", "docentes"]),
    ],
    evidence: [
      D("Inventario de conectividad y equipos por sede con plan de capacidad", "Cubre todas las sedes con línea base y plan de cierre de brechas"),
      I("Monitoreo de red por sede (disponibilidad, saturación por franja)", "Valledupar y Aguachica monitoreadas con alertas"),
      K("Indicadores de servicio por sede frente a umbral definido", "El dato de Aguachica sustenta la decisión de redundancia previa a la oferta virtual del sur"),
    ],
    rubric: [
      "Conectividad inestable sin diagnóstico; los equipos se reponen por daño.",
      "Sede principal estable; sedes regionales con intermitencia conocida y sin plan.",
      "Plan de capacidad por sede en ejecución con monitoreo de red.",
      "Conectividad redundante en sedes críticas con indicadores de servicio cumplidos.",
      "Infraestructura dimensionada por demanda proyectada; la red no limita la oferta.",
    ],
  },

  "AV-TEC-4": {
    items: [
      L("Las licencias de software educativo que necesito están disponibles y vigentes.", ["docentes"]),
      V("Existe un portafolio institucional centralizado de licencias educativas con matriz de cobertura por programa.", ["administrativos"]),
      N("Licencias educativas activas, su costo anual y cuáles vencen este año.", ["administrativos"]),
    ],
    evidence: [
      D("Portafolio de licencias con matriz de cobertura por programa y calendario de renovación", "Centralizado, con responsable y presupuesto de renovación asegurado"),
      I("Adquisiciones y renovaciones gestionadas por el portafolio (no por facultad)", "Sin duplicidades ni vencimientos no planeados en el periodo"),
      K("Indicadores de uso de licencias frente a su costo", "El uso real sustenta renovar, sustituir o cancelar"),
    ],
    rubric: [
      "Compras dispersas por facultad; duplicidades y vencimientos sin control.",
      "Inventario parcial de licencias en construcción; renovaciones aún reactivas.",
      "Portafolio centralizado con matriz de cobertura y calendario de renovaciones.",
      "Gestión por datos de uso: renovaciones y sustituciones decididas con métricas.",
      "Portafolio optimizado (negociación por volumen, alternativas abiertas) alineado al diseño curricular.",
    ],
  },

  "AV-DAT-1": {
    items: [
      L("La institución usa los datos de actividad en plataforma para detectar y atender el riesgo académico.", ["directivos", "docentes"]),
      V("Existen tableros de actividad de aulas por decanatura o programa.", ["administrativos"]),
      A("Si un estudiante deja de conectarse dos semanas, ¿quién se entera y qué pasa?", ["docentes", "administrativos"]),
    ],
    evidence: [
      D("Diseño del modelo de analítica de aprendizaje: eventos, indicadores, protocolo de intervención", "Define alertas, umbrales, responsables y ruta de atención al estudiante"),
      I("Tableros publicados y casos de intervención temprana documentados", "Operando al menos en el componente básico virtualizado"),
      K("Métricas del ciclo: alertas emitidas, atendidas, resultado académico de los intervenidos", "La efectividad de la intervención se mide y ajusta"),
    ],
    rubric: [
      "Los datos del LMS existen pero nadie los explota; el riesgo se descubre al cierre de notas.",
      "Reportes manuales ocasionales de actividad; sin alertas ni protocolo.",
      "Tableros de actividad publicados con protocolo de alerta temprana definido.",
      "Alertas operando con intervención documentada y cobertura de los cursos virtuales.",
      "Modelo predictivo de riesgo integrado a permanencia; efectividad medida por cohorte.",
    ],
  },

  "AV-DAT-2": {
    items: [
      L("Los datos de programas, cupos, matrícula y modalidad son consistentes y están disponibles a tiempo.", ["administrativos", "directivos"]),
      N("Completitud y oportunidad del último reporte SNIES (% registros completos, días de anticipación).", ["administrativos"]),
      A("¿Qué dato de la oferta le ha tocado corregir o reconstruir manualmente este año?", ["administrativos"]),
    ],
    evidence: [
      D("Procedimiento de reporte SNIES con calendario, responsables y validaciones", "Documentado y con controles de calidad previos al cargue"),
      I("Reportes de los últimos periodos entregados en plazo", "Sin requerimientos de corrección del Ministerio"),
      K("Indicador de completitud/consistencia del reporte (meta ≥ 99 %)", "Medido por periodo, con plan sobre el residuo incompleto"),
    ],
    rubric: [
      "Reportes tardíos o con errores recurrentes; los datos de oferta no son confiables.",
      "Reporte cumplido con esfuerzo manual heroico y validaciones informales.",
      "Procedimiento con validaciones operando; completitud alta y estable (≥ 97 %).",
      "Calidad del dato medida con meta y cierre sistemático del residuo.",
      "Dato de oferta como activo: alimenta simulaciones de demanda y decisiones de portafolio en tiempo real.",
    ],
  },

  "AV-DAT-3": {
    items: [
      L("El estudiante fluye de la inscripción al grado sin que su información se redigite entre sistemas.", ["administrativos"]),
      N("Inconsistencias de matrícula detectadas por periodo entre registro académico y LMS.", ["administrativos"]),
      L("Mis datos académicos aparecen correctos y completos en todas las plataformas que uso.", ["estudiantes"]),
    ],
    evidence: [
      D("Diseño de la integración admisiones ↔ registro ↔ LMS (contratos de datos, campos, frecuencia)", "Especificación aprobada dentro del plan de interoperabilidad"),
      I("Integración operando en producción (no en pruebas) para matrícula a cursos", "La matrícula virtual fluye sin redigitación"),
      K("Indicador de inconsistencias por periodo con tendencia a cero", "Medido y publicado tras cada cierre de matrícula"),
    ],
    rubric: [
      "Redigitación en cada paso; decenas de inconsistencias por periodo.",
      "Integración en pruebas; la operación real sigue siendo manual.",
      "Integración en producción para los flujos de matrícula principales.",
      "Trazabilidad completa inscripción→grado con inconsistencias medidas cerca de cero.",
      "Vista única del estudiante en tiempo real usada por bienestar, permanencia y decanaturas.",
    ],
  },

  /* ════════ 4.2 INVESTIGACIÓN Y CTeI ════════ */

  "IN-ORG-1": {
    items: [
      L("La investigación mediada por tecnología tiene lineamientos y estructuras que la orientan.", ["directivos", "docentes"]),
      V("El comité de investigaciones aprobó una agenda o lineamiento de CTeI digital.", ["administrativos"]),
      A("¿Qué necesitaría un grupo para investigar en o a través de entornos digitales con respaldo institucional?", ["docentes"]),
    ],
    evidence: [
      D("Lineamiento de investigación digital aprobado por el comité de investigaciones", "Define alcance, prioridades y mecanismos de fomento"),
      I("Convocatorias o proyectos que aplican el lineamiento", "Al menos una convocatoria interna incorpora la línea digital"),
      K("Indicadores de la agenda CTeI digital (proyectos, recursos, productos)", "Seguimiento periódico en el comité"),
    ],
    rubric: [
      "Sin lineamientos: lo digital en investigación depende de iniciativas personales.",
      "Agenda CTeI priorizada pero sin lineamiento para entornos digitales.",
      "Lineamiento aprobado y difundido con mecanismos de fomento definidos.",
      "Convocatorias y recursos operando bajo el lineamiento, con seguimiento.",
      "Agenda digital consolidada que atrae financiación externa y coopera en red.",
    ],
  },

  "IN-ORG-2": {
    items: [
      L("Existen líneas, semilleros y proyectos activos en educación digital o transformación digital.", ["docentes", "directivos"]),
      N("Líneas y semilleros aprobados en educación digital, y proyectos financiados asociados.", ["administrativos"]),
      L("Como estudiante, conozco semilleros donde se investiga sobre tecnología y educación.", ["estudiantes"]),
    ],
    evidence: [
      D("Actos de aprobación de líneas y semilleros en educación digital", "Formalizados en el sistema de investigación institucional"),
      I("Semilleros operando: integrantes, plan de trabajo, productos en curso", "Actividad regular verificable en al menos 3 semilleros"),
      K("Proyectos presentados/financiados y productos derivados por línea", "Al menos un proyecto financiado (interno o externo)"),
    ],
    rubric: [
      "Sin líneas ni semilleros relacionados con lo digital.",
      "Propuestas de líneas/semilleros en trámite o recién aprobadas sin actividad.",
      "Líneas y semilleros aprobados con actividad regular y plan de trabajo.",
      "Proyectos financiados en ejecución con productos verificables.",
      "Ecosistema de investigación digital con relevo estudiantil y cooperación externa sostenida.",
    ],
  },

  "IN-ORG-3": {
    items: [
      L("El talento investigador es suficiente y estable para sostener la producción científica.", ["directivos", "docentes"]),
      N("TCE dedicados a investigación, investigadores con doctorado y salidas de investigadores en 24 meses.", ["administrativos"]),
      A("¿Qué causó las últimas salidas de investigadores y qué se hizo al respecto?", ["directivos"]),
    ],
    evidence: [
      D("Plan de desarrollo y retención del talento investigador (relevo generacional, incentivos)", "Aprobado, con metas y presupuesto"),
      I("Acciones ejecutadas: vinculaciones, comisiones doctorales, jóvenes investigadores", "El plan opera; los semilleros alimentan el relevo"),
      K("Indicadores de talento: permanencia, TCE de investigación, formación doctoral", "Serie histórica con metas y análisis de rotación"),
    ],
    rubric: [
      "Salidas de investigadores sin plan de retención ni relevo; producción vulnerable.",
      "Diagnóstico del talento hecho; plan de retención en borrador.",
      "Plan de talento aprobado con acciones de relevo en ejecución.",
      "Retención y relevo medidos; la producción no depende de personas únicas.",
      "Cantera consolidada: jóvenes investigadores y doctores crecen dentro de los grupos.",
    ],
  },

  "IN-MIS-1": {
    items: [
      L("La producción académica se publica en acceso abierto con licenciamiento claro.", ["docentes", "directivos"]),
      N("Porcentaje de la producción del último año disponible en acceso abierto.", ["administrativos"]),
      V("La política de acceso abierto y autoarchivo está aprobada.", ["administrativos"]),
    ],
    evidence: [
      D("Política de acceso abierto y autoarchivo aprobada (no en borrador)", "Sancionada, con obligación de depósito y licencias definidas"),
      I("Flujo de depósito operando: apoyo a publicación condicionado al autoarchivo", "El depósito es sistemático, no voluntario"),
      K("Indicador de % de producción en abierto con meta", "Serie medida y reportada (línea base 44 %)"),
    ],
    rubric: [
      "Publicación cerrada por defecto; el acceso abierto depende de cada autor.",
      "Repositorio disponible y política en borrador; depósito voluntario.",
      "Política aprobada con flujo de depósito obligatorio operando.",
      "Mayoría de la producción en abierto con seguimiento y metas.",
      "Ciencia abierta integral: datos, preprints y licencias gestionados como práctica normal.",
    ],
  },

  "IN-MIS-2": {
    items: [
      L("La investigación formativa llega a los estudiantes a través de entornos virtuales.", ["docentes", "estudiantes"]),
      A("¿En qué cursos o espacios virtuales los estudiantes desarrollan competencias investigativas?", ["docentes"]),
      L("He participado en actividades de investigación a través de plataformas virtuales.", ["estudiantes"]),
    ],
    evidence: [
      D("Estrategia de investigación formativa en entornos virtuales (módulos, metodologías)", "Documentada y articulada al componente básico"),
      I("Cursos o módulos virtuales de investigación formativa operando", "Presencia transversal, no solo experiencias de dos facultades"),
      K("Cobertura de estudiantes alcanzados y productos derivados (semilleros, ponencias)", "Medición periódica por programa"),
    ],
    rubric: [
      "Sin investigación formativa mediada por tecnología.",
      "Experiencias aisladas en pocas facultades, sin estrategia común.",
      "Estrategia transversal definida con módulos virtuales en operación.",
      "Cobertura medida en el componente básico con productos verificables.",
      "Cantera investigativa digital: trayectos desde pregrado conectados a semilleros y grupos.",
    ],
  },

  "IN-MIS-3": {
    items: [
      L("El conocimiento producido se divulga por canales digitales con alcance verificable.", ["docentes", "directivos"]),
      V("Las revistas institucionales operan con flujo editorial OJS completo y DOI.", ["administrativos"]),
      A("¿Por qué canales se entera la comunidad (y el territorio) de lo que investiga la Universidad?", ["docentes", "aliados"]),
    ],
    evidence: [
      D("Plan de divulgación científica digital: canales, calendario editorial, responsables", "Cubre revistas, eventos y redes con metas de alcance"),
      I("Revistas en OJS con DOI, eventos híbridos realizados, canales activos", "Flujo editorial completo y periodicidad cumplida"),
      K("Métricas de alcance: descargas, visitas, indexación, participación en eventos", "Medidas y usadas para ajustar la estrategia"),
    ],
    rubric: [
      "Divulgación esporádica; revistas sin flujo digital ni indexación.",
      "Un evento anual y canales informales; OJS parcial sin DOI.",
      "Revistas en OJS con DOI y calendario editorial cumplido; eventos híbridos regulares.",
      "Alcance medido con metas; revistas en proceso de indexación.",
      "Ecosistema de divulgación consolidado: revistas indexadas y comunidades activas con el territorio.",
    ],
  },

  "IN-TEC-1": {
    items: [
      L("La plataforma de gestión de la investigación cubre el ciclo completo: convocatorias, proyectos, productos y grupos.", ["docentes", "administrativos"]),
      A("¿Qué partes del ciclo de un proyecto siguen gestionándose por correo o en hojas de cálculo?", ["administrativos"]),
      L("Registrar mis productos de investigación es un trámite simple y sin duplicaciones.", ["docentes"]),
    ],
    evidence: [
      D("Documentación funcional de la plataforma y del flujo de gestión de la investigación", "Cubre el ciclo completo incluyendo productos"),
      I("Módulos operando: convocatorias, proyectos y productos gestionados en la plataforma", "El registro de productos no es manual ni externo"),
      K("Indicadores de uso: proyectos gestionados, productos registrados, oportunidad", "Reportes usados por el comité de investigaciones"),
    ],
    rubric: [
      "Gestión de la investigación en papel, correo y hojas de cálculo.",
      "Plataforma parcial: convocatorias o proyectos, con el resto manual.",
      "Ciclo completo en plataforma, incluido el registro de productos.",
      "Plataforma integrada con CvLAC y repositorio; datos usados en decisiones.",
      "Gestión inteligente: analítica de la actividad investigativa orienta recursos y alianzas.",
    ],
  },

  "IN-TEC-2": {
    items: [
      L("El repositorio institucional preserva y visibiliza la producción con estándares de calidad.", ["docentes", "administrativos"]),
      N("Objetos depositados, % de metadatos válidos y estado de la cosecha OAI-PMH.", ["administrativos"]),
      L("Encuentro fácilmente la producción de la Universidad cuando la busco en línea.", ["docentes", "estudiantes", "aliados"]),
    ],
    evidence: [
      D("Políticas del repositorio: colecciones, metadatos, preservación, interoperabilidad", "Estándares definidos (Dublin Core, OAI-PMH) y aplicados"),
      I("Repositorio en producción con migración completa y depósito activo", "≥ 90 % de metadatos válidos y crecimiento sostenido"),
      K("Métricas de uso y visibilidad: descargas, cosecha por agregadores", "Cosechado por Google Scholar y La Referencia"),
    ],
    rubric: [
      "Sin repositorio; la producción se dispersa en discos y correos.",
      "Repositorio instalado con migración parcial o metadatos deficientes.",
      "Repositorio en producción con estándares cumplidos y depósito regular.",
      "Interoperando con agregadores; visibilidad y uso medidos.",
      "Nodo de ciencia abierta regional: datos de investigación y patrimonio digital incluidos.",
    ],
  },

  "IN-TEC-3": {
    items: [
      L("Los grupos cuentan con herramientas de bibliometría y vigilancia tecnológica para orientar su trabajo.", ["docentes"]),
      V("La institución dispone de licencias o servicios de análisis bibliométrico.", ["administrativos"]),
      A("¿Cómo se construyó el último informe bibliométrico institucional y cuánto costó en horas?", ["administrativos"]),
    ],
    evidence: [
      D("Portafolio de herramientas de análisis definido (propias, consorcio, abiertas) con responsables", "Incluido en los servicios CRAI con protocolo de uso"),
      I("Servicios de bibliometría operando para grupos e institución", "Informes producidos con herramientas, no a mano"),
      K("Indicadores derivados: benchmarking de producción, vigilancia de convocatorias", "Alimentan decisiones de fomento y alianzas"),
    ],
    rubric: [
      "Sin herramientas: los informes se arman manualmente cuando se necesitan.",
      "Acceso básico por consorcio sin servicios de análisis estructurados.",
      "Servicio de bibliometría definido y operando desde el CRAI.",
      "Análisis periódicos con herramientas que orientan la estrategia de investigación.",
      "Inteligencia científica institucional: vigilancia continua conectada a rankings y financiación.",
    ],
  },

  "IN-DAT-1": {
    items: [
      L("Las hojas de vida (CvLAC) y los grupos (GrupLAC) están actualizados para la medición nacional.", ["docentes", "directivos"]),
      N("Porcentaje de CvLAC actualizados en el último año y grupos en riesgo de descenso.", ["administrativos"]),
      A("¿Qué le impide mantener su CvLAC al día?", ["docentes"]),
    ],
    evidence: [
      D("Protocolo de actualización CvLAC/GrupLAC con calendario ligado a la medición", "Responsables por facultad y soporte definido"),
      I("Jornadas de actualización asistida ejecutadas con cobertura", "≥ 80 % de investigadores activos actualizados"),
      K("Indicador de vigencia de CvLAC y simulacro de medición de grupos", "Riesgo de descenso detectado antes de la convocatoria"),
    ],
    rubric: [
      "Actualización voluntaria y esporádica; alto riesgo en la medición.",
      "Campañas ocasionales de actualización sin cobertura suficiente.",
      "Protocolo con jornadas asistidas y calendario operando.",
      "Vigencia medida continuamente con simulacros previos a la medición.",
      "Información de investigadores sincronizada desde los sistemas propios; CvLAC como espejo, no como carga.",
    ],
  },

  "IN-DAT-2": {
    items: [
      L("Registrar un producto una sola vez basta: fluye al repositorio y a los perfiles automáticamente.", ["docentes"]),
      N("¿En cuántos sistemas debe registrarse hoy un mismo producto de investigación?", ["administrativos"]),
      A("Estime las horas por investigador dedicadas a duplicar registros cada semestre.", ["administrativos"]),
    ],
    evidence: [
      D("Especificación del flujo investigación → repositorio → perfiles en el plan de interoperabilidad", "Contratos de datos definidos e incluidos en el bus (i5)"),
      I("Integración operando al menos entre plataforma de investigación y repositorio", "El registro único elimina la digitación múltiple"),
      K("Indicador de duplicación de esfuerzo (sistemas por producto, tendencia)", "Medido antes y después de la integración"),
    ],
    rubric: [
      "Cada producto se registra hasta en tres sistemas sin sincronización.",
      "Flujo especificado en el plan de interoperabilidad, sin implementar.",
      "Primera integración operando: el producto fluye a al menos un sistema destino.",
      "Registro único con sincronización completa y esfuerzo medido a la baja.",
      "Metadatos de producción interoperando también con agregadores externos (ORCID, DOI, CvLAC).",
    ],
  },

  "IN-DAT-3": {
    items: [
      L("La institución conoce y sigue la visibilidad de su producción (citación, altmetría, posicionamiento).", ["directivos", "docentes"]),
      V("Existe una línea base de citación institucional documentada.", ["administrativos"]),
      A("¿Qué datos de visibilidad se necesitaron el año pasado para rankings y de dónde salieron?", ["administrativos"]),
    ],
    evidence: [
      D("Diseño del sistema de métricas de visibilidad: fuentes, indicadores, periodicidad", "Integrado al observatorio de rankings (i6)"),
      I("Cortes de medición producidos regularmente", "Trimestrales o semestrales, sin reconstrucción manual"),
      K("Serie de citación/altmetría con análisis de tendencia", "Usada en decisiones de fomento y en reportes a rankings"),
    ],
    rubric: [
      "Sin línea base ni seguimiento; los datos se reconstruyen a mano cada año.",
      "Primeros ejercicios de medición puntuales sin sistema.",
      "Línea base establecida con cortes regulares en el observatorio.",
      "Serie con metas y análisis usada en la estrategia de visibilidad.",
      "Visibilidad gestionada activamente: la evidencia alimenta rankings, alianzas y contratación.",
    ],
  },

  /* ════════ 4.3 EXTENSIÓN, RELACIONAMIENTO Y RANKINGS ════════ */

  "EX-ORG-1": {
    items: [
      L("Los convenios se gestionan por ciclo de vida: suscripción, ejecución verificable y evaluación de resultados.", ["directivos", "administrativos", "aliados"]),
      N("Convenios activos, % con ejecución verificable y % evaluados al cierre.", ["administrativos"]),
      L("El convenio con la Universidad produce resultados concretos para nuestra organización.", ["aliados"]),
    ],
    evidence: [
      D("Procedimiento del ciclo de vida de convenios con formatos de seguimiento y evaluación", "Define hitos, responsables e indicadores por convenio"),
      I("Convenios activos con seguimiento al día en el sistema", "Ejecución verificable en la mayoría del portafolio (línea base: 61 activos)"),
      K("Indicadores de resultado por convenio (beneficiarios, recursos, productos)", "Reporte trimestral estructurado en la plataforma"),
    ],
    rubric: [
      "Convenios firmados sin seguimiento; nadie sabe cuáles están vivos.",
      "Inventario de convenios al día, con seguimiento informal.",
      "Ciclo de vida operando con seguimiento estructurado por convenio.",
      "Resultados medidos por convenio e informados a las partes.",
      "Cartera de alianzas gestionada estratégicamente por valor territorial y misional.",
    ],
  },

  "EX-ORG-2": {
    items: [
      L("El ciclo de autoevaluación funciona con periodicidad, participación y planes de mejoramiento que se cumplen.", ["directivos", "docentes", "administrativos"]),
      N("Programas con autoevaluación vigente (≤ 3 años) y % de acciones de mejoramiento cerradas.", ["administrativos"]),
      L("Los resultados de la autoevaluación producen cambios visibles en mi programa.", ["docentes", "estudiantes"]),
    ],
    evidence: [
      D("Modelo de autoevaluación institucional con instrumentos y periodicidad", "Aprobado y alineado con CNA/Decreto 1330"),
      I("Ciclos ejecutados con participación verificable (encuestas, talleres)", "Cobertura de estamentos y periodicidad cumplida"),
      K("Seguimiento sistemático de planes de mejoramiento (acciones, avance, cierre)", "Los planes viven en un sistema con seguimiento, no en actas"),
    ],
    rubric: [
      "Autoevaluación solo cuando la exige un trámite; sin planes de mejoramiento reales.",
      "Ciclos ejecutados con participación, pero los planes viven en actas sin seguimiento.",
      "Ciclo institucionalizado con planes de mejoramiento estructurados y responsables.",
      "Acciones de mejoramiento con seguimiento medido y tasa de cierre creciente.",
      "Mejora continua basada en evidencia; la autoevaluación anticipa la acreditación en alta calidad.",
    ],
  },

  "EX-ORG-3": {
    items: [
      L("La institución mantiene vínculo activo y útil con sus egresados.", ["directivos", "aliados"]),
      N("Cobertura de contacto de la base de egresados y canales activos (bolsa, formación, participación).", ["administrativos"]),
      A("¿Qué beneficios recibe hoy un egresado por mantener su información actualizada?", ["administrativos"]),
    ],
    evidence: [
      D("Estrategia de relacionamiento con egresados: canales, beneficios, gobierno del dato", "Aprobada, con dueño del proceso y metas de cobertura"),
      I("Canales operando: bolsa de empleo, formación continua, encuentros, actualización de datos", "Actividad regular con participación medida"),
      K("Indicadores: cobertura de contacto, empleabilidad, participación", "Cobertura ≥ 70 % con fuentes propias (no solo OLE)"),
    ],
    rubric: [
      "Base de egresados desactualizada; contacto solo para ceremonias.",
      "Cobertura de contacto baja (≈ 40 %); información dependiente del OLE.",
      "Estrategia operando con campaña de actualización y beneficios activos.",
      "Cobertura alta y medida; canales con participación regular.",
      "Comunidad de egresados como activo institucional: mentoría, empleabilidad y donaciones gestionadas por CRM.",
    ],
  },

  "EX-ORG-4": {
    items: [
      L("La articulación con la educación media es un canal efectivo de cobertura territorial.", ["directivos", "aliados"]),
      N("Municipios y colegios con articulación activa, y estudiantes vinculados por cohorte.", ["administrativos"]),
      L("La articulación con la Universidad agrega valor a nuestros estudiantes de media.", ["aliados"]),
    ],
    evidence: [
      D("Convenios y modelo de articulación con la media documentados", "Homologación de cursos definida reglamentariamente"),
      I("Programas operando en municipios con estudiantes activos", "Presencia verificable en ≥ 10 municipios (línea base: 14)"),
      K("Indicadores: estudiantes articulados, tasa de absorción a pregrado, permanencia", "Serie medida por cohorte y municipio"),
    ],
    rubric: [
      "Sin articulación con la media; el primer contacto es la inscripción.",
      "Convenios puntuales con pocos colegios, sin homologación.",
      "Modelo de articulación operando en múltiples municipios con homologación.",
      "Absorción y permanencia medidas; la articulación alimenta la proyección de demanda.",
      "Trayectorias media→pregrado fluidas (incluso virtuales); la articulación es la puerta territorial de la Universidad.",
    ],
  },

  "EX-MIS-1": {
    items: [
      L("La educación continua ofrece un portafolio digital pertinente con matrícula en línea.", ["administrativos", "aliados"]),
      N("Cursos/diplomados virtuales o híbridos activos y % de ingresos de educación continua por canal digital.", ["administrativos"]),
      A("¿Qué formación corta demandan las organizaciones del territorio que hoy no se ofrece?", ["aliados"]),
    ],
    evidence: [
      D("Portafolio de educación continua digital con modelo de negocio (precios, pasarela, certificados)", "Catálogo publicado con matrícula y pago en línea"),
      I("Oferta operando: cohortes ejecutadas en modalidad virtual o híbrida", "≥ 5 productos digitales con cohortes reales"),
      K("Ingresos y matrícula de la oferta digital frente a meta (KPI SO-01)", "Serie medida por producto y canal"),
    ],
    rubric: [
      "Educación continua exclusivamente presencial, sin catálogo ni pago en línea.",
      "Primeros productos híbridos diseñados; matrícula aún manual.",
      "Catálogo digital publicado con pasarela y cohortes operando.",
      "Portafolio digital con ingresos medidos y crecimiento sostenido.",
      "Línea de negocio digital consolidada con oferta por demanda territorial y certificación apilable.",
    ],
  },

  "EX-MIS-2": {
    items: [
      L("Los servicios de proyección social (consultorios, unidades de atención) atienden también por canales digitales.", ["administrativos", "aliados"]),
      N("Servicios con atención virtual disponible y demanda atendida por subregión.", ["administrativos"]),
      A("¿Qué servicios de la Universidad necesitaría su comunidad sin viajar a Valledupar?", ["aliados", "estudiantes"]),
    ],
    evidence: [
      D("Modelo de atención virtual de los servicios de proyección social (protocolos, agenda, herramientas)", "Documentado con niveles de servicio"),
      I("Servicios operando virtualmente con casos atendidos", "Consultorios jurídico y empresarial con agenda en línea activa"),
      K("Indicadores de atención por canal y territorio", "La demanda del sur se atiende y se mide"),
    ],
    rubric: [
      "Atención exclusivamente presencial; la distancia excluye al territorio.",
      "Atenciones virtuales ocasionales por iniciativa de cada consultorio.",
      "Modelo de atención virtual operando con agenda en línea.",
      "Cobertura territorial medida con niveles de servicio cumplidos.",
      "Red de servicios híbrida integrada a los convenios territoriales y a la formación práctica de estudiantes.",
    ],
  },

  "EX-MIS-3": {
    items: [
      L("El emprendimiento y la innovación se apoyan en plataformas y comunidades digitales.", ["estudiantes", "administrativos", "aliados"]),
      N("Programas de emprendimiento con componente digital y emprendimientos acompañados por año.", ["administrativos"]),
      A("¿Qué le faltó al último emprendedor que el centro no pudo resolver presencialmente?", ["administrativos", "estudiantes"]),
    ],
    evidence: [
      D("Programa de emprendimiento digital documentado y articulado a la agenda regional", "Con ruta del emprendedor y componente virtual definido"),
      I("Cohortes operando en formato digital o híbrido, con comunidades activas", "Participación verificable más allá de talleres presenciales"),
      K("Indicadores: emprendimientos acompañados, supervivencia, vínculo con convenios", "Serie medida y usada para ajustar el programa"),
    ],
    rubric: [
      "Talleres presenciales aislados; sin plataforma ni comunidad.",
      "Primeros contenidos digitales; comunidad incipiente sin programa formal.",
      "Programa digital operando con ruta del emprendedor y cohortes regulares.",
      "Resultados medidos (supervivencia, escalamiento) conectados a la agenda regional.",
      "Ecosistema emprendedor híbrido reconocido en la región, con aliados y financiación externa.",
    ],
  },

  "EX-TEC-1": {
    items: [
      L("Los momentos de contacto con aspirantes y estudiantes están sistematizados con canales digitales y tiempos de respuesta.", ["administrativos", "estudiantes"]),
      N("Momentos de contacto mapeados, % con canal digital y % con acuerdo de nivel de servicio publicado.", ["administrativos"]),
      L("Cuando escribo a la Universidad por un canal digital, recibo respuesta oportuna y útil.", ["estudiantes", "aliados"]),
    ],
    evidence: [
      D("Mapa de experiencia con momentos de contacto, canales y ANS por momento", "Mapa completo con ANS publicados"),
      I("Canales digitales operando (formularios, chat, WhatsApp) en los momentos críticos", "≥ 80 % de los momentos con canal digital activo"),
      K("Métricas de servicio: volumen, tiempo de respuesta, satisfacción por canal", "Medidas contra ANS con semáforo"),
    ],
    rubric: [
      "Contacto por ventanilla y correo genérico; sin tiempos comprometidos.",
      "Momentos de contacto mapeados; pocos canales digitales y sin ANS.",
      "Canales digitales en los momentos críticos con ANS publicados.",
      "Servicio medido contra ANS con mejora sostenida.",
      "Experiencia omnicanal gestionada de la indagación al grado, con datos por interesado (CRM).",
    ],
  },

  "EX-TEC-2": {
    items: [
      L("El portal institucional es el punto único de acceso a la información y los servicios.", ["estudiantes", "docentes", "aliados"]),
      N("Trámites publicados en el portal y cuántos se completan totalmente en línea.", ["administrativos"]),
      A("¿Qué trámite le tocó hacer presencialmente que esperaba resolver por el portal?", ["estudiantes", "docentes"]),
    ],
    evidence: [
      D("Gobierno del portal: responsables, arquitectura de información, política de publicación", "Actualización con dueños definidos por sección"),
      I("Portal estable y actualizado con servicios operativos", "Los 10 trámites más demandados accesibles desde el portal"),
      K("Analítica del portal: visitas, rutas, abandono en trámites", "Usada para priorizar la virtualización de trámites"),
    ],
    rubric: [
      "Portal desactualizado o solo informativo; los trámites viven en PDF.",
      "Portal estable e informativo; trámites fuera de línea.",
      "Trámites priorizados operando en línea de extremo a extremo.",
      "Uso del portal medido; los trámites digitales dominan el volumen.",
      "Sede electrónica plena: todo trámite estudiantil y docente es digital por defecto.",
    ],
  },

  "EX-TEC-3": {
    items: [
      L("La mesa de ayuda resuelve los problemas técnicos de estudiantes y docentes con oportunidad.", ["estudiantes", "docentes"]),
      N("Tickets por periodo, tiempo medio de respuesta y cobertura horaria de la mesa.", ["administrativos"]),
      A("¿Qué pasó la última vez que tuvo un problema técnico un domingo en la noche?", ["estudiantes"]),
    ],
    evidence: [
      D("Modelo de la mesa de servicio: niveles, base de conocimiento, horarios, ANS", "Dimensionada para la población virtual (incluye franja nocturna)"),
      I("Mesa operando con personal completo y base de conocimiento activa", "Las 2 posiciones cubiertas; horario alineado al estudio virtual"),
      K("Métricas: volumen, tiempo de respuesta (≤ 8 h), resolución en primer contacto", "Medidas contra ANS con informe periódico"),
    ],
    rubric: [
      "Soporte informal por conocidos; sin registro de casos.",
      "Piloto de mesa con personal incompleto y horario de oficina.",
      "Mesa formalizada con ANS, base de conocimiento y cobertura completa.",
      "Servicio medido contra ANS, con franja nocturna para virtuales.",
      "Soporte proactivo: la mesa detecta problemas antes del reporte y alimenta mejoras de plataforma.",
    ],
  },

  "EX-DAT-1": {
    items: [
      L("La información de egresados es confiable, completa y tiene un responsable claro.", ["administrativos"]),
      N("Cobertura de contacto verificado y fecha de la última actualización masiva.", ["administrativos"]),
      V("La entidad «egresado» tiene dueño de dato designado en el programa de gobierno de datos.", ["administrativos"]),
    ],
    evidence: [
      D("Definición de la entidad egresado en el catálogo de datos con dueño y reglas de calidad", "Dueño designado con funciones y descarga"),
      I("Procesos de actualización operando (campañas, integración con OLE, formularios)", "Actualización continua, no solo campañas"),
      K("Indicador de cobertura de contacto con meta (70 %)", "Serie medida trimestralmente"),
    ],
    rubric: [
      "Base dispersa y desactualizada; sin dueño del dato.",
      "Inventario de la base hecho; dueño en designación y cobertura baja.",
      "Dueño designado con reglas de calidad y actualización operando.",
      "Cobertura alta y medida contra meta; dato listo para el CRM.",
      "Dato de egresados vivo e integrado (CRM, bolsa, OLE); segmentación para servicios y filantropía.",
    ],
  },

  "EX-DAT-2": {
    items: [
      L("Los datos internos están organizados según los indicadores de los rankings (Sapiens, Scimago, THE, QS).", ["administrativos", "directivos"]),
      N("Tiempo (semanas-persona) que tomó el último reporte anual a rankings.", ["administrativos"]),
      V("La matriz indicador ↔ fuente de datos está completa y validada.", ["administrativos"]),
    ],
    evidence: [
      D("Matriz indicador↔fuente completa por ranking, con responsable por dato", "Cubre los 4 rankings objetivo, validada por Planeación"),
      I("Cortes de datos producidos con la matriz (no reconstrucción manual)", "Corte trimestral automatizado en el observatorio (i6)"),
      K("Línea base por indicador de ranking con brechas frente a pares", "Alimenta la estrategia de posicionamiento"),
    ],
    rubric: [
      "Cada reporte anual se reconstruye a mano durante semanas.",
      "Matriz indicador↔fuente en borrador; datos aún dispersos.",
      "Matriz completa con cortes regulares en el observatorio.",
      "Cortes automatizados con brechas analizadas frente a pares.",
      "Posicionamiento gestionado: simulación del efecto de decisiones sobre los indicadores de ranking.",
    ],
  },

  "EX-DAT-3": {
    items: [
      L("La ejecución de los convenios se registra de forma estructurada: beneficiarios, recursos y resultados.", ["administrativos"]),
      N("Convenios con reporte estructurado del último trimestre frente al total activo.", ["administrativos"]),
      A("¿Puede decir cuántos beneficiarios tuvo la extensión en Aguachica el año pasado? ¿De dónde saldría el dato?", ["administrativos", "directivos"]),
    ],
    evidence: [
      D("Formato estructurado de reporte por convenio (beneficiarios, recursos, municipio, resultados)", "Adoptado como obligatorio en el procedimiento"),
      I("Reportes trimestrales cargados en la plataforma para los convenios activos", "Cobertura ≥ 90 % de convenios reportando"),
      K("Agregados por municipio y línea publicados (mapa territorial M2)", "El dato agregado sustenta decisiones de presencia territorial"),
    ],
    rubric: [
      "Informes narrativos sin estructura; imposible agregar por municipio.",
      "Formato estructurado diseñado; adopción incipiente.",
      "Reporte estructurado obligatorio con cobertura alta.",
      "Datos agregados por territorio publicados y usados en decisiones.",
      "Impacto territorial de la extensión medido por resultados (no solo actividades) y contrastado con brechas del territorio.",
    ],
  },

  /* ════════ 4.4 ARQUITECTURA EMPRESARIAL Y GOBIERNO DIGITAL ════════ */

  "AR-ORG-1": {
    items: [
      L("El comité de TI gobierna efectivamente el portafolio, la arquitectura y la seguridad.", ["directivos", "administrativos"]),
      N("Sesiones del comité en los últimos 12 meses y decisiones de arquitectura documentadas en actas.", ["administrativos"]),
      V("Toda adquisición de TI pasa por revisión de arquitectura previa.", ["administrativos"]),
    ],
    evidence: [
      D("Reglamento del comité: composición, quórum, calendario, atribuciones sobre compras y arquitectura", "Aprobado y con la revisión de arquitectura como requisito de adquisición"),
      I("Actas de sesiones regulares con decisiones de arquitectura y portafolio", "Sesiona según calendario con decisiones trazables"),
      K("Indicadores de gobierno: % de compras revisadas, decisiones implementadas", "Reporte periódico a la alta dirección"),
    ],
    rubric: [
      "Sin comité o inactivo; cada dependencia compra TI por su cuenta.",
      "Comité existente que sesiona irregularmente y sin actas de decisión.",
      "Comité reglamentado sesionando con calendario y decisiones documentadas.",
      "Gobierno medido: toda compra pasa por arquitectura y las decisiones se auditan.",
      "Gobierno de TI integrado a la estrategia institucional; el portafolio se decide por valor.",
    ],
  },

  "AR-ORG-2": {
    items: [
      L("La institución cuenta con una arquitectura empresarial documentada que guía sus decisiones tecnológicas.", ["directivos", "administrativos"]),
      V("Existen las vistas de negocio, información, aplicaciones y tecnología bajo un método formal (TOGAF ADM).", ["administrativos"]),
      A("Ante un sistema nuevo, ¿contra qué mapa se decide dónde encaja y qué reemplaza?", ["administrativos"]),
    ],
    evidence: [
      D("Documentos de arquitectura: visión, arquitectura de negocio, datos, aplicaciones y tecnología", "Producidos bajo ADM y aprobados por el comité"),
      I("Uso de la arquitectura en decisiones reales (adquisiciones, proyectos, integraciones)", "La arquitectura objetivo guía el portafolio de proyectos"),
      K("Indicadores de avance del roadmap arquitectural (brechas cerradas)", "Seguimiento periódico del plan de transición"),
    ],
    rubric: [
      "Sin arquitectura documentada; cada sistema se adquirió sin visión de conjunto.",
      "Fases preliminares del ADM en ejecución (visión, negocio).",
      "Arquitectura actual y objetivo documentadas en las cuatro capas.",
      "Roadmap de transición en ejecución medida; las decisiones citan la arquitectura.",
      "Arquitectura viva: se actualiza por ciclos y simula el impacto de cambios antes de decidir.",
    ],
  },

  "AR-ORG-3": {
    items: [
      L("Los proyectos de TI se priorizan, siguen y cierran con criterios de valor institucional.", ["directivos", "administrativos"]),
      N("Proyectos de TI del año: presupuesto, % en cronograma y cuántos midieron beneficios post-cierre.", ["administrativos"]),
      A("Del último proyecto de TI cerrado, ¿qué beneficio prometido se verificó después?", ["directivos"]),
    ],
    evidence: [
      D("Metodología de gestión del portafolio de proyectos de TI (priorización, seguimiento, cierre)", "Incluye caso de valor y revisión de beneficios post-cierre"),
      I("Portafolio anual operando con seguimiento regular", "Proyectos priorizados con presupuesto y estado al día"),
      K("Métricas de portafolio: cumplimiento, desviaciones y beneficios realizados", "Revisión de beneficios a los 6 meses del cierre"),
    ],
    rubric: [
      "Proyectos de TI por demanda espontánea, sin priorización ni seguimiento.",
      "Lista anual de proyectos con presupuesto, seguimiento informal.",
      "Portafolio priorizado con seguimiento regular y criterios de valor.",
      "Desempeño del portafolio medido, incluida la revisión de beneficios post-cierre.",
      "Portafolio dirigido por la arquitectura y el plan estratégico; el valor realizado retroalimenta la priorización.",
    ],
  },

  "AR-MIS-1": {
    items: [
      L("Los procesos críticos de la institución están caracterizados y vigentes en el sistema de calidad.", ["administrativos", "directivos"]),
      N("Porcentaje de procesos críticos con caracterización vigente.", ["administrativos"]),
      A("¿Qué proceso crítico opera hoy distinto de como está documentado (o sin documentar)?", ["administrativos"]),
    ],
    evidence: [
      D("Mapa de procesos con caracterizaciones vigentes de los procesos críticos", "Caracterización ≥ 80 % (KPI AR-01) aprobada en el SGC"),
      I("Procesos operando conforme a su caracterización (auditorías internas)", "Sin brechas mayores entre documento y operación"),
      K("Indicador de cobertura de caracterización con meta y ritmo", "Seguimiento del avance por macroproceso"),
    ],
    rubric: [
      "Mapa de procesos desactualizado; minoría de procesos críticos documentados.",
      "Plan de caracterización en marcha con avance parcial (≈ 30 %).",
      "Mayoría de procesos críticos caracterizados y aprobados en el SGC.",
      "Cobertura ≥ 80 % con auditorías que verifican la conformidad.",
      "Procesos gestionados por desempeño: la caracterización incluye indicadores y se optimiza por ciclos.",
    ],
  },

  "AR-MIS-2": {
    items: [
      L("El sistema de gestión de calidad cubre la operación de asignaturas y programas virtuales.", ["administrativos"]),
      V("Los procesos de la línea de apoyo a virtualidad están aprobados en el SGC.", ["administrativos"]),
      A("Si mañana abre la primera cohorte virtual, ¿qué procesos (matrícula, evaluación docente, soporte) la amparan?", ["administrativos", "directivos"]),
    ],
    evidence: [
      D("Caracterización de los procesos de virtualidad: línea de apoyo (8) y despliegue (16, patrón USCO)", "Aprobados en el sistema de calidad, no solo diseñados"),
      I("Procesos operando en los pilotos de virtualización", "La operación piloto sigue los procesos aprobados"),
      K("Indicadores de los procesos de virtualidad (tiempos, satisfacción, conformidad)", "Medidos desde la primera cohorte"),
    ],
    rubric: [
      "El SGC no contempla la virtualidad; una cohorte virtual operaría fuera de proceso.",
      "Procesos de virtualidad caracterizados, en espera de aprobación.",
      "Línea de apoyo aprobada en el SGC y aplicada en pilotos.",
      "Los 24 procesos (apoyo + despliegue) operando con indicadores.",
      "La virtualidad es parte natural del SGC; los procesos se mejoran con datos de cada cohorte.",
    ],
  },

  "AR-MIS-3": {
    items: [
      L("Los cambios de procesos y sistemas se gestionan con método: actores, formación y acompañamiento.", ["administrativos", "docentes"]),
      A("¿Cómo se enteró y se preparó usted para el último sistema o proceso nuevo que le cambió el trabajo?", ["docentes", "administrativos"]),
      V("Las iniciativas tecnológicas del portafolio incluyen plan de gestión del cambio.", ["administrativos"]),
    ],
    evidence: [
      D("Método institucional de gestión del cambio (mapa de actores, plan de adopción, acompañamiento)", "Adoptado como componente obligatorio de las iniciativas"),
      I("Planes de cambio ejecutados en los despliegues recientes", "Más que circulares: formación y acompañamiento verificables"),
      K("Métricas de adopción post-despliegue (uso, satisfacción, resistencia)", "Medidas y usadas para ajustar el acompañamiento"),
    ],
    rubric: [
      "Los despliegues se comunican por circular; la resistencia se descubre tarde.",
      "Conciencia del problema; primeros planes de cambio informales.",
      "Método de gestión del cambio adoptado en las iniciativas del portafolio.",
      "Adopción medida post-despliegue con acompañamiento ajustado por datos.",
      "Cultura de cambio instalada: la organización pide y lidera sus propias transformaciones.",
    ],
  },

  "AR-TEC-1": {
    items: [
      L("La institución conoce sus sistemas de información: estado, soporte, versiones y riesgo.", ["administrativos"]),
      N("Sistemas en el inventario, cuántos sin soporte del fabricante y su plan de reemplazo.", ["administrativos"]),
      V("El inventario de sistemas se actualizó en los últimos 6 meses.", ["administrativos"]),
    ],
    evidence: [
      D("Catálogo de sistemas con atributos de estado, soporte, versión, criticidad y dueño", "Completo (14 sistemas) y actualizado semestralmente"),
      I("Gestión activa de obsolescencia: planes de reemplazo y congelamiento de integraciones en riesgo", "Los 3 sistemas en riesgo tienen decisión documentada"),
      K("Indicador de exposición: % de sistemas críticos con soporte vigente", "Reportado al comité de TI con semáforo"),
    ],
    rubric: [
      "Nadie sabe cuántos sistemas hay ni en qué estado están.",
      "Inventario parcial o desactualizado; la obsolescencia se descubre al fallar.",
      "Catálogo completo y actualizado con criticidad y riesgo por sistema.",
      "Obsolescencia gestionada: planes de reemplazo presupuestados y monitoreados.",
      "Portafolio de aplicaciones optimizado por valor y costo total; racionalización continua.",
    ],
  },

  "AR-TEC-2": {
    items: [
      L("Los sistemas críticos intercambian datos por servicios, sin archivos planos ni redigitación.", ["administrativos"]),
      N("Sistemas integrados por servicios frente al total, y flujos que aún son manuales.", ["administrativos"]),
      A("¿Qué información digitó dos veces su equipo esta semana por falta de integración?", ["administrativos"]),
    ],
    evidence: [
      D("Plan de interoperabilidad: bus de servicios, contratos de datos, prioridades de integración", "Aprobado y con financiación resuelta"),
      I("Integraciones por servicios operando entre sistemas críticos", "≥ 60 % de los sistemas críticos integrados"),
      K("Indicador de integración (KPI AR-02) y reducción de redigitación", "Serie medida con meta anual"),
    ],
    rubric: [
      "Islas de información: intercambio por archivos y redigitación generalizada.",
      "Plan de interoperabilidad definido; pocas integraciones puntuales (5 de 14).",
      "Bus o plataforma de integración operando con los flujos prioritarios.",
      "Mayoría de sistemas críticos integrados; redigitación medida a la baja.",
      "Interoperabilidad plena con datos maestros únicos; nuevas integraciones en días, no meses.",
    ],
  },

  "AR-TEC-3": {
    items: [
      L("La información institucional está protegida: accesos, respaldos, continuidad y datos personales.", ["administrativos", "directivos"]),
      V("Existe un SGSI formal con análisis de riesgos vigente y plan de continuidad probado.", ["administrativos"]),
      A("Si el LMS falla el día del examen final, ¿cuál es el plan y cuándo se probó por última vez?", ["administrativos"]),
    ],
    evidence: [
      D("SGSI documentado: política, análisis de riesgos, controles ISO 27001, plan de continuidad", "Alcance sobre los sistemas misionales, aprobado"),
      I("Controles operando: gestión de accesos, respaldos verificados, pruebas de continuidad", "Plan de continuidad del LMS probado antes de la matrícula virtual"),
      K("Indicadores de seguridad: incidentes, tiempo de recuperación, cumplimiento de controles", "Tablero de riesgos revisado por el comité"),
    ],
    rubric: [
      "Seguridad reactiva: respaldos informales y accesos sin gestión.",
      "Controles básicos (respaldo, accesos) sin SGSI ni análisis de riesgos.",
      "SGSI formulado con análisis de riesgos y controles priorizados en operación.",
      "Continuidad probada y seguridad medida con indicadores.",
      "Seguridad como capacidad institucional: mejora continua, cultura extendida y respuesta ensayada.",
    ],
  },

  "AR-DAT-1": {
    items: [
      L("Los datos institucionales tienen gobierno: comité, catálogo, dueños designados y reglas de calidad.", ["administrativos", "directivos"]),
      N("Entidades en el catálogo de datos maestros y % con dueño designado y activo.", ["administrativos"]),
      A("Como dueño de dato, ¿qué tiempo y herramientas tiene para ejercer el rol?", ["administrativos"]),
    ],
    evidence: [
      D("Programa de gobierno de datos: comité, catálogo de entidades, roles y reglas de calidad (DAMA)", "Catálogo de 21 entidades con marco de roles aprobado"),
      I("Dueños de dato ejerciendo el rol con dedicación asignada", "Designación ≥ 80 % y descarga horaria efectiva"),
      K("Indicadores de gobierno: cobertura de dueños, reglas activas, incidencias resueltas", "Reportados al comité de datos"),
    ],
    rubric: [
      "Sin gobierno de datos: cada sistema define y duplica sus datos.",
      "Programa iniciado: comité y catálogo creados, dueños parciales sin dedicación.",
      "Dueños designados con dedicación y reglas de calidad operando.",
      "Gobierno medido: calidad por entidad con seguimiento y mejora.",
      "Datos como activo estratégico: ciclo de vida gestionado y decisiones automatizadas confiables.",
    ],
  },

  "AR-DAT-2": {
    items: [
      L("El reporte oficial (SNIES) refleja fielmente la realidad institucional, sin inconsistencias.", ["administrativos", "directivos"]),
      N("Inconsistencias críticas abiertas del diagnóstico de calidad y su plan de remediación.", ["administrativos"]),
      A("¿Qué decisión o ranking se ha visto afectado por un dato oficial errado?", ["directivos"]),
    ],
    evidence: [
      D("Diagnóstico de calidad de datos SNIES con inventario de inconsistencias y plan de remediación", "12 inconsistencias tipificadas con responsable por entidad"),
      I("Remediación en ejecución con correcciones aplicadas al reporte", "Inconsistencias críticas cerradas antes del siguiente corte"),
      K("Indicador de calidad del dato oficial (inconsistencias por corte, tendencia)", "Medido en cada reporte con meta cero críticas"),
    ],
    rubric: [
      "Inconsistencias desconocidas o ignoradas; el dato oficial no es confiable.",
      "Diagnóstico hecho: inconsistencias identificadas, remediación sin arrancar.",
      "Plan de remediación en ejecución con responsables por entidad.",
      "Cortes recientes limpios; la calidad se controla antes de cada cargue.",
      "Validación automática continua contra reglas; el dato oficial es fuente confiable para rankings y decisiones.",
    ],
  },

  "AR-DAT-3": {
    items: [
      L("Los directivos deciden con tableros integrados (matrícula, deserción, finanzas, desempeño).", ["directivos"]),
      A("Para su última decisión importante, ¿qué datos necesitó y cuánto tardaron en llegarle?", ["directivos"]),
      V("Existe al menos un tablero directivo transversal con datos integrados de más de una fuente.", ["administrativos"]),
    ],
    evidence: [
      D("Modelo de analítica institucional: indicadores directivos, fuentes, gobierno de tableros", "Definido con la PGTD como tablero transversal"),
      I("Tableros operando con datos integrados y actualización automática", "Consumidos regularmente por el equipo directivo"),
      K("Uso de la analítica en decisiones documentadas (consejos, comités)", "Decisiones citan los tableros como fuente"),
    ],
    rubric: [
      "Informes directivos armados a mano combinando fuentes; días de espera por un dato.",
      "Primer tablero transversal operando (PGTD) con fuentes aún estáticas.",
      "Tableros directivos con fuentes integradas y actualización regular.",
      "Analítica usada sistemáticamente en los órganos de decisión.",
      "Cultura de decisión por datos: analítica prescriptiva y simulación de escenarios institucionales.",
    ],
  },
};

/* ═══ Consultas ═══ */

export const protocolOf = (varId: string): VariableProtocol | undefined => PROTOCOLS[varId];

export const protocolStats = () => {
  const ids = Object.keys(PROTOCOLS);
  return {
    protocols: ids.length,
    items: ids.reduce((a, id) => a + PROTOCOLS[id].items.length, 0),
    evidenceRequests: ids.reduce((a, id) => a + PROTOCOLS[id].evidence.length, 0),
  };
};

