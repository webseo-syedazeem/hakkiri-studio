import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, updateUser } from "@/lib/auth/users";

export async function GET() {
  const jar = await cookies();
  const authed = jar.get("hk_auth")?.value === "1";
  if (!authed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = getAuthenticatedUser(jar);
  return NextResponse.json({ ok: true, user });
}

export async function PATCH(req: Request) {
  const jar = await cookies();
  const authed = jar.get("hk_auth")?.value === "1";
  if (!authed) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const user = getAuthenticatedUser(jar);

  const updates: Record<string, any> = {};
  if (typeof body.assessed === "boolean") updates.assessed = body.assessed;
  if (typeof body.targetRole === "string") updates.targetRole = body.targetRole.trim();
  if (typeof body.plan === "string") updates.plan = body.plan;

  let updated = user;
  if (user.id && user.id.startsWith("usr_") && user.id !== "usr_active_session") {
    const res = updateUser(user.id, updates);
    if (res) updated = res;
  }

  const response = NextResponse.json({ ok: true, user: updated });

  if (typeof body.assessed === "boolean") {
    response.cookies.set("hk_assessed", body.assessed ? "1" : "0", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}
