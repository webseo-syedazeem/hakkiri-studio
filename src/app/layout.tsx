import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { elevenLabsKey } from "@/lib/ai/providers/elevenlabs";
import { aiConfig } from "@/lib/ai/config";
import { mockAiEnabled } from "@/lib/ai/mock";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

export function generateMetadata(): Metadata {
  const hasVoice = Boolean(elevenLabsKey() || aiConfig.deepgramKey) && !mockAiEnabled();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hakkiri.studio"),
    title: {
      default: "Hakkiri · Practise for the interview you actually have",
      template: "%s",
    },
    description: "Practise interviews and presentations with AI feedback that never judges your accent.",
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: ["/favicon.ico"],
    },
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
    verification: {
      google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "XiNOBpixzNRt0PdX_ByqjV0fKCLDyejeIcFXB-TqRwY",
    },
    other: {
      "hk-natural-voice": hasVoice ? "on" : "off",
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className="overflow-x-clip">
      <head>
        <meta
          name="google-site-verification"
          content={process.env.NEXT_PUBLIC_GSC_VERIFICATION || "XiNOBpixzNRt0PdX_ByqjV0fKCLDyejeIcFXB-TqRwY"}
        />
      </head>
      <body className="min-h-screen bg-booth text-ink antialiased overflow-x-clip w-full max-w-full">
        <AuthProvider>{children}</AuthProvider>
        <AnalyticsTracker />
        <Analytics />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
