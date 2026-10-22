import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BODY = 600_000;

type PlaylistType = "url" | "xtream" | "code";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
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

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeDevice(value: string, allowOtp: boolean) {
  const compact = value.trim().toUpperCase().replace(/[\s._-]/g, "");
  if (allowOtp && /^\d{6}$/.test(compact)) return compact;
  const hex = compact.replace(/:/g, "");
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
  return {
    question: `${left} ${subtract ? "−" : "+"} ${right}`,
    token: `${expires}.${signature}`,
  };
}

async function captchaValid(secret: string, token: string, answer: string) {
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires) || !/^\d+$/.test(answer.trim())) return false;
  if (Number(expires) < Date.now()) return false;
  const expected = await sign(secret, `${Number(answer.trim())}.${expires}`);
  return safeEqual(expected, signature);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail("save", 405);

  const secret = adminKey();
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!secret || !supabaseUrl) return fail("config", 500);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return fail("file", 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return fail("save");
  }

  if (body.action === "captcha") return json(await issueCaptcha(secret));

  const token = String(body.token ?? "");
  const answer = String(body.answer ?? "");
  if (!(await captchaValid(secret, token, answer))) return fail("captcha");

  const type = String(body.type ?? "") as PlaylistType;
  if (type === "file") return fail("file");
  if (type !== "url" && type !== "xtream" && type !== "code") return fail("save");

  const device = normalizeDevice(String(body.device ?? ""), type === "code");
  if (!device) return fail(type === "code" ? "device" : "mac");

  const protect = body.protect === true;
  let protectPin: string | null = null;
  if (protect) {
    const pin = String(body.pin ?? "").trim();
    const confirmPin = String(body.confirmPin ?? "").trim();
    if (!/^\d{4,8}$/.test(pin) || pin !== confirmPin) return fail("pin");
    protectPin = pin;
  }

  let playlistName: string | null = String(body.playlistName ?? "").trim();
  if (playlistName.length > 80) return fail("name");
  let m3uUrl = "";
  let epgUrl: string | null = null;
  let credentials: { username: string; password: string } | null = null;

  if (type === "url") {
    if (!playlistName) return fail("name");
    m3uUrl = String(body.m3uUrl ?? "").trim();
    if (!isHttpUrl(m3uUrl)) return fail("url");
    const epg = String(body.epgUrl ?? "").trim();
    if (epg) {
      if (!isHttpUrl(epg)) return fail("epg");
      epgUrl = epg;
    }
  } else if (type === "xtream") {
    if (!playlistName) return fail("name");
    m3uUrl = String(body.serverUrl ?? "").trim().replace(/\/+$/, "");
    if (!isHttpUrl(m3uUrl)) return fail("server");
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "").trim();
    if (!username || username.length > 120) return fail("username");
    if (!password || password.length > 120) return fail("password");
    credentials = { username, password };
  } else {
    playlistName = playlistName || null;
    m3uUrl = String(body.shortCode ?? "").trim();
    if (!/^[A-Za-z0-9_-]{2,64}$/.test(m3uUrl)) return fail("code");
  }

  const admin = createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: knownDevice, error: deviceReadError } = await admin
    .from("device_macs")
    .select("mac_address")
    .eq("mac_address", device)
    .maybeSingle();

  if (deviceReadError) return fail("save", 500);

  if (!knownDevice) {
    const { error: deviceInsertError } = await admin.from("device_macs").insert({
      mac_address: device,
    });
    if (deviceInsertError && deviceInsertError.code !== "23505") return fail("save", 500);
  }

  const listFields = {
    playlist_name: playlistName,
    playlist_type: type,
    m3u_url: m3uUrl,
    epg_url: epgUrl,
    protect_pin: protectPin,
    ...(credentials ?? {}),
  };

  let lookup = admin
    .from("lists")
    .select("id")
    .eq("mac_address", device)
    .eq("playlist_type", type)
    .order("id", { ascending: false })
    .limit(1);

  lookup = playlistName
    ? lookup.eq("playlist_name", playlistName)
    : lookup.is("playlist_name", null).eq("m3u_url", m3uUrl);

  const { data: matches, error: findError } = await lookup;
  if (findError) return fail("save", 500);

  const existingId = matches?.[0]?.id;
  if (existingId) {
    const { error } = await admin.from("lists").update(listFields).eq("id", existingId);
    if (error) return fail("save", 500);
    return json({ ok: true, created: false });
  }

  const { error } = await admin.from("lists").insert({
    mac_address: device,
    username: credentials?.username ?? "",
    password: credentials?.password ?? "",
    playlist_name: playlistName,
    playlist_type: type,
    m3u_url: m3uUrl,
    epg_url: epgUrl,
    protect_pin: protectPin,
  });

  if (error) return fail("save", 500);
  return json({ ok: true, created: true });
});
