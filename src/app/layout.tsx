import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { elevenLabsKey } from "@/lib/ai/providers/elevenlabs";
import { mockAiEnabled } from "@/lib/ai/mock";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "Hakkiri Studio",
  description: "Practise interviews and presentations with feedback that never judges your accent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-booth text-ink antialiased">
        {/* Tells speak() whether a natural voice exists, so the browser doesn't ask for one that doesn't. */}
        <meta name="hk-natural-voice" content={elevenLabsKey() && !mockAiEnabled() ? "on" : "off"} />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
