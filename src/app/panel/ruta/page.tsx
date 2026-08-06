"use client";

// M5 · Mapa de ruta: Gantt por trimestres + matriz de priorización.

import { useState } from "react";
import { PageHeader, Card, CardHeader, StatusChip } from "@/components/ui";
import { GanttChart, PriorityMatrix } from "@/components/charts";
import { INITIATIVES, LINES, fmtCOP } from "@/data/demo";

export default function RutaPage() {
  const [sel, setSel] = useState<string | null>(null);
  const ini = sel ? INITIATIVES.find((i) => i.id === sel) : null;

  const corto = INITIATIVES.filter((i) => i.horizon === "CORTO");
  const mediano = INITIATIVES.filter((i) => i.horizon === "MEDIANO");

  return (
    <>
      <PageHeader kicker="M5 · Mapa de ruta" title="Roadmap 2026–2028"
        desc="La ruta con pertinencia contextual: cada iniciativa declara horizonte, responsable, presupuesto, capacidad que fortalece e indicador que debe mover." />

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card className="rise rise-1">
          <CardHeader title="Cronograma por horizontes"
            sub={`Corto plazo: ${corto.length} iniciativas · mediano plazo: ${mediano.length}`} />
          <div className="px-5 py-4">
            <GanttChart onSelect={setSel}
              items={INITIATIVES.map((i) => ({
                id: i.id, name: i.name, start: i.start, end: i.end,
                horizon: i.horizon, progress: i.progress,
              }))} />
          </div>
          <div className="flex items-center gap-5 border-t border-line px-5 py-3 text-[11.5px] text-muted">
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded" style={{ background: "var(--cyan)" }} /> Corto plazo (0–12 m)</span>
            <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded" style={{ background: "var(--gold-fill)" }} /> Mediano plazo (12–36 m)</span>
          </div>
        </Card>

        <Card className="rise rise-2">
          <CardHeader title="Priorización" sub="Impacto × factibilidad — el sustento de qué se ejecuta primero" />
          <div className="px-5 py-4">
            <PriorityMatrix onSelect={setSel}
              items={INITIATIVES.map((i) => ({
                id: i.id, name: i.name, impact: i.impact,
                feasibility: i.feasibility, horizon: i.horizon,
              }))} />
          </div>
        </Card>
      </div>

      {/* detalle de iniciativa */}
      {ini && (
        <Card className="rise mb-5 border-cyan/40">
          <CardHeader title={ini.name} sub="Ficha de la iniciativa" right={<StatusChip status={ini.status} />} />
          <div className="grid gap-x-8 gap-y-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="label mb-1">Línea</div>
              <div className="text-[13px] font-semibold text-ink">
                {LINES.find((l) => l.n === ini.line)?.code}{" "}
                {LINES.find((l) => l.n === ini.line)?.name}
              </div>
            </div>
            <div>
              <div className="label mb-1">Responsable</div>
              <div className="text-[13px] font-semibold text-ink">{ini.owner}</div>
            </div>
            <div>
              <div className="label mb-1">Ventana</div>
              <div className="font-mono text-[12.5px] text-ink">{ini.start} → {ini.end}</div>
            </div>
            <div>
              <div className="label mb-1">Presupuesto</div>
              <div className="font-mono text-[12.5px] text-ink">{fmtCOP(ini.budgetPlanned)}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="label mb-1">Prioridad</div>
              <div className="text-[12.5px] text-muted">
                Impacto <b className="text-ink">{ini.impact}/5</b> · Factibilidad{" "}
                <b className="text-ink">{ini.feasibility}/5</b> ·{" "}
                {ini.impact >= 4 && ini.feasibility >= 4 ? "Quick win" :
                  ini.impact >= 4 ? "Apuesta mayor" : "Complementaria"}
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="label mb-1">Avance</div>
              <div className="flex items-center gap-3">
                <div className="h-[8px] flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-cyan" style={{ width: `${ini.progress}%` }} />
                </div>
                <span className="font-mono text-[12px] font-bold text-cyan-deep">{ini.progress} %</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* listas por horizonte */}
      <div className="rise rise-3 grid gap-5 lg:grid-cols-2">
        {[{ label: "Corto plazo · 0–12 meses", items: corto, color: "var(--cyan)" },
          { label: "Mediano plazo · 12–36 meses", items: mediano, color: "var(--gold-fill)" }].map((g) => (
          <Card key={g.label}>
            <CardHeader title={g.label} />
            <div className="divide-y divide-line">
              {g.items.map((i) => (
                <button key={i.id} onClick={() => setSel(i.id)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: g.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-ink">{i.name}</div>
                    <div className="font-mono text-[10.5px] text-faint">
                      {i.start} → {i.end} · {fmtCOP(i.budgetPlanned)}
                    </div>
                  </div>
                  <StatusChip status={i.status} />
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
