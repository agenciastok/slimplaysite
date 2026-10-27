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
    name: body.name,
    email: body.email,
    cpf: body.cpf,
    plan: body.plan,
    billing: body.billing,
    token: body.token,
    remoteip: clientIp(request),
  });
  if (!data.id) return NextResponse.json({ error: data.error ?? "save" }, { status: status || 400 });
  return NextResponse.json({
    id: data.id,
    billingType: data.billingType,
    status: data.status,
    amountCents: data.amountCents,
    days: data.days,
    invoiceUrl: data.invoiceUrl ?? "",
    pixPayload: data.pixPayload ?? "",
    pixQr: data.pixQr ?? "",
  });
}
