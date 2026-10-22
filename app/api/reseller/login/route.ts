import { NextResponse } from "next/server";
import { callReseller, resellerCookieName } from "@/lib/reseller-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "save" }, { status: 400 });
  const { status, data } = await callReseller({
    action: "login",
    email: body.email,
    password: body.password,
    token: body.token,
    answer: body.answer,
  });
  if (!data.ok || !data.session) {
    return NextResponse.json({ error: data.error ?? "credentials" }, { status: status || 401 });
  }
  const response = NextResponse.json({ ok: true, name: data.name, email: data.email, credits: data.credits });
  response.cookies.set(resellerCookieName(), data.session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
