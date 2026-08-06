// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Instrumento de diagnóstico detallado.
// Cada celda línea × dimensión se mide con variables (3–4 por celda, 52 en
// total). Cada variable declara: qué mide, contra qué referente se evalúa
// (eMM, Decreto 1330, CNA, TOGAF, DAMA, INTEF, ISO 27001, CMI), su valor y
// meta en la escala 1–5, el hallazgo del diagnóstico, la recomendación, la
// evidencia que la soporta y el responsable de la información.
//
// Regla de consistencia (verificada por tests): el promedio simple de las
// variables de una celda ES el valor de la celda en la medición vigente (A2).
// Valores ilustrativos — la medición real se produce en las Fases 0 a 2.
// ─────────────────────────────────────────────────────────────────────────────

export type Frame =
  | "eMM"            // e-Learning Maturity Model (Marshall)
  | "Decreto 1330"   // registros calificados MEN
  | "CNA"            // acreditación / autoevaluación
  | "TOGAF 10"       // arquitectura empresarial
  | "DAMA-DMBOK"     // gobierno de datos
  | "INTEF"          // competencia digital docente
  | "ISO 27001"      // seguridad de la información
  | "CMI";           // cuadro de mando integral (Kaplan-Norton)

export type D7 = "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7";

export type Variable = {
  id: string;                // p.ej. AV-ORG-1
  line: number;              // 1..4
  dimension: string;         // organizacional | misional | tecnologica | datos
  d7: D7;                    // proyección a la dimensión transversal AlgoritmoT-IES
  ai?: boolean;              // variable del componente AIQ-IES
  name: string;
  desc: string;              // qué mide exactamente
  frame: Frame;
  value: number;             // 1..5 (nivel verificado, medición vigente A2)
  target: number;            // meta a 24 meses
  // Metodología AlgoritmoT-IES (deep-research-report):
  // percepción Likert 1–5 del autodiagnóstico; evidencia D/I/K en 0–4.
  perception: number;
  evidence: { d: number; i: number; k: number };
  ownerId: string;           // responsable de la información (directorio)
  evidenceIds: string[];     // EV-xx del catálogo
  hallazgo: string;          // el hecho encontrado
  recomendacion: string;     // la acción que cierra la brecha
};

