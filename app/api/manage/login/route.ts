import { NextResponse } from "next/server";
import { clientIp } from "@/lib/client-ip";
import { callManage, deviceCookieName } from "@/lib/manage-server";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "save" }, { status: 400 });
  if (!(await verifyTurnstile(body.token, "login", clientIp(request)))) {
    return NextResponse.json({ error: "captcha" }, { status: 403 });
  }

  const { status, data } = await callManage({
    action: "login",
    mac: body.mac,
    deviceKey: body.deviceKey,
    token: body.token,
    remoteip: clientIp(request),
  });

  if (!data.ok || !data.session || !data.mac) {
    return NextResponse.json({ error: data.error ?? "credentials" }, { status: status || 401 });
  }

  const response = NextResponse.json({ ok: true, mac: data.mac });
  response.cookies.set(deviceCookieName(), data.session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
