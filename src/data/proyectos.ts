// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Gestor de proyectos: el plan de trabajo operativo del roadmap.
// Las iniciativas (M5/M6) se traducen aquí en tareas concretas con fechas,
// responsables con nombre propio, dependencias y evidencia por entregable.
// Personas y tareas son FICTICIAS, de demostración; en operación se cargan
// del directorio institucional y del plan de trabajo real de cada iniciativa.
// «Hoy» del demo: 2027-03-10 (coherente con DEMO_NOW_INDEX del motor).
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_TODAY = "2027-03-10";

/* ═══ Directorio de personas (ficticias) ═══ */

export type Person = {
  id: string;
  name: string;
  cargo: string;
  dependencia: string;
  email: string;
  responsibleId: string;   // enlaza con el directorio de cargos (R01…)
};

export const PEOPLE: Person[] = [
  { id: "P01", name: "Marelvis Oñate", cargo: "Vicerrectora Académica", dependencia: "Vicerrectoría Académica", email: "vacademica@unicesar.edu.co", responsibleId: "R01" },
  { id: "P02", name: "Jaime Rocha", cargo: "Jefe de Recursos Tecnológicos", dependencia: "División de Recursos Tecnológicos", email: "jrocha@unicesar.edu.co", responsibleId: "R04" },
  { id: "P03", name: "Karen Maestre", cargo: "Jefe de Planeación", dependencia: "Oficina Asesora de Planeación", email: "kmaestre@unicesar.edu.co", responsibleId: "R03" },
  { id: "P04", name: "Luis Barros", cargo: "Coordinador de Educación Virtual", dependencia: "Unidad de Educación Digital", email: "lbarros@unicesar.edu.co", responsibleId: "R07" },
  { id: "P05", name: "Diana Quintero", cargo: "Coordinadora de Biblioteca", dependencia: "Biblioteca Central", email: "dquintero@unicesar.edu.co", responsibleId: "R05" },
  { id: "P06", name: "Andrés Molina", cargo: "Director de Bienestar", dependencia: "Bienestar Universitario", email: "amolina@unicesar.edu.co", responsibleId: "R06" },
  { id: "P07", name: "Paola Daza", cargo: "Vicerrectora de Investigación y Extensión", dependencia: "Vicerrectoría de Investigación y Extensión", email: "vinvestigacion@unicesar.edu.co", responsibleId: "R02" },
  { id: "P08", name: "Iván Gutiérrez", cargo: "Jefe de Extensión", dependencia: "Oficina de Extensión y Proyección Social", email: "igutierrez@unicesar.edu.co", responsibleId: "R08" },
  { id: "P09", name: "Sandra Villalba", cargo: "Coordinadora de Autoevaluación", dependencia: "Oficina de Autoevaluación", email: "svillalba@unicesar.edu.co", responsibleId: "R09" },
  { id: "P10", name: "Rafael Mendoza", cargo: "Profesional de gobierno de datos", dependencia: "Oficina Asesora de Planeación", email: "rmendoza@unicesar.edu.co", responsibleId: "R03" },
  { id: "P11", name: "Yulieth Castro", cargo: "Diseñadora instruccional", dependencia: "Unidad de Educación Digital", email: "ycastro@unicesar.edu.co", responsibleId: "R07" },
  { id: "P12", name: "Carlos Peñaloza", cargo: "Administrador de plataforma LMS", dependencia: "División de Recursos Tecnológicos", email: "cpenaloza@unicesar.edu.co", responsibleId: "R04" },
  { id: "P13", name: "Milena Araújo", cargo: "Profesional de mesa de ayuda", dependencia: "Bienestar Universitario", email: "maraujo@unicesar.edu.co", responsibleId: "R06" },
  { id: "P14", name: "Jorge Cuello", cargo: "Arquitecto de integraciones", dependencia: "División de Recursos Tecnológicos", email: "jcuello@unicesar.edu.co", responsibleId: "R04" },
];

export const person = (id: string) => PEOPLE.find((p) => p.id === id)!;
export const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/* ═══ Tareas ═══ */

export type TaskStatus = "POR_HACER" | "EN_CURSO" | "EN_REVISION" | "HECHA" | "BLOQUEADA";

