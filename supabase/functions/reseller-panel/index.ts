import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reseller-session",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SESSION_MS = 12 * 60 * 60 * 1000;
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function fail(error: string, status = 400) {
  return json({ error }, status);
}

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return diff === 0;
}

function hexToBytes(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  return bytes;
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 120_000, hash: "SHA-256" }, key, 256);
  return `pbkdf2$120000$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(bits))}`;
}

async function passwordMatches(password: string, stored: string) {
  const [scheme, rounds, saltHex, hashHex] = stored.split("$");
  if (scheme !== "pbkdf2" || rounds !== "120000" || !saltHex || !hashHex || saltHex.length !== 32 || hashHex.length !== 64) return false;
  const next = await hashPassword(password, hexToBytes(saltHex));
  return safeEqual(next, stored);
}

function normalizeMac(value: string) {
  const hex = value.trim().toUpperCase().replace(/[\s._:-]/g, "");
  if (!/^[0-9A-F]{12}$/.test(hex)) return null;
  return hex.match(/.{2}/g)!.join(":");
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

function cleanPhone(value: string) {
  const phone = value.trim().slice(0, 30);
  if (/[\u0000-\u001f]/.test(phone)) return null;
  return phone;
}

function cleanComment(value: string) {
  const comment = value.trim().replace(/\s+/g, " ").slice(0, 80);
  if (/[\u0000-\u001f]/.test(comment)) return null;
  return comment;
}

async function issueSession(secret: string, id: string, passwordHash: string) {
  const pass = (await hmac(secret, passwordHash)).slice(0, 32);
  const payload = bytesToBase64Url(new TextEncoder().encode(JSON.stringify({ id, exp: Date.now() + SESSION_MS, pass })));
  return `${payload}.${await hmac(secret, payload)}`;
}

async function readSession(secret: string, token: string) {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(await hmac(secret, payload), signature)) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as { id?: string; exp?: number; pass?: string };
    if (!data.id || !data.exp || !data.pass || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function zoneStart(unit: "day" | "month") {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = unit === "month" ? "01" : parts.find((part) => part.type === "day")?.value ?? "01";
  return new Date(`${year}-${month}-${day}T03:00:00.000Z`).toISOString();
}

async function currentReseller(admin: SupabaseClient, secret: string, request: Request) {
  const token = request.headers.get("x-reseller-session") ?? "";
  const session = await readSession(secret, token);
  if (!session) return null;
  const { data } = await admin
    .from("resellers")
    .select("id, parent_id, name, email, phone, credits, password_hash")
    .eq("id", session.id)
    .maybeSingle();
  if (!data) return null;
  const pass = (await hmac(secret, data.password_hash)).slice(0, 32);
  if (!safeEqual(pass, session.pass ?? "")) return null;
  return data;
}

async function spendCredit(admin: SupabaseClient, resellerId: string, credits: number) {
  if (credits < 1) return false;
  const { data } = await admin
    .from("resellers")
    .update({ credits: credits - 1 })
    .eq("id", resellerId)
    .eq("credits", credits)
    .select("credits")
    .maybeSingle();
  if (!data) return false;
  const { error } = await admin.from("reseller_credit_moves").insert({ reseller_id: resellerId, delta: -1, reason: "activation" });
  if (error) {
    await admin.from("resellers").update({ credits }).eq("id", resellerId).eq("credits", credits - 1);
    return false;
  }
  return true;
}

async function refundCredit(admin: SupabaseClient, resellerId: string) {
  const { data } = await admin.from("resellers").select("credits").eq("id", resellerId).maybeSingle();
  if (!data) return;
  await admin.from("resellers").update({ credits: data.credits + 1 }).eq("id", resellerId).eq("credits", data.credits);
  await admin.from("reseller_credit_moves").insert({ reseller_id: resellerId, delta: 1, reason: "refund" });
}

const CREDIT_PACKS: Record<number, number> = { 10: 10_000, 30: 24_000, 50: 35_000, 100: 60_000, 1000: 500_000 };

type Gateway = { key: string; sandbox: boolean; document: string };

async function loadGateway(admin: SupabaseClient): Promise<Gateway | null> {
  const { data } = await admin.from("payment_gateway").select("api_key, webhook_token, sandbox, document").eq("id", 1).maybeSingle();
  if (!data?.api_key || !data.webhook_token) return null;
  return { key: data.api_key, sandbox: data.sandbox === true, document: String(data.document ?? "").replace(/\D/g, "") };
}

function dueDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function asaas(gateway: Gateway, path: string, init: RequestInit = {}) {
  const base = gateway.sandbox ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      access_token: gateway.key,
      accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => null)) as {
    id?: string;
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
    data?: Array<{ id?: string }>;
  } | null;
  return { ok: response.ok, data };
}

