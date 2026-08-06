"use client";

// M2 · Comparación sectorial y territorio.

import { useState } from "react";
import { PageHeader, Card, CardHeader } from "@/components/ui";
import { AccessChip } from "@/components/user-context";
import { ColombiaMap, CesarMap, PeerBars, PertinenceQuadrant, ColombiaImpactMap } from "@/components/charts";
import {
  MUNI_IMPACT, LENS_META, type MapLens, NATIONAL_IMPACT, INTERNATIONAL_IMPACT,
  IMPACT_STATS, conveniosTerritorio, conveniosNacionales, conveniosInternacionales,
} from "@/data/territorio";
import { MUNICIPALITIES, SUBREGIONS, BENCHMARK, QUADRANT, fmtNum } from "@/data/demo";
import { PROGRAMS, MUNI_ENROLLMENT, portfolioStats, FACULTIES } from "@/data/portfolio";
import { StatCard } from "@/components/ui";

export default function BenchmarkPage() {
  const [sub, setSub] = useState<string | null>(null);
  const [lens, setLens] = useState<MapLens>("cobertura");
  const [deptSel, setDeptSel] = useState<string | null>(null);
  const lensValues: Record<string, number> | undefined =
    lens === "cobertura" ? undefined
    : Object.fromEntries(Object.entries(MUNI_IMPACT).map(([k, v]) =>
        [k, lens === "investigacion" ? v.produccion : v.convenios]));
  const lensMeta = LENS_META[lens];
  const topMunis = lens === "cobertura"
    ? [...Object.entries(MUNI_ENROLLMENT)].sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [...Object.entries(MUNI_IMPACT)]
        .map(([k, v]) => [k, lens === "investigacion" ? v.produccion : v.convenios] as [string, number])
        .sort((a, b) => b[1] - a[1]).slice(0, 5);
  const [facFilter, setFacFilter] = useState<string | null>(null);
  const stats = portfolioStats();
  const programs = facFilter ? PROGRAMS.filter((p) => p.faculty === facFilter) : PROGRAMS;

  return (
    <>
      <PageHeader kicker="M2 · Comparación" title="Posición sectorial y territorio"
        desc="Tres cortes: nacional, pares comparables y la cobertura municipal del Cesar. El benchmark responde la pregunta que sigue a todo diagnóstico: ¿esto es bueno o malo comparado con quién?" actions={<AccessChip module="benchmark" />} />

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
        <CardHeader title="Huella territorial en el Cesar"
          sub="25 municipios · tres lentes misionales sobre el mismo mapa · filtra por subregión"
          right={
            <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
              {(Object.keys(LENS_META) as MapLens[]).map((l) => (
                <button key={l} onClick={() => setLens(l)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                    lens === l ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                  {LENS_META[l].short}
                </button>
              ))}
            </div>
          } />
        <div className="grid gap-6 px-5 py-5 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <div className="label mb-2">Posición nacional</div>
            <ColombiaMap />
            <div className="label mb-2 mt-5">Top 5 · {lensMeta.short.toLowerCase()}</div>
            <div className="space-y-1.5">
              {topMunis.map(([name, v], i) => (
                <div key={name} className="flex items-baseline gap-2 text-[12px]">
                  <span className="num w-3 shrink-0 font-extrabold text-faint">{i + 1}</span>
                  <span className="flex-1 truncate font-semibold text-ink">{name}</span>
                  <span className="num font-bold" style={{ color: lensMeta.colorDeep }}>{fmtNum(v, 0)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="label mb-2">{lensMeta.label}</div>
            <CesarMap munis={[...MUNICIPALITIES]} highlight={sub}
              values={lensValues} lensColor={lensMeta.color} lensDeep={lensMeta.colorDeep}
              unit={lensMeta.unit} />
            {lens === "cobertura" ? (
              <div className="mt-2 flex flex-wrap items-center gap-3.5 text-[11px] text-muted">
                <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full" style={{ background: "var(--cyan-deep)" }} /> Cobertura alta</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--cyan-fill)" }} /> Media</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: "var(--line-strong)" }} /> Baja</span>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-3.5 text-[11px] text-muted">
                <span className="flex items-center gap-1.5"><i className="h-3.5 w-3.5 rounded-full" style={{ background: lensMeta.colorDeep }} /> Concentración alta</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full" style={{ background: lensMeta.color }} /> Presencia</span>
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: "var(--line-strong)" }} /> Sin registro</span>
                <span className="text-faint">· radio ∝ √{lensMeta.unit}</span>
              </div>
            )}
            <p className="mt-2 text-[11.5px] leading-relaxed text-muted">{lensMeta.desc}</p>
            <div className="mt-2 rounded-lg px-3 py-2 text-[11.5px] leading-relaxed"
              style={{ background: "color-mix(in srgb, var(--gold) 8%, white)", color: "#6b5312" }}>
              <b>Lectura:</b> {lensMeta.lectura}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="label mb-2.5">Lectura por subregión</div>
            <div className="space-y-2.5">
              {SUBREGIONS.map((s) => {
                const munis = MUNICIPALITIES.filter((m) => m.subregion === s.name);
                const enrolled = munis.reduce((a, m) => a + (MUNI_ENROLLMENT[m.name] ?? 0), 0);
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
                      <span className="num text-[10.5px] text-faint">{munis.length} municipios · {fmtNum(enrolled, 0)} est.</span>
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

      {/* ── impacto nacional e internacional ── */}
      <div className="rise mt-8">
        <div className="kicker mb-4">Impacto nacional e internacional · investigación y relacionamiento</div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Producción con coautoría internacional"
            value={IMPACT_STATS.coautoriaInternacionalPct} unit="%"
            foot={`${IMPACT_STATS.paisesConVinculo} países con vínculo activo`} />
          <StatCard label="Departamentos con colaboración" value={IMPACT_STATS.paresNacionales}
            unit="de 32" foot="Coautorías y convenios interinstitucionales"
            accent="linear-gradient(90deg, var(--cyan), var(--navy))" />
          <StatCard label="Redes académicas activas" value={IMPACT_STATS.redesActivas}
            unit="redes" foot="UDUAL · agroambiental · ciénagas del Caribe"
            accent="linear-gradient(90deg, var(--n4), var(--n5))" />
          <StatCard label="Movilidad 2026" value={IMPACT_STATS.movilidadSaliente}
            unit={`salientes · ${IMPACT_STATS.movilidadEntrante} entrantes`}
            foot="Docentes y estudiantes"
            accent="linear-gradient(90deg, var(--gold-fill), var(--gold))" />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader title="Colaboración nacional"
              sub="Coautorías 2021–2026 por departamento · clic para el detalle" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <ColombiaImpactMap
                values={Object.fromEntries(NATIONAL_IMPACT.map((d) => [d.dept, d.coautorias]))}
                selected={deptSel} onSelect={setDeptSel} />
              <div className="space-y-1.5 self-center">
                {NATIONAL_IMPACT.slice(0, 8).map((d) => {
                  const max = NATIONAL_IMPACT[0].coautorias;
                  const active = deptSel === d.dept;
                  return (
                    <button key={d.dept} onClick={() => setDeptSel(active ? null : d.dept)}
                      className={`block w-full rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                        active ? "bg-cyan-wash" : "hover:bg-surface-2"}`}>
                      <div className="flex items-baseline justify-between text-[12px]">
                        <span className="font-semibold text-ink">{d.dept}</span>
                        <span className="num font-bold text-cyan-deep">{d.coautorias}</span>
                      </div>
                      <div className="mt-1 h-[5px] overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full"
                          style={{ width: `${(d.coautorias / max) * 100}%`, background: "var(--grad-brand)" }} />
                      </div>
                      {active && d.nota && (
                        <p className="mt-1 text-[10.5px] leading-snug text-muted">{d.nota}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-t border-line px-5 py-2.5 text-[10.5px] text-faint">
              {conveniosNacionales()} convenios interinstitucionales activos fuera del Cesar ·
              el eje Caribe (Atlántico, Magdalena, La Guajira) concentra el 33 % de la coautoría.
            </div>
          </Card>

          <Card>
            <CardHeader title="Colaboración internacional"
              sub="Coautorías y convenios por país · fuente: Scopus/OpenAlex + convenios (ilustrativo)" />
            <div className="space-y-2 px-5 pb-4">
              {INTERNATIONAL_IMPACT.map((c) => {
                const max = INTERNATIONAL_IMPACT[0].coautorias;
                return (
                  <div key={c.country} className="flex items-center gap-3">
                    <span className="w-6 shrink-0 text-center text-[16px]">{c.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[12.5px] font-semibold text-ink">{c.country}</span>
                        <span className="num text-[11px] text-muted">
                          <b className="text-[12.5px] text-cyan-deep">{c.coautorias}</b> coautorías
                          {c.convenios > 0 && <span className="chip chip-gold ml-1.5">{c.convenios} convenio</span>}
                        </span>
                      </div>
                      <div className="mt-1 h-[5px] overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full rounded-full"
                          style={{ width: `${(c.coautorias / max) * 100}%`, background: "linear-gradient(90deg, var(--gold-fill), var(--gold))" }} />
                      </div>
                      <div className="mt-0.5 text-[10px] text-faint">{c.tipo}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-line px-5 py-2.5 text-[10.5px] text-faint">
              La coautoría internacional ({IMPACT_STATS.coautoriaInternacionalPct} % de la producción) se concentra en LATAM y España:
              coherente con doctorados en curso y redes UDUAL. {conveniosInternacionales()} convenios internacionales activos.
            </div>
          </Card>
        </div>

        <p className="mt-3 text-[11px] italic leading-relaxed text-faint">
          Consistencia: {conveniosTerritorio()} convenios territoriales + {conveniosNacionales()} nacionales + {conveniosInternacionales()} internacionales
          = 61, el valor vigente del KPI EX-01. Cifras ilustrativas — se pueblan con SIVIPS, Scopus/OpenAlex y el archivo de convenios en las Fases 1–2.
        </p>
      </div>

      {/* ── portafolio académico ── */}
      <div className="rise mt-8">
        <div className="kicker mb-4">Portafolio académico · {stats.programs} programas</div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Matrícula total" value={stats.students}
            foot={`Valledupar ${fmtNum(stats.byCampus.Valledupar, 0)} · Aguachica ${fmtNum(stats.byCampus.Aguachica, 0)}`} />
          <StatCard label="Programas con ≥20 % de créditos virtuales" value={stats.withVirtualComponent}
            unit={`de ${stats.programs}`} foot={`Promedio ponderado: ${fmtNum(stats.avgVirtualCredits, 1)} % de créditos`} />
          <StatCard label="Acreditados en alta calidad" value={stats.accredited}
            unit="programas" foot="Estructura CNA (cifras ilustrativas)"
            accent="linear-gradient(90deg, var(--n4), var(--n5))" />
          <StatCard label="Bajo el punto de equilibrio" value={stats.belowBreakEven}
            unit="programas" foot="Modelo de costos unitarios (iniciativa i12)"
            accent="linear-gradient(90deg, var(--bad), #a13c44)" />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => setFacFilter(null)}
            className={`chip cursor-pointer ${facFilter === null ? "chip-cyan" : ""}`}>
            Todas · {PROGRAMS.length}
          </button>
          {FACULTIES.map((fc) => (
            <button key={fc} onClick={() => setFacFilter(facFilter === fc ? null : fc)}
              className={`chip cursor-pointer ${facFilter === fc ? "chip-cyan" : ""}`}>
              {fc.split(",")[0]} · {PROGRAMS.filter((p) => p.faculty === fc).length}
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-[12.5px]">
              <thead>
                <tr className="border-b border-line-strong bg-surface-2/60">
                  {["Programa", "Nivel", "Sede", "Modalidad", "Matrícula", "% créd. virtuales", "Deserción", "Saber Pro", "Equilibrio"].map((h) => (
                    <th key={h} className="label whitespace-nowrap px-4 py-2.5 text-left !text-[8.5px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.code + p.campus} className="border-b border-line transition-colors last:border-0 hover:bg-surface-2/50">
                    <td className="px-4 py-2">
                      <div className="font-semibold text-ink">{p.name}</div>
                      <div className="num text-[9.5px] text-faint">{p.code}{p.accredited ? " · Acreditado" : ""}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-muted">{p.level}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-muted">{p.campus}</td>
                    <td className="px-4 py-2">
                      <span className={`chip ${p.modality === "Virtual" ? "chip-cyan" : p.modality === "Híbrida" ? "chip-gold" : ""}`}>
                        {p.modality}
                      </span>
                    </td>
                    <td className="num px-4 py-2 text-right font-semibold text-ink">{fmtNum(p.students, 0)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-[6px] w-16 overflow-hidden rounded-full bg-surface-2">
                          <div className="h-full rounded-full"
                            style={{ width: `${p.virtualCredits}%`, background: p.virtualCredits >= 20 ? "var(--cyan)" : "var(--line-strong)" }} />
                        </div>
                        <span className="num text-[11px] text-muted">{p.virtualCredits} %</span>
                      </div>
                    </td>
                    <td className="num px-4 py-2 text-right"
                      style={{ color: p.dropout > 14 ? "var(--bad)" : p.dropout > 11 ? "var(--warn)" : "var(--ok)" }}>
                      {fmtNum(p.dropout, 1)} %
                    </td>
                    <td className="num px-4 py-2 text-right text-muted">{p.saberPro ?? "—"}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`chip ${p.breakEven ? "chip-ok" : "chip-bad"}`}>{p.breakEven ? "Sí" : "No"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-line px-5 py-2.5 text-[10.5px] text-faint">
            Estructura tipo SNIES con cifras ilustrativas; se puebla con el registro académico real en la Fase 1.
            La columna de equilibrio proviene del modelo de costos unitarios (iniciativa i12).
          </div>
        </Card>
      </div>
    </>
  );
}
