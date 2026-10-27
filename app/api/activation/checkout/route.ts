import { NextResponse } from "next/server";
import { clientIp } from "@/lib/client-ip";
import { callActivation } from "@/lib/activation-server";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 8_000) return NextResponse.json({ error: "save" }, { status: 413 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "save" }, { status: 400 });
  if (!(await verifyTurnstile(body.token, "activation", clientIp(request)))) {
    return NextResponse.json({ error: "captcha" }, { status: 403 });
  }
  const { status, data } = await callActivation({
    action: "checkout",
    mac: body.mac,
    token: body.token,
    remoteip: clientIp(request),
  });
  if (!data.id) return NextResponse.json({ error: data.error ?? "save" }, { status: status || 400 });
  return NextResponse.json({
    id: data.id,
    mac: data.mac ?? "",
    billingType: "pix",
    status: data.status,
    amountCents: data.amountCents,
    days: data.days,
    pixPayload: data.pixPayload ?? "",
    pixQr: data.pixQr ?? "",
    pixExpiresAt: data.pixExpiresAt ?? "",
    history: [],
  });
}
