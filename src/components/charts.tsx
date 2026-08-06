"use client";

// Gráficos SVG propios de la PGTD: radar, heatmap, sparkline, gantt,
// matriz de priorización, barras de benchmark y presupuesto.
// Sin dependencias externas: control total del estilo y peso mínimo.

import { LINES, DIMENSIONS, SCORES, lineScore, lineTarget, type Muni } from "@/data/demo";
import { CO_PATHS, CO_VIEW, CESAR_MARK, CESAR_PATH, CESAR_VIEW, projectCesar } from "@/data/geo";

/* ─── Radar de madurez (4 ejes) ─────────────────────────────────────────── */

export function MaturityRadar({ size = 380 }: { size?: number }) {
  const cx = size / 2, cy = size / 2 + 8;
  const rMax = size * 0.31;
  const pt = (axis: number, v: number): [number, number] => {
    const r = (v / 5) * rMax;
    // ejes: 0 arriba (4.1), 1 derecha (4.2), 2 abajo (4.3), 3 izquierda (4.4)
    const ang = (Math.PI / 2) * axis - Math.PI / 2;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  const poly = (vals: number[]) =>
    vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");

  const actual = LINES.map((l) => lineScore(l.n));
  const target = LINES.map((l) => lineTarget(l.n));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" role="img"
      aria-label="Radar de madurez institucional en cuatro líneas">
      {/* anillos 1..5 */}
      {[1, 2, 3, 4, 5].map((lvl) => (
        <polygon key={lvl} points={poly([lvl, lvl, lvl, lvl])} fill="none"
          stroke="var(--line)" strokeWidth={lvl === 5 ? 1.2 : 0.8} />
      ))}
      <line x1={cx} y1={cy - rMax} x2={cx} y2={cy + rMax} stroke="var(--line)" />
      <line x1={cx - rMax} y1={cy} x2={cx + rMax} y2={cy} stroke="var(--line)" />

      {/* meta */}
      <polygon points={poly(target)} fill="rgba(168,122,20,.07)" stroke="var(--gold)"
        strokeWidth="1.4" strokeDasharray="5 4" />
      {/* actual */}
      <polygon points={poly(actual)} fill="rgba(14,147,180,.16)" stroke="var(--cyan)"
        strokeWidth="2.2" strokeLinejoin="round" />
      {actual.map((v, i) => {
        const [x, y] = pt(i, v);
        return <circle key={i} cx={x} cy={y} r="4.5" fill="var(--cyan)" stroke="var(--surface)" strokeWidth="2" />;
      })}

      {/* etiquetas: arriba/abajo centradas; laterales ancladas al borde del lienzo */}
      {LINES.map((l, i) => {
        const vertical = i === 0 || i === 2;
        const y = i === 0 ? cy - rMax - 26 : i === 2 ? cy + rMax + 22 : cy - 12;
        const x = vertical ? cx : i === 1 ? size - 4 : 4;
        const anchor = vertical ? "middle" : i === 1 ? "end" : "start";
        return (
          <g key={l.n} fontSize="11.5" fontWeight={600} fill="var(--ink-soft)">
            <text x={x} y={y} textAnchor={anchor}>{l.code} {l.short}</text>
            <text x={x} y={y + 15} textAnchor={anchor} fontFamily="var(--font-mono)"
              fontSize="12" fontWeight={700} fill="var(--cyan-deep)">
              {actual[i].toFixed(1).replace(".", ",")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Mapa de calor línea × dimensión ───────────────────────────────────── */

const LEVEL_BG = ["", "var(--n1)", "var(--n2)", "var(--n3)", "var(--n4)", "var(--n5)"];

export function MaturityHeatmap({ onCell }: { onCell?: (line: number, dim: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate" style={{ borderSpacing: "6px 8px" }}>
        <thead>
          <tr>
            <th />
            {DIMENSIONS.map((d) => (
              <th key={d.key} className="mono-label pb-1 text-center font-medium px-1"
                style={{ maxWidth: 90, fontSize: 9 }}>
                {d.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LINES.map((l) => (
            <tr key={l.n}>
              <td className="pr-1 text-[12.5px] font-semibold text-ink whitespace-nowrap">
                {l.code} {l.short}
              </td>
              {DIMENSIONS.map((d) => {
                const s = SCORES[l.n][d.key];
                return (
                  <td key={d.key} className="text-center">
                    <button
                      onClick={() => onCell?.(l.n, d.key)}
                      className="w-full min-w-[52px] rounded-lg py-2.5 font-mono text-[15px] font-bold text-white transition-transform hover:scale-[1.04] focus:outline-2 focus:outline-cyan cursor-pointer"
                      style={{ background: LEVEL_BG[s.value] }}
                      title={`${l.code} · ${d.name}: nivel ${s.value} → meta ${s.target}`}
                    >
                      {s.value}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Sparkline ─────────────────────────────────────────────────────────── */

export function Sparkline({ values, good = true, w = 150, h = 36 }:
  { values: number[]; good?: boolean; w?: number; h?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const px = (i: number) => (i / (values.length - 1)) * (w - 8) + 4;
  const py = (v: number) => h - 5 - ((v - min) / span) * (h - 10);
  const d = values.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const color = good ? "var(--n4)" : "var(--bad)";
  const last = values[values.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" aria-hidden>
      <path d={`${d} L${px(values.length - 1)},${h - 2} L4,${h - 2} Z`}
        fill={color} opacity="0.08" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx={px(values.length - 1)} cy={py(last)} r="3" fill={color} />
    </svg>
  );
}

/* ─── Benchmark de pares ────────────────────────────────────────────────── */

export function PeerBars({ peers, nationalAvg }:
  { peers: { name: string; value: number; self?: boolean }[]; nationalAvg: number }) {
  const max = Math.max(...peers.map((p) => p.value), nationalAvg) * 1.15;
  return (
    <div className="space-y-2.5">
      {peers.map((p) => (
        <div key={p.name} className="flex items-center gap-3">
          <span className={`w-14 shrink-0 text-[12px] ${p.self ? "font-bold text-cyan-deep" : "text-muted"}`}>
            {p.name}
          </span>
          <div className="relative h-[18px] flex-1 rounded bg-surface-2 overflow-hidden">
            <div className="h-full rounded transition-all"
              style={{
                width: `${(p.value / max) * 100}%`,
                background: p.self ? "var(--cyan)" : "var(--line-strong)",
              }} />
            {/* media nacional */}
            <div className="absolute top-0 h-full border-l border-dashed"
              style={{ left: `${(nationalAvg / max) * 100}%`, borderColor: "var(--gold)" }} />
          </div>
          <span className={`w-10 shrink-0 text-right font-mono text-[11px] ${p.self ? "font-bold text-cyan-deep" : "text-muted"}`}>
            {p.value} %
          </span>
        </div>
      ))}
      <div className="mono-label pt-1" style={{ color: "var(--gold)" }}>
        ─ ─ media nacional {nationalAvg} %
      </div>
    </div>
  );
}

/* ─── Matriz impacto × factibilidad ─────────────────────────────────────── */

export function PriorityMatrix({ items, onSelect }: {
  items: { id: string; name: string; impact: number; feasibility: number; horizon: string }[];
  onSelect?: (id: string) => void;
}) {
  const W = 460, H = 300, pad = 34;
  const px = (f: number) => pad + ((f - 1) / 4) * (W - pad - 12);
  const py = (i: number) => H - pad - ((i - 1) / 4) * (H - pad - 16);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
      aria-label="Matriz de priorización: impacto contra factibilidad">
      <rect x={pad} y={16} width={(W - pad - 12) / 2} height={(H - pad - 16) / 2} fill="var(--surface-2)" opacity=".55" />
      <rect x={pad + (W - pad - 12) / 2} y={16} width={(W - pad - 12) / 2} height={(H - pad - 16) / 2} fill="var(--cyan-wash)" />
      <rect x={pad + (W - pad - 12) / 2} y={16 + (H - pad - 16) / 2} width={(W - pad - 12) / 2} height={(H - pad - 16) / 2} fill="var(--gold-wash)" opacity=".8" />
      <g fontFamily="var(--font-mono)" fontSize="8.5" letterSpacing="1" fill="var(--faint)">
        <text x={pad + 8} y={30}>APUESTAS MAYORES</text>
        <text x={pad + (W - pad - 12) / 2 + 8} y={30}>QUICK WINS</text>
        <text x={pad + 8} y={22 + (H - pad - 16) / 2}>DESCARTAR</text>
        <text x={pad + (W - pad - 12) / 2 + 8} y={22 + (H - pad - 16) / 2}>RELLENO</text>
      </g>
      <line x1={pad} y1={16 + (H - pad - 16) / 2} x2={W - 12} y2={16 + (H - pad - 16) / 2} stroke="var(--line-strong)" />
      <line x1={pad + (W - pad - 12) / 2} y1={16} x2={pad + (W - pad - 12) / 2} y2={H - pad} stroke="var(--line-strong)" />

      {items.map((it) => (
        <g key={it.id} onClick={() => onSelect?.(it.id)} style={{ cursor: onSelect ? "pointer" : "default" }}>
          <circle cx={px(it.feasibility)} cy={py(it.impact)}
            r={it.horizon === "CORTO" ? 11 : 8}
            fill={it.horizon === "CORTO" ? "var(--cyan)" : "var(--gold)"}
            opacity=".85" stroke="var(--surface)" strokeWidth="2">
            <title>{`${it.name} · impacto ${it.impact} · factibilidad ${it.feasibility}`}</title>
          </circle>
        </g>
      ))}

      <text x={(W + pad) / 2} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--faint)">Factibilidad →</text>
      <text x={12} y={(H - pad + 16) / 2} textAnchor="middle" fontSize="10.5" fill="var(--faint)"
        transform={`rotate(-90 12 ${(H - pad + 16) / 2})`}>Impacto →</text>
    </svg>
  );
}

/* ─── Gantt por trimestres ──────────────────────────────────────────────── */

const QUARTERS = ["2026-T3", "2026-T4", "2027-T1", "2027-T2", "2027-T3", "2027-T4", "2028-T1", "2028-T2", "2028-T3", "2028-T4"];

export function GanttChart({ items, onSelect }: {
  items: { id: string; name: string; start: string; end: string; horizon: string; progress: number }[];
  onSelect?: (id: string) => void;
}) {
  const q = (s: string) => Math.max(0, QUARTERS.indexOf(s));
  const rowH = 34, left = 210, colW = 44;
  const W = left + QUARTERS.length * colW, H = items.length * rowH + 28;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 640 }} className="w-full h-auto" role="img" aria-label="Cronograma de iniciativas">
        {QUARTERS.map((qt, i) => (
          <g key={qt}>
            <line x1={left + i * colW} y1={18} x2={left + i * colW} y2={H - 6} stroke="var(--line)" />
            <text x={left + i * colW + colW / 2} y={11} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--faint)">{qt.replace("20", "'")}</text>
          </g>
        ))}
        {items.map((it, r) => {
          const x0 = left + q(it.start) * colW;
          const x1 = left + (q(it.end) + 1) * colW;
          const y = 24 + r * rowH;
          const color = it.horizon === "CORTO" ? "var(--cyan)" : "var(--gold-fill)";
          return (
            <g key={it.id} onClick={() => onSelect?.(it.id)} style={{ cursor: onSelect ? "pointer" : "default" }}>
              <text x={0} y={y + 12} fontSize="11" fill="var(--ink-soft)">
                {it.name.length > 30 ? it.name.slice(0, 29) + "…" : it.name}
              </text>
              <rect x={x0} y={y} width={x1 - x0} height={15} rx={4} fill={color} opacity=".3" />
              <rect x={x0} y={y} width={(x1 - x0) * (it.progress / 100)} height={15} rx={4} fill={color}>
                <title>{`${it.name}: ${it.progress} %`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── Barra de presupuesto ──────────────────────────────────────────────── */

export function BudgetBar({ planned, committed, executed }:
  { planned: number; committed: number; executed: number }) {
  const pctE = planned ? (executed / planned) * 100 : 0;
  const pctC = planned ? (committed / planned) * 100 : 0;
  return (
    <div className="flex h-[11px] w-full overflow-hidden rounded-md bg-surface-2">
      <div style={{ width: `${Math.min(pctE, 100)}%`, background: "var(--n5)" }} />
      <div style={{ width: `${Math.min(pctC, 100 - pctE)}%`, background: "var(--cyan-fill)" }} />
    </div>
  );
}

/* ─── Mapas ─────────────────────────────────────────────────────────────── */

export function ColombiaMap() {
  return (
    <svg viewBox={`0 0 ${CO_VIEW.w} ${CO_VIEW.h}`} className="w-full h-auto" role="img"
      aria-label="Mapa de Colombia con el departamento del Cesar destacado">
      {CO_PATHS.map((p, i) => (
        <path key={i} d={p.d}
          fill={p.cesar ? "var(--cyan)" : "var(--surface-2)"}
          stroke={p.cesar ? "var(--cyan-deep)" : "var(--line-strong)"}
          strokeWidth={p.cesar ? 1.2 : 0.6} />
      ))}
      <line x1={CESAR_MARK.x + 8} y1={CESAR_MARK.y} x2={CO_VIEW.w - 92} y2={CESAR_MARK.y - 40}
        stroke="var(--cyan-deep)" strokeWidth="1" />
      <circle cx={CESAR_MARK.x} cy={CESAR_MARK.y} r="3" fill="var(--cyan-deep)" />
      <text x={CO_VIEW.w - 88} y={CESAR_MARK.y - 42} fontSize="12" fontWeight="700" fill="var(--cyan-deep)">Cesar</text>
      <text x={CO_VIEW.w - 88} y={CESAR_MARK.y - 28} fontSize="9.5" fill="var(--muted)">25 municipios</text>
    </svg>
  );
}

const COV_COLOR = { alta: "var(--cyan-deep)", media: "var(--cyan-fill)", baja: "var(--line-strong)" } as const;
const COV_R = { 3: 7.5, 2: 5, 1: 3.4 } as const;

export function CesarMap({ munis, highlight }: { munis: Muni[]; highlight?: string | null }) {
  return (
    <svg viewBox={`0 0 ${CESAR_VIEW.w} ${CESAR_VIEW.h}`} className="w-full h-auto" role="img"
      aria-label="Mapa del departamento del Cesar con sus 25 municipios">
      <path d={CESAR_PATH} fill="var(--surface-2)" stroke="var(--gold)" strokeWidth="1.3" />
      {munis.map((m) => {
        const [x, y] = projectCesar(m.lon, m.lat);
        const dim = highlight && m.subregion !== highlight;
        return (
          <g key={m.name} opacity={dim ? 0.25 : 1} style={{ transition: "opacity .2s" }}>
            {m.name === "Valledupar" && (
              <circle cx={x} cy={y} r="12.5" fill="none" stroke="var(--cyan-deep)"
                strokeWidth="1.1" strokeDasharray="3 2.5" opacity=".7" />
            )}
            <circle cx={x} cy={y} r={COV_R[m.weight]} fill={COV_COLOR[m.coverage]}
              stroke="var(--surface)" strokeWidth="1.3">
              <title>{`${m.name} · subregión ${m.subregion} · cobertura ${m.coverage}`}</title>
            </circle>
            {m.label && (
              <text x={x + m.label.dx} y={y + m.label.dy} textAnchor={m.label.anchor}
                fontSize="8.8" fontWeight={m.weight === 3 ? 700 : 400}
                fill={m.weight === 3 ? "var(--cyan-deep)" : "var(--ink-soft)"}>
                {m.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Cuadrante de pertinencia ──────────────────────────────────────────── */

export function PertinenceQuadrant({ points }:
  { points: { name: string; x: number; y: number; self?: boolean }[] }) {
  const W = 420, H = 250, pad = 30;
  const px = (x: number) => pad + x * (W - pad - 14);
  const py = (y: number) => H - pad - y * (H - pad - 18);
  const mx = pad + (W - pad - 14) / 2, my = 18 + (H - pad - 18) / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
      aria-label="Cuadrantes de pertinencia territorial: oferta contra demanda">
      <rect x={pad} y={18} width={mx - pad} height={my - 18} fill="#fbeaea" opacity=".7" />
      <rect x={mx} y={18} width={W - 14 - mx} height={my - 18} fill="#eaf4ee" opacity=".8" />
      <rect x={pad} y={my} width={mx - pad} height={H - pad - my} fill="var(--surface-2)" opacity=".6" />
      <rect x={mx} y={my} width={W - 14 - mx} height={H - pad - my} fill="var(--gold-wash)" opacity=".7" />
      <g fontSize="9.5" fill="var(--muted)">
        <text x={pad + 7} y={32}>Brecha: alta demanda, baja oferta</text>
        <text x={mx + 7} y={32}>Dinámico</text>
        <text x={pad + 7} y={my + 14}>Incipiente</text>
        <text x={mx + 7} y={my + 14}>Posible saturación</text>
      </g>
      <line x1={pad} y1={my} x2={W - 14} y2={my} stroke="var(--line-strong)" />
      <line x1={mx} y1={18} x2={mx} y2={H - pad} stroke="var(--line-strong)" />
      {points.map((p) => (
        <g key={p.name}>
          <circle cx={px(p.x)} cy={py(p.y)} r={p.self ? 9 : 5}
            fill={p.self ? "var(--cyan)" : "var(--faint)"}
            stroke={p.self ? "var(--surface)" : "none"} strokeWidth="2">
            <title>{p.name}</title>
          </circle>
          {p.self && (
            <text x={px(p.x) + 14} y={py(p.y) + 4} fontSize="11.5" fontWeight="700" fill="var(--cyan-deep)">
              {p.name}
            </text>
          )}
        </g>
      ))}
      <text x={(W + pad) / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--faint)">Oferta vigente →</text>
      <text x={10} y={(H - pad + 18) / 2} textAnchor="middle" fontSize="10" fill="var(--faint)"
        transform={`rotate(-90 10 ${(H - pad + 18) / 2})`}>Índice de demanda →</text>
    </svg>
  );
}
