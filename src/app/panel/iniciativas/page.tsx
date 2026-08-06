"use client";

// M6 · Seguimiento: presupuesto en tres estados + factores críticos de éxito.

import { useState } from "react";
import { PageHeader, Card, CardHeader, StateDot, StatusChip, StatCard } from "@/components/ui";
import { BudgetBar } from "@/components/charts";
import { INITIATIVES, fmtCOP } from "@/data/demo";
import { ChevronDown } from "lucide-react";

export default function IniciativasPage() {
  const [open, setOpen] = useState<string | null>(INITIATIVES[0].id);

  const totals = INITIATIVES.reduce(
    (a, i) => ({
      planned: a.planned + i.budgetPlanned,
      committed: a.committed + i.budgetCommitted,
      executed: a.executed + i.budgetExecuted,
    }),
    { planned: 0, committed: 0, executed: 0 },
  );
  const redFactors = INITIATIVES.flatMap((i) => i.factors.filter((f) => f.state === "ROJO"));

  return (
    <>
      <PageHeader kicker="M6 · Seguimiento" title="Iniciativas, presupuesto y factores de éxito"
        desc="El módulo de ejecución. Cuando un factor acumula dos revisiones en rojo, la conversación se puede tener a tiempo: es el mecanismo para detectar que una iniciativa va a fracasar antes de que fracase." />

      <div className="rise rise-1 mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Presupuesto del portafolio" value={totals.planned / 1e6} decimals={0}
          prefix="$ " unit="millones COP" foot={`${INITIATIVES.length} iniciativas`} />
        <StatCard label="Ejecutado + comprometido"
          value={Math.round(((totals.executed + totals.committed) / totals.planned) * 100)} unit="%"
          foot={fmtCOP(totals.executed + totals.committed)}
          accent="linear-gradient(90deg, var(--n4), var(--n5))" />
        <StatCard label="Factores en rojo" value={redFactors.length}
          unit={redFactors.length === 1 ? "factor" : "factores"}
          foot="dos revisiones seguidas → conversación"
          accent="linear-gradient(90deg, var(--bad), #a13c44)" />
      </div>

      <div className="space-y-3">
        {INITIATIVES.map((i, idx) => {
          const isOpen = open === i.id;
          return (
            <Card key={i.id} className={`rise rise-${Math.min(idx + 1, 4)} overflow-hidden`}>
              <button onClick={() => setOpen(isOpen ? null : i.id)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-2/60">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[14px] font-bold text-ink">{i.name}</span>
                    <StatusChip status={i.status} />
                  </div>
                  <div className="mt-0.5 font-mono text-[10.5px] text-faint">
                    {i.owner} · {i.start} → {i.end}
                  </div>
                </div>
                <div className="hidden w-44 shrink-0 sm:block">
                  <div className="mb-1 flex justify-between font-mono text-[9.5px] text-faint">
                    <span>{fmtCOP(i.budgetPlanned)}</span><span>{i.progress} %</span>
                  </div>
                  <BudgetBar planned={i.budgetPlanned} committed={i.budgetCommitted} executed={i.budgetExecuted} />
                </div>
                <span className="flex shrink-0 items-center gap-1">
                  {i.factors.map((f) => <StateDot key={f.name} state={f.state} />)}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-faint transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="grid gap-6 border-t border-line px-5 py-5 lg:grid-cols-2">
                  <div>
                    <div className="label mb-3">Ejecución presupuestal</div>
                    <BudgetBar planned={i.budgetPlanned} committed={i.budgetCommitted} executed={i.budgetExecuted} />
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {[
                        { l: "Ejecutado", v: i.budgetExecuted, c: "var(--n5)" },
                        { l: "Comprometido", v: i.budgetCommitted, c: "var(--cyan-fill)" },
                        { l: "Disponible", v: i.budgetPlanned - i.budgetExecuted - i.budgetCommitted, c: "var(--line-strong)" },
                      ].map((x) => (
                        <div key={x.l}>
                          <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wide text-faint">
                            <i className="h-2 w-2 rounded-sm" style={{ background: x.c }} />{x.l}
                          </div>
                          <div className="mt-0.5 font-mono text-[12.5px] font-semibold text-ink">{fmtCOP(x.v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="label mb-3">Factores críticos de éxito</div>
                    <div className="space-y-1.5">
                      {i.factors.map((f) => (
                        <div key={f.name} className="flex items-center gap-2.5 rounded-lg bg-surface-2/60 px-3 py-2">
                          <StateDot state={f.state} />
                          <span className="flex-1 text-[12.5px] font-medium text-ink-soft">{f.name}</span>
                          <span className="flex items-center gap-1">
                            {f.history.map((h, hi) => (
                              <StateDot key={hi} state={h as "VERDE" | "AMBAR" | "ROJO"} />
                            ))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-right font-mono text-[9.5px] uppercase tracking-wider text-faint">
                      historial · últimas revisiones
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
