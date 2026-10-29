import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
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

function cleanMessage(value: string) {
  const message = value.trim().replace(/\r\n/g, "\n");
  if (message.length < 10 || message.length > 2000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(message)) return null;
  return message;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "save" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !secret) return json({ error: "config" }, 500);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return json({ error: "save" }, 400);
  const name = cleanName(typeof body.name === "string" ? body.name : "");
  const email = cleanEmail(typeof body.email === "string" ? body.email : "");
  const message = cleanMessage(typeof body.message === "string" ? body.message : "");
  if (!name) return json({ error: "name" }, 400);
  if (!email) return json({ error: "email" }, 400);
  if (!message) return json({ error: "message" }, 400);

  const admin = createClient(supabaseUrl, secret, { auth: { persistSession: false } });
  const { error } = await admin.from("contact_messages").insert({ name, email, message });
  if (error) return json({ error: "save" }, 500);
  return json({ ok: true });
});
