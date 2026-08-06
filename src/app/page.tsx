"use client";

// Portada + acceso. Un solo código sirve el portal público (esta página)
// y el panel interno (/panel).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlgoritmoMark } from "@/components/logo";
import { LogIn, Loader2 } from "lucide-react";

const DEMO_ACCOUNTS = [
  { label: "Consultor Algoritmo T", email: "consultor@algoritmot.com" },
  { label: "Líder institucional", email: "lider@unicesar.edu.co" },
  { label: "Responsable de línea", email: "academica@unicesar.edu.co" },
  { label: "Directivo (solo lectura)", email: "rectoria@unicesar.edu.co" },
];

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("consultor@algoritmot.com");
  const [password, setPassword] = useState("pgtd-demo-2026");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/panel");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No fue posible iniciar sesión.");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* lateral de marca */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{ background: "linear-gradient(160deg, #12203f 0%, #1a2d5a 45%, #0b6f88 100%)" }}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(640px 320px at 90% -8%, rgba(79,208,236,.28), transparent 60%)," +
              "radial-gradient(480px 300px at 0% 108%, rgba(241,186,91,.2), transparent 60%)",
          }} />
        <div className="relative flex items-center gap-3">
          <AlgoritmoMark size={30} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
            Algoritmo T
          </span>
        </div>
        <div className="relative">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: "#f1ba5b" }}>
            Universidad Popular del Cesar
          </div>
          <h1 className="mt-4 max-w-[16ch] text-[38px] font-extrabold leading-[1.12] tracking-tight text-white">
            Plataforma de Gestión de la{" "}
            <span style={{ color: "#4fd0ec" }}>Transformación Digital</span>
          </h1>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-white/60">
            El diagnóstico deja de ser un documento: madurez medible, comparación con el
            sector, mapa estratégico, indicadores y seguimiento presupuestal en un solo
            entorno que la Universidad administra.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {["4 líneas misionales", "16 puntos de medición", "7 módulos", "25 municipios"].map((t) => (
              <span key={t} className="rounded-full border border-white/20 bg-white/8 px-3.5 py-1 text-[11.5px] text-white/70">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="relative font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/35">
          Colaboraciones que transforman
        </div>
      </div>

      {/* formulario */}
      <div className="flex flex-1 items-center justify-center bg-bg px-6 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-7 flex items-center gap-2.5 lg:hidden">
            <AlgoritmoMark size={26} />
            <span className="text-[15px] font-extrabold text-ink">PGTD</span>
          </div>
          <div className="kicker mb-1.5">Acceso institucional</div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-ink">Iniciar sesión</h2>
          <p className="mt-1 text-[13px] text-muted">
            Entra con tu cuenta institucional asignada por el administrador.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mono-label">Correo</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="username" required
                className="mt-1.5 w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/20" />
            </label>
            <label className="block">
              <span className="mono-label">Contraseña</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" required
                className="mt-1.5 w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-cyan focus:ring-2 focus:ring-cyan/20" />
            </label>

            {error && (
              <p className="rounded-lg px-3.5 py-2.5 text-[12.5px]"
                style={{ background: "color-mix(in srgb, var(--bad) 8%, white)", color: "var(--bad)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy px-4 py-2.5 text-[13.5px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-60">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
              Entrar a la plataforma
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-line bg-surface p-4">
            <div className="mono-label mb-2.5">Cuentas de demostración</div>
            <div className="space-y-1">
              {DEMO_ACCOUNTS.map((a) => (
                <button key={a.email} type="button"
                  onClick={() => { setEmail(a.email); setPassword("pgtd-demo-2026"); }}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors hover:bg-surface-2">
                  <span className="font-medium text-ink-soft">{a.label}</span>
                  <span className="truncate font-mono text-[10.5px] text-faint">{a.email}</span>
                </button>
              ))}
            </div>
            <div className="mt-2.5 border-t border-line pt-2 font-mono text-[10px] text-faint">
              contraseña común · pgtd-demo-2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
