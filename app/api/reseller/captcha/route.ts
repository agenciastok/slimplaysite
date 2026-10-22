import { NextResponse } from "next/server";
import { callReseller } from "@/lib/reseller-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { status, data } = await callReseller({ action: "captcha" });
  if (!data.question || !data.token) {
    return NextResponse.json({ error: data.error ?? "config" }, { status: status || 500 });
  }
  return NextResponse.json({ question: data.question, token: data.token });
}
