"use client";

// Gráficos SVG propios v2 — trazo degradado de marca, animación de dibujo,
// glow sutil. Sin dependencias externas.

import { useId } from "react";
import { LINES, DIMENSIONS, SCORES, lineScore, lineTarget, type Muni } from "@/data/demo";
import { CO_PATHS, CO_VIEW, CESAR_MARK, CESAR_PATH, CESAR_VIEW, projectCesar } from "@/data/geo";

/* ─── Gauge institucional (semicírculo) ─────────────────────────────────── */

export function ScoreGauge({ value, max = 5, size = 210 }:
  { value: number; max?: number; size?: number }) {
  const gid = useId();
  const W = size, H = size * 0.62;
  const cx = W / 2, cy = H - 8, r = W / 2 - 16;
  const arc = (from: number, to: number) => {
    const a0 = Math.PI * (1 - from), a1 = Math.PI * (1 - to);
    const x0 = cx + r * Math.cos(a0), y0 = cy - r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  const frac = Math.max(0, Math.min(1, value / max));
  const len = Math.PI * r;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
      aria-label={`Madurez institucional: ${value.toFixed(1)} de ${max}`}>
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cyan-fill)" />
          <stop offset="55%" stopColor="var(--cyan)" />
          <stop offset="100%" stopColor="var(--navy)" />
        </linearGradient>
      </defs>
      <path d={arc(0, 1)} fill="none" stroke="var(--surface-3)" strokeWidth="13" strokeLinecap="round" />
      <path d={arc(0, frac)} fill="none" stroke={`url(#${gid}-g)`} strokeWidth="13"
        strokeLinecap="round" className="draw" style={{ ["--dash" as string]: len }} />
      {/* marcas 1..5 */}
      {[1, 2, 3, 4, 5].map((n) => {
        const a = Math.PI * (1 - n / max);
        const x = cx + (r + 11) * Math.cos(a), y = cy - (r + 11) * Math.sin(a);
        return (
          <text key={n} x={x} y={y + 3} textAnchor="middle"
            className="num" fontSize="9" fill="var(--faint)">{n}</text>
        );
      })}
      <text x={cx} y={cy - 16} textAnchor="middle" className="num"
        fontSize={W * 0.2} fontWeight={800} fill="var(--ink)" letterSpacing="-2">
        {value.toFixed(1).replace(".", ",")}
      </text>
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="10" fontWeight={600}
        fill="var(--faint)" letterSpacing="1.5" style={{ textTransform: "uppercase" }}>
        DE {max} · 16 PUNTOS
      </text>
    </svg>
  );
}

/* ─── Radar de madurez (4 ejes) ─────────────────────────────────────────── */

