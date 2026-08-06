// ─────────────────────────────────────────────────────────────────────────────
// PGTD · Registros calificados del portafolio (Decreto 1330 de 2019).
// Vigencia de 7 años; la renovación debe radicarse con la debida antelación.
// Estados: VIGENTE · POR_VENCER (< 18 meses al corte demo, mar-2027) ·
// EN_RENOVACION (radicado ante el MEN). Cifras ilustrativas.
// ─────────────────────────────────────────────────────────────────────────────

import { PROGRAMS, type Program } from "./portfolio";

export type RegCalStatus = "VIGENTE" | "POR_VENCER" | "EN_RENOVACION";

export type RegCal = {
  code: string;                // código del programa
  campus: Program["campus"];
  resolucion: string;          // resolución MEN
  otorgado: string;            // AAAA-MM
  vence: string;               // AAAA-MM
  estado: RegCalStatus;
  ultimaAutoevaluacion: number; // año del último ejercicio
  modalidadRegistro: "Presencial" | "Virtual" | "Presencial y virtual";
};

// Corte demo: marzo de 2027. POR_VENCER = vence antes de sep-2028.
const REG_RAW: Omit<RegCal, "estado">[] = [
  { code: "UPC-101", campus: "Valledupar", resolucion: "MEN 011245 de 2021", otorgado: "2021-07", vence: "2028-07", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-102", campus: "Valledupar", resolucion: "MEN 019873 de 2020", otorgado: "2020-11", vence: "2027-11", ultimaAutoevaluacion: 2024, modalidadRegistro: "Presencial" },
  { code: "UPC-103", campus: "Valledupar", resolucion: "MEN 004521 de 2022", otorgado: "2022-04", vence: "2029-04", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-104", campus: "Valledupar", resolucion: "MEN 015662 de 2021", otorgado: "2021-10", vence: "2028-10", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-105", campus: "Aguachica", resolucion: "MEN 008834 de 2020", otorgado: "2020-06", vence: "2027-06", ultimaAutoevaluacion: 2024, modalidadRegistro: "Presencial" },
  { code: "UPC-106", campus: "Aguachica", resolucion: "MEN 021458 de 2022", otorgado: "2022-12", vence: "2029-12", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-107", campus: "Valledupar", resolucion: "MEN 013209 de 2023", otorgado: "2023-05", vence: "2030-05", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-201", campus: "Valledupar", resolucion: "MEN 002318 de 2021", otorgado: "2021-03", vence: "2028-03", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-202", campus: "Valledupar", resolucion: "MEN 017754 de 2022", otorgado: "2022-09", vence: "2029-09", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-203", campus: "Valledupar", resolucion: "MEN 009467 de 2021", otorgado: "2021-06", vence: "2028-06", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-204", campus: "Valledupar", resolucion: "MEN 020156 de 2020", otorgado: "2020-12", vence: "2027-12", ultimaAutoevaluacion: 2024, modalidadRegistro: "Presencial" },
  { code: "UPC-205", campus: "Aguachica", resolucion: "MEN 006672 de 2020", otorgado: "2020-05", vence: "2027-05", ultimaAutoevaluacion: 2023, modalidadRegistro: "Presencial" },
  { code: "UPC-206", campus: "Aguachica", resolucion: "MEN 014983 de 2021", otorgado: "2021-09", vence: "2028-09", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-301", campus: "Valledupar", resolucion: "MEN 001127 de 2023", otorgado: "2023-02", vence: "2030-02", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-302", campus: "Valledupar", resolucion: "MEN 018345 de 2021", otorgado: "2021-11", vence: "2028-11", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-303", campus: "Valledupar", resolucion: "MEN 010598 de 2022", otorgado: "2022-06", vence: "2029-06", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-401", campus: "Valledupar", resolucion: "MEN 003876 de 2022", otorgado: "2022-03", vence: "2029-03", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-402", campus: "Valledupar", resolucion: "MEN 016229 de 2021", otorgado: "2021-08", vence: "2028-08", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-403", campus: "Valledupar", resolucion: "MEN 007741 de 2023", otorgado: "2023-04", vence: "2030-04", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-501", campus: "Valledupar", resolucion: "MEN 012054 de 2020", otorgado: "2020-09", vence: "2027-09", ultimaAutoevaluacion: 2024, modalidadRegistro: "Presencial" },
  { code: "UPC-502", campus: "Valledupar", resolucion: "MEN 022837 de 2022", otorgado: "2022-11", vence: "2029-11", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-601", campus: "Valledupar", resolucion: "MEN 005519 de 2021", otorgado: "2021-04", vence: "2028-04", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-602", campus: "Valledupar", resolucion: "MEN 019012 de 2022", otorgado: "2022-08", vence: "2029-08", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-603", campus: "Valledupar", resolucion: "MEN 008163 de 2021", otorgado: "2021-05", vence: "2028-05", ultimaAutoevaluacion: 2024, modalidadRegistro: "Presencial" },
  { code: "UPC-604", campus: "Valledupar", resolucion: "MEN 015447 de 2023", otorgado: "2023-07", vence: "2030-07", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-701", campus: "Valledupar", resolucion: "MEN 011936 de 2020", otorgado: "2020-10", vence: "2027-10", ultimaAutoevaluacion: 2023, modalidadRegistro: "Presencial" },
  { code: "UPC-702", campus: "Valledupar", resolucion: "MEN 021670 de 2022", otorgado: "2022-05", vence: "2029-05", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-801", campus: "Valledupar", resolucion: "MEN 004098 de 2023", otorgado: "2023-03", vence: "2030-03", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-802", campus: "Valledupar", resolucion: "MEN 017521 de 2021", otorgado: "2021-12", vence: "2028-12", ultimaAutoevaluacion: 2025, modalidadRegistro: "Presencial" },
  { code: "UPC-803", campus: "Valledupar", resolucion: "MEN 009284 de 2022", otorgado: "2022-02", vence: "2029-02", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-804", campus: "Valledupar", resolucion: "MEN 013775 de 2021", otorgado: "2021-02", vence: "2028-02", ultimaAutoevaluacion: 2024, modalidadRegistro: "Presencial" },
  { code: "UPC-805", campus: "Valledupar", resolucion: "MEN 020908 de 2023", otorgado: "2023-06", vence: "2030-06", ultimaAutoevaluacion: 2026, modalidadRegistro: "Presencial" },
  { code: "UPC-806", campus: "Aguachica", resolucion: "En documento maestro", otorgado: "—", vence: "—", ultimaAutoevaluacion: 2026, modalidadRegistro: "Virtual" },
];

// Renovaciones ya radicadas ante el MEN (corte demo)
const EN_RENOVACION = new Set(["UPC-105", "UPC-205"]);

const DEMO_CUTOFF = 2027 * 12 + 2;       // mar-2027
const POR_VENCER_HORIZON = 18;           // meses

const monthIndex = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};

export const REG_CALIFICADOS: RegCal[] = REG_RAW.map((r) => {
  let estado: RegCalStatus = "VIGENTE";
  if (EN_RENOVACION.has(r.code)) estado = "EN_RENOVACION";
  else if (r.vence !== "—" && monthIndex(r.vence) - DEMO_CUTOFF <= POR_VENCER_HORIZON) {
    estado = "POR_VENCER";
  }
  return { ...r, estado };
});

export const regCalOf = (code: string) => REG_CALIFICADOS.find((r) => r.code === code);

export const regCalStats = () => {
  const withReg = REG_CALIFICADOS.filter((r) => r.vence !== "—");
  return {
    total: REG_CALIFICADOS.length,
    vigentes: withReg.filter((r) => r.estado === "VIGENTE").length,
    porVencer: withReg.filter((r) => r.estado === "POR_VENCER").length,
    enRenovacion: withReg.filter((r) => r.estado === "EN_RENOVACION").length,
    enTramite: REG_CALIFICADOS.filter((r) => r.vence === "—").length,
    autoevaluacionAtrasada: REG_CALIFICADOS.filter((r) => r.ultimaAutoevaluacion <= 2023).length,
    sinModalidadVirtual: REG_CALIFICADOS.filter((r) => r.modalidadRegistro === "Presencial").length,
  };
};

export const programOf = (code: string) => PROGRAMS.find((p) => p.code === code);
