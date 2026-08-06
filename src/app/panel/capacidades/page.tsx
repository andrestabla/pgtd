"use client";

// M3 · Capacidades y mapa estratégico navegable:
// objetivo → capacidad → iniciativa → indicador.

import { useState } from "react";
import { PageHeader, Card, CardHeader, DemoBanner } from "@/components/ui";
import { OBJECTIVES, CAPABILITIES, INITIATIVES, KPIS, LINES } from "@/data/demo";
import { ChevronRight } from "lucide-react";

export default function CapacidadesPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const cap = selected ? CAPABILITIES.find((c) => c.id === selected) : null;
  const relatedInis = cap ? INITIATIVES.filter((i) => i.capability === cap.id) : [];
  const relatedKpis = relatedInis
    .map((i) => KPIS.find((k) => k.code === i.kpi))
    .filter((k, idx, arr) => k && arr.indexOf(k) === idx);

  return (
    <>
      <PageHeader kicker="M3 · Capacidades" title="Mapa estratégico de la educación digital"
        desc="La trazabilidad que suele perderse entre el plan de desarrollo y la ejecución: desde cada objetivo se llega a las capacidades que lo sostienen, a las iniciativas que las fortalecen y al indicador que debería moverse." />
      <DemoBanner />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* columna de objetivos → capacidades */}
        <Card className="rise rise-1 lg:col-span-2">
          <CardHeader title="Objetivos y capacidades" sub="Clic en una capacidad para ver su cadena completa" />
          <div className="space-y-5 px-5 py-5">
            {OBJECTIVES.map((ob) => (
              <div key={ob.id}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-navy px-2.5 py-1 text-[11.5px] font-bold text-white">
                    {ob.name}
                  </span>
                </div>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {CAPABILITIES.filter((c) => c.objective === ob.id).map((c) => {
                    const line = LINES.find((l) => l.n === c.line)!;
                    const active = selected === c.id;
                    const gap = c.target - c.current;
                    return (
                      <button key={c.id} onClick={() => setSelected(active ? null : c.id)}
                        className={`rounded-xl border px-4 py-3 text-left transition-all ${
                          active ? "border-cyan bg-cyan-wash shadow-sm" : "border-line bg-surface hover:border-line-strong"
                        }`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-bold text-ink">{c.name}</span>
                          <span className="chip shrink-0" style={{ borderColor: line.color, color: line.color }}>
                            {line.code}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-surface-2">
                            <div className="h-full rounded-full" style={{
                              width: `${(c.current / 5) * 100}%`, background: line.color,
                            }} />
                          </div>
                          <span className="font-mono text-[10.5px] text-muted">
                            {c.current} → {c.target}
                          </span>
                        </div>
                        <div className="mt-1.5 text-[11px] text-faint">
                          Brecha {gap} · {c.owner}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* cadena de la capacidad seleccionada */}
        <Card className="rise rise-2">
          <CardHeader title="Cadena de valor" sub={cap ? cap.name : "Selecciona una capacidad"} />
          <div className="px-5 py-5">
            {!cap ? (
              <p className="text-[12.5px] italic text-faint">
                Al seleccionar una capacidad verás aquí las iniciativas que la fortalecen y
                los indicadores que deben moverse si la iniciativa funciona.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="mono-label mb-1.5">Objetivo</div>
                  <div className="rounded-lg bg-navy px-3.5 py-2.5 text-[12.5px] font-semibold text-white">
                    {OBJECTIVES.find((o) => o.id === cap.objective)?.name}
                  </div>
                </div>
                <div className="flex justify-center text-faint"><ChevronRight className="rotate-90" size={15} /></div>
                <div>
                  <div className="mono-label mb-1.5">Capacidad</div>
                  <div className="rounded-lg border border-cyan bg-cyan-wash px-3.5 py-2.5">
                    <div className="text-[13px] font-bold text-ink">{cap.name}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-cyan-deep">
                      nivel {cap.current} → meta {cap.target} · brecha {cap.target - cap.current}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center text-faint"><ChevronRight className="rotate-90" size={15} /></div>
                <div>
                  <div className="mono-label mb-1.5">Iniciativas</div>
                  {relatedInis.length === 0 ? (
                    <p className="text-[12px] italic text-faint">Sin iniciativas asociadas aún.</p>
                  ) : (
                    <div className="space-y-2">
                      {relatedInis.map((i) => (
                        <div key={i.id} className="rounded-lg border border-line bg-surface-2/60 px-3.5 py-2.5">
                          <div className="text-[12.5px] font-semibold text-ink">{i.name}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted">
                            {i.horizon === "CORTO" ? "corto plazo" : "mediano plazo"} · avance {i.progress} %
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-center text-faint"><ChevronRight className="rotate-90" size={15} /></div>
                <div>
                  <div className="mono-label mb-1.5">Indicadores que deben moverse</div>
                  {relatedKpis.length === 0 ? (
                    <p className="text-[12px] italic text-faint">Sin indicadores vinculados.</p>
                  ) : (
                    <div className="space-y-2">
                      {relatedKpis.map((k) => k && (
                        <div key={k.code} className="rounded-lg border px-3.5 py-2.5"
                          style={{ borderColor: "color-mix(in srgb, var(--gold) 40%, white)", background: "var(--gold-wash)" }}>
                          <div className="text-[12.5px] font-semibold text-ink">{k.name}</div>
                          <div className="mt-0.5 font-mono text-[10px]" style={{ color: "var(--gold)" }}>
                            {k.code} · meta {k.target} {k.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
