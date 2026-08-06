import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { cascadePreview, applyCascade, hydrateFromDb } from "@/server/store";

// POST /api/td/tasks/:id/cascade — reprogramación en cadena.
// { due } → vista previa de las dependientes afectadas.
// { due, apply: true } → aplica el corrimiento (permiso sobre todas las
// líneas tocadas; el deslizamiento se sigue midiendo contra la línea base).
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  await hydrateFromDb();

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.due) return NextResponse.json({ error: "Falta la nueva fecha compromiso" }, { status: 400 });

  if (body.apply) {
    const result = applyCascade(user, id, body.due);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  }
  const preview = cascadePreview(id, body.due);
  if (!preview.ok) return NextResponse.json({ error: preview.error }, { status: preview.status });
  return NextResponse.json(preview);
}
