"use client";

// M1 · Captura de la medición A3 desde la plataforma.
//   /panel/madurez/captura        → tablero de avance + publicación
//   /panel/madurez/captura/<ID>   → formulario de captura de la variable
// El responsable de línea registra la percepción de SUS variables; el
// consultor califica D/I/K contra los criterios del protocolo y asigna el
// nivel 1–5 contra la rúbrica. Publicar exige las 52 calificadas y conmuta
// la medición vigente de la plataforma.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader } from "@/components/ui";
import { useCan, useUser } from "@/components/user-context";
import { LINES, DIMENSIONS, EVIDENCES } from "@/data/demo";
import { VARIABLES } from "@/data/instrument";
import { protocolOf, DIK_ANCHORS, ITEM_TYPE_LABEL, type EvidenceComponent } from "@/data/protocolo";
import { responsible } from "@/data/cmi";
import { useMaturity } from "@/lib/use-maturity";
import type { VariableCapture } from "@/server/store";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Loader2, Lock,
  Megaphone, Save, AlertTriangle, FileText, X,
} from "lucide-react";

const LEVEL_BG = ["", "var(--n1)", "var(--n2)", "var(--n3)", "var(--n4)", "var(--n5)"];
const DIM_NAME: Record<string, string> = Object.fromEntries(DIMENSIONS.map((d) => [d.key, d.name]));

const statusOf = (c?: VariableCapture) => ({
  p: c?.perception !== undefined,
  e: c?.d !== undefined && c?.i !== undefined && c?.k !== undefined,
  n: c?.level !== undefined,
});

/* ═══ Tablero de captura ═══ */

