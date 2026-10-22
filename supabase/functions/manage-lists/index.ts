import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-session",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SESSION_MS = 12 * 60 * 60 * 1000;

type PlaylistType = "url" | "xtream" | "code";

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

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeMac(value: string) {
  const hex = value.trim().toUpperCase().replace(/[\s._:-]/g, "");
  if (!/^[0-9A-F]{12}$/.test(hex)) return null;
  return hex.match(/.{2}/g)!.join(":");
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

async function issueSession(secret: string, mac: string, deviceKey: string) {
  const keyHash = await sign(secret, `${mac}.${deviceKey}`);
  const payload = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify({ mac, exp: Date.now() + SESSION_MS, keyHash })),
  );
  const signature = await sign(secret, payload);
  return `${payload}.${signature}`;
}

async function readSession(secret: string, token: string) {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = await sign(secret, payload);
  if (!safeEqual(expected, signature)) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {
      mac?: string;
      exp?: number;
      keyHash?: string;
    };
    if (!data.mac || !data.exp || !data.keyHash || data.exp < Date.now()) return null;
    if (!normalizeMac(data.mac)) return null;
    return { mac: data.mac, keyHash: data.keyHash };
  } catch {
    return null;
  }
}

function credential(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === "EMPTY") return "";
  return trimmed;
}

function serverKey(value: string) {
  return value.trim().replace(/\/+$/, "").toLowerCase();
}

function dnsRecord(row: Record<string, unknown>) {
  const related = row.dns_servers;
  const record = Array.isArray(related) ? related[0] : related;
  if (!record || typeof record !== "object") return { title: "", url: "" };
  const source = record as Record<string, unknown>;
  return {
    title: typeof source.title === "string" ? source.title.trim() : "",
    url: typeof source.dns_url === "string" ? source.dns_url.trim() : "",
  };
}

function present(row: Record<string, unknown>) {
  const dns = dnsRecord(row);
  let type = typeof row.playlist_type === "string" && row.playlist_type.trim() ? row.playlist_type.trim() : null;
  let m3uUrl = typeof row.m3u_url === "string" && row.m3u_url.trim() ? row.m3u_url.trim() : null;
  const username = credential(row.username);
  const password = credential(row.password);
  const linkedAccount = row.dns_id != null || Boolean(username);
  if (!type && linkedAccount) {
    type = "xtream";
    if (!m3uUrl && dns.url) m3uUrl = dns.url;
  }
  if (type === "xtream" && !m3uUrl && dns.url) m3uUrl = dns.url;
  const hiddenFile = type === "file" || (m3uUrl != null && m3uUrl.length > 500 && !m3uUrl.startsWith("http"));
  const storedName = typeof row.playlist_name === "string" ? row.playlist_name.trim() : "";
  return {
    id: row.id,
    playlistName: storedName || (type === "xtream" ? username || dns.title : "") || null,
    playlistType: type,
    m3uUrl: hiddenFile ? null : m3uUrl,
    epgUrl: row.epg_url ?? null,
    username,
    password: hiddenFile ? "" : password,
    createdAt: row.created_at,
  };
}

async function dnsIdForServer(admin: ReturnType<typeof createClient>, serverUrl: string) {
  const { data, error } = await admin.from("dns_servers").select("id, dns_url");
  if (error) return { error: true as const, id: null };
  const target = serverKey(serverUrl);
  const match = (data ?? []).find((row) => serverKey(String(row.dns_url ?? "")) === target);
  return { error: false as const, id: match ? Number(match.id) : null };
}

