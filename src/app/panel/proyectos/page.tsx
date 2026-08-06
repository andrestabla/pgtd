"use client";

// GP · Gestor de proyectos: el roadmap traducido a tareas concretas con
// fechas, responsables con nombre propio, dependencias, evidencia por
// entregable y alertas. Tres vistas: tablero, cronograma y personas.

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, CardHeader, StatCard } from "@/components/ui";
import { INITIATIVES, EVIDENCES } from "@/data/demo";
import {
  TASKS, PEOPLE, person, initials, isOverdue, dueSoon, DEMO_TODAY,
  TASK_STATUS_META, type Task, type TaskStatus,
} from "@/data/proyectos";
import { taskAlerts, workload, portfolioTaskStats } from "@/lib/proyectos";
import {
  KanbanSquare, CalendarRange, Users, X, Link2, FileText, CalendarClock,
  AlertTriangle, Lock, ChevronRight,
} from "lucide-react";

type View = "tablero" | "cronograma" | "personas";

const COLUMNS: TaskStatus[] = ["POR_HACER", "EN_CURSO", "EN_REVISION", "BLOQUEADA", "HECHA"];

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${Number(d)} ${MES[Number(m) - 1]} ${y.slice(2)}`;
};

// meses del cronograma: ago-2026 → ago-2027
const MONTHS = Array.from({ length: 13 }, (_, i) => {
  const y = 2026 + Math.floor((7 + i) / 12);
  const m = ((7 + i) % 12) + 1;
  return { y, m, label: ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][m - 1] + (m === 1 || i === 0 ? `'${String(y).slice(2)}` : "") };
});
const monthIndex = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return (y - 2026) * 12 + (m - 1) - 7; // 0 = ago-2026
};

