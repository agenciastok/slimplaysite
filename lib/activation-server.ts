const FUNCTION = "activate-device";

type ActivationResult = {
  ok?: boolean;
  error?: string;
  configured?: boolean;
  plans?: Array<{ code?: string; days?: number; priceCents?: number }>;
  question?: string;
  token?: string;
  id?: string;
  billingType?: string;
  status?: string;
  amountCents?: number;
  days?: number;
  mac?: string;
  expiresAt?: string;
  pixPayload?: string;
  pixQr?: string;
  pixExpiresAt?: string;
  history?: Array<{ id?: string; status?: string; amountCents?: number; createdAt?: string }>;
};

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function callActivation(body: unknown) {
  const env = config();
  if (!env) return { status: 500, data: { error: "config" } as ActivationResult };

  const response = await fetch(`${env.url}/functions/v1/${FUNCTION}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.key}`,
      apikey: env.key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as ActivationResult | null;
  return { status: response.status, data: data ?? { error: "save" } };
}
