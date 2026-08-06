"use client";

// M6 · Seguimiento profundo: ficha por iniciativa con responsable, objetivo
// CMI, meta de resultado, acciones con su meta y estado, presupuesto en tres
// estados, factores críticos con historial y bitácora de seguimiento.

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Card, StateDot, StatusChip, StatCard } from "@/components/ui";
import { BudgetBar } from "@/components/charts";
import { INITIATIVES, fmtCOP } from "@/data/demo";
import { CMI_OBJECTIVES, responsible, type ActionStatus } from "@/data/cmi";
import {
  ChevronDown, CircleCheck, CircleDashed, Circle, Flag, AlertTriangle,
  StickyNote, CalendarClock, User, Target,
} from "lucide-react";

const ACTION_META: Record<ActionStatus, { icon: typeof Circle; color: string; label: string }> = {
  HECHA: { icon: CircleCheck, color: "var(--ok)", label: "Hecha" },
  EN_CURSO: { icon: CircleDashed, color: "var(--cyan)", label: "En curso" },
  PENDIENTE: { icon: Circle, color: "var(--faint)", label: "Pendiente" },
};

const LOG_META = {
  HITO: { icon: Flag, color: "var(--ok)" },
  ALERTA: { icon: AlertTriangle, color: "var(--bad)" },
  NOTA: { icon: StickyNote, color: "var(--muted)" },
} as const;

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
  const allActions = INITIATIVES.flatMap((i) => i.actions);
  const doneActions = allActions.filter((a) => a.status === "HECHA").length;

  return (
    <>
      <PageHeader kicker="M6 · Seguimiento" title="Iniciativas, acciones y factores de éxito"
        desc="Cada iniciativa declara su meta de resultado, sus acciones con meta propia, su responsable, su presupuesto en tres estados y su bitácora. Cuando un factor acumula dos revisiones en rojo, la conversación se puede tener a tiempo." />

      <div className="rise rise-1 mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Presupuesto del portafolio" value={totals.planned / 1e6} decimals={0}
          prefix="$ " unit="M COP" foot={`${INITIATIVES.length} iniciativas`} />
        <StatCard label="Ejecutado + comprometido"
          value={Math.round(((totals.executed + totals.committed) / totals.planned) * 100)} unit="%"
          foot={fmtCOP(totals.executed + totals.committed)}
          accent="linear-gradient(90deg, var(--n4), var(--n5))" />
        <StatCard label="Acciones completadas" value={doneActions} unit={`de ${allActions.length}`}
          foot="Con meta de resultado verificable" />
        <StatCard label="Factores en rojo" value={redFactors.length}
          unit={redFactors.length === 1 ? "factor" : "factores"}
          foot="dos revisiones seguidas → conversación"
          accent="linear-gradient(90deg, var(--bad), #a13c44)" />
      </div>

      <div className="space-y-3.5">
        {INITIATIVES.map((i, idx) => {
          const isOpen = open === i.id;
          const owner = responsible(i.ownerId);
          const cmiObj = CMI_OBJECTIVES.find((o) => o.id === i.cmi);
          const done = i.actions.filter((a) => a.status === "HECHA").length;
          return (
            <Card key={i.id} className={`rise rise-${Math.min(idx + 1, 4)} overflow-hidden ${isOpen ? "ring-1 ring-cyan/40" : ""}`}>
              {/* cabecera */}
              <button onClick={() => setOpen(isOpen ? null : i.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2/50">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[14.5px] font-extrabold tracking-tight text-ink">{i.name}</span>
                    <StatusChip status={i.status} />
                    <span className="chip">{i.subsistema}</span>
                  </div>
                  <div className="num mt-1 text-[10.5px] text-faint">
                    {owner.dependencia} · {i.start} → {i.end} · acciones {done}/{i.actions.length}
                  </div>
                </div>
                <div className="hidden w-44 shrink-0 sm:block">
                  <div className="num mb-1 flex justify-between text-[9px] text-faint">
                    <span>{fmtCOP(i.budgetPlanned)}</span><span>{i.progress} %</span>
                  </div>
                  <BudgetBar planned={i.budgetPlanned} committed={i.budgetCommitted} executed={i.budgetExecuted} />
                </div>
                <span className="flex shrink-0 items-center gap-1.5">
                  {i.factors.map((f) => <StateDot key={f.name} state={f.state} size={8} />)}
                </span>
                <ChevronDown size={16} className={`shrink-0 text-faint transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-line">
                  {/* franja de contexto */}
                  <div className="grid gap-4 bg-surface-2/50 px-5 py-4 sm:grid-cols-3">
                    <div className="flex items-start gap-2.5">
                      <User size={14} className="mt-0.5 shrink-0 text-cyan-deep" />
                      <div>
                        <div className="label !text-[8.5px]">Responsable</div>
                        <div className="text-[12px] font-bold leading-snug text-ink">{owner.cargo}</div>
                        <div className="text-[10.5px] text-faint">{owner.dependencia}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Target size={14} className="mt-0.5 shrink-0 text-cyan-deep" />
                      <div>
                        <div className="label !text-[8.5px]">Objetivo CMI · {i.cmi}</div>
                        <div className="text-[11.5px] font-semibold leading-snug text-ink">{cmiObj?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Flag size={14} className="mt-0.5 shrink-0 text-cyan-deep" />
                      <div>
                        <div className="label !text-[8.5px]">Meta de resultado</div>
                        <div className="text-[11.5px] font-semibold leading-snug text-ink">{i.metaResultado}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-7 px-5 py-5 lg:grid-cols-2">
                    {/* acciones */}
                    <div>
                      <div className="label mb-3">Acciones y metas de resultado</div>
                      <div className="space-y-2">
                        {i.actions.map((a) => {
                          const meta = ACTION_META[a.status];
                          return (
                            <div key={a.name} className="flex items-start gap-2.5 rounded-xl bg-surface-2/60 px-3.5 py-2.5">
                              <meta.icon size={16} className="mt-0.5 shrink-0" style={{ color: meta.color }} />
                              <div className="min-w-0 flex-1">
                                <div className="text-[12.5px] font-semibold leading-snug text-ink">{a.name}</div>
                                <div className="mt-0.5 text-[11px] text-muted">Meta: {a.meta}</div>
                              </div>
                              <div className="shrink-0 text-right">
                                <div className="num text-[9.5px] font-bold" style={{ color: meta.color }}>{meta.label}</div>
                                <div className="num text-[9px] text-faint">{a.quarter}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="label mb-3 mt-6">Ejecución presupuestal</div>
                      <BudgetBar planned={i.budgetPlanned} committed={i.budgetCommitted} executed={i.budgetExecuted} />
                      <div className="mt-2.5 grid grid-cols-3 gap-3">
                        {[
                          { l: "Ejecutado", v: i.budgetExecuted, c: "var(--n5)" },
                          { l: "Comprometido", v: i.budgetCommitted, c: "var(--cyan-fill)" },
                          { l: "Disponible", v: i.budgetPlanned - i.budgetExecuted - i.budgetCommitted, c: "var(--line-strong)" },
                        ].map((x) => (
                          <div key={x.l}>
                            <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wide text-faint">
                              <i className="h-2 w-2 rounded-sm" style={{ background: x.c }} />{x.l}
                            </div>
                            <div className="num mt-0.5 text-[12px] font-bold text-ink">{fmtCOP(x.v)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* factores + bitácora */}
                    <div>
                      <div className="label mb-3">Factores críticos de éxito</div>
                      <div className="space-y-1.5">
                        {i.factors.map((f) => (
                          <div key={f.name} className="rounded-xl bg-surface-2/60 px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <StateDot state={f.state} />
                              <span className="flex-1 text-[12.5px] font-semibold text-ink">{f.name}</span>
                              <span className="flex items-center gap-1">
                                {f.history.map((h, hi) => (
                                  <StateDot key={hi} state={h as "VERDE" | "AMBAR" | "ROJO"} size={7} />
                                ))}
                              </span>
                            </div>
                            {f.note && <div className="mt-1 pl-[22px] text-[11px] leading-snug text-muted">{f.note}</div>}
                          </div>
                        ))}
                      </div>

                      <div className="label mb-3 mt-6">Bitácora de seguimiento</div>
                      {i.log.length === 0 ? (
                        <p className="text-[11.5px] italic text-faint">Sin registros: la iniciativa no ha iniciado.</p>
                      ) : (
                        <div className="relative space-y-3 pl-5">
                          <span className="absolute bottom-1 left-[7px] top-1 w-px bg-line-strong" />
                          {i.log.map((l) => {
                            const meta = LOG_META[l.type];
                            return (
                              <div key={l.date + l.text} className="relative">
                                <span className="absolute -left-[18px] top-[3px] grid h-[14px] w-[14px] place-items-center rounded-full bg-surface"
                                  style={{ boxShadow: `0 0 0 1.5px ${meta.color}` }}>
                                  <meta.icon size={8} style={{ color: meta.color }} />
                                </span>
                                <div className="num text-[9.5px] font-bold text-faint">{l.date}</div>
                                <div className="text-[12px] leading-snug text-ink-soft">{l.text}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-cyan-wash px-3.5 py-3">
                        <CalendarClock size={14} className="mt-0.5 shrink-0 text-cyan-deep" />
                        <div>
                          <div className="label !text-[8.5px] !text-cyan-deep">Próximo hito · {i.nextMilestone.date}</div>
                          <div className="text-[12px] font-semibold leading-snug text-ink">{i.nextMilestone.text}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-5 text-center text-[11px] text-faint">
        ¿Buscas la vista de planeación? El <Link href="/panel/ruta" className="font-semibold text-cyan-deep">roadmap por horizontes</Link>{" "}
        muestra estas mismas iniciativas en Gantt y matriz de priorización.
      </p>
    </>
  );
}
