"use client";

// M2 · Comparación sectorial y territorio.

import { useState } from "react";
import { PageHeader, Card, CardHeader, DemoBanner } from "@/components/ui";
import { ColombiaMap, CesarMap, PeerBars, PertinenceQuadrant } from "@/components/charts";
import { MUNICIPALITIES, SUBREGIONS, BENCHMARK, QUADRANT } from "@/data/demo";

export default function BenchmarkPage() {
  const [sub, setSub] = useState<string | null>(null);

  return (
    <>
      <PageHeader kicker="M2 · Comparación" title="Posición sectorial y territorio"
        desc="Tres cortes: nacional, pares comparables y la cobertura municipal del Cesar. El benchmark responde la pregunta que sigue a todo diagnóstico: ¿esto es bueno o malo comparado con quién?" />
      <DemoBanner />

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card className="rise rise-1">
          <CardHeader title="Posición frente a pares" sub={BENCHMARK.metric + " · IES públicas comparables"} />
          <div className="px-5 py-5"><PeerBars peers={[...BENCHMARK.peers]} nationalAvg={BENCHMARK.nationalAvg} /></div>
        </Card>

        <Card className="rise rise-2">
          <CardHeader title="Pertinencia territorial" sub="Oferta vigente vs. índice de demanda departamental" />
          <div className="px-5 py-3"><PertinenceQuadrant points={QUADRANT.points} /></div>
        </Card>
      </div>

      <Card className="rise rise-3">
        <CardHeader title="Cobertura en el departamento del Cesar"
          sub="25 municipios · tamaño del punto proporcional a matrícula · filtra por subregión" />
        <div className="grid gap-6 px-5 py-5 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="mono-label mb-2">Posición nacional</div>
            <ColombiaMap />
          </div>
          <div className="lg:col-span-2">
            <div className="mono-label mb-2">Departamento del Cesar</div>
            <CesarMap munis={[...MUNICIPALITIES]} highlight={sub} />
            <div className="mt-2 flex flex-wrap items-center gap-3.5 text-[11px] text-muted">
              <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full" style={{ background: "var(--cyan-deep)" }} /> Cobertura alta</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--cyan-fill)" }} /> Media</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: "var(--line-strong)" }} /> Baja</span>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="mono-label mb-2.5">Lectura por subregión</div>
            <div className="space-y-2.5">
              {SUBREGIONS.map((s) => {
                const munis = MUNICIPALITIES.filter((m) => m.subregion === s.name);
                const active = sub === s.name;
                return (
                  <button key={s.name}
                    onClick={() => setSub(active ? null : s.name)}
                    className={`block w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      active
                        ? "border-cyan bg-cyan-wash shadow-sm"
                        : "border-line bg-surface hover:border-line-strong"
                    }`}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13.5px] font-bold text-ink">{s.name}</span>
                      <span className="font-mono text-[10.5px] text-faint">{munis.length} municipios</span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">{s.reading}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] italic leading-relaxed text-faint">
              Geometría oficial del departamento. Cobertura y matrícula ilustrativas: se
              parametrizan con datos reales de la Universidad en las Fases 0 y 2.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
