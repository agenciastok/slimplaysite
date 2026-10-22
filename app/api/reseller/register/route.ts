import { NextResponse } from "next/server";
import { resellerCookieName } from "@/lib/reseller-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 8_000) return NextResponse.json({ error: "save" }, { status: 413 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "save" }, { status: 400 });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "config" }, { status: 500 });
  const response = await fetch(`${url}/functions/v1/reseller-register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      token: body.token,
      answer: body.answer,
    }),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string; session?: string; name?: string; email?: string; credits?: number } | null;
  if (!data?.ok || !data.session) {
    return NextResponse.json({ error: data?.error ?? "save" }, { status: response.status || 400 });
  }
  const result = NextResponse.json({ ok: true, name: data.name, email: data.email, credits: data.credits });
  result.cookies.set(resellerCookieName(), data.session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return result;
}
