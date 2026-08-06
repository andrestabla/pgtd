// Pruebas de la escritura en KPI e iniciativas (node:test + tsx).
// report_kpi y edit_initiatives: permisos por línea, validaciones y el
// efecto sobre el motor (serie efectiva, riesgo con nueva revisión).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  reportKpi, effectiveKpiSeries, updateInitiative, effectiveInitiatives, resetStore,
} from "../src/server/store";
import { kpiHealth, initiativeRisk } from "../src/lib/logic";
import { KPI_CATALOG, INITIATIVES_FULL } from "../src/data/cmi";
import type { SessionUser } from "../src/lib/session";

const consultor: SessionUser = { email: "c@a.co", name: "Consultor", role: "CONSULTOR" };
const resp1: SessionUser = { email: "r@u.co", name: "Resp Academia", role: "RESPONSABLE", line: 1 };
const directivo: SessionUser = { email: "d@u.co", name: "Rectoría", role: "DIRECTIVO" };

test("kpi: reporte con permisos por línea y validaciones", () => {
  resetStore();
  const k = KPI_CATALOG.find((x) => x.code === "AV-01")!;   // línea 1
  const otro = KPI_CATALOG.find((x) => x.line !== 1)!;

  // directivo no reporta; responsable solo su línea
  assert.ok(!(reportKpi(directivo, "AV-01", "2027-T2", 50) as { ok: boolean }).ok);
  const fuera = reportKpi(resp1, otro.code, "2027-T2", 10);
  assert.ok(!fuera.ok && fuera.status === 403);

  // validaciones
  assert.ok(!(reportKpi(resp1, "AV-01", "T2-2027", 50) as { ok: boolean }).ok, "periodo inválido");
  assert.ok(!(reportKpi(resp1, "AV-01", "2027-T2", -5) as { ok: boolean }).ok, "valor negativo");
  const viejo = reportKpi(resp1, "AV-01", "2020", 10);
  assert.ok(!viejo.ok && viejo.status === 422, "no se reescribe la serie histórica");

  // reporte válido del responsable de la línea
  const before = k.series.length;
  const r = reportKpi(resp1, "AV-01", "2027-T2", 55, "corte del LMS");
  assert.ok(r.ok);
  const serie = effectiveKpiSeries("AV-01");
  assert.equal(serie.length, before + 1);
  assert.equal(serie[serie.length - 1].value, 55);

  // el motor lee la serie efectiva
  const h = kpiHealth({ ...k, series: serie });
  assert.equal(h.latest, 55);
  assert.equal(h.latestPeriod, "2027-T2");

  // corrección del mismo periodo: reemplaza, no duplica
  const r2 = reportKpi(consultor, "AV-01", "2027-T2", 57);
  assert.ok(r2.ok);
  assert.equal(effectiveKpiSeries("AV-01").length, before + 1);
  assert.equal(effectiveKpiSeries("AV-01").at(-1)!.value, 57);
  resetStore();
});

