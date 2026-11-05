import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Create Account · Hakkiri Studio",
  description: "Create your free Hakkiri Studio account for interview and presentation practice.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-booth px-4 py-12">
      <AuthCard initialMode="signup" />
    </div>
  );
}
