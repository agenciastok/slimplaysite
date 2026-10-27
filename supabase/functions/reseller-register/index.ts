import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SESSION_MS = 12 * 60 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function fail(error: string, status = 400) {
  return json({ error }, status);
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return diff === 0;
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, key, 256);
  return `pbkdf2$120000$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(bits))}`;
}

async function issueSession(secret: string, id: string, passwordHash: string) {
  const pass = (await hmac(secret, passwordHash)).slice(0, 32);
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ id, exp: Date.now() + SESSION_MS, pass })));
  return `${payload}.${await hmac(secret, payload)}`;
}

function cleanName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80 || /[\u0000-\u001f]/.test(name)) return null;
  return name;
}

function cleanEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (email.length < 6 || email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return fail("save", 405);
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!secret || !supabaseUrl) return fail("config", 500);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("save");
  const name = cleanName(typeof body.name === "string" ? body.name : "");
  const email = cleanEmail(typeof body.email === "string" ? body.email : "");
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 30) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!name) return fail("name");
  if (!email) return fail("email");
  if (phone.replace(/\D/g, "").length < 8) return fail("phone");
  if (password.length < 8 || password.length > 72) return fail("password");

  const admin = createClient(supabaseUrl, secret, { auth: { persistSession: false } });
  const { data: existing } = await admin.from("resellers").select("id").eq("email", email).maybeSingle();
  if (existing) return fail("email");
  const passwordHash = await hashPassword(password);
  const { data: created, error } = await admin
    .from("resellers")
    .insert({ name, email, phone, password_hash: passwordHash, credits: 0 })
    .select("id, name, email, credits")
    .single();
  const code = error && "code" in error ? String(error.code) : "";
  if (error || !created) return fail(code === "23505" ? "email" : "save", code === "23505" ? 400 : 500);
  return json({
    ok: true,
    name: created.name,
    email: created.email,
    credits: created.credits,
    session: await issueSession(secret, created.id, passwordHash),
  });
});
