"use client";

// Primitivas de interfaz de la PGTD.

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export function PageHeader({ kicker, title, desc, actions }:
  { kicker: string; title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="rise mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="kicker mb-1.5">{kicker}</div>
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">{title}</h1>
        {desc && <p className="mt-1.5 max-w-2xl text-[13.5px] text-muted">{desc}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "", hover = false }:
  { children: ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`card ${hover ? "card-hover" : ""} ${className}`}>{children}</div>
  );
}

export function CardHeader({ title, sub, right }:
  { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
      <div>
        <div className="text-[14px] font-bold text-ink">{title}</div>
        {sub && <div className="mt-0.5 text-[12px] text-muted">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function StatCard({ label, value, unit, delta, good, foot }: {
  label: string; value: string; unit?: string;
  delta?: number; good?: boolean; foot?: string;
}) {
  const DeltaIcon = delta === undefined ? Minus : delta >= 0 ? ArrowUpRight : ArrowDownRight;
  const deltaColor = delta === undefined ? "var(--faint)" : good ? "var(--ok)" : "var(--bad)";
  return (
    <div className="card px-5 py-4">
      <div className="text-[12px] leading-snug text-muted">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="font-mono text-[26px] font-bold tracking-tight text-ink">{value}</span>
        {unit && <span className="text-[12px] text-faint">{unit}</span>}
        {delta !== undefined && (
          <span className="ml-auto inline-flex items-center gap-0.5 font-mono text-[12px] font-semibold"
            style={{ color: deltaColor }}>
            <DeltaIcon size={13} strokeWidth={2.5} />
            {Math.abs(delta).toLocaleString("es-CO", { maximumFractionDigits: 1 })}
          </span>
        )}
      </div>
      {foot && <div className="mono-label mt-2">{foot}</div>}
    </div>
  );
}

export function LevelBadge({ level }: { level: number }) {
  const names = ["", "Inicial", "En desarrollo", "Definido", "Gestionado", "Optimizado"];
  const colors = ["", "var(--n1)", "var(--n2)", "var(--n3)", "var(--n4)", "var(--n5)"];
  const idx = Math.max(1, Math.min(5, Math.round(level)));
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-[11px] font-semibold text-white"
      style={{ background: colors[idx] }}>
      <span className="grid h-4 w-4 place-items-center rounded-full bg-white/25 font-mono text-[10px]">{idx}</span>
      {names[idx]}
    </span>
  );
}

export function StateDot({ state }: { state: "VERDE" | "AMBAR" | "ROJO" }) {
  const c = state === "VERDE" ? "var(--ok)" : state === "AMBAR" ? "var(--warn)" : "var(--bad)";
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: c }} aria-label={state} />;
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PLANEADA: { label: "Planeada", cls: "chip" },
    EN_CURSO: { label: "En curso", cls: "chip chip-cyan" },
    EN_RIESGO: { label: "En riesgo", cls: "chip chip-bad" },
    COMPLETADA: { label: "Completada", cls: "chip chip-ok" },
    SUSPENDIDA: { label: "Suspendida", cls: "chip" },
  };
  const m = map[status] ?? map.PLANEADA;
  return <span className={m.cls}>{m.label}</span>;
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-line-strong bg-surface px-4 py-3 text-[12.5px] italic text-faint">
      {children}
    </p>
  );
}

export function DemoBanner() {
  return (
    <div className="mb-5 flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[12.5px]"
      style={{ borderColor: "color-mix(in srgb, var(--gold) 35%, white)", background: "var(--gold-wash)", color: "var(--gold)" }}>
      <span className="chip chip-gold shrink-0">Demo</span>
      Datos ilustrativos. La primera medición real de la UPC se produce en la Fase 0 de la consultoría.
    </div>
  );
}

export function ModuleCard({ href, code, title, desc, tags }: {
  href: string; code: string; title: string; desc: string; tags?: string[];
}) {
  return (
    <Link href={href} className="card card-hover group relative block overflow-hidden p-5">
      <div className="absolute right-4 top-3 font-mono text-[34px] font-extrabold"
        style={{ color: "var(--surface-2)" }}>{code}</div>
      <div className="relative">
        <h3 className="pr-10 text-[15.5px] font-bold tracking-tight text-ink">{title}</h3>
        <p className="mt-1 min-h-[3.6em] text-[12.5px] leading-relaxed text-muted">{desc}</p>
        {tags && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tags.map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
        )}
        <div className="mt-3.5 inline-flex items-center gap-1 text-[13px] font-bold text-cyan-deep">
          Abrir
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
