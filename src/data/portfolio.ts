// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Portafolio académico de la UPC (ilustrativo, estructura SNIES).
// Alimenta el análisis de cobertura, virtualización y punto de equilibrio.
// Cifras de matrícula, deserción y Saber Pro son de ejemplo para la demo.
// ─────────────────────────────────────────────────────────────────────────────

export type Program = {
  code: string;                 // código interno tipo SNIES
  name: string;
  level: "Pregrado" | "Tecnología" | "Especialización" | "Maestría";
  faculty: string;
  campus: "Valledupar" | "Aguachica";
  modality: "Presencial" | "Híbrida" | "Virtual";
  students: number;             // matrícula vigente
  virtualCredits: number;       // % de créditos con componente virtual
  accredited: boolean;          // acreditación de alta calidad
  saberPro: number | null;      // promedio institucional del programa (0–300)
  dropout: number;              // deserción anual %
  breakEven: boolean;           // ¿opera sobre el punto de equilibrio?
};

export const FACULTIES = [
  "Ingenierías y Tecnologías",
  "Ciencias Administrativas, Contables y Económicas",
  "Derecho, Ciencias Políticas y Sociales",
  "Ciencias de la Salud",
  "Ciencias Básicas",
  "Educación",
  "Bellas Artes",
] as const;

