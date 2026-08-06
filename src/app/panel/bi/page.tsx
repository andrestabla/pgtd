"use client";

// M7 · Inteligencia de negocio: puerta a los observatorios de Algoritmo T.

import { PageHeader, Card } from "@/components/ui";
import { ExternalLink, Database, Briefcase, Map as MapIcon, FileOutput } from "lucide-react";

const OBSERVATORIES = [
  {
    icon: Database, title: "Oferta educativa",
    desc: "Programas de educación superior (SNIES) por institución, área, nivel, modalidad y territorio, con mapas.",
    tags: ["27.005 programas", "357 IES"],
  },
  {
    icon: Briefcase, title: "Laboral y empleabilidad",
    desc: "Competencias demandadas, reskilling, empleabilidad y vinculación formal de graduados.",
    tags: ["OLE", "DANE", "OIT"],
  },
  {
    icon: MapIcon, title: "Análisis regional",
    desc: "Pertinencia territorial, vacíos de oferta, demanda potencial por cohortes y recomendación de programas.",
    tags: ["33 departamentos", "Cohortes"],
  },
  {
    icon: FileOutput, title: "Espacio de trabajo",
    desc: "Informes propios combinando oferta, demanda y recomendaciones, exportables en PDF y CSV.",
    tags: ["Autonomía"],
  },
];

export default function BiPage() {
  return (
    <>
      <PageHeader kicker="M7 · Inteligencia" title="Observatorios de Algoritmo T"
        desc="El componente comparativo de la plataforma se apoya en los observatorios ya en operación: llegan con datos desde el primer día, sin que la Universidad tenga que aportarlos." />

      <div className="grid gap-4 sm:grid-cols-2">
        {OBSERVATORIES.map((o, i) => (
          <Card key={o.title} hover className={`rise rise-${i + 1} p-6`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, var(--cyan) 0%, var(--navy) 100%)" }}>
              <o.icon size={20} className="text-white" />
            </div>
            <h3 className="mt-3.5 text-[16px] font-bold tracking-tight text-ink">{o.title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{o.desc}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {o.tags.map((t) => <span key={t} className="chip">{t}</span>)}
            </div>
            <div className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-bold text-cyan-deep">
              Abrir observatorio <ExternalLink size={13} />
            </div>
          </Card>
        ))}
      </div>

      <p className="rise rise-4 mt-5 rounded-xl border border-dashed border-line-strong bg-surface px-5 py-4 text-[12.5px] leading-relaxed text-muted">
        En el despliegue de producción este módulo enlaza con el BI de Algoritmo T mediante
        inicio de sesión unificado, de modo que el equipo de la Universidad navega los
        observatorios y genera informes sin una segunda credencial.
      </p>
    </>
  );
}
