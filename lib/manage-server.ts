import type { ManagedList } from "@/lib/managed-list";

const COOKIE = "slimplay-device";

type ManageResult = {
  ok?: boolean;
  error?: string;
  mac?: string;
  session?: string;
  lists?: ManagedList[];
  question?: string;
  token?: string;
};

export function deviceCookieName() {
  return COOKIE;
}

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function callManage(body: unknown, session = "") {
  const env = config();
  if (!env) return { status: 500, data: { error: "config" } as ManageResult };

  const response = await fetch(`${env.url}/functions/v1/manage-lists`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.key}`,
      apikey: env.key,
      "Content-Type": "application/json",
      ...(session ? { "x-device-session": session } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as ManageResult | null;
  return { status: response.status, data: data ?? { error: "save" } };
}
