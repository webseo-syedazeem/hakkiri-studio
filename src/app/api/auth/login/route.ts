import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const res = verifyCredentials(email, password);
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 401 });
    }

    const user = res.user;
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days

    const response = NextResponse.json({ ok: true, user });

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

    response.cookies.set("hk_assessed", user.assessed ? "1" : "0", {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred during sign-in." },
      { status: 500 }
    );
  }
}
