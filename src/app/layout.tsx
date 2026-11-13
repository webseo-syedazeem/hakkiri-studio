import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { elevenLabsKey } from "@/lib/ai/providers/elevenlabs";
import { aiConfig } from "@/lib/ai/config";
import { mockAiEnabled } from "@/lib/ai/mock";
import { AuthProvider } from "@/lib/auth/AuthContext";

export function generateMetadata(): Metadata {
  const hasVoice = Boolean(elevenLabsKey() || aiConfig.deepgramKey) && !mockAiEnabled();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hakkiri.studio"),
    title: {
      default: "Hakkiri · Practise for the interview you actually have",
      template: "%s · Hakkiri",
    },
    description: "Practise interviews and presentations with AI feedback that never judges your accent.",
    openGraph: {
      title: "Hakkiri · Practise for the interview you actually have",
      description: "Practise interviews and presentations with AI feedback that never judges your accent.",
      url: "https://hakkiri.studio",
      siteName: "Hakkiri Studio",
      images: [
        {
          url: "/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: "Hakkiri Interview Practice Platform",
        },
      ],
      locale: "en_GB",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Hakkiri · Practise for the interview you actually have",
      description: "Practise interviews and presentations with AI feedback that never judges your accent.",
      images: ["/opengraph-image.png"],
    },
    other: {
      "hk-natural-voice": hasVoice ? "on" : "off",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className="min-h-screen bg-booth text-ink antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
