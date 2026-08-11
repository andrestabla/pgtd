"use client";

// M7 · Inteligencia de negocio: puerta a los observatorios de Algoritmo T.

import { PageHeader, Card } from "@/components/ui";
import { AccessChip } from "@/components/user-context";
import { ExternalLink, Database, Briefcase, Map as MapIcon, FileOutput } from "lucide-react";

const OBSERVATORIES = [
  {
    icon: Database, title: "Oferta educativa",
    desc: "Programas de educación superior (SNIES) por institución, área, nivel, modalidad y territorio, con mapas.",
    tags: ["27.005 programas", "357 IES"],
    href: "https://www.algoritmot.com/bi/oferta",
  },
  {
    icon: Briefcase, title: "Laboral y empleabilidad",
    desc: "Competencias demandadas, reskilling, empleabilidad y vinculación formal de graduados.",
    tags: ["OLE", "DANE", "OIT"],
    href: "https://www.algoritmot.com/bi/laboral",
  },
  {
    icon: MapIcon, title: "Análisis regional",
    desc: "Pertinencia territorial, vacíos de oferta, demanda potencial por cohortes y recomendación de programas.",
    tags: ["33 departamentos", "Cohortes"],
    href: "https://www.algoritmot.com/bi/regional",
  },
  {
    icon: FileOutput, title: "Espacio de trabajo",
    desc: "Informes propios combinando oferta, demanda y recomendaciones, exportables en PDF y CSV.",
    tags: ["Autonomía"],
    href: "https://www.algoritmot.com/bi/workspace",
  },
];

export default function BiPage() {
  return (
    <>
      <PageHeader kicker="M7 · Inteligencia" title="Observatorios de Algoritmo T"
        desc="El componente comparativo de la plataforma se apoya en los observatorios ya en operación: llegan con datos desde el primer día, sin que la Universidad tenga que aportarlos." actions={<AccessChip module="bi" />} />

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
            <a href={o.href} target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-cyan-deep hover:underline">
              Abrir observatorio <ExternalLink size={13} />
            </a>
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
