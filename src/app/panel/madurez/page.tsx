"use client";

// M1 · Diagnóstico de madurez.
// Cuatro vistas: Resumen (radar + heatmap + ciclo), Variables (las 52
// variables del instrumento con hallazgo, recomendación y evidencia),
// Dominios (cortes temáticos: oferta, docentes, recursos, autoevaluación,
// arquitectura, investigación) y Registros calificados (Decreto 1330).

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, CardHeader, LevelBadge, StateDot } from "@/components/ui";
import { AccessChip } from "@/components/user-context";
import { MaturityRadar, MaturityHeatmap } from "@/components/charts";
import { LINES, DIMENSIONS, SCORES, LEVELS, EVIDENCES, fmtNum } from "@/data/demo";
import { ASSESSMENTS, responsible } from "@/data/cmi";
import {
  VARIABLES, variablesOf, gapOf, DOMAINS, domainScore, type Variable, type Frame,
} from "@/data/instrument";
import { REG_CALIFICADOS, regCalStats, programOf } from "@/data/regcal";
import {
  iesSummary, P as pIES, E as eIES, S as sIES, gapReading, IES_LEVELS, levelOf,
  practiceState, practiceStateCounts, PRACTICE_STATES,
} from "@/lib/ies";
import { ACTOR_GROUPS, responsesOf, topDissensus } from "@/data/actores";
import { KPIS, INITIATIVES } from "@/data/demo";
import {
  FileText, X, CheckCircle2, Clock3, History, ChevronDown, BookOpenCheck,
  Search, Lightbulb, AlertCircle, Layers, ScrollText, Sigma, ShieldAlert,
} from "lucide-react";

const LEVEL_BG = ["", "var(--n1)", "var(--n2)", "var(--n3)", "var(--n4)", "var(--n5)"];
const FRAME_COLORS: Record<Frame, string> = {
  eMM: "var(--cyan-deep)", "Decreto 1330": "var(--navy)", CNA: "var(--gold)",
  "TOGAF 10": "var(--n4)", "DAMA-DMBOK": "#7c5cd6", INTEF: "var(--n2)",
  "ISO 27001": "var(--bad)", CMI: "var(--muted)",
};

type Tab = "resumen" | "variables" | "dominios" | "registros" | "ies";

const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: "resumen", label: "Resumen", icon: Layers },
  { id: "variables", label: "Variables del instrumento", icon: Search },
  { id: "dominios", label: "Dominios diagnósticos", icon: BookOpenCheck },
  { id: "registros", label: "Registros calificados", icon: ScrollText },
  { id: "ies", label: "Índices IES", icon: Sigma },
];

