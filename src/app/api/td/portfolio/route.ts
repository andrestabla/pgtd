import { NextResponse } from "next/server";
import { guard } from "../_helpers";
import { PROGRAMS, MUNI_ENROLLMENT, portfolioStats } from "@/data/portfolio";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json({
    programs: PROGRAMS,
    muniEnrollment: MUNI_ENROLLMENT,
    stats: portfolioStats(),
  });
}
