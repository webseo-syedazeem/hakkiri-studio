import { adminDenied } from "@/lib/auth/admin";
import { NextResponse } from "next/server";
import { alertsConfigured, reportProblem } from "@/lib/alerts/store";
import { isLaunch } from "@/lib/launch";

export const runtime = "nodejs";


/** POST /api/alerts/test: sends a test alert so you can check the webhook or email works (not once launched). */
export async function POST(req: Request) {
  if (isLaunch()) return NextResponse.json({ error: "not-found" }, { status: 404 });

  // Sending a test alert reaches the team's channel, so it is for administrators (or a script with the admin secret).
  const denied = await adminDenied(req, { allowSecret: true });
  if (denied) return denied;

  const c = alertsConfigured();
  if (!c.webhook && !c.email) return NextResponse.json({ error: "not-configured", message: "Add ALERT_WEBHOOK_URL, or RESEND_API_KEY and ALERT_EMAIL_TO, to .env.local first." }, { status: 400 });
  await reportProblem({ source: "server", where: `Test alert ${new Date().toISOString().slice(11, 19)}`, message: "This is a test from Settings. If you can read it, alerts work." });
  return NextResponse.json({ ok: true, sentTo: [c.webhook && "webhook", c.email && "email"].filter(Boolean) });
}
