import { NextResponse } from "next/server";
import { callActivation } from "@/lib/activation-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { status, data } = await callActivation({ action: "captcha" });
  if (!data.question || !data.token) {
    return NextResponse.json({ error: data.error ?? "unavailable" }, { status: status || 503 });
  }
  return NextResponse.json({ question: data.question, token: data.token });
}
