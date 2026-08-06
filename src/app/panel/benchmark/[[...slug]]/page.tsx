"use client";

// M2 · Comparación sectorial y territorio.
// El portafolio tiene ruta por programa: /panel/benchmark/<código> abre la
// ficha a pantalla completa con la procedencia de cada dato (SNIES, SPADIES,
// ICFES, LMS, modelo de costos i12 y registro calificado del MEN).

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Card, CardHeader } from "@/components/ui";
import { AccessChip } from "@/components/user-context";
import { ColombiaMap, CesarMap, PeerBars, PertinenceQuadrant, ColombiaImpactMap } from "@/components/charts";
import {
  MUNI_IMPACT, LENS_META, type MapLens, NATIONAL_IMPACT, INTERNATIONAL_IMPACT,
  IMPACT_STATS, conveniosTerritorio, conveniosNacionales, conveniosInternacionales,
} from "@/data/territorio";
import { MUNICIPALITIES, SUBREGIONS, BENCHMARK, QUADRANT, fmtNum } from "@/data/demo";
import { PROGRAMS, MUNI_ENROLLMENT, portfolioStats, FACULTIES, type Program } from "@/data/portfolio";
import { regCalOf } from "@/data/regcal";
import { downloadCsv } from "@/lib/csv";
import { StatCard } from "@/components/ui";
import {
  ArrowLeft, ArrowRight, GraduationCap, Wallet, ScrollText,
  TrendingDown, MonitorPlay, Award,
} from "lucide-react";

// filtros del portafolio: sobreviven a la navegación hacia la ficha y de vuelta
const PF: {
  fac: string | null; nivel: string | null; sede: string | null;
  modalidad: string | null; matricula: string | null; equilibrio: string | null;
} = { fac: null, nivel: null, sede: null, modalidad: null, matricula: null, equilibrio: null };

const MATRICULA_BANDS: Record<string, (n: number) => boolean> = {
  "< 200": (n) => n < 200,
  "200 – 500": (n) => n >= 200 && n <= 500,
  "> 500": (n) => n > 500,
};

