// Pruebas del módulo de administración: integraciones y branding.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  setIntegration, getIntegrationsMasked, setBranding, getBranding,
  createUser, updateUser, resetStore,
} from "../src/server/store";
import type { SessionUser } from "../src/lib/session";

const admin: SessionUser = { email: "admin@algoritmot.com", name: "Admin", role: "ADMIN" };
const consultor: SessionUser = { email: "consultor@algoritmot.com", name: "Consultor", role: "CONSULTOR" };
const lider: SessionUser = { email: "l@u.co", name: "Líder", role: "LIDER" };

test("integraciones: permisos, validación por formato y enmascarado", () => {
  resetStore();

  // solo el admin de la plataforma (el consultor tampoco)
  assert.ok(!(setIntegration(lider, "openai", { fields: { apiKey: "sk-abcdefghijklmnopqrstu", model: "gpt-4o-mini" } }) as { ok: boolean }).ok);
  assert.ok(!(setIntegration(consultor, "openai", { fields: { apiKey: "sk-abcdefghijklmnopqrstu", model: "gpt-4o-mini" } }) as { ok: boolean }).ok);

  // formato inválido → 422
  const bad = setIntegration(admin, "openai", { fields: { apiKey: "invalida", model: "gpt-4o-mini" } });
  assert.ok(!bad.ok && bad.status === 422);
  const badSes = setIntegration(admin, "ses", { fields: { region: "narnia", accessKeyId: "AKIAABCDEFGHIJKLMNOP", secretAccessKey: "x", sender: "a@b.co" } });
  assert.ok(!badSes.ok && badSes.status === 422);

  // no se activa incompleta
  const early = setIntegration(admin, "r2", { enabled: true });
  assert.ok(!early.ok && early.status === 422);

  // configuración válida → enmascarada al leer y activable
  const okCfg = setIntegration(admin, "openai", { fields: { apiKey: "sk-abcdefghijklmnopqrstu1234", model: "gpt-4o-mini" } });
  assert.ok(okCfg.ok);
  const masked = getIntegrationsMasked().find((i) => i.key === "openai")!;
  assert.ok(masked.configured);
  const keyField = masked.fields.find((f) => f.key === "apiKey")!;
  assert.ok(keyField.value.startsWith("•") && keyField.value.endsWith("1234"));
  assert.ok(!keyField.value.includes("sk-"), "el secreto nunca vuelve completo");

  assert.ok((setIntegration(admin, "openai", { enabled: true }) as { ok: boolean }).ok);
  assert.ok(getIntegrationsMasked().find((i) => i.key === "openai")!.enabled);

  // reenviar la máscara no pisa el secreto guardado
  const remask = setIntegration(admin, "openai", { fields: { apiKey: keyField.value } });
  assert.ok(remask.ok);
  assert.ok(getIntegrationsMasked().find((i) => i.key === "openai")!.configured);
  resetStore();
  assert.ok(!getIntegrationsMasked().find((i) => i.key === "openai")!.configured);
});

test("branding: validaciones y aplicación", () => {
  resetStore();
  assert.ok(!(setBranding(consultor, { shortName: "UPC" }) as { ok: boolean }).ok);
  assert.ok(!(setBranding(admin, { accent: "azul" }) as { ok: boolean }).ok);
  assert.ok(!(setBranding(admin, { shortName: "u" }) as { ok: boolean }).ok);

  const ok = setBranding(admin, { shortName: "upc", accent: "#7c5cd6", tagline: "Territorio digital" });
  assert.ok(ok.ok);
  const b = getBranding();
  assert.equal(b.shortName, "UPC");
  assert.equal(b.accent, "#7c5cd6");
  resetStore();
  assert.equal(getBranding().accent, null);
});

test("usuarios: el flujo de administración sigue íntegro tras el módulo", () => {
  resetStore();
  const c = createUser(consultor, { email: "x@u.co", name: "Persona Prueba", role: "DIRECTIVO" });
  assert.ok(c.ok);
  const upd = updateUser(consultor, "x@u.co", { active: false });
  assert.ok(upd.ok);
  resetStore();
});
