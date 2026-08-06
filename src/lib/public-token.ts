// Enlace público de solo lectura: token HMAC derivado del secreto del
// servidor. No expira por diseño (se comparte con Consejo Directivo y entes
// de control); rotar AUTH_SECRET lo invalida.

import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET ?? "pgtd-dev-secret-cambiar-en-produccion";

export function publicToken(slug: string): string {
  return createHmac("sha256", SECRET).update(`public:${slug}`).digest("base64url").slice(0, 24);
}

export function verifyPublicToken(slug: string, token: string): boolean {
  const expected = publicToken(slug);
  const a = Buffer.from(token), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
