import { NextResponse } from "next/server";
import { guard } from "../_helpers";
import { executiveSummary } from "@/lib/logic";

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json(executiveSummary());
}
