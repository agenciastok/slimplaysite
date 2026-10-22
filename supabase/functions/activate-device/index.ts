import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Billing = "pix" | "credit_card";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function fail(error: string, status = 400) {
  return json({ error }, status);
}

function adminKey() {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

function asaasKey() {
  return Deno.env.get("ASAAS_API_KEY") ?? "";
}

function gatewayReady() {
  return Boolean(asaasKey() && Deno.env.get("ASAAS_WEBHOOK_TOKEN"));
}

function asaasBase() {
  return Deno.env.get("ASAAS_SANDBOX") === "false" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
}

async function sign(secret: string, value: string) {
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
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function normalizeMac(value: string) {
  const hex = value.trim().toUpperCase().replace(/[\s._:-]/g, "");
  if (!/^[0-9A-F]{12}$/.test(hex)) return null;
  return hex.match(/.{2}/g)!.join(":");
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function cpfDigits(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return null;
  const check = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(digits[index]) * (length + 1 - index);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  if (check(9) !== Number(digits[9]) || check(10) !== Number(digits[10])) return null;
  return digits;
}

function cleanName(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > 120) return null;
  if (/[\u0000-\u001f]/.test(name)) return null;
  return name;
}

function cleanEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (email.length < 6 || email.length > 160) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

async function issueCaptcha(secret: string) {
  const first = 2 + Math.floor(Math.random() * 8);
  const second = 2 + Math.floor(Math.random() * 8);
  const subtract = Math.random() < 0.45;
  const left = subtract && second > first ? second : first;
  const right = subtract && second > first ? first : second;
  const answer = subtract ? left - right : left + right;
  const expires = Date.now() + 10 * 60 * 1000;
  const signature = await sign(secret, `${answer}.${expires}`);
  return { question: `${left} ${subtract ? "−" : "+"} ${right}`, token: `${expires}.${signature}` };
}

async function captchaValid(secret: string, token: string, answer: string) {
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || !/^\d+$/.test(answer.trim())) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = await sign(secret, `${Number(answer.trim())}.${expires}`);
  return safeEqual(expected, signature);
}

function dueDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function asaas(path: string, init: RequestInit = {}) {
  const response = await fetch(`${asaasBase()}${path}`, {
    ...init,
    headers: {
      access_token: asaasKey(),
      accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => null)) as {
    id?: string;
    invoiceUrl?: string;
    encodedImage?: string;
    payload?: string;
    errors?: Array<{ code?: string; description?: string }>;
    data?: Array<{ id?: string }>;
  } | null;
  return { ok: response.ok, data };
}

function asaasError(data: { errors?: Array<{ code?: string; description?: string }> } | null) {
  const blob = `${data?.errors?.[0]?.code ?? ""} ${data?.errors?.[0]?.description ?? ""}`.toLowerCase();
  if (blob.includes("cpf")) return "cpf";
  if (blob.includes("email")) return "email";
  return "save";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return fail("save", 405);

  const secret = adminKey();
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!secret || !supabaseUrl) return fail("config", 500);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return fail("save");
  const action = typeof body.action === "string" ? body.action : "";
  const admin = createClient(supabaseUrl, secret, { auth: { persistSession: false } });

  if (action === "plans") {
    const { data, error } = await admin
      .from("activation_plans")
      .select("code, days, price_cents")
      .eq("active", true)
      .gt("price_cents", 0)
      .order("sort_order", { ascending: true });
    if (error) return fail("config", 500);
    return json({
      configured: gatewayReady(),
      plans: (data ?? []).map((plan) => ({
        code: plan.code,
        days: plan.days,
        priceCents: plan.price_cents,
      })),
    });
  }

  if (action === "captcha") {
    if (!gatewayReady()) return fail("unavailable", 503);
    return json(await issueCaptcha(secret));
  }

  if (action === "status") {
    const id = typeof body.id === "string" ? body.id : "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail("save");
    const { data, error } = await admin
      .from("activation_payments")
      .select("id, status, billing_type, amount_cents, days, invoice_url, pix_payload, pix_qr")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return fail("save", 404);
    return json({
      id: data.id,
      status: data.status,
      billingType: data.billing_type,
      amountCents: data.amount_cents,
      days: data.days,
      invoiceUrl: data.invoice_url ?? "",
      pixPayload: data.status === "pending" ? data.pix_payload ?? "" : "",
      pixQr: data.status === "pending" ? data.pix_qr ?? "" : "",
    });
  }

  if (action !== "checkout") return fail("save");
  if (!gatewayReady()) return fail("unavailable", 503);

  const mac = normalizeMac(typeof body.mac === "string" ? body.mac : "");
  if (!mac) return fail("mac");
  const name = cleanName(typeof body.name === "string" ? body.name : "");
  if (!name) return fail("name");
  const email = cleanEmail(typeof body.email === "string" ? body.email : "");
  if (!email) return fail("email");
  const cpf = cpfDigits(typeof body.cpf === "string" ? body.cpf : "");
  if (!cpf) return fail("cpf");
  const billing: Billing | null = body.billing === "pix" || body.billing === "credit_card" ? body.billing : null;
  if (!billing) return fail("plan");
  const planCode = typeof body.plan === "string" ? body.plan : "";
  const token = typeof body.token === "string" ? body.token : "";
  const answer = typeof body.answer === "string" ? body.answer : "";
  if (!(await captchaValid(secret, token, answer))) return fail("captcha");

  const { data: plan, error: planError } = await admin
    .from("activation_plans")
    .select("code, days, price_cents, active")
    .eq("code", planCode)
    .maybeSingle();
  if (planError || !plan || !plan.active || plan.price_cents <= 0) return fail("plan");

  const { data: created, error: insertError } = await admin
    .from("activation_payments")
    .insert({
      mac_address: mac,
      plan_code: plan.code,
      days: plan.days,
      amount_cents: plan.price_cents,
      billing_type: billing,
      status: "pending",
    })
    .select("id")
    .single();
  if (insertError || !created) return fail("save", 500);

  const paymentId = created.id as string;
  const cancel = () => admin.from("activation_payments").update({ status: "cancelled" }).eq("id", paymentId).eq("status", "pending");

  const createdCustomer = await asaas("/customers", {
    method: "POST",
    body: JSON.stringify({ name, email, cpfCnpj: cpf }),
  });
  let customerId = createdCustomer.data?.id ?? "";
  if (!createdCustomer.ok || !customerId) {
    const found = await asaas(`/customers?cpfCnpj=${cpf}`);
    customerId = found.data?.data?.[0]?.id ?? "";
    if (!customerId) {
      await cancel();
      return fail(asaasError(createdCustomer.data));
    }
  }

  const charged = await asaas("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: customerId,
      billingType: billing === "pix" ? "PIX" : "CREDIT_CARD",
      value: Number((plan.price_cents / 100).toFixed(2)),
      dueDate: dueDate(),
      description: `Licenca Slim Play — ${plan.days} dias`,
      externalReference: paymentId,
    }),
  });
  const asaasPaymentId = charged.data?.id ?? "";
  const invoiceUrl = charged.data?.invoiceUrl ?? "";
  if (!charged.ok || !asaasPaymentId) {
    await cancel();
    return fail(asaasError(charged.data));
  }

  let pixPayload = "";
  let pixQr = "";
  if (billing === "pix") {
    const qr = await asaas(`/payments/${asaasPaymentId}/pixQrCode`);
    pixPayload = qr.data?.payload ?? "";
    pixQr = qr.data?.encodedImage ?? "";
    if (!qr.ok || !pixPayload) {
      await cancel();
      return fail("save", 502);
    }
  } else if (!invoiceUrl) {
    await cancel();
    return fail("save", 502);
  }

  const { error: updateError } = await admin
    .from("activation_payments")
    .update({
      asaas_payment_id: asaasPaymentId,
      asaas_customer_id: customerId,
      invoice_url: invoiceUrl,
      pix_payload: pixPayload,
      pix_qr: pixQr,
    })
    .eq("id", paymentId);
  if (updateError) {
    await cancel();
    return fail("save", 500);
  }

  return json({
    id: paymentId,
    billingType: billing,
    status: "pending",
    amountCents: plan.price_cents,
    days: plan.days,
    invoiceUrl,
    pixPayload,
    pixQr,
  });
});
