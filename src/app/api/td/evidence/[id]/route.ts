import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifyEvidence } from "@/server/store";

// PATCH /api/td/evidence/:id — verificación (solo CONSULTOR).
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { id } = await params;
  const result = await verifyEvidence(user, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ status: result.status });
}
