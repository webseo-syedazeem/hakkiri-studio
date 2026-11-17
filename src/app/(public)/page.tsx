import type { Metadata } from "next";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingLiveSection } from "@/components/landing/LandingLiveSection";
import { LandingSteps } from "@/components/landing/LandingSteps";
import { LandingWalkthrough } from "@/components/landing/LandingWalkthrough";
import { LandingBento } from "@/components/landing/LandingBento";
import { LandingPresentations } from "@/components/landing/LandingPresentations";
import { LandingCompare } from "@/components/landing/LandingCompare";
import { LandingBeta } from "@/components/landing/LandingBeta";
import { LandingPrivacy } from "@/components/landing/LandingPrivacy";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFinalCta } from "@/components/landing/LandingFinalCta";
import { StickyCta } from "@/components/marketing/StickyCta";

export const metadata: Metadata = {
  title: "Hakkiri · Practise for the interview you actually have",
  description:
    "The most advanced interview practice there is: a live AI interviewer built from your job description and CV that asks out loud, follows up on what you say, and shows you exactly what to fix, answer by answer. Free for everyone for a limited time while we’re in beta.",
  openGraph: {
    title: "Hakkiri · Practise for the interview you actually have",
    description: "Practise interviews and presentations with AI feedback that never judges your accent.",
    url: "https://hakkiri.studio",
    siteName: "Hakkiri Studio",
    locale: "en_GB",
    images: [{ url: "https://hakkiri.studio/opengraph-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkiri · Practise for the interview you actually have",
    description: "Practise interviews and presentations with AI feedback that never judges your accent.",
    images: ["https://hakkiri.studio/opengraph-image.png"],
  },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Structured Data (JSON-LD) for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Hakkiri",
              url: "https://hakkiri.studio",
              logo: "https://hakkiri.studio/icon.png",
            },
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Hakkiri Studio",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web, All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "GBP",
                description:
                  "Free beta interview practice with AI follow-up questions and personalized STAR scoring.",
              },
            },
          ]),
        }}
      />

      <LandingHero />
      <LandingLiveSection />
      <LandingSteps />
      <LandingWalkthrough />
      <LandingBento />
      <LandingPresentations />
      <LandingCompare />
      <LandingBeta />
      <LandingPrivacy />
      <LandingFaq />
      <LandingFinalCta />
      <StickyCta label="Sign up free" />
    </div>
  );
}
