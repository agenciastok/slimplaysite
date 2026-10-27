import { NextResponse } from "next/server";
import { clientIp } from "@/lib/client-ip";
import { verifyTurnstile } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

const MAX_BODY = 600_000;

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

async function forward(body: string) {
  const env = config();
  if (!env) return NextResponse.json({ error: "config" }, { status: 500 });

  const response = await fetch(`${env.url}/functions/v1/save-playlist`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.key}`,
      apikey: env.key,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
  if (!response.ok) {
    return NextResponse.json({ error: data?.error ?? "save" }, { status: response.status });
  }
  return NextResponse.json(data ?? { ok: true });
}

export async function GET() {
  return forward(JSON.stringify({ action: "captcha" }));
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: "file" }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "save" }, { status: 400 });
  }
  body.remoteip = clientIp(request);
  if (!(await verifyTurnstile(body.token, "upload", String(body.remoteip)))) {
    return NextResponse.json({ error: "captcha" }, { status: 403 });
  }
  return forward(JSON.stringify(body));
}
