import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/auth/users";

export const runtime = "nodejs";

const PLAN_MAP: Record<string, { name: string; price: number; recurring: boolean }> = {
  "job-search": {
    name: "Hakkiri Job Search Pass (3 Months)",
    price: 34.99,
    recurring: false,
  },
  monthly: {
    name: "Hakkiri Monthly Rehearsal Subscription",
    price: 14.99,
    recurring: true,
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { planId } = body ?? {};

    if (!planId || !PLAN_MAP[planId]) {
      return NextResponse.json(
        { ok: false, error: "Invalid plan selected." },
        { status: 400 }
      );
    }

    const plan = PLAN_MAP[planId];
    const jar = await cookies();
    const activeUser = getAuthenticatedUser(jar);
    const host = req.headers.get("host") || "hakkiri-studio.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe Secret Key is configured, create live Stripe Checkout Session
    if (stripeKey && stripeKey.startsWith("sk_")) {
      const params = new URLSearchParams();
      params.append("mode", plan.recurring ? "subscription" : "payment");
      params.append("success_url", `${origin}/studio?payment=success&plan=${planId}`);
      params.append("cancel_url", `${origin}/pricing?payment=cancelled`);
      if (activeUser.email) {
        params.append("customer_email", activeUser.email);
      }
      params.append("line_items[0][price_data][currency]", "gbp");
      params.append("line_items[0][price_data][product_data][name]", plan.name);
      params.append("line_items[0][price_data][unit_amount]", String(Math.round(plan.price * 100)));
      params.append("line_items[0][quantity]", "1");

      if (plan.recurring) {
        params.append("line_items[0][price_data][recurring][interval]", "month");
      }

      const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const session = await stripeRes.json();

      if (!stripeRes.ok || !session.url) {
        console.error("[stripe] checkout creation failed:", session);
        return NextResponse.json(
          {
            ok: false,
            error: session.error?.message || "Could not initialize Stripe checkout session.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true, url: session.url });
    }

    // If Stripe key is pending, provide a clear simulated checkout readiness response
    return NextResponse.json({
      ok: true,
      simulated: true,
      message: `Checkout endpoint ready. Once STRIPE_SECRET_KEY is provided in Vercel environment variables, users will be redirected to live Stripe checkout for ${plan.name} (£${plan.price}).`,
    });
  } catch (err) {
    console.error("[billing] checkout error:", err);
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred during checkout initialization." },
      { status: 500 }
    );
  }
}
