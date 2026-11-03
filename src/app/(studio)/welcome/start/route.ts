/**
 * GET /welcome/start?next=/interviews/new: remembers that you've seen the
 * welcome screen (so Home stops sending you there) and carries on.
 * The redirect is relative, so it stays on whichever address you're using.
 */
export function GET(req: Request) {
  const next = new URL(req.url).searchParams.get("next") ?? "/";
  const safe = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return new Response(null, {
    status: 303,
    headers: {
      location: safe,
      "set-cookie": `hk_welcomed=1; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
    },
  });
}
