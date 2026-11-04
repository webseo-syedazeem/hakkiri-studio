import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser } from "@/lib/auth/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, targetRole } = body ?? {};

    const jar = await cookies();
    const existingVault = jar.get("hk_u_vault")?.value;

    const res = createUser({
      name,
      email,
      password,
      targetRole,
      vaultCookie: existingVault,
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
    }

    const user = res.user;
    const maxAge = 60 * 60 * 24 * 365; // 365 days

    const response = NextResponse.json({ ok: true, user });

    // Resilient cross-serverless credentials vault cookie
    response.cookies.set("hk_u_vault", res.vaultToken, {
      path: "/",
      maxAge,
      sameSite: "lax",
      httpOnly: true,
    });

    response.cookies.set("hk_auth", "1", {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    response.cookies.set("hk_user_id", user.id, {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    response.cookies.set("hk_user", encodeURIComponent(user.name), {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    response.cookies.set("hk_role", encodeURIComponent(user.targetRole), {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    // Brand new user needs diagnostic assessment
    response.cookies.set("hk_assessed", "0", {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred during account creation." },
      { status: 500 }
    );
  }
}
