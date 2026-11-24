import type { Metadata } from "next";
import Link from "next/link";
import { 
  IconArrowRight, 
  IconSparkles, 
  IconHelpCircle, 
  IconCheckCircle, 
  IconBriefcase, 
  IconUserCheck, 
  IconMessageSquare, 
  IconTarget, 
  IconChevronRight,
  IconBookOpen,
  IconCompass,
  IconClock
} from "@/components/interview-questions/Icons";
import { 
  QuestionsAccordion, 
  HubFaqAccordion 
} from "@/components/interview-questions/HubClient";
import { 
  HUB_FAQS, 
  QUESTIONS_DATA 
} from "@/components/interview-questions/data";

export const metadata: Metadata = {
  title: {
    absolute: "20 Most Common Interview Questions and Answers | Hakkiri",
  },
  description:
    "The 20 most common interview questions, what interviewers want to hear and how to answer each one, with short sample answers you can adapt.",
  keywords: [
    "most common interview questions",
    "common interview questions",
    "job interview questions and answers",
    "common interview questions and how to answer them",
    "what are the 7 most common interview questions and answers",
    "interview questions and answers",
    "common questions asked in an interview"
  ],
  alternates: {
    canonical: "https://hakkiri.studio/interview-questions",
  },
  openGraph: {
    title: "20 Most Common Interview Questions and Answers | Hakkiri",
    description: "The 20 most common interview questions, what interviewers want to hear and how to answer each one, with short sample answers you can adapt.",
    url: "https://hakkiri.studio/interview-questions",
    siteName: "Hakkiri",
    type: "website",
  },
};

