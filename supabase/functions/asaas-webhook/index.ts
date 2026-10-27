import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

type Gateway = { key: string; webhookToken: string; sandbox: boolean };

type AsaasPayment = {
  id?: string;
  status?: string;
  value?: number;
  externalReference?: string;
  billingType?: string;
};

function cents(value: number) {
  return Math.round(value * 100);
}

async function loadGateway(admin: SupabaseClient): Promise<Gateway | null> {
  const { data } = await admin.from("payment_gateway").select("api_key, webhook_token, sandbox").eq("id", 1).maybeSingle();
  if (!data?.api_key || !data.webhook_token) return null;
  return { key: data.api_key, webhookToken: data.webhook_token, sandbox: data.sandbox === true };
}

async function fetchPayment(gateway: Gateway, id: string) {
  const base = gateway.sandbox ? "https://api-sandbox.asaas.com/v3" : "https://api.asaas.com/v3";
  const response = await fetch(`${base}/payments/${encodeURIComponent(id)}`, {
    headers: { access_token: gateway.key, accept: "application/json" },
  });
  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as AsaasPayment | null;
}

async function grantCredits(admin: SupabaseClient, resellerId: string, credits: number) {
  const { data } = await admin.from("resellers").select("credits").eq("id", resellerId).maybeSingle();
  if (!data) return false;
  const next = data.credits + credits;
  const { data: locked } = await admin
    .from("resellers")
    .update({ credits: next })
    .eq("id", resellerId)
    .eq("credits", data.credits)
    .select("credits")
    .maybeSingle();
  if (!locked) return false;
  const { error } = await admin.from("reseller_credit_moves").insert({ reseller_id: resellerId, delta: credits, reason: "purchase" });
  if (error) {
    await admin.from("resellers").update({ credits: data.credits }).eq("id", resellerId).eq("credits", next);
    return false;
  }
  return true;
}

