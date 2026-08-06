import { NextResponse } from "next/server";
import { guard } from "../_helpers";
import { TASKS, PEOPLE } from "@/data/proyectos";
import { taskAlerts, workload, portfolioTaskStats } from "@/lib/proyectos";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json({
    tasks: TASKS,
    people: PEOPLE,
    alerts: taskAlerts(),
    workload: workload(),
    stats: portfolioTaskStats(),
  });
}
