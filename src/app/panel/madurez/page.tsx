"use client";

// M1 · Diagnóstico de madurez.
// Cuatro vistas: Resumen (radar + heatmap + ciclo), Variables (las 52
// variables del instrumento con hallazgo, recomendación y evidencia),
// Dominios (cortes temáticos: oferta, docentes, recursos, autoevaluación,
// arquitectura, investigación) y Registros calificados (Decreto 1330).

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, CardHeader, LevelBadge, StateDot } from "@/components/ui";
import { MaturityRadar, MaturityHeatmap } from "@/components/charts";
import { LINES, DIMENSIONS, SCORES, LEVELS, EVIDENCES, fmtNum } from "@/data/demo";
import { ASSESSMENTS, responsible } from "@/data/cmi";
import {
  VARIABLES, variablesOf, gapOf, DOMAINS, domainScore, type Variable, type Frame,
} from "@/data/instrument";
import { REG_CALIFICADOS, regCalStats, programOf } from "@/data/regcal";
import { KPIS, INITIATIVES } from "@/data/demo";
import {
  FileText, X, CheckCircle2, Clock3, History, ChevronDown, BookOpenCheck,
  Search, Lightbulb, AlertCircle, Layers, ScrollText,
} from "lucide-react";

const LEVEL_BG = ["", "var(--n1)", "var(--n2)", "var(--n3)", "var(--n4)", "var(--n5)"];
const FRAME_COLORS: Record<Frame, string> = {
  eMM: "var(--cyan-deep)", "Decreto 1330": "var(--navy)", CNA: "var(--gold)",
  "TOGAF 10": "var(--n4)", "DAMA-DMBOK": "#7c5cd6", INTEF: "var(--n2)",
  "ISO 27001": "var(--bad)", CMI: "var(--muted)",
};

type Tab = "resumen" | "variables" | "dominios" | "registros";

const TABS: { id: Tab; label: string; icon: typeof Layers }[] = [
  { id: "resumen", label: "Resumen", icon: Layers },
  { id: "variables", label: "Variables del instrumento", icon: Search },
  { id: "dominios", label: "Dominios diagnósticos", icon: BookOpenCheck },
  { id: "registros", label: "Registros calificados", icon: ScrollText },
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
        desc={`${VARIABLES.length} variables medidas contra 8 referentes (eMM, Decreto 1330, CNA, TOGAF, DAMA, INTEF, ISO 27001, CMI), con hallazgo, recomendación y evidencia por variable.`} />

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
