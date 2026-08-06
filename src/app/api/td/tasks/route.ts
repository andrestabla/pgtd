import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { PEOPLE } from "@/data/proyectos";
import { getTasks, getAudit, getEvidenceStatus, hydrateFromDb } from "@/server/store";
import { taskAlerts, workload, portfolioTaskStats } from "@/lib/proyectos";
import { can } from "@/lib/permissions";
import { INITIATIVES_FULL, EVIDENCE_CATALOG } from "@/data/cmi";

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  await hydrateFromDb();
  // por tarea, si ESTE usuario puede editarla (la UI refleja lo que el servidor exige)
  const editable = Object.fromEntries(
    getTasks().map((t) => {
      const ini = INITIATIVES_FULL.find((i) => i.id === t.iniId)!;
      return [t.id, can(user, "edit_tasks", ini.line)];
    }),
  );
  return NextResponse.json({
    tasks: getTasks(),
    people: PEOPLE,
    alerts: taskAlerts(),
    workload: workload(),
    stats: portfolioTaskStats(),
    audit: getAudit().slice(0, 20),
    editable,
    canVerifyEvidence: can(user, "verify_evidence"),
    evidenceStatus: Object.fromEntries(EVIDENCE_CATALOG.map((e) => [e.id, getEvidenceStatus(e.id)])),
  });
}
