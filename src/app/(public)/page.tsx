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
import { getHomepageContentAsync } from "@/lib/site/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContentAsync();

  const title = content.metaTitle || "Free AI Interview Practice From Your Job Description | Hakkiri";
  const description =
    content.metaDescription ||
    "Free AI mock interview practice built from your job description and CV. A live AI interviewer asks out loud, follows up and scores every answer.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://www.hakkiri.studio",
      siteName: "Hakkiri",
      locale: "en_US",
      images: [{ url: "https://www.hakkiri.studio/opengraph-image.png", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.hakkiri.studio/opengraph-image.png"],
    },
  };
}

export default async function LandingPage() {
  const content = await getHomepageContentAsync();

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
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Hakkiri",
              url: "https://www.hakkiri.studio",
              logo: "https://www.hakkiri.studio/icon.png",
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Hakkiri",
              url: "https://www.hakkiri.studio",
              description: "Free AI mock interview practice built from your job description and CV.",
            },
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Hakkiri",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web, All",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description:
                  "Free AI interview practice for everyone while the beta runs.",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqSchemaItems,
            },
          ]),
        }}
      />

      <LandingHero content={content} />
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
      <StickyCta label={content.primaryCtaText || "Sign up free"} />
    </div>
  );
}
