"use client";

// M6 · Seguimiento profundo con ruta por iniciativa:
//   /panel/iniciativas            → listado del portafolio
//   /panel/iniciativas/<id>       → ficha a pantalla completa (i1…i14)
// La ficha declara responsable, objetivo CMI, meta de resultado, acciones,
// presupuesto en tres estados, motores de riesgo, factores con historial y
// bitácora — con navegación anterior/siguiente (también flechas del teclado).

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Card, StateDot, StatusChip, StatCard } from "@/components/ui";
import { AccessChip } from "@/components/user-context";
import { BudgetBar } from "@/components/charts";
import { INITIATIVES, fmtCOP, type InitiativeDemo } from "@/data/demo";
import { CMI_OBJECTIVES, responsible, type ActionStatus } from "@/data/cmi";
import { initiativeRisk } from "@/lib/logic";
import { initiativeTaskStats } from "@/lib/proyectos";
import {
  ChevronRight, CircleCheck, CircleDashed, Circle, Flag, AlertTriangle,
  StickyNote, CalendarClock, User, Target, ArrowLeft, ArrowRight,
} from "lucide-react";

const RISK_CLS: Record<string, string> = {
  BAJO: "chip chip-ok", MEDIO: "chip", ALTO: "chip chip-warn", "CRÍTICO": "chip chip-bad",
};

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
  const router = useRouter();
  const params = useParams<{ slug?: string[] }>();
  const slug = params.slug ?? [];
  const openId = slug[0] ? decodeURIComponent(slug[0]).toLowerCase() : null;

  const go = (path: string) => router.push(path, { scroll: false });
  const openIni = (id: string) => go(`/panel/iniciativas/${id}`);
  const closeIni = () => go("/panel/iniciativas");

  if (openId) {
    return <IniciativaFicha id={openId} onClose={closeIni} onNav={openIni} />;
  }

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
        desc="Cada iniciativa declara su meta de resultado, sus acciones con meta propia, su responsable, su presupuesto en tres estados y su bitácora. Cuando un factor acumula dos revisiones en rojo, la conversación se puede tener a tiempo."  actions={<AccessChip module="iniciativas" />} />

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
          const owner = responsible(i.ownerId);
          const done = i.actions.filter((a) => a.status === "HECHA").length;
          const risk = initiativeRisk(i);
          const ts = initiativeTaskStats(i.id);
          return (
            <Card key={i.id} className={`rise rise-${Math.min(idx + 1, 4)} overflow-hidden`}>
              <button onClick={() => openIni(i.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2/50">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[14.5px] font-extrabold tracking-tight text-ink">{i.name}</span>
                    <StatusChip status={i.status} />
                    <span className="chip">{i.subsistema}</span>
                    <span className={RISK_CLS[risk.level]} title={risk.drivers.map((d) => d.text).join(" · ")}>
                      Riesgo {risk.level.toLowerCase()} · {risk.score}
                    </span>
                  </div>
                  <div className="num mt-1 text-[10.5px] text-faint">
                    {owner.dependencia} · {i.start} → {i.end} · acciones {done}/{i.actions.length}
                    {ts.total > 0 && <> · tareas {ts.done}/{ts.total}{ts.overdue > 0 && <span style={{ color: "var(--bad)" }}> · {ts.overdue} vencida{ts.overdue > 1 ? "s" : ""}</span>}</>}
                  </div>
                </div>
                <div className="hidden w-44 shrink-0 sm:block">
                  <div className="num mb-1 flex justify-between text-[9px] text-faint">
                    <span>{fmtCOP(i.budgetPlanned)}</span><span>{i.progress} %</span>
                  </div>
                  <BudgetBar planned={i.budgetPlanned} committed={i.budgetCommitted} executed={i.budgetExecuted} />
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                  {i.factors.map((f) => <StateDot key={f.name} state={f.state} size={8} />)}
                </span>
                <ChevronRight size={16} className="shrink-0 text-faint" />
              </button>
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

/* ─── ficha de iniciativa a pantalla completa ─── */

function IniciativaFicha({ id, onClose, onNav }: {
  id: string;
  onClose: () => void;
  onNav: (id: string) => void;
}) {
  const i: InitiativeDemo | null = INITIATIVES.find((x) => x.id === id) ?? null;
  const idx = i ? INITIATIVES.findIndex((x) => x.id === i.id) : -1;
  const prev = idx > 0 ? INITIATIVES[idx - 1] : null;
  const next = idx >= 0 && idx < INITIATIVES.length - 1 ? INITIATIVES[idx + 1] : null;

  // Escape vuelve al listado · flechas navegan entre iniciativas
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && prev) onNav(prev.id);
      if (e.key === "ArrowRight" && next) onNav(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav, prev, next]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  if (!i) {
    return (
      <>
        <button onClick={onClose} className="btn-ghost rise mb-5">
          <ArrowLeft size={13} /> Iniciativas
        </button>
        <p className="rounded-xl bg-surface-2 px-5 py-6 text-[13px] text-muted">
          La iniciativa <b className="num">{id}</b> no existe en el portafolio.
        </p>
      </>
    );
  }

  const owner = responsible(i.ownerId);
  const cmiObj = CMI_OBJECTIVES.find((o) => o.id === i.cmi);
  const done = i.actions.filter((a) => a.status === "HECHA").length;
  const risk = initiativeRisk(i);
  const ts = initiativeTaskStats(i.id);

  return (
    <>
      {/* barra de contexto: volver + anterior/siguiente */}
      <div className="rise mb-5 flex flex-wrap items-center gap-2">
        <button onClick={onClose} className="btn-ghost" title="Volver al listado (Esc)">
          <ArrowLeft size={13} /> Iniciativas
        </button>
        <span className="num text-[11px] text-faint">{idx + 1} de {INITIATIVES.length}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => prev && onNav(prev.id)} disabled={!prev}
            title={prev ? `${prev.id} · ${prev.name}` : undefined}
            className="btn-ghost disabled:opacity-30">
            <ArrowLeft size={13} /> <span className="num hidden sm:inline">{prev?.id ?? "—"}</span>
          </button>
          <button onClick={() => next && onNav(next.id)} disabled={!next}
            title={next ? `${next.id} · ${next.name}` : undefined}
            className="btn-ghost disabled:opacity-30">
            <span className="num hidden sm:inline">{next?.id ?? "—"}</span> <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* cabecera de la iniciativa */}
      <div className="rise rise-1 panel mb-5 overflow-hidden">
        <div className="spine h-[3px]" />
        <div className="flex flex-wrap items-start gap-x-6 gap-y-4 px-6 py-5">
          <div className="min-w-0 flex-1 basis-80">
            <div className="num text-[10.5px] font-bold text-cyan-deep">
              {i.id.toUpperCase()} <span className="font-medium text-faint">· {i.subsistema} · {i.start} → {i.end}</span>
            </div>
            <h1 className="mt-0.5 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
              {i.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusChip status={i.status} />
              <span className={RISK_CLS[risk.level]} title={risk.drivers.map((d) => d.text).join(" · ")}>
                Riesgo {risk.level.toLowerCase()} · {risk.score}/100
              </span>
              <span className="chip">acciones {done}/{i.actions.length}</span>
              {ts.total > 0 && (
                <Link href={`/panel/proyectos?ini=${i.id}`} className="chip chip-cyan">
                  tareas {ts.done}/{ts.total}
                  {ts.overdue > 0 && <b style={{ color: "var(--bad)" }}> · {ts.overdue} vencida{ts.overdue > 1 ? "s" : ""}</b>}
                  {" "}→
                </Link>
              )}
            </div>
          </div>
          <div className="w-full max-w-xs shrink-0 sm:w-56">
            <div className="num mb-1 flex justify-between text-[10px] text-faint">
              <span>{fmtCOP(i.budgetPlanned)}</span>
              <span className="font-bold text-ink">avance {i.progress} %</span>
            </div>
            <BudgetBar planned={i.budgetPlanned} committed={i.budgetCommitted} executed={i.budgetExecuted} />
            <div className="mt-2 flex items-center gap-1.5">
              {i.factors.map((f) => <StateDot key={f.name} state={f.state} size={8} />)}
              <span className="ml-1 text-[9.5px] uppercase tracking-wide text-faint">factores</span>
            </div>
          </div>
        </div>
      </div>

      {/* franja de contexto */}
      <div className="rise rise-2 panel mb-5 grid gap-4 px-6 py-4 sm:grid-cols-3">
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

      {/* detalle */}
      <div className="rise rise-3 panel">
        <div className="grid gap-7 px-6 py-5 lg:grid-cols-2">
          {/* acciones */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="label">Acciones y metas de resultado</span>
              {ts.total > 0 && (
                <Link href={`/panel/proyectos?ini=${i.id}`} className="chip chip-cyan">
                  Plan de trabajo · {ts.total} tareas →
                </Link>
              )}
            </div>
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
            {risk.drivers.length > 0 && (
              <div className="mb-5">
                <div className="label mb-2.5">Motores del riesgo ({risk.score}/100)</div>
                <div className="space-y-1.5">
                  {risk.drivers.map((d) => (
                    <div key={d.text} className="flex items-center gap-2.5 rounded-lg bg-surface-2/60 px-3 py-2">
                      <span className="chip shrink-0">{d.category}</span>
                      <span className="flex-1 text-[11.5px] leading-snug text-ink-soft">{d.text}</span>
                      <span className="num text-[10px] font-bold text-muted">+{d.weight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    </>
  );
}
