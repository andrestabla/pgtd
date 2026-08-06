// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Huella territorial de las tres funciones misionales.
// Tres lentes sobre el mapa del Cesar: oferta/cobertura (matrícula),
// investigación (producción vinculada al territorio) y proyección social
// (convenios con ejecución). Más la vista de impacto nacional (coautorías y
// convenios interinstitucionales por departamento) e internacional (países).
//
// Consistencia verificada por tests: los convenios territoriales + nacionales
// + internacionales suman el valor vigente del KPI EX-01 (61).
// Cifras ilustrativas — se pueblan con SIVIPS/CvLAC, actas de convenios y
// Scopus/OpenAlex en las Fases 1 y 2.
// ─────────────────────────────────────────────────────────────────────────────

/* ═══ Lentes municipales ═══ */

export type MuniImpact = {
  produccion: number;   // productos de investigación 2021–2026 con sitio de estudio en el municipio
  convenios: number;    // convenios de extensión con ejecución en el municipio
  nota?: string;        // qué explica la cifra
};

export const MUNI_IMPACT: Record<string, MuniImpact> = {
  Valledupar:            { produccion: 118, convenios: 17, nota: "Sede principal: concentra grupos, semilleros y convenios con Gobernación, Alcaldía y hospitales." },
  Aguachica:             { produccion: 14, convenios: 6, nota: "Sede sur: agroindustria y convenio marco con la alcaldía (EV-28)." },
  "La Jagua de Ibirico": { produccion: 11, convenios: 3, nota: "Estudios de transición minero-energética y calidad del aire." },
  Chimichagua:           { produccion: 9, convenios: 2, nota: "Complejo cenagoso de Zapatosa: biodiversidad y pesca artesanal." },
  "Agustín Codazzi":     { produccion: 8, convenios: 3, nota: "Agricultura (palma, algodón) con centros de investigación agropecuaria." },
  Curumaní:              { produccion: 6, convenios: 3 },
  Bosconia:              { produccion: 5, convenios: 2, nota: "Nodo logístico ferroviario y vial." },
  "Pueblo Bello":        { produccion: 5, convenios: 2, nota: "Café de altura y trabajo con comunidades arhuacas." },
  Chiriguaná:            { produccion: 4, convenios: 2 },
  "El Copey":            { produccion: 3, convenios: 2 },
  "San Alberto":         { produccion: 3, convenios: 2, nota: "Palma de aceite: prácticas y educación continua." },
  "La Paz":              { produccion: 3, convenios: 1 },
  "El Paso":             { produccion: 2, convenios: 1, nota: "Corredor de generación solar." },
  Becerril:              { produccion: 2, convenios: 0 },
  "San Diego":           { produccion: 2, convenios: 0 },
  Astrea:                { produccion: 1, convenios: 1 },
  Pailitas:              { produccion: 1, convenios: 1 },
  Tamalameque:           { produccion: 1, convenios: 0 },
  Pelaya:                { produccion: 1, convenios: 0 },
  "La Gloria":           { produccion: 0, convenios: 0 },
  González:              { produccion: 0, convenios: 0 },
  Gamarra:               { produccion: 1, convenios: 0, nota: "Puerto sobre el Magdalena." },
  "Río de Oro":          { produccion: 0, convenios: 0 },
  "San Martín":          { produccion: 0, convenios: 0 },
  Manaure:               { produccion: 0, convenios: 0 },
};

export type MapLens = "cobertura" | "investigacion" | "extension";

export const LENS_META: Record<MapLens, {
  label: string; short: string; unit: string;
  color: string; colorDeep: string;
  desc: string; lectura: string;
}> = {
  cobertura: {
    label: "Oferta y cobertura", short: "Cobertura", unit: "estudiantes",
    color: "var(--cyan-fill)", colorDeep: "var(--cyan-deep)",
    desc: "Matrícula por municipio de residencia del estudiante.",
    lectura: "La matrícula se concentra en Valledupar (67 %) y Aguachica (10 %): 23 municipios aportan menos de un cuarto de la matrícula. Es la brecha que la modalidad virtual del sur ataca primero.",
  },
  investigacion: {
    label: "Investigación · producción", short: "Investigación", unit: "productos",
    color: "#a78bfa", colorDeep: "#7c5cd6",
    desc: "Productos de investigación 2021–2026 con sitio de estudio en el municipio (SIVIPS/CvLAC).",
    lectura: "La producción sigue a la geografía económica: transición minera (La Jagua), ciénaga de Zapatosa (Chimichagua) y agroindustria (Codazzi, San Alberto). Ocho municipios no han sido sitio de estudio de ningún producto: territorio sin leer.",
  },
  extension: {
    label: "Proyección social · convenios", short: "Extensión", unit: "convenios",
    color: "var(--gold-fill)", colorDeep: "var(--gold)",
    desc: "Convenios de extensión con ejecución verificable en el municipio (corte 2026-T2).",
    lectura: "48 de los 61 convenios activos ejecutan en el departamento, pero 9 municipios no tienen ninguno. El convenio marco con Aguachica (EV-28) es la cabeza de playa del sur; falta réplica en La Gloria y Río de Oro.",
  },
};