export const PROGRAMS: Program[] = [
  // ── Ingenierías y Tecnologías ──
  { code: "UPC-101", name: "Ingeniería de Sistemas", level: "Pregrado", faculty: "Ingenierías y Tecnologías", campus: "Valledupar", modality: "Presencial", students: 812, virtualCredits: 22, accredited: true, saberPro: 148, dropout: 11.2, breakEven: true },
  { code: "UPC-102", name: "Ingeniería Electrónica", level: "Pregrado", faculty: "Ingenierías y Tecnologías", campus: "Valledupar", modality: "Presencial", students: 486, virtualCredits: 14, accredited: false, saberPro: 143, dropout: 13.5, breakEven: true },
  { code: "UPC-103", name: "Ingeniería Ambiental y Sanitaria", level: "Pregrado", faculty: "Ingenierías y Tecnologías", campus: "Valledupar", modality: "Presencial", students: 654, virtualCredits: 12, accredited: true, saberPro: 145, dropout: 10.8, breakEven: true },
  { code: "UPC-104", name: "Ingeniería Agroindustrial", level: "Pregrado", faculty: "Ingenierías y Tecnologías", campus: "Valledupar", modality: "Presencial", students: 522, virtualCredits: 10, accredited: false, saberPro: 141, dropout: 12.9, breakEven: true },
  { code: "UPC-105", name: "Ingeniería de Sistemas", level: "Pregrado", faculty: "Ingenierías y Tecnologías", campus: "Aguachica", modality: "Presencial", students: 348, virtualCredits: 18, accredited: false, saberPro: 139, dropout: 14.7, breakEven: false },
  { code: "UPC-106", name: "Ingeniería Agroindustrial", level: "Pregrado", faculty: "Ingenierías y Tecnologías", campus: "Aguachica", modality: "Presencial", students: 231, virtualCredits: 8, accredited: false, saberPro: 136, dropout: 16.2, breakEven: false },
  { code: "UPC-107", name: "Tecnología en Desarrollo de Software", level: "Tecnología", faculty: "Ingenierías y Tecnologías", campus: "Valledupar", modality: "Híbrida", students: 296, virtualCredits: 46, accredited: false, saberPro: null, dropout: 15.3, breakEven: true },

  // ── Ciencias Administrativas, Contables y Económicas ──
  { code: "UPC-201", name: "Administración de Empresas", level: "Pregrado", faculty: "Ciencias Administrativas, Contables y Económicas", campus: "Valledupar", modality: "Presencial", students: 934, virtualCredits: 18, accredited: true, saberPro: 142, dropout: 10.4, breakEven: true },
  { code: "UPC-202", name: "Contaduría Pública", level: "Pregrado", faculty: "Ciencias Administrativas, Contables y Económicas", campus: "Valledupar", modality: "Presencial", students: 1021, virtualCredits: 16, accredited: true, saberPro: 140, dropout: 9.8, breakEven: true },
  { code: "UPC-203", name: "Economía", level: "Pregrado", faculty: "Ciencias Administrativas, Contables y Económicas", campus: "Valledupar", modality: "Presencial", students: 412, virtualCredits: 12, accredited: false, saberPro: 144, dropout: 12.1, breakEven: true },
  { code: "UPC-204", name: "Comercio Internacional", level: "Pregrado", faculty: "Ciencias Administrativas, Contables y Económicas", campus: "Valledupar", modality: "Presencial", students: 517, virtualCredits: 15, accredited: false, saberPro: 138, dropout: 11.9, breakEven: true },
  { code: "UPC-205", name: "Administración de Empresas", level: "Pregrado", faculty: "Ciencias Administrativas, Contables y Económicas", campus: "Aguachica", modality: "Presencial", students: 389, virtualCredits: 14, accredited: false, saberPro: 135, dropout: 15.1, breakEven: false },
  { code: "UPC-206", name: "Contaduría Pública", level: "Pregrado", faculty: "Ciencias Administrativas, Contables y Económicas", campus: "Aguachica", modality: "Presencial", students: 356, virtualCredits: 14, accredited: false, saberPro: 134, dropout: 14.4, breakEven: false },

  // ── Derecho, Ciencias Políticas y Sociales ──
  { code: "UPC-301", name: "Derecho", level: "Pregrado", faculty: "Derecho, Ciencias Políticas y Sociales", campus: "Valledupar", modality: "Presencial", students: 1187, virtualCredits: 8, accredited: true, saberPro: 146, dropout: 8.9, breakEven: true },
  { code: "UPC-302", name: "Sociología", level: "Pregrado", faculty: "Derecho, Ciencias Políticas y Sociales", campus: "Valledupar", modality: "Presencial", students: 268, virtualCredits: 10, accredited: false, saberPro: 139, dropout: 14.8, breakEven: false },
  { code: "UPC-303", name: "Psicología", level: "Pregrado", faculty: "Derecho, Ciencias Políticas y Sociales", campus: "Valledupar", modality: "Presencial", students: 856, virtualCredits: 12, accredited: false, saberPro: 143, dropout: 9.6, breakEven: true },

  // ── Ciencias de la Salud ──
  { code: "UPC-401", name: "Enfermería", level: "Pregrado", faculty: "Ciencias de la Salud", campus: "Valledupar", modality: "Presencial", students: 742, virtualCredits: 6, accredited: true, saberPro: 149, dropout: 7.8, breakEven: true },
  { code: "UPC-402", name: "Instrumentación Quirúrgica", level: "Pregrado", faculty: "Ciencias de la Salud", campus: "Valledupar", modality: "Presencial", students: 385, virtualCredits: 5, accredited: false, saberPro: 144, dropout: 8.4, breakEven: true },
  { code: "UPC-403", name: "Microbiología", level: "Pregrado", faculty: "Ciencias de la Salud", campus: "Valledupar", modality: "Presencial", students: 421, virtualCredits: 7, accredited: false, saberPro: 147, dropout: 9.2, breakEven: true },

  // ── Ciencias Básicas ──
  { code: "UPC-501", name: "Matemáticas", level: "Pregrado", faculty: "Ciencias Básicas", campus: "Valledupar", modality: "Presencial", students: 176, virtualCredits: 15, accredited: false, saberPro: 151, dropout: 17.6, breakEven: false },
  { code: "UPC-502", name: "Física", level: "Pregrado", faculty: "Ciencias Básicas", campus: "Valledupar", modality: "Presencial", students: 142, virtualCredits: 13, accredited: false, saberPro: 150, dropout: 18.9, breakEven: false },

  // ── Educación ──
  { code: "UPC-601", name: "Licenciatura en Matemáticas", level: "Pregrado", faculty: "Educación", campus: "Valledupar", modality: "Presencial", students: 324, virtualCredits: 20, accredited: false, saberPro: 140, dropout: 12.5, breakEven: true },
  { code: "UPC-602", name: "Licenciatura en Lengua Castellana e Inglés", level: "Pregrado", faculty: "Educación", campus: "Valledupar", modality: "Presencial", students: 486, virtualCredits: 24, accredited: true, saberPro: 142, dropout: 10.1, breakEven: true },
  { code: "UPC-603", name: "Licenciatura en Ciencias Naturales y Educación Ambiental", level: "Pregrado", faculty: "Educación", campus: "Valledupar", modality: "Presencial", students: 298, virtualCredits: 18, accredited: false, saberPro: 138, dropout: 12.8, breakEven: true },
  { code: "UPC-604", name: "Licenciatura en Educación Física", level: "Pregrado", faculty: "Educación", campus: "Valledupar", modality: "Presencial", students: 412, virtualCredits: 10, accredited: false, saberPro: 134, dropout: 11.4, breakEven: true },

  // ── Bellas Artes ──
  { code: "UPC-701", name: "Licenciatura en Arte, Folclor y Cultura", level: "Pregrado", faculty: "Bellas Artes", campus: "Valledupar", modality: "Presencial", students: 245, virtualCredits: 8, accredited: false, saberPro: 133, dropout: 13.7, breakEven: false },
  { code: "UPC-702", name: "Música", level: "Pregrado", faculty: "Bellas Artes", campus: "Valledupar", modality: "Presencial", students: 187, virtualCredits: 6, accredited: false, saberPro: null, dropout: 15.9, breakEven: false },

  // ── Posgrados ──
  { code: "UPC-801", name: "Especialización en Gestión Ambiental", level: "Especialización", faculty: "Ingenierías y Tecnologías", campus: "Valledupar", modality: "Híbrida", students: 64, virtualCredits: 40, accredited: false, saberPro: null, dropout: 6.2, breakEven: true },
  { code: "UPC-802", name: "Especialización en Gerencia Financiera", level: "Especialización", faculty: "Ciencias Administrativas, Contables y Económicas", campus: "Valledupar", modality: "Híbrida", students: 78, virtualCredits: 38, accredited: false, saberPro: null, dropout: 5.8, breakEven: true },
  { code: "UPC-803", name: "Especialización en Derecho Administrativo", level: "Especialización", faculty: "Derecho, Ciencias Políticas y Sociales", campus: "Valledupar", modality: "Presencial", students: 56, virtualCredits: 15, accredited: false, saberPro: null, dropout: 5.1, breakEven: true },
  { code: "UPC-804", name: "Maestría en Pedagogía Ambiental para el Desarrollo Sostenible", level: "Maestría", faculty: "Educación", campus: "Valledupar", modality: "Híbrida", students: 47, virtualCredits: 45, accredited: false, saberPro: null, dropout: 4.9, breakEven: false },
  { code: "UPC-805", name: "Maestría en Ciencias Físicas", level: "Maestría", faculty: "Ciencias Básicas", campus: "Valledupar", modality: "Presencial", students: 22, virtualCredits: 20, accredited: false, saberPro: null, dropout: 6.0, breakEven: false },
  { code: "UPC-806", name: "Especialización en Gestión de Proyectos (propuesta virtual)", level: "Especialización", faculty: "Ciencias Administrativas, Contables y Económicas", campus: "Aguachica", modality: "Virtual", students: 0, virtualCredits: 100, accredited: false, saberPro: null, dropout: 0, breakEven: false },
];