export default function MadurezPage() {
  const [tab, setTab] = useState<Tab>("resumen");
  const [cellFilter, setCellFilter] = useState<{ line: number; dim: string } | null>(null);
  const [lineFilter, setLineFilter] = useState<number | null>(null);
  const [frameFilter, setFrameFilter] = useState<Frame | null>(null);
  const [onlyGaps, setOnlyGaps] = useState(false);
  const [openVar, setOpenVar] = useState<string | null>(null);

  const openCell = (line: number, dim: string) => {
    setCellFilter({ line, dim });
    setLineFilter(null);
    setFrameFilter(null);
    setTab("variables");
  };

  const filteredVars = useMemo(() => {
    let list = VARIABLES;
    if (cellFilter) list = list.filter((v) => v.line === cellFilter.line && v.dimension === cellFilter.dim);
    if (lineFilter) list = list.filter((v) => v.line === lineFilter);
    if (frameFilter) list = list.filter((v) => v.frame === frameFilter);
    if (onlyGaps) list = list.filter((v) => gapOf(v) >= 2);
    return list;
  }, [cellFilter, lineFilter, frameFilter, onlyGaps]);

  const frames = useMemo(() => [...new Set(VARIABLES.map((v) => v.frame))], []);
  const strengths = VARIABLES.filter((v) => v.value >= 4).length;
  const criticalGaps = VARIABLES.filter((v) => gapOf(v) >= 3).length;
  const rc = regCalStats();

  return (
    <>
      <PageHeader kicker="M1 · Diagnóstico de madurez" title="Madurez por línea y dimensión"
        desc={`${VARIABLES.length} variables medidas contra 8 referentes (eMM, Decreto 1330, CNA, TOGAF, DAMA, INTEF, ISO 27001, CMI), con hallazgo, recomendación y evidencia por variable.`}  actions={<AccessChip module="madurez" />} />

      {/* selector de vista */}
      <div className="rise mb-6 flex flex-wrap gap-1.5 rounded-2xl bg-surface-2 p-1.5">
        {TABS.map((t) => (
          <button key={t.id}
            onClick={() => { setTab(t.id); if (t.id !== "variables") setCellFilter(null); }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-bold transition-all ${
              tab === t.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}>
            <t.icon size={14} className={tab === t.id ? "text-cyan-deep" : ""} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ RESUMEN ═══════════ */}
      {tab === "resumen" && (
        <>
          <div className="rise rise-1 mb-5 grid gap-4 sm:grid-cols-4">
            {[
              { l: "Variables medidas", v: String(VARIABLES.length), f: "16 celdas · 8 referentes" },
              { l: "Fortalezas (nivel ≥ 4)", v: String(strengths), f: "Documentadas como práctica a sostener" },
              { l: "Brechas críticas (≥ 3 niveles)", v: String(criticalGaps), f: "Concentradas en arquitectura y datos" },
              { l: "Evidencias que soportan", v: String(EVIDENCES.length), f: `${EVIDENCES.filter((e) => e.status === "VERIFICADA").length} verificadas` },
            ].map((s) => (
              <div key={s.l} className="panel px-5 py-4">
                <div className="text-[11.5px] text-muted">{s.l}</div>
                <div className="num mt-1 text-[26px] font-extrabold text-ink">{s.v}</div>
                <div className="mt-1 text-[10.5px] text-faint">{s.f}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-5">
            <Card className="rise rise-1 lg:col-span-2">
              <CardHeader title="Radar institucional" sub="Actual vs. meta a 24 meses" />
              <div className="px-5 py-3"><MaturityRadar size={360} /></div>
            </Card>

            <Card className="rise rise-2 lg:col-span-3">
              <CardHeader title="Mapa de calor" sub="Clic en una celda para abrir sus variables" />
              <div className="px-5 py-4">
                <MaturityHeatmap onCell={openCell} />
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-3">
                {LEVELS.map((lv) => (
                  <span key={lv.n} className="flex items-center gap-1.5 text-[11px] text-muted">
                    <span className="h-3 w-3 rounded" style={{ background: lv.color }} />
                    {lv.n} · {lv.name}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* ciclo de medición */}
          <Card className="rise rise-3 mt-5">
            <div className="flex items-center gap-2.5 px-5 pb-1 pt-4">
              <History size={14} className="text-cyan-deep" />
              <span className="p-title">Ciclo de medición</span>
              <span className="p-sub">el valor del instrumento está en la serie, no en el dato único</span>
            </div>
            <div className="grid gap-3 px-5 pb-5 pt-2 sm:grid-cols-3">
              {ASSESSMENTS.map((m) => (
                <div key={m.id} className="rounded-xl bg-surface-2/60 px-4 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-bold text-ink">{m.label}</span>
                    <span className={`chip ${m.status === "PUBLICADA" ? "chip-ok" : "chip-cyan"}`}>
                      {m.status === "PUBLICADA" ? "Publicada" : "En captura"}
                    </span>
                  </div>
                  <div className="num mt-0.5 text-[10.5px] text-faint">{m.period}</div>
                  <p className="mt-1 text-[11.5px] leading-snug text-muted">{m.note}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* escala */}
          <div className="rise rise-4 mt-5 grid gap-3 sm:grid-cols-5">
            {LEVELS.map((lv) => (
              <div key={lv.n} className="rounded-xl p-4 text-white" style={{ background: lv.color }}>
                <div className="num text-[10px] font-bold opacity-75">NIVEL {lv.n}</div>
                <div className="mt-0.5 text-[14px] font-bold">{lv.name}</div>
                <div className="mt-1.5 text-[11px] leading-snug opacity-90">{lv.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══════════ VARIABLES ═══════════ */}
      {tab === "variables" && (
        <>
          <div className="rise mb-4 flex flex-wrap items-center gap-2">
            {cellFilter && (
              <button onClick={() => setCellFilter(null)} className="chip chip-cyan cursor-pointer">
                {LINES.find((l) => l.n === cellFilter.line)?.code} ·{" "}
                {DIMENSIONS.find((d) => d.key === cellFilter.dim)?.name}
                <X size={11} />
              </button>
            )}
            {!cellFilter && (
              <>
                <button onClick={() => setLineFilter(null)}
                  className={`chip cursor-pointer ${lineFilter === null ? "chip-cyan" : ""}`}>
                  Todas · {VARIABLES.length}
                </button>
                {LINES.map((l) => (
                  <button key={l.n} onClick={() => setLineFilter(lineFilter === l.n ? null : l.n)}
                    className={`chip cursor-pointer ${lineFilter === l.n ? "chip-cyan" : ""}`}>
                    {l.code} · {VARIABLES.filter((v) => v.line === l.n).length}
                  </button>
                ))}
              </>
            )}
            <span className="mx-1 h-4 w-px bg-line-strong" />
            {frames.map((f) => (
              <button key={f} onClick={() => setFrameFilter(frameFilter === f ? null : f)}
                className={`chip cursor-pointer ${frameFilter === f ? "chip-gold" : ""}`}>
                {f} · {VARIABLES.filter((v) => v.frame === f).length}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-line-strong" />
            <button onClick={() => setOnlyGaps(!onlyGaps)}
              className={`chip cursor-pointer ${onlyGaps ? "chip-bad" : ""}`}>
              Brecha ≥ 2 · {VARIABLES.filter((v) => gapOf(v) >= 2).length}
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredVars.map((v, idx) => (
              <VariableRow key={v.id} v={v} idx={idx}
                open={openVar === v.id}
                onToggle={() => setOpenVar(openVar === v.id ? null : v.id)} />
            ))}
            {filteredVars.length === 0 && (
              <p className="rounded-xl bg-surface-2 px-5 py-6 text-center text-[13px] italic text-faint">
                Ninguna variable coincide con los filtros.
              </p>
            )}
          </div>
        </>
      )}

      {/* ═══════════ DOMINIOS ═══════════ */}
      {tab === "dominios" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {DOMAINS.map((d, i) => {
            const score = domainScore(d);
            const vars = VARIABLES.filter((v) => d.variableIds.includes(v.id));
            const kpis = KPIS.filter((k) => d.kpiCodes.includes(k.code));
            const inis = INITIATIVES.filter((x) => d.initiativeIds.includes(x.id));
            return (
              <Card key={d.id} className={`rise rise-${Math.min(i + 1, 4)}`}>
                <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
                  <div className="min-w-0">
                    <h3 className="text-[15.5px] font-extrabold tracking-tight text-ink">{d.name}</h3>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted">{d.desc}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="num text-[24px] font-extrabold leading-none text-ink">
                      {fmtNum(score.value, 1)}
                    </div>
                    <div className="num text-[10px] text-faint">meta {fmtNum(score.target, 1)}</div>
                  </div>
                </div>

                <div className="mx-5 mb-3 h-[8px] overflow-hidden rounded-full bg-surface-2">
                  <div className="relative h-full">
                    <div className="h-full rounded-full"
                      style={{ width: `${(score.value / 5) * 100}%`, background: "var(--grad-brand)" }} />
                    <div className="absolute top-0 h-full border-l-[1.5px] border-dashed border-gold"
                      style={{ left: `${(score.target / 5) * 100}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line px-5 py-3">
                  {d.dataHighlights.map((h) => (
                    <div key={h.label}>
                      <div className="text-[10px] text-faint">{h.label}</div>
                      <div className="num text-[13px] font-bold text-ink">{h.value}</div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line px-5 py-3">
                  <div className="label mb-2 !text-[8.5px]">Variables del dominio</div>
                  <div className="space-y-1">
                    {vars.map((v) => (
                      <button key={v.id}
                        onClick={() => { setTab("variables"); setCellFilter(null); setLineFilter(null); setFrameFilter(null); setOnlyGaps(false); setOpenVar(v.id); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2">
                        <span className="num w-[64px] shrink-0 text-[9px] font-bold text-cyan-deep">{v.id}</span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink">{v.name}</span>
                        <span className="num shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: LEVEL_BG[v.value] }}>{v.value}</span>
                        <span className="num shrink-0 text-[10px] text-faint">→{v.target}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-5 py-3">
                  {kpis.map((k) => (
                    <Link key={k.code} href="/panel/kpi" className="chip chip-gold">{k.code}</Link>
                  ))}
                  {inis.map((x) => (
                    <Link key={x.id} href="/panel/iniciativas" className="chip chip-cyan">
                      {x.name.length > 30 ? x.name.slice(0, 29) + "…" : x.name}
                    </Link>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ═══════════ ÍNDICES IES ═══════════ */}
      {tab === "ies" && <IesView />}

      {/* ═══════════ REGISTROS CALIFICADOS ═══════════ */}
      {tab === "registros" && (
        <>
          <div className="rise mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { l: "Registros del portafolio", v: rc.total, c: undefined },
              { l: "Vigentes", v: rc.vigentes, c: "var(--ok)" },
              { l: "Por vencer (< 18 meses)", v: rc.porVencer, c: "var(--warn)" },
              { l: "En renovación ante el MEN", v: rc.enRenovacion, c: "var(--cyan)" },
              { l: "Sin modalidad virtual", v: rc.sinModalidadVirtual, c: "var(--bad)" },
            ].map((s) => (
              <div key={s.l} className="panel relative overflow-hidden px-5 py-4">
                {s.c && <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: s.c }} />}
                <div className="text-[11.5px] leading-snug text-muted">{s.l}</div>
                <div className="num mt-1 text-[26px] font-extrabold text-ink">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="rise rise-1 mb-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
            style={{ background: "var(--gold-wash)" }}>
            <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: "var(--gold)" }} />
            <p className="text-[12.5px] leading-relaxed" style={{ color: "#6b5312" }}>
              <b>Lectura del diagnóstico:</b> los {rc.porVencer + rc.enRenovacion} registros que vencen antes de sep-2028 son la
              ventana natural para incorporar modalidad virtual en la renovación (variable AV-ORG-2).
              Hoy <b>ningún registro vigente incluye virtualidad</b>: cada renovación que pase sin ajustar
              el proceso es una oportunidad perdida de 7 años.
            </p>
          </div>

          <Card className="rise rise-2 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-[12.5px]">
                <thead>
                  <tr className="border-b border-line-strong bg-surface-2/60">
                    {["Programa", "Sede", "Resolución", "Otorgado", "Vence", "Estado", "Últ. autoevaluación", "Modalidad del registro"].map((h) => (
                      <th key={h} className="label whitespace-nowrap px-4 py-2.5 text-left !text-[8.5px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...REG_CALIFICADOS]
                    .sort((a, b) => (a.vence === "—" ? "9999" : a.vence).localeCompare(b.vence === "—" ? "9999" : b.vence))
                    .map((r) => {
                      const prog = programOf(r.code);
                      return (
                        <tr key={r.code + r.campus} className="border-b border-line last:border-0 hover:bg-surface-2/50">
                          <td className="px-4 py-2">
                            <div className="font-semibold text-ink">{prog?.name ?? r.code}</div>
                            <div className="num text-[9.5px] text-faint">{r.code} · {prog?.level}</div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-muted">{r.campus}</td>
                          <td className="num whitespace-nowrap px-4 py-2 text-[11px] text-muted">{r.resolucion}</td>
                          <td className="num whitespace-nowrap px-4 py-2 text-muted">{r.otorgado}</td>
                          <td className="num whitespace-nowrap px-4 py-2 font-bold"
                            style={{ color: r.estado === "POR_VENCER" ? "var(--warn)" : r.estado === "EN_RENOVACION" ? "var(--cyan-deep)" : "var(--ink)" }}>
                            {r.vence}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2">
                            <span className={`chip ${
                              r.estado === "VIGENTE" ? "chip-ok" : r.estado === "POR_VENCER" ? "chip-warn" : "chip-cyan"}`}>
                              {r.estado === "VIGENTE" ? "Vigente" : r.estado === "POR_VENCER" ? "Por vencer" : "En renovación"}
                            </span>
                          </td>
                          <td className="num whitespace-nowrap px-4 py-2 text-center"
                            style={{ color: r.ultimaAutoevaluacion <= 2023 ? "var(--bad)" : "var(--muted)" }}>
                            {r.ultimaAutoevaluacion}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2">
                            <span className={`chip ${r.modalidadRegistro !== "Presencial" ? "chip-cyan" : ""}`}>
                              {r.modalidadRegistro}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line px-5 py-2.5 text-[10.5px] text-faint">
              Decreto 1330 de 2019 · vigencia de 7 años · corte demo: marzo de 2027. Autoevaluación en rojo = último ejercicio en 2023 o antes.
            </div>
          </Card>
        </>
      )}
    </>
  );
}

/* ─── vista AlgoritmoT-IES ─── */

function IesView() {
  const ies = iesSummary();
  const LINE_NAME: Record<number, string> = {
    1: "Formación y docencia", 2: "Investigación, innovación y creación",
    3: "Extensión y proyección social", 4: "Gestión institucional habilitante",
  };
  const W: Record<number, string> = { 1: "30 %", 2: "25 %", 3: "20 %", 4: "25 %" };
  return (
    <>
      {/* índice institucional + AIQ */}
      <div className="rise mb-5 grid gap-4 lg:grid-cols-3">
        <div className="panel relative overflow-hidden px-6 py-5">
          <div className="spine absolute inset-x-0 top-0 h-[3px]" />
          <div className="label mb-1">Índice institucional IIES</div>
          <div className="flex items-baseline gap-3">
            <span className="num text-[42px] font-extrabold text-ink">{ies.iies.toFixed(1)}</span>
            <span className="rounded-full px-3 py-1 text-[11.5px] font-bold text-white"
              style={{ background: ies.level.color }}>{ies.level.name}</span>
          </div>
          <p className="mt-1 text-[11.5px] leading-snug text-muted">{ies.level.desc}</p>
          <div className="num mt-2 text-[10px] text-faint">
            0,30·Formación + 0,25·Investigación + 0,20·Extensión + 0,25·Gestión
          </div>
        </div>

        <div className="panel px-6 py-5">
          <div className="label mb-1">Cobertura de evidencia</div>
          <div className="num text-[42px] font-extrabold text-ink">{Math.round(ies.coverage)} %</div>
          <p className="mt-1 text-[11.5px] leading-snug text-muted">
            Ítems con evidencia suficiente (D≥2, I≥2, K≥1). Un puntaje sin cobertura
            no tiene la misma confianza: se reportan siempre juntos.
          </p>
        </div>

        <div className="panel relative overflow-hidden px-6 py-5">
          {ies.aiq.capApplied && <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--bad)" }} />}
          <div className="label mb-1">AIQ-IES · preparación y adopción de IA</div>
          <div className="flex items-baseline gap-2.5">
            <span className="num text-[42px] font-extrabold text-ink">{Math.round(ies.aiq.capped)}</span>
            {ies.aiq.capApplied && (
              <span className="chip chip-bad" title={`Sin salvaguardas el puntaje sería ${Math.round(ies.aiq.raw)}`}>
                capado a {ies.aiq.cap} por salvaguarda
              </span>
            )}
          </div>
          <div className="num mt-1 flex gap-4 text-[11px] text-muted">
            <span>preparación <b className="text-ink">{Math.round(ies.aiq.preparacion)}</b></span>
            <span>adopción e impacto <b className="text-ink">{Math.round(ies.aiq.adopcion)}</b></span>
          </div>
        </div>
      </div>

      {/* índices por línea misional */}
      <div className="rise rise-1 mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Índices por línea misional" sub="M_l = promedio de S sobre las variables de la línea · peso en el IIES" />
          <div className="space-y-4 px-5 pb-5">
            {ies.lines.map(({ line, index }) => {
              const lv = levelOf(index);
              return (
                <div key={line}>
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[13px] font-bold text-ink">
                      {LINE_NAME[line]} <span className="num text-[10px] font-medium text-faint">peso {W[line]}</span>
                    </span>
                    <span className="num text-[13px] font-extrabold" style={{ color: lv.color }}>
                      {index.toFixed(1)} · {lv.name}
                    </span>
                  </div>
                  <div className="h-[9px] overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${index}%`, background: lv.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Índices por dimensión transversal" sub="DT_d ponderado por misión — ¿dónde es débil la capacidad, en qué misión?" />
          <div className="space-y-3 px-5 pb-5">
            {ies.dims.map((d) => {
              const lv = levelOf(d.index);
              return (
                <div key={d.d7} className="flex items-center gap-3">
                  <span className="num w-7 shrink-0 text-[10px] font-bold text-cyan-deep">{d.d7}</span>
                  <span className="w-40 shrink-0 truncate text-[12px] font-semibold text-ink">{d.short}</span>
                  <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${d.index}%`, background: lv.color }} />
                  </div>
                  <span className="num w-9 shrink-0 text-right text-[12px] font-bold text-ink">{d.index.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* matriz 4×7 */}
      <Card className="rise rise-2 mb-5">
        <CardHeader title="Matriz misional 4 × 7" sub="Puntuación verificada S por línea × dimensión transversal (— = sin variables en esta versión del banco)" />
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr>
                <th className="label pb-2 text-left !text-[8.5px]">Línea misional</th>
                {ies.dims.map((d) => (
                  <th key={d.d7} className="label pb-2 text-center !text-[8.5px]" title={d.name}>{d.d7}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ies.matrix.map((row) => (
                <tr key={row.line}>
                  <td className="py-1.5 pr-3 text-[12px] font-bold text-ink">{LINE_NAME[row.line]}</td>
                  {row.cells.map(({ d7, cell }) => (
                    <td key={d7} className="p-1">
                      {cell ? (
                        <div className="num rounded-lg py-2 text-center text-[13px] font-extrabold text-white"
                          style={{ background: levelOf(cell.s).color }}
                          title={`${cell.n} variable(s) · ${levelOf(cell.s).name}`}>
                          {cell.s.toFixed(0)}
                        </div>
                      ) : (
                        <div className="rounded-lg bg-surface-2 py-2 text-center text-[12px] text-faint">—</div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex flex-wrap gap-3">
            {IES_LEVELS.map((l) => (
              <span key={l.name} className="flex items-center gap-1.5 text-[10.5px] text-muted">
                <i className="h-2.5 w-2.5 rounded" style={{ background: l.color }} />
                {l.name} ({l.min}–{l.max})
              </span>
            ))}
          </div>
        </div>
      </Card>

      <div className="rise rise-3 grid gap-5 lg:grid-cols-2">
        {/* brechas percepción-evidencia */}
        <Card>
          <CardHeader title="Brechas percepción − evidencia" sub="|Δ| > 20: sobreestimación o práctica invisible — hallazgos de gestión, no de tecnología" />
          <div className="space-y-2 px-5 pb-5">
            {ies.gaps.map((g) => (
              <div key={g.id} className="rounded-xl bg-surface-2/60 px-3.5 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-bold text-ink">
                    <span className="num mr-1.5 text-[9.5px] text-cyan-deep">{g.id}</span>{g.name}
                  </span>
                  <span className={`chip shrink-0 ${g.reading === "SOBREESTIMACION" ? "chip-warn" : "chip-cyan"}`}>
                    {g.reading === "SOBREESTIMACION" ? "Sobreestimación" : "Práctica invisible"}
                  </span>
                </div>
                <div className="num mt-1 text-[10.5px] text-muted">
                  percepción {g.p.toFixed(0)} · evidencia {g.e.toFixed(0)} · Δ {g.delta > 0 ? "+" : ""}{g.delta.toFixed(0)}
                </div>
                <div className="mt-1.5 flex h-[6px] gap-0.5">
                  <div className="rounded-l-full bg-line-strong" style={{ width: `${g.p / 2}%` }} title="percepción" />
                  <div className="rounded-r-full" style={{ width: `${g.e / 2}%`, background: "var(--cyan)" }} title="evidencia" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* salvaguardas */}
        <Card>
          <CardHeader title="Semáforo de salvaguardas" sub="El promedio no oculta riesgos críticos: una salvaguarda en falla capa el AIQ-IES" />
          <div className="space-y-2 px-5 pb-5">
            {ies.aiq.safeguards.map((sg) => (
              <div key={sg.id} className="flex items-start gap-3 rounded-xl bg-surface-2/60 px-3.5 py-2.5">
                <ShieldAlert size={15} className="mt-0.5 shrink-0"
                  style={{ color: sg.status === "FALLA" ? "var(--bad)" : sg.status === "PARCIAL" ? "var(--warn)" : "var(--ok)" }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12.5px] font-bold leading-snug text-ink">{sg.rule}</span>
                    <span className={`chip shrink-0 ${
                      sg.status === "FALLA" ? "chip-bad" : sg.status === "PARCIAL" ? "chip-warn" : "chip-ok"}`}>
                      {sg.status === "FALLA" ? `Falla · capa a ${sg.cap}` : sg.status === "PARCIAL" ? "Parcial" : "Cumple"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-muted">{sg.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line px-5 py-2.5 text-[10.5px] text-faint">
            Componentes AIQ: {ies.aiq.components.map((c) => `${c.key} ${Math.round(c.score)}`).join(" · ")}
          </div>
        </Card>
      </div>

      {/* estados de la práctica + brechas entre actores */}
      <div className="rise rise-4 mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Estados de la práctica"
            sub="Disponibilidad → adopción → integración → impacto: el modelo no evalúa solo digitalización" />
          <div className="px-5 pb-5">
            {(() => {
              const counts = practiceStateCounts();
              const total = VARIABLES.length;
              const COLORS: Record<string, string> = {
                AUSENTE: "var(--n1)", DISPONIBILIDAD: "var(--n2)", ADOPCION: "var(--n3)",
                INTEGRACION: "var(--n4)", IMPACTO: "var(--n5)",
              };
              return (
                <>
                  <div className="flex h-[16px] overflow-hidden rounded-full">
                    {PRACTICE_STATES.map((st) => counts[st.key] > 0 && (
                      <div key={st.key} style={{ width: `${(counts[st.key] / total) * 100}%`, background: COLORS[st.key] }}
                        title={`${st.label}: ${counts[st.key]}`} />
                    ))}
                  </div>
                  <div className="mt-3 space-y-2">
                    {PRACTICE_STATES.map((st) => (
                      <div key={st.key} className="flex items-start gap-2.5">
                        <span className="num mt-0.5 grid h-5 w-7 shrink-0 place-items-center rounded text-[10px] font-extrabold text-white"
                          style={{ background: COLORS[st.key] }}>{counts[st.key]}</span>
                        <div>
                          <span className="text-[12px] font-bold text-ink">{st.label}</span>
                          <span className="ml-1.5 text-[11px] text-muted">{st.question}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-snug text-faint">
                    La brecha típica no está en la disponibilidad sino en el salto a integración e
                    impacto: {counts.DISPONIBILIDAD + counts.ADOPCION} prácticas existen o se usan,
                    pero solo {counts.INTEGRACION + counts.IMPACTO} están articuladas o demuestran resultados.
                  </p>
                </>
              );
            })()}
          </div>
        </Card>

        <Card>
          <CardHeader title="Brechas entre grupos de actores"
            sub="Promedio por grupo y pesos explícitos (20/25/20/25/10) — rango ≥ 2 es hallazgo" />
          <div className="space-y-2.5 px-5 pb-4">
            {topDissensus(2).slice(0, 6).map((d) => (
              <div key={d.id} className="rounded-xl bg-surface-2/60 px-3.5 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-bold text-ink">
                    <span className="num mr-1.5 text-[9.5px] text-cyan-deep">{d.id}</span>{d.name}
                  </span>
                  <span className="chip chip-warn shrink-0">rango {d.range}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {ACTOR_GROUPS.map((g) => {
                    const val = d.responses[g.key];
                    const extreme = g.key === d.highGroup || g.key === d.lowGroup;
                    return (
                      <div key={g.key} className="flex flex-col items-center gap-0.5" title={`${g.label}: ${val}`}>
                        <span className={`num grid h-6 w-6 place-items-center rounded-full text-[10.5px] font-extrabold ${
                          extreme ? "text-white" : "text-ink-soft"}`}
                          style={{ background: extreme
                            ? (g.key === d.highGroup ? "var(--n4)" : "var(--bad)")
                            : "var(--surface-3)" }}>
                          {val}
                        </span>
                        <span className="text-[8px] uppercase tracking-wide text-faint">{g.key.slice(0, 4)}</span>
                      </div>
                    );
                  })}
                  <span className="ml-auto text-[10.5px] leading-snug text-muted">
                    {ACTOR_GROUPS.find((g) => g.key === d.highGroup)?.label.split(" ")[0]} ve {d.responses[d.highGroup]};{" "}
                    {ACTOR_GROUPS.find((g) => g.key === d.lowGroup)?.label.split(" ")[0].toLowerCase()} vive {d.responses[d.lowGroup]}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line px-5 py-2.5 text-[10.5px] text-faint">
            El agregado no es promedio directo de participantes: primero por grupo, luego pesos —
            así los estudiantes no dominan asuntos de arquitectura ni los directivos la experiencia de servicio.
          </div>
        </Card>
      </div>

      {/* versiones de aplicación */}
      <Card className="rise rise-4 mt-5">
        <CardHeader title="Versiones de aplicación del instrumento"
          sub="Rutas por rol: nadie responde el banco completo (máximo habitual 46 ítems)" />
        <div className="overflow-x-auto px-5 pb-4">
          <table className="w-full min-w-[640px] text-[12px]">
            <thead>
              <tr className="border-b border-line-strong">
                {["Versión", "Componentes", "Por persona", "Institucional", "Uso"].map((h) => (
                  <th key={h} className="label pb-2 pr-4 text-left !text-[8.5px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Diagnóstico breve", "Caracterización + núcleo de 28 ítems", "15–20 min", "1–2 semanas", "Sensibilización y línea base provisional"],
                ["Módulo misional", "Núcleo + un módulo de 18 ítems", "30–40 min", "2–4 semanas", "Diagnóstico focalizado de una línea"],
                ["Diagnóstico integral", "Núcleo y rutas misionales por rol", "30–50 min", "4–6 semanas", "Perfil institucional completo"],
                ["Auditoría profunda", "Encuestas + evidencias + entrevistas + talleres", "Variable", "6–10 semanas", "Puntuación verificada y hoja de ruta (esta medición)"],
                ["Seguimiento", "Ítems críticos, evidencias nuevas y KPI", "10–25 min", "2–4 semanas", "Revisión semestral o anual"],
              ].map((row, ri) => (
                <tr key={row[0]} className={`border-b border-line last:border-0 ${ri === 3 ? "bg-cyan-wash/40" : ""}`}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={`py-2 pr-4 ${ci === 0 ? "font-bold text-ink" : "text-muted"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-5 text-[10.5px] leading-relaxed text-faint">
        Metodología AlgoritmoT-IES (deep-research-report): S = 0,40·P + 0,60·E con E = 0,25·D + 0,35·I + 0,40·K.
        Percepción marcada como provisional hasta auditoría; pesos iniciales iguales por ítem; los puntos de corte
        son guías diagnósticas sujetas a calibración en pilotos. Datos ilustrativos.
      </p>
    </>
  );
}

/* ─── fila expandible de variable ─── */

function VariableRow({ v, idx, open, onToggle }: {
  v: Variable; idx: number; open: boolean; onToggle: () => void;
}) {
  const line = LINES.find((l) => l.n === v.line)!;
  const dim = DIMENSIONS.find((d) => d.key === v.dimension)!;
  const gap = gapOf(v);
  const evidences = EVIDENCES.filter((e) => v.evidenceIds.includes(e.id));
  const owner = responsible(v.ownerId);
  return (
    <Card className={`rise rise-${Math.min((idx % 4) + 1, 4)} overflow-hidden ${open ? "ring-1 ring-cyan/40" : ""}`}>
      <button onClick={onToggle}
        className="flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-surface-2/50">
        <span className="num w-[70px] shrink-0 text-[10px] font-bold text-cyan-deep">{v.id}</span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-bold text-ink">{v.name}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-faint">{line.code} · {dim.name}</span>
            <span className="chip !py-0 !text-[8.5px]" style={{ color: FRAME_COLORS[v.frame] }}>{v.frame}</span>
          </div>
        </div>
        {/* barra valor → meta */}
        <div className="hidden w-36 shrink-0 sm:block">
          <div className="relative h-[9px] overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${(v.value / 5) * 100}%`, background: LEVEL_BG[v.value] }} />
            <div className="absolute top-0 h-full border-l-[1.5px] border-dashed border-gold" style={{ left: `${(v.target / 5) * 100}%` }} />
          </div>
        </div>
        <span className="num shrink-0 rounded-lg px-2 py-1 text-[13px] font-extrabold text-white"
          style={{ background: LEVEL_BG[v.value] }}>{v.value}</span>
        <span className={`chip shrink-0 ${gap >= 3 ? "chip-bad" : gap === 2 ? "chip-warn" : gap <= 0 ? "chip-ok" : ""}`}>
          {gap <= 0 ? "En meta" : `Brecha ${gap}`}
        </span>
        <ChevronDown size={15} className={`shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid gap-5 border-t border-line px-5 py-4 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-[12.5px] leading-relaxed text-muted">{v.desc}</p>
            <div className="mb-3 flex items-center gap-3">
              <LevelBadge level={v.value} />
              <span className="text-[11px] text-faint">meta</span>
              <LevelBadge level={v.target} />
            </div>
            <div className="flex items-start gap-2 rounded-lg px-3 py-2.5"
              style={{ background: v.value >= 4 ? "color-mix(in srgb, var(--ok) 8%, white)" : "color-mix(in srgb, var(--bad) 6%, white)" }}>
              <AlertCircle size={13} className="mt-0.5 shrink-0"
                style={{ color: v.value >= 4 ? "var(--ok)" : "var(--bad)" }} />
              <p className="text-[12px] leading-relaxed text-ink-soft">
                <b>Hallazgo:</b> {v.hallazgo}
              </p>
            </div>
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-cyan-wash px-3 py-2.5">
              <Lightbulb size={13} className="mt-0.5 shrink-0 text-cyan-deep" />
              <p className="text-[12px] leading-relaxed text-ink-soft">
                <b>Recomendación:</b> {v.recomendacion}
              </p>
            </div>
            {/* estado de la práctica y respuestas por grupo */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(() => {
                const st = practiceState(v);
                const meta = PRACTICE_STATES.find((x) => x.key === st)!;
                const COLORS: Record<string, string> = {
                  AUSENTE: "var(--n1)", DISPONIBILIDAD: "var(--n2)", ADOPCION: "var(--n3)",
                  INTEGRACION: "var(--n4)", IMPACTO: "var(--n5)",
                };
                return (
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                    style={{ background: COLORS[st] }} title={meta.question}>
                    Estado: {meta.label.toLowerCase()}
                  </span>
                );
              })()}
              <span className="num flex items-center gap-1 text-[9.5px] text-faint" title="Percepción por grupo (dir·doc·adm·est·ali)">
                {ACTOR_GROUPS.map((g) => (
                  <span key={g.key} className="grid h-4.5 w-4.5 place-items-center rounded bg-surface-2 px-1 font-bold text-ink-soft">
                    {responsesOf(v.id)[g.key]}
                  </span>
                ))}
                <span className="ml-0.5">por grupo</span>
              </span>
            </div>
            {/* puntuación AlgoritmoT-IES */}
            <div className="mt-2 rounded-lg bg-surface-2/70 px-3 py-2.5">
              <div className="label mb-1.5 !text-[8px]">Puntuación IES · S = 0,40·P + 0,60·E</div>
              <div className="num flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[11.5px] text-muted">
                <span>percepción <b className="text-ink">{pIES(v).toFixed(0)}</b></span>
                <span>evidencia <b className="text-ink">{eIES(v).toFixed(0)}</b>
                  <span className="text-[9px] text-faint"> (D{v.evidence.d}·I{v.evidence.i}·K{v.evidence.k})</span></span>
                <span>verificada <b className="text-[13px] text-cyan-deep">{sIES(v).toFixed(0)}</b></span>
                <span className="text-[10px]">{levelOf(sIES(v)).name} · {v.d7}</span>
                {gapReading(v) !== "CONVERGENCIA" && (
                  <span className={`chip ${gapReading(v) === "SOBREESTIMACION" ? "chip-warn" : "chip-cyan"}`}>
                    {gapReading(v) === "SOBREESTIMACION" ? "Δ sobreestimación" : "Δ práctica invisible"}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="label mb-2 !text-[8.5px]">Responsable de la información</div>
            <div className="mb-3 text-[12.5px]">
              <span className="font-bold text-ink">{owner.cargo}</span>
              <span className="text-muted"> · {owner.dependencia}</span>
            </div>
            <div className="label mb-2 !text-[8.5px]">Evidencia que soporta la calificación</div>
            <div className="space-y-1.5">
              {evidences.map((e) => (
                <div key={e.id} className="flex items-start gap-2.5 rounded-lg bg-surface-2/60 px-3 py-2">
                  <FileText size={13} className="mt-0.5 shrink-0 text-cyan-deep" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-semibold leading-snug text-ink">{e.title}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="chip !py-0 !text-[8px]">{e.kind}</span>
                      <span className={`chip !py-0 !text-[8px] ${e.status === "VERIFICADA" ? "chip-ok" : "chip-warn"}`}>
                        {e.status === "VERIFICADA"
                          ? <><CheckCircle2 size={9} /> Verificada</>
                          : <><Clock3 size={9} /> Pendiente</>}
                      </span>
                      <span className="num text-[9px] text-faint">{e.date}</span>
                    </div>
                  </div>
                </div>
              ))}
              {evidences.length === 0 && (
                <p className="text-[11.5px] italic text-faint">Sin evidencia vinculada — hallazgo en sí mismo.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
