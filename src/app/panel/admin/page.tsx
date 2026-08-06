"use client";

// Administración de usuarios (manage_users, solo consultor): crear cuentas,
// asignar rol y línea, desactivar/reactivar. En el prototipo la contraseña
// es la demo compartida; con Auth.js pasa a invitación + bcrypt por usuario.

import { useCallback, useEffect, useState } from "react";
import { PageHeader, Card, CardHeader } from "@/components/ui";
import { AccessChip, useCan, useUser } from "@/components/user-context";
import { LINES } from "@/data/demo";
import {
  UserPlus, Loader2, AlertTriangle, X, ShieldCheck, Power, PowerOff,
} from "lucide-react";

type ManagedUser = {
  email: string; name: string; role: "CONSULTOR" | "LIDER" | "RESPONSABLE" | "DIRECTIVO";
  line?: number; active: boolean; seeded: boolean; createdBy?: string; at?: string;
};

const ROLE_LABEL: Record<ManagedUser["role"], string> = {
  CONSULTOR: "Consultor Algoritmo T",
  LIDER: "Líder institucional",
  RESPONSABLE: "Responsable de línea",
  DIRECTIVO: "Directivo",
};

export default function AdminPage() {
  const me = useUser();
  const canManage = useCan("manage_users");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const res = await fetch("/api/td/users");
    if (res.ok) setUsers((await res.json()).users);
  }, []);
  useEffect(() => { if (canManage) refetch(); }, [canManage, refetch]);

  const mutate = async (method: "POST" | "PATCH", body: Record<string, unknown>) => {
    setSaving(true); setError(null);
    const res = await fetch("/api/td/users", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const ok = res.ok;
    if (!ok) setError((await res.json().catch(() => null))?.error ?? `Error ${res.status}`);
    else await refetch();
    setSaving(false);
    return ok;
  };

  if (!canManage) {
    return (
      <>
        <PageHeader kicker="Administración" title="Usuarios y permisos" />
        <p className="rounded-xl bg-surface-2 px-5 py-6 text-[13px] text-muted">
          Solo el equipo consultor administra usuarios. Tu rol ({me.role}) es de {me.role === "DIRECTIVO" ? "consulta" : "operación"}.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader kicker="Administración" title="Usuarios y permisos"
        desc="Cuentas de la plataforma con su rol y ámbito. El rol define lo que la matriz de permisos exige en el servidor; la línea acota al responsable. Contraseña demo compartida (pgtd-demo-2026)."
        actions={<AccessChip module="admin" />} />

      {error && (
        <div className="rise mb-4 flex items-start gap-2.5 rounded-xl px-4 py-3"
          style={{ background: "color-mix(in srgb, var(--bad) 8%, white)" }}>
          <AlertTriangle size={15} className="mt-0.5 shrink-0" style={{ color: "var(--bad)" }} />
          <p className="flex-1 text-[12.5px] leading-relaxed text-ink-soft">{error}</p>
          <button onClick={() => setError(null)} className="text-faint hover:text-ink"><X size={14} /></button>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Card className="rise rise-1 overflow-hidden">
          <CardHeader title={`Cuentas (${users.length})`}
            sub="los usuarios del seed no se eliminan: se desactivan" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-[12.5px]">
              <thead>
                <tr className="border-b border-line-strong bg-surface-2/60">
                  {["Usuario", "Rol", "Línea", "Estado", ""].map((h) => (
                    <th key={h} className="label whitespace-nowrap px-4 py-2.5 text-left !text-[8.5px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className={`border-b border-line last:border-0 ${u.active ? "" : "opacity-45"}`}>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-ink">{u.name}</div>
                      <div className="num text-[10px] text-faint">{u.email}{u.seeded ? " · seed" : ` · creado por ${u.createdBy}`}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <select value={u.role} disabled={saving}
                        onChange={(e) => mutate("PATCH", { email: u.email, role: e.target.value })}
                        className="input w-auto !py-1 pr-7 !text-[11.5px]">
                        {(Object.keys(ROLE_LABEL) as ManagedUser["role"][]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {u.role === "RESPONSABLE" ? (
                        <select value={u.line ?? 1} disabled={saving}
                          onChange={(e) => mutate("PATCH", { email: u.email, line: Number(e.target.value) })}
                          className="input w-auto !py-1 pr-7 !text-[11.5px]">
                          {LINES.map((l) => <option key={l.n} value={l.n}>{l.code}</option>)}
                        </select>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className={`chip ${u.active ? "chip-ok" : "chip-bad"}`}>
                        {u.active ? "Activo" : "Desactivado"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <button disabled={saving}
                        onClick={() => mutate("PATCH", { email: u.email, active: !u.active })}
                        title={u.active ? "Desactivar" : "Reactivar"}
                        className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-40">
                        {u.active ? <PowerOff size={14} /> : <Power size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <NewUserCard saving={saving} onCreate={(input) => mutate("POST", input)} />
      </div>

      <p className="mt-5 flex items-start gap-2 text-[10.5px] leading-relaxed text-faint">
        <ShieldCheck size={12} className="mt-0.5 shrink-0" />
        Reglas del servidor: no puedes desactivar tu propia cuenta y debe quedar al menos un consultor
        activo. Todo cambio queda en la auditoría. La matriz completa de permisos está en Metodología.
      </p>
    </>
  );
}

function NewUserCard({ saving, onCreate }: {
  saving: boolean;
  onCreate: (input: Record<string, unknown>) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ManagedUser["role"]>("RESPONSABLE");
  const [line, setLine] = useState(1);

  return (
    <Card className="rise rise-2 self-start">
      <CardHeader title="Nueva cuenta" sub="nace activa, con la contraseña demo" />
      <div className="space-y-2.5 px-5 pb-5">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nombre completo" className="input !py-2 text-[12px]" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@unicesar.edu.co" className="input !py-2 text-[12px]" />
        <select value={role} onChange={(e) => setRole(e.target.value as ManagedUser["role"])}
          className="input !py-2 text-[12px]">
          {(Object.keys(ROLE_LABEL) as ManagedUser["role"][]).map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </select>
        {role === "RESPONSABLE" && (
          <select value={line} onChange={(e) => setLine(Number(e.target.value))}
            className="input !py-2 text-[12px]">
            {LINES.map((l) => <option key={l.n} value={l.n}>{l.code} · {l.name}</option>)}
          </select>
        )}
        <button
          onClick={async () => {
            if (await onCreate({ name, email, role, line: role === "RESPONSABLE" ? line : undefined })) {
              setName(""); setEmail("");
            }
          }}
          disabled={saving || !name.trim() || !email.trim()}
          className="btn-primary w-full !py-2 text-[12.5px] disabled:opacity-40">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
          Crear cuenta
        </button>
      </div>
    </Card>
  );
}