async function pixCustomer(gateway: Gateway) {
  if (!gateway.document) return "";
  const profile = {
    name: "Slim Play",
    cpfCnpj: gateway.document,
    notificationDisabled: true,
    externalReference: "slimplay-pix",
  };
  const listed = await asaas(gateway, "/customers?externalReference=slimplay-pix&limit=1");
  const existing = listed.data?.data?.[0]?.id ?? "";
  if (existing) {
    await asaas(gateway, `/customers/${existing}`, { method: "PUT", body: JSON.stringify(profile) });
    return existing;
  }
  const created = await asaas(gateway, "/customers", { method: "POST", body: JSON.stringify(profile) });
  return created.ok ? created.data?.id ?? "" : "";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return fail("save", 405);
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const admin = adminClient();
  if (!secret || !admin) return fail("config", 500);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.action !== "string") return fail("save");

  if (body.action === "captcha") return fail("captcha");

  if (body.action === "login") {
    const email = cleanEmail(typeof body.email === "string" ? body.email : "");
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || password.length < 8 || password.length > 72) return fail("credentials", 401);
    const { data } = await admin.from("resellers").select("id, name, email, credits, password_hash").eq("email", email).maybeSingle();
    if (!data || !(await passwordMatches(password, data.password_hash))) return fail("credentials", 401);
    return json({
      ok: true,
      name: data.name,
      email: data.email,
      credits: data.credits,
      session: await issueSession(secret, data.id, data.password_hash),
    });
  }

  const reseller = await currentReseller(admin, secret, request);
  if (!reseller) return fail("session", 401);

  if (body.action === "session" || body.action === "dashboard") {
    const [{ count: total }, { count: today }, { count: month }, { count: children }, { data: moves }] = await Promise.all([
      admin.from("reseller_devices").select("id", { count: "exact", head: true }).eq("reseller_id", reseller.id),
      admin.from("reseller_devices").select("id", { count: "exact", head: true }).eq("reseller_id", reseller.id).gte("created_at", zoneStart("day")),
      admin.from("reseller_devices").select("id", { count: "exact", head: true }).eq("reseller_id", reseller.id).gte("created_at", zoneStart("month")),
      admin.from("resellers").select("id", { count: "exact", head: true }).eq("parent_id", reseller.id),
      admin.from("reseller_credit_moves").select("delta").eq("reseller_id", reseller.id).lt("delta", 0),
    ]);
    const spent = (moves ?? []).reduce((sum, move) => sum + Math.abs(move.delta), 0);
    return json({
      ok: true,
      name: reseller.name,
      email: reseller.email,
      credits: reseller.credits,
      total: total ?? 0,
      today: today ?? 0,
      month: month ?? 0,
      resellers: children ?? 0,
      spent,
    });
  }

  if (body.action === "devices") {
    const query = typeof body.query === "string" ? body.query.trim().toLowerCase().slice(0, 80) : "";
    const { data, error } = await admin
      .from("reseller_devices")
      .select("id, mac_address, comment, expires_at, package_label")
      .eq("reseller_id", reseller.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return fail("save", 500);
    const devices = (data ?? [])
      .filter((row) => !query || row.mac_address.toLowerCase().includes(query) || row.comment.toLowerCase().includes(query))
      .map((row) => ({
        id: row.id,
        mac: row.mac_address,
        comment: row.comment,
        expiresAt: row.expires_at,
        packageLabel: row.package_label,
      }));
    return json({ ok: true, devices, credits: reseller.credits });
  }

  if (body.action === "activate") {
    const mac = normalizeMac(typeof body.mac === "string" ? body.mac : "");
    const comment = cleanComment(typeof body.comment === "string" ? body.comment : "");
    if (!mac) return fail("mac");
    if (comment === null) return fail("save");
    const { data: owner } = await admin.from("reseller_devices").select("reseller_id, comment").eq("mac_address", mac).maybeSingle();
    if (owner && owner.reseller_id !== reseller.id) return fail("device");
    const { data: fresh } = await admin.from("resellers").select("credits").eq("id", reseller.id).maybeSingle();
    if (!fresh || fresh.credits < 1) return fail("credits");
    if (!(await spendCredit(admin, reseller.id, fresh.credits))) return fail("credits");

    const { data: device } = await admin.from("device_macs").select("expires_at, is_activated").eq("mac_address", mac).maybeSingle();
    const currentExpiry = device?.expires_at ? new Date(device.expires_at) : null;
    const base = currentExpiry && currentExpiry.getTime() > Date.now() ? currentExpiry : new Date();
    const granted = new Date(base.getTime() + YEAR_MS).toISOString();
    const write = device
      ? admin.from("device_macs").update({ is_activated: true, expires_at: granted }).eq("mac_address", mac)
      : admin.from("device_macs").insert({ mac_address: mac, is_activated: true, expires_at: granted });
    const { error: deviceError } = await write;
    if (deviceError) {
      await refundCredit(admin, reseller.id);
      return fail("save", 500);
    }

    const saved = owner
      ? await admin
          .from("reseller_devices")
          .update({ expires_at: granted, comment: comment || owner.comment, package_label: "1 ano" })
          .eq("mac_address", mac)
          .eq("reseller_id", reseller.id)
      : await admin.from("reseller_devices").insert({
          reseller_id: reseller.id,
          mac_address: mac,
          comment,
          package_label: "1 ano",
          expires_at: granted,
        });
    if (saved.error) {
      await refundCredit(admin, reseller.id);
      if (device) {
        await admin
          .from("device_macs")
          .update({ is_activated: device.is_activated, expires_at: device.expires_at })
          .eq("mac_address", mac);
      } else {
        await admin.from("device_macs").delete().eq("mac_address", mac);
      }
      return fail("save", 500);
    }
    return json({ ok: true, credits: fresh.credits - 1 });
  }

  if (body.action === "subs") {
    const query = typeof body.query === "string" ? body.query.trim().toLowerCase().slice(0, 80) : "";
    const { data, error } = await admin
      .from("resellers")
      .select("id, name, email, phone, credits")
      .eq("parent_id", reseller.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return fail("save", 500);
    const accounts = (data ?? []).filter((row) => !query || row.name.toLowerCase().includes(query) || row.email.includes(query));
    return json({ ok: true, accounts });
  }

  if (body.action === "create-sub") {
    const name = cleanName(typeof body.name === "string" ? body.name : "");
    const email = cleanEmail(typeof body.email === "string" ? body.email : "");
    const phone = cleanPhone(typeof body.phone === "string" ? body.phone : "");
    const password = typeof body.password === "string" ? body.password : "";
    const transfer = Number(body.credits);
    if (!name) return fail("name");
    if (!email) return fail("email");
    if (phone === null) return fail("phone");
    if (password.length < 8 || password.length > 72) return fail("password");
    if (!Number.isInteger(transfer) || transfer < 0 || transfer > 100_000) return fail("credits");
    const { data: existing } = await admin.from("resellers").select("id").eq("email", email).maybeSingle();
    if (existing) return fail("email");
    const { data: fresh } = await admin.from("resellers").select("credits").eq("id", reseller.id).maybeSingle();
    if (!fresh || fresh.credits < transfer) return fail("credits");
    if (transfer > 0) {
      const { data: locked } = await admin
        .from("resellers")
        .update({ credits: fresh.credits - transfer })
        .eq("id", reseller.id)
        .eq("credits", fresh.credits)
        .select("credits")
        .maybeSingle();
      if (!locked) return fail("credits");
    }
    const { data: created, error } = await admin
      .from("resellers")
      .insert({
        parent_id: reseller.id,
        name,
        email,
        phone,
        password_hash: await hashPassword(password),
        credits: transfer,
      })
      .select("id")
      .single();
    if (error || !created) {
      if (transfer > 0) await admin.from("resellers").update({ credits: fresh.credits }).eq("id", reseller.id);
      return fail("save", 500);
    }
    if (transfer > 0) {
      await admin.from("reseller_credit_moves").insert([
        { reseller_id: reseller.id, delta: -transfer, reason: "transfer_out" },
        { reseller_id: created.id, delta: transfer, reason: "transfer_in" },
      ]);
    }
    return json({ ok: true, credits: fresh.credits - transfer });
  }

  if (body.action === "buy-credits") {
    const credits = Number(body.credits);
    const amount = CREDIT_PACKS[credits];
    if (!amount) return fail("credits");
    const gateway = await loadGateway(admin);
    if (!gateway?.document) return fail("unavailable", 503);
    const { data: created, error } = await admin
      .from("reseller_credit_payments")
      .insert({ reseller_id: reseller.id, credits, amount_cents: amount, status: "pending" })
      .select("id")
      .single();
    if (error || !created) return fail("save", 500);
    const paymentId = created.id as string;
    const cancel = () =>
      admin.from("reseller_credit_payments").update({ status: "cancelled" }).eq("id", paymentId).eq("status", "pending");
    const customerId = await pixCustomer(gateway);
    if (!customerId) {
      await cancel();
      return fail("config", 500);
    }
    const charged = await asaas(gateway, "/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType: "PIX",
        value: Number((amount / 100).toFixed(2)),
        dueDate: dueDate(),
        description: `Creditos Slim Play — ${credits}`,
        externalReference: paymentId,
      }),
    });
    const asaasPaymentId = charged.data?.id ?? "";
    if (!charged.ok || !asaasPaymentId) {
      await cancel();
      return fail("save", 502);
    }
    const qr = await asaas(gateway, `/payments/${asaasPaymentId}/pixQrCode`);
    const pixPayload = qr.data?.payload ?? "";
    const pixQr = qr.data?.encodedImage ?? "";
    const pixExpiresAt = qr.data?.expirationDate ?? null;
    if (!qr.ok || !pixPayload) {
      await asaas(gateway, `/payments/${asaasPaymentId}`, { method: "DELETE" });
      await cancel();
      return fail("save", 502);
    }
    const { error: updateError } = await admin
      .from("reseller_credit_payments")
      .update({
        asaas_payment_id: asaasPaymentId,
        asaas_customer_id: customerId,
        pix_payload: pixPayload,
        pix_qr: pixQr,
        pix_expires_at: pixExpiresAt,
      })
      .eq("id", paymentId);
    if (updateError) {
      await asaas(gateway, `/payments/${asaasPaymentId}`, { method: "DELETE" });
      await cancel();
      return fail("save", 500);
    }
    return json({
      ok: true,
      id: paymentId,
      credits,
      amountCents: amount,
      status: "pending",
      pixPayload,
      pixQr,
      pixExpiresAt: pixExpiresAt ?? "",
    });
  }

  if (body.action === "credit-status") {
    const id = typeof body.id === "string" ? body.id : "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("save");
    const { data } = await admin
      .from("reseller_credit_payments")
      .select("id, status, credits, amount_cents, pix_payload, pix_qr, pix_expires_at")
      .eq("id", id)
      .eq("reseller_id", reseller.id)
      .maybeSingle();
    if (!data) return fail("missing", 404);
    return json({
      ok: true,
      id: data.id,
      status: data.status,
      credits: data.credits,
      amountCents: data.amount_cents,
      pixPayload: data.status === "pending" ? data.pix_payload ?? "" : "",
      pixQr: data.status === "pending" ? data.pix_qr ?? "" : "",
      pixExpiresAt: data.pix_expires_at ?? "",
    });
  }

  return fail("save");
});
