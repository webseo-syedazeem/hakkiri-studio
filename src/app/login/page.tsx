import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Sign in · Hakkiri Studio",
  description: "Sign in to your Hakkiri Studio practice workspace.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-booth px-4 py-12">
      <AuthCard initialMode="signin" />
    </div>
  );
}
