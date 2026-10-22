import { NextResponse } from "next/server";
import { deviceCookieName } from "@/lib/manage-server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(deviceCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