export function MaturityRadar({ size = 380 }: { size?: number }) {
  const gid = useId();
  const cx = size / 2, cy = size / 2 + 8;
  const rMax = size * 0.31;
  const pt = (axis: number, v: number): [number, number] => {
    const r = (v / 5) * rMax;
    const ang = (Math.PI / 2) * axis - Math.PI / 2;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  };
  const poly = (vals: number[]) =>
    vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");

  const actual = LINES.map((l) => lineScore(l.n));
  const target = LINES.map((l) => lineTarget(l.n));
  const perimeter = 4 * Math.SQRT2 * rMax; // aproximación suficiente para el dash

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" role="img"
      aria-label="Radar de madurez institucional en cuatro líneas">
      <defs>
        <linearGradient id={`${gid}-stroke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cyan-fill)" />
          <stop offset="60%" stopColor="var(--cyan)" />
          <stop offset="100%" stopColor="var(--navy)" />
        </linearGradient>
        <radialGradient id={`${gid}-fill`} cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.05" />
        </radialGradient>
        <filter id={`${gid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {[1, 2, 3, 4, 5].map((lvl) => (
        <polygon key={lvl} points={poly([lvl, lvl, lvl, lvl])} fill="none"
          stroke={lvl === 5 ? "var(--line-strong)" : "var(--line)"} strokeWidth={0.9} />
      ))}
      <line x1={cx} y1={cy - rMax} x2={cx} y2={cy + rMax} stroke="var(--line)" />
      <line x1={cx - rMax} y1={cy} x2={cx + rMax} y2={cy} stroke="var(--line)" />
      {/* números de anillo sobre el eje superior */}
      {[1, 2, 3, 4, 5].map((lvl) => (
        <text key={lvl} x={cx + 5} y={cy - (lvl / 5) * rMax + 3}
          className="num" fontSize="7.5" fill="var(--faint)">{lvl}</text>
      ))}

      <polygon points={poly(target)} fill="rgba(168,122,20,.05)" stroke="var(--gold)"
        strokeWidth="1.4" strokeDasharray="5 4" />

      <polygon points={poly(actual)} fill={`url(#${gid}-fill)`} />
      <polygon points={poly(actual)} fill="none" stroke={`url(#${gid}-stroke)`}
        strokeWidth="2.4" strokeLinejoin="round" filter={`url(#${gid}-glow)`}
        className="draw" style={{ ["--dash" as string]: perimeter }} />
      {actual.map((v, i) => {
        const [x, y] = pt(i, v);
        return (
          <circle key={i} cx={x} cy={y} r="4.5" fill="var(--cyan)"
            stroke="var(--surface)" strokeWidth="2.5" className="pop" />
        );
      })}

      {LINES.map((l, i) => {
        const vertical = i === 0 || i === 2;
        const y = i === 0 ? cy - rMax - 28 : i === 2 ? cy + rMax + 24 : cy - 13;
        const x = vertical ? cx : i === 1 ? size - 4 : 4;
        const anchor = vertical ? "middle" : i === 1 ? "end" : "start";
        return (
          <g key={l.n} fontSize="11.5" fontWeight={600} fill="var(--ink-soft)">
            <text x={x} y={y} textAnchor={anchor}>{l.code} {l.short}</text>
            <text x={x} y={y + 16} textAnchor={anchor} className="num"
              fontSize="12.5" fontWeight={800} fill="var(--cyan-deep)">
              {actual[i].toFixed(1).replace(".", ",")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Mapa de calor línea × dimensión (grid) ────────────────────────────── */

const LEVEL_BG = ["", "var(--n1)", "var(--n2)", "var(--n3)", "var(--n4)", "var(--n5)"];

export function MaturityHeatmap({ onCell, selected }: {
  onCell?: (line: number, dim: string) => void;
  selected?: { line: number; dim: string } | null;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[520px] items-center gap-x-2 gap-y-2.5"
        style={{ gridTemplateColumns: "minmax(120px, auto) repeat(4, 1fr)" }}>
        <div />
        {DIMENSIONS.map((d) => (
          <div key={d.key} className="label text-center leading-tight" style={{ fontSize: 8.8 }}>
            {d.name}
          </div>
        ))}
        {LINES.map((l) => (
          <FragmentRow key={l.n} line={l.n} code={l.code} short={l.short}
            onCell={onCell} selected={selected} />
        ))}
      </div>
    </div>
  );
}

function FragmentRow({ line, code, short, onCell, selected }: {
  line: number; code: string; short: string;
  onCell?: (line: number, dim: string) => void;
  selected?: { line: number; dim: string } | null;
}) {
  return (
    <>
      <div className="pr-2 text-[12.5px] font-bold text-ink whitespace-nowrap">
        {code} <span className="font-semibold text-ink-soft">{short}</span>
      </div>
      {DIMENSIONS.map((d) => {
        const s = SCORES[line][d.key];
        const isSel = selected?.line === line && selected?.dim === d.key;
        return (
          <button key={d.key} onClick={() => onCell?.(line, d.key)}
            className={`num relative w-full cursor-pointer rounded-xl py-2.5 text-[15px] font-extrabold text-white transition-all duration-150 hover:scale-[1.05] hover:shadow-lg ${
              isSel ? "scale-[1.05] shadow-lg ring-2 ring-navy ring-offset-2" : ""}`}
            style={{
              background: `linear-gradient(160deg, color-mix(in srgb, ${LEVEL_BG[s.value]} 88%, white) 0%, ${LEVEL_BG[s.value]} 100%)`,
              boxShadow: isSel ? undefined : `inset 0 1px 0 rgb(255 255 255 / 0.22), 0 1px 3px color-mix(in srgb, ${LEVEL_BG[s.value]} 35%, transparent)`,
            }}
            title={`${code} · ${d.name}: nivel ${s.value} → meta ${s.target}`}>
            {s.value}
            <span className="absolute bottom-[3px] right-[7px] text-[8px] font-semibold opacity-70">
              →{s.target}
            </span>
          </button>
        );
      })}
    </>
  );
}

/* ─── Sparkline ─────────────────────────────────────────────────────────── */

export function Sparkline({ values, good = true, w = 150, h = 38 }:
  { values: number[]; good?: boolean; w?: number; h?: number }) {
  const gid = useId();
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const px = (i: number) => (i / (values.length - 1)) * (w - 8) + 4;
  const py = (v: number) => h - 6 - ((v - min) / span) * (h - 12);
  const d = values.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const color = good ? "var(--n4)" : "var(--bad)";
  const last = values[values.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${px(values.length - 1)},${h - 2} L4,${h - 2} Z`} fill={`url(#${gid}-a)`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={px(values.length - 1)} cy={py(last)} r="3.4" fill={color}
        stroke="var(--surface)" strokeWidth="1.6" />
    </svg>
  );
}

/* ─── Benchmark de pares ────────────────────────────────────────────────── */

export function PeerBars({ peers, nationalAvg }:
  { peers: { name: string; value: number; self?: boolean }[]; nationalAvg: number }) {
  const max = Math.max(...peers.map((p) => p.value), nationalAvg) * 1.15;
  return (
    <div className="space-y-3">
      {peers.map((p) => (
        <div key={p.name} className="flex items-center gap-3">
          <span className={`w-14 shrink-0 text-[12px] ${p.self ? "font-extrabold text-cyan-deep" : "font-medium text-muted"}`}>
            {p.name}
          </span>
          <div className="relative h-[20px] flex-1 overflow-hidden rounded-lg bg-surface-2">
            <div className="h-full rounded-lg transition-all duration-700"
              style={{
                width: `${(p.value / max) * 100}%`,
                background: p.self ? "var(--grad-brand)" : "var(--line-strong)",
              }} />
            <div className="absolute top-0 h-full border-l-[1.5px] border-dashed"
              style={{ left: `${(nationalAvg / max) * 100}%`, borderColor: "var(--gold)" }} />
          </div>
          <span className={`num w-11 shrink-0 text-right text-[12px] ${p.self ? "font-extrabold text-cyan-deep" : "font-semibold text-muted"}`}>
            {p.value} %
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1 text-[11px] font-medium" style={{ color: "var(--gold)" }}>
        <span className="inline-block h-0 w-5 border-t-[1.5px] border-dashed" style={{ borderColor: "var(--gold)" }} />
        media nacional {nationalAvg} %
      </div>
    </div>
  );
}

/* ─── Matriz impacto × factibilidad ─────────────────────────────────────── */

export function PriorityMatrix({ items, onSelect, selected }: {
  items: { id: string; name: string; impact: number; feasibility: number; horizon: string }[];
  onSelect?: (id: string) => void;
  selected?: string | null;
}) {
  const W = 460, H = 300, pad = 34;
  const px = (f: number) => pad + ((f - 1) / 4) * (W - pad - 12);
  const py = (i: number) => H - pad - ((i - 1) / 4) * (H - pad - 16);
  const mx = pad + (W - pad - 12) / 2, my = 16 + (H - pad - 16) / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
      aria-label="Matriz de priorización: impacto contra factibilidad">
      <rect x={mx} y={16} width={W - 12 - mx} height={my - 16} rx={10} fill="var(--cyan-wash)" opacity=".8" />
      <rect x={pad} y={16} width={mx - pad} height={my - 16} rx={10} fill="var(--surface-2)" opacity=".6" />
      <rect x={mx} y={my} width={W - 12 - mx} height={H - pad - my} rx={10} fill="var(--gold-wash)" opacity=".7" />
      <rect x={pad} y={my} width={mx - pad} height={H - pad - my} rx={10} fill="var(--surface-2)" opacity=".35" />
      <g fontSize="8.5" fontWeight={650} letterSpacing="1.2" fill="var(--faint)">
        <text x={pad + 10} y={32}>APUESTAS MAYORES</text>
        <text x={mx + 10} y={32}>QUICK WINS</text>
        <text x={pad + 10} y={my + 16}>DESCARTAR</text>
        <text x={mx + 10} y={my + 16}>RELLENO</text>
      </g>

      {items.map((it) => {
        const isSel = selected === it.id;
        return (
          <g key={it.id} onClick={() => onSelect?.(it.id)}
            style={{ cursor: onSelect ? "pointer" : "default" }}>
            {isSel && (
              <circle cx={px(it.feasibility)} cy={py(it.impact)}
                r={it.horizon === "CORTO" ? 17 : 14} fill="none"
                stroke="var(--navy)" strokeWidth="1.5" opacity=".5" />
            )}
            <circle cx={px(it.feasibility)} cy={py(it.impact)}
              r={it.horizon === "CORTO" ? 11 : 8}
              fill={it.horizon === "CORTO" ? "var(--cyan)" : "var(--gold-fill)"}
              opacity=".92" stroke="var(--surface)" strokeWidth="2"
              className="transition-transform hover:scale-110"
              style={{ transformOrigin: "center", transformBox: "fill-box" }}>
              <title>{`${it.name} · impacto ${it.impact} · factibilidad ${it.feasibility}`}</title>
            </circle>
          </g>
        );
      })}

      <text x={(W + pad) / 2} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--faint)">Factibilidad →</text>
      <text x={12} y={(H - pad + 16) / 2} textAnchor="middle" fontSize="10.5" fill="var(--faint)"
        transform={`rotate(-90 12 ${(H - pad + 16) / 2})`}>Impacto →</text>
    </svg>
  );
}

/* ─── Gantt por trimestres ──────────────────────────────────────────────── */

const QUARTERS = ["2026-T3", "2026-T4", "2027-T1", "2027-T2", "2027-T3", "2027-T4", "2028-T1", "2028-T2", "2028-T3", "2028-T4"];

export function GanttChart({ items, onSelect, selected }: {
  items: { id: string; name: string; start: string; end: string; horizon: string; progress: number }[];
  onSelect?: (id: string) => void;
  selected?: string | null;
}) {
  const q = (s: string) => Math.max(0, QUARTERS.indexOf(s));
  const rowH = 36, left = 210, colW = 44;
  const W = left + QUARTERS.length * colW, H = items.length * rowH + 30;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 640 }} className="w-full h-auto"
        role="img" aria-label="Cronograma de iniciativas">
        {QUARTERS.map((qt, i) => (
          <g key={qt}>
            <line x1={left + i * colW} y1={20} x2={left + i * colW} y2={H - 8}
              stroke={i % 2 === 0 ? "var(--line)" : "var(--surface-3)"} strokeDasharray={i % 2 ? "2 4" : undefined} />
            <text x={left + i * colW + colW / 2} y={12} textAnchor="middle"
              className="num" fontSize="8.5" fontWeight={600} fill="var(--faint)">
              {qt.replace("20", "'")}
            </text>
          </g>
        ))}
        {items.map((it, r) => {
          const x0 = left + q(it.start) * colW;
          const x1 = left + (q(it.end) + 1) * colW;
          const y = 26 + r * rowH;
          const color = it.horizon === "CORTO" ? "var(--cyan)" : "var(--gold-fill)";
          const isSel = selected === it.id;
          return (
            <g key={it.id} onClick={() => onSelect?.(it.id)}
              style={{ cursor: onSelect ? "pointer" : "default" }} opacity={selected && !isSel ? 0.45 : 1}>
              <text x={0} y={y + 12} fontSize="11" fontWeight={isSel ? 700 : 500}
                fill={isSel ? "var(--ink)" : "var(--ink-soft)"}>
                {it.name.length > 30 ? it.name.slice(0, 29) + "…" : it.name}
              </text>
              <rect x={x0} y={y} width={x1 - x0} height={16} rx={8} fill={color} opacity=".25" />
              <rect x={x0} y={y} width={Math.max(16, (x1 - x0) * (it.progress / 100))} height={16} rx={8} fill={color}>
                <title>{`${it.name}: ${it.progress} %`}</title>
              </rect>
              {it.progress > 0 && (
                <text x={x0 + 8} y={y + 12} fontSize="8.5" fontWeight={700} fill="#fff" className="num">
                  {it.progress}%
                </text>
              )}
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
    <div className="flex h-[12px] w-full overflow-hidden rounded-full bg-surface-2 shadow-[inset_0_1px_2px_rgb(15_21_32/0.06)]">
      <div className="rounded-l-full" style={{ width: `${Math.min(pctE, 100)}%`, background: "linear-gradient(90deg, var(--n5), var(--n4))" }} />
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
          fill={p.cesar ? "var(--cyan)" : "var(--surface-3)"}
          stroke={p.cesar ? "var(--cyan-deep)" : "var(--line-strong)"}
          strokeWidth={p.cesar ? 1.2 : 0.5} />
      ))}
      <line x1={CESAR_MARK.x + 8} y1={CESAR_MARK.y} x2={CO_VIEW.w - 92} y2={CESAR_MARK.y - 40}
        stroke="var(--cyan-deep)" strokeWidth="1" />
      <circle cx={CESAR_MARK.x} cy={CESAR_MARK.y} r="3" fill="var(--cyan-deep)" />
      <text x={CO_VIEW.w - 88} y={CESAR_MARK.y - 42} fontSize="12.5" fontWeight="800" fill="var(--cyan-deep)">Cesar</text>
      <text x={CO_VIEW.w - 88} y={CESAR_MARK.y - 28} fontSize="9.5" fill="var(--muted)">25 municipios</text>
    </svg>
  );
}

const COV_COLOR = { alta: "var(--cyan-deep)", media: "var(--cyan-fill)", baja: "var(--line-strong)" } as const;
const COV_R = { 3: 7.5, 2: 5, 1: 3.4 } as const;

/** Mapa del Cesar con tres lentes: cobertura (peso/cobertura del municipio) o
    un mapa de valores (producción, convenios) con radio ∝ √valor. */
export function CesarMap({ munis, highlight, values, lensColor, lensDeep, unit }: {
  munis: Muni[]; highlight?: string | null;
  values?: Record<string, number>;
  lensColor?: string; lensDeep?: string; unit?: string;
}) {
  const gid = useId();
  const maxV = values ? Math.max(1, ...Object.values(values)) : 1;
  const rOf = (v: number) => (v <= 0 ? 2.2 : 3 + Math.sqrt(v / maxV) * 10.5);
  return (
    <svg viewBox={`0 0 ${CESAR_VIEW.w} ${CESAR_VIEW.h}`} className="w-full h-auto" role="img"
      aria-label="Mapa del departamento del Cesar con sus 25 municipios">
      <defs>
        <filter id={`${gid}-sh`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="var(--navy)" floodOpacity="0.13" />
        </filter>
      </defs>
      <path d={CESAR_PATH} fill="var(--surface-2)" stroke="var(--gold)" strokeWidth="1.3"
        filter={`url(#${gid}-sh)`} />
      {munis.map((m) => {
        const [x, y] = projectCesar(m.lon, m.lat);
        const dim = highlight && m.subregion !== highlight;
        const v = values?.[m.name] ?? 0;
        const r = values ? rOf(v) : COV_R[m.weight];
        const fill = values
          ? (v <= 0 ? "var(--line-strong)" : v >= maxV * 0.4 ? (lensDeep ?? "var(--cyan-deep)") : (lensColor ?? "var(--cyan-fill)"))
          : COV_COLOR[m.coverage];
        return (
          <g key={m.name} opacity={dim ? 0.18 : 1} style={{ transition: "opacity .25s" }}>
            {m.name === "Valledupar" && !values && (
              <circle cx={x} cy={y} r="13" fill="none" stroke="var(--cyan-deep)"
                strokeWidth="1.4" className="pulse-ring" />
            )}
            <circle cx={x} cy={y} r={r} fill={fill} fillOpacity={values ? 0.88 : 1}
              stroke="var(--surface)" strokeWidth="1.4">
              <title>{values
                ? `${m.name}: ${v} ${unit ?? ""}`.trim()
                : `${m.name} · subregión ${m.subregion} · cobertura ${m.coverage}`}</title>
            </circle>
            {values && v > 0 && r >= 7 && (
              <text x={x} y={y + 2.6} textAnchor="middle" fontSize="7.5" fontWeight={800} fill="#fff">
                {v}
              </text>
            )}
            {m.label && (
              <text x={x + m.label.dx} y={y + m.label.dy} textAnchor={m.label.anchor}
                fontSize="8.8" fontWeight={m.weight === 3 ? 800 : 500}
                fill={m.weight === 3 ? (lensDeep ?? "var(--cyan-deep)") : "var(--ink-soft)"}>
                {m.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Colombia con intensidad por departamento (coautorías / convenios). */
export function ColombiaImpactMap({ values, selected, onSelect }: {
  values: Record<string, number>;
  selected?: string | null;
  onSelect?: (dept: string | null) => void;
}) {
  const maxV = Math.max(1, ...Object.values(values));
  const fillOf = (name: string, cesar: boolean) => {
    if (cesar) return "var(--navy)";
    const v = values[name] ?? 0;
    if (v <= 0) return "var(--surface-3)";
    const t = Math.sqrt(v / maxV);
    return `color-mix(in srgb, var(--cyan-deep) ${Math.round(18 + t * 78)}%, white)`;
  };
  return (
    <svg viewBox={`0 0 ${CO_VIEW.w} ${CO_VIEW.h}`} className="w-full h-auto" role="img"
      aria-label="Mapa de Colombia con la intensidad de colaboración por departamento">
      {CO_PATHS.map((p) => {
        const v = values[p.name] ?? 0;
        const isSel = selected === p.name;
        return (
          <path key={p.name} d={p.d}
            fill={fillOf(p.name, p.cesar)}
            stroke={isSel ? "var(--gold)" : p.cesar ? "var(--navy-deep)" : "var(--line-strong)"}
            strokeWidth={isSel ? 1.8 : p.cesar ? 1.1 : 0.5}
            style={{ cursor: v > 0 && onSelect ? "pointer" : "default", transition: "fill .2s" }}
            onClick={() => v > 0 && onSelect?.(isSel ? null : p.name)}>
            <title>{p.cesar ? "Cesar (UPC)" : `${p.name}: ${v} coautorías`}</title>
          </path>
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
      <rect x={pad} y={18} width={mx - pad} height={my - 18} rx={10} fill="#fbeaea" opacity=".75" />
      <rect x={mx} y={18} width={W - 14 - mx} height={my - 18} rx={10} fill="#eaf4ee" opacity=".85" />
      <rect x={pad} y={my} width={mx - pad} height={H - pad - my} rx={10} fill="var(--surface-2)" opacity=".55" />
      <rect x={mx} y={my} width={W - 14 - mx} height={H - pad - my} rx={10} fill="var(--gold-wash)" opacity=".75" />
      <g fontSize="9.5" fontWeight={550} fill="var(--muted)">
        <text x={pad + 9} y={33}>Brecha: alta demanda, baja oferta</text>
        <text x={mx + 9} y={33}>Dinámico</text>
        <text x={pad + 9} y={my + 15}>Incipiente</text>
        <text x={mx + 9} y={my + 15}>Posible saturación</text>
      </g>
      {points.map((p) => (
        <g key={p.name}>
          {p.self && (
            <circle cx={px(p.x)} cy={py(p.y)} r={13} fill="none"
              stroke="var(--cyan)" strokeWidth="1.4" className="pulse-ring" />
          )}
          <circle cx={px(p.x)} cy={py(p.y)} r={p.self ? 9 : 5}
            fill={p.self ? "var(--cyan)" : "var(--faint)"}
            stroke={p.self ? "var(--surface)" : "none"} strokeWidth="2">
            <title>{p.name}</title>
          </circle>
          {p.self && (
            <text x={px(p.x) + 15} y={py(p.y) + 4} fontSize="11.5" fontWeight="800" fill="var(--cyan-deep)">
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