export type Task = {
  id: string;
  iniId: string;            // iniciativa a la que pertenece
  title: string;
  assigneeId: string;       // persona (nombre propio)
  start: string;            // YYYY-MM-DD
  due: string;              // YYYY-MM-DD
  status: TaskStatus;
  requiresEvidence?: boolean;   // el cierre exige soporte
  evidenceIds?: string[];       // EV-xx del catálogo
  dependsOn?: string[];         // ids de tareas prerrequisito
  note?: string;
};

export const TASKS: Task[] = [
  /* ── i1 · Aula virtual estándar institucional ── */
  { id: "T-i1-01", iniId: "i1", title: "Redactar la plantilla institucional de aula con criterios de calidad", assigneeId: "P11", start: "2026-08-03", due: "2026-09-04", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-17"] },
  { id: "T-i1-02", iniId: "i1", title: "Aprobar la plantilla en Consejo Académico", assigneeId: "P01", start: "2026-09-05", due: "2026-09-12", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-17"], dependsOn: ["T-i1-01"] },
  { id: "T-i1-03", iniId: "i1", title: "Montar los 8 cursos piloto sobre la plantilla", assigneeId: "P12", start: "2026-09-15", due: "2026-10-17", status: "HECHA", dependsOn: ["T-i1-02"] },
  { id: "T-i1-04", iniId: "i1", title: "Evaluar el piloto: encuesta a estudiantes y docentes", assigneeId: "P11", start: "2026-10-20", due: "2026-11-03", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-19"], dependsOn: ["T-i1-03"] },
  { id: "T-i1-05", iniId: "i1", title: "Formar a los docentes de alta matricialidad (cohorte 1 de 3)", assigneeId: "P04", start: "2027-01-13", due: "2027-02-14", status: "HECHA" },
  { id: "T-i1-06", iniId: "i1", title: "Formar a los docentes de alta matricialidad (cohorte 2 de 3)", assigneeId: "P04", start: "2027-02-17", due: "2027-03-21", status: "EN_CURSO", dependsOn: ["T-i1-05"] },
  { id: "T-i1-07", iniId: "i1", title: "Migrar las aulas de la Facultad de Salud al estándar", assigneeId: "P12", start: "2027-02-03", due: "2027-02-28", status: "BLOQUEADA", note: "Bloqueada por disponibilidad del equipo de TI (factor en racha roja); pendiente bolsa de horas." },
  { id: "T-i1-08", iniId: "i1", title: "Migrar las aulas de Ingenierías al estándar", assigneeId: "P12", start: "2027-03-03", due: "2027-03-31", status: "POR_HACER", dependsOn: ["T-i1-07"] },
  { id: "T-i1-09", iniId: "i1", title: "Especificar el tablero de actividad de aulas para decanaturas", assigneeId: "P11", start: "2027-03-10", due: "2027-04-11", status: "POR_HACER" },
  { id: "T-i1-10", iniId: "i1", title: "Comité de seguimiento: plan de recuperación del despliegue con TI", assigneeId: "P01", start: "2027-03-15", due: "2027-03-15", status: "POR_HACER", requiresEvidence: true },

  /* ── i2 · Programa de gobierno de datos ── */
  { id: "T-i2-01", iniId: "i2", title: "Constituir el comité de gobierno de datos (acta y reglamento)", assigneeId: "P03", start: "2026-08-04", due: "2026-08-14", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-14"] },
  { id: "T-i2-02", iniId: "i2", title: "Levantar el catálogo de datos maestros (21 entidades)", assigneeId: "P10", start: "2026-08-18", due: "2026-10-20", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-29"], dependsOn: ["T-i2-01"] },
  { id: "T-i2-03", iniId: "i2", title: "Designar dueños de dato: tanda 1 (9 entidades)", assigneeId: "P10", start: "2026-11-03", due: "2027-02-08", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-31"], dependsOn: ["T-i2-02"] },
  { id: "T-i2-04", iniId: "i2", title: "Designar dueños de dato: tanda 2 (12 entidades restantes)", assigneeId: "P10", start: "2027-02-10", due: "2027-02-28", status: "EN_CURSO", note: "Avance lento: los dueños no tienen descarga horaria asignada.", dependsOn: ["T-i2-03"] },
  { id: "T-i2-05", iniId: "i2", title: "Definir reglas de calidad para el registro académico", assigneeId: "P10", start: "2027-03-03", due: "2027-03-28", status: "POR_HACER", dependsOn: ["T-i2-04"] },
  { id: "T-i2-06", iniId: "i2", title: "Definir reglas de calidad para el reporte SNIES", assigneeId: "P10", start: "2027-03-03", due: "2027-04-04", status: "POR_HACER", requiresEvidence: true, dependsOn: ["T-i2-04"] },
  { id: "T-i2-07", iniId: "i2", title: "Plan de remediación de las 12 inconsistencias críticas SNIES", assigneeId: "P03", start: "2027-02-17", due: "2027-03-07", status: "EN_REVISION", requiresEvidence: true, evidenceIds: ["EV-12"], note: "En revisión del comité; 8 de 12 inconsistencias con responsable asignado." },

  /* ── i3 · Repositorio institucional y ciencia abierta ── */
  { id: "T-i3-01", iniId: "i3", title: "Instalar y parametrizar DSpace en producción", assigneeId: "P02", start: "2026-10-01", due: "2026-11-28", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-22"] },
  { id: "T-i3-02", iniId: "i3", title: "Migrar el acervo de tesis y trabajos de grado (3.800 objetos)", assigneeId: "P05", start: "2026-12-01", due: "2027-01-30", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-23"], dependsOn: ["T-i3-01"] },
  { id: "T-i3-03", iniId: "i3", title: "Redactar la política de acceso abierto y autoarchivo", assigneeId: "P05", start: "2027-01-13", due: "2027-02-20", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-21"] },
  { id: "T-i3-04", iniId: "i3", title: "Presentar la política al Consejo Académico", assigneeId: "P07", start: "2027-03-10", due: "2027-03-10", status: "EN_CURSO", dependsOn: ["T-i3-03"], note: "Sesión programada para hoy." },
  { id: "T-i3-05", iniId: "i3", title: "Activar cosecha OAI-PMH hacia Google Scholar y La Referencia", assigneeId: "P02", start: "2027-03-17", due: "2027-04-18", status: "POR_HACER", dependsOn: ["T-i3-04"] },
  { id: "T-i3-06", iniId: "i3", title: "Jornada de autoarchivo asistido con los grupos de investigación", assigneeId: "P05", start: "2027-04-21", due: "2027-05-23", status: "POR_HACER", dependsOn: ["T-i3-05"] },

  /* ── i4 · Ruta de formación docente ── */
  { id: "T-i4-01", iniId: "i4", title: "Diseñar la ruta por niveles con rúbricas (marco INTEF)", assigneeId: "P04", start: "2026-08-11", due: "2026-10-03", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-20"] },
  { id: "T-i4-02", iniId: "i4", title: "Abrir la primera cohorte del nivel básico (84 inscritos)", assigneeId: "P04", start: "2026-10-06", due: "2026-10-31", status: "HECHA", dependsOn: ["T-i4-01"] },
  { id: "T-i4-03", iniId: "i4", title: "Plan de acompañamiento por facultad (participación cayó al 61 %)", assigneeId: "P11", start: "2027-01-20", due: "2027-02-13", status: "HECHA" },
  { id: "T-i4-04", iniId: "i4", title: "Aplicar el examen de certificación de la cohorte 1", assigneeId: "P04", start: "2027-03-17", due: "2027-03-20", status: "POR_HACER", requiresEvidence: true },
  { id: "T-i4-05", iniId: "i4", title: "Radicar la propuesta de reconocimiento en carrera docente", assigneeId: "P01", start: "2027-04-01", due: "2027-05-15", status: "POR_HACER" },
  { id: "T-i4-06", iniId: "i4", title: "Abrir cohorte 2 fuera de los picos de parciales", assigneeId: "P04", start: "2027-04-14", due: "2027-05-09", status: "POR_HACER", dependsOn: ["T-i4-04"] },

  /* ── i5 · Bus de interoperabilidad (bloqueada por presupuesto) ── */
  { id: "T-i5-01", iniId: "i5", title: "Documento de arquitectura de referencia de integración", assigneeId: "P14", start: "2027-01-07", due: "2027-02-27", status: "EN_REVISION", requiresEvidence: true, note: "Borrador en revisión del comité TIC." },
  { id: "T-i5-02", iniId: "i5", title: "Tramitar vigencias futuras para la plataforma de integración", assigneeId: "P03", start: "2027-02-03", due: "2027-04-01", status: "EN_CURSO", note: "Sin partida en la vigencia actual: decisión del comité financiero pendiente." },
  { id: "T-i5-03", iniId: "i5", title: "Estudio de mercado de plataformas de integración", assigneeId: "P14", start: "2027-04-07", due: "2027-05-16", status: "BLOQUEADA", dependsOn: ["T-i5-02"], note: "Bloqueada hasta resolver la financiación." },
  { id: "T-i5-04", iniId: "i5", title: "Pliegos de la contratación", assigneeId: "P02", start: "2027-05-19", due: "2027-06-27", status: "POR_HACER", dependsOn: ["T-i5-03"] },

  /* ── i6 · Observatorio de rankings ── */
  { id: "T-i6-01", iniId: "i6", title: "Completar la matriz indicador ↔ fuente ↔ responsable", assigneeId: "P03", start: "2027-02-03", due: "2027-03-05", status: "EN_CURSO", requiresEvidence: true, evidenceIds: ["EV-27"], note: "Vencida: 60 % de la matriz completa." },
  { id: "T-i6-02", iniId: "i6", title: "Taller de mapeo con las dependencias fuente", assigneeId: "P03", start: "2027-04-15", due: "2027-04-17", status: "POR_HACER", dependsOn: ["T-i6-01"] },
  { id: "T-i6-03", iniId: "i6", title: "Construir el tablero de línea base de los 4 rankings", assigneeId: "P10", start: "2027-05-05", due: "2027-06-30", status: "POR_HACER", dependsOn: ["T-i6-02"] },

  /* ── i7 · Programas virtuales del sur ── */
  { id: "T-i7-01", iniId: "i7", title: "Estudio de demanda territorial del sur (módulo M2)", assigneeId: "P03", start: "2027-04-01", due: "2027-06-20", status: "POR_HACER", requiresEvidence: true },
  { id: "T-i7-02", iniId: "i7", title: "Conformar los comités curriculares de los 2 programas", assigneeId: "P01", start: "2027-07-01", due: "2027-07-31", status: "POR_HACER", dependsOn: ["T-i7-01"] },
  { id: "T-i7-03", iniId: "i7", title: "Documento maestro: programa de administración (D.1330)", assigneeId: "P09", start: "2027-08-04", due: "2027-12-18", status: "POR_HACER", dependsOn: ["T-i7-02"] },
  { id: "T-i7-04", iniId: "i7", title: "Documento maestro: tecnología agroindustrial (D.1330)", assigneeId: "P09", start: "2027-08-04", due: "2027-12-18", status: "POR_HACER", dependsOn: ["T-i7-02"] },

  /* ── i8 · Modelo de servicio al estudiante virtual ── */
  { id: "T-i8-01", iniId: "i8", title: "Mapear los 14 momentos de contacto del estudiante virtual", assigneeId: "P06", start: "2026-10-14", due: "2026-12-10", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-25"] },
  { id: "T-i8-02", iniId: "i8", title: "Piloto de mesa de ayuda (120 tickets)", assigneeId: "P13", start: "2027-01-07", due: "2027-02-01", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-26"], dependsOn: ["T-i8-01"] },
  { id: "T-i8-03", iniId: "i8", title: "Redactar y publicar los ANS de los 4 canales", assigneeId: "P06", start: "2027-02-04", due: "2027-03-05", status: "EN_REVISION", requiresEvidence: true, note: "Vencida: en revisión jurídica desde el 28-feb." },
  { id: "T-i8-04", iniId: "i8", title: "Cargar los primeros 50 artículos de la base de conocimiento", assigneeId: "P13", start: "2027-02-10", due: "2027-03-14", status: "EN_CURSO" },
  { id: "T-i8-05", iniId: "i8", title: "Contratar la segunda posición con franja nocturna", assigneeId: "P06", start: "2027-03-03", due: "2027-04-04", status: "EN_CURSO", note: "Perfil publicado; cierre de convocatoria 25-mar." },
  { id: "T-i8-06", iniId: "i8", title: "Habilitar el punto de atención virtual en Aguachica", assigneeId: "P13", start: "2027-04-07", due: "2027-05-30", status: "POR_HACER", dependsOn: ["T-i8-05"] },

  /* ── i9 · Virtualización del componente básico ── */
  { id: "T-i9-01", iniId: "i9", title: "Priorizar los 12 cursos por matricialidad (comité curricular)", assigneeId: "P01", start: "2026-11-18", due: "2026-12-05", status: "HECHA", requiresEvidence: true },
  { id: "T-i9-02", iniId: "i9", title: "Rediseño microcurricular de los primeros 4 cursos", assigneeId: "P11", start: "2026-12-09", due: "2027-01-31", status: "HECHA", dependsOn: ["T-i9-01"] },
  { id: "T-i9-03", iniId: "i9", title: "Guiones y storyboards del primer paquete", assigneeId: "P11", start: "2027-02-03", due: "2027-03-07", status: "EN_CURSO", note: "Vencida: guion de video atrasado una semana por la vacante." },
  { id: "T-i9-04", iniId: "i9", title: "Cerrar el concurso de la vacante de diseñador instruccional", assigneeId: "P04", start: "2027-02-10", due: "2027-03-21", status: "EN_CURSO" },
  { id: "T-i9-05", iniId: "i9", title: "Producción audiovisual del primer paquete (4 cursos)", assigneeId: "P04", start: "2027-03-10", due: "2027-04-25", status: "POR_HACER", dependsOn: ["T-i9-03"] },
  { id: "T-i9-06", iniId: "i9", title: "Publicar el primer paquete en plataforma", assigneeId: "P12", start: "2027-04-28", due: "2027-04-30", status: "POR_HACER", requiresEvidence: true, dependsOn: ["T-i9-05"] },
  { id: "T-i9-07", iniId: "i9", title: "Matrícula piloto: 600 estudiantes en los 4 cursos", assigneeId: "P01", start: "2027-07-15", due: "2027-08-08", status: "POR_HACER", dependsOn: ["T-i9-06"] },

  /* ── i10 · Normatividad interna para la virtualidad ── */
  { id: "T-i10-01", iniId: "i10", title: "Matriz normativa: 14 instrumentos que tocan la virtualidad", assigneeId: "P09", start: "2026-09-01", due: "2026-10-30", status: "HECHA", requiresEvidence: true },
  { id: "T-i10-02", iniId: "i10", title: "Proyecto de acuerdo para el Consejo Superior", assigneeId: "P01", start: "2026-11-04", due: "2027-01-24", status: "HECHA", dependsOn: ["T-i10-01"] },
  { id: "T-i10-03", iniId: "i10", title: "Primera discusión del acuerdo en Consejo Superior", assigneeId: "P01", start: "2027-03-25", due: "2027-03-25", status: "POR_HACER", note: "Agenda desplazada un mes por coyuntura electoral interna." },
  { id: "T-i10-04", iniId: "i10", title: "Ajustes al reglamento estudiantil de posgrado (apartado virtual)", assigneeId: "P09", start: "2027-04-01", due: "2027-05-30", status: "POR_HACER", dependsOn: ["T-i10-03"] },
  { id: "T-i10-05", iniId: "i10", title: "Sanción y publicación de la normatividad ajustada", assigneeId: "P01", start: "2027-06-02", due: "2027-06-27", status: "POR_HACER", requiresEvidence: true, dependsOn: ["T-i10-04"] },

  /* ── i11 · Unidad de Educación Digital ── */
  { id: "T-i11-01", iniId: "i11", title: "Estudio técnico de estructura y perfiles de la Unidad", assigneeId: "P03", start: "2026-10-07", due: "2026-12-18", status: "HECHA", requiresEvidence: true, evidenceIds: ["EV-16"] },
  { id: "T-i11-02", iniId: "i11", title: "Proyecto de acuerdo de creación para Consejo Superior", assigneeId: "P01", start: "2027-01-14", due: "2027-02-27", status: "HECHA", dependsOn: ["T-i11-01"] },
  { id: "T-i11-03", iniId: "i11", title: "Acuerdo de creación en agenda del Consejo Superior", assigneeId: "P01", start: "2027-03-25", due: "2027-03-25", status: "POR_HACER", dependsOn: ["T-i11-02"], note: "Misma sesión que la normatividad (i10)." },
  { id: "T-i11-04", iniId: "i11", title: "Concurso de las 4 posiciones del equipo base", assigneeId: "P03", start: "2027-04-07", due: "2027-06-06", status: "POR_HACER", dependsOn: ["T-i11-03"] },
  { id: "T-i11-05", iniId: "i11", title: "Plan operativo del primer año de la Unidad", assigneeId: "P04", start: "2027-06-09", due: "2027-07-11", status: "POR_HACER", dependsOn: ["T-i11-04"] },

  /* ── i12 · Modelo de costos unitarios ── */
  { id: "T-i12-01", iniId: "i12", title: "Inventario de costos por programa (docencia, operación, bienestar)", assigneeId: "P03", start: "2026-10-14", due: "2026-12-20", status: "HECHA", requiresEvidence: true },
  { id: "T-i12-02", iniId: "i12", title: "Primera corrida del modelo (33 programas, por sede y jornada)", assigneeId: "P10", start: "2027-01-07", due: "2027-01-20", status: "HECHA", requiresEvidence: true, dependsOn: ["T-i12-01"] },
  { id: "T-i12-03", iniId: "i12", title: "Desagregar el modelo por cohorte (solicitud de decanaturas)", assigneeId: "P10", start: "2027-02-19", due: "2027-03-27", status: "EN_CURSO", dependsOn: ["T-i12-02"] },
  { id: "T-i12-04", iniId: "i12", title: "Escenarios de sensibilidad con permanencia estudiantil", assigneeId: "P10", start: "2027-03-03", due: "2027-04-05", status: "EN_CURSO" },
  { id: "T-i12-05", iniId: "i12", title: "Presentación de escenarios al comité financiero", assigneeId: "P03", start: "2027-04-10", due: "2027-04-10", status: "POR_HACER", requiresEvidence: true, dependsOn: ["T-i12-04"] },

  /* ── i13 · CRM y riesgo de abandono ── */
  { id: "T-i13-01", iniId: "i13", title: "Levantar requerimientos con Bienestar y Registro", assigneeId: "P06", start: "2027-05-15", due: "2027-06-30", status: "POR_HACER" },
  { id: "T-i13-02", iniId: "i13", title: "Evaluación de impacto de privacidad del tratamiento (salvaguarda SG-3)", assigneeId: "P03", start: "2027-06-02", due: "2027-07-04", status: "POR_HACER", requiresEvidence: true },
  { id: "T-i13-03", iniId: "i13", title: "Estudio de mercado de CRM educativo", assigneeId: "P02", start: "2027-07-07", due: "2027-08-15", status: "POR_HACER", dependsOn: ["T-i13-01"] },

  /* ── i14 · Biblioteca digital y CRAI ── */
  { id: "T-i14-01", iniId: "i14", title: "Estudio de mercado de motores de descubrimiento", assigneeId: "P05", start: "2027-08-15", due: "2027-09-30", status: "POR_HACER" },
  { id: "T-i14-02", iniId: "i14", title: "Diseño de los 4 servicios CRAI (incluida bibliometría)", assigneeId: "P05", start: "2027-10-01", due: "2027-11-28", status: "POR_HACER", dependsOn: ["T-i14-01"] },
  { id: "T-i14-03", iniId: "i14", title: "Implantación del motor y catálogo unificado", assigneeId: "P02", start: "2027-12-01", due: "2028-02-27", status: "POR_HACER", dependsOn: ["T-i14-02"] },
];

/* ═══ Consultas básicas ═══ */

export const tasksOf = (iniId: string) => TASKS.filter((t) => t.iniId === iniId);

export const isOverdue = (t: Task) =>
  t.status !== "HECHA" && t.due < DEMO_TODAY;

export const dueSoon = (t: Task, days = 14) => {
  if (t.status === "HECHA" || isOverdue(t)) return false;
  const due = new Date(t.due).getTime();
  const today = new Date(DEMO_TODAY).getTime();
  return due - today <= days * 86_400_000;
};

export const TASK_STATUS_META: Record<TaskStatus, { label: string; color: string }> = {
  POR_HACER: { label: "Por hacer", color: "var(--faint)" },
  EN_CURSO: { label: "En curso", color: "var(--cyan)" },
  EN_REVISION: { label: "En revisión", color: "var(--gold)" },
  BLOQUEADA: { label: "Bloqueada", color: "var(--bad)" },
  HECHA: { label: "Hecha", color: "var(--ok)" },
};