export const VARIABLES: Variable[] = [
  /* ════════ 4.1 ACADEMIA Y VIRTUALIDAD ════════ */

  // ── organizacional (celda = 2) ──
  {
    id: "AV-ORG-1", line: 1, dimension: "organizacional", d7: "D1",
    perception: 3, evidence: { d: 2, i: 0, k: 0 },
    name: "Política institucional de educación digital",
    desc: "Existencia y vigencia de una política o lineamiento institucional que defina la educación digital, sus modalidades y su gobierno.",
    frame: "CNA", value: 2, target: 4, ownerId: "R01",
    evidenceIds: ["EV-04", "EV-16"],
    hallazgo: "Existe un acuerdo de creación de la línea de virtualidad en trámite, pero no una política sancionada: las decisiones dependen de resoluciones puntuales.",
    recomendacion: "Sancionar la política de educación digital en Consejo Superior antes de radicar programas virtuales (iniciativa i10).",
  },
  {
    id: "AV-ORG-2", line: 1, dimension: "organizacional", d7: "D1",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Gestión de registros calificados para nuevas modalidades",
    desc: "Capacidad institucional para tramitar y sostener registros calificados en modalidad virtual e híbrida según las condiciones del Decreto 1330 de 2019.",
    frame: "Decreto 1330", value: 2, target: 4, ownerId: "R09",
    evidenceIds: ["EV-04"],
    hallazgo: "La Universidad domina el trámite presencial, pero ningún registro vigente incluye modalidad virtual; 6 registros vencen antes de 2028 y ninguno se renovará con componente digital si no se ajusta el proceso.",
    recomendacion: "Incorporar las condiciones de calidad para virtualidad en el procedimiento de registro y priorizar las renovaciones 2027 como pilotos.",
  },
  {
    id: "AV-ORG-3", line: 1, dimension: "organizacional", d7: "D1",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Estructura organizacional para la virtualidad",
    desc: "Existencia de una unidad con mandato, equipo y presupuesto para operar la educación digital (criterio eMM: Organización).",
    frame: "eMM", value: 1, target: 4, ownerId: "R10",
    evidenceIds: ["EV-16"],
    hallazgo: "No existe unidad responsable: las funciones están dispersas entre Vicerrectoría Académica, TI y docentes voluntarios. El estudio técnico de la Unidad de Educación Digital está aprobado pero sin acuerdo de creación.",
    recomendacion: "Crear la Unidad de Educación Digital con dependencia de Vicerrectoría Académica y línea directa a Rectoría (iniciativa i11).",
  },
  {
    id: "AV-ORG-4", line: 1, dimension: "organizacional", d7: "D1",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Gestión del ciclo de vida del portafolio",
    desc: "Prácticas de creación, seguimiento y cierre de programas con criterios de demanda, sostenibilidad y pertinencia.",
    frame: "CMI", value: 3, target: 4, ownerId: "R03",
    evidenceIds: ["EV-15"],
    hallazgo: "El portafolio (33 programas) se revisa anualmente, pero sin datos de demanda territorial ni de punto de equilibrio: 12 programas operan bajo equilibrio sin plan de intervención.",
    recomendacion: "Conectar el modelo de costos (i12) y el análisis territorial (M2) a la revisión anual del portafolio.",
  },

  // ── misional / pedagógica (celda = 3) ──
  {
    id: "AV-MIS-1", line: 1, dimension: "misional", d7: "D2", ai: true,
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Formación y capacitación docente digital",
    desc: "Ruta institucional de desarrollo de competencia digital docente por niveles, con certificación y reconocimiento (marco INTEF).",
    frame: "INTEF", value: 3, target: 4, ownerId: "R01",
    evidenceIds: ["EV-20"],
    hallazgo: "La ruta por niveles existe y certificó 178 docentes (26 % de la planta), pero la participación cae al 61 % en semanas de parciales y no hay reconocimiento en la carrera docente.",
    recomendacion: "Gestionar el acuerdo de reconocimiento en el estatuto docente y programar cohortes fuera de los picos académicos (iniciativa i4).",
  },
  {
    id: "AV-MIS-2", line: 1, dimension: "misional", d7: "D3",
    perception: 5, evidence: { d: 2, i: 2, k: 1 },
    name: "Diseño instruccional estandarizado",
    desc: "Estandarización de diseños por tipo de curso y número de créditos, que permita proyectar esfuerzos, costos y tiempos de producción.",
    frame: "eMM", value: 3, target: 4, ownerId: "R07",
    evidenceIds: ["EV-17"],
    hallazgo: "La plantilla institucional de aula está aprobada y piloteada (8 cursos, satisfacción 4,2/5), pero solo cubre el aula: no hay estándar de diseño instruccional por tipo de curso.",
    recomendacion: "Extender el estándar de aula a un catálogo de diseños instruccionales por tipología (teórico, teórico-práctico, práctico).",
  },
  {
    id: "AV-MIS-3", line: 1, dimension: "misional", d7: "D3",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Lineamientos curriculares para la virtualidad",
    desc: "Adaptación de los lineamientos curriculares institucionales a las modalidades virtual e híbrida (unidades, prerrequisitos, interacción).",
    frame: "CNA", value: 2, target: 4, ownerId: "R01",
    evidenceIds: ["EV-02"],
    hallazgo: "Los lineamientos vigentes son de modalidad presencial; el borrador de adaptación lleva dos comités sin aprobarse.",
    recomendacion: "Aprobar los lineamientos en el próximo comité curricular ampliado; son prerrequisito del rediseño microcurricular del componente básico (i9).",
  },
  {
    id: "AV-MIS-4", line: 1, dimension: "misional", d7: "D3", ai: true,
    perception: 4, evidence: { d: 3, i: 3, k: 2 },
    name: "Evaluación de aprendizajes en entornos digitales",
    desc: "Prácticas y herramientas de evaluación formativa y sumativa mediadas por plataforma, con integridad académica.",
    frame: "eMM", value: 4, target: 4, ownerId: "R01",
    evidenceIds: ["EV-17"],
    hallazgo: "Fortaleza: el piloto del aula estándar incluyó rúbricas y banco de preguntas; los docentes del piloto reportan la evaluación como el componente mejor resuelto.",
    recomendacion: "Documentar la práctica del piloto como estándar institucional y sostenerla en el despliegue.",
  },

  // ── tecnológica (celda = 2) ──
  {
    id: "AV-TEC-1", line: 1, dimension: "tecnologica", d7: "D5",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Plataforma LMS institucional",
    desc: "Disponibilidad, adopción y gestión del sistema de gestión del aprendizaje como núcleo de los recursos tecnológicos para aprender.",
    frame: "eMM", value: 3, target: 4, ownerId: "R04",
    evidenceIds: ["EV-03", "EV-18"],
    hallazgo: "El LMS opera con 99,1 % de disponibilidad y 45 % de cursos con aula activa, pero la administración depende de una sola persona y no hay ambiente de pruebas.",
    recomendacion: "Formalizar el rol de administración LMS (2 posiciones) y habilitar ambiente de pruebas para actualizaciones.",
  },
  {
    id: "AV-TEC-2", line: 1, dimension: "tecnologica", d7: "D5",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Capacidad de producción de contenidos",
    desc: "Equipo, estudio y flujo de producción de recursos educativos digitales (video, interactivos, OVA).",
    frame: "eMM", value: 2, target: 4, ownerId: "R07",
    evidenceIds: ["EV-19"],
    hallazgo: "La producción del primer paquete de cursos avanza al 60 % con un equipo incompleto: la vacante de diseñador instruccional frena el flujo (cuello de botella verificado en i9).",
    recomendacion: "Cerrar el concurso de la vacante y definir el modelo de producción (in-house vs. contratado) con cronograma anual.",
  },
  {
    id: "AV-TEC-3", line: 1, dimension: "tecnologica", d7: "D5",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Conectividad y equipos en sedes",
    desc: "Cobertura de red, aulas con equipos funcionales y soporte en Valledupar y Aguachica.",
    frame: "eMM", value: 2, target: 3, ownerId: "R04",
    evidenceIds: ["EV-13"],
    hallazgo: "Valledupar tiene conectividad estable; Aguachica reporta intermitencia en horario nocturno — crítico porque es la sede con mayor potencial virtual (subregión sur).",
    recomendacion: "Redundancia de canal en Aguachica antes de abrir los programas virtuales del sur (prerrequisito de i7).",
  },
  {
    id: "AV-TEC-4", line: 1, dimension: "tecnologica", d7: "D5", ai: true,
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Licencias de software educativo",
    desc: "Portafolio de licencias (laboratorios virtuales, simuladores, herramientas de autor) y su gestión de renovación.",
    frame: "Decreto 1330", value: 1, target: 3, ownerId: "R04",
    evidenceIds: ["EV-13"],
    hallazgo: "No existe un portafolio institucional de licencias educativas: cada facultad compra por su cuenta, hay duplicidades y dos vencimientos sin renovar en 2026.",
    recomendacion: "Centralizar el portafolio de licencias en la Unidad de Educación Digital con matriz de cobertura por programa.",
  },

  // ── datos e información (celda = 2) ──
  {
    id: "AV-DAT-1", line: 1, dimension: "datos", d7: "D4", ai: true,
    perception: 3, evidence: { d: 0, i: 0, k: 0 },
    name: "Analítica de aprendizaje",
    desc: "Capacidad de recolectar y usar datos de actividad de plataforma para intervenir el riesgo académico (learning analytics).",
    frame: "eMM", value: 1, target: 3, ownerId: "R07",
    evidenceIds: ["EV-19"],
    hallazgo: "Los datos del LMS existen pero no se explotan: no hay tableros por decanatura ni alertas tempranas de inactividad estudiantil.",
    recomendacion: "Publicar el tablero de actividad de aulas (acción pendiente de i1) y pilotear alertas de inactividad en el componente básico.",
  },
  {
    id: "AV-DAT-2", line: 1, dimension: "datos", d7: "D4",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Información del portafolio y la oferta",
    desc: "Consistencia y oportunidad de los datos de programas, cupos, matrícula y modalidad que alimentan SNIES y las decisiones de oferta.",
    frame: "Decreto 1330", value: 3, target: 3, ownerId: "R03",
    evidenceIds: ["EV-05"],
    hallazgo: "El registro académico reporta a SNIES en los plazos; la completitud del reporte de matrícula es del 97 %.",
    recomendacion: "Sostener la práctica y cerrar el 3 % de incompletitud concentrado en educación continua.",
  },
  {
    id: "AV-DAT-3", line: 1, dimension: "datos", d7: "D4",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Trazabilidad del estudiante entre sistemas",
    desc: "Capacidad de seguir al estudiante de la inscripción al grado sin redigitación entre admisiones, registro y LMS.",
    frame: "DAMA-DMBOK", value: 2, target: 3, ownerId: "R04",
    evidenceIds: ["EV-30"],
    hallazgo: "La integración LMS ↔ registro académico está en pruebas; hoy la matrícula a cursos virtuales se redigita, con 40+ inconsistencias por periodo.",
    recomendacion: "Pasar la integración a producción y eliminar la redigitación (hito de i5 adelantado al LMS).",
  },

  /* ════════ 4.2 INVESTIGACIÓN Y CTeI ════════ */

  // ── organizacional (celda = 2) ──
  {
    id: "IN-ORG-1", line: 2, dimension: "organizacional", d7: "D1",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Gobernanza de la investigación digital",
    desc: "Políticas y estructuras que orientan la investigación mediada por tecnología y la agenda de CTeI digital.",
    frame: "CNA", value: 2, target: 3, ownerId: "R02",
    evidenceIds: ["EV-08"],
    hallazgo: "El comité de investigaciones priorizó la agenda CTeI, pero no existen lineamientos para investigación en/a través de entornos digitales.",
    recomendacion: "Formular el lineamiento de investigación digital como parte del funcionamiento operativo de la función sustantiva.",
  },
  {
    id: "IN-ORG-2", line: 2, dimension: "organizacional", d7: "D7",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Semilleros y líneas en educación digital",
    desc: "Existencia de líneas, semilleros y proyectos asociados a la transformación digital educativa.",
    frame: "CNA", value: 3, target: 4, ownerId: "R02",
    evidenceIds: ["EV-24"],
    hallazgo: "Se aprobaron 2 líneas y 3 semilleros en educación digital (dic-2026); aún sin proyectos financiados.",
    recomendacion: "Presentar al menos un proyecto a la convocatoria interna 2027 y uno a MinCiencias.",
  },
  {
    id: "IN-ORG-3", line: 2, dimension: "organizacional", d7: "D2",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Capacidad del talento investigador",
    desc: "Suficiencia y estabilidad del talento humano dedicado a investigación (TCE, formación doctoral, permanencia).",
    frame: "CNA", value: 1, target: 2, ownerId: "R02",
    evidenceIds: ["EV-07"],
    hallazgo: "La salida de dos investigadores explicó la caída de producción 2025; no hay plan de retención ni relevo generacional documentado.",
    recomendacion: "Plan de relevo con jóvenes investigadores vinculados a los semilleros digitales.",
  },

  // ── misional (celda = 2) ──
  {
    id: "IN-MIS-1", line: 2, dimension: "misional", d7: "D4",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Prácticas de ciencia abierta",
    desc: "Adopción de acceso abierto, datos abiertos y licenciamiento en la producción académica.",
    frame: "CNA", value: 2, target: 4, ownerId: "R05",
    evidenceIds: ["EV-21", "EV-22"],
    hallazgo: "44 % de la producción está en acceso abierto y el repositorio opera, pero la política de autoarchivo sigue en borrador: el depósito depende de la voluntad del autor.",
    recomendacion: "Aprobar la política de acceso abierto (hito de i3, mar-2027) y hacer el depósito condición del apoyo a publicación.",
  },
  {
    id: "IN-MIS-2", line: 2, dimension: "misional", d7: "D3",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Investigación formativa en entornos virtuales",
    desc: "Promoción de la investigación formativa a través de entornos virtuales de aprendizaje en pregrado.",
    frame: "eMM", value: 2, target: 4, ownerId: "R02",
    evidenceIds: ["EV-24"],
    hallazgo: "Experiencias aisladas en dos facultades; sin estrategia transversal ni presencia en el componente básico.",
    recomendacion: "Incluir un módulo de investigación formativa en los cursos transversales virtualizados (i9).",
  },
  {
    id: "IN-MIS-3", line: 2, dimension: "misional", d7: "D7",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Divulgación científica mediada por TIC",
    desc: "Eventos, comunidades y canales digitales de divulgación del conocimiento producido.",
    frame: "CMI", value: 2, target: 4, ownerId: "R02",
    evidenceIds: ["EV-24"],
    hallazgo: "Un evento anual híbrido; las revistas institucionales no tienen flujo OJS completo ni indexación.",
    recomendacion: "Migrar las dos revistas a OJS con DOI y calendario editorial; conectarlas al repositorio.",
  },

  // ── tecnológica (celda = 3) ──
  {
    id: "IN-TEC-1", line: 2, dimension: "tecnologica", d7: "D5",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Plataforma de gestión de la investigación",
    desc: "Sistema para gestionar convocatorias, proyectos, productos y grupos.",
    frame: "eMM", value: 3, target: 4, ownerId: "R02",
    evidenceIds: ["EV-06"],
    hallazgo: "La plataforma cubre convocatorias y proyectos; los productos se registran manualmente y no dialogan con CvLAC.",
    recomendacion: "Habilitar el módulo de productos e integrarlo al flujo de actualización CvLAC.",
  },
  {
    id: "IN-TEC-2", line: 2, dimension: "tecnologica", d7: "D5",
    perception: 2, evidence: { d: 3, i: 3, k: 2 },
    name: "Repositorio institucional",
    desc: "Repositorio en producción con estándares de metadatos e interoperabilidad (OAI-PMH).",
    frame: "DAMA-DMBOK", value: 4, target: 4, ownerId: "R05",
    evidenceIds: ["EV-22", "EV-23"],
    hallazgo: "Fortaleza: DSpace en producción con 3.800 objetos migrados y 92 % de metadatos válidos; cosecha OAI-PMH pendiente.",
    recomendacion: "Activar la cosecha hacia Google Scholar y La Referencia (acción final de i3).",
  },
  {
    id: "IN-TEC-3", line: 2, dimension: "tecnologica", d7: "D4", ai: true,
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Herramientas de análisis y bibliometría",
    desc: "Acceso y uso de herramientas de análisis bibliométrico y vigilancia tecnológica.",
    frame: "CMI", value: 2, target: 4, ownerId: "R05",
    evidenceIds: ["EV-06"],
    hallazgo: "Acceso a Scopus por suscripción de consorcio, sin licencias de herramientas de análisis; los informes bibliométricos se arman a mano.",
    recomendacion: "Incluir la bibliometría en los servicios CRAI (iniciativa i14).",
  },

  // ── datos (celda = 1) ──
  {
    id: "IN-DAT-1", line: 2, dimension: "datos", d7: "D4",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Actualización de CvLAC / GrupLAC",
    desc: "Vigencia de las hojas de vida y grupos en las plataformas de MinCiencias, base de la medición nacional.",
    frame: "CNA", value: 1, target: 3, ownerId: "R02",
    evidenceIds: ["EV-07"],
    hallazgo: "43 % de los CvLAC sin actualizar en el último año; dos grupos en riesgo de descenso de categoría en la próxima medición.",
    recomendacion: "Jornadas de actualización asistida por facultad antes de la convocatoria de medición de grupos.",
  },
  {
    id: "IN-DAT-2", line: 2, dimension: "datos", d7: "D5",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Interoperabilidad producción ↔ repositorio",
    desc: "Flujo automático entre el registro de productos, el repositorio y los perfiles de investigador.",
    frame: "DAMA-DMBOK", value: 1, target: 3, ownerId: "R05",
    evidenceIds: ["EV-23"],
    hallazgo: "Cada producto se registra hasta en tres sistemas sin sincronización; el esfuerzo duplica horas de investigadores.",
    recomendacion: "Incluir el flujo investigación→repositorio en el bus de interoperabilidad (i5).",
  },
  {
    id: "IN-DAT-3", line: 2, dimension: "datos", d7: "D4", ai: true,
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Métricas de visibilidad científica",
    desc: "Medición sistemática de citación, altmetría y posicionamiento de la producción institucional.",
    frame: "CMI", value: 1, target: 3, ownerId: "R03",
    evidenceIds: ["EV-27"],
    hallazgo: "No hay línea base de citación ni seguimiento de visibilidad; los datos de rankings se reconstruyen a mano cada año.",
    recomendacion: "Incluir las métricas de visibilidad en el observatorio de rankings (i6).",
  },

  /* ════════ 4.3 EXTENSIÓN, RELACIONAMIENTO Y RANKINGS ════════ */

  // ── organizacional (celda = 3) ──
  {
    id: "EX-ORG-1", line: 3, dimension: "organizacional", d7: "D3",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Gestión del portafolio de convenios",
    desc: "Ciclo de vida de convenios de extensión: suscripción, ejecución verificable y evaluación de resultados.",
    frame: "CMI", value: 3, target: 4, ownerId: "R08",
    evidenceIds: ["EV-09", "EV-28"],
    hallazgo: "61 convenios activos con ejecución verificable (subió de 48); el convenio con la alcaldía de Aguachica abre la puerta territorial del sur.",
    recomendacion: "Asociar cada convenio a indicadores de resultado y reportarlo trimestralmente en la plataforma.",
  },
  {
    id: "EX-ORG-2", line: 3, dimension: "organizacional", d7: "D1",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Procesos de autoevaluación institucional",
    desc: "Madurez del ciclo de autoevaluación (CNA): periodicidad, participación, planes de mejoramiento con seguimiento.",
    frame: "CNA", value: 3, target: 4, ownerId: "R09",
    evidenceIds: ["EV-11", "EV-15"],
    hallazgo: "La autoevaluación opera con periodicidad y participación (encuesta 2026-1 aplicada), pero los planes de mejoramiento viven en actas: no hay seguimiento sistemático de sus acciones.",
    recomendacion: "Cargar los planes de mejoramiento como iniciativas de la PGTD para heredar seguimiento, presupuesto y factores de éxito.",
  },
  {
    id: "EX-ORG-3", line: 3, dimension: "organizacional", d7: "D6",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Relacionamiento con egresados",
    desc: "Estrategia y canales de vínculo con egresados: bolsa de empleo, formación continua, participación institucional.",
    frame: "CNA", value: 2, target: 4, ownerId: "R08",
    evidenceIds: ["EV-10"],
    hallazgo: "La cobertura de contacto de la base de egresados es del 38 %: la mayoría de la información de empleabilidad proviene solo del OLE.",
    recomendacion: "Campaña de actualización de datos ligada a beneficios (carné, descuentos en posgrados) antes del CRM (i13).",
  },
  {
    id: "EX-ORG-4", line: 3, dimension: "organizacional", d7: "D7",
    perception: 4, evidence: { d: 3, i: 3, k: 2 },
    name: "Articulación con la educación media y el territorio",
    desc: "Programas de articulación con colegios y actores territoriales como canal de cobertura.",
    frame: "CMI", value: 4, target: 4, ownerId: "R08",
    evidenceIds: ["EV-28"],
    hallazgo: "Fortaleza: la articulación con la media opera en 14 municipios y es la vía natural para pilotear cursos virtuales homologables.",
    recomendacion: "Usar la articulación como canal de los cursos transversales virtualizados (i9) en el sur.",
  },

  // ── misional (celda = 2) ──
  {
    id: "EX-MIS-1", line: 3, dimension: "misional", d7: "D3",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Oferta de educación continua digital",
    desc: "Portafolio de cursos, diplomados y certificaciones en modalidad virtual o híbrida.",
    frame: "CMI", value: 2, target: 3, ownerId: "R08",
    evidenceIds: ["EV-09"],
    hallazgo: "La educación continua es presencial en un 90 %; no hay catálogo digital ni pasarela de pago en línea.",
    recomendacion: "Lanzar un catálogo digital con 5 diplomados híbridos y matrícula en línea (ingresos: KPI SO-01).",
  },
  {
    id: "EX-MIS-2", line: 3, dimension: "misional", d7: "D6",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Proyección social mediada por TIC",
    desc: "Extensión de los servicios de proyección social (consultorios, unidades de atención) a través de canales digitales.",
    frame: "CMI", value: 2, target: 3, ownerId: "R08",
    evidenceIds: ["EV-09"],
    hallazgo: "Los consultorios (jurídico, empresarial) atienden solo presencialmente; la demanda del sur queda desatendida.",
    recomendacion: "Habilitar atención virtual de consultorios con agenda en línea, priorizando Aguachica.",
  },
  {
    id: "EX-MIS-3", line: 3, dimension: "misional", d7: "D7",
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Emprendimiento vía canales digitales",
    desc: "Programas de emprendimiento e innovación soportados en plataformas y comunidades digitales.",
    frame: "CMI", value: 2, target: 3, ownerId: "R08",
    evidenceIds: ["EV-09"],
    hallazgo: "El centro de emprendimiento opera talleres presenciales; sin oferta digital ni vínculo con la agenda de economía creativa regional.",
    recomendacion: "Programa de emprendimiento digital conectado a los convenios territoriales.",
  },

  // ── tecnológica (celda = 2) ──
  {
    id: "EX-TEC-1", line: 3, dimension: "tecnologica", d7: "D6", ai: true,
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Canales de atención al interesado y estudiante",
    desc: "Sistematización de los momentos de contacto: formularios, chat, línea de WhatsApp, punto de atención virtual.",
    frame: "eMM", value: 2, target: 4, ownerId: "R06",
    evidenceIds: ["EV-25", "EV-26"],
    hallazgo: "El mapa de experiencia identificó 14 momentos de contacto; solo 5 tienen canal digital y ninguno tiene acuerdo de nivel de servicio publicado.",
    recomendacion: "Publicar los ANS y abrir la mesa de ayuda (hito de i8, mar-2027).",
  },
  {
    id: "EX-TEC-2", line: 3, dimension: "tecnologica", d7: "D5",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Portal institucional y presencia web",
    desc: "El sitio web como punto único de acceso a servicios académicos y de extensión.",
    frame: "eMM", value: 3, target: 3, ownerId: "R04",
    evidenceIds: ["EV-13"],
    hallazgo: "El portal es informativo y estable, pero los trámites siguen fuera de línea (formularios PDF).",
    recomendacion: "Priorizar los 10 trámites más demandados para virtualización end-to-end.",
  },
  {
    id: "EX-TEC-3", line: 3, dimension: "tecnologica", d7: "D6",
    perception: 1, evidence: { d: 1, i: 1, k: 0 },
    name: "Mesa de ayuda y soporte al usuario",
    desc: "Mesa de servicio con base de conocimiento para estudiantes y docentes-tutores.",
    frame: "eMM", value: 1, target: 3, ownerId: "R06",
    evidenceIds: ["EV-26"],
    hallazgo: "El piloto procesó 120 tickets con tiempo medio de respuesta de 9 h, pero opera con 1 de 2 posiciones y sin horario nocturno — cuando estudian los virtuales.",
    recomendacion: "Cubrir la segunda posición con franja nocturna antes de abrir la matrícula virtual.",
  },

  // ── datos (celda = 1) ──
  {
    id: "EX-DAT-1", line: 3, dimension: "datos", d7: "D4",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Base de datos de egresados",
    desc: "Calidad, cobertura y actualización de la información de egresados.",
    frame: "DAMA-DMBOK", value: 1, target: 3, ownerId: "R08",
    evidenceIds: ["EV-10"],
    hallazgo: "38 % de cobertura de contacto; sin dueño de dato designado para la entidad «egresado».",
    recomendacion: "Designar dueño de dato de egresados en el programa de gobierno (i2) y meta de cobertura 70 %.",
  },
  {
    id: "EX-DAT-2", line: 3, dimension: "datos", d7: "D4", ai: true,
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Línea base de indicadores de rankings",
    desc: "Datos internos organizados según los indicadores de Sapiens, Scimago, THE Impact y QS.",
    frame: "CMI", value: 1, target: 3, ownerId: "R03",
    evidenceIds: ["EV-27"],
    hallazgo: "La matriz indicador↔fuente está en borrador: cada reporte anual a rankings se reconstruye manualmente en ~3 semanas.",
    recomendacion: "Completar la matriz y automatizar el corte trimestral en el observatorio (i6).",
  },
  {
    id: "EX-DAT-3", line: 3, dimension: "datos", d7: "D4",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Seguimiento de convenios con datos",
    desc: "Registro estructurado de ejecución, beneficiarios y resultados por convenio.",
    frame: "CMI", value: 1, target: 3, ownerId: "R08",
    evidenceIds: ["EV-09"],
    hallazgo: "La ejecución de convenios se reporta en informes narrativos sin estructura: imposible agregar beneficiarios o recursos por municipio.",
    recomendacion: "Formato estructurado de reporte trimestral por convenio, cargado a la plataforma.",
  },

  /* ════════ 4.4 ARQUITECTURA EMPRESARIAL Y GOBIERNO DIGITAL ════════ */

  // ── organizacional (celda = 2) ──
  {
    id: "AR-ORG-1", line: 4, dimension: "organizacional", d7: "D1", ai: true,
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Gobierno de TI",
    desc: "Comité de TI con mandato sobre portafolio, arquitectura y seguridad; decisiones documentadas.",
    frame: "TOGAF 10", value: 2, target: 4, ownerId: "R04",
    evidenceIds: ["EV-13"],
    hallazgo: "El comité TIC existe pero sesiona irregularmente y sin actas de decisión de arquitectura; las compras de TI no pasan por revisión de arquitectura.",
    recomendacion: "Reglamentar el comité con calendario, quórum y revisión de arquitectura previa a toda adquisición.",
  },
  {
    id: "AR-ORG-2", line: 4, dimension: "organizacional", d7: "D5",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Arquitectura empresarial documentada",
    desc: "Existencia de la arquitectura institucional (negocio, información, aplicaciones, tecnología) bajo un método formal (TOGAF ADM).",
    frame: "TOGAF 10", value: 1, target: 4, ownerId: "R03",
    evidenceIds: ["EV-15"],
    hallazgo: "No existe arquitectura documentada: el mapa de procesos vigente no tiene vista de aplicaciones ni de datos asociada. Cada sistema se adquirió sin visión de conjunto.",
    recomendacion: "Ejecutar las fases Preliminar, Visión y Negocio del ADM durante la Fase 3 de la consultoría (entregable comprometido).",
  },
  {
    id: "AR-ORG-3", line: 4, dimension: "organizacional", d7: "D1",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Gestión del portafolio de proyectos de TI",
    desc: "Priorización, seguimiento y cierre de proyectos tecnológicos con criterios de valor.",
    frame: "CMI", value: 3, target: 4, ownerId: "R04",
    evidenceIds: ["EV-13"],
    hallazgo: "Los proyectos de TI se priorizan anualmente con presupuesto asignado, pero sin métricas de beneficio realizadas post-cierre.",
    recomendacion: "Añadir revisión de beneficios a los 6 meses del cierre de cada proyecto.",
  },

  // ── misional / procesos (celda = 1) ──
  {
    id: "AR-MIS-1", line: 4, dimension: "misional", d7: "D3",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Caracterización de procesos críticos",
    desc: "Procesos del mapa institucional con caracterización vigente en el sistema de gestión de calidad.",
    frame: "CNA", value: 1, target: 3, ownerId: "R03",
    evidenceIds: ["EV-15", "EV-32"],
    hallazgo: "Solo 27 % de los procesos críticos están documentados; los 8 procesos de virtualidad caracterizados aún esperan aprobación del sistema de calidad.",
    recomendacion: "Aprobar los 8 procesos de virtualidad y sostener el ritmo de caracterización (KPI AR-01: meta 80 %).",
  },
  {
    id: "AR-MIS-2", line: 4, dimension: "misional", d7: "D3",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Procesos de la virtualidad en el sistema de calidad",
    desc: "Evolución del SGC para cubrir la operación de asignaturas y programas virtuales (línea de apoyo + despliegue).",
    frame: "CNA", value: 1, target: 3, ownerId: "R03",
    evidenceIds: ["EV-32"],
    hallazgo: "El SGC no contempla la virtualidad: matrícula, evaluación docente y soporte de programas virtuales operarían fuera de proceso.",
    recomendacion: "Incorporar los 8 procesos de línea de apoyo y los 16 de despliegue (patrón del modelo USCO) antes de la primera cohorte virtual.",
  },
  {
    id: "AR-MIS-3", line: 4, dimension: "misional", d7: "D2",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Gestión del cambio organizacional",
    desc: "Prácticas de gestión del cambio para la adopción de nuevos procesos y sistemas.",
    frame: "CMI", value: 1, target: 3, ownerId: "R03",
    evidenceIds: ["EV-14"],
    hallazgo: "Los despliegues tecnológicos se comunican por circular; la resistencia detectada en la adopción docente (i1) confirma la ausencia de método.",
    recomendacion: "Plan de gestión del cambio por iniciativa: mapa de actores, formación y acompañamiento — no solo comunicación.",
  },

  // ── tecnológica (celda = 2) ──
  {
    id: "AR-TEC-1", line: 4, dimension: "tecnologica", d7: "D5",
    perception: 3, evidence: { d: 2, i: 2, k: 1 },
    name: "Inventario y obsolescencia de sistemas",
    desc: "Catálogo de sistemas de información con estado, soporte, versiones y riesgo de obsolescencia.",
    frame: "TOGAF 10", value: 3, target: 4, ownerId: "R04",
    evidenceIds: ["EV-13"],
    hallazgo: "El inventario existe y está actualizado: 14 sistemas, 3 en riesgo de obsolescencia (sin soporte del fabricante), incluido el financiero.",
    recomendacion: "Plan de reemplazo del sistema financiero en la vigencia 2028; congelar integraciones nuevas sobre sistemas en riesgo.",
  },
  {
    id: "AR-TEC-2", line: 4, dimension: "tecnologica", d7: "D5",
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Interoperabilidad entre sistemas",
    desc: "Intercambio de datos por servicios entre los sistemas críticos, sin archivos planos ni redigitación.",
    frame: "TOGAF 10", value: 1, target: 4, ownerId: "R04",
    evidenceIds: ["EV-30"],
    hallazgo: "Solo 5 de 14 sistemas tienen alguna integración por servicios; el resto intercambia por archivos o redigitación. El bus de interoperabilidad (i5) no tiene presupuesto de vigencia.",
    recomendacion: "Resolver la financiación del bus (factor en racha roja) o priorizar 3 integraciones puntuales de alto valor mientras tanto.",
  },
  {
    id: "AR-TEC-3", line: 4, dimension: "tecnologica", d7: "D5", ai: true,
    perception: 2, evidence: { d: 1, i: 1, k: 0 },
    name: "Seguridad de la información",
    desc: "Controles de seguridad: gestión de accesos, respaldo, continuidad y tratamiento de datos personales.",
    frame: "ISO 27001", value: 2, target: 4, ownerId: "R04",
    evidenceIds: ["EV-13", "EV-18"],
    hallazgo: "Hay respaldo y gestión de accesos básica, pero sin SGSI formal: no hay análisis de riesgos vigente ni plan de continuidad probado.",
    recomendacion: "Formular el SGSI con alcance en los sistemas misionales; probar el plan de continuidad del LMS antes de la matrícula virtual.",
  },

  // ── datos (celda = 1) ──
  {
    id: "AR-DAT-1", line: 4, dimension: "datos", d7: "D4", ai: true,
    perception: 2, evidence: { d: 2, i: 1, k: 0 },
    name: "Gobierno de datos institucional",
    desc: "Comité, catálogo de datos maestros, dueños designados y reglas de calidad (DAMA-DMBOK).",
    frame: "DAMA-DMBOK", value: 1, target: 4, ownerId: "R03",
    evidenceIds: ["EV-14", "EV-29", "EV-31"],
    hallazgo: "El programa arrancó bien (comité, catálogo de 21 entidades, 9 dueños designados = 43 %), pero los dueños no tienen descarga horaria: el avance depende de voluntad.",
    recomendacion: "Asignar descarga horaria a los dueños de dato en la programación académica 2027-2.",
  },
  {
    id: "AR-DAT-2", line: 4, dimension: "datos", d7: "D4",
    perception: 3, evidence: { d: 1, i: 1, k: 0 },
    name: "Calidad de los datos SNIES",
    desc: "Consistencia del reporte oficial: matrícula, programas, docentes y graduados sin inconsistencias.",
    frame: "DAMA-DMBOK", value: 1, target: 3, ownerId: "R03",
    evidenceIds: ["EV-12"],
    hallazgo: "12 inconsistencias críticas identificadas en el diagnóstico de calidad (programas duplicados, matrícula sin municipio); afectan la posición en cualquier ranking basado en SNIES.",
    recomendacion: "Plan de remediación de las 12 inconsistencias con responsable por entidad, antes del próximo corte de reporte.",
  },
  {
    id: "AR-DAT-3", line: 4, dimension: "datos", d7: "D4", ai: true,
    perception: 1, evidence: { d: 0, i: 0, k: 0 },
    name: "Analítica institucional para decisiones",
    desc: "Tableros de decisión para directivos con datos integrados (matrícula, deserción, finanzas, desempeño).",
    frame: "CMI", value: 1, target: 3, ownerId: "R03",
    evidenceIds: ["EV-12"],
    hallazgo: "No existe analítica institucional integrada: cada informe directivo se arma manualmente combinando fuentes; la PGTD es el primer tablero transversal.",
    recomendacion: "Consolidar la PGTD como tablero directivo y conectar las fuentes vivas tras el bus de interoperabilidad.",
  },
];

