// Utilidad de periodos compartida entre el motor (lib/logic) y el store.
// Periodos soportados: "2026", "2026-S1", "2026-T3". Se mapean a un índice
// mensual comparable para calcular rezago, orden y proyecciones.

export function periodIndex(period: string): number {
  const m = period.match(/^(\d{4})(?:-([ST])(\d))?$/);
  if (!m) return 0;
  const year = Number(m[1]);
  if (!m[2]) return year * 12 + 6;                       // anual → mitad de año
  if (m[2] === "S") return year * 12 + (Number(m[3]) === 1 ? 3 : 9);
  return year * 12 + (Number(m[3]) * 3 - 1);            // trimestre → mes final
}

export const isValidPeriod = (period: string) => periodIndex(period) > 0;
