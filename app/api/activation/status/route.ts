import { NextResponse } from "next/server";
import { callActivation } from "@/lib/activation-server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "save" }, { status: 400 });
  const { status, data } = await callActivation({ action: "status", id });
  if (!data.id) return NextResponse.json({ error: data.error ?? "save" }, { status: status || 404 });
  return NextResponse.json({
    id: data.id,
    mac: data.mac ?? "",
    status: data.status,
    billingType: "pix",
    amountCents: data.amountCents,
    days: data.days,
    pixPayload: data.pixPayload ?? "",
    pixQr: data.pixQr ?? "",
    pixExpiresAt: data.pixExpiresAt ?? "",
    history: Array.isArray(data.history) ? data.history : [],
  });
}