/* ─── matrícula municipal (proxy de cobertura territorial) ─── */

export const MUNI_ENROLLMENT: Record<string, number> = {
  Valledupar: 8940, Aguachica: 1324, "Agustín Codazzi": 386, "La Paz": 214,
  Bosconia: 298, "El Copey": 176, Curumaní: 231, "La Jagua de Ibirico": 264,
  Chiriguaná: 158, "San Alberto": 219, "San Diego": 104, Chimichagua: 121,
  "Pueblo Bello": 87, Becerril: 96, "El Paso": 88, Astrea: 64, Pailitas: 92,
  Tamalameque: 58, Pelaya: 76, "La Gloria": 49, González: 22, Gamarra: 61,
  "Río de Oro": 83, "San Martín": 71, Manaure: 46,
};

/* ─── agregados de portafolio ─── */

export const portfolioStats = () => {
  const total = PROGRAMS.reduce((a, p) => a + p.students, 0);
  const byModality = { Presencial: 0, Híbrida: 0, Virtual: 0 } as Record<string, number>;
  const byCampus = { Valledupar: 0, Aguachica: 0 } as Record<string, number>;
  for (const p of PROGRAMS) {
    byModality[p.modality] += p.students;
    byCampus[p.campus] += p.students;
  }
  return {
    programs: PROGRAMS.length,
    students: total,
    accredited: PROGRAMS.filter((p) => p.accredited).length,
    withVirtualComponent: PROGRAMS.filter((p) => p.virtualCredits >= 20).length,
    belowBreakEven: PROGRAMS.filter((p) => !p.breakEven).length,
    avgVirtualCredits: PROGRAMS.reduce((a, p) => a + p.virtualCredits * p.students, 0) / total,
    byModality, byCampus,
  };
};
