"use client";

// Shell de la aplicación: sidebar de navegación + topbar.

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Radar, Globe2, Network, Gauge, Map as MapIcon, ListChecks,
  BarChart3, LayoutDashboard, LogOut, Menu, X, Share2,
} from "lucide-react";
import { AlgoritmoMark } from "@/components/logo";
import { INSTITUTION } from "@/data/demo";

const NAV = [
  { href: "/panel", label: "Panel", icon: LayoutDashboard },
  { href: "/panel/madurez", label: "Madurez", icon: Radar, code: "M1" },
  { href: "/panel/benchmark", label: "Comparación", icon: Globe2, code: "M2" },
  { href: "/panel/capacidades", label: "Capacidades", icon: Network, code: "M3" },
  { href: "/panel/kpi", label: "Indicadores", icon: Gauge, code: "M4" },
  { href: "/panel/ruta", label: "Ruta", icon: MapIcon, code: "M5" },
  { href: "/panel/iniciativas", label: "Iniciativas", icon: ListChecks, code: "M6" },
  { href: "/panel/bi", label: "Inteligencia", icon: BarChart3, code: "M7" },
];

export function AppShell({ children, user }: {
  children: ReactNode;
  user: { name: string; role: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const roleLabel: Record<string, string> = {
    CONSULTOR: "Consultor Algoritmo T",
    LIDER: "Líder institucional",
    RESPONSABLE: "Responsable de línea",
    DIRECTIVO: "Directivo",
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const nav = (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV.map((item) => {
        const active = item.href === "/panel"
          ? pathname === "/panel"
          : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
            className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
              active
                ? "bg-white/12 text-white"
                : "text-white/55 hover:bg-white/7 hover:text-white/90"
            }`}>
            <item.icon size={16} strokeWidth={active ? 2.4 : 2} />
            <span className="flex-1">{item.label}</span>
            {item.code && (
              <span className={`font-mono text-[9px] tracking-wider ${active ? "text-cyan-fill" : "text-white/30"}`}>
                {item.code}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[228px] flex-col lg:flex"
        style={{ background: "linear-gradient(178deg, var(--navy-deep) 0%, var(--navy) 70%, #1c3a63 100%)" }}>
        <div className="flex items-center gap-2.5 px-5 pb-5 pt-5">
          <AlgoritmoMark size={26} />
          <div className="leading-tight">
            <div className="text-[13px] font-extrabold tracking-tight text-white">PGTD</div>
            <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/40">Algoritmo T</div>
          </div>
        </div>
        {nav}
        <div className="mt-auto px-5 pb-5">
          <div className="mb-3 rounded-lg border border-white/10 bg-white/5 px-3.5 py-3">
            <div className="text-[12px] font-bold text-white">{INSTITUTION.shortName}</div>
            <div className="mt-0.5 text-[10.5px] leading-snug text-white/45">{INSTITUTION.name}</div>
          </div>
          <button onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12.5px] text-white/50 transition-colors hover:bg-white/7 hover:text-white">
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[250px] flex-col pt-5"
            style={{ background: "var(--navy-deep)" }}>
            <div className="mb-4 flex items-center justify-between px-5">
              <div className="flex items-center gap-2"><AlgoritmoMark size={24} />
                <span className="text-[13px] font-extrabold text-white">PGTD</span></div>
              <button onClick={() => setOpen(false)} className="text-white/60"><X size={18} /></button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      {/* contenido */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[228px]">
        <header className="sticky top-0 z-30 flex h-[52px] items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6">
          <button onClick={() => setOpen(true)} className="text-muted lg:hidden"><Menu size={19} /></button>
          <div className="mono-label hidden sm:block">
            Plataforma de Gestión de la Transformación Digital
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="chip chip-cyan cursor-pointer" title="Generar enlace público de solo lectura">
              <Share2 size={11} /> Vista pública
            </button>
            <div className="flex items-center gap-2.5 border-l border-line pl-3">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
                {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="hidden leading-tight sm:block">
                <div className="text-[12px] font-semibold text-ink">{user.name}</div>
                <div className="text-[10px] text-faint">{roleLabel[user.role] ?? user.role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-7 sm:px-7">{children}</main>
        <footer className="border-t border-line px-6 py-4 text-center font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">
          Algoritmo T S.A.S. · PGTD · Universidad Popular del Cesar
        </footer>
      </div>
    </div>
  );
}
