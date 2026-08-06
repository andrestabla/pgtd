// Pruebas del protocolo de indagación (node:test + tsx).
// Garantizan que las 52 variables tienen protocolo completo y coherente:
// ítems con audiencia válida, evidencia D/I/K exacta y rúbrica de 5 niveles.

import { test } from "node:test";
import assert from "node:assert/strict";

import { VARIABLES } from "../src/data/instrument";
import { PROTOCOLS, DIK_ANCHORS, protocolStats } from "../src/data/protocolo";
import { ACTOR_GROUPS } from "../src/data/actores";

test("toda variable del instrumento tiene protocolo completo", () => {
  for (const v of VARIABLES) {
    const p = PROTOCOLS[v.id];
    assert.ok(p, `variable sin protocolo: ${v.id}`);
    assert.ok(p.items.length >= 2 && p.items.length <= 4,
      `${v.id}: se esperan 2–4 ítems, hay ${p.items.length}`);
    assert.equal(p.rubric.length, 5, `${v.id}: la rúbrica debe tener 5 niveles`);
  }
});

test("no hay protocolos huérfanos (sin variable)", () => {
  const ids = new Set(VARIABLES.map((v) => v.id));
  for (const key of Object.keys(PROTOCOLS)) {
    assert.ok(ids.has(key), `protocolo sin variable: ${key}`);
  }
});

test("cada protocolo solicita evidencia D, I y K exactamente una vez", () => {
  for (const [id, p] of Object.entries(PROTOCOLS)) {
    const comps = p.evidence.map((e) => e.component).sort().join("");
    assert.equal(comps, "DIK", `${id}: componentes de evidencia ${comps}`);
  }
});

test("las audiencias de los ítems son grupos de actores válidos", () => {
  const valid = new Set(ACTOR_GROUPS.map((g) => g.key));
  for (const [id, p] of Object.entries(PROTOCOLS)) {
    for (const it of p.items) {
      assert.ok(it.audiences.length > 0, `${id}: ítem sin audiencia`);
      for (const a of it.audiences) {
        assert.ok(valid.has(a), `${id}: audiencia inválida «${a}»`);
      }
    }
  }
});

test("cada protocolo incluye al menos un ítem Likert (fuente de la percepción P)", () => {
  for (const [id, p] of Object.entries(PROTOCOLS)) {
    assert.ok(p.items.some((it) => it.type === "likert"),
      `${id}: sin ítem Likert para capturar percepción`);
  }
});

test("textos del protocolo no vacíos", () => {
  for (const [id, p] of Object.entries(PROTOCOLS)) {
    for (const it of p.items) assert.ok(it.text.trim().length > 10, `${id}: ítem vacío`);
    for (const e of p.evidence) {
      assert.ok(e.what.trim().length > 10, `${id}: solicitud vacía`);
      assert.ok(e.criterio.trim().length > 10, `${id}: criterio vacío`);
    }
    for (const r of p.rubric) assert.ok(r.trim().length > 10, `${id}: descriptor de rúbrica vacío`);
  }
});

test("anclas D/I/K con 5 niveles (0–4)", () => {
  for (const c of ["D", "I", "K"] as const) {
    assert.equal(DIK_ANCHORS[c].levels.length, 5, `ancla ${c}`);
  }
});

test("las estadísticas del banco cuadran con el contenido", () => {
  const s = protocolStats();
  assert.equal(s.protocols, VARIABLES.length);
  assert.equal(s.evidenceRequests, VARIABLES.length * 3);
  assert.ok(s.items >= VARIABLES.length * 2);
});
