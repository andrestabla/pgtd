import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { updateTask, getAudit, hydrateFromDb } from "@/server/store";

// PATCH /api/td/tasks/:id — estado, fechas, responsable, nota.
// El permiso se exige en el store (403 con explicación); las reglas de
// negocio devuelven 422 con el motivo exacto.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  await hydrateFromDb();

  const { id } = await params;
  const patch = await req.json().catch(() => null);
  if (!patch) return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });

  const result = await updateTask(user, id, patch);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ task: result.task, audit: getAudit(id).slice(0, 5) });
}

// DELETE /api/td/tasks/:id — archiva la tarea (no destruye: queda en el
// archivo con su auditoría). Rechaza si otras tareas dependen de ella.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  await hydrateFromDb();

  const { id } = await params;
  const { archiveTask } = await import("@/server/store");
  const result = archiveTask(user, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ archived: result.task.id });
}
