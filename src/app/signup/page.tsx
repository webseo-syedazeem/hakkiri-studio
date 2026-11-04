import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Studio Pass · Hakkiri Studio",
  description: "Create your executive rehearsal pass for high-stakes interviews & board presentations.",
};

export default async function SignupPage() {
  const jar = await cookies();
  const authed = jar.get("hk_auth")?.value === "1";
  const assessed = jar.get("hk_assessed")?.value === "1";

  if (authed) {
    if (!assessed) {
      redirect("/assessment");
    }
    redirect("/");
  }

  return <AuthCard initialMode="signup" />;
}
