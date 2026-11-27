import type { Metadata } from "next";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingCvSection } from "@/components/landing/LandingCvSection";
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
import { getHomepageContentAsync } from "@/lib/site/site-content";
import { getCurrentUser } from "@/lib/auth/require";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContentAsync();

  const rawTitle = content.metaTitle || "Free AI Interview Practice From Your Job Description | Hakkiri";
  // Clean up any trailing brand suffixes so it never doubles into "Hakkiri · Hakkiri"
  const cleanTitle = rawTitle.replace(/\s*[|·-]\s*Hakkiri(\s*Studio)?(\s*[|·-]\s*Hakkiri)?$/i, "").trim();
  const finalTitle = cleanTitle ? `${cleanTitle} | Hakkiri` : "Free AI Interview Practice From Your Job Description | Hakkiri";

  const description =
    content.metaDescription ||
    "Free AI mock interview practice built from your job description and CV. A live AI interviewer asks out loud, follows up and scores every answer.";

  return {
    title: {
      absolute: finalTitle,
    },
    description,
    openGraph: {
      title: finalTitle,
      description,
      url: "https://www.hakkiri.studio",
      siteName: "Hakkiri",
      locale: "en_US",
      images: [{ url: "https://www.hakkiri.studio/opengraph-image.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description,
      images: ["https://www.hakkiri.studio/opengraph-image.png"],
    },
    alternates: {
      canonical: "https://hakkiri.studio/",
    },
  };
}

export default async function LandingPage({ searchParams }: { searchParams?: Promise<{ deleted?: string }> }) {
  const content = await getHomepageContentAsync();
  const deleted = (await searchParams)?.deleted === "1";
  const user = await getCurrentUser();
  const isLoggedIn = !!user?.id;

  const faqSchemaItems = [
    {
      "@type": "Question",
      name: "How do I start?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sign up with email or Google, paste the job description and add your CV. Your first mock interview starts in about two minutes.",
      },
    },
    {
      "@type": "Question",
      name: "Is it really free? For how long?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Hakkiri is free for everyone while the beta runs, with 10 hours of practice a month, which is about twenty 30-minute interviews. No card is needed.",
      },
    },
    {
      "@type": "Question",
      name: "Why is it free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Hakkiri is in beta. It is free while we test it with real users, and the one thing we ask is that you tell us where it is wrong.",
      },
    },
    {
      "@type": "Question",
      name: "What makes Hakkiri different from other interview practice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most tools give you a list of questions or score a recording afterwards. Hakkiri runs a live mock interview built from your job description and CV, asks out loud, follows up on what you actually said, and rewrites every answer into a stronger version in your own words.",
      },
    },
    {
      "@type": "Question",
      name: "Is the interviewer a real person?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The interviewer is AI. It speaks in a natural voice, listens to your answers and asks follow-up questions the way a hiring manager would.",
      },
    },
    {
      "@type": "Question",
      name: "What does the beta include?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Everything: mock interviews with follow-ups, a report after every interview, feedback on every answer, focused practice, the story bank, your prep sheet, the stages tracker, and presentations with audience Q&A.",
      },
    },
    {
      "@type": "Question",
      name: "Which kinds of interview does it cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any interview you add a job description for, including behavioral, strengths, competency, technical, situational and motivational questions, public sector values-based interviews, salary questions, and interview presentations. You can practice every stage, from the screening call to the final round.",
      },
    },
    {
      "@type": "Question",
      name: "Does it judge my accent?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Hakkiri scores what you say and how you structure it, never how you sound.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use it for presentations and pitches?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Add your slides to rehearse interview presentations, sales pitches, investor pitches, team updates and conference talks. Every slide is timed, and an AI audience asks questions at the end.",
      },
    },
    {
      "@type": "Question",
      name: "Can I practice for a specific job?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. That is what Hakkiri is built for. Paste the job description for the role you applied for, and every question is written for that job and your CV.",
      },
    },
    {
      "@type": "Question",
      name: "What is an AI mock interview?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An AI mock interview is a practice interview run by an AI interviewer instead of a person. You answer out loud, the AI asks follow-up questions, and you get feedback on every answer before the real interview.",
      },
    },
    {
      "@type": "Question",
      name: "Is Hakkiri the same as Hakkiri.io?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Hakkiri (hakkiri.studio) is an AI interview practice platform. It is not connected to Hakkiri.io, which is project management software.",
      },
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Structured Data (JSON-LD) for Search Engines & AI Overviews */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://www.hakkiri.studio/#organization",
                "name": "Hakkiri",
                "url": "https://www.hakkiri.studio/",
                "description":
                  "Hakkiri is a free AI mock interview platform built from your job description and CV.",
              },
              {
                "@type": "SoftwareApplication",
                "name": "Hakkiri",
                "url": "https://www.hakkiri.studio/",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "Web",
                "description":
                  "Free AI interview practice. A live AI interviewer asks questions out loud, follows up on your answers and gives feedback on every answer.",
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                "publisher": { "@id": "https://www.hakkiri.studio/#organization" },
              },
              {
                "@type": "FAQPage",
                mainEntity: faqSchemaItems,
              },
            ],
          }),
        }}
      />

      {deleted && (
        <div role="status" className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-3 text-center text-sm font-semibold text-emerald-300">
          Your account and data have been deleted.
        </div>
      )}

      <LandingHero content={content} isLoggedIn={isLoggedIn} />
      <LandingCvSection />
      <LandingLiveSection />
      <LandingSteps isLoggedIn={isLoggedIn} />
      <LandingWalkthrough />
      <LandingBento />
      <LandingPresentations />
      <LandingCompare />
      <LandingBeta isLoggedIn={isLoggedIn} />
      <LandingPrivacy />
      <LandingFaq />
      <LandingFinalCta />
      <StickyCta
        label={isLoggedIn ? "Go to Studio" : (content.primaryCtaText || "Sign up free")}
        href={isLoggedIn ? "/dashboard" : "/signup"}
      />
    </div>
  );
}