/* ═══ Impacto nacional (coautorías y convenios por departamento) ═══ */

export type NationalImpact = {
  dept: string;          // debe coincidir con CO_PATHS.name
  coautorias: number;    // productos en coautoría con instituciones del departamento
  convenios: number;     // convenios interinstitucionales activos
  nota?: string;
};

export const NATIONAL_IMPACT: NationalImpact[] = [
  { dept: "Bogotá D.C.", coautorias: 46, convenios: 2, nota: "U. Nacional, Javeriana y Distrital: los socios más frecuentes." },
  { dept: "Atlántico", coautorias: 31, convenios: 2, nota: "UniNorte y UniAtlántico: eje Caribe de coautoría." },
  { dept: "Antioquia", coautorias: 22, convenios: 1, nota: "UdeA y UNAL Medellín." },
  { dept: "Santander", coautorias: 19, convenios: 1, nota: "UIS: química y recursos hídricos." },
  { dept: "Magdalena", coautorias: 16, convenios: 1, nota: "UniMagdalena: ecosistemas cenagosos compartidos." },
  { dept: "La Guajira", coautorias: 13, convenios: 1, nota: "UniGuajira: par territorial (caso Universidad 4.0)." },
  { dept: "Bolívar", coautorias: 10, convenios: 0, nota: "UdeC y UTB." },
  { dept: "Norte de Santander", coautorias: 8, convenios: 1, nota: "UFPS: corredor de frontera." },
  { dept: "Valle del Cauca", coautorias: 7, convenios: 0 },
  { dept: "Córdoba", coautorias: 5, convenios: 0 },
  { dept: "Boyacá", coautorias: 4, convenios: 0 },
  { dept: "Sucre", coautorias: 3, convenios: 0 },
];

/* ═══ Impacto internacional ═══ */

export type IntlImpact = {
  country: string;
  flag: string;          // emoji
  coautorias: number;    // productos en coautoría internacional 2021–2026
  convenios: number;     // convenios o membresías activas
  tipo: string;          // naturaleza del vínculo dominante
};

export const INTERNATIONAL_IMPACT: IntlImpact[] = [
  { country: "México", flag: "🇲🇽", coautorias: 14, convenios: 1, tipo: "Coautoría + movilidad docente (UDUAL)" },
  { country: "España", flag: "🇪🇸", coautorias: 12, convenios: 1, tipo: "Doctorados de docentes en curso" },
  { country: "Brasil", flag: "🇧🇷", coautorias: 9, convenios: 1, tipo: "Red de ciencias agroambientales" },
  { country: "Estados Unidos", flag: "🇺🇸", coautorias: 8, convenios: 0, tipo: "Coautoría en salud y ambiente" },
  { country: "Chile", flag: "🇨🇱", coautorias: 6, convenios: 1, tipo: "Convenio de doble titulación (propuesta)" },
  { country: "Argentina", flag: "🇦🇷", coautorias: 5, convenios: 0, tipo: "Coautoría en ciencias sociales" },
  { country: "Ecuador", flag: "🇪🇨", coautorias: 4, convenios: 0, tipo: "Movilidad estudiantil entrante" },
  { country: "Perú", flag: "🇵🇪", coautorias: 3, convenios: 0, tipo: "Coautoría en educación" },
];

/* ═══ Indicadores de la vista de impacto ═══ */

export const IMPACT_STATS = {
  // % de la producción indexada 2021–2026 con al menos un coautor internacional
  coautoriaInternacionalPct: 18,
  paresNacionales: NATIONAL_IMPACT.length,
  paisesConVinculo: INTERNATIONAL_IMPACT.length,
  productosConSitioTerritorial: Object.values(MUNI_IMPACT).reduce((a, m) => a + m.produccion, 0),
  redesActivas: 3,        // UDUAL, red agroambiental, red de ciénagas
  movilidadSaliente: 11,  // docentes y estudiantes 2026
  movilidadEntrante: 6,
};

/* ═══ Totales de consistencia ═══ */

export const conveniosTerritorio = () =>
  Object.values(MUNI_IMPACT).reduce((a, m) => a + m.convenios, 0);
export const conveniosNacionales = () =>
  NATIONAL_IMPACT.reduce((a, d) => a + d.convenios, 0);
export const conveniosInternacionales = () =>
  INTERNATIONAL_IMPACT.reduce((a, c) => a + c.convenios, 0);
/** Debe igualar el último valor del KPI EX-01 (convenios de extensión activos). */
export const conveniosTotales = () =>
  conveniosTerritorio() + conveniosNacionales() + conveniosInternacionales();
