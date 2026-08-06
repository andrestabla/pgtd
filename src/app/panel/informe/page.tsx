"use client";

// Informe ejecutivo imprimible: el estado de la transformación digital en
// una pieza para comité — medición vigente, avance por línea, mapa de calor,
// alertas, KPI, iniciativas y presupuesto. «Imprimir» produce el PDF del
// navegador (los estilos de impresión ocultan la navegación).

import { useEffect, useState } from "react";
import { PageHeader, Card, CardHeader } from "@/components/ui";
import { MaturityHeatmap, MaturityRadar, BudgetBar } from "@/components/charts";
import { LINES, fmtCOP, fmtNum, INSTITUTION } from "@/data/demo";
import { useMaturity } from "@/lib/use-maturity";
import { downloadCsv } from "@/lib/csv";
import { Printer, FileDown, Loader2 } from "lucide-react";

type Summary = {
  maturity: {
    assessment: { id: string; label: string; period: string };
    lines: { n: number; code: string; name: string; value: number; target: number; prev: number | null }[];
    institution: { value: number; target: number };
    history: { id: string; period: string; institution: number }[];
  };
  kpis: { code: string; name: string; health: { latest: number; latestPeriod: string; semaphore: string; improving: boolean; pctToTarget: number } }[];
  initiatives: { id: string; name: string; status: string; progress: number; risk: { score: number; level: string } }[];
  budget: { planned: number; committed: number; executed: number };
  actions: { total: number; done: number; late: number };
  alerts: { id: string; kind: string; severity: 1 | 2 | 3; title: string; detail: string; owner?: string }[];
  alertCounts: { critical: number; warning: number; info: number };
};

const SEM_COLOR: Record<string, string> = { OK: "var(--ok)", WARN: "var(--warn)", BAD: "var(--bad)" };
const RISK_COLOR: Record<string, string> = { BAJO: "var(--ok)", MEDIO: "var(--muted)", ALTO: "var(--warn)", "CRÍTICO": "var(--bad)" };

