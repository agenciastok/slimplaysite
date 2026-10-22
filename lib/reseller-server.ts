const COOKIE = "slimplay-reseller";

type ResellerResult = {
  ok?: boolean;
  error?: string;
  session?: string;
  name?: string;
  email?: string;
  credits?: number;
  total?: number;
  today?: number;
  month?: number;
  resellers?: number;
  spent?: number;
  devices?: unknown[];
  accounts?: unknown[];
  updated?: number;
  question?: string;
  token?: string;
};

export function resellerCookieName() {
  return COOKIE;
}

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function callReseller(body: unknown, session = "") {
  const env = config();
  if (!env) return { status: 500, data: { error: "config" } as ResellerResult };

  const response = await fetch(`${env.url}/functions/v1/reseller-panel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.key}`,
      apikey: env.key,
      "Content-Type": "application/json",
      ...(session ? { "x-reseller-session": session } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as ResellerResult | null;
  return { status: response.status, data: data ?? { error: "save" } };
}
