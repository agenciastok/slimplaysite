import { NextResponse } from "next/server";
import { callManage } from "@/lib/manage-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { status, data } = await callManage({ action: "captcha" });
  if (!data.question || !data.token) {
    return NextResponse.json({ error: data.error ?? "config" }, { status: status || 500 });
  }
  return NextResponse.json({ question: data.question, token: data.token });
}
