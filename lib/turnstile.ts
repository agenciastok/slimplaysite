export async function verifyTurnstile(token: unknown, action: string, remoteIp: string) {
  const secret = process.env.TURNSTILE_SECRET ?? "";
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? "")
      .split(",")
      .map((hostname) => hostname.trim())
      .filter(Boolean),
  );
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > 2048 ||
    !secret ||
    expectedHostnames.size === 0
  ) {
    return false;
  }

  try {
    const params = new URLSearchParams({ secret, response: token });
    if (remoteIp) params.set("remoteip", remoteIp);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      body: params,
    });
    if (!response.ok) return false;
    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
      "error-codes"?: string[];
    };
    console.info(
      JSON.stringify({
        turnstile: true,
        success: result.success === true,
        action: result.action ?? "",
        hostname: result.hostname ?? "",
        errors: result["error-codes"] ?? [],
      }),
    );
    return result.success === true && result.action === action && expectedHostnames.has(result.hostname ?? "");
  } catch {
    return false;
  }
}
