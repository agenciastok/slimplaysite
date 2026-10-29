import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ANNUAL_CODE = "365";
const ANNUAL_DAYS = 365;
const ANNUAL_CENTS = 1200;
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

type Gateway = { key: string; sandbox: boolean; document: string };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function fail(error: string, status = 400) {
  return json({ error }, status);
}

function asaasBase(sandbox: boolean) {
  return sandbox ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
}

async function loadGateway(admin: SupabaseClient): Promise<Gateway | null> {
  const { data } = await admin.from("payment_gateway").select("api_key, webhook_token, sandbox, document").eq("id", 1).maybeSingle();
  if (!data?.api_key || !data.webhook_token) return null;
  const document = String(data.document ?? "").replace(/\D/g, "");
  return { key: data.api_key, sandbox: data.sandbox === true, document };
}

function normalizeMac(value: string) {
  const hex = value.trim().toUpperCase().replace(/[\s._:-]/g, "");
  if (!/^[0-9A-F]{12}$/.test(hex)) return null;
  return hex.match(/.{2}/g)!.join(":");
}

function dueDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

type AsaasData = {
  id?: string;
  invoiceUrl?: string;
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
  errors?: Array<{ code?: string; description?: string }>;
  data?: Array<{ id?: string }>;
};

async function asaas(gateway: Gateway, path: string, init: RequestInit = {}) {
  const response = await fetch(`${asaasBase(gateway.sandbox)}${path}`, {
    ...init,
    headers: {
      access_token: gateway.key,
      accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => null)) as AsaasData | null;
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!secret || !supabaseUrl) return fail("config", 500);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("save");
  const action = typeof body.action === "string" ? body.action : "";
  const admin = createClient(supabaseUrl, secret, { auth: { persistSession: false } });
  const gateway = await loadGateway(admin);

  if (action === "plans") {
    const { data, error } = await admin
      .from("activation_plans")
      .select("code, days, price_cents")
      .eq("code", ANNUAL_CODE)
      .eq("active", true)
      .eq("days", ANNUAL_DAYS)
      .eq("price_cents", ANNUAL_CENTS)
      .maybeSingle();
    if (error) return fail("config", 500);
    return json({
      configured: Boolean(gateway?.document && data),
      plans: data ? [{ code: data.code, days: data.days, priceCents: data.price_cents }] : [],
    });
  }

  if (action === "captcha") return fail("captcha");

  if (action === "status") {
    const id = typeof body.id === "string" ? body.id : "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("save");
    const { data, error } = await admin
      .from("activation_payments")
      .select("id, mac_address, status, billing_type, amount_cents, days, invoice_url, pix_payload, pix_qr, pix_expires_at")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return fail("save", 404);
    const { data: history } = await admin
      .from("activation_payments")
      .select("id, status, amount_cents, created_at")
      .eq("mac_address", data.mac_address)
      .order("created_at", { ascending: false })
      .limit(8);
    return json({
      id: data.id,
      mac: data.mac_address,
      status: data.status,
      billingType: data.billing_type,
      amountCents: data.amount_cents,
      days: data.days,
      invoiceUrl: data.invoice_url ?? "",
      pixPayload: data.status === "pending" ? data.pix_payload ?? "" : "",
      pixQr: data.status === "pending" ? data.pix_qr ?? "" : "",
      pixExpiresAt: data.pix_expires_at ?? "",
      history: (history ?? []).map((item) => ({
        id: item.id,
        status: item.status,
        amountCents: item.amount_cents,
        createdAt: item.created_at,
      })),
    });
  }

  if (action === "voucher") {
    const mac = normalizeMac(typeof body.mac === "string" ? body.mac : "");
    if (!mac) return fail("mac");
    const code = typeof body.code === "string" ? body.code.replace(/\D/g, "") : "";
    if (!/^\d{6}$/.test(code)) return fail("voucher");
    const { data: voucher, error: voucherError } = await admin
      .from("activation_vouchers")
      .select("id")
      .eq("code", code)
      .eq("purpose", "app_release")
      .eq("active", true)
      .maybeSingle();
    if (voucherError) return fail("save", 500);
    if (!voucher) return fail("voucher");
    const { data: device, error: deviceError } = await admin
      .from("device_macs")
      .select("is_activated, expires_at")
      .eq("mac_address", mac)
      .maybeSingle();
    if (deviceError) return fail("save", 500);
    if (!device) {
      const granted = new Date(Date.now() + YEAR_MS).toISOString();
      const { error: insertError } = await admin.from("device_macs").insert({
        mac_address: mac,
        is_activated: true,
        expires_at: granted,
      });
      if (insertError) return fail("save", 500);
      await admin.from("voucher_activations").insert({
        mac_address: mac,
        voucher_id: voucher.id,
        previous_expires_at: null,
        granted_expires_at: granted,
      });
      return json({ ok: true, mac, expiresAt: granted });
    }

    const current = device.expires_at ? new Date(device.expires_at) : null;
    const remaining = current ? current.getTime() - Date.now() : 0;
    if (remaining >= 300 * 24 * 60 * 60 * 1000) {
      if (device.is_activated !== true) {
        const { error: activateError } = await admin.from("device_macs").update({ is_activated: true }).eq("mac_address", mac);
        if (activateError) return fail("save", 500);
      }
      return json({ ok: true, mac, expiresAt: current?.toISOString() ?? "" });
    }

    const base = current && current.getTime() > Date.now() ? current : new Date();
    const granted = new Date(base.getTime() + YEAR_MS).toISOString();
    const { error: updateError } = await admin
      .from("device_macs")
      .update({ is_activated: true, expires_at: granted })
      .eq("mac_address", mac);
    if (updateError) return fail("save", 500);
    await admin.from("voucher_activations").insert({
      mac_address: mac,
      voucher_id: voucher.id,
      previous_expires_at: current ? current.toISOString() : null,
      granted_expires_at: granted,
    });
    return json({ ok: true, mac, expiresAt: granted });
  }

  if (action !== "checkout") return fail("save");
  if (!gateway?.document) return fail("unavailable", 503);

  const mac = normalizeMac(typeof body.mac === "string" ? body.mac : "");
  if (!mac) return fail("mac");
  const { data: device, error: deviceError } = await admin
    .from("device_macs")
    .select("mac_address")
    .eq("mac_address", mac)
    .maybeSingle();
  if (deviceError) return fail("save", 500);
  if (!device) return fail("unknown");

  const { data: plan, error: planError } = await admin
    .from("activation_plans")
    .select("code, days, price_cents, active")
    .eq("code", ANNUAL_CODE)
    .maybeSingle();
  if (planError || !plan || !plan.active || plan.days !== ANNUAL_DAYS || plan.price_cents !== ANNUAL_CENTS) {
    return fail("unavailable", 503);
  }

  const { data: created, error: insertError } = await admin
    .from("activation_payments")
    .insert({
      mac_address: mac,
      plan_code: plan.code,
      days: plan.days,
      amount_cents: plan.price_cents,
      billing_type: "pix",
      status: "pending",
    })
    .select("id")
    .single();
  if (insertError || !created) return fail("save", 500);

  const paymentId = created.id as string;
  const cancel = () => admin.from("activation_payments").update({ status: "cancelled" }).eq("id", paymentId).eq("status", "pending");

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
      value: Number((plan.price_cents / 100).toFixed(2)),
      dueDate: dueDate(),
      description: `Licenca Slim Play — 1 ano — ${mac}`,
      externalReference: paymentId,
    }),
  });
  const asaasPaymentId = charged.data?.id ?? "";
  if (!charged.ok || !asaasPaymentId) {
    await cancel();
    const blob = `${charged.data?.errors?.[0]?.code ?? ""} ${charged.data?.errors?.[0]?.description ?? ""}`.toLowerCase();
    return fail(blob.includes("cpf") || blob.includes("cnpj") ? "config" : "save", 502);
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
    .from("activation_payments")
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
    id: paymentId,
    mac,
    billingType: "pix",
    status: "pending",
    amountCents: plan.price_cents,
    days: plan.days,
    invoiceUrl: "",
    pixPayload,
    pixQr,
    pixExpiresAt: pixExpiresAt ?? "",
  });
});
