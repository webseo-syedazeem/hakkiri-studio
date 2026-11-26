import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowRight,
  IconSparkles,
  IconClock,
  IconCheckCircle,
  IconXCircle,
  IconChevronRight,
  IconHelpCircle,
  IconCompass,
  IconTarget,
  IconCheck,
} from "@/components/interview-questions/Icons";
import {
  StrengthsWeaknessesBuilder,
  SampleAnswersTabs,
  StrengthsWeaknessesFaqAccordion,
} from "@/components/blog/StrengthsWeaknessesClient";
import { FAQ_LIST } from "@/lib/blog/strengths-weaknesses-data";

export const metadata: Metadata = {
  title: {
    absolute: 'How to Answer "What Are Your Strengths and Weaknesses?" | Hakkiri',
  },
  description:
    "How to answer the strengths and weaknesses interview question, with a simple formula, sample answers, lists of good strengths and weaknesses, and mistakes to avoid.",
  keywords: [
    "what is your strength and weakness interview question answer",
    "how to answer strength and weakness interview questions",
    "weakness interview questions and answers",
    "what is your weakness interview question and answer",
    "what are your strengths and weaknesses",
    "interview strengths and weaknesses examples",
    "strengths and weaknesses job interview",
    "good weaknesses for interview",
  ],
  alternates: {
    canonical: "https://hakkiri.studio/blog/strengths-and-weaknesses-interview-question",
  },
  openGraph: {
    title: 'How to Answer "What Are Your Strengths and Weaknesses?" | Hakkiri',
    description:
      "How to answer the strengths and weaknesses interview question, with a simple formula, sample answers, lists of good strengths and weaknesses, and mistakes to avoid.",
    url: "https://hakkiri.studio/blog/strengths-and-weaknesses-interview-question",
    siteName: "Hakkiri",
    type: "article",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: 'How to Answer "What Are Your Strengths and Weaknesses?"',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'How to Answer "What Are Your Strengths and Weaknesses?" | Hakkiri',
    description:
      "How to answer the strengths and weaknesses interview question, with a simple formula, sample answers, lists of good strengths and weaknesses, and mistakes to avoid.",
    images: ["https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"],
  },
};

export default function StrengthsAndWeaknessesPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_LIST.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: 'How to Answer "What Are Your Strengths and Weaknesses?" (With Examples)',
    description:
      "How to answer the strengths and weaknesses interview question, with a simple formula, sample answers, lists of good strengths and weaknesses, and mistakes to avoid.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    datePublished: "2026-11-25T12:00:00.000Z",
    dateModified: "2026-11-25T12:00:00.000Z",
    author: {
      "@type": "Person",
      name: "Eleanor Vance",
      jobTitle: "Senior Career Consultant & Former Executive Recruiter",
    },
    publisher: {
      "@type": "Organization",
      name: "Hakkiri",
      logo: {
        "@type": "ImageObject",
        url: "https://hakkiri.studio/icon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://hakkiri.studio/blog/strengths-and-weaknesses-interview-question",
    },
  };

  return (
    <div className="w-full bg-[#fafbfc] text-slate-900 min-h-screen">
      {/* Article + FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-100 bg-white/80 backdrop-blur-md py-3 text-xs text-slate-500 sticky top-0 z-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 flex items-center gap-2">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <IconChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
          <IconChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800 truncate">Strengths and Weaknesses</span>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            INTERVIEW QUESTION GUIDE
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.14]">
            How to Answer &ldquo;What Are Your Strengths and Weaknesses?&rdquo; (With Examples)
          </h1>

          <div className="mt-6 rounded-2xl border-l-4 border-blue-600 bg-white p-5 sm:p-6 text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl border border-slate-200/80 shadow-xs">
            To answer <strong className="text-slate-950 font-bold">&ldquo;What are your strengths and weaknesses?&rdquo;</strong>, pick one or two strengths the job actually needs and prove each with a short example. For your weakness, choose a real but fixable skill gap that is not essential for the role, explain what you are doing to improve it, and show the progress you have made. Keep the whole answer under two minutes.
          </div>

          <p className="mt-5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Interviewers ask this to see how well you know yourself, whether your strengths match the job, and whether you can talk about a weakness honestly without panicking. Here is a simple way to answer both halves, with examples you can adapt.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconSparkles className="h-4 w-4" />
              Practice this question with an AI interviewer
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-slate-500 font-medium">
              Free during beta. Speak your answer out loud and get a score.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: AT A GLANCE (3 SIGNATURE STAT CARDS) */}
      <section className="py-12 sm:py-16 border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-8">
            &ldquo;Strengths &amp; Weaknesses&rdquo; at a glance
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-300">
              <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                60–120 sec
              </div>
              <div className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                How long your total combined answer should be.
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-300">
              <div className="text-3xl sm:text-4xl font-black text-purple-600 tracking-tight">
                50 / 50 split
              </div>
              <div className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Equal balance between proof of strength and proactive fix.
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-300">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                100% Real
              </div>
              <div className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Zero clichés like &ldquo;perfectionist&rdquo; or &ldquo;work too hard&rdquo;.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE PROVEN FRAMEWORK (3 STEP CARDS) */}
      <section id="formula" className="py-14 sm:py-20 border-b border-slate-200/80 bg-slate-50/50">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              <IconCompass className="h-4 w-4" /> PROVEN FRAMEWORK
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              The 3-Step Answer Formula
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              This is the simplest way to structure your answer. Both halves take just three clean sentences.
            </p>
          </div>

          {/* 3 Formula Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all">
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800 mb-3">
                  1. Match
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Name the core skill
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Choose a primary strength the job description asks for, and a real weakness that is not fatal to the position.
                </p>
              </div>
              <div className="mt-6 rounded-2xl bg-blue-50/70 p-4 border border-blue-100 text-xs text-slate-700 italic font-serif leading-relaxed">
                &ldquo;My biggest strength is staying calm under pressure with upset clients...&rdquo;
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-purple-300 transition-all">
              <div>
                <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800 mb-3">
                  2. Prove
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Provide concrete evidence
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Give a specific story with numbers or metrics for your strength, and a realistic example of how the weakness showed up.
                </p>
              </div>
              <div className="mt-6 rounded-2xl bg-purple-50/70 p-4 border border-purple-100 text-xs text-slate-700 italic font-serif leading-relaxed">
                &ldquo;Last year I turned 85% of escalated complaints into repeat customers...&rdquo;
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all">
              <div>
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 mb-3">
                  3. Action
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Show future impact &amp; the fix
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Explain how your strength benefits their team, and clearly outline the proactive action you are taking to fix the weakness.
                </p>
              </div>
              <div className="mt-6 rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100 text-xs text-slate-700 italic font-serif leading-relaxed">
                &ldquo;I now time-block my deliverables and hit 100% of my deadlines this quarter.&rdquo;
              </div>
            </div>
          </div>

          {/* Interactive Answer Builder Component */}
          <div className="mt-12">
            <StrengthsWeaknessesBuilder />
          </div>
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE SAMPLE ANSWERS (TABBED SYSTEM) */}
      <section className="py-14 sm:py-20 border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              &ldquo;Strengths &amp; Weaknesses&rdquo; sample answers
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick the scenario closest to your target role and adapt with your own metrics. Never memorize word-for-word.
            </p>
          </div>

          <SampleAnswersTabs />
        </div>
      </section>

      {/* SECTION 5: WHAT TO SAY AND WHAT TO LEAVE OUT (DO'S AND DON'TS) */}
      <section className="py-14 sm:py-20 border-b border-slate-200/80 bg-slate-50/50">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              What to say and what to leave out
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Essential guidelines to score maximum marks with hiring managers and avoid immediate red flags.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DO CARD */}
            <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/30 p-7 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-black text-lg mb-6">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  Do
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-3">
                    <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Match the job description:</strong> Pick 1 or 2 strengths that directly support their core daily challenges.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Back it with a number:</strong> Time saved, complaints resolved, revenue grown, or turnaround accelerated.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Name a real, fixable gap:</strong> Public speaking, advanced tooling, delegating, or saying no too rarely.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Show active, ongoing progress:</strong> Highlight courses completed, weekly habits built, or mentor check-ins.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Keep it under 90 seconds:</strong> Keep the cadence crisp, positive, and forward-looking.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* DON'T CARD */}
            <div className="rounded-3xl border-2 border-rose-200 bg-rose-50/30 p-7 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-rose-800 font-black text-lg mb-6">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white">
                    <IconXCircle className="h-4 w-4" />
                  </span>
                  Don&apos;t
                </div>

                <ul className="space-y-4 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-3">
                    <IconXCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Use fake humblebrag clichés:</strong> Never say &ldquo;I&apos;m a perfectionist&rdquo; or &ldquo;I work too hard.&rdquo;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconXCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Disqualify yourself:</strong> Don&apos;t pick a weakness that is an absolute requirement on the job posting.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconXCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Rambling without proof:</strong> Listing 5 adjectives without a story scores zero on recruiter rubrics.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconXCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Dwelling on the flaw:</strong> Spending 80% of your time defending the weakness makes you look defensive.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <IconXCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>Share personal problems:</strong> Keep all answers strictly focused on workplace skills and workflow habits.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: STRENGTHS TO CHOOSE FROM TABLE */}
      <section className="py-14 sm:py-20 border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Strengths to Choose From
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Select strengths that map directly to your role level and industry requirements:
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200/90 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-4 w-44">Skill Category</th>
                    <th scope="col" className="px-6 py-4">High-Scoring Examples</th>
                    <th scope="col" className="px-6 py-4">Best Suited For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">People skills</td>
                    <td className="px-6 py-4 text-slate-700">Communication, active listening, empathy, conflict resolution</td>
                    <td className="px-6 py-4 text-slate-600">Customer service, healthcare, sales, management</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">Work habits</td>
                    <td className="px-6 py-4 text-slate-700">Workflow automation, organization, meticulous QA, time-blocking</td>
                    <td className="px-6 py-4 text-slate-600">Operations, admin, finance, engineering</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">Thinking skills</td>
                    <td className="px-6 py-4 text-slate-700">Root-cause analysis, data interpretation, system architecture</td>
                    <td className="px-6 py-4 text-slate-600">Software engineering, product strategy, analytics</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">Leadership</td>
                    <td className="px-6 py-4 text-slate-700">Mentoring junior colleagues, proactive ownership, decisive trade-offs</td>
                    <td className="px-6 py-4 text-slate-600">Team leads, managers, directors, executives</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">Adaptability</td>
                    <td className="px-6 py-4 text-slate-700">Rapid tool adoption, calm under pressure, cross-functional agility</td>
                    <td className="px-6 py-4 text-slate-600">Startups, agile teams, career pivots, internships</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: QUESTIONS THAT OFTEN COME NEXT */}
      <section className="py-14 sm:py-20 border-b border-slate-200/80 bg-slate-50/50">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Questions that often come next
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your answer sets up the rest of the interview. Be ready for these immediate follow-up questions:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Link
              href="/interview-questions"
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Follow-up 1</div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                &ldquo;Tell me more about that project.&rdquo;
              </h3>
              <p className="mt-1 text-xs text-slate-500">Have specific metrics and your exact personal role ready.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                View STAR answer framework →
              </span>
            </Link>

            <Link
              href="/interview-questions/why-should-we-hire-you"
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Follow-up 2</div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                &ldquo;Why should we hire you?&rdquo;
              </h3>
              <p className="mt-1 text-xs text-slate-500">Connect your proven strengths directly to their 90-day targets.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                View 3-sentence pitch formula →
              </span>
            </Link>

            <Link
              href="/interview-questions/tell-me-about-yourself"
              className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Follow-up 3</div>
              <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                &ldquo;Tell me about yourself.&rdquo;
              </h3>
              <p className="mt-1 text-xs text-slate-500">The 60 to 90-second present, past, future elevator pitch.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                View 60s pitch guide →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8: FREQUENTLY ASKED QUESTIONS */}
      <section className="py-14 sm:py-20 border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">FAQ</span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Clear, direct guidance for answering strengths and weaknesses in any job interview.
            </p>
          </div>

          <div className="max-w-3xl">
            <StrengthsWeaknessesFaqAccordion />
          </div>
        </div>
      </section>

      {/* SECTION 9: PRACTICE IT OUT LOUD & BOTTOM CTA */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-bold text-blue-100">
              <IconSparkles className="h-3.5 w-3.5 text-blue-200" />
              Free Real-Time Voice Simulation
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Practice this answer out loud with AI
            </h2>
            <p className="mt-4 text-base sm:text-lg text-blue-100 leading-relaxed font-medium">
              This question is easy in your head and hard out loud, especially when an interviewer asks: <em className="text-white font-semibold">&ldquo;Can you give me another example?&rdquo;</em>. Hakkiri listens to your microphone, grades your tone and pacing, and asks real follow-ups.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-blue-700 shadow-xl shadow-blue-900/30 hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
              >
                Start Free Practice Session
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/interview-questions"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all"
              >
                Browse All 20 Questions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
