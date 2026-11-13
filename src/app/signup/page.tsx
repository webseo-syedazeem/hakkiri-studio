import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";

export const metadata: Metadata = {
  title: "Create Account · Hakkiri Studio",
  description: "Create your free Hakkiri Studio account for interview and presentation practice.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-booth px-4 py-12">
      {/* Subtle ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(74,90,240,0.12),transparent_70%)] animate-pulse-glow"
      />
      <AuthCard initialMode="signup" />
    </div>
  );
}
