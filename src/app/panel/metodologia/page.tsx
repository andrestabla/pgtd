"use client";

// Metodología · guía de lectura de la plataforma.
// Documenta todas las convenciones (escalas, códigos, colores, umbrales y
// fórmulas) leyéndolas de las MISMAS fuentes que usa el motor: si una regla
// cambia en el código, esta página cambia con ella. Los botones «?» de cada
// vista enlazan a las secciones por ancla (#escala, #variables, #ies…).

import Link from "next/link";
import { PageHeader, Card, CardHeader, LevelBadge } from "@/components/ui";
import { AccessChip } from "@/components/user-context";
import { LINES, DIMENSIONS, LEVELS } from "@/data/demo";
import { VARIABLES, DOMAINS, type Frame } from "@/data/instrument";
import { DIK_ANCHORS, protocolStats, type EvidenceComponent } from "@/data/protocolo";
import {
  IES_LEVELS, IIES_WEIGHTS, D7_META, PRACTICE_STATES, SAFEGUARDS,
} from "@/lib/ies";
import { ACTOR_GROUPS } from "@/data/actores";
import { TASK_STATUS_META, DEMO_TODAY } from "@/data/proyectos";
import { PERMISSION_MATRIX, type Action, type Role } from "@/lib/permissions";
import {
  Layers, Search, BookOpenCheck, ScrollText, Sigma, Gauge, KanbanSquare,
  ShieldCheck, FlaskConical, type LucideIcon,
} from "lucide-react";

/* ─── metadatos locales de presentación ─── */

const FRAME_INFO: { key: Frame; color: string; what: string }[] = [
  { key: "eMM", color: "var(--cyan-deep)", what: "e-Learning Maturity Model (Marshall): madurez de la educación digital por procesos." },
  { key: "Decreto 1330", color: "var(--navy)", what: "Condiciones de calidad de registros calificados del MEN (2019)." },
  { key: "CNA", color: "var(--gold)", what: "Lineamientos de acreditación y autoevaluación en alta calidad." },
  { key: "TOGAF 10", color: "var(--n4)", what: "Marco de arquitectura empresarial: capas de negocio, datos, aplicación y tecnología." },
  { key: "DAMA-DMBOK", color: "#7c5cd6", what: "Cuerpo de conocimiento de gestión y gobierno de datos." },
  { key: "INTEF", color: "var(--n2)", what: "Marco de competencia digital docente (adaptación de DigCompEdu)." },
  { key: "ISO 27001", color: "var(--bad)", what: "Sistema de gestión de seguridad de la información." },
  { key: "CMI", color: "var(--muted)", what: "Cuadro de Mando Integral (Kaplan-Norton): objetivos e indicadores encadenados." },
];

const LINE_PREFIX: { code: string; line: string }[] = [
  { code: "AV", line: "4.1 Academia y Virtualidad" },
  { code: "IN", line: "4.2 Investigación y CTeI" },
  { code: "EX", line: "4.3 Extensión, Relacionamiento y Rankings" },
  { code: "AR", line: "4.4 Arquitectura Empresarial y Gobierno Digital" },
];

const DIM_PREFIX: { code: string; dim: string; what: string }[] = [
  { code: "ORG", dim: "Organizacional", what: "políticas, gobierno, estructura y presupuesto" },
  { code: "MIS", dim: "Misional / pedagógica", what: "la práctica sustantiva: docencia, investigación, extensión" },
  { code: "TEC", dim: "Tecnológica", what: "plataformas, infraestructura y seguridad" },
  { code: "DAT", dim: "Datos e información", what: "medición, trazabilidad y analítica" },
];

const ACTION_LABEL: Record<Action, string> = {
  view: "Ver los módulos",
  edit_tasks: "Crear y editar tareas del gestor",
  edit_initiatives: "Editar iniciativas (avance, factores, bitácora)",
  report_kpi: "Registrar valores de KPI",
  capture_maturity: "Capturar celdas de una medición en curso",
  publish_maturity: "Publicar mediciones y configurar el instrumento",
  verify_evidence: "Verificar evidencia",
  manage_users: "Administrar usuarios y permisos",
};

