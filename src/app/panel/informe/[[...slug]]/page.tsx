"use client";

// Módulo de informes y analítica con rutas profundas:
//   /panel/informe/ejecutivo    — pieza imprimible para comité (compositor)
//   /panel/informe/analitica    — tendencias, presupuesto, ritmo y carga
//   /panel/informe/comparativo  — medición vigente vs. anterior

import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { FileText, ChartLine, GitCompareArrows } from "lucide-react";
import EjecutivoTab from "./ejecutivo";
import AnaliticaTab from "./analitica";
import ComparativoTab from "./comparativo";

type Tab = "ejecutivo" | "analitica" | "comparativo";

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "ejecutivo", label: "Ejecutivo", icon: FileText },
  { id: "analitica", label: "Analítica", icon: ChartLine },
  { id: "comparativo", label: "Comparativo", icon: GitCompareArrows },
];

const HEAD: Record<Tab, { title: string; desc: string }> = {
  ejecutivo: {
    title: "Estado de la transformación digital",
    desc: "El informe para comité: compositor de secciones, tablas ordenables y PDF desde el navegador.",
  },
  analitica: {
    title: "Analítica del programa",
    desc: "Tendencias de indicadores, ejecución presupuestal, ritmo de los planes de trabajo y carga del equipo.",
  },
  comparativo: {
    title: "Comparativo entre mediciones",
    desc: "La medición vigente contra la anterior, celda por celda: qué subió, qué bajó y qué sigue quieto.",
  },
};

export default function InformeModule() {
  const params = useParams<{ slug?: string[] }>();
  const router = useRouter();
  const seg = (params.slug?.[0] ?? "ejecutivo").toLowerCase();
  const tab: Tab = (TABS.find((t) => t.id === seg)?.id ?? "ejecutivo") as Tab;

  return (
    <>
      <div className="no-print">
        <PageHeader kicker="Informes y analítica" title={HEAD[tab].title} desc={HEAD[tab].desc} />
        <div className="rise mb-6 flex flex-wrap gap-1.5 rounded-2xl bg-surface-2 p-1.5">
          {TABS.map((t) => (
            <button key={t.id}
              onClick={() => router.push(`/panel/informe/${t.id}`)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-bold transition-all ${
                tab === t.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}>
              <t.icon size={14} className={tab === t.id ? "text-cyan-deep" : ""} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "ejecutivo" && <EjecutivoTab />}
      {tab === "analitica" && <AnaliticaTab />}
      {tab === "comparativo" && <ComparativoTab />}
    </>
  );
}
