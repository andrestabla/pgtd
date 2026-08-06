"use client";

// /login — acceso a la plataforma. La raíz (/) redirige aquí (o al panel
// si ya hay sesión). Lateral izquierdo con la imagen institucional.

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

export default function LoginPage() {
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
      {/* lateral de marca con imagen institucional */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden p-10 lg:flex">
        <div aria-hidden className="absolute inset-0"
          style={{
            backgroundImage: "url(/back.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }} />
        {/* velo para legibilidad del texto sobre la fotografía */}
        <div aria-hidden className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(13,24,48,.88) 0%, rgba(26,45,90,.72) 45%, rgba(11,111,136,.55) 100%)",
          }} />
        <div className="relative flex items-center gap-2.5">
          <span className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-white">
            Algoritmo
          </span>
          <AlgoritmoMark size={28} />
        </div>
        <div className="relative">
          <h1 className="mt-4 max-w-[18ch] text-[36px] font-extrabold leading-[1.14] tracking-tight text-white">
            Plataforma de Gestión de la{" "}
            <span style={{ color: "#4fd0ec" }}>Transformación Digital</span>{" "}
            con <span style={{ color: "#f1ba5b" }}>Enfoque Territorial</span>
          </h1>
          <div className="mt-7 flex flex-wrap gap-2">
            {["4 líneas misionales", "52 variables de medición", "8 módulos", "25 municipios"].map((t) => (
              <span key={t}
                className="rounded-full px-3.5 py-1 text-[11.5px] text-white/85"
                style={{ background: "rgba(13,24,48,.45)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="relative font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/60">
          Soluciones digitales con sentido humano
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
              <span className="label">Correo</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                autoComplete="username" required
                className="input mt-1.5" />
            </label>
            <label className="block">
              <span className="label">Contraseña</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password" required
                className="input mt-1.5" />
            </label>

            {error && (
              <p className="rounded-lg px-3.5 py-2.5 text-[12.5px]"
                style={{ background: "color-mix(in srgb, var(--bad) 8%, white)", color: "var(--bad)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={busy}
              className="btn-primary w-full">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
              Entrar a la plataforma
            </button>
          </form>

          <div className="panel mt-8 p-4">
            <div className="label mb-2.5">Cuentas de demostración</div>
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
