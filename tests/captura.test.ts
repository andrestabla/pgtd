// Pruebas de la captura y publicación de la medición A3 (node:test + tsx).
// Reglas: percepción por línea (responsable) vs. calificación (consultor),
// rangos validados, publicación exige 52 niveles y conmuta la medición
// vigente del motor; reset restaura el seed (A2).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  captureVariable, captureProgress, publishCapture, resetStore,
  effectiveCurrent, effectivePrevious, publishedAssessment,
} from "../src/server/store";
import { maturityRollup } from "../src/lib/logic";
import { VARIABLES } from "../src/data/instrument";
import type { SessionUser } from "../src/lib/session";

const consultor: SessionUser = { email: "c@a.co", name: "Consultor", role: "CONSULTOR" };
const resp1: SessionUser = { email: "r@u.co", name: "Resp Academia", role: "RESPONSABLE", line: 1 };
const directivo: SessionUser = { email: "d@u.co", name: "Rectoría", role: "DIRECTIVO" };

test("captura: permisos por rol y por línea", () => {
  resetStore();

  // directivo no captura
  const d = captureVariable(directivo, "AV-ORG-1", { perception: 3 });
  assert.ok(!d.ok && d.status === 403);

  // responsable captura percepción de SU línea
  const ok = captureVariable(resp1, "AV-ORG-1", { perception: 3 });
  assert.ok(ok.ok);

  // …pero no de otra línea
  const otra = captureVariable(resp1, "IN-ORG-1", { perception: 3 });
  assert.ok(!otra.ok && otra.status === 403);

  // …ni califica D/I/K o nivel (independencia del consultor)
  const grade = captureVariable(resp1, "AV-ORG-1", { level: 3 });
  assert.ok(!grade.ok && grade.status === 403);

  // el consultor califica todo
  const full = captureVariable(consultor, "AV-ORG-1", { d: 2, i: 1, k: 0, level: 2 });
  assert.ok(full.ok);
});

test("captura: rangos validados", () => {
  resetStore();
  const p = captureVariable(consultor, "AV-ORG-1", { perception: 6 });
  assert.ok(!p.ok && p.status === 422);
  const k = captureVariable(consultor, "AV-ORG-1", { k: 5 });
  assert.ok(!k.ok && k.status === 422);
  const lvl = captureVariable(consultor, "AV-ORG-1", { level: 0 });
  assert.ok(!lvl.ok && lvl.status === 422);
  const nope = captureVariable(consultor, "XX-999", { perception: 3 });
  assert.ok(!nope.ok && nope.status === 404);
});

test("publicar: exige 52 niveles, conmuta la medición vigente y respeta la regla de celda", async () => {
  resetStore();
  assert.equal(effectiveCurrent().id, "A2");

  // publicar sin captura → 422 con conteo
  const early = publishCapture(consultor);
  assert.ok(!early.ok && early.status === 422 && early.error.includes("52"));

  // el responsable no publica
  const noAuth = publishCapture(resp1);
  assert.ok(!noAuth.ok && noAuth.status === 403);

  // calificar las 52 (nivel = valor del diagnóstico + señales de mejora en la línea 1)
  for (const v of VARIABLES) {
    const level = v.line === 1 ? Math.min(5, v.value + 1) : v.value;
    const r = captureVariable(consultor, v.id, { level, perception: v.perception, d: v.evidence.d, i: v.evidence.i, k: v.evidence.k });
    assert.ok(r.ok, v.id);
  }
  assert.equal(captureProgress().level, 52);

  const pub = publishCapture(consultor);
  assert.ok(pub.ok);
  assert.ok(publishedAssessment());
  assert.equal(effectiveCurrent().id, "A3");
  assert.equal(effectivePrevious()?.id, "A2");

  // regla del instrumento: celda = promedio simple de sus variables
  const cell = effectiveCurrent().scores![1].organizacional;
  const vars = VARIABLES.filter((v) => v.line === 1 && v.dimension === "organizacional");
  const expected = vars.reduce((a, v) => a + Math.min(5, v.value + 1), 0) / vars.length;
  assert.equal(cell.value, Math.round(expected * 10) / 10);

  // el rollup del motor lee el corte publicado
  const roll = maturityRollup();
  assert.equal(roll.assessment.id, "A3");
  assert.equal(roll.previous?.id, "A2");
  assert.equal(roll.history.length, 3);

  // la captura queda cerrada tras publicar
  const closed = captureVariable(consultor, "AV-ORG-1", { level: 4 });
  assert.ok(!closed.ok && closed.status === 422);

  // reset restaura el seed
  resetStore();
  assert.equal(effectiveCurrent().id, "A2");
  assert.equal(captureProgress().level, 0);
});