/* ═══ Consultas del instrumento ═══ */

export const variablesOf = (line: number, dimension: string) =>
  VARIABLES.filter((v) => v.line === line && v.dimension === dimension);

export const cellFromVariables = (line: number, dimension: string) => {
  const vars = variablesOf(line, dimension);
  return vars.reduce((a, v) => a + v.value, 0) / vars.length;
};

export const gapOf = (v: Variable) => v.target - v.value;

/* ═══ Dominios diagnósticos ═══
   Cortes temáticos transversales al instrumento: agrupan variables, KPI e
   iniciativas para responder «¿cómo estamos en…?». */

export type Domain = {
  id: string;
  name: string;
  desc: string;
  variableIds: string[];
  kpiCodes: string[];
  initiativeIds: string[];
  dataHighlights: { label: string; value: string }[];
};

export const DOMAINS: Domain[] = [
  {
    id: "oferta",
    name: "Oferta y registros calificados",
    desc: "El portafolio académico frente al Decreto 1330: modalidades, vigencia de registros y capacidad de crear oferta virtual.",
    variableIds: ["AV-ORG-2", "AV-ORG-4", "AV-DAT-2", "EX-MIS-1"],
    kpiCodes: ["AV-04", "PR-02", "SO-02"],
    initiativeIds: ["i7", "i10", "i12"],
    dataHighlights: [
      { label: "Programas en el portafolio", value: "33" },
      { label: "Registros que vencen antes de 2028", value: "6" },
      { label: "Programas con modalidad virtual", value: "1 (propuesta)" },
      { label: "Bajo el punto de equilibrio", value: "12" },
    ],
  },
  {
    id: "docentes",
    name: "Formación y capacitación docente",
    desc: "La competencia digital docente como condición de la virtualidad: ruta, certificación, adopción y reconocimiento.",
    variableIds: ["AV-MIS-1", "AV-MIS-2", "AV-MIS-3"],
    kpiCodes: ["AV-02", "AV-01"],
    initiativeIds: ["i4", "i1"],
    dataHighlights: [
      { label: "Docentes certificados en la ruta", value: "178 (26 % de la planta)" },
      { label: "Meta a 2028", value: "300" },
      { label: "Participación semanal en cohorte", value: "61 %" },
      { label: "Reconocimiento en carrera docente", value: "En trámite" },
    ],
  },
  {
    id: "recursos",
    name: "Recursos tecnológicos para el aprendizaje",
    desc: "LMS, producción de contenidos, conectividad, equipos y licencias educativas: la base material del aprendizaje digital.",
    variableIds: ["AV-TEC-1", "AV-TEC-2", "AV-TEC-3", "AV-TEC-4", "AV-DAT-1"],
    kpiCodes: ["AV-01", "AV-05"],
    initiativeIds: ["i1", "i9"],
    dataHighlights: [
      { label: "Disponibilidad del LMS", value: "99,1 %" },
      { label: "Cursos con aula activa", value: "45 %" },
      { label: "Licencias sin renovar (2026)", value: "2" },
      { label: "Conectividad Aguachica", value: "Intermitente (nocturna)" },
    ],
  },
  {
    id: "autoevaluacion",
    name: "Autoevaluación y aseguramiento de la calidad",
    desc: "El ciclo de autoevaluación CNA y el sistema de gestión de calidad frente a las exigencias de las modalidades digitales.",
    variableIds: ["EX-ORG-2", "AR-MIS-1", "AR-MIS-2"],
    kpiCodes: ["PR-01", "AR-01"],
    initiativeIds: ["i10"],
    dataHighlights: [
      { label: "Procesos críticos documentados", value: "27 %" },
      { label: "Procesos de virtualidad en el SGC", value: "8 en aprobación" },
      { label: "Programas acreditados", value: "7 de 33" },
      { label: "Planes de mejoramiento con seguimiento", value: "Sin sistematizar" },
    ],
  },
  {
    id: "arquitectura",
    name: "Arquitectura empresarial y gobierno digital",
    desc: "La estructura TOGAF/DAMA que sostiene todo lo demás: gobierno TI, arquitectura documentada, interoperabilidad, seguridad y datos.",
    variableIds: ["AR-ORG-1", "AR-ORG-2", "AR-TEC-1", "AR-TEC-2", "AR-TEC-3", "AR-DAT-1", "AR-DAT-2"],
    kpiCodes: ["AR-02", "AR-03"],
    initiativeIds: ["i2", "i5"],
    dataHighlights: [
      { label: "Sistemas de información", value: "14 (3 en obsolescencia)" },
      { label: "Integrados por servicios", value: "5 de 14" },
      { label: "Entidades con dueño de dato", value: "9 de 21 (43 %)" },
      { label: "Inconsistencias críticas SNIES", value: "12" },
    ],
  },
  {
    id: "investigacion",
    name: "Investigación y visibilidad digital",
    desc: "La cadena de valor de la investigación mediada por tecnología: gestión, ciencia abierta, visibilidad y datos de producción.",
    variableIds: ["IN-MIS-1", "IN-TEC-2", "IN-DAT-1", "IN-DAT-3"],
    kpiCodes: ["IN-01", "IN-02", "EX-02"],
    initiativeIds: ["i3", "i6", "i14"],
    dataHighlights: [
      { label: "Producción en acceso abierto", value: "44 %" },
      { label: "Objetos en el repositorio", value: "3.800" },
      { label: "CvLAC desactualizados", value: "43 %" },
      { label: "Grupos en riesgo de descenso", value: "2" },
    ],
  },
];

export const domainScore = (d: Domain) => {
  const vars = VARIABLES.filter((v) => d.variableIds.includes(v.id));
  return {
    value: vars.reduce((a, v) => a + v.value, 0) / vars.length,
    target: vars.reduce((a, v) => a + v.target, 0) / vars.length,
  };
};
