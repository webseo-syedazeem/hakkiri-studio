import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth/users";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body ?? {};

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Please enter your email address." },
        { status: 400 }
      );
    }

    const res = requestPasswordReset(email);
    return NextResponse.json(res);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not process password reset request." },
      { status: 500 }
    );
  }
}