function readListInput(body: Record<string, unknown>, keepPassword: string | null) {
  const type = String(body.type ?? "") as PlaylistType;
  if (type !== "url" && type !== "xtream" && type !== "code") return { error: "save" as const };
  let playlistName: string | null = String(body.playlistName ?? "").trim();
  if (playlistName.length > 80) return { error: "name" as const };
  let m3uUrl = "";
  let epgUrl: string | null = null;
  let username = "";
  let password = "";

  if (type === "url") {
    if (!playlistName) return { error: "name" as const };
    m3uUrl = String(body.m3uUrl ?? "").trim();
    if (!isHttpUrl(m3uUrl)) return { error: "url" as const };
    const epg = String(body.epgUrl ?? "").trim();
    if (epg) {
      if (!isHttpUrl(epg)) return { error: "epg" as const };
      epgUrl = epg;
    }
  } else if (type === "xtream") {
    if (!playlistName) return { error: "name" as const };
    m3uUrl = String(body.serverUrl ?? "").trim().replace(/\/+$/, "");
    if (!isHttpUrl(m3uUrl)) return { error: "server" as const };
    username = String(body.username ?? "").trim();
    password = String(body.password ?? "").trim();
    if (!username || username.length > 120) return { error: "username" as const };
    if (!password) {
      if (!keepPassword) return { error: "password" as const };
      password = keepPassword;
    } else if (password.length > 120) return { error: "password" as const };
  } else {
    playlistName = playlistName || null;
    m3uUrl = String(body.shortCode ?? "").trim();
    if (!/^[A-Za-z0-9_-]{2,64}$/.test(m3uUrl)) return { error: "code" as const };
  }

  return {
    fields: { playlist_name: playlistName, playlist_type: type, m3u_url: m3uUrl, epg_url: epgUrl, username, password },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail("save", 405);

  const secret = adminKey();
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!secret || !supabaseUrl) return fail("config", 500);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return fail("save");
  }

  const action = String(body.action ?? "");
  if (action === "captcha") return json(await issueCaptcha(secret));

  const admin = createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (action === "login") {
    const token = String(body.token ?? "");
    const answer = String(body.answer ?? "");
    if (!(await captchaValid(secret, token, answer))) return fail("captcha");

    const mac = normalizeMac(String(body.mac ?? ""));
    const deviceKey = String(body.deviceKey ?? "").trim();
    if (!mac || !deviceKey || deviceKey.length > 6) return fail("credentials");

    const { data, error } = await admin
      .from("device_macs")
      .select("mac_address")
      .eq("mac_address", mac)
      .eq("device_key", deviceKey)
      .maybeSingle();

    if (error) return fail("save", 500);
    if (!data) return fail("credentials");
    return json({ ok: true, mac, session: await issueSession(secret, mac, deviceKey) });
  }

  const session = await readSession(secret, req.headers.get("x-device-session") ?? "");
  if (!session) return fail("session", 401);

  const { data: deviceRow, error: deviceError } = await admin
    .from("device_macs")
    .select("device_key")
    .eq("mac_address", session.mac)
    .maybeSingle();
  if (deviceError) return fail("save", 500);
  const currentKey = typeof deviceRow?.device_key === "string" ? deviceRow.device_key : "";
  const keyHash = await sign(secret, `${session.mac}.${currentKey}`);
  if (!currentKey || !safeEqual(keyHash, session.keyHash)) return fail("session", 401);
  const mac = session.mac;

  if (action === "session") return json({ ok: true, mac });

  if (action === "lists") {
    const { data, error } = await admin
      .from("lists")
      .select("id, playlist_name, playlist_type, m3u_url, epg_url, username, password, created_at, dns_id, dns_servers(title, dns_url)")
      .eq("mac_address", mac)
      .order("created_at", { ascending: false });
    if (error) return fail("save", 500);
    return json({ ok: true, mac, lists: (data ?? []).map((row) => present(row)) });
  }

  if (action === "create") {
    const parsed = readListInput(body, null);
    if ("error" in parsed) return fail(parsed.error);
    const dnsId = parsed.fields.playlist_type === "xtream" ? await dnsIdForServer(admin, parsed.fields.m3u_url) : { error: false as const, id: null };
    if (dnsId.error) return fail("save", 500);
    const { error } = await admin.from("lists").insert({ mac_address: mac, ...parsed.fields, dns_id: dnsId.id });
    if (error) return fail("save", 500);
    return json({ ok: true });
  }

  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) return fail("missing", 404);

  const { data: current, error: currentError } = await admin
    .from("lists")
    .select("id, mac_address, password")
    .eq("id", id)
    .maybeSingle();
  if (currentError) return fail("save", 500);
  if (!current || current.mac_address !== mac) return fail("missing", 404);

  if (action === "delete") {
    const { error } = await admin.from("lists").delete().eq("id", id).eq("mac_address", mac);
    if (error) return fail("save", 500);
    return json({ ok: true });
  }

  if (action === "update") {
    const parsed = readListInput(body, typeof current.password === "string" ? current.password : "");
    if ("error" in parsed) return fail(parsed.error);
    const dnsId = parsed.fields.playlist_type === "xtream" ? await dnsIdForServer(admin, parsed.fields.m3u_url) : { error: false as const, id: null };
    if (dnsId.error) return fail("save", 500);
    const { error } = await admin
      .from("lists")
      .update({ ...parsed.fields, dns_id: dnsId.id })
      .eq("id", id)
      .eq("mac_address", mac);
    if (error) return fail("save", 500);
    return json({ ok: true });
  }

  return fail("save");
});
