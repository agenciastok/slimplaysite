export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  if (forwarded) return forwarded.slice(0, 64);
  return (request.headers.get("x-real-ip") ?? "").trim().slice(0, 64);
}
