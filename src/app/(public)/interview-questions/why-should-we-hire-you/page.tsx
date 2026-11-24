import type { Metadata } from "next";
import Link from "next/link";
import { 
  IconArrowRight, 
  IconSparkles, 
  IconCheckCircle, 
  IconXCircle, 
  IconChevronRight, 
  IconHelpCircle, 
  IconCompass, 
  IconTarget,
  IconBriefcase,
  IconUserCheck
} from "@/components/interview-questions/Icons";
import { 
  WhyHireAnswerBuilder, 
  WhyHireSituationTabs, 
  WhyHireJobGrid, 
  WhyHireFaqAccordion 
} from "@/components/interview-questions/WhyHireClient";
import { 
  WHY_HIRE_FAQS, 
  WEAK_TO_STRONG_DRAFTS, 
  INTERVIEWER_CHECKLIST 
} from "@/components/interview-questions/data";

export const metadata: Metadata = {
  title: {
    absolute: "Why Should We Hire You? 20+ Best Answer Examples | Hakkiri",
  },
  description:
    "How to answer \"Why should we hire you?\" with a simple 3-sentence formula, a weak-to-strong example and 20+ sample answers by job and experience level.",
  keywords: [
    "why should we hire you",
    "why should we hire you answer",
    "how to answer why should we hire you",
    "why should we hire you answers examples",
    "why should we hire you over other candidates",
    "why do you think we should hire you",
    "tell us why we should hire you",
    "best answer for why should we hire you"
  ],
  alternates: {
    canonical: "https://hakkiri.studio/interview-questions/why-should-we-hire-you",
  },
  openGraph: {
    title: "Why Should We Hire You? 20+ Best Answer Examples | Hakkiri",
    description: "How to answer \"Why should we hire you?\" with a simple 3-sentence formula, a weak-to-strong example and 20+ sample answers by job and experience level.",
    url: "https://hakkiri.studio/interview-questions/why-should-we-hire-you",
    siteName: "Hakkiri",
    type: "article",
  },
};

export default function WhyShouldWeHireYouPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": WHY_HIRE_FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  return (
    <div className="w-full bg-white text-slate-900">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-100 bg-slate-50/50 py-3 text-xs text-slate-500">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 flex items-center gap-2">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <IconChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/interview-questions" className="hover:text-slate-900 transition-colors">Interview Questions</Link>
          <IconChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800">Why Should We Hire You</span>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-blue-50/40 via-white to-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            INTERVIEW QUESTION GUIDE
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
            How to Answer "Why Should We Hire You?"
          </h1>

          <div className="mt-6 rounded-2xl border-l-4 border-blue-600 bg-slate-50 p-5 sm:p-6 text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
            To answer <strong className="text-slate-900">"Why should we hire you?",</strong> give a short pitch of 30 to 60 seconds that connects two or three of your strongest skills to what the job needs, proves each one with a real example, and ends with how you will help the team. Think of it as three sentences: <strong className="text-slate-900">what they need</strong>, <strong className="text-slate-900">how you have already done it</strong>, and <strong className="text-slate-900">what you will do for them</strong>.
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Practice this question with an AI interviewer
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-slate-500 font-medium">
              Free during beta. Say your answer out loud and get a score.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT THEY ARE REALLY ASKING (3 CARDS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/80 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              🎯 HIRING PSYCHOLOGY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              What the interviewer is really asking
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Behind "Why should we hire you?" are three unspoken hiring manager tests:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="group relative rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl group-hover:bg-blue-400/20 transition-all" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/25">
                    <IconTarget className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-800">
                    Test 1: Alignment
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">1. Fit</h3>
                <p className="mt-2 text-sm font-bold text-slate-800 font-serif italic">
                  "Did you actually study what this team needs?"
                </p>
              </div>
              <p className="mt-6 pt-4 border-t border-blue-100 text-xs text-slate-600 leading-relaxed font-medium">
                Mention specifically what this role and team needs today—don't recite a generic bio.
              </p>
            </div>

            <div className="group relative rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/90 via-white to-purple-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-purple-400/10 blur-2xl group-hover:bg-purple-400/20 transition-all" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/25">
                    <IconBriefcase className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold text-purple-800">
                    Test 2: Evidence
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">2. Proof</h3>
                <p className="mt-2 text-sm font-bold text-slate-800 font-serif italic">
                  "Can you prove your claims with real numbers?"
                </p>
              </div>
              <p className="mt-6 pt-4 border-t border-purple-100 text-xs text-slate-600 leading-relaxed font-medium">
                Unsubstantiated claims sound like everyone else. Anchor your pitch in one solid outcome.
              </p>
            </div>

            <div className="group relative rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl group-hover:bg-emerald-400/20 transition-all" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/25">
                    <IconUserCheck className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                    Test 3: ROI
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">3. Value</h3>
                <p className="mt-2 text-sm font-bold text-slate-800 font-serif italic">
                  "Will you make my team faster and less stressed?"
                </p>
              </div>
              <p className="mt-6 pt-4 border-t border-emerald-100 text-xs text-slate-600 leading-relaxed font-medium">
                Close with what the business gets from week one: saved hours, reduced churn, or higher revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE 3-SENTENCE FORMULA (3 STEP CARDS) */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <IconCompass className="h-3.5 w-3.5" /> THE 3-SENTENCE FORMULA
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              The 3-sentence formula
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              You can construct a winning pitch in just three sentences. It takes only 30 to 60 seconds to speak out loud.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="group rounded-3xl border-2 border-blue-200/90 bg-gradient-to-b from-blue-50/50 via-white to-white p-7 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md shadow-blue-500/30">
                    1
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
                    THEIR NEED
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">What the job asks for</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  State the core requirement from their job listing in clear, decisive language.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs sm:text-sm italic text-blue-950 font-serif leading-relaxed shadow-2xs">
                "You need someone who can handle a high volume of complex customer tickets without losing calm."
              </blockquote>
            </div>

            {/* Step 2 */}
            <div className="group rounded-3xl border-2 border-purple-200/90 bg-gradient-to-b from-purple-50/50 via-white to-white p-7 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600 absolute top-0 left-0" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-sm shadow-md shadow-purple-500/30">
                    2
                  </span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">
                    YOUR PROOF
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Where you have done it</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Give one direct achievement or experience that proves you have already handled this.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-xs sm:text-sm italic text-purple-950 font-serif leading-relaxed shadow-2xs">
                "I've done that for two years at Acme, maintaining a 96% CSAT score while training new reps."
              </blockquote>
            </div>

            {/* Step 3 */}
            <div className="group rounded-3xl border-2 border-emerald-200/90 bg-gradient-to-b from-emerald-50/50 via-white to-white p-7 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-600 absolute top-0 left-0" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-black text-sm shadow-md shadow-emerald-500/30">
                    3
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                    YOUR VALUE
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">What they get</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Explain the measurable impact the team can count on from your very first weeks.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs sm:text-sm italic text-emerald-950 font-serif leading-relaxed shadow-2xs">
                "I can hit the ground running and help your team cut response wait times from my first week."
              </blockquote>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 4: WEAK TO STRONG (3 DRAFTS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              📈 REAL TRANSFORMATION
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              From weak to strong: one answer, three drafts
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The exact same candidate applying for customer service, elevating their pitch step by step.
            </p>
          </div>

          <div className="space-y-6">
            {WEAK_TO_STRONG_DRAFTS.map((draft, idx) => (
              <div
                key={idx}
                className={`rounded-3xl border-2 p-7 sm:p-8 transition-all duration-300 ${
                  idx === 2
                    ? "border-emerald-400 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 shadow-xl"
                    : idx === 1
                    ? "border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-white shadow-sm"
                    : "border-slate-200 bg-white shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60">
                  <span className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-black border ${draft.badgeClass}`}>
                    {draft.draft}
                  </span>
                  {idx === 2 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      ⭐ Hiring Manager Winner
                    </span>
                  )}
                </div>
                <blockquote className="text-sm sm:text-base italic leading-relaxed text-slate-900 font-serif">
                  "{draft.quote}"
                </blockquote>
                <div className={`mt-5 rounded-2xl p-4 text-xs font-medium ${
                  idx === 2 ? "bg-emerald-100/90 text-emerald-950 border border-emerald-200/80 font-bold" : "bg-slate-100 text-slate-700 border border-slate-200/60"
                }`}>
                  {draft.analysis}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CHECKLIST (TABLE) */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              ⚖️ INTERVIEWER BENCHMARK
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              How interviewers judge your answer
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Use this checklist to benchmark what makes a strong answer vs what hurts your candidacy.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th scope="col" className="px-6 py-4">They listen for</th>
                    <th scope="col" className="px-6 py-4 text-emerald-300">Strong answer (Hire)</th>
                    <th scope="col" className="px-6 py-4 text-rose-300">Weak answer (Pass)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {INTERVIEWER_CHECKLIST.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-900 whitespace-nowrap">{row.listenFor}</td>
                      <td className="px-6 py-4 text-emerald-950 font-semibold bg-emerald-50/20">
                        <span className="inline-flex items-center gap-2">
                          <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                          {row.strong}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-rose-950 font-medium bg-rose-50/20">
                        <span className="inline-flex items-center gap-2">
                          <IconXCircle className="h-4 w-4 text-rose-500 shrink-0" />
                          {row.weak}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ANSWER BUILDER */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              ⚡ INSTANT PITCH STUDIO
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Build your answer
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in each part of your 3-sentence pitch, practice out loud and keep it under 60 seconds.
            </p>
          </div>

          <WhyHireAnswerBuilder />
        </div>
      </section>

      {/* SECTION 7: SAMPLE ANSWERS BY SITUATION (TABS) */}
      <section id="sample-situations" className="scroll-mt-20 border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              🎯 5 CAREER SITUATIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Sample answers by situation
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Choose the scenario that matches your background and adapt the wording.
            </p>
          </div>

          <WhyHireSituationTabs />
        </div>
      </section>

      {/* SECTION 8: SAMPLE ANSWERS BY JOB (GRID OF CARDS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              💼 15 PROFESSIONS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Sample answers by job
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Short answers you can adapt. Each follows the Need · Proof · Value formula.
            </p>
          </div>

          <WhyHireJobGrid />
        </div>
      </section>

      {/* SECTION 9: DO'S AND DON'TS */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 text-slate-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              ⚖️ PITCH RULES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Do's and don'ts
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Deliver your pitch with calm authority using these proven guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DO */}
            <div className="rounded-[28px] border-2 border-emerald-300/80 bg-gradient-to-b from-emerald-50/90 via-white to-white p-7 sm:p-8 shadow-lg">
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-emerald-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                  <IconCheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Do (High Value Moves)</h3>
                  <p className="text-xs text-emerald-800 font-semibold">What wins executive trust</p>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Start with what the job needs</strong> to prove you did your homework on their actual problems.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Focus on 2 or 3 core strengths</strong> rather than laundry-listing every buzzword.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Prove each claim with a number</strong> (e.g. 20% growth, 30h saved, 99.9% uptime).</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">State your value in week one:</strong> "I can help your team reduce tickets immediately."</span>
                </li>
              </ul>
            </div>

            {/* DON'T */}
            <div className="rounded-[28px] border-2 border-rose-300/80 bg-gradient-to-b from-rose-50/90 via-white to-white p-7 sm:p-8 shadow-lg">
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-rose-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25">
                  <IconXCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Don't (Value Killers)</h3>
                  <p className="text-xs text-rose-800 font-semibold">Mistakes that erode credibility</p>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Reading your resume chronologically.</strong> They have already reviewed your timeline.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Talking about what you want from them</strong> (pay, perks, resume prestige) instead of ROI.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Speaking negatively about other candidates</strong> or claiming "I'm the only one who can do this."</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Reciting a memorized monologue.</strong> Speak with conversational presence and conviction.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: OTHER WAYS IT IS ASKED + FOLLOW-UPS */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Other ways you will hear this question
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The same 3-sentence answer works for all of these phrasing variations:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Common Variations
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>"Why do you think we should hire you?"</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>"Tell us why we should hire you."</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>"What makes you the best candidate?"</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>"What can you bring to this role?"</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  <span>"Why are you a good fit for this position?"</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Follow-up questions to expect
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li>
                  <strong className="text-slate-900">"Can you give me an example of that?"</strong> Have one more story ready for each skill you mention.
                </li>
                <li>
                  <strong className="text-slate-900">"What was the result?"</strong> Know your numbers, even rough ones.
                </li>
                <li>
                  <strong className="text-slate-900">"What would you do in your first 90 days?"</strong> Name one or two practical first steps.
                </li>
                <li>
                  <strong className="text-slate-900">"What's one weakness that might hold you back here?"</strong> Be honest and say what you are doing about it.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-blue-50/70 p-4 text-xs text-blue-900 font-medium flex flex-wrap items-center gap-2">
            <span>Preparing for more questions? See</span>
            <Link href="/interview-questions/tell-me-about-yourself" className="font-bold underline hover:text-blue-950">
              how to answer "Tell me about yourself"
            </Link>
            <span>or explore the full list of</span>
            <Link href="/interview-questions" className="font-bold underline hover:text-blue-950">
              20 common interview questions
            </Link>.
          </div>
        </div>
      </section>

      {/* SECTION 11: PRACTICE CTA BAND */}
      <section className="border-b border-slate-200/80 bg-slate-950 text-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
            <IconSparkles className="h-3 w-3 text-blue-400" />
            REHEARSE WITH HAKKIRI
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Practice "Why should we hire you?" out loud
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An answer that reads well on paper can still come out rushed in the room. Rehearse it with Hakkiri first.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-blue-400 font-black text-lg mb-1">1. Add the job</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste the job description and upload your resume (CV).
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-indigo-400 font-black text-lg mb-1">2. Answer out loud</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI interviewer asks "Why should we hire you?" and follows up on what you say.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-emerald-400 font-black text-lg mb-1">3. Get your score</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                See what worked and what to improve, then try again.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              Start practicing free
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 12: FAQ */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-[840px] px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <IconHelpCircle className="h-3.5 w-3.5" /> COMMON QUESTIONS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Frequently asked questions
            </h2>
          </div>

          <WhyHireFaqAccordion />
        </div>
      </section>
    </div>
  );
}