test("iniciativas: edición con permisos, revisión de factores y bitácora", () => {
  resetStore();
  const i5 = INITIATIVES_FULL.find((i) => i.id === "i5")!;   // línea 4

  // responsable de otra línea no edita
  const fuera = updateInitiative(resp1, "i5", { progress: 10 });
  assert.ok(!fuera.ok && fuera.status === 403);
  // directivo no edita
  assert.ok(!(updateInitiative(directivo, "i5", { progress: 10 }) as { ok: boolean }).ok);

  // validaciones
  assert.ok(!(updateInitiative(consultor, "i5", { progress: 140 }) as { ok: boolean }).ok);
  assert.ok(!(updateInitiative(consultor, "i5", { factor: { name: "no-existe", state: "ROJO" } }) as { ok: boolean }).ok);
  assert.ok(!(updateInitiative(consultor, "i5", {}) as { ok: boolean }).ok, "nada que actualizar");

  // avance + bitácora + hito
  const up = updateInitiative(consultor, "i5", {
    progress: 12,
    log: { type: "HITO", text: "Arquitectura de referencia aprobada por el comité TIC" },
    nextMilestone: { date: "2027-04", text: "Decisión de vigencias futuras" },
  });
  assert.ok(up.ok);
  const eff = effectiveInitiatives().find((i) => i.id === "i5")!;
  assert.equal(eff.progress, 12);
  assert.equal(eff.log.length, i5.log.length + 1);
  assert.equal(eff.nextMilestone.text, "Decisión de vigencias futuras");

  // revisión de factor: el estado previo pasa al historial (alimenta la racha)
  const factor = i5.factors[0];
  const rev = updateInitiative(consultor, "i5", {
    factor: { name: factor.name, state: "ROJO", note: "sigue sin partida" },
  });
  assert.ok(rev.ok);
  const eff2 = effectiveInitiatives().find((i) => i.id === "i5")!;
  const f2 = eff2.factors.find((f) => f.name === factor.name)!;
  assert.equal(f2.state, "ROJO");
  assert.equal(f2.history.length, factor.history.length + 1);
  assert.equal(f2.history.at(-1), factor.state);

  // el riesgo recalcula sobre la iniciativa efectiva
  const risk = initiativeRisk(eff2);
  assert.ok(risk.score >= initiativeRisk(i5).score - 20, "riesgo coherente");

  resetStore();
  assert.equal(effectiveInitiatives().find((i) => i.id === "i5")!.progress, i5.progress);
});

/* ─── crear/archivar tareas y cascada ─── */

import {
  createTask, archiveTask, cascadePreview, applyCascade, getTask, deviationDays,
} from "../src/server/store";

test("tareas: creación validada, archivo con dependientes y cascada", () => {
  resetStore();

  // validaciones de la creación
  assert.ok(!(createTask(consultor, { iniId: "no", title: "x", desc: "x", assigneeId: "P01", start: "2027-03-01", due: "2027-03-10" }) as { ok: boolean }).ok);
  assert.ok(!(createTask(consultor, { iniId: "i2", title: "corta", desc: "descripción suficientemente larga aquí", assigneeId: "P01", start: "2027-03-01", due: "2027-03-10" }) as { ok: boolean }).ok, "título corto");
  assert.ok(!(createTask(resp1, { iniId: "i2", title: "Tarea de otra línea válida", desc: "descripción suficientemente larga aquí", assigneeId: "P01", start: "2027-03-01", due: "2027-03-10" }) as { ok: boolean }).ok, "línea ajena");

  // creación válida: id secuencial y línea base congelada
  const c = createTask(consultor, {
    iniId: "i2", title: "Taller de dueños de dato",
    desc: "Sesión con decanaturas para designar dueños; produce el acta.",
    assigneeId: "P10", start: "2027-03-12", due: "2027-03-26", dependsOn: ["T-i2-04"],
  });
  assert.ok(c.ok);
  assert.equal(c.task.id, "T-i2-08");
  assert.equal(deviationDays(c.task), 0);

  // archivar: bloqueado si hay dependientes
  const blocked = archiveTask(consultor, "T-i2-04");
  assert.ok(!blocked.ok && blocked.status === 422 && blocked.error.includes("T-i2-08"));
  const arch = archiveTask(consultor, "T-i2-08");
  assert.ok(arch.ok);
  assert.equal(getTask("T-i2-08"), null);

  // cascada: preview transitiva y aplicación con desviación medida
  const pv = cascadePreview("T-i9-03", "2027-03-14");
  assert.ok(pv.ok);
  assert.equal(pv.delta, 7);
  assert.deepEqual(pv.shifts.map((s) => s.id).sort(), ["T-i9-05", "T-i9-06", "T-i9-07"]);

  const ap = applyCascade(consultor, "T-i9-03", "2027-03-14");
  assert.ok(ap.ok && ap.shifted === 4);
  assert.equal(getTask("T-i9-05")!.due, "2027-05-02");
  assert.equal(deviationDays(getTask("T-i9-05")!), 7);

  // el responsable de línea 1 no aplica cascadas de la línea 1 si tocan… su línea sí puede:
  const pv2 = cascadePreview("T-i9-03", "2027-03-21");
  assert.ok(pv2.ok);

  resetStore();
  assert.equal(getTask("T-i9-05")!.due, "2027-04-25");
});
