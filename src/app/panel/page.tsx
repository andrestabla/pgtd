"use client";

// Panel principal: score institucional, radar, alertas y acceso a módulos.

import Link from "next/link";
import { PageHeader, Card, CardHeader, StatCard, ModuleCard, DemoBanner, StateDot } from "@/components/ui";
import { MaturityRadar } from "@/components/charts";
import {
  LINES, lineScore, institutionScore, PREV_SCORES, INITIATIVES, KPIS, fmtCOP,
} from "@/data/demo";

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
      <DemoBanner />

      <div className="rise rise-1 mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Madurez institucional" value={score.toFixed(1).replace(".", ",")}
          unit="/ 5" delta={+(score - prev).toFixed(2)} good foot="4 líneas · 16 puntos de medición" />
        <StatCard label="Iniciativas en ejecución"
          value={String(INITIATIVES.filter((i) => i.status === "EN_CURSO").length)}
          unit={`de ${INITIATIVES.length}`} foot="Roadmap 2026–2028" />
        <StatCard label="Presupuesto ejecutado" value={`${Math.round((budget.executed / budget.planned) * 100)} %`}
          foot={fmtCOP(budget.executed) + " de " + fmtCOP(budget.planned)} />
        <StatCard label="Factores en rojo" value={String(atRisk.length)}
          unit={atRisk.length === 1 ? "factor" : "factores"} delta={undefined}
          foot="Requieren conversación esta semana" />
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-5">
        <Card className="rise rise-2 lg:col-span-3">
          <CardHeader title="Radar de madurez" sub="Medición actual frente a la meta a 24 meses" />
          <div className="mx-auto max-w-[430px] px-6 py-4">
            <MaturityRadar />
          </div>
          <div className="flex items-center justify-center gap-6 border-t border-line px-5 py-3">
            <span className="flex items-center gap-2 text-[11.5px] text-muted">
              <span className="h-[3px] w-4 rounded" style={{ background: "var(--cyan)" }} /> Medición actual
            </span>
            <span className="flex items-center gap-2 text-[11.5px] text-muted">
              <span className="h-[3px] w-4 rounded" style={{ background: "var(--gold)" }} /> Meta a 24 meses
            </span>
          </div>
        </Card>

        <div className="rise rise-3 flex flex-col gap-5 lg:col-span-2">
          <Card>
            <CardHeader title="Avance por línea" sub="Frente a la medición anterior" />
            <div className="space-y-3 px-5 py-4">
              {LINES.map((l) => {
                const now = lineScore(l.n);
                const before = PREV_SCORES[l.n];
                return (
                  <Link key={l.n} href={`/panel/madurez/${l.n}`} className="group block">
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-[12.5px] font-semibold text-ink group-hover:text-cyan-deep">
                        {l.code} {l.short}
                      </span>
                      <span className="font-mono text-[11.5px] text-muted">
                        {before.toFixed(1)} → <b className="text-cyan-deep">{now.toFixed(1)}</b>
                      </span>
                    </div>
                    <div className="h-[7px] overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(now / 5) * 100}%`, background: l.color }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Atención requerida" />
            <div className="divide-y divide-line">
              {atRisk.map(({ ini, factor }) => (
                <Link key={ini.id + factor.name} href="/panel/iniciativas"
                  className="flex items-start gap-2.5 px-5 py-3 transition-colors hover:bg-surface-2">
                  <span className="mt-1"><StateDot state="ROJO" /></span>
                  <div>
                    <div className="text-[12.5px] font-semibold text-ink">{factor.name}</div>
                    <div className="text-[11.5px] text-muted">{ini.name}</div>
                  </div>
                </Link>
              ))}
              {kpisOff.slice(0, 2).map((k) => (
                <Link key={k.code} href="/panel/kpi"
                  className="flex items-start gap-2.5 px-5 py-3 transition-colors hover:bg-surface-2">
                  <span className="mt-1"><StateDot state="AMBAR" /></span>
                  <div>
                    <div className="text-[12.5px] font-semibold text-ink">{k.name}</div>
                    <div className="text-[11.5px] text-muted">Indicador en dirección contraria a la meta</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="rise rise-4">
        <div className="kicker mb-3">Módulos</div>
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
