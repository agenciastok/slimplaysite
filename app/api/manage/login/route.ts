import { NextResponse } from "next/server";
import { callManage, deviceCookieName } from "@/lib/manage-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "save" }, { status: 400 });

  const { status, data } = await callManage({
    action: "login",
    mac: body.mac,
    deviceKey: body.deviceKey,
    token: body.token,
    answer: body.answer,
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
