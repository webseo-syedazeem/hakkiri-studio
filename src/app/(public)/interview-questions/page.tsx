import type { Metadata } from "next";
import Link from "next/link";
import { 
  IconArrowRight, 
  IconSparkles, 
  IconClock, 
  IconHelpCircle, 
  IconCheckCircle, 
  IconBriefcase, 
  IconUserCheck, 
  IconMessageSquare, 
  IconTarget, 
  IconChevronRight,
  IconBookOpen
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
  // Build structured data
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
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            INTERVIEW QUESTIONS
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
            The 20 Most Common Interview Questions and How to Answer Them
          </h1>

          <div className="mt-6 rounded-2xl border-l-4 border-blue-600 bg-slate-50 p-5 sm:p-6 text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
            The most common interview questions are <strong className="text-slate-900">"Tell me about yourself," "Why do you want this job?", "Why should we hire you?", "What are your strengths?", "What is your greatest weakness?", "Tell me about a challenge you faced,"</strong> and <strong className="text-slate-900">"Do you have any questions for us?"</strong> Most interviews mix questions about you, your experience, how you handle situations and why you want the job. Prepare a short answer for each one, back it with a real example, and practice saying it out loud.
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
      <section className="border-b border-slate-200/80 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              The 7 most common interview questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              If you only have time to prepare for a few, start with these. You will hear most of them in almost any interview.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-7 shadow-xs">
            <ol className="divide-y divide-slate-200/80 space-y-4">
              <li className="pt-3 first:pt-0 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Tell me about yourself.</strong> A 60-second summary of who you are, what you have done and why this job.{" "}
                  <Link href="/interview-questions/tell-me-about-yourself" className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5">
                    See how to answer <IconChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>

              <li className="pt-3 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  2
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Why do you want this job?</strong> Link what the role offers to what you want to do next.{" "}
                  <a href="#q14" className="font-semibold text-blue-600 hover:underline">
                    Jump to answer
                  </a>
                </div>
              </li>

              <li className="pt-3 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  3
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Why should we hire you?</strong> Match your top skills to the job and prove them with examples.{" "}
                  <a href="#q16" className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5">
                    See how to answer <IconChevronRight className="h-3 w-3" />
                  </a>
                </div>
              </li>

              <li className="pt-3 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  4
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">What are your strengths?</strong> Pick two strengths the job needs and give an example of each.{" "}
                  <a href="#q3" className="font-semibold text-blue-600 hover:underline">
                    Jump to answer
                  </a>
                </div>
              </li>

              <li className="pt-3 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  5
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">What is your greatest weakness?</strong> Name a real weakness and what you are doing to improve it.{" "}
                  <a href="#q4" className="font-semibold text-blue-600 hover:underline">
                    Jump to answer
                  </a>
                </div>
              </li>

              <li className="pt-3 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  6
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Tell me about a challenge you faced.</strong> Tell a short story: the problem, what you did and the result.{" "}
                  <a href="#q9" className="font-semibold text-blue-600 hover:underline">
                    Jump to answer
                  </a>
                </div>
              </li>

              <li className="pt-3 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  7
                </span>
                <div className="text-sm text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Do you have any questions for us?</strong> Always say yes, and ask about the role, the team or success in the job.{" "}
                  <a href="#q20" className="font-semibold text-blue-600 hover:underline">
                    Jump to answer
                  </a>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE 4 TYPES OF QUESTIONS */}
      <section className="border-b border-slate-200/80 bg-slate-50/50 py-12 sm:py-16">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              The 4 types of interview questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Knowing the type of question tells you what kind of answer to give.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold mb-4">
                  <IconUserCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">About you</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Who you are and what you want.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs italic text-slate-500">
                "Tell me about yourself."
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold mb-4">
                  <IconBriefcase className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">About your experience</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Your skills and past work.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs italic text-slate-500">
                "What are your strengths?"
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 font-bold mb-4">
                  <IconMessageSquare className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Behavioral</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  How you acted in real situations. Answer with a story.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs italic text-slate-500">
                "Tell me about a time you…"
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold mb-4">
                  <IconTarget className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">About the job</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Why this role and this company.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs italic text-slate-500">
                "Why do you want to work here?"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ALL 20 QUESTIONS WITH ANSWERS */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
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

      {/* SECTION 5: GUIDES BY SITUATION (LINK CARDS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/60 py-12 sm:py-16">
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
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-blue-400 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide mb-3">
                  Featured Guide
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Tell me about yourself
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Formula, interactive answer builder and 9 adaptable sample answers across all career stages.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                Read the full guide <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Guide 2 */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-3">
                  Quick Guide
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Why should we hire you?
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  A proven 3-sentence formula and 20+ sample answers to prove your value quickly.
                </p>
              </div>
              <a href="#q16" className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600">
                Jump to question 16 <IconArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Guide 3 */}
            <div className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-3">
                  Entry Level
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Internship interviews
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  How to answer with no direct experience, structured by college field and coursework.
                </p>
              </div>
              <Link href="/interview-questions/tell-me-about-yourself#sample-answers" className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600">
                View student examples <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: HOW TO PREPARE (3 COLUMNS) */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              How to prepare for any interview
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              A clear step-by-step preparation routine before, during, and after your session.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Before */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100/70 px-3 py-1 text-xs font-bold text-blue-800 mb-4">
                1. Before
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Read the job description and note the key skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Research the company and its products</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Prepare 5 or 6 short stories you can reuse</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Practice your answers out loud</span>
                </li>
              </ul>
            </div>

            {/* During */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-100/70 px-3 py-1 text-xs font-bold text-indigo-800 mb-4">
                2. During
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Listen to the full question before answering</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Keep answers to about one or two minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Use real examples and numbers</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>It is fine to pause and think</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-100/70 px-3 py-1 text-xs font-bold text-emerald-800 mb-4">
                3. After
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Send a short thank-you email the same day</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Note which questions felt hard</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Practice those before your next interview</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PRACTICE CTA BAND */}
      <section className="border-b border-slate-200/80 bg-slate-950 text-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
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
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-blue-400 font-black text-lg mb-1">1. Add the job</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste the job description and upload your resume (CV).
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-indigo-400 font-black text-lg mb-1">2. Answer out loud</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                An AI interviewer asks the questions most likely for that job and follows up.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-emerald-400 font-black text-lg mb-1">3. Get your score</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                See what worked and what to fix on every answer.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              Start a free mock interview
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8: FAQ */}
      <section className="bg-slate-50 py-16 sm:py-20">
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
