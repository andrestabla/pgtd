import { NextResponse } from "next/server";
import { guard } from "../_helpers";
import { INITIATIVES_FULL, responsible } from "@/data/cmi";
import { initiativeRisk } from "@/lib/logic";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json({
    initiatives: INITIATIVES_FULL.map((i) => ({
      ...i,
      owner: responsible(i.ownerId),
      risk: initiativeRisk(i),
    })),
  });
}
