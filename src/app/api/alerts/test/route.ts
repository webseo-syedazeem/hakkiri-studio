import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { alertsConfigured, reportProblem } from "@/lib/alerts/store";
import { isLaunch } from "@/lib/launch";
import { getCurrentUser } from "@/lib/auth/require";

export const runtime = "nodejs";

function isTimingSafeBearer(header: string | null, secret: string | undefined): boolean {
  if (!header || !secret) return false;
  const expected = `Bearer ${secret}`;
  const headerBuf = Buffer.from(header);
  const expectedBuf = Buffer.from(expected);
  if (headerBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(headerBuf, expectedBuf);
}

/** POST /api/alerts/test: sends a test alert so you can check the webhook or email works (not once launched). */
export async function POST(req: Request) {
  if (isLaunch()) return NextResponse.json({ error: "not-found" }, { status: 404 });

  const user = await getCurrentUser();
  const authHeader = req.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  const isSecretValid = isTimingSafeBearer(authHeader, adminSecret);

  if (!user && !isSecretValid) {
    return NextResponse.json({ error: "unauthorised", message: "Authentication required to trigger test alerts." }, { status: 401 });
  }

  const c = alertsConfigured();
  if (!c.webhook && !c.email) return NextResponse.json({ error: "not-configured", message: "Add ALERT_WEBHOOK_URL, or RESEND_API_KEY and ALERT_EMAIL_TO, to .env.local first." }, { status: 400 });
  await reportProblem({ source: "server", where: `Test alert ${new Date().toISOString().slice(11, 19)}`, message: "This is a test from Settings. If you can read it, alerts work." });
  return NextResponse.json({ ok: true, sentTo: [c.webhook && "webhook", c.email && "email"].filter(Boolean) });
}
