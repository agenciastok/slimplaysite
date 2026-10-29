import { NextResponse } from "next/server";
import { clientIp } from "@/lib/client-ip";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

function cleanName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80 || /[\u0000-\u001f]/.test(name)) return null;
  return name;
}

function cleanEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 6 || email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function cleanMessage(value: unknown) {
  if (typeof value !== "string") return null;
  const message = value.trim().replace(/\r\n/g, "\n");
  if (message.length < 10 || message.length > 2000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(message)) return null;
  return message;
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 8_000) return NextResponse.json({ error: "save" }, { status: 413 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "save" }, { status: 400 });
  if (!(await verifyTurnstile(body.token, "contact", clientIp(request)))) {
    return NextResponse.json({ error: "captcha" }, { status: 403 });
  }

  const name = cleanName(body.name);
  const email = cleanEmail(body.email);
  const message = cleanMessage(body.message);
  if (!name) return NextResponse.json({ error: "name" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "email" }, { status: 400 });
  if (!message) return NextResponse.json({ error: "message" }, { status: 400 });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "save" }, { status: 500 });

  const response = await fetch(`${url}/functions/v1/contact-message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, message }),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!response.ok || !data?.ok) {
    return NextResponse.json({ error: data?.error ?? "save" }, { status: response.status || 500 });
  }
  return NextResponse.json({ ok: true });
}