export default function InterviewQuestionsHubPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": HUB_FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "20 Most Common Interview Questions",
    "description": "The 20 most common interview questions asked by employers.",
    "itemListElement": QUESTIONS_DATA.map((q, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": q.question,
      "description": q.whatTheyWant,
    })),
  };

  return (
    <div className="w-full bg-white text-slate-900">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white py-16 sm:py-24">
        {/* Decorative background glow circle */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 blur-3xl" />

        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100/70 px-4 py-1 text-xs font-bold text-blue-800 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            INTERVIEW QUESTIONS HUB
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
            The 20 Most Common Interview Questions <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              and How to Answer Them
            </span>
          </h1>

          <div className="mt-6 rounded-3xl border-l-4 border-blue-600 bg-white/90 backdrop-blur-xs p-6 shadow-sm text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl border border-slate-200/70">
            The most common interview questions are <strong className="text-slate-950 font-bold">"Tell me about yourself," "Why do you want this job?", "Why should we hire you?", "What are your strengths?", "What is your greatest weakness?", "Tell me about a challenge you faced,"</strong> and <strong className="text-slate-950 font-bold">"Do you have any questions for us?"</strong> Most interviews mix questions about you, your experience, how you handle situations and why you want the job. Prepare a short answer for each one, back it with a real example, and practice saying it out loud.
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Practice these questions with an AI interviewer
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-slate-500 font-medium">
              Free during beta. Built from your job description and resume.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE 7 MOST COMMON (NUMBERED QUICK LIST) */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-18">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">QUICK START</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              The 7 most common interview questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              If you only have time to prepare for a few, start with these. You will hear most of them in almost any interview.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 p-6 sm:p-8 shadow-sm">
            <ol className="divide-y divide-slate-200/70 space-y-4">
              <li className="pt-3.5 first:pt-0 flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-sm">
                  1
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Tell me about yourself.</strong> A 60-second summary of who you are, what you have done and why this job.{" "}
                  <Link href="/interview-questions/tell-me-about-yourself" className="font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5 ml-1">
                    See how to answer <IconChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>

              <li className="pt-3.5 flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-sm">
                  2
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Why do you want this job?</strong> Link what the role offers to what you want to do next.{" "}
                  <a href="#q14" className="font-semibold text-blue-600 hover:underline ml-1">
                    Jump to answer
                  </a>
                </div>
              </li>

              <li className="pt-3.5 flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-sm">
                  3
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Why should we hire you?</strong> Match your top skills to the job and prove them with examples.{" "}
                  <Link href="/interview-questions/why-should-we-hire-you" className="font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5 ml-1">
                    See how to answer <IconChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>

              <li className="pt-3.5 flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-sm">
                  4
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">What are your strengths?</strong> Pick two strengths the job needs and give an example of each.{" "}
                  <a href="#q3" className="font-semibold text-blue-600 hover:underline ml-1">
                    Jump to answer
                  </a>
                </div>
              </li>

              <li className="pt-3.5 flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-sm">
                  5
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">What is your greatest weakness?</strong> Name a real weakness and what you are doing to improve it.{" "}
                  <a href="#q4" className="font-semibold text-blue-600 hover:underline ml-1">
                    Jump to answer
                  </a>
                </div>
              </li>

              <li className="pt-3.5 flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-sm">
                  6
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Tell me about a challenge you faced.</strong> Tell a short story: the problem, what you did and the result.{" "}
                  <a href="#q9" className="font-semibold text-blue-600 hover:underline ml-1">
                    Jump to answer
                  </a>
                </div>
              </li>

              <li className="pt-3.5 flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-sm">
                  7
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 font-bold">Do you have any questions for us?</strong> Always say yes, and ask about the role, the team or success in the job.{" "}
                  <a href="#q20" className="font-semibold text-blue-600 hover:underline ml-1">
                    Jump to answer
                  </a>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE 4 TYPES OF QUESTIONS (CARDS WITH VIBRANT ACCENTS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/60 py-14 sm:py-18">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">CATEGORIES</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              The 4 types of interview questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Knowing the type of question tells you what kind of answer to give.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: About you */}
            <div className="group rounded-2xl border border-purple-200/90 bg-gradient-to-b from-purple-50/50 via-white to-white p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-400 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold mb-4 shadow-md shadow-purple-500/25">
                  <IconUserCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">About you</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Who you are and what you want.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-purple-100 text-xs italic font-serif text-purple-900">
                "Tell me about yourself."
              </div>
            </div>

            {/* Card 2: About experience */}
            <div className="group rounded-2xl border border-blue-200/90 bg-gradient-to-b from-blue-50/50 via-white to-white p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white font-bold mb-4 shadow-md shadow-blue-500/25">
                  <IconBriefcase className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">About your experience</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Your skills and past work.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-blue-100 text-xs italic font-serif text-blue-900">
                "What are your strengths?"
              </div>
            </div>

            {/* Card 3: Behavioral */}
            <div className="group rounded-2xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/50 via-white to-white p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-400 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold mb-4 shadow-md shadow-emerald-500/25">
                  <IconMessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Behavioral</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  How you acted in real situations. Answer with a story.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-emerald-100 text-xs italic font-serif text-emerald-900">
                "Tell me about a time you…"
              </div>
            </div>

            {/* Card 4: About the job */}
            <div className="group rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/50 via-white to-white p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-amber-400 flex flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold mb-4 shadow-md shadow-amber-500/25">
                  <IconTarget className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">About the job</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Why this role and this company.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-amber-100 text-xs italic font-serif text-amber-900">
                "Why do you want to work here?"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ALL 20 QUESTIONS WITH ANSWERS */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">INTERACTIVE QUESTION LIBRARY</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              20 common interview questions and answers
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              For each question: what the interviewer wants to know, how to answer, and a short example you can adapt.
            </p>
          </div>

          <QuestionsAccordion />
        </div>
      </section>

      {/* SECTION 5: GUIDES BY SITUATION (ALL 3 LIVE GUIDES LINKED) */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <IconBookOpen className="h-3.5 w-3.5" /> DEEP DIVE GUIDES
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Interview question guides
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              In-depth guides with sample answers for the questions people ask most.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Guide 1 */}
            <Link
              href="/interview-questions/tell-me-about-yourself"
              className="group relative rounded-3xl border border-blue-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-800 uppercase tracking-wide mb-4">
                  ⭐ Flagship Guide
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  Tell me about yourself
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Formula, interactive answer builder and 9 adaptable sample answers across all career stages.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600">
                Read the full guide <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Guide 2 */}
            <Link
              href="/interview-questions/why-should-we-hire-you"
              className="group relative rounded-3xl border border-emerald-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wide mb-4">
                  🔥 Comprehensive Guide
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Why should we hire you?
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  A proven 3-sentence formula, 20+ sample answers across 15 professions, and draft breakdowns.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                Read the full guide <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Guide 3 */}
            <Link
              href="/interview-questions/tell-me-about-yourself-internship"
              className="group relative rounded-3xl border border-indigo-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-800 uppercase tracking-wide mb-4">
                  🎓 Student & Intern Guide
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Internship interviews
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  How to answer with no direct experience, what counts as experience, and sample answers across 7 fields.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                Read the full guide <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: HOW TO PREPARE (3 COLUMNS) */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">PRACTICAL ROUTINE</span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              How to prepare for any interview
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              A clear step-by-step preparation routine before, during, and after your session.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Before */}
            <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white p-6 sm:p-7 shadow-xs">
              <div className="inline-flex items-center gap-2 rounded-xl bg-blue-100 px-3 py-1 text-xs font-black text-blue-800 mb-4">
                1. Before
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Read the job description and note the key skills</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Research the company and its products</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Prepare 5 or 6 short stories you can reuse</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Practice your answers out loud</span>
                </li>
              </ul>
            </div>

            {/* During */}
            <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/50 to-white p-6 sm:p-7 shadow-xs">
              <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800 mb-4">
                2. During
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Listen to the full question before answering</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Keep answers to about one or two minutes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Use real examples and numbers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>It is fine to pause and think</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-6 sm:p-7 shadow-xs">
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 mb-4">
                3. After
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Send a short thank-you email the same day</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Note which questions felt hard</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Practice those before your next interview</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PRACTICE CTA BAND */}
      <section className="border-b border-slate-200/80 bg-slate-950 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30 shadow-xs">
            <IconSparkles className="h-3 w-3 text-blue-400" />
            REAL-TIME SPOKEN PRACTICE
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Practice common interview questions out loud
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reading answers helps, but saying them is what builds confidence. Hakkiri turns any job description into a realistic mock interview.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-md">
              <div className="text-blue-400 font-black text-lg mb-1">1. Add the job</div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Paste the job description and upload your resume (CV).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-md">
              <div className="text-indigo-400 font-black text-lg mb-1">2. Answer out loud</div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                An AI interviewer asks the questions most likely for that job and follows up.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-md">
              <div className="text-emerald-400 font-black text-lg mb-1">3. Get your score</div>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                See what worked and what to fix on every answer.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              Start a free mock interview
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8: FAQ */}
      <section className="bg-slate-50/80 py-16 sm:py-24">
        <div className="mx-auto max-w-[840px] px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <IconHelpCircle className="h-3.5 w-3.5" /> QUESTIONS & ANSWERS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Frequently asked questions
            </h2>
          </div>

          <HubFaqAccordion />
        </div>
      </section>
    </div>
  );
}