async function revokeCredits(admin: SupabaseClient, resellerId: string, credits: number) {
  const { data } = await admin.from("resellers").select("credits").eq("id", resellerId).maybeSingle();
  if (!data || data.credits < credits) return false;
  const next = data.credits - credits;
  const { data: locked } = await admin
    .from("resellers")
    .update({ credits: next })
    .eq("id", resellerId)
    .eq("credits", data.credits)
    .select("credits")
    .maybeSingle();
  if (!locked) return false;
  const { error } = await admin
    .from("reseller_credit_moves")
    .insert({ reseller_id: resellerId, delta: -credits, reason: "purchase_refund" });
  if (error) {
    await admin.from("resellers").update({ credits: data.credits }).eq("id", resellerId).eq("credits", next);
    return false;
  }
  return true;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return json({ error: "config" }, 500);
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const gateway = await loadGateway(admin);
  const provided = request.headers.get("asaas-access-token") ?? "";
  if (!gateway || !provided || !safeEqual(gateway.webhookToken, provided)) return json({ error: "unauthorized" }, 401);

  const body = (await request.json().catch(() => null)) as { payment?: { id?: string } } | null;
  const asaasId = body?.payment?.id ?? "";
  if (!asaasId) return json({ ok: true });

  const remote = await fetchPayment(gateway, asaasId);
  if (!remote?.id || remote.id !== asaasId) return json({ error: "retry" }, 500);
  const reference = remote.externalReference ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(reference)) return json({ ok: true });

  const status = remote.status ?? "";
  const paid = status === "RECEIVED" || status === "CONFIRMED" || status === "RECEIVED_IN_CASH";
  const refunded = status === "REFUNDED";
  const valueCents = cents(Number(remote.value ?? 0));

  const { data: row, error } = await admin
    .from("activation_payments")
    .select("id, mac_address, days, amount_cents, status, asaas_payment_id, previous_expires_at, granted_expires_at")
    .eq("id", reference)
    .maybeSingle();
  if (error) return json({ error: "retry" }, 500);

  if (row) {
    if (row.asaas_payment_id && row.asaas_payment_id !== asaasId) return json({ error: "mismatch" }, 400);
    if (valueCents !== row.amount_cents) return json({ error: "mismatch" }, 400);

    if (paid && row.status === "pending") {
      const { data: device } = await admin.from("device_macs").select("expires_at").eq("mac_address", row.mac_address).maybeSingle();
      if (!device) return json({ error: "retry" }, 500);
      const previous = device.expires_at ? new Date(device.expires_at) : null;
      const base = previous && previous.getTime() > Date.now() ? previous : new Date();
      const granted = new Date(base.getTime() + row.days * 24 * 60 * 60 * 1000).toISOString();
      const { data: locked } = await admin
        .from("activation_payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          asaas_payment_id: asaasId,
          previous_expires_at: previous ? previous.toISOString() : null,
          granted_expires_at: granted,
        })
        .eq("id", row.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (!locked) return json({ ok: true });
      const { error: deviceError } = await admin
        .from("device_macs")
        .update({ is_activated: true, expires_at: granted })
        .eq("mac_address", row.mac_address);
      if (deviceError) {
        await admin
          .from("activation_payments")
          .update({ status: "pending", paid_at: null, previous_expires_at: null, granted_expires_at: null })
          .eq("id", row.id)
          .eq("status", "paid");
        return json({ error: "retry" }, 500);
      }
      return json({ ok: true });
    }

    if (refunded && row.status === "paid" && row.granted_expires_at) {
      const { data: locked } = await admin
        .from("activation_payments")
        .update({ status: "refunded" })
        .eq("id", row.id)
        .eq("status", "paid")
        .select("id")
        .maybeSingle();
      if (!locked) return json({ ok: true });
      const previous = row.previous_expires_at ? new Date(row.previous_expires_at) : null;
      const stillActive = Boolean(previous && previous.getTime() > Date.now());
      await admin
        .from("device_macs")
        .update({ expires_at: previous ? previous.toISOString() : null, is_activated: stillActive })
        .eq("mac_address", row.mac_address)
        .eq("expires_at", row.granted_expires_at);
      return json({ ok: true });
    }

    if ((status === "OVERDUE" || status === "DELETED") && row.status === "pending") {
      await admin.from("activation_payments").update({ status: "cancelled" }).eq("id", row.id).eq("status", "pending");
    }
    return json({ ok: true });
  }

  const { data: credit, error: creditError } = await admin
    .from("reseller_credit_payments")
    .select("id, reseller_id, credits, amount_cents, status, asaas_payment_id")
    .eq("id", reference)
    .maybeSingle();
  if (creditError) return json({ error: "retry" }, 500);
  if (!credit) return json({ ok: true });
  if (credit.asaas_payment_id && credit.asaas_payment_id !== asaasId) return json({ error: "mismatch" }, 400);
  if (valueCents !== credit.amount_cents) return json({ error: "mismatch" }, 400);

  if (paid && credit.status === "pending") {
    const { data: locked } = await admin
      .from("reseller_credit_payments")
      .update({ status: "paid", paid_at: new Date().toISOString(), asaas_payment_id: asaasId })
      .eq("id", credit.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();
    if (!locked) return json({ ok: true });
    if (!(await grantCredits(admin, credit.reseller_id, credit.credits))) {
      await admin.from("reseller_credit_payments").update({ status: "pending", paid_at: null }).eq("id", credit.id).eq("status", "paid");
      return json({ error: "retry" }, 500);
    }
    return json({ ok: true });
  }

  if (refunded && credit.status === "paid") {
    const { data: locked } = await admin
      .from("reseller_credit_payments")
      .update({ status: "refunded" })
      .eq("id", credit.id)
      .eq("status", "paid")
      .select("id")
      .maybeSingle();
    if (!locked) return json({ ok: true });
    if (!(await revokeCredits(admin, credit.reseller_id, credit.credits))) {
      await admin.from("reseller_credit_payments").update({ status: "paid" }).eq("id", credit.id).eq("status", "refunded");
      return json({ error: "retry" }, 500);
    }
    return json({ ok: true });
  }

  if ((status === "OVERDUE" || status === "DELETED") && credit.status === "pending") {
    await admin.from("reseller_credit_payments").update({ status: "cancelled" }).eq("id", credit.id).eq("status", "pending");
  }

  return json({ ok: true });
});
