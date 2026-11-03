import { AuthCard } from "@/components/auth/AuthCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In · Hakkiri Studio",
  description: "Sign in to your private executive interview & presentation rehearsal studio.",
};

export default function LoginPage() {
  return <AuthCard initialMode="login" />;
}
