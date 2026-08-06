"use client";

// M1 · Medición de madurez: radar + heatmap + detalle de celda con evidencia.

import { useState } from "react";
import { PageHeader, Card, CardHeader, LevelBadge, EmptyNote } from "@/components/ui";
import { MaturityRadar, MaturityHeatmap } from "@/components/charts";
import { LINES, DIMENSIONS, SCORES, LEVELS, EVIDENCES } from "@/data/demo";
import { FileText, X } from "lucide-react";

export default function MadurezPage() {
  const [cell, setCell] = useState<{ line: number; dim: string } | null>(null);

  const line = cell ? LINES.find((l) => l.n === cell.line) : null;
  const dim = cell ? DIMENSIONS.find((d) => d.key === cell.dim) : null;
  const score = cell ? SCORES[cell.line][cell.dim] : null;
  const evidences = cell
    ? EVIDENCES.filter((e) => e.line === cell.line && e.dimension === cell.dim)
    : [];

  return (
    <>
      <PageHeader kicker="M1 · Medición de madurez" title="Madurez por línea y dimensión"
        desc="Cada celda del mapa de calor abre su detalle: puntaje, meta, responsable y evidencia verificable. La medición se repite con el mismo instrumento para construir la serie." />

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="rise rise-1 lg:col-span-2">
          <CardHeader title="Radar institucional" sub="Actual vs. meta a 24 meses" />
          <div className="px-5 py-3"><MaturityRadar size={360} /></div>
        </Card>

        <Card className="rise rise-2 lg:col-span-3">
          <CardHeader title="Mapa de calor" sub="Nivel por línea × dimensión — clic en una celda para el detalle" />
          <div className="px-5 py-4">
            <MaturityHeatmap onCell={(l, d) => setCell({ line: l, dim: d })} />
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

      {/* panel de detalle de celda */}
      {cell && line && dim && score && (
        <Card className="rise mt-5 border-cyan/40" >
          <CardHeader
            title={`${line.code} ${line.name} · ${dim.name}`}
            sub="Detalle del punto de medición"
            right={
              <button onClick={() => setCell(null)}
                className="rounded-md p-1 text-faint transition-colors hover:bg-surface-2 hover:text-ink">
                <X size={16} />
              </button>
            }
          />
          <div className="grid gap-6 px-5 py-5 md:grid-cols-3">
            <div>
              <div className="label mb-2">Nivel actual</div>
              <LevelBadge level={score.value} />
              <div className="label mb-2 mt-4">Meta a 24 meses</div>
              <LevelBadge level={score.target} />
              <p className="mt-4 text-[12.5px] leading-relaxed text-muted">
                {LEVELS[score.value - 1].desc}
              </p>
            </div>
            <div className="md:col-span-2">
              <div className="label mb-2.5">Evidencia asociada</div>
              {evidences.length === 0 ? (
                <EmptyNote>
                  Sin evidencia cargada para esta celda en el modo demo. En operación, cada
                  calificación exige al menos un soporte verificable.
                </EmptyNote>
              ) : (
                <div className="space-y-2">
                  {evidences.map((e) => (
                    <div key={e.title}
                      className="flex items-start gap-3 rounded-lg border border-line bg-surface-2/50 px-3.5 py-2.5">
                      <FileText size={15} className="mt-0.5 shrink-0 text-cyan-deep" />
                      <div>
                        <div className="text-[13px] font-semibold text-ink">{e.title}</div>
                        <div className="text-[11.5px] text-muted">Fuente: {e.source}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* escala */}
      <div className="rise rise-3 mt-5 grid gap-3 sm:grid-cols-5">
        {LEVELS.map((lv) => (
          <div key={lv.n} className="rounded-xl p-4 text-white" style={{ background: lv.color }}>
            <div className="font-mono text-[10px] font-bold opacity-75">NIVEL {lv.n}</div>
            <div className="mt-0.5 text-[14px] font-bold">{lv.name}</div>
            <div className="mt-1.5 text-[11px] leading-snug opacity-90">{lv.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}
