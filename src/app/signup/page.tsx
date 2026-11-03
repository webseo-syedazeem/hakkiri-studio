import { AuthCard } from "@/components/auth/AuthCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account · Hakkiri Studio",
  description: "Create your executive practice account and start rehearsing interviews and presentations.",
};

export default function SignupPage() {
  return <AuthCard initialMode="signup" />;
}
