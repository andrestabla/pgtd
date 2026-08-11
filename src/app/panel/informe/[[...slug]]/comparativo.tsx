"use client";

// Comparativo entre mediciones: la vigente contra la anterior, celda por
// celda (línea × dimensión), con los mayores avances y los retrocesos.

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui";
import { LINES, DIMENSIONS, fmtNum } from "@/data/demo";
import { useMaturity } from "@/lib/use-maturity";
import { Loader2, ArrowUpRight, ArrowDownRight, Minus, ExternalLink } from "lucide-react";

export default function ComparativoTab() {
  const { data, scores } = useMaturity();
  const prev = data?.previous?.scores ?? null;

  const cells = useMemo(() => {
    if (!prev) return [];
    const out: { n: number; short: string; color: string; dim: string; before: number; now: number; delta: number; target: number }[] = [];
    for (const line of LINES) {
      for (const d of DIMENSIONS) {
        const c = scores[line.n]?.[d.key];
        const p = prev[line.n]?.[d.key];
        if (!c || !p) continue;
        out.push({
          n: line.n, short: line.short, color: line.color, dim: d.name,
          before: p.value, now: c.value, delta: Math.round((c.value - p.value) * 10) / 10,
          target: c.target,
        });
      }
    }
    return out;
  }, [scores, prev]);

  if (!data) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <span className="flex items-center gap-2 text-[13px] text-muted">
          <Loader2 size={16} className="animate-spin" /> Cargando las mediciones…
        </span>
      </div>
    );
  }

  if (!prev) {
    return (
      <Card>
        <div className="grid place-items-center px-6 py-16 text-center">
          <div>
            <div className="text-[14px] font-bold text-ink">Aún no hay dos mediciones para comparar</div>
            <p className="mx-auto mt-1 max-w-[420px] text-[12.5px] text-muted">
              El comparativo se habilita cuando existe una medición anterior a la vigente.
              Publica el siguiente corte desde el módulo de madurez.
            </p>
            <Link href="/panel/madurez" className="btn-primary mt-4 inline-flex !py-2 text-[12px]">
              Ir a madurez
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  const subidas = [...cells].filter((c) => c.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 4);
  const bajadas = [...cells].filter((c) => c.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 4);
  const quietas = cells.filter((c) => c.delta === 0).length;
  const avg = (m: typeof scores, n: number) => {
    const dims = Object.values(m[n]);
    return dims.reduce((a, d) => a + d.value, 0) / dims.length;
  };

  const deltaIcon = (d: number) =>
    d > 0 ? <ArrowUpRight size={12} /> : d < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />;
  const deltaColor = (d: number) => (d > 0 ? "var(--ok)" : d < 0 ? "var(--bad)" : "var(--faint)");

  return (
    <>
      <Card className="mb-5">
        <CardHeader
          title={`${data.previous!.label} → ${data.current.label}`}
          sub={`${data.previous!.period} frente a ${data.current.period} · ${subidas.length ? `${cells.filter((c) => c.delta > 0).length} celdas suben` : "sin subidas"} · ${cells.filter((c) => c.delta < 0).length} bajan · ${quietas} sin cambio`} />
        <div className="grid gap-x-8 gap-y-4 px-5 pb-5 sm:grid-cols-2">
          {LINES.map((line) => {
            const before = avg(prev, line.n);
            const now = avg(scores, line.n);
            const d = Math.round((now - before) * 10) / 10;
            return (
              <div key={line.n}>
                <div className="mb-1 flex items-baseline justify-between text-[12px]">
                  <span className="font-bold text-ink">{line.code} {line.name}</span>
                  <span className="num flex items-center gap-0.5 font-extrabold" style={{ color: deltaColor(d) }}>
                    {deltaIcon(d)} {d > 0 ? "+" : ""}{fmtNum(d, 1)}
                  </span>
                </div>
                <div className="relative h-[10px] overflow-hidden rounded-full bg-surface-2">
                  <div className="absolute inset-y-0 left-0 rounded-full opacity-35" style={{ width: `${(before / 5) * 100}%`, background: line.color }} />
                  <div className="absolute inset-y-0 left-0 h-full rounded-full" style={{ width: `${(now / 5) * 100}%`, background: line.color, opacity: 0.9 }} />
                </div>
                <div className="num mt-0.5 text-[10px] text-faint">{fmtNum(before, 2)} → {fmtNum(now, 2)} / 5</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* matriz de deltas línea × dimensión */}
      <Card className="mb-5">
        <CardHeader title="Movimiento celda a celda" sub="cada celda muestra nivel anterior → vigente; el color marca la dirección" />
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[560px] text-[11.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wide text-faint">
                <th className="py-2 pr-2 font-semibold">Línea</th>
                {DIMENSIONS.map((d) => <th key={d.key} className="px-2 py-2 font-semibold">{d.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {LINES.map((line) => (
                <tr key={line.n} className="border-t border-line">
                  <td className="py-2 pr-2 font-bold text-ink">{line.code} {line.short}</td>
                  {DIMENSIONS.map((d) => {
                    const cell = cells.find((c) => c.n === line.n && c.dim === d.name);
                    if (!cell) return <td key={d.key} />;
                    return (
                      <td key={d.key} className="px-2 py-2">
                        <span className="num inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold"
                          style={{
                            background: cell.delta > 0 ? "color-mix(in srgb, var(--ok) 12%, transparent)"
                              : cell.delta < 0 ? "color-mix(in srgb, var(--bad) 10%, transparent)" : "var(--surface-2)",
                            color: deltaColor(cell.delta),
                          }}>
                          {fmtNum(cell.before, 0)} → {fmtNum(cell.now, 0)} {deltaIcon(cell.delta)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Mayores avances" sub="las celdas que más subieron entre mediciones" />
          <div className="space-y-1 px-5 pb-4">
            {subidas.length === 0 && <p className="py-3 text-[12px] text-muted">Ninguna celda subió en este corte.</p>}
            {subidas.map((c) => (
              <div key={`${c.n}-${c.dim}`} className="flex items-center gap-3 py-1.5">
                <i className="h-7 w-1 shrink-0 rounded-full" style={{ background: c.color }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-ink">{c.short} · {c.dim}</div>
                  <div className="num text-[10.5px] text-muted">{fmtNum(c.before, 1)} → {fmtNum(c.now, 1)} · meta {fmtNum(c.target, 1)}</div>
                </div>
                <span className="num flex items-center gap-0.5 text-[13px] font-extrabold" style={{ color: "var(--ok)" }}>
                  <ArrowUpRight size={13} /> +{fmtNum(c.delta, 1)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Retrocesos y estancamientos" sub="celdas que bajaron o siguen lejos de la meta sin moverse" />
          <div className="space-y-1 px-5 pb-4">
            {bajadas.map((c) => (
              <div key={`${c.n}-${c.dim}`} className="flex items-center gap-3 py-1.5">
                <i className="h-7 w-1 shrink-0 rounded-full" style={{ background: c.color }} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-ink">{c.short} · {c.dim}</div>
                  <div className="num text-[10.5px] text-muted">{fmtNum(c.before, 1)} → {fmtNum(c.now, 1)} · meta {fmtNum(c.target, 1)}</div>
                </div>
                <span className="num flex items-center gap-0.5 text-[13px] font-extrabold" style={{ color: "var(--bad)" }}>
                  <ArrowDownRight size={13} /> {fmtNum(c.delta, 1)}
                </span>
              </div>
            ))}
            {cells.filter((c) => c.delta === 0 && c.target - c.now >= 2)
              .sort((a, b) => (b.target - b.now) - (a.target - a.now)).slice(0, 4 - Math.min(bajadas.length, 4))
              .map((c) => (
                <div key={`q-${c.n}-${c.dim}`} className="flex items-center gap-3 py-1.5">
                  <i className="h-7 w-1 shrink-0 rounded-full" style={{ background: c.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-bold text-ink">{c.short} · {c.dim}</div>
                    <div className="num text-[10.5px] text-muted">sin cambio en {fmtNum(c.now, 1)} · brecha {fmtNum(c.target - c.now, 1)} a la meta</div>
                  </div>
                  <span className="num flex items-center gap-0.5 text-[13px] font-extrabold text-faint"><Minus size={13} /> 0</span>
                </div>
              ))}
            <Link href="/panel/madurez/variables" className="inline-flex items-center gap-1 pt-1.5 text-[11px] font-bold text-cyan-deep hover:underline">
              Ver las variables detrás de cada celda <ExternalLink size={11} />
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
