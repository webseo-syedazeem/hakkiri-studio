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
      <section className="border-b border-slate-200/80 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              What the interviewer is really asking
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Behind "Why should we hire you?" are three quieter questions:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100/70 text-blue-700 font-bold mb-4">
                  <IconTarget className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Fit</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-serif italic">
                  "Did you read the job description?"
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-500">
                Mention specifically what this role and team needs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100/70 text-indigo-700 font-bold mb-4">
                  <IconBriefcase className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Proof</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-serif italic">
                  "Can you prove it?"
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-500">
                Claims without real examples sound like everyone else.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 font-bold mb-4">
                  <IconUserCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Value</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-serif italic">
                  "Will you make my job easier?"
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-slate-200/70 text-xs text-slate-500">
                Show clearly that you can solve their primary problem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE 3-SENTENCE FORMULA (3 STEP CARDS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <IconCompass className="h-3.5 w-3.5" /> THE 3-SENTENCE FORMULA
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              The 3-sentence formula
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              You can build almost any answer from three sentences. It takes 30 to 60 seconds to say.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-blue-100/80 px-2.5 py-1 text-xs font-black text-blue-800 mb-3">
                  1. Their need
                </span>
                <h3 className="text-base font-bold text-slate-900">What the job asks for</h3>
              </div>
              <blockquote className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs italic text-slate-700 font-serif">
                "You need someone who can handle a high volume of customers."
              </blockquote>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-indigo-100/80 px-2.5 py-1 text-xs font-black text-indigo-800 mb-3">
                  2. Your proof
                </span>
                <h3 className="text-base font-bold text-slate-900">Where you have done it</h3>
              </div>
              <blockquote className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs italic text-slate-700 font-serif">
                "I've done that for two years and was often given the escalated cases."
              </blockquote>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-emerald-100/80 px-2.5 py-1 text-xs font-black text-emerald-800 mb-3">
                  3. Your value
                </span>
                <h3 className="text-base font-bold text-slate-900">What they get</h3>
              </div>
              <blockquote className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs italic text-slate-700 font-serif">
                "I can help your team cut wait times from my first week."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: WEAK TO STRONG (3 DRAFTS) */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              From weak to strong: one answer, three drafts
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              The same candidate, applying for a customer service job, improving their answer step by step.
            </p>
          </div>

          <div className="space-y-6">
            {WEAK_TO_STRONG_DRAFTS.map((draft, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-6 transition-all ${
                  idx === 2
                    ? "border-emerald-300 bg-emerald-50/30 shadow-md"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs border ${draft.badgeClass}`}>
                    {draft.draft}
                  </span>
                </div>
                <blockquote className="text-sm sm:text-base italic leading-relaxed text-slate-900 font-serif">
                  "{draft.quote}"
                </blockquote>
                <div className={`mt-4 rounded-xl p-3 text-xs font-medium ${
                  idx === 2 ? "bg-emerald-100/80 text-emerald-950" : "bg-slate-100 text-slate-700"
                }`}>
                  {draft.analysis}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CHECKLIST (TABLE) */}
      <section className="border-b border-slate-200/80 bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              How interviewers judge your answer
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Use this checklist to benchmark what makes a strong answer vs what hurts your candidacy.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th scope="col" className="px-5 py-4">They listen for</th>
                  <th scope="col" className="px-5 py-4 text-emerald-800">Strong answer</th>
                  <th scope="col" className="px-5 py-4 text-red-700">Weak answer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {INTERVIEWER_CHECKLIST.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">{row.listenFor}</td>
                    <td className="px-5 py-4 text-emerald-900 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        {row.strong}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-red-800">
                      <span className="inline-flex items-center gap-1.5">
                        <IconXCircle className="h-4 w-4 text-red-500 shrink-0" />
                        {row.weak}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 6: ANSWER BUILDER */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Build your answer
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in the blanks, say it out loud and keep it under a minute.
            </p>
          </div>

          <WhyHireAnswerBuilder />
        </div>
      </section>

      {/* SECTION 7: SAMPLE ANSWERS BY SITUATION (TABS) */}
      <section id="sample-situations" className="scroll-mt-20 border-b border-slate-200/80 bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Sample answers by situation
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Swap in your own details and numbers. Never invent results; interviewers often ask about them.
            </p>
          </div>

          <WhyHireSituationTabs />
        </div>
      </section>

      {/* SECTION 8: SAMPLE ANSWERS BY JOB (GRID OF CARDS) */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Sample answers by job
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Short answers you can adapt. Each follows the same formula: their need, your proof, your value.
            </p>
          </div>

          <WhyHireJobGrid />
        </div>
      </section>

      {/* SECTION 9: DO'S AND DON'TS */}
      <section className="border-b border-slate-200/80 bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Do's and don'ts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DO */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-7">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-lg mb-4">
                <IconCheckCircle className="h-5 w-5 text-emerald-600" /> Do
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Start with what the job needs</strong> to show you understand their priorities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Pick two or three strengths</strong>, not ten generic qualities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Prove each one with an example or number</strong> to make it credible.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>End with what the company gets</strong> from day one or week one.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Keep it to 30 to 60 seconds</strong> to remain punchy and memorable.</span>
                </li>
              </ul>
            </div>

            {/* DON'T */}
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 sm:p-7">
              <div className="flex items-center gap-2 text-red-800 font-black text-lg mb-4">
                <IconXCircle className="h-5 w-5 text-red-600" /> Don't
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Read your resume out loud.</strong> They already have it.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Talk about what you want from the job.</strong> Focus on what you give.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Bring up pay or benefits</strong> in this answer.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Talk down other candidates.</strong> Focus purely on your own strengths.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Memorize a script word for word.</strong> Sound natural and conversational.</span>
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
