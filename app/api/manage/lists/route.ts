import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { callManage, deviceCookieName } from "@/lib/manage-server";

export const dynamic = "force-dynamic";

async function session() {
  const jar = await cookies();
  return jar.get(deviceCookieName())?.value ?? "";
}

function denied(status: number, error?: string) {
  return NextResponse.json({ error: error ?? "session" }, { status: status || 401 });
}

export async function GET() {
  const { status, data } = await callManage({ action: "lists" }, await session());
  if (!data.ok) return denied(status, data.error);
  return NextResponse.json({ mac: data.mac, lists: data.lists ?? [] });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "save" }, { status: 400 });
  const { status, data } = await callManage({ ...body, action: "create" }, await session());
  if (!data.ok) return denied(status, data.error);
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "save" }, { status: 400 });
  const { status, data } = await callManage({ ...body, action: "update" }, await session());
  if (!data.ok) return denied(status, data.error);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: number } | null;
  const { status, data } = await callManage({ action: "delete", id: body?.id }, await session());
  if (!data.ok) return denied(status, data.error);
  return NextResponse.json({ ok: true });
}
