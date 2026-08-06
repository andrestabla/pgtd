import { NextResponse } from "next/server";
import { guard } from "../_helpers";
import { KPI_CATALOG, responsible } from "@/data/cmi";
import { kpiHealth } from "@/lib/logic";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json({
    kpis: KPI_CATALOG.map((k) => ({
      ...k,
      owner: responsible(k.ownerId),
      health: kpiHealth(k),
    })),
  });
}