export default function InformePage() {
  const [s, setS] = useState<Summary | null>(null);
  const { scores } = useMaturity();

  useEffect(() => {
    fetch("/api/td/summary").then((r) => r.ok ? r.json() : null).then(setS).catch(() => null);
  }, []);

  if (!s) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <span className="flex items-center gap-2 text-[13px] text-muted">
          <Loader2 size={16} className="animate-spin" /> Preparando el informe…
        </span>
      </div>
    );
  }

  const hoy = "10 de marzo de 2027 (demo)";
  const criticalAlerts = s.alerts.filter((a) => a.severity === 1);
  const warnAlerts = s.alerts.filter((a) => a.severity === 2).slice(0, 6);

  return (
    <>
      <div className="no-print">
        <PageHeader kicker="Informe ejecutivo" title="Estado de la transformación digital"
          desc="Una pieza imprimible para comité: medición vigente, alertas, indicadores e iniciativas. «Imprimir» genera el PDF desde el navegador."
          actions={
            <div className="flex flex-wrap gap-2">
              <button onClick={() => window.print()} className="btn-primary !py-2 text-[12px]">
                <Printer size={13} /> Imprimir / PDF
              </button>
              <button
                onClick={() => downloadCsv("kpis-pgtd",
                  ["Código", "Indicador", "Último valor", "Periodo", "Semáforo", "% de la meta"],
                  s.kpis.map((k) => [k.code, k.name, k.health.latest, k.health.latestPeriod, k.health.semaphore, k.health.pctToTarget]))}
                className="btn-ghost !py-2 text-[12px]">
                <FileDown size={13} /> KPI (CSV)
              </button>
              <button
                onClick={() => downloadCsv("iniciativas-pgtd",
                  ["Id", "Iniciativa", "Estado", "Avance %", "Riesgo", "Puntaje riesgo"],
                  s.initiatives.map((i) => [i.id.toUpperCase(), i.name, i.status, i.progress, i.risk.level, i.risk.score]))}
                className="btn-ghost !py-2 text-[12px]">
                <FileDown size={13} /> Iniciativas (CSV)
              </button>
            </div>
          } />
      </div>

      {/* cabecera del informe (visible también al imprimir) */}
      <div className="panel mb-5 overflow-hidden">
        <div className="spine h-[3px]" />
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
          <div>
            <div className="kicker mb-1">Informe ejecutivo · PGTD</div>
            <h1 className="text-[20px] font-extrabold tracking-tight text-ink">{INSTITUTION.name}</h1>
            <p className="mt-1 text-[12px] text-muted">
              Medición vigente: <b className="text-ink">{s.maturity.assessment.label}</b> ({s.maturity.assessment.period}) ·
              corte del informe: {hoy}
            </p>
          </div>
          <div className="text-right">
            <div className="label">Madurez institucional</div>
            <div className="num text-[36px] font-extrabold leading-none text-ink">
              {fmtNum(s.maturity.institution.value, 1)}
              <span className="text-[14px] font-semibold text-faint"> / 5</span>
            </div>
            <div className="num mt-1 text-[10.5px] text-faint">
              serie {s.maturity.history.map((h) => fmtNum(h.institution, 2)).join(" → ")}
            </div>
          </div>
        </div>
      </div>

      {/* radar + heatmap */}
      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Avance por línea" sub="actual vs. meta a 24 meses" />
          <div className="space-y-3 px-5 pb-5">
            {s.maturity.lines.map((l) => {
              const meta = LINES.find((x) => x.n === l.n)!;
              return (
                <div key={l.n}>
                  <div className="mb-1 flex items-baseline justify-between text-[12px]">
                    <span className="font-bold text-ink">{l.code} {l.name}</span>
                    <span className="num text-muted">
                      {l.prev !== null && <>{fmtNum(l.prev, 1)} → </>}
                      <b className="text-ink">{fmtNum(l.value, 1)}</b> / meta {fmtNum(l.target, 1)}
                    </span>
                  </div>
                  <div className="relative h-[8px] overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${(l.value / 5) * 100}%`, background: meta.color }} />
                    <div className="absolute top-0 h-full border-l-[1.5px] border-dashed border-gold"
                      style={{ left: `${(l.target / 5) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="pt-2"><MaturityRadar size={300} scores={scores} /></div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Mapa de calor línea × dimensión" sub="niveles de la medición vigente" />
          <div className="px-5 pb-5 pt-2"><MaturityHeatmap scores={scores} /></div>
          <div className="border-t border-line px-5 py-2.5 text-[10.5px] text-faint">
            Alertas del motor: {s.alertCounts.critical} críticas · {s.alertCounts.warning} advertencias · {s.alertCounts.info} informativas.
            Acciones del roadmap: {s.actions.done}/{s.actions.total} hechas ({s.actions.late} vencidas).
          </div>
        </Card>
      </div>

      {/* alertas para el comité */}
      <Card className="mb-5">
        <CardHeader title="Atención de la dirección"
          sub={`${criticalAlerts.length} críticas y ${s.alertCounts.warning} advertencias — las críticas piden decisión, no seguimiento`} />
        <div className="grid gap-x-6 gap-y-1 px-5 pb-4 lg:grid-cols-2">
          {[...criticalAlerts, ...warnAlerts].map((a) => (
            <div key={a.id} className="flex items-start gap-2 py-1.5">
              <i className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{ background: a.severity === 1 ? "var(--bad)" : "var(--warn)" }} />
              <div className="min-w-0">
                <div className="text-[12px] font-bold leading-snug text-ink">{a.title}</div>
                <div className="text-[10.5px] leading-snug text-muted">{a.detail}{a.owner ? ` — ${a.owner}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* KPI + iniciativas */}
      <div className="print-break grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Indicadores" sub="último valor y semáforo frente a la meta" />
          <div className="px-5 pb-4">
            <table className="w-full text-[11.5px]">
              <tbody>
                {s.kpis.map((k) => (
                  <tr key={k.code} className="border-b border-line last:border-0">
                    <td className="num py-1 pr-2 font-bold text-cyan-deep">{k.code}</td>
                    <td className="max-w-0 truncate py-1 pr-2 text-ink-soft">{k.name}</td>
                    <td className="num py-1 pr-2 text-right font-bold text-ink">{fmtNum(k.health.latest, 1)}</td>
                    <td className="py-1 text-right">
                      <i className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: SEM_COLOR[k.health.semaphore] }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Iniciativas"
            sub={`presupuesto ${fmtCOP(s.budget.planned)} · ejecutado+comprometido ${Math.round(((s.budget.executed + s.budget.committed) / s.budget.planned) * 100)} %`} />
          <div className="px-5 pb-4">
            <div className="mb-3"><BudgetBar planned={s.budget.planned} committed={s.budget.committed} executed={s.budget.executed} /></div>
            <table className="w-full text-[11.5px]">
              <tbody>
                {s.initiatives.map((i) => (
                  <tr key={i.id} className="border-b border-line last:border-0">
                    <td className="num py-1 pr-2 font-bold text-cyan-deep">{i.id.toUpperCase()}</td>
                    <td className="max-w-0 truncate py-1 pr-2 text-ink-soft">{i.name}</td>
                    <td className="num py-1 pr-2 text-right text-muted">{i.progress} %</td>
                    <td className="num py-1 text-right font-bold" style={{ color: RISK_COLOR[i.risk.level] }}>
                      {i.risk.level.toLowerCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <p className="mt-5 text-[10px] leading-relaxed text-faint">
        Generado por la PGTD · Algoritmo T S.A.S. · datos ilustrativos del modo demo. Las reglas de
        semáforos, riesgo y proyección están documentadas en Metodología.
      </p>
    </>
  );
}
