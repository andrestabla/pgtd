"use client";

// M4 · Indicadores con ficha completa: definición operativa, fórmula, serie
// con notas, dueño del dato, fuente, periodicidad y objetivo CMI.

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Card } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { KPIS, LINES, INITIATIVES, fmtNum } from "@/data/demo";
import { CMI_OBJECTIVES, responsible } from "@/data/cmi";
import { X, User, Database, CalendarClock, Target, ListChecks, Sigma } from "lucide-react";

export default function KpiPage() {
  const [lineFilter, setLineFilter] = useState<number | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const list = lineFilter ? KPIS.filter((k) => k.line === lineFilter) : KPIS;
  const kpi = open ? KPIS.find((k) => k.code === open) : null;
  const kpiObj = kpi ? CMI_OBJECTIVES.find((o) => o.id === kpi.cmi) : null;
  const kpiInis = kpi ? INITIATIVES.filter((i) => i.kpi === kpi.code) : [];

  return (
    <>
      <PageHeader kicker="M4 · Indicadores" title="Indicadores de la educación digital"
        desc="Cada indicador declara su definición operativa, su fórmula, quién produce el dato y con qué frecuencia. Clic en una tarjeta para abrir la ficha completa." />

      <div className="rise mb-5 flex flex-wrap gap-2">
        <button onClick={() => setLineFilter(null)}
          className={`chip cursor-pointer ${lineFilter === null ? "chip-cyan" : ""}`}>
          Todos · {KPIS.length}
        </button>
        {LINES.map((l) => (
          <button key={l.n} onClick={() => setLineFilter(lineFilter === l.n ? null : l.n)}
            className={`chip cursor-pointer ${lineFilter === l.n ? "chip-cyan" : ""}`}>
            {l.code} {l.short} · {KPIS.filter((k) => k.line === l.n).length}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* tarjetas */}
        <div className="grid content-start gap-3.5 sm:grid-cols-2">
          {list.map((k, idx) => {
            const last = k.series[k.series.length - 1];
            const prev = k.series[k.series.length - 2];
            const delta = prev ? last.value - prev.value : 0;
            const improving = k.goodDirection === "up" ? delta >= 0 : delta <= 0;
            const toTarget = k.goodDirection === "up"
              ? (last.value / k.target) * 100
              : (k.target / last.value) * 100;
            const line = LINES.find((l) => l.n === k.line)!;
            const active = open === k.code;
            return (
              <button key={k.code} onClick={() => setOpen(active ? null : k.code)}
                className={`panel panel-lift rise rise-${Math.min(idx % 4 + 1, 4)} p-4 text-left ${
                  active ? "ring-2 ring-cyan" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[12.5px] font-bold leading-snug text-ink">{k.name}</div>
                  <span className="chip shrink-0" style={{ color: line.color }}>{k.code}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="num text-[22px] font-extrabold text-ink">{fmtNum(last.value, 2)}</span>
                  <span className="text-[10.5px] text-faint">{k.unit}</span>
                  <span className="num ml-auto text-[11px] font-bold"
                    style={{ color: improving ? "var(--ok)" : "var(--bad)" }}>
                    {delta >= 0 ? "▲" : "▼"} {fmtNum(Math.abs(delta), 2)}
                  </span>
                </div>
                <div className="mt-1"><Sparkline values={k.series.map((s) => s.value)} good={improving} /></div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="label !text-[8.5px]">meta {fmtNum(k.target, 1)} · {k.frequency.toLowerCase()}</span>
                  <span className="num text-[9.5px] font-bold"
                    style={{ color: toTarget >= 85 ? "var(--ok)" : toTarget >= 55 ? "var(--warn)" : "var(--bad)" }}>
                    {Math.min(999, Math.round(toTarget))} % de la meta
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ficha */}
        <div className="lg:sticky lg:top-[70px] lg:self-start">
          <Card className="rise rise-2">
            {!kpi ? (
              <div className="px-5 py-6 text-[12.5px] italic text-faint">
                Abre un indicador para ver su ficha: definición operativa, fórmula,
                serie con notas, dueño del dato y objetivo estratégico al que sirve.
              </div>
            ) : (
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="num text-[10px] font-bold text-cyan-deep">{kpi.code}</div>
                    <h3 className="text-[15px] font-extrabold leading-snug text-ink">{kpi.name}</h3>
                  </div>
                  <button onClick={() => setOpen(null)}
                    className="rounded-md p-1 text-faint transition-colors hover:bg-surface-2 hover:text-ink">
                    <X size={15} />
                  </button>
                </div>

                <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-soft">{kpi.definition}</p>

                <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface-2 px-3 py-2.5">
                  <Sigma size={13} className="mt-0.5 shrink-0 text-muted" />
                  <code className="num text-[11px] leading-relaxed text-ink-soft">{kpi.formula}</code>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="flex items-start gap-2">
                    <User size={13} className="mt-0.5 shrink-0 text-cyan-deep" />
                    <div>
                      <div className="label !text-[8.5px]">Dueño del dato</div>
                      <div className="text-[11.5px] font-semibold leading-snug text-ink">
                        {responsible(kpi.ownerId).cargo}
                      </div>
                      <div className="text-[10px] text-faint">{responsible(kpi.ownerId).dependencia}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Database size={13} className="mt-0.5 shrink-0 text-cyan-deep" />
                    <div>
                      <div className="label !text-[8.5px]">Fuente</div>
                      <div className="text-[11.5px] font-semibold leading-snug text-ink">{kpi.source}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarClock size={13} className="mt-0.5 shrink-0 text-cyan-deep" />
                    <div>
                      <div className="label !text-[8.5px]">Periodicidad</div>
                      <div className="text-[11.5px] font-semibold text-ink">{kpi.frequency}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target size={13} className="mt-0.5 shrink-0 text-cyan-deep" />
                    <div>
                      <div className="label !text-[8.5px]">Línea base → meta</div>
                      <div className="num text-[11.5px] font-semibold text-ink">
                        {fmtNum(kpi.baseline, 1)} → {fmtNum(kpi.target, 1)} {kpi.unit}
                      </div>
                    </div>
                  </div>
                </div>

                {kpiObj && (
                  <Link href="/panel/capacidades"
                    className="mt-4 block rounded-lg bg-navy px-3.5 py-2.5 transition-transform hover:translate-x-0.5">
                    <div className="num text-[9px] font-bold text-white/60">{kpiObj.id} · OBJETIVO CMI</div>
                    <div className="text-[12px] font-semibold leading-snug text-white">{kpiObj.name}</div>
                  </Link>
                )}

                <div className="mt-4">
                  <div className="label mb-2">Serie del indicador</div>
                  <table className="w-full">
                    <tbody>
                      {kpi.series.map((s) => (
                        <tr key={s.period} className="border-b border-line last:border-0">
                          <td className="num py-1.5 pr-2 text-[11px] font-semibold text-muted">{s.period}</td>
                          <td className="num py-1.5 pr-2 text-right text-[12px] font-bold text-ink">
                            {fmtNum(s.value, 2)}
                          </td>
                          <td className="py-1.5 text-[10.5px] italic leading-snug text-faint">{s.note ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {kpiInis.length > 0 && (
                  <div className="mt-4">
                    <div className="label mb-2 flex items-center gap-1.5">
                      <ListChecks size={11} /> Iniciativas que lo mueven
                    </div>
                    {kpiInis.map((i) => (
                      <Link key={i.id} href="/panel/iniciativas"
                        className="block rounded-lg bg-gold-wash px-3 py-2 transition-transform hover:translate-x-0.5">
                        <div className="text-[12px] font-semibold text-ink">{i.name}</div>
                        <div className="num mt-0.5 text-[10px]" style={{ color: "var(--gold)" }}>
                          avance {i.progress} % · {i.start} → {i.end}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
