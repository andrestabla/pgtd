import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** Todas las rutas /api/td/* exigen sesión. */
export async function guard() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return null;
}
