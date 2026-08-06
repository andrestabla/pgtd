"use client";

// M4 · Indicadores: batería con serie, semáforo, dueño y periodicidad.

import { useState } from "react";
import { PageHeader, Card, DemoBanner } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { KPIS, LINES, fmtNum } from "@/data/demo";

export default function KpiPage() {
  const [lineFilter, setLineFilter] = useState<number | null>(null);
  const list = lineFilter ? KPIS.filter((k) => k.line === lineFilter) : KPIS;

  return (
    <>
      <PageHeader kicker="M4 · Indicadores" title="Indicadores de la educación digital"
        desc="Cada indicador declara quién produce el dato y con qué frecuencia: deja de ser una cifra que se reconstruye a mano y pasa a ser una responsabilidad asignada." />
      <DemoBanner />

      <div className="rise mb-5 flex flex-wrap gap-2">
        <button onClick={() => setLineFilter(null)}
          className={`chip cursor-pointer ${lineFilter === null ? "chip-cyan" : ""}`}>
          Todas · {KPIS.length}
        </button>
        {LINES.map((l) => (
          <button key={l.n} onClick={() => setLineFilter(lineFilter === l.n ? null : l.n)}
            className={`chip cursor-pointer ${lineFilter === l.n ? "chip-cyan" : ""}`}>
            {l.code} {l.short} · {KPIS.filter((k) => k.line === l.n).length}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((k, idx) => {
          const last = k.series[k.series.length - 1];
          const prev = k.series[k.series.length - 2];
          const delta = prev ? last.value - prev.value : 0;
          const improving = k.goodDirection === "up" ? delta >= 0 : delta <= 0;
          const toTarget = k.goodDirection === "up"
            ? (last.value / k.target) * 100
            : (k.target / last.value) * 100;
          const line = LINES.find((l) => l.n === k.line)!;
          return (
            <Card key={k.code} hover className={`rise rise-${Math.min(idx % 4 + 1, 4)} p-4`}>
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] font-bold leading-snug text-ink">{k.name}</div>
                <span className="chip shrink-0" style={{ borderColor: line.color, color: line.color }}>
                  {k.code}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-[24px] font-bold tracking-tight text-ink">
                  {fmtNum(last.value, 2)}
                </span>
                <span className="text-[11px] text-faint">{k.unit}</span>
                <span className="ml-auto font-mono text-[11.5px] font-semibold"
                  style={{ color: improving ? "var(--ok)" : "var(--bad)" }}>
                  {delta >= 0 ? "▲" : "▼"} {fmtNum(Math.abs(delta), 2)}
                </span>
              </div>
              <div className="mt-1.5">
                <Sparkline values={k.series.map((s) => s.value)} good={improving} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="mono-label">meta {fmtNum(k.target, 1)} {k.unit} · {k.frequency.toLowerCase()}</span>
                <span className="font-mono text-[10px]"
                  style={{ color: toTarget >= 85 ? "var(--ok)" : toTarget >= 55 ? "var(--warn)" : "var(--bad)" }}>
                  {Math.min(999, Math.round(toTarget))} % de la meta
                </span>
              </div>
              <div className="mt-2.5 border-t border-line pt-2 text-[10.5px] leading-relaxed text-faint">
                <b className="font-semibold text-muted">Dueño:</b> {k.owner} ·{" "}
                <b className="font-semibold text-muted">Fuente:</b> {k.source}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
