import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In · Hakkiri Studio",
  description: "Sign in to your private executive interview & presentation rehearsal studio.",
};

export default async function LoginPage() {
  const jar = await cookies();
  const authed = jar.get("hk_auth")?.value === "1";
  const assessed = jar.get("hk_assessed")?.value === "1";

  if (authed) {
    if (!assessed) {
      redirect("/assessment");
    }
    redirect("/");
  }

  return <AuthCard initialMode="login" />;
}
