import { createClient } from "npm:@supabase/supabase-js@2";

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

function asaasBase() {
  return Deno.env.get("ASAAS_SANDBOX") === "false" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
}

type AsaasPayment = {
  id?: string;
  status?: string;
  value?: number;
  externalReference?: string;
  billingType?: string;
};

async function fetchPayment(id: string) {
  const key = Deno.env.get("ASAAS_API_KEY") ?? "";
  if (!key) return null;
  const response = await fetch(`${asaasBase()}/payments/${encodeURIComponent(id)}`, {
    headers: { access_token: key, accept: "application/json" },
  });
  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as AsaasPayment | null;
}

function cents(value: number) {
  return Math.round(value * 100);
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "method" }, 405);

  const secret = Deno.env.get("ASAAS_WEBHOOK_TOKEN") ?? "";
  const provided = request.headers.get("asaas-access-token") ?? "";
  if (!secret || !provided || !safeEqual(secret, provided)) return json({ error: "unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey || !Deno.env.get("ASAAS_API_KEY")) return json({ error: "config" }, 500);

  const body = (await request.json().catch(() => null)) as { payment?: { id?: string } } | null;
  const asaasId = body?.payment?.id ?? "";
  if (!asaasId) return json({ ok: true });

  const remote = await fetchPayment(asaasId);
  if (!remote?.id || remote.id !== asaasId) return json({ error: "retry" }, 500);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: row, error } = await admin
    .from("activation_payments")
    .select("id, mac_address, days, amount_cents, status, asaas_payment_id, previous_expires_at, granted_expires_at")
    .eq("id", remote.externalReference ?? "")
    .maybeSingle();
  if (error) return json({ error: "retry" }, 500);
  if (!row) return json({ ok: true });
  if (row.asaas_payment_id && row.asaas_payment_id !== asaasId) return json({ error: "mismatch" }, 400);
  if (cents(Number(remote.value ?? 0)) !== row.amount_cents) return json({ error: "mismatch" }, 400);

  const status = remote.status ?? "";
  const paid = status === "RECEIVED" || status === "CONFIRMED" || status === "RECEIVED_IN_CASH";
  const refunded = status === "REFUNDED";

  if (paid && row.status === "pending") {
    const { data: device } = await admin
      .from("device_macs")
      .select("expires_at")
      .eq("mac_address", row.mac_address)
      .maybeSingle();
    const previous = device?.expires_at ? new Date(device.expires_at) : null;
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

    const write = device
      ? admin.from("device_macs").update({ is_activated: true, expires_at: granted }).eq("mac_address", row.mac_address)
      : admin.from("device_macs").insert({ mac_address: row.mac_address, is_activated: true, expires_at: granted });
    const { error: deviceError } = await write;
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
});
