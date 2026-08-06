"use client";

// Panel principal v2: héroe con gauge institucional, avance por línea,
// feed de atención y módulos.

import Link from "next/link";
import { PageHeader, Card, CardHeader, StatCard, ModuleCard, StateDot } from "@/components/ui";
import { MaturityRadar, ScoreGauge } from "@/components/charts";
import {
  LINES, lineScore, institutionScore, PREV_SCORES, INITIATIVES, KPIS, fmtCOP,
} from "@/data/demo";
import { ArrowRight } from "lucide-react";

export default function Panel() {
  const score = institutionScore();
  const prev = Object.values(PREV_SCORES).reduce((a, b) => a + b, 0) / 4;
  const atRisk = INITIATIVES.flatMap((i) =>
    i.factors.filter((f) => f.state === "ROJO").map((f) => ({ ini: i, factor: f })));
  const budget = INITIATIVES.reduce(
    (a, i) => ({
      planned: a.planned + i.budgetPlanned,
      executed: a.executed + i.budgetExecuted,
    }),
    { planned: 0, executed: 0 },
  );
  const kpisOff = KPIS.filter((k) => {
    const last = k.series[k.series.length - 1].value;
    const first = k.series[0].value;
    return k.goodDirection === "up" ? last < first : last > first;
  });

  return (
    <>
      <PageHeader
        kicker="Universidad Popular del Cesar"
        title="Estado de la transformación digital"
        desc="Medición vigente: Línea base · Fase 0 · publicada. La próxima re-medición está programada al cierre de la Fase 5."
      />

      {/* ── héroe: gauge + avance por línea ── */}
      <div className="rise rise-1 panel relative mb-5 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(560px 240px at 12% 0%, rgb(14 147 180 / 0.06), transparent 60%)" }} />
        <div className="relative grid gap-8 px-7 py-6 lg:grid-cols-[240px_1fr_320px] lg:items-center">
          <div>
            <div className="label mb-2">Madurez institucional</div>
            <ScoreGauge value={score} />
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-muted">
              <span className="chip chip-ok num">▲ {(score - prev).toFixed(1).replace(".", ",")}</span>
              frente a la medición anterior
            </div>
          </div>

          <div className="space-y-4">
            <div className="label">Avance por línea</div>
            {LINES.map((l) => {
              const now = lineScore(l.n);
              const before = PREV_SCORES[l.n];
              return (
                <Link key={l.n} href={`/panel/madurez/${l.n}`} className="group block">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[13px] font-bold text-ink transition-colors group-hover:text-cyan-deep">
                      {l.code} <span className="font-semibold text-ink-soft">{l.name}</span>
                    </span>
                    <span className="num text-[12px] text-muted">
                      {before.toFixed(1)} → <b className="text-[13px] text-cyan-deep">{now.toFixed(1)}</b>
                    </span>
                  </div>
                  <div className="relative h-[9px] overflow-hidden rounded-full bg-surface-2">
                    <div className="absolute inset-y-0 left-0 rounded-full opacity-25"
                      style={{ width: `${(before / 5) * 100}%`, background: l.color }} />
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(now / 5) * 100}%`,
                        background: `linear-gradient(90deg, color-mix(in srgb, ${l.color} 55%, white), ${l.color})`,
                      }} />
                    <div className="absolute top-0 h-full border-l-[1.5px] border-dashed border-gold"
                      style={{ left: `${((now + 2) / 5) * 100}%` }} />
                  </div>
                </Link>
              );
            })}
            <div className="flex items-center gap-4 pt-1 text-[10.5px] text-faint">
              <span className="flex items-center gap-1.5">
                <i className="inline-block h-[3px] w-4 rounded-full bg-line-strong" /> medición anterior
              </span>
              <span className="flex items-center gap-1.5">
                <i className="inline-block h-0 w-4 border-t-[1.5px] border-dashed border-gold" /> meta 24 m
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <MaturityRadar size={320} />
          </div>
        </div>
      </div>

      {/* ── métricas ── */}
      <div className="rise rise-2 mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Iniciativas en ejecución"
          value={INITIATIVES.filter((i) => i.status === "EN_CURSO").length}
          unit={`de ${INITIATIVES.length}`} foot="Roadmap 2026–2028" />
        <StatCard label="Presupuesto ejecutado"
          value={Math.round((budget.executed / budget.planned) * 100)} unit="%"
          foot={`${fmtCOP(budget.executed)} de ${fmtCOP(budget.planned)}`}
          accent="linear-gradient(90deg, var(--n4), var(--n5))" />
        <StatCard label="Factores críticos en rojo" value={atRisk.length}
          unit={atRisk.length === 1 ? "factor" : "factores"}
          foot="Requieren conversación esta semana"
          accent="linear-gradient(90deg, var(--bad), #a13c44)" />
      </div>

      {/* ── atención requerida ── */}
      <Card className="rise rise-3 mb-8">
        <CardHeader title="Atención requerida"
          sub="Factores en rojo e indicadores en dirección contraria a la meta" />
        <div className="grid gap-x-6 px-4 pb-3 sm:grid-cols-2">
          {atRisk.map(({ ini, factor }) => (
            <Link key={ini.id + factor.name} href="/panel/iniciativas"
              className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-2">
              <StateDot state="ROJO" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-ink">{factor.name}</div>
                <div className="truncate text-[11.5px] text-muted">{ini.name}</div>
              </div>
              <ArrowRight size={14} className="shrink-0 text-faint transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
          {kpisOff.map((k) => (
            <Link key={k.code} href="/panel/kpi"
              className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-2">
              <StateDot state="AMBAR" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-ink">{k.name}</div>
                <div className="truncate text-[11.5px] text-muted">Indicador en dirección contraria a la meta</div>
              </div>
              <ArrowRight size={14} className="shrink-0 text-faint transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </Card>

      {/* ── módulos ── */}
      <div className="rise rise-4">
        <div className="kicker mb-4">Módulos de la plataforma</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ModuleCard href="/panel/madurez" code="M1" title="Medición de madurez"
            desc="Radar, mapa de calor línea × dimensión, evidencia por celda e historial de mediciones."
            tags={["16 celdas", "Evidencia"]} />
          <ModuleCard href="/panel/benchmark" code="M2" title="Comparación sectorial"
            desc="Posición nacional, pares comparables y cobertura territorial en los 25 municipios del Cesar."
            tags={["357 IES", "Territorio"]} />
          <ModuleCard href="/panel/capacidades" code="M3" title="Capacidades y mapa estratégico"
            desc="Objetivo → capacidad → iniciativa → indicador: la trazabilidad completa, navegable."
            tags={["7 capacidades"]} />
          <ModuleCard href="/panel/kpi" code="M4" title="Indicadores"
            desc="Batería de KPI con dueño, fuente, periodicidad, serie histórica y semáforo frente a meta."
            tags={[`${KPIS.length} indicadores`]} />
          <ModuleCard href="/panel/ruta" code="M5" title="Mapa de ruta"
            desc="Roadmap por horizontes con Gantt y matriz de priorización impacto × factibilidad."
            tags={["2026–2028"]} />
          <ModuleCard href="/panel/iniciativas" code="M6" title="Seguimiento de iniciativas"
            desc="Avance, presupuesto en tres estados y factores críticos de éxito en semáforo."
            tags={[fmtCOP(budget.planned)]} />
        </div>
      </div>
    </>
  );
}
