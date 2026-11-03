export function GET(req: Request) {
  const next = new URL(req.url).searchParams.get("next") ?? "/";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const headers = new Headers();
  headers.set("location", safe);
  headers.append("set-cookie", `hk_welcomed=1; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`);
  headers.append("set-cookie", `hk_assessed=1; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`);
  return new Response(null, {
    status: 303,
    headers,
  });
}