const ROLES: { key: Role; label: string }[] = [
  { key: "CONSULTOR", label: "Consultor" },
  { key: "LIDER", label: "Líder" },
  { key: "RESPONSABLE", label: "Responsable de línea" },
  { key: "DIRECTIVO", label: "Directivo" },
];

const SECTIONS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "escala", label: "Escala 1–5", icon: Layers },
  { id: "variables", label: "Variables y códigos", icon: Search },
  { id: "dominios", label: "Dominios", icon: BookOpenCheck },
  { id: "registros", label: "Registros calificados", icon: ScrollText },
  { id: "ies", label: "Índices IES", icon: Sigma },
  { id: "semaforos", label: "Semáforos y alertas", icon: Gauge },
  { id: "proyectos", label: "Gestor de proyectos", icon: KanbanSquare },
  { id: "roles", label: "Roles y permisos", icon: ShieldCheck },
  { id: "demo", label: "Modo demo", icon: FlaskConical },
];

function Section({ id, title, sub, children }: {
  id: string; title: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[74px]">
      <Card className="rise">
        <CardHeader title={title} sub={sub} />
        <div className="px-5 pb-5">{children}</div>
      </Card>
    </section>
  );
}

const Formula = ({ children }: { children: React.ReactNode }) => (
  <code className="num inline-block rounded-lg bg-surface-2 px-2.5 py-1 text-[12px] font-bold text-ink">
    {children}
  </code>
);

