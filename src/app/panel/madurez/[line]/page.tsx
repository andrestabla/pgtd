"use client";

// Detalle de una línea: dimensiones, evidencias e iniciativas asociadas.

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, LevelBadge, StatusChip } from "@/components/ui";
import { LINES, DIMENSIONS, SCORES, EVIDENCES, INITIATIVES, KPIS } from "@/data/demo";
import { ArrowLeft, FileText } from "lucide-react";

export default function LineDetail({ params }: PageProps<"/panel/madurez/[line]">) {
  const { line } = use(params);
  const n = Number(line);
  const meta = LINES.find((l) => l.n === n);
  if (!meta) notFound();

  const scores = SCORES[n];
  const evidences = EVIDENCES.filter((e) => e.line === n);
  const inis = INITIATIVES.filter((i) => i.line === n);
  const kpis = KPIS.filter((k) => k.line === n);

  return (
    <>
      <Link href="/panel/madurez"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted transition-colors hover:text-cyan-deep">
        <ArrowLeft size={14} /> Volver a madurez
      </Link>
      <PageHeader kicker={`Línea ${meta.code}`} title={meta.name}
        desc="Detalle de la línea: nivel por dimensión, evidencia que soporta la calificación e iniciativas que deberían moverla." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rise rise-1">
          <CardHeader title="Nivel por dimensión" />
          <div className="space-y-4 px-5 py-5">
            {DIMENSIONS.map((d) => {
              const s = scores[d.key];
              return (
                <div key={d.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ink">{d.name}</span>
                    <LevelBadge level={s.value} />
                  </div>
                  <div className="relative h-[8px] overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full"
                      style={{ width: `${(s.value / 5) * 100}%`, background: meta.color }} />
                    <div className="absolute top-0 h-full border-l-2 border-dashed"
                      style={{ left: `${(s.target / 5) * 100}%`, borderColor: "var(--gold)" }} />
                  </div>
                  <div className="mt-1 text-right font-mono text-[10px] text-faint">
                    meta {s.target}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="rise rise-2">
            <CardHeader title="Evidencia cargada" />
            <div className="divide-y divide-line">
              {evidences.length === 0 && (
                <p className="px-5 py-4 text-[12.5px] italic text-faint">Sin evidencia en el modo demo.</p>
              )}
              {evidences.map((e) => (
                <div key={e.title} className="flex items-start gap-3 px-5 py-3">
                  <FileText size={15} className="mt-0.5 shrink-0 text-cyan-deep" />
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{e.title}</div>
                    <div className="text-[11.5px] text-muted">
                      {DIMENSIONS.find((d) => d.key === e.dimension)?.name} · {e.source}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rise rise-3">
            <CardHeader title="Iniciativas e indicadores de la línea" />
            <div className="divide-y divide-line">
              {inis.map((i) => (
                <Link key={i.id} href="/panel/iniciativas"
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface-2">
                  <span className="text-[13px] font-semibold text-ink">{i.name}</span>
                  <StatusChip status={i.status} />
                </Link>
              ))}
              {kpis.map((k) => (
                <Link key={k.code} href="/panel/kpi"
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface-2">
                  <span className="text-[13px] text-ink-soft">{k.name}</span>
                  <span className="chip chip-gold">{k.code}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