export function CapturaOverview({ onOpenVar }: { onOpenVar: (id: string) => void }) {
  const user = useUser();
  const canPublish = useCan("publish_maturity");
  const { data, refetch } = useMaturity();
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prog = data?.capture.progress ?? { total: 52, perception: 0, dik: 0, level: 0 };
  const vars = data?.capture.vars ?? {};
  const published = data?.published ?? false;

  const publish = async () => {
    setPublishing(true);
    setError(null);
    const res = await fetch("/api/td/captura/publicar", { method: "POST" });
    if (!res.ok) setError((await res.json()).error ?? "Error al publicar");
    await refetch();
    setPublishing(false);
  };

  return (
    <>
      {/* avance de la captura */}
      <div className="rise rise-1 mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { l: "Percepción registrada", v: prog.perception, sub: "autodiagnóstico Likert (responsables y consultor)" },
          { l: "Evidencia calificada (D/I/K)", v: prog.dik, sub: "contra los criterios del protocolo (consultor)" },
          { l: "Nivel asignado (rúbrica)", v: prog.level, sub: "sesión de calificación 1–5 (consultor)" },
        ].map((s) => (
          <div key={s.l} className="panel px-5 py-4">
            <div className="text-[11.5px] text-muted">{s.l}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="num text-[26px] font-extrabold text-ink">{s.v}</span>
              <span className="num text-[12px] text-faint">/ {prog.total}</span>
            </div>
            <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(s.v / prog.total) * 100}%`, background: "var(--grad-brand)" }} />
            </div>
            <div className="mt-1.5 text-[10px] text-faint">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* publicación */}
      <Card className={`rise rise-2 mb-6 overflow-hidden ${published ? "ring-1 ring-cyan/40" : ""}`}>
        {published ? (
          <div className="flex flex-wrap items-center gap-3 px-5 py-4">
            <CheckCircle2 size={18} className="shrink-0" style={{ color: "var(--ok)" }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-extrabold text-ink">
                Corte A3 publicado · {data?.current.period}
              </div>
              <p className="text-[11.5px] leading-snug text-muted">
                La medición vigente de la plataforma ya es A3: el resumen, el panel y el motor de
                alertas leen este corte. A2 pasa al histórico como medición anterior.
              </p>
            </div>
            <Link href="/panel/madurez/resumen" className="btn-primary !py-2 text-[12px]">
              Ver el resumen vigente →
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 px-5 py-4">
            <Megaphone size={18} className="shrink-0 text-cyan-deep" />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-extrabold text-ink">Publicar el corte A3</div>
              <p className="text-[11.5px] leading-snug text-muted">
                Exige las {prog.total} variables con nivel calificado
                {prog.level < prog.total
                  ? ` — faltan ${prog.total - prog.level}.`
                  : " — completo: listo para publicar."}
                {" "}La percepción y la evidencia pendientes quedan registradas en la nota del corte.
              </p>
            </div>
            {canPublish ? (
              <button onClick={publish} disabled={publishing || prog.level < prog.total}
                className="btn-primary !py-2 text-[12px] disabled:opacity-40">
                {publishing ? <Loader2 size={13} className="animate-spin" /> : <Megaphone size={13} />}
                Publicar medición
              </button>
            ) : (
              <span className="chip"><Lock size={10} /> Publica el equipo consultor</span>
            )}
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 border-t border-line px-5 py-2.5"
            style={{ background: "color-mix(in srgb, var(--bad) 6%, white)" }}>
            <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--bad)" }} />
            <p className="flex-1 text-[11.5px] text-ink-soft">{error}</p>
            <button onClick={() => setError(null)} className="text-faint hover:text-ink"><X size={13} /></button>
          </div>
        )}
      </Card>

      {/* celdas y variables */}
      <div className="grid gap-5 lg:grid-cols-2">
        {LINES.map((l, li) => (
          <Card key={l.n} className={`rise rise-${Math.min(li + 1, 4)}`}>
            <CardHeader title={`${l.code} ${l.name}`}
              sub={`${VARIABLES.filter((v) => v.line === l.n && statusOf(vars[v.id]).n).length} de ${VARIABLES.filter((v) => v.line === l.n).length} variables calificadas`} />
            <div className="space-y-4 px-5 pb-5">
              {DIMENSIONS.map((d) => {
                const cellVars = VARIABLES.filter((v) => v.line === l.n && v.dimension === d.key);
                return (
                  <div key={d.key}>
                    <div className="label mb-1.5 !text-[8px]">{d.name}</div>
                    <div className="space-y-1">
                      {cellVars.map((v) => {
                        const st = statusOf(vars[v.id]);
                        const mine = user.role === "CONSULTOR" || user.role === "LIDER" || user.line === v.line;
                        return (
                          <button key={v.id} onClick={() => onOpenVar(v.id)}
                            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-surface-2 ${
                              mine ? "" : "opacity-50"}`}>
                            <span className="num w-[64px] shrink-0 text-[9px] font-bold text-cyan-deep">{v.id}</span>
                            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink">{v.name}</span>
                            <span className="flex shrink-0 items-center gap-1"
                              title={`percepción ${st.p ? "✓" : "—"} · evidencia ${st.e ? "✓" : "—"} · nivel ${st.n ? "✓" : "—"}`}>
                              {(["p", "e", "n"] as const).map((k2) => (
                                <i key={k2} className="h-2 w-2 rounded-full"
                                  style={{ background: st[k2] ? "var(--ok)" : "var(--line-strong)" }} />
                              ))}
                            </span>
                            {st.n && vars[v.id]?.level !== undefined && (
                              <span className="num shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                                style={{ background: LEVEL_BG[vars[v.id]!.level!] }}>
                                {vars[v.id]!.level}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-5 text-[10.5px] leading-relaxed text-faint">
        Puntos de la fila: percepción · evidencia D/I/K · nivel. El responsable de línea captura la
        percepción de sus variables; la calificación (D/I/K y nivel) es del equipo consultor — la misma
        separación del protocolo de indagación. Ver{" "}
        <Link href="/panel/metodologia#protocolo" className="font-semibold text-cyan-deep">Metodología</Link>.
      </p>
    </>
  );
}

/* ═══ Formulario de captura de una variable ═══ */

export function CapturaForm({ id, onClose, onNav }: {
  id: string;
  onClose: () => void;
  onNav: (id: string) => void;
}) {
  const canGrade = useCan("publish_maturity");     // D/I/K y nivel: solo consultor
  const { data, refetch } = useMaturity();
  const v = VARIABLES.find((x) => x.id === id) ?? null;
  const canPerception = useCan("capture_maturity", v?.line);
  const published = data?.published ?? false;

  const cap = data?.capture.vars[id];
  const [draft, setDraft] = useState<{ perception?: number; d?: number; i?: number; k?: number; level?: number; note: string }>({ note: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setDraft({
      perception: cap?.perception, d: cap?.d, i: cap?.i, k: cap?.k,
      level: cap?.level, note: cap?.note ?? "",
    });
    setError(null);
    setSavedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, data]);

  // pendientes (sin nivel) para la navegación anterior/siguiente
  const pending = useMemo(() => {
    const vars = data?.capture.vars ?? {};
    const list = VARIABLES.filter((x) => vars[x.id]?.level === undefined || x.id === id);
    return list.length > 1 ? list : VARIABLES;
  }, [data, id]);
  const idx = v ? pending.findIndex((x) => x.id === v.id) : -1;
  const prev = idx > 0 ? pending[idx - 1] : null;
  const next = idx >= 0 && idx < pending.length - 1 ? pending[idx + 1] : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  if (!v) {
    return (
      <>
        <button onClick={onClose} className="btn-ghost rise mb-5"><ArrowLeft size={13} /> Captura A3</button>
        <p className="rounded-xl bg-surface-2 px-5 py-6 text-[13px] text-muted">
          La variable <b className="num">{id}</b> no existe en el instrumento.
        </p>
      </>
    );
  }

  const line = LINES.find((l) => l.n === v.line)!;
  const proto = protocolOf(v.id)!;
  const evidences = EVIDENCES.filter((e) => v.evidenceIds.includes(e.id));
  const owner = responsible(v.ownerId);
  const locked = published;

  const dirty = draft.perception !== cap?.perception || draft.d !== cap?.d ||
    draft.i !== cap?.i || draft.k !== cap?.k || draft.level !== cap?.level ||
    draft.note !== (cap?.note ?? "");

  const save = async () => {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/td/captura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ varId: v.id, ...draft, note: draft.note || undefined }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "Error al guardar");
    } else {
      setSavedAt(new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
      await refetch();
    }
    setSaving(false);
  };

  const pick = (field: "perception" | "d" | "i" | "k" | "level", val: number) =>
    setDraft((dr) => ({ ...dr, [field]: dr[field] === val ? undefined : val }));

  return (
    <>
      {/* barra de contexto */}
      <div className="rise mb-5 flex flex-wrap items-center gap-2">
        <button onClick={onClose} className="btn-ghost" title="Volver a la captura (Esc)">
          <ArrowLeft size={13} /> Captura A3
        </button>
        <span className="num text-[11px] text-faint">{idx + 1} de {pending.length} pendientes</span>
        {locked && <span className="chip chip-cyan"><Lock size={10} /> Corte publicado — solo lectura</span>}
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => prev && onNav(prev.id)} disabled={!prev}
            className="btn-ghost disabled:opacity-30">
            <ArrowLeft size={13} /> <span className="num hidden sm:inline">{prev?.id ?? "—"}</span>
          </button>
          <button onClick={() => next && onNav(next.id)} disabled={!next}
            className="btn-ghost disabled:opacity-30">
            <span className="num hidden sm:inline">{next?.id ?? "—"}</span> <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* cabecera */}
      <div className="rise rise-1 panel mb-5 overflow-hidden">
        <div className="spine h-[3px]" />
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2 px-6 py-4">
          <div className="min-w-0 flex-1 basis-72">
            <div className="num text-[10.5px] font-bold text-cyan-deep">
              {v.id} <span className="font-medium text-faint">· {line.code} {line.short} · {DIM_NAME[v.dimension]} · {v.frame}</span>
            </div>
            <h1 className="mt-0.5 text-[19px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{v.name}</h1>
            <p className="mt-1 text-[12px] leading-snug text-muted">{v.desc}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="label !text-[8.5px]">Diagnóstico (A2)</div>
            <span className="num inline-block rounded-lg px-2.5 py-1 text-[15px] font-extrabold text-white"
              style={{ background: LEVEL_BG[v.value] }}>{v.value}</span>
            <div className="num mt-1 text-[9.5px] text-faint">meta {v.target} · {owner.cargo}</div>
          </div>
        </div>
      </div>

      <div className="rise rise-2 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* ── guía: qué indagar y evidencia disponible ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Qué se indaga" sub={<><ClipboardList size={11} className="mr-1 inline" />ítems del protocolo (guía de la sesión)</>} />
            <div className="space-y-1.5 px-5 pb-4">
              {proto.items.map((it, i2) => (
                <div key={i2} className="rounded-lg bg-surface-2/60 px-3 py-2">
                  <p className="text-[11.5px] leading-snug text-ink-soft">{it.text}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="chip chip-cyan !py-0 !text-[8px]">{ITEM_TYPE_LABEL[it.type]}</span>
                    {it.audiences.map((a) => (
                      <span key={a} className="chip !py-0 !text-[8px]">{a.slice(0, 3)}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Evidencia disponible" sub={<><FileText size={11} className="mr-1 inline" />lo que soporta la calificación</>} />
            <div className="space-y-1.5 px-5 pb-4">
              {proto.evidence.map((e) => (
                <div key={e.component} className="rounded-lg bg-surface-2/60 px-3 py-2">
                  <div className="text-[11px] font-bold text-ink">
                    {DIK_ANCHORS[e.component].label} ({e.component})
                  </div>
                  <p className="text-[10.5px] leading-snug text-muted">{e.what}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-faint"><b>Criterio 3–4:</b> {e.criterio}</p>
                </div>
              ))}
              {evidences.map((e) => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 shadow-sm">
                  <FileText size={12} className="shrink-0 text-cyan-deep" />
                  <span className="min-w-0 flex-1 truncate text-[11.5px] font-semibold text-ink">{e.title}</span>
                  <span className={`chip !py-0 !text-[8px] ${e.status === "VERIFICADA" ? "chip-ok" : "chip-warn"}`}>
                    {e.status === "VERIFICADA" ? "Verificada" : "Pendiente"}
                  </span>
                </div>
              ))}
              <p className="pt-1 text-[10px] italic leading-snug text-faint">
                Hallazgo del diagnóstico: {v.hallazgo}
              </p>
            </div>
          </Card>
        </div>

        {/* ── formulario ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Percepción (autodiagnóstico)"
              sub={canPerception ? "Likert 1–5 · consolidada de los ítems de indagación" : "Solo el responsable de la línea o el consultor"} />
            <div className="px-5 pb-4">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => canPerception && !locked && pick("perception", n)}
                    disabled={!canPerception || locked}
                    className={`num h-10 flex-1 rounded-xl text-[15px] font-extrabold transition-all disabled:cursor-not-allowed ${
                      draft.perception === n
                        ? "text-white shadow-md"
                        : "bg-surface-2 text-muted hover:bg-surface-3 disabled:opacity-50"}`}
                    style={draft.perception === n ? { background: "var(--cyan-deep)" } : undefined}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="num mt-1.5 flex justify-between text-[9px] text-faint">
                <span>1 · inexistente / muy débil</span><span>5 · consolidada / referente</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Calificación de evidencia (D/I/K)"
              sub={canGrade ? "0–4 contra las anclas · pesa E = 0,25·D + 0,35·I + 0,40·K" : "La califica el equipo consultor (independencia de la medición)"} />
            <div className="space-y-3 px-5 pb-4">
              {(Object.keys(DIK_ANCHORS) as EvidenceComponent[]).map((c) => {
                const key = c.toLowerCase() as "d" | "i" | "k";
                const anchor = DIK_ANCHORS[c];
                return (
                  <div key={c}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-[11px] font-bold text-ink">{anchor.label} ({c})</span>
                      <span className="text-[9.5px] italic text-faint">{anchor.question}</span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((n) => (
                        <button key={n} onClick={() => canGrade && !locked && pick(key, n)}
                          disabled={!canGrade || locked}
                          title={anchor.levels[n]}
                          className={`num h-8 flex-1 rounded-lg text-[12.5px] font-bold transition-all disabled:cursor-not-allowed ${
                            draft[key] === n
                              ? "text-white shadow-sm"
                              : "bg-surface-2 text-muted hover:bg-surface-3 disabled:opacity-50"}`}
                          style={draft[key] === n ? { background: "var(--navy)" } : undefined}>
                          {n}
                        </button>
                      ))}
                    </div>
                    {draft[key] !== undefined && (
                      <p className="mt-1 text-[10px] leading-snug text-muted">{anchor.levels[draft[key]!]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="Nivel de madurez (rúbrica)"
              sub={canGrade ? "Se asigna en sesión contrastando la evidencia con los descriptores" : "Lo asigna el equipo consultor"} />
            <div className="space-y-1.5 px-5 pb-4">
              {proto.rubric.map((r, i2) => {
                const lvl = i2 + 1;
                const active = draft.level === lvl;
                return (
                  <button key={i2} onClick={() => canGrade && !locked && pick("level", lvl)}
                    disabled={!canGrade || locked}
                    className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-all disabled:cursor-not-allowed ${
                      active ? "shadow-md" : "bg-surface-2/70 hover:bg-surface-2 disabled:opacity-60"}`}
                    style={active ? { background: LEVEL_BG[lvl] } : undefined}>
                    <span className={`num mt-px shrink-0 text-[11px] font-extrabold ${active ? "text-white/85" : ""}`}
                      style={active ? undefined : { color: LEVEL_BG[lvl] }}>
                      {lvl}
                    </span>
                    <span className={`flex-1 text-[11px] leading-snug ${active ? "font-semibold text-white" : "text-muted"}`}>
                      {r}
                    </span>
                    {v.value === lvl && !active && (
                      <span className="chip shrink-0 !py-0 !text-[8px]">A2</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="space-y-3 px-5 py-4">
              <textarea value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                disabled={locked || (!canPerception && !canGrade)}
                placeholder="Observación de la sesión (hallazgo actualizado, contexto de la calificación…)"
                rows={2}
                className="input w-full resize-y text-[12px]" />
              {error && (
                <p className="flex items-start gap-2 rounded-lg px-3 py-2 text-[11.5px] text-ink-soft"
                  style={{ background: "color-mix(in srgb, var(--bad) 7%, white)" }}>
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" style={{ color: "var(--bad)" }} />
                  {error}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button onClick={save} disabled={saving || !dirty || locked}
                  className="btn-primary flex-1 !py-2 text-[12.5px] disabled:opacity-40">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Guardar captura
                </button>
                {savedAt && !dirty && (
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--ok)" }}>
                    <CheckCircle2 size={12} /> Guardado {savedAt}
                  </span>
                )}
              </div>
              {cap?.by && (
                <p className="num text-[9.5px] text-faint">
                  Última captura: {cap.by} · {new Date(cap.at).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
