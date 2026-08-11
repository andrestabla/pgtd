"use client";

// Analítica del programa: tendencias de KPI, ejecución presupuestal por
// iniciativa, ritmo de cierre de tareas y carga abierta por responsable.
// Todo navega a su módulo; los datos son los efectivos (seed + escritura).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui";
import { LINES, fmtCOP, fmtNum } from "@/data/demo";
import { Loader2, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

type Kpi = {
  code: string; line: number; name: string; unit: string;
  target: number; goodDirection: "up" | "down";
  series: { period: string; value: number }[];
  health: { latest: number; semaphore: string; improving: boolean; pctToTarget: number };
};
type Initiative = {
  id: string; name: string; status: string; progress: number;
  budgetPlanned: number; budgetCommitted: number; budgetExecuted: number;
  risk: { level: string };
};
type Task = { id: string; iniId: string; title: string; status: string; due: string; assigneeId: string };
type Person = { id: string; name: string };

const SEM_COLOR: Record<string, string> = { OK: "var(--ok)", WARN: "var(--warn)", BAD: "var(--bad)" };

function Spark({ series, color }: { series: { value: number }[]; color: string }) {
  if (series.length < 2) return null;
  const w = 132, h = 34, pad = 3;
  const vals = series.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const xs = series.map((_, i) => pad + (i * (w - pad * 2)) / (series.length - 1));
  const ys = vals.map((v) => h - pad - ((v - min) / span) * (h - pad * 2));
  return (
    <svg width={w} height={h}>
      <polyline points={xs.map((x, i) => `${x},${ys[i]}`).join(" ")}
        fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2.6} fill={color} />
    </svg>
  );
}

