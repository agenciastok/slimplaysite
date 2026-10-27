import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callReseller, resellerCookieName } from "@/lib/reseller-server";

export const dynamic = "force-dynamic";

const actions = new Set(["dashboard", "devices", "activate", "subs", "create-sub", "buy-credits", "credit-status"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.action !== "string" || !actions.has(body.action)) {
    return NextResponse.json({ error: "save" }, { status: 400 });
  }
  const jar = await cookies();
  const session = jar.get(resellerCookieName())?.value ?? "";
  const { status, data } = await callReseller(body, session);
  if (!data.ok) return NextResponse.json({ error: data.error ?? "save" }, { status: status || 400 });
  return NextResponse.json(data);
}
