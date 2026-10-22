import { NextResponse } from "next/server";
import { callActivation } from "@/lib/activation-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data } = await callActivation({ action: "plans" });
  if (data.error) return NextResponse.json({ configured: false, plans: [], error: data.error });
  return NextResponse.json({ configured: Boolean(data.configured), plans: data.plans ?? [] });
}