export default function MetodologiaPage() {
  return (
    <>
      <PageHeader kicker="Guía de lectura" title="Metodología y convenciones"
        desc="Todo lo que la plataforma da por entendido: escalas, códigos, colores, umbrales y fórmulas. Esta página se genera desde las mismas reglas que usa el motor — si un umbral cambia, cambia aquí también."
        actions={<AccessChip module="metodologia" />} />

      {/* índice */}
      <div className="rise mb-7 flex flex-wrap gap-1.5">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`}
            className="flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-muted shadow-sm transition-colors hover:text-cyan-deep">
            <s.icon size={12.5} /> {s.label}
          </a>
        ))}
      </div>

      <div className="space-y-6">
        {/* ═══ 1 · escala ═══ */}
        <Section id="escala" title="La escala de madurez 1–5"
          sub="El nivel verificado de cada celda línea × dimensión — la escala del radar y el mapa de calor">
          <div className="grid gap-3 sm:grid-cols-5">
            {LEVELS.map((lv) => (
              <div key={lv.n} className="rounded-xl p-3.5 text-white" style={{ background: lv.color }}>
                <div className="num text-[9.5px] font-bold opacity-75">NIVEL {lv.n}</div>
                <div className="mt-0.5 text-[13px] font-bold">{lv.name}</div>
                <div className="mt-1 text-[10.5px] leading-snug opacity-90">{lv.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-[12.5px] leading-relaxed text-muted">
            <p>
              <b className="text-ink">Estructura:</b> {LINES.length} líneas misionales × {DIMENSIONS.length} dimensiones
              = 16 celdas. Cada celda se mide con 3–4 variables ({VARIABLES.length} en total) y
              <b className="text-ink"> su valor es el promedio simple de sus variables</b> — el mapa de calor
              no es una opinión, es un agregado (regla protegida por pruebas automáticas).
            </p>
            <p>
              <b className="text-ink">Cómo leer el mapa de calor:</b> el número grande es el nivel actual;
              el <span className="num font-bold">→4</span> pequeño de la esquina es la meta a 24 meses.
              En radares y barras, el trazo de color es la medición vigente y la línea dorada punteada es la meta.
            </p>
            <p>
              <b className="text-ink">La madurez es una serie, no una foto:</b> A1 (línea base) → A2
              (corte publicado vigente, el que alimenta toda la plataforma) → A3 (en captura).
              Cada corte queda versionado y comparable. La captura del corte se hace{" "}
              <b className="text-ink">desde la plataforma</b> (pestaña «Captura A3»): el responsable de
              línea registra la percepción de sus variables, el consultor califica D/I/K y asigna el
              nivel contra la rúbrica, y al publicar —exige las 52 calificadas— el corte nuevo pasa a
              ser la medición vigente de todos los tableros.
            </p>
            <p>
              Conviven <b className="text-ink">dos escalas deliberadamente</b>: la 1–5 (nivel verificado por
              celda, lo que ve un comité) y la 0–100 de los <a href="#ies" className="font-semibold text-cyan-deep">índices IES</a>,
              con más resolución. Son coherentes entre sí: un 1,9/5 institucional corresponde a un índice ~22/100 (Emergente).
            </p>
          </div>
        </Section>

        {/* ═══ 2 · variables ═══ */}
        <Section id="variables" title="Variables del instrumento: códigos y chips"
          sub="Cómo se lee una fila de la pestaña «Variables del instrumento»">
          {/* anatomía del código */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-surface-2/70 px-4 py-3">
            <span className="text-[12px] font-semibold text-muted">Anatomía del código:</span>
            <span className="num rounded-lg bg-cyan-wash px-2 py-1 text-[13px] font-extrabold text-cyan-deep">AV</span>
            <span className="text-[11px] text-faint">línea</span>
            <span className="text-faint">·</span>
            <span className="num rounded-lg bg-gold-wash px-2 py-1 text-[13px] font-extrabold" style={{ color: "var(--gold)" }}>ORG</span>
            <span className="text-[11px] text-faint">dimensión</span>
            <span className="text-faint">·</span>
            <span className="num rounded-lg bg-surface-3 px-2 py-1 text-[13px] font-extrabold text-ink">1</span>
            <span className="text-[11px] text-faint">orden dentro de la celda (no es prioridad)</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="label mb-2">Prefijos de línea</div>
              <table className="w-full text-[12.5px]">
                <tbody>
                  {LINE_PREFIX.map((r) => (
                    <tr key={r.code} className="border-b border-line last:border-0">
                      <td className="num w-12 py-1.5 font-extrabold text-cyan-deep">{r.code}</td>
                      <td className="py-1.5 text-muted">{r.line}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[11px] leading-snug text-faint">
                4.1 tiene 4 variables por dimensión (16) y las demás líneas 3 (12 cada una):
                Academia y Virtualidad es el foco de la contratación y se mide con más resolución.
              </p>
            </div>
            <div>
              <div className="label mb-2">Prefijos de dimensión</div>
              <table className="w-full text-[12.5px]">
                <tbody>
                  {DIM_PREFIX.map((r) => (
                    <tr key={r.code} className="border-b border-line last:border-0">
                      <td className="num w-12 py-1.5 font-extrabold" style={{ color: "var(--gold)" }}>{r.code}</td>
                      <td className="py-1.5 text-muted"><b className="text-ink">{r.dim}</b> — {r.what}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5">
            <div className="label mb-2">Referentes de evaluación (chip de marco)</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {FRAME_INFO.map((f) => (
                <div key={f.key} className="flex items-start gap-2.5 rounded-lg bg-surface-2/60 px-3 py-2">
                  <span className="chip mt-0.5 shrink-0 !py-0 !text-[9px]" style={{ color: f.color }}>{f.key}</span>
                  <span className="text-[11.5px] leading-snug text-muted">{f.what}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-snug text-faint">
              El chip no es decoración: indica contra qué criterio se calificó la variable
              ({VARIABLES.length} variables reparten sus criterios entre estos 8 marcos).
            </p>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <div className="label mb-2">Chip de brecha (meta − valor)</div>
              <div className="space-y-1.5 text-[12.5px] text-muted">
                <div className="flex items-center gap-2.5"><span className="chip chip-ok shrink-0">En meta</span> brecha ≤ 0: la variable ya alcanzó su meta.</div>
                <div className="flex items-center gap-2.5"><span className="chip shrink-0">Brecha 1</span> un nivel por cerrar: gestión ordinaria.</div>
                <div className="flex items-center gap-2.5"><span className="chip chip-warn shrink-0">Brecha 2</span> requiere iniciativa dedicada.</div>
                <div className="flex items-center gap-2.5"><span className="chip chip-bad shrink-0">Brecha 3+</span> crítica: transformación estructural, no mejora incremental.</div>
              </div>
            </div>
            <div>
              <div className="label mb-2">Chips de evidencia</div>
              <div className="space-y-1.5 text-[12.5px] text-muted">
                <div className="flex items-center gap-2.5"><span className="chip chip-ok shrink-0">Verificada</span> validada por el equipo consultor (solo el consultor verifica).</div>
                <div className="flex items-center gap-2.5"><span className="chip chip-warn shrink-0">Pendiente</span> cargada, aún sin validar.</div>
                <p className="pt-1 leading-snug">
                  Tipos: Documento, Acta, Normativa, Informe, Sistema y Encuesta. Una calificación
                  sin evidencia vinculada es un hallazgo en sí misma.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-cyan-wash/60 px-4 py-3 text-[12px] leading-relaxed text-ink-soft">
            <b>Al expandir una fila</b> aparecen: el <b>hallazgo</b> (el hecho encontrado), la
            <b> recomendación</b> (la acción que lo cierra), el nivel actual y la meta como insignias
            (<span className="mx-1 inline-flex align-middle"><LevelBadge level={2} /></span>),
            el responsable de la información, la evidencia de soporte, el estado de la práctica,
            la percepción por grupo de actores, la puntuación IES de la variable
            (ver <a href="#ies" className="font-bold text-cyan-deep">Índices IES</a>) y el
            <b> protocolo de indagación</b> descrito a continuación.
          </div>

          {/* protocolo de indagación */}
          <div id="protocolo" className="mt-6 scroll-mt-[74px]">
            <div className="label mb-2">El protocolo de indagación: cómo se determina el nivel</div>
            <p className="mb-3 text-[12.5px] leading-relaxed text-muted">
              Cada variable declara tres cosas — el banco completo suma{" "}
              <b className="text-ink">{protocolStats().items} ítems</b> y{" "}
              <b className="text-ink">{protocolStats().evidenceRequests} solicitudes de evidencia</b>{" "}
              sobre las {VARIABLES.length} variables:
            </p>
            <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-[12.5px] leading-relaxed text-muted">
              <li>
                <b className="text-ink">Qué se indaga:</b> 2–4 ítems con su tipo (Likert 1–5,
                verificación sí/no, dato, abierta) y su audiencia por grupo de actores
                (Dir · Doc · Adm · Est · Ali). Los ítems Likert alimentan la percepción P;
                nadie responde el banco completo — cada rol recibe su ruta.
              </li>
              <li>
                <b className="text-ink">Qué evidencia se solicita:</b> una solicitud por componente
                (Documentación, Implementación, Indicadores) con el criterio que debe cumplir para
                puntuar alto. Lo entregado se califica 0–4 contra las anclas de abajo, y de ahí sale
                E = 0,25·D + 0,35·I + 0,40·K.
              </li>
              <li>
                <b className="text-ink">Rúbrica del nivel:</b> cinco descriptores anclados específicos
                de la variable. El nivel 1–5 se asigna en sesión de calificación contrastando la
                evidencia con la rúbrica — no es el redondeo de una fórmula.
              </li>
            </ol>
            <div className="grid gap-3 lg:grid-cols-3">
              {(Object.keys(DIK_ANCHORS) as EvidenceComponent[]).map((c) => {
                const a = DIK_ANCHORS[c];
                return (
                  <div key={c} className="rounded-xl bg-surface-2/70 px-4 py-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[12px] font-extrabold text-ink">{a.label} ({c})</span>
                      <span className="text-[10px] italic text-faint">{a.question}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {a.levels.map((lv, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] leading-snug text-muted">
                          <span className="num mt-px w-3 shrink-0 font-extrabold text-cyan-deep">{i}</span>
                          {lv}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ═══ 3 · dominios ═══ */}
        <Section id="dominios" title="Dominios diagnósticos"
          sub="Cortes temáticos transversales sobre las mismas 52 variables">
          <p className="text-[12.5px] leading-relaxed text-muted">
            Los {DOMAINS.length} dominios ({DOMAINS.map((d) => d.name).join(", ")}) no agregan datos
            nuevos: <b className="text-ink">reagrupan las variables del instrumento</b> para responder
            preguntas de gestión («¿cómo estamos en formación docente?») sin recorrer la matriz completa.
            El puntaje del dominio es el promedio de sus variables; los datos destacados son cifras del
            diagnóstico; y los chips del pie encadenan al KPI (dorado) y a la iniciativa (cian) que
            mueven ese dominio — la cadena diagnóstico → indicador → acción.
          </p>
        </Section>

        {/* ═══ 4 · registros ═══ */}
        <Section id="registros" title="Registros calificados"
          sub="Decreto 1330 de 2019 · vigencia de 7 años">
          <div className="space-y-1.5 text-[12.5px] text-muted">
            <div className="flex items-center gap-2.5"><span className="chip chip-ok shrink-0">Vigente</span> registro activo con más de 18 meses de vigencia restante.</div>
            <div className="flex items-center gap-2.5"><span className="chip chip-warn shrink-0">Por vencer</span> vence en menos de 18 meses desde el corte: la renovación debe estar en preparación.</div>
            <div className="flex items-center gap-2.5"><span className="chip chip-cyan shrink-0">En renovación</span> trámite radicado ante el MEN.</div>
          </div>
          <div className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-muted">
            <p>
              <b className="text-ink">Autoevaluación en rojo</b> = último ejercicio en 2023 o antes
              (más de tres años al corte): insumo vencido para renovar.
            </p>
            <p>
              <b className="text-ink">Modalidad del registro</b> es la columna que sostiene el hallazgo
              central del diagnóstico: qué modalidades ampara legalmente cada registro. Un programa solo
              puede ofrecerse virtual si su registro lo incluye — y cada renovación que pase sin
              incorporarla fija la situación por 7 años más (variable AV-ORG-2).
            </p>
          </div>
        </Section>

        {/* ═══ 5 · IES ═══ */}
        <Section id="ies" title="Índices AlgoritmoT-IES (escala 0–100)"
          sub="La capa metodológica que separa lo que se percibe de lo que se puede demostrar">
          <div className="space-y-3 text-[12.5px] leading-relaxed text-muted">
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-xl bg-surface-2/70 px-4 py-3">
                <div className="label mb-1.5">Percepción</div>
                <Formula>P = (likert − 1) / 4 × 100</Formula>
                <p className="mt-1.5 text-[11.5px]">Lo que los actores creen (autodiagnóstico 1–5, normalizado).</p>
              </div>
              <div className="rounded-xl bg-surface-2/70 px-4 py-3">
                <div className="label mb-1.5">Evidencia</div>
                <Formula>E = 0,25·D + 0,35·I + 0,40·K</Formula>
                <p className="mt-1.5 text-[11.5px]">
                  D = documentación, I = implementación, K = indicadores (cada uno 0–4).
                  Pesa más el resultado que el papel.
                </p>
              </div>
              <div className="rounded-xl bg-cyan-wash/70 px-4 py-3">
                <div className="label mb-1.5">Puntuación verificada</div>
                <Formula>S = 0,40·P + 0,60·E</Formula>
                <p className="mt-1.5 text-[11.5px]">La nota que usan todos los índices: domina lo demostrable.</p>
              </div>
            </div>

            <p>
              <b className="text-ink">Brecha Δ = P − E.</b> Si |Δ| &gt; 20 hay hallazgo de gestión:
              <span className="chip chip-warn mx-1.5">Sobreestimación</span> (se cree más de lo que se puede
              demostrar) o <span className="chip chip-cyan mx-1.5">Práctica invisible</span> (existe y funciona,
              pero la comunidad no la conoce). Ninguno es un problema de tecnología: uno pide evidencia, el otro comunicación.
            </p>

            <div>
              <div className="label mb-2">Niveles 0–100</div>
              <div className="flex flex-wrap gap-2">
                {IES_LEVELS.map((l) => (
                  <span key={l.name} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white"
                    style={{ background: l.color }}>
                    {l.name} <span className="num opacity-80">{l.min}–{l.max}</span>
                  </span>
                ))}
              </div>
            </div>

            <p>
              <b className="text-ink">Índice institucional</b>{" "}
              <Formula>IIES = {[1, 2, 3, 4].map((l) => `${IIES_WEIGHTS[l].toFixed(2).replace("0.", "0,")}·M${l}`).join(" + ")}</Formula>{" "}
              — promedio ponderado de los índices de línea (M1 Formación {Math.round(IIES_WEIGHTS[1] * 100)} %,
              M2 Investigación {Math.round(IIES_WEIGHTS[2] * 100)} %, M3 Extensión {Math.round(IIES_WEIGHTS[3] * 100)} %,
              M4 Gestión {Math.round(IIES_WEIGHTS[4] * 100)} %). Pesos iniciales del informe, calibrables por la institución.
            </p>

            <p>
              <b className="text-ink">Matriz 4×7:</b> las variables también se proyectan a 7 dimensiones
              transversales ({(Object.keys(D7_META) as (keyof typeof D7_META)[]).map((k) => `${k} ${D7_META[k].short}`).join(" · ")}).
              Una celda con «—» no tiene variables en esta versión del banco: asimetría intencional, no error.
            </p>

            <p>
              <b className="text-ink">Cobertura de evidencia:</b> % de ítems con soporte suficiente
              (D≥2, I≥2, K≥1). Se muestra <b className="text-ink">siempre junto al puntaje</b>: un 80 con
              cobertura del 25 % no vale lo que un 80 con 95 %.
            </p>

            <p>
              <b className="text-ink">AIQ-IES (preparación y adopción de IA):</b> 6 componentes ponderados,
              con <b className="text-ink">salvaguardas</b> que capan el puntaje ante fallas críticas
              ({SAFEGUARDS.filter((s) => s.cap !== null).map((s) => s.id).join(", ")} capan a 59 o 39):
              el promedio no puede ocultar que no exista, por ejemplo, un inventario de sistemas de IA.
            </p>

            <div>
              <div className="label mb-2">Estados de la práctica (derivados de D/I/K)</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {PRACTICE_STATES.map((st, i) => (
                  <span key={st.key} className="flex items-center gap-1.5">
                    <span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white"
                      style={{ background: `var(--n${i + 1})` }} title={st.question}>
                      {st.label}
                    </span>
                    {i < PRACTICE_STATES.length - 1 && <span className="text-faint">→</span>}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-[11.5px]">
                Responde una pregunta distinta al nivel: no «¿qué tan maduro?», sino
                «¿existe, se usa, está articulado, demuestra resultados?». La brecha típica está en el
                salto de adopción a integración e impacto.
              </p>
            </div>

            <div>
              <div className="label mb-2">Brechas entre grupos de actores</div>
              <div className="flex flex-wrap gap-2">
                {ACTOR_GROUPS.map((g) => (
                  <span key={g.key} className="chip">
                    {g.label} · <b className="num">{Math.round(g.weight * 100)} %</b>
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-[11.5px]">
                El agregado no es promedio por cabeza: primero se promedia por grupo y luego se ponderan
                los grupos — así los estudiantes no dominan asuntos de arquitectura ni los directivos la
                experiencia de servicio. Punto verde = grupo que mejor califica; rojo = el que peor.
                Un <b>rango ≥ 2</b> entre grupos es hallazgo de disenso («Gobierno ve 4; docentes vive 2»).
              </p>
            </div>
          </div>
        </Section>

        {/* ═══ 6 · semáforos ═══ */}
        <Section id="semaforos" title="Semáforos, riesgo y prioridad"
          sub="Los umbrales que colorean indicadores, iniciativas y el motor de alertas">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-3 text-[12.5px] leading-relaxed text-muted">
              <div className="label">KPI (módulo M4)</div>
              <p>
                Semáforo por avance hacia la meta: <span className="chip chip-ok mx-1">≥ 85 %</span>
                <span className="chip chip-warn mx-1">55–84 %</span>
                <span className="chip chip-bad mx-1">&lt; 55 %</span>
              </p>
              <p>
                <b className="text-ink">Dato rezagado:</b> han pasado más de 1,5 periodos desde la última
                captura según la periodicidad del indicador (un KPI trimestral tolera 4,5 meses).
              </p>
              <p>
                <b className="text-ink">Proyección:</b> regresión lineal de la serie extendida a dic-2028
                (horizonte del roadmap). «El ritmo no alcanza» = mejora, pero la proyección no llega a la meta.
              </p>
            </div>
            <div className="space-y-3 text-[12.5px] leading-relaxed text-muted">
              <div className="label">Riesgo de iniciativas (M6)</div>
              <p>
                Puntaje 0–100 compuesto por: factores de éxito en ámbar (+7) o rojo (+18) — con racha de
                ≥ 2 revisiones el peso se multiplica por 1,6 —, desalineación presupuesto ↔ avance físico
                (ejecutar sin avanzar &gt; 25 puntos), y acciones con trimestre vencido (+6 c/u).
              </p>
              <p>
                Niveles: <b className="text-ink">Bajo</b> &lt; 15 · <b className="text-ink">Medio</b> 15–34 ·
                <b className="text-ink"> Alto</b> 35–54 · <b className="text-ink">Crítico</b> ≥ 55.
              </p>
              <div className="label pt-1">Prioridad (M5)</div>
              <p>
                <Formula>0,30·Impacto + 0,20·Urgencia + 0,15·Riesgo + 0,15·Alineación + 0,10·Factibilidad + 0,10·Dependencia</Formula>
                <span className="mt-1 block text-[11.5px]">Criterios 1–5; «dependencia» premia lo que habilita otras iniciativas.</span>
              </p>
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-surface-2/70 px-4 py-3 text-[12px] leading-relaxed text-muted">
            <b className="text-ink">Motor de alertas:</b> todas las reglas anteriores generan alertas
            tipadas con severidad 1 (crítica), 2 (advertencia) o 3 (informativa), consolidadas en el
            Panel. Nada se marca a mano: una alerta existe porque una regla la produjo, y desaparece
            cuando el dato la deja de sustentar.
          </p>
        </Section>

        {/* ═══ 7 · proyectos ═══ */}
        <Section id="proyectos" title="Gestor de proyectos"
          sub="Estados de tarea, reglas de cierre y línea base">
          <div className="mb-3 flex flex-wrap gap-2">
            {(Object.keys(TASK_STATUS_META) as (keyof typeof TASK_STATUS_META)[]).map((k) => (
              <span key={k} className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-[11.5px] font-bold text-ink-soft">
                <span className="h-2 w-2 rounded-full" style={{ background: TASK_STATUS_META[k].color }} />
                {TASK_STATUS_META[k].label}
              </span>
            ))}
          </div>
          <div className="space-y-2 text-[12.5px] leading-relaxed text-muted">
            <p><b className="text-ink">Vencida</b> = fecha compromiso pasada sin cerrar (fecha en rojo). <b className="text-ink">Próxima</b> = vence en ≤ 14 días (ámbar).</p>
            <p>
              <b className="text-ink">Reglas de cierre que el servidor exige</b> (no son sugerencias — la API
              responde 422 con la explicación): <b className="text-ink">ninguna actividad se cierra sin al menos
              una evidencia adjunta</b> (del catálogo o un archivo subido); bloquear exige registrar el motivo;
              la fecha compromiso no puede ser anterior al inicio.
            </p>
            <p>
              Cada actividad declara su <b className="text-ink">descripción</b> (qué se hace y qué produce),
              un <b className="text-ink">responsable principal</b> y los <b className="text-ink">corresponsables</b>{" "}
              que apoyan la ejecución — la carga por persona cuenta ambos roles.
            </p>
            <p>
              <b className="text-ink">Línea base:</b> el cronograma original queda congelado; cada
              reprogramación mide su desviación en días contra esa base. La base nunca se mueve — el
              deslizamiento del portafolio es la suma de las desviaciones.
            </p>
            <p>
              Toda modificación queda en la <b className="text-ink">bitácora de auditoría</b> (quién, cuándo, qué cambió),
              y cualquier rol puede comentar — editar, solo quien tiene permiso.
            </p>
          </div>
        </Section>

        {/* ═══ 8 · roles ═══ */}
        <Section id="roles" title="Roles y permisos"
          sub="El chip de acceso de cada módulo resume esta matriz — el servidor la exige, la interfaz la refleja">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[12px]">
              <thead>
                <tr className="border-b border-line-strong">
                  <th className="label pb-2 pr-4 text-left !text-[8.5px]">Acción</th>
                  {ROLES.map((r) => (
                    <th key={r.key} className="label pb-2 px-2 text-center !text-[8.5px]">{r.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(ACTION_LABEL) as Action[]).map((a) => (
                  <tr key={a} className="border-b border-line last:border-0">
                    <td className="py-2 pr-4 font-semibold text-ink">{ACTION_LABEL[a]}</td>
                    {ROLES.map((r) => {
                      const g = PERMISSION_MATRIX[a][r.key];
                      return (
                        <td key={r.key} className="px-2 py-2 text-center">
                          {g === true ? <span className="font-bold" style={{ color: "var(--ok)" }}>✓</span>
                            : g === "line" ? <span className="chip chip-cyan !py-0 !text-[9px]">Su línea</span>
                            : <span className="text-faint">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11.5px] leading-snug text-faint">
            «Su línea» = el responsable solo edita recursos de su línea misional (el servidor rechaza con 403
            lo demás). El chip de la cabecera de cada módulo — Edición completa / Edición de tu línea /
            Lectura — es el resumen de esta matriz para tu sesión.
          </p>
        </Section>

        {/* ═══ 9 · demo ═══ */}
        <Section id="demo" title="Convenciones del modo demo"
          sub="Qué significa la píldora «Datos demo» de la barra superior">
          <div className="space-y-2 text-[12.5px] leading-relaxed text-muted">
            <p>
              Todos los valores son <b className="text-ink">ilustrativos</b>: muestran cómo opera la
              plataforma con datos a escala real. La primera medición real de la UPC se produce en las
              Fases 0 a 2 de la consultoría.
            </p>
            <p>
              El «hoy» del demo está congelado en el <b className="text-ink">{DEMO_TODAY.split("-").reverse().join("/")}</b>{" "}
              (dos años dentro del roadmap) para que semáforos, rezagos y alertas sean estables y
              cuenten una historia coherente. El horizonte de proyección es dic-2028.
            </p>
            <p>
              Usuarios de prueba: consultor, líder institucional, responsable de línea (4.1) y directivo —
              cada uno ve exactamente lo que su rol permite, según la matriz de la sección anterior.
            </p>
          </div>
        </Section>
      </div>

      <p className="mt-6 text-[10.5px] leading-relaxed text-faint">
        Metodología AlgoritmoT-IES (deep-research, 2026) sobre eMM, Decreto 1330, CNA, TOGAF 10,
        DAMA-DMBOK, INTEF, ISO 27001 y CMI. Los puntos de corte son guías diagnósticas sujetas a
        calibración en pilotos. <Link href="/panel/madurez" className="font-semibold text-cyan-deep">Volver al diagnóstico →</Link>
      </p>
    </>
  );
}