export default function BenchmarkPage() {
  const router = useRouter();
  const params = useParams<{ slug?: string[] }>();
  const slug = params.slug ?? [];
  const openCode = slug[0] ? decodeURIComponent(slug[0]).toUpperCase() : null;

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
  const [facFilter, setFacState] = useState(PF.fac);
  const [nivelF, setNivelState] = useState(PF.nivel);
  const [sedeF, setSedeState] = useState(PF.sede);
  const [modF, setModState] = useState(PF.modalidad);
  const [matF, setMatState] = useState(PF.matricula);
  const [eqF, setEqState] = useState(PF.equilibrio);
  const setFacFilter = (v: string | null) => { PF.fac = v; setFacState(v); };
  const setNivelF = (v: string | null) => { PF.nivel = v; setNivelState(v); };
  const setSedeF = (v: string | null) => { PF.sede = v; setSedeState(v); };
  const setModF = (v: string | null) => { PF.modalidad = v; setModState(v); };
  const setMatF = (v: string | null) => { PF.matricula = v; setMatState(v); };
  const setEqF = (v: string | null) => { PF.equilibrio = v; setEqState(v); };

  const stats = portfolioStats();
  let programs = facFilter ? PROGRAMS.filter((p) => p.faculty === facFilter) : PROGRAMS;
  if (nivelF) programs = programs.filter((p) => p.level === nivelF);
  if (sedeF) programs = programs.filter((p) => p.campus === sedeF);
  if (modF) programs = programs.filter((p) => p.modality === modF);
  if (matF) programs = programs.filter((p) => MATRICULA_BANDS[matF]?.(p.students));
  if (eqF) programs = programs.filter((p) => (eqF === "Sí" ? p.breakEven : !p.breakEven));
  const anyFilter = nivelF || sedeF || modF || matF || eqF;

  // ficha de programa a pantalla completa — /panel/benchmark/<código>
  if (openCode) {
    return (
      <ProgramFicha code={openCode} list={programs}
        onClose={() => router.push("/panel/benchmark", { scroll: false })}
        onNav={(c) => router.push(`/panel/benchmark/${c}`, { scroll: false })} />
    );
  }

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

        {/* filtros de primera fila: nivel, sede, modalidad, matrícula, equilibrio */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {([
            ["Nivel", nivelF, setNivelF, ["Pregrado", "Tecnología", "Especialización", "Maestría"]],
            ["Sede", sedeF, setSedeF, ["Valledupar", "Aguachica"]],
            ["Modalidad", modF, setModF, ["Presencial", "Híbrida", "Virtual"]],
            ["Matrícula", matF, setMatF, Object.keys(MATRICULA_BANDS)],
            ["Equilibrio", eqF, setEqF, ["Sí", "No"]],
          ] as [string, string | null, (v: string | null) => void, string[]][]).map(([label, value, setter, options]) => (
            <label key={label} className="flex items-center gap-1.5">
              <span className="label !text-[8.5px]">{label}</span>
              <select value={value ?? ""}
                onChange={(e) => setter(e.target.value || null)}
                className={`input w-auto !py-1.5 pr-7 text-[11.5px] ${value ? "font-bold !text-cyan-deep" : "text-muted"}`}>
                <option value="">Todos</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
          {anyFilter && (
            <button onClick={() => { setNivelF(null); setSedeF(null); setModF(null); setMatF(null); setEqF(null); }}
              className="chip chip-bad cursor-pointer">
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => downloadCsv("portafolio-upc",
              ["Código", "Programa", "Nivel", "Facultad", "Sede", "Modalidad", "Matrícula", "% créd. virtuales", "Deserción %", "Saber Pro", "Equilibrio"],
              programs.map((p) => [p.code, p.name, p.level, p.faculty, p.campus, p.modality, p.students, p.virtualCredits, p.dropout, p.saberPro ?? "", p.breakEven ? "Sí" : "No"]))}
            className="chip cursor-pointer">
            CSV ↓
          </button>
          <span className="num ml-auto text-[11px] text-faint">
            {programs.length} de {PROGRAMS.length} programas
          </span>
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
                  <tr key={p.code + p.campus}
                    onClick={() => router.push(`/panel/benchmark/${p.code}`, { scroll: false })}
                    title={`Abrir la ficha de ${p.name} (${p.code})`}
                    className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-cyan-wash/50">
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
            Clic en una fila abre la ficha del programa con la procedencia de cada dato.
          </div>
        </Card>
      </div>
    </>
  );
}

/* ─── ficha de programa a pantalla completa ─── */

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Barra comparativa programa vs. facultad vs. institución. */
function CompareBar({ value, faculty, institution, max, unit, goodLow }: {
  value: number; faculty: number; institution: number; max: number; unit: string;
  goodLow?: boolean;   // true si menor es mejor (deserción)
}) {
  const rows = [
    { l: "Programa", v: value, strong: true },
    { l: "Facultad", v: faculty, strong: false },
    { l: "Institución", v: institution, strong: false },
  ];
  const worse = goodLow ? value > institution : value < institution;
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.l} className="flex items-center gap-2">
          <span className={`w-16 shrink-0 text-[9.5px] uppercase tracking-wide ${r.strong ? "font-bold text-ink" : "text-faint"}`}>
            {r.l}
          </span>
          <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (r.v / max) * 100)}%`,
                background: r.strong ? (worse ? "var(--bad)" : "var(--grad-brand)") : "var(--line-strong)",
              }} />
          </div>
          <span className={`num w-14 shrink-0 text-right text-[11px] ${r.strong ? "font-extrabold text-ink" : "text-muted"}`}>
            {fmtNum(r.v, 1)} {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProgramFicha({ code, list, onClose, onNav }: {
  code: string;
  list: Program[];                 // lista filtrada vigente (para anterior/siguiente)
  onClose: () => void;
  onNav: (code: string) => void;
}) {
  const p = PROGRAMS.find((x) => x.code === code) ?? null;

  const navList = p && list.some((x) => x.code === p.code) ? list : PROGRAMS;
  const idx = p ? navList.findIndex((x) => x.code === p.code) : -1;
  const prev = idx > 0 ? navList[idx - 1] : null;
  const next = idx >= 0 && idx < navList.length - 1 ? navList[idx + 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && prev) onNav(prev.code);
      if (e.key === "ArrowRight" && next) onNav(next.code);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNav, prev, next]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [code]);

  if (!p) {
    return (
      <>
        <button onClick={onClose} className="btn-ghost rise mb-5">
          <ArrowLeft size={13} /> Portafolio académico
        </button>
        <p className="rounded-xl bg-surface-2 px-5 py-6 text-[13px] text-muted">
          El programa <b className="num">{code}</b> no está en el portafolio.
        </p>
      </>
    );
  }

  const facPrograms = PROGRAMS.filter((x) => x.faculty === p.faculty);
  const facDropout = mean(facPrograms.map((x) => x.dropout));
  const instDropout = mean(PROGRAMS.map((x) => x.dropout));
  const facVirtual = mean(facPrograms.map((x) => x.virtualCredits));
  const instVirtual = mean(PROGRAMS.map((x) => x.virtualCredits));
  const facStudents = facPrograms.reduce((a, x) => a + x.students, 0);
  const reg = regCalOf(p.code);

  return (
    <>
      {/* barra de contexto */}
      <div className="rise mb-5 flex flex-wrap items-center gap-2">
        <button onClick={onClose} className="btn-ghost" title="Volver al portafolio (Esc)">
          <ArrowLeft size={13} /> Portafolio académico
        </button>
        <span className="num text-[11px] text-faint">{idx + 1} de {navList.length}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => prev && onNav(prev.code)} disabled={!prev}
            title={prev ? `${prev.code} · ${prev.name}` : undefined}
            className="btn-ghost disabled:opacity-30">
            <ArrowLeft size={13} /> <span className="num hidden sm:inline">{prev?.code ?? "—"}</span>
          </button>
          <button onClick={() => next && onNav(next.code)} disabled={!next}
            title={next ? `${next.code} · ${next.name}` : undefined}
            className="btn-ghost disabled:opacity-30">
            <span className="num hidden sm:inline">{next?.code ?? "—"}</span> <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* cabecera del programa */}
      <div className="rise rise-1 panel mb-5 overflow-hidden">
        <div className="spine h-[3px]" />
        <div className="flex flex-wrap items-start gap-x-6 gap-y-4 px-6 py-5">
          <div className="min-w-0 flex-1 basis-80">
            <div className="num text-[10.5px] font-bold text-cyan-deep">
              {p.code} <span className="font-medium text-faint">· {p.faculty} · sede {p.campus}</span>
            </div>
            <h1 className="mt-0.5 text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
              {p.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="chip">{p.level}</span>
              <span className={`chip ${p.modality === "Virtual" ? "chip-cyan" : p.modality === "Híbrida" ? "chip-gold" : ""}`}>
                {p.modality}
              </span>
              {p.accredited && <span className="chip chip-ok"><Award size={10} /> Acreditado en alta calidad</span>}
              <span className={`chip ${p.breakEven ? "chip-ok" : "chip-bad"}`}>
                {p.breakEven ? "Sobre el punto de equilibrio" : "Bajo el punto de equilibrio"}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="label">Matrícula vigente</div>
            <div className="num text-[34px] font-extrabold leading-none text-ink">{fmtNum(p.students, 0)}</div>
            <div className="num mt-1 text-[10.5px] text-faint">
              {facStudents > 0 ? Math.round((p.students / facStudents) * 100) : 0} % de la facultad
            </div>
          </div>
        </div>
      </div>

      {/* métricas con su procedencia */}
      <div className="rise rise-2 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Componente virtual" sub={<><MonitorPlay size={11} className="mr-1 inline" />% de créditos con mediación virtual</>} />
          <div className="px-5 pb-4">
            <CompareBar value={p.virtualCredits} faculty={facVirtual} institution={instVirtual}
              max={50} unit="%" />
            <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-[11px] leading-relaxed text-muted">
              <b className="text-ink">De dónde sale:</b> análisis de los planes de estudio (créditos con
              mediación declarada) contrastado con las aulas activas del LMS. Alimenta el KPI AV-04
              (programas con ≥ 20 % de créditos virtuales) y la variable AV-DAT-2 del diagnóstico.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Deserción anual" sub={<><TrendingDown size={11} className="mr-1 inline" />tasa anual por cohorte</>} />
          <div className="px-5 pb-4">
            <CompareBar value={p.dropout} faculty={facDropout} institution={instDropout}
              max={20} unit="%" goodLow />
            <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-[11px] leading-relaxed text-muted">
              <b className="text-ink">De dónde sale:</b> SPADIES (sistema del MEN para la prevención de la
              deserción), tasa anual por cohorte. Semáforo: <b style={{ color: "var(--ok)" }}>≤ 11 %</b> ·{" "}
              <b style={{ color: "var(--warn)" }}>11–14 %</b> · <b style={{ color: "var(--bad)" }}>&gt; 14 %</b>.
              El modelo de alerta temprana (analítica de aprendizaje, AV-DAT-1) apunta a bajarla.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Saber Pro" sub={<><GraduationCap size={11} className="mr-1 inline" />promedio global del programa</>} />
          <div className="px-5 pb-4">
            {p.saberPro ? (
              <div className="flex items-baseline gap-3">
                <span className="num text-[30px] font-extrabold text-ink">{p.saberPro}</span>
                <span className="text-[11px] text-faint">/ 300 · media nacional ≈ 147</span>
                <span className={`chip ${p.saberPro >= 147 ? "chip-ok" : "chip-warn"}`}>
                  {p.saberPro >= 147 ? "Sobre la media nacional" : "Bajo la media nacional"}
                </span>
              </div>
            ) : (
              <p className="text-[12px] italic text-faint">
                Sin dato: el nivel {p.level.toLowerCase()} no presenta Saber Pro.
              </p>
            )}
            <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-[11px] leading-relaxed text-muted">
              <b className="text-ink">De dónde sale:</b> resultados oficiales del ICFES (examen Saber Pro),
              promedio del puntaje global de los evaluados del programa en la última aplicación.
              Es insumo directo de los indicadores de rankings (observatorio i6).
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Sostenibilidad financiera" sub={<><Wallet size={11} className="mr-1 inline" />punto de equilibrio del programa</>} />
          <div className="px-5 pb-4">
            <div className="flex items-center gap-3">
              <span className={`chip ${p.breakEven ? "chip-ok" : "chip-bad"}`}>
                {p.breakEven ? "Opera sobre el equilibrio" : "Opera bajo el equilibrio"}
              </span>
              {!p.breakEven && (
                <span className="text-[11px] text-muted">requiere plan de intervención (AV-ORG-4)</span>
              )}
            </div>
            <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-[11px] leading-relaxed text-muted">
              <b className="text-ink">De dónde sale:</b> el{" "}
              <Link href="/panel/iniciativas/i12" className="font-bold text-cyan-deep">modelo de costos unitarios (i12)</Link>:
              costos directos e indirectos por programa frente a los ingresos de su matrícula, por sede y
              jornada. La revisión anual del portafolio decide intervenciones sobre los programas bajo equilibrio.
            </p>
          </div>
        </Card>
      </div>

      {/* registro calificado */}
      <Card className="rise rise-3 mt-5">
        <CardHeader title="Registro calificado" sub={<><ScrollText size={11} className="mr-1 inline" />condición legal de operación (Decreto 1330)</>} />
        <div className="px-5 pb-4">
          {reg ? (
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3">
              {[
                ["Resolución", reg.resolucion],
                ["Otorgado", reg.otorgado],
                ["Vence", reg.vence],
                ["Estado", reg.estado === "VIGENTE" ? "Vigente" : reg.estado === "POR_VENCER" ? "Por vencer (< 18 meses)" : "En renovación ante el MEN"],
                ["Última autoevaluación", String(reg.ultimaAutoevaluacion)],
                ["Modalidad del registro", reg.modalidadRegistro],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="label !text-[8.5px]">{l}</div>
                  <div className="num text-[12.5px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] italic text-faint">Sin registro asociado en el corte demo.</p>
          )}
          <p className="mt-3 rounded-lg bg-surface-2/70 px-3 py-2 text-[11px] leading-relaxed text-muted">
            <b className="text-ink">De dónde sale:</b> resoluciones del MEN (SACES) y el archivo institucional
            de registros. La <b>modalidad del registro</b> define qué puede ofrecerse legalmente: un programa
            solo opera virtual si su registro lo ampara — el detalle completo está en{" "}
            <Link href="/panel/madurez/registros" className="font-bold text-cyan-deep">Registros calificados</Link>.
          </p>
        </div>
      </Card>

      {/* nota de procedencia general */}
      <p className="mt-5 text-[10.5px] leading-relaxed text-faint">
        Cifras ilustrativas con estructura real: en operación, matrícula y oferta se cargan del registro
        académico y SNIES (Fase 1), deserción de SPADIES, Saber Pro del ICFES, el componente virtual del
        análisis curricular + LMS, y el equilibrio del modelo de costos (i12). Las convenciones completas
        están en <Link href="/panel/metodologia" className="font-semibold text-cyan-deep">Metodología</Link>.
      </p>
    </>
  );
}