export default function AnaliticaTab() {
  const [kpis, setKpis] = useState<Kpi[] | null>(null);
  const [inis, setInis] = useState<Initiative[] | null>(null);
  const [gp, setGp] = useState<{ tasks: Task[]; people: Person[] } | null>(null);

  useEffect(() => {
    fetch("/api/td/kpi").then((r) => (r.ok ? r.json() : null)).then((j) => j && setKpis(j.kpis)).catch(() => null);
    fetch("/api/td/initiatives").then((r) => (r.ok ? r.json() : null)).then((j) => j && setInis(j.initiatives)).catch(() => null);
    fetch("/api/td/tasks").then((r) => (r.ok ? r.json() : null)).then((j) => j && setGp(j)).catch(() => null);
  }, []);

  // KPI que más se mueven: variación relativa entre el primer y el último punto
  const movers = useMemo(() => {
    if (!kpis) return [];
    return kpis
      .map((k) => {
        const first = k.series[0]?.value ?? 0;
        const last = k.series[k.series.length - 1]?.value ?? 0;
        const pct = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
        const good = k.goodDirection === "up" ? pct >= 0 : pct <= 0;
        return { k, pct, good };
      })
      .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
      .slice(0, 6);
  }, [kpis]);

  const budget = useMemo(() => {
    if (!inis) return null;
    const rows = [...inis].sort((a, b) => b.budgetPlanned - a.budgetPlanned);
    const maxPlanned = rows[0]?.budgetPlanned || 1;
    const tot = rows.reduce((a, i) => ({
      p: a.p + i.budgetPlanned, c: a.c + i.budgetCommitted, e: a.e + i.budgetExecuted,
    }), { p: 0, c: 0, e: 0 });
    return { rows, maxPlanned, tot };
  }, [inis]);

  // ritmo mensual: tareas hechas y no hechas por mes de vencimiento
  const ritmo = useMemo(() => {
    if (!gp) return null;
    const by = new Map<string, { done: number; open: number }>();
    for (const t of gp.tasks) {
      const m = t.due.slice(0, 7);
      const e = by.get(m) ?? { done: 0, open: 0 };
      if (t.status === "HECHA") e.done += 1; else e.open += 1;
      by.set(m, e);
    }
    const months = [...by.keys()].sort();
    const max = Math.max(...[...by.values()].map((v) => v.done + v.open), 1);
    return { months, by, max };
  }, [gp]);

  // carga abierta por responsable (principal)
  const carga = useMemo(() => {
    if (!gp) return [];
    const count = new Map<string, number>();
    for (const t of gp.tasks) {
      if (t.status === "HECHA") continue;
      count.set(t.assigneeId, (count.get(t.assigneeId) ?? 0) + 1);
    }
    const name = (id: string) => gp.people.find((p) => p.id === id)?.name ?? id;
    return [...count.entries()]
      .map(([id, n]) => ({ id, name: name(id), n }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 8);
  }, [gp]);

  if (!kpis || !inis || !gp) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <span className="flex items-center gap-2 text-[13px] text-muted">
          <Loader2 size={16} className="animate-spin" /> Calculando la analítica…
        </span>
      </div>
    );
  }

  const maxCarga = carga[0]?.n || 1;
  const fmtMes = (m: string) => {
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${meses[Number(m.slice(5)) - 1]} ${m.slice(2, 4)}`;
  };

  return (
    <>
      {/* tendencias de KPI */}
      <Card className="mb-5">
        <CardHeader title="Indicadores que más se mueven" sub="variación relativa de la serie completa — verde si el movimiento va en la dirección buena" />
        <div className="grid gap-x-6 gap-y-3 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-3">
          {movers.map(({ k, pct, good }) => {
            const line = LINES.find((l) => l.n === k.line)!;
            return (
              <Link key={k.code} href="/panel/kpi"
                className="group rounded-xl border border-line p-3 transition-colors hover:border-cyan">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="num text-[11px] font-bold text-cyan-deep">{k.code}</span>
                  <span className="num flex items-center gap-1 text-[11.5px] font-extrabold"
                    style={{ color: good ? "var(--ok)" : "var(--bad)" }}>
                    {pct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {pct >= 0 ? "+" : ""}{fmtNum(pct, 0)} %
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[12px] font-semibold text-ink group-hover:text-cyan-deep">{k.name}</div>
                <div className="mt-1.5 flex items-end justify-between gap-2">
                  <Spark series={k.series} color={line.color} />
                  <div className="text-right">
                    <div className="num text-[15px] font-extrabold text-ink">{fmtNum(k.health.latest, 1)}<span className="text-[10px] text-faint"> {k.unit}</span></div>
                    <div className="num text-[9.5px] text-faint">meta {fmtNum(k.target, 0)} · {k.health.pctToTarget} %</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        {/* presupuesto por iniciativa */}
        <Card>
          <CardHeader title="Ejecución presupuestal por iniciativa"
            sub={budget ? `portafolio ${fmtCOP(budget.tot.p)} · ejecutado ${Math.round((budget.tot.e / budget.tot.p) * 100)} % · comprometido ${Math.round((budget.tot.c / budget.tot.p) * 100)} %` : ""} />
          <div className="space-y-2.5 px-5 pb-5">
            {budget?.rows.map((i) => {
              const w = (v: number) => `${(v / budget.maxPlanned) * 100}%`;
              const usado = i.budgetPlanned ? Math.round(((i.budgetExecuted + i.budgetCommitted) / i.budgetPlanned) * 100) : 0;
              return (
                <Link key={i.id} href={`/panel/iniciativas/${i.id}`} className="group block">
                  <div className="mb-0.5 flex items-baseline justify-between gap-2 text-[11.5px]">
                    <span className="truncate font-semibold text-ink-soft group-hover:text-cyan-deep">
                      {i.id.toUpperCase()} · {i.name}
                    </span>
                    <span className="num shrink-0 text-muted">{fmtCOP(i.budgetPlanned)} · {usado} %</span>
                  </div>
                  <div className="relative h-[9px] overflow-hidden rounded-full bg-surface-2" style={{ width: w(i.budgetPlanned) }}>
                    <div className="absolute inset-y-0 left-0 rounded-l-full" style={{ width: `${(i.budgetExecuted / (i.budgetPlanned || 1)) * 100}%`, background: "var(--ok)" }} />
                    <div className="absolute inset-y-0" style={{ left: `${(i.budgetExecuted / (i.budgetPlanned || 1)) * 100}%`, width: `${(i.budgetCommitted / (i.budgetPlanned || 1)) * 100}%`, background: "var(--cyan)" }} />
                  </div>
                </Link>
              );
            })}
            <div className="flex gap-4 pt-1 text-[10px] text-faint">
              <span className="flex items-center gap-1"><i className="h-2 w-3 rounded-sm" style={{ background: "var(--ok)" }} /> Ejecutado</span>
              <span className="flex items-center gap-1"><i className="h-2 w-3 rounded-sm" style={{ background: "var(--cyan)" }} /> Comprometido</span>
              <span className="flex items-center gap-1"><i className="h-2 w-3 rounded-sm bg-surface-2" /> Disponible</span>
            </div>
          </div>
        </Card>

        {/* ritmo de tareas + carga */}
        <div className="grid gap-5">
          <Card>
            <CardHeader title="Ritmo de los planes de trabajo" sub="tareas por mes de vencimiento: hechas vs. pendientes" />
            <div className="px-5 pb-5">
              <div className="flex items-end gap-1.5" style={{ height: 110 }}>
                {ritmo?.months.map((m) => {
                  const e = ritmo.by.get(m)!;
                  const hDone = (e.done / ritmo.max) * 92;
                  const hOpen = (e.open / ritmo.max) * 92;
                  return (
                    <div key={m} className="flex flex-1 flex-col items-center justify-end gap-0.5" title={`${fmtMes(m)}: ${e.done} hechas · ${e.open} pendientes`}>
                      <div className="w-full max-w-[26px] rounded-t-sm" style={{ height: hOpen, background: "var(--warn)", opacity: 0.55 }} />
                      <div className="w-full max-w-[26px] rounded-t-sm" style={{ height: hDone, background: "var(--cyan)" }} />
                      <span className="num mt-1 text-[8.5px] text-faint">{fmtMes(m)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-4 text-[10px] text-faint">
                <span className="flex items-center gap-1"><i className="h-2 w-3 rounded-sm" style={{ background: "var(--cyan)" }} /> Hechas</span>
                <span className="flex items-center gap-1"><i className="h-2 w-3 rounded-sm" style={{ background: "var(--warn)", opacity: 0.55 }} /> Pendientes / vencidas</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Carga abierta por responsable" sub="tareas no cerradas donde la persona es responsable principal" />
            <div className="space-y-1.5 px-5 pb-5">
              {carga.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-[150px] shrink-0 truncate text-ink-soft">{p.name}</span>
                  <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-cyan" style={{ width: `${(p.n / maxCarga) * 100}%` }} />
                  </div>
                  <span className="num w-5 shrink-0 text-right font-bold text-ink">{p.n}</span>
                </div>
              ))}
              <Link href="/panel/proyectos" className="inline-flex items-center gap-1 pt-1.5 text-[11px] font-bold text-cyan-deep hover:underline">
                Abrir el gestor de proyectos <ExternalLink size={11} />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* semáforo global de KPI por línea */}
      <Card>
        <CardHeader title="Salud de indicadores por línea" sub="distribución del semáforo de los KPI de cada línea misional" />
        <div className="grid gap-x-8 gap-y-3 px-5 pb-5 sm:grid-cols-2">
          {LINES.map((line) => {
            const mine = kpis.filter((k) => k.line === line.n);
            const c = { OK: 0, WARN: 0, BAD: 0 } as Record<string, number>;
            mine.forEach((k) => { c[k.health.semaphore] = (c[k.health.semaphore] ?? 0) + 1; });
            return (
              <div key={line.n}>
                <div className="mb-1 flex items-baseline justify-between text-[12px]">
                  <span className="font-bold text-ink">{line.code} {line.short}</span>
                  <span className="num text-[10.5px] text-faint">{mine.length} KPI</span>
                </div>
                <div className="flex h-[10px] overflow-hidden rounded-full bg-surface-2">
                  {(["OK", "WARN", "BAD"] as const).map((sem) => (
                    c[sem] > 0 && (
                      <div key={sem} style={{ width: `${(c[sem] / mine.length) * 100}%`, background: SEM_COLOR[sem] }}
                        title={`${c[sem]} ${sem}`} />
                    )
                  ))}
                </div>
                <div className="num mt-0.5 text-[10px] text-faint">{c.OK} en meta · {c.WARN} en riesgo · {c.BAD} críticos</div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