export default function ProyectosPage() {
  const [view, setView] = useState<View>("tablero");
  const [iniFilter, setIniFilter] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("ini");
  });
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState<string | null>(null);

  const stats = portfolioTaskStats();
  const alerts = taskAlerts();

  const filtered = useMemo(() => {
    let list = TASKS;
    if (iniFilter) list = list.filter((t) => t.iniId === iniFilter);
    if (personFilter) list = list.filter((t) => t.assigneeId === personFilter);
    return list;
  }, [iniFilter, personFilter]);

  const task = openTask ? TASKS.find((t) => t.id === openTask) : null;

  return (
    <>
      <PageHeader kicker="GP · Gestor de proyectos" title="Plan de trabajo del portafolio"
        desc={`Las ${INITIATIVES.length} iniciativas del roadmap traducidas a ${TASKS.length} tareas con fechas, responsables con nombre propio, dependencias y evidencia por entregable. Hoy (demo): ${fmtDate(DEMO_TODAY)}.`}
        actions={
          <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
            {([["tablero", KanbanSquare, "Tablero"], ["cronograma", CalendarRange, "Cronograma"], ["personas", Users, "Personas"]] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => setView(v)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-all ${
                  view === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                <Icon size={13} className={view === v ? "text-cyan-deep" : ""} />
                {label}
              </button>
            ))}
          </div>
        } />

      {/* métricas */}
      <div className="rise rise-1 mb-5 grid gap-4 sm:grid-cols-4">
        <StatCard label="Tareas del portafolio" value={stats.total}
          unit={`en ${INITIATIVES.length} iniciativas`}
          foot={`${stats.byStatus.HECHA} hechas · ${stats.byStatus.EN_CURSO + stats.byStatus.EN_REVISION} activas`} />
        <StatCard label="Vencidas" value={stats.overdue} unit="tareas"
          foot="Fecha compromiso superada sin cierre"
          accent="linear-gradient(90deg, var(--bad), #a13c44)" />
        <StatCard label="Vencen en 14 días" value={stats.dueSoon} unit="tareas"
          foot="La ventana de gestión de esta quincena"
          accent="linear-gradient(90deg, var(--warn), var(--gold))" />
        <StatCard label="Con evidencia adjunta" value={stats.withEvidence}
          unit={`de ${TASKS.filter((t) => t.requiresEvidence).length} exigidas`}
          foot={`${stats.people} personas con tareas asignadas`}
          accent="linear-gradient(90deg, var(--n4), var(--n5))" />
      </div>

      {/* alertas de tareas */}
      {alerts.length > 0 && (
        <div className="rise rise-2 mb-5 flex flex-wrap gap-2">
          {alerts.slice(0, 4).map((a) => (
            <button key={a.id} onClick={() => setOpenTask(a.taskId)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-[11.5px] transition-transform hover:-translate-y-0.5"
              style={{
                background: a.severity === 1 ? "color-mix(in srgb, var(--bad) 9%, white)" : "color-mix(in srgb, var(--warn) 10%, white)",
              }}>
              {a.kind === "TAREA_BLOQUEADA"
                ? <Lock size={12} style={{ color: "var(--bad)" }} />
                : <AlertTriangle size={12} style={{ color: a.severity === 1 ? "var(--bad)" : "var(--warn)" }} />}
              <span className="max-w-[300px] truncate font-semibold text-ink">{a.title}</span>
              <span className="num text-[10px] text-muted">{a.ownerName.split(" ")[0]}</span>
            </button>
          ))}
          {alerts.length > 4 && (
            <span className="self-center text-[11px] text-faint">+{alerts.length - 4} más en el panel</span>
          )}
        </div>
      )}

      {/* filtros */}
      <div className="rise rise-2 mb-5 flex flex-wrap items-center gap-2">
        <button onClick={() => setIniFilter(null)}
          className={`chip cursor-pointer ${iniFilter === null ? "chip-cyan" : ""}`}>
          Todas las iniciativas
        </button>
        {INITIATIVES.filter((i) => TASKS.some((t) => t.iniId === i.id)).map((i) => (
          <button key={i.id} onClick={() => setIniFilter(iniFilter === i.id ? null : i.id)}
            className={`chip cursor-pointer ${iniFilter === i.id ? "chip-cyan" : ""}`}
            title={i.name}>
            {i.name.length > 26 ? i.name.slice(0, 25) + "…" : i.name}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-line-strong" />
        {PEOPLE.filter((p) => TASKS.some((t) => t.assigneeId === p.id)).map((p) => (
          <button key={p.id} onClick={() => setPersonFilter(personFilter === p.id ? null : p.id)}
            className={`num grid h-7 w-7 cursor-pointer place-items-center rounded-full text-[9.5px] font-extrabold transition-all ${
              personFilter === p.id
                ? "text-white shadow-md ring-2 ring-cyan ring-offset-1"
                : "bg-surface-2 text-ink-soft hover:bg-surface-3"}`}
            style={personFilter === p.id ? { background: "var(--cyan-deep)" } : undefined}
            title={`${p.name} · ${p.cargo}`}>
            {initials(p.name)}
          </button>
        ))}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: task ? "1fr 340px" : "1fr" }}>
        <div className="min-w-0">
          {/* ═══ TABLERO ═══ */}
          {view === "tablero" && (
            <div className="grid gap-3 lg:grid-cols-5">
              {COLUMNS.map((col) => {
                const colTasks = filtered.filter((t) => t.status === col)
                  .sort((a, b) => a.due.localeCompare(b.due));
                const meta = TASK_STATUS_META[col];
                return (
                  <div key={col} className="rounded-2xl bg-surface-2/70 p-2">
                    <div className="mb-2 flex items-baseline justify-between px-2 pt-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
                        <i className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                        {meta.label}
                      </span>
                      <span className="num text-[10px] font-bold text-faint">{colTasks.length}</span>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map((t) => (
                        <TaskCard key={t.id} t={t} onOpen={() => setOpenTask(t.id)} />
                      ))}
                      {colTasks.length === 0 && (
                        <div className="rounded-xl px-3 py-4 text-center text-[10.5px] italic text-faint">Sin tareas</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ CRONOGRAMA ═══ */}
          {view === "cronograma" && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto px-5 py-4">
                <div className="min-w-[840px]">
                  {/* cabecera de meses */}
                  <div className="mb-2 grid" style={{ gridTemplateColumns: `240px repeat(${MONTHS.length}, 1fr)` }}>
                    <div />
                    {MONTHS.map((m, i) => (
                      <div key={i} className="num border-l border-line text-center text-[9px] font-bold text-faint">
                        {m.label}
                      </div>
                    ))}
                  </div>
                  {INITIATIVES.filter((i) => filtered.some((t) => t.iniId === i.id)).map((ini) => {
                    const mine = filtered.filter((t) => t.iniId === ini.id)
                      .sort((a, b) => a.start.localeCompare(b.start));
                    return (
                      <div key={ini.id} className="border-t border-line py-1.5">
                        <div className="mb-1 text-[11.5px] font-bold text-ink">{ini.name}</div>
                        {mine.map((t) => {
                          const s = Math.max(0, monthIndex(t.start));
                          const e = Math.min(MONTHS.length - 1, Math.max(s, monthIndex(t.due)));
                          const meta = TASK_STATUS_META[t.status];
                          const late = isOverdue(t);
                          return (
                            <div key={t.id} className="grid items-center"
                              style={{ gridTemplateColumns: `240px repeat(${MONTHS.length}, 1fr)` }}>
                              <button onClick={() => setOpenTask(t.id)}
                                className="truncate pr-3 text-left text-[10.5px] text-muted transition-colors hover:text-ink">
                                {t.title}
                              </button>
                              {MONTHS.map((_, mi) => (
                                <div key={mi} className="relative h-[18px] border-l border-line/60">
                                  {mi === s && (
                                    <button onClick={() => setOpenTask(t.id)}
                                      className="absolute inset-y-[3px] left-[2px] rounded-full transition-transform hover:scale-y-125"
                                      style={{
                                        width: `calc(${(e - s + 1) * 100}% - 4px)`,
                                        background: late ? "var(--bad)" : meta.color,
                                        opacity: t.status === "HECHA" ? 0.45 : 0.9,
                                      }}
                                      title={`${t.title} · ${fmtDate(t.start)} → ${fmtDate(t.due)} · ${person(t.assigneeId).name}`} />
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-2.5 text-[10.5px] text-muted">
                {COLUMNS.map((c) => (
                  <span key={c} className="flex items-center gap-1.5">
                    <i className="h-2 w-4 rounded-full" style={{ background: TASK_STATUS_META[c].color }} />
                    {TASK_STATUS_META[c].label}
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-4 rounded-full" style={{ background: "var(--bad)" }} /> vencida
                </span>
              </div>
            </Card>
          )}

          {/* ═══ PERSONAS ═══ */}
          {view === "personas" && (
            <Card>
              <CardHeader title="Carga de trabajo por persona"
                sub="Tareas abiertas, vencidas y próximas a vencer — clic para filtrar el tablero" />
              <div className="overflow-x-auto px-3 pb-4">
                <table className="w-full min-w-[680px] text-[12.5px]">
                  <thead>
                    <tr className="border-b border-line-strong">
                      {["Persona", "Cargo", "Abiertas", "Vencidas", "Vencen pronto", "Hechas", "Carga"].map((h) => (
                        <th key={h} className="label px-3 pb-2 text-left !text-[8.5px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {workload().map((w) => {
                      const p = person(w.personId);
                      const max = Math.max(...workload().map((x) => x.open), 1);
                      return (
                        <tr key={w.personId} className="border-b border-line last:border-0 hover:bg-surface-2/50">
                          <td className="px-3 py-2.5">
                            <button onClick={() => { setPersonFilter(w.personId); setView("tablero"); }}
                              className="flex items-center gap-2.5 text-left">
                              <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-full text-[10px] font-extrabold text-white"
                                style={{ background: "linear-gradient(135deg, var(--cyan-deep), var(--navy))" }}>
                                {initials(w.name)}
                              </span>
                              <span className="font-bold text-ink">{w.name}</span>
                            </button>
                          </td>
                          <td className="px-3 py-2.5 text-muted">{w.cargo}</td>
                          <td className="num px-3 py-2.5 text-center font-bold text-ink">{w.open}</td>
                          <td className="num px-3 py-2.5 text-center font-extrabold"
                            style={{ color: w.overdue > 0 ? "var(--bad)" : "var(--faint)" }}>{w.overdue}</td>
                          <td className="num px-3 py-2.5 text-center font-bold"
                            style={{ color: w.dueSoon > 0 ? "var(--warn)" : "var(--faint)" }}>{w.dueSoon}</td>
                          <td className="num px-3 py-2.5 text-center text-muted">{w.done}</td>
                          <td className="px-3 py-2.5">
                            <div className="h-[7px] w-28 overflow-hidden rounded-full bg-surface-2">
                              <div className="h-full rounded-full"
                                style={{ width: `${(w.open / max) * 100}%`, background: w.overdue > 0 ? "var(--bad)" : "var(--grad-brand)" }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-line px-5 py-2.5 text-[10.5px] text-faint">
                Personas ficticias de demostración; en operación el directorio se sincroniza con el sistema de talento humano.
              </div>
            </Card>
          )}
        </div>

        {/* ═══ FICHA DE TAREA ═══ */}
        {task && (
          <div className="lg:sticky lg:top-[70px] lg:self-start">
            <Card className="ring-1 ring-cyan/40">
              <CardHeader title={task.id} sub="Ficha de la tarea"
                right={
                  <button onClick={() => setOpenTask(null)}
                    className="rounded-md p-1 text-faint transition-colors hover:bg-surface-2 hover:text-ink">
                    <X size={15} />
                  </button>
                } />
              <div className="space-y-4 px-5 pb-5">
                <h3 className="text-[14px] font-extrabold leading-snug text-ink">{task.title}</h3>

                <div className="flex items-center gap-2.5">
                  <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg, var(--cyan-deep), var(--navy))" }}>
                    {initials(person(task.assigneeId).name)}
                  </span>
                  <div>
                    <div className="text-[13px] font-bold text-ink">{person(task.assigneeId).name}</div>
                    <div className="text-[10.5px] text-faint">{person(task.assigneeId).cargo} · {person(task.assigneeId).email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface-2 px-3 py-2">
                    <div className="label !text-[8px]">Inicio</div>
                    <div className="num text-[12.5px] font-bold text-ink">{fmtDate(task.start)}</div>
                  </div>
                  <div className="rounded-lg px-3 py-2"
                    style={{ background: isOverdue(task) ? "color-mix(in srgb, var(--bad) 9%, white)" : "var(--surface-2)" }}>
                    <div className="label !text-[8px]">Compromiso</div>
                    <div className="num text-[12.5px] font-bold"
                      style={{ color: isOverdue(task) ? "var(--bad)" : "var(--ink)" }}>
                      {fmtDate(task.due)}{isOverdue(task) ? " · vencida" : dueSoon(task) ? " · próxima" : ""}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white"
                    style={{ background: TASK_STATUS_META[task.status].color }}>
                    {TASK_STATUS_META[task.status].label}
                  </span>
                  <Link href="/panel/iniciativas" className="chip chip-cyan">
                    {INITIATIVES.find((i) => i.id === task.iniId)?.name.slice(0, 30)}
                    <ChevronRight size={10} />
                  </Link>
                </div>

                {task.note && (
                  <p className="rounded-lg bg-gold-wash px-3 py-2.5 text-[11.5px] leading-relaxed" style={{ color: "#6b5312" }}>
                    {task.note}
                  </p>
                )}

                {task.dependsOn && task.dependsOn.length > 0 && (
                  <div>
                    <div className="label mb-1.5 flex items-center gap-1 !text-[8.5px]"><Link2 size={10} /> Depende de</div>
                    {task.dependsOn.map((d) => {
                      const dep = TASKS.find((x) => x.id === d)!;
                      return (
                        <button key={d} onClick={() => setOpenTask(d)}
                          className="mb-1 flex w-full items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-left transition-colors hover:bg-surface-3">
                          <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: TASK_STATUS_META[dep.status].color }} />
                          <span className="flex-1 truncate text-[11.5px] font-medium text-ink">{dep.title}</span>
                          <span className="num text-[9.5px] text-faint">{fmtDate(dep.due)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div>
                  <div className="label mb-1.5 flex items-center gap-1 !text-[8.5px]"><FileText size={10} /> Evidencia del entregable</div>
                  {(task.evidenceIds?.length ?? 0) > 0 ? (
                    task.evidenceIds!.map((eid) => {
                      const ev = EVIDENCES.find((e) => e.id === eid)!;
                      return (
                        <div key={eid} className="mb-1 rounded-lg bg-surface-2 px-3 py-2">
                          <div className="text-[11.5px] font-semibold text-ink">{ev.title}</div>
                          <div className="num mt-0.5 text-[9.5px] text-faint">{ev.kind} · {ev.status === "VERIFICADA" ? "verificada" : "pendiente"} · {ev.date}</div>
                        </div>
                      );
                    })
                  ) : task.requiresEvidence ? (
                    <p className="rounded-lg px-3 py-2 text-[11.5px]"
                      style={{ background: "color-mix(in srgb, var(--warn) 10%, white)", color: "var(--warn)" }}>
                      El cierre exige evidencia y aún no hay soporte adjunto.
                    </p>
                  ) : (
                    <p className="text-[11px] italic text-faint">No exige evidencia formal.</p>
                  )}
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-cyan-wash px-3 py-2.5">
                  <CalendarClock size={13} className="mt-0.5 shrink-0 text-cyan-deep" />
                  <p className="text-[11px] leading-relaxed text-ink-soft">
                    En operación, esta ficha permite reprogramar, reasignar y adjuntar evidencia;
                    cada cambio queda en la bitácora de la iniciativa.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── tarjeta de tarea del tablero ─── */

function TaskCard({ t, onOpen }: { t: Task; onOpen: () => void }) {
  const ini = INITIATIVES.find((i) => i.id === t.iniId)!;
  const late = isOverdue(t);
  const soon = dueSoon(t);
  return (
    <button onClick={onOpen}
      className="panel panel-lift block w-full p-3 text-left">
      <div className="text-[12px] font-bold leading-snug text-ink">{t.title}</div>
      <div className="mt-1.5 truncate text-[9.5px] text-faint">{ini.name}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="num grid h-6 w-6 place-items-center rounded-full text-[8.5px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg, var(--cyan-deep), var(--navy))" }}
          title={person(t.assigneeId).name}>
          {initials(person(t.assigneeId).name)}
        </span>
        <span className="flex items-center gap-1.5">
          {(t.evidenceIds?.length ?? 0) > 0 && <FileText size={11} className="text-cyan-deep" />}
          {t.dependsOn?.length ? <Link2 size={11} className="text-faint" /> : null}
          <span className="num text-[10px] font-bold"
            style={{ color: late ? "var(--bad)" : soon ? "var(--warn)" : "var(--faint)" }}>
            {fmtDate(t.due)}
          </span>
        </span>
      </div>
    </button>
  );
}
