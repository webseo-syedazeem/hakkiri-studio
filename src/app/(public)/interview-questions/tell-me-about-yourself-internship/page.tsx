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
  IconUserCheck,
  IconBookOpen
} from "@/components/interview-questions/Icons";
import { 
  InternshipAnswerBuilder, 
  InternshipFieldTabs, 
  InternshipFaqAccordion 
} from "@/components/interview-questions/InternshipClient";
import { 
  INTERNSHIP_LOOK_FOR, 
  INTERNSHIP_EXPERIENCE_TABLE, 
  INTERNSHIP_FAQS 
} from "@/components/interview-questions/data";

export const metadata: Metadata = {
  title: {
    absolute: "Tell Me About Yourself for an Internship (+ Answers) | Hakkiri",
  },
  description:
    "How to answer \"Tell me about yourself\" in an internship interview, even with no experience: a simple formula and sample answers for 7 fields.",
  keywords: [
    "tell me about yourself internship answer",
    "common internship interview questions",
    "common interview questions for internships",
    "tell me about yourself with no experience"
  ],
  alternates: {
    canonical: "https://hakkiri.studio/interview-questions/tell-me-about-yourself-internship",
  },
  openGraph: {
    title: "Tell Me About Yourself for an Internship (+ Answers) | Hakkiri",
    description: "How to answer \"Tell me about yourself\" in an internship interview, even with no experience: a simple formula and sample answers for 7 fields.",
    url: "https://hakkiri.studio/interview-questions/tell-me-about-yourself-internship",
    siteName: "Hakkiri",
    type: "article",
  },
};

export default function TellMeAboutYourselfInternshipPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": INTERNSHIP_FAQS.map((faq) => ({
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
          <span className="font-semibold text-slate-800">Internship Interview Guide</span>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-blue-50/60 via-indigo-50/20 to-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100/70 px-4 py-1 text-xs font-bold text-blue-800 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            INTERNSHIP INTERVIEW GUIDE
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
            "Tell Me About Yourself" for an Internship: How to Answer
          </h1>

          <div className="mt-6 rounded-2xl border-l-4 border-blue-600 bg-white p-5 sm:p-6 shadow-sm text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl border border-slate-200/60">
            To answer <strong className="text-slate-900">"Tell me about yourself"</strong> in an internship interview, give a 45 to 60 second answer in three parts: <strong className="text-slate-900">what you study and what interests you</strong>, <strong className="text-slate-900">one class project, club or part-time job</strong> that shows a relevant skill, and <strong className="text-slate-900">why you want this internship</strong>. You are not expected to have work experience, so focus on what you have learned, what you have done with it, and how keen you are to learn more.
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Practice your answer with an AI interviewer
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-slate-500 font-medium">
              Free during beta. Say your answer out loud and get feedback.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT INTERVIEWERS LOOK FOR (3 CARDS) */}
      <section className="border-b border-slate-200/80 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              What internship interviewers want to hear
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              They know you are a student. They are not judging your experience; they are judging your potential.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {INTERNSHIP_LOOK_FOR.map((card, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-400 flex flex-col justify-between"
              >
                <div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border ${card.badgeColor} mb-4`}>
                    {card.badge}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-800 leading-snug">
                    {card.question}
                  </p>
                </div>
                <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
                  {card.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: THE FORMULA (3 STEP CARDS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/60 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <IconCompass className="h-3.5 w-3.5" /> PROVEN STUDENT FORMULA
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              The student version of present–past–future
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Structure your 60-second answer into three clear sentences:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl border border-blue-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-xs font-black text-blue-800 mb-3">
                  1. Present
                </span>
                <h3 className="text-base font-bold text-slate-900">What you study</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Your major, year and the part of it you enjoy most.
                </p>
              </div>
              <blockquote className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs italic text-blue-950 font-serif leading-relaxed">
                "I'm a third-year marketing student, and I'm most interested in social media analytics."
              </blockquote>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-indigo-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-800 mb-3">
                  2. Past
                </span>
                <h3 className="text-base font-bold text-slate-900">What you have done</h3>
                <p className="mt-1 text-xs text-slate-500">
                  One project, club role, volunteer job or part-time job, with a result.
                </p>
              </div>
              <blockquote className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs italic text-indigo-950 font-serif leading-relaxed">
                "I ran the Instagram account for my university's film club and grew it by sharing student reviews."
              </blockquote>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 mb-3">
                  3. Future
                </span>
                <h3 className="text-base font-bold text-slate-900">Why this internship</h3>
                <p className="mt-1 text-xs text-slate-500">
                  What you want to learn and why this company.
                </p>
              </div>
              <blockquote className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs italic text-emerald-950 font-serif leading-relaxed">
                "I want to learn how a real brand plans campaigns, and your team's work for local businesses stood out."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: WHAT COUNTS AS EXPERIENCE (TABLE) */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              No work experience? Use these instead
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Interviewers look for evidence of curiosity and dedication. Any of these 6 proof points can anchor your answer:
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-bold text-[11px]">
                <tr>
                  <th scope="col" className="px-5 py-4">Use this</th>
                  <th scope="col" className="px-5 py-4">What it shows</th>
                  <th scope="col" className="px-5 py-4 text-blue-700">How to say it</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {INTERNSHIP_EXPERIENCE_TABLE.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      <span className="mr-2">{row.icon}</span>
                      {row.useThis}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{row.shows}</td>
                    <td className="px-5 py-4 text-blue-900 font-serif italic">{row.howToSay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 5: ANSWER BUILDER */}
      <section className="border-b border-slate-200/80 bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Build your internship answer
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in the blanks, say it out loud and keep it under a minute.
            </p>
          </div>

          <InternshipAnswerBuilder />
        </div>
      </section>

      {/* SECTION 6: SAMPLE ANSWERS BY FIELD */}
      <section id="sample-fields" className="scroll-mt-20 border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              "Tell me about yourself" internship sample answers
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick your field and make it your own. Use real details only; interviewers often ask about them.
            </p>
          </div>

          <InternshipFieldTabs />
        </div>
      </section>

      {/* SECTION 7: COMMON INTERNSHIP QUESTIONS (LIST) */}
      <section className="border-b border-slate-200/80 bg-slate-50/60 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Common internship interview questions to prepare next
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              After "Tell me about yourself," these are the questions asked most frequently in student interviews:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Why do you want this internship?",
              "Why are you interested in this field?",
              "Tell me about a project you're proud of.",
              "Describe a time you worked in a team.",
              "What are your strengths and weaknesses?",
              "Where do you see yourself after graduation?",
              "Why should we hire you?",
              "Do you have any questions for us?",
            ].map((q, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-400 transition-colors">
                <span className="text-sm font-bold text-slate-900">{q}</span>
                {q === "Why should we hire you?" ? (
                  <Link href="/interview-questions/why-should-we-hire-you" className="text-xs font-semibold text-blue-600 hover:underline shrink-0 pl-2">
                    View guide →
                  </Link>
                ) : (
                  <Link href="/interview-questions" className="text-xs font-semibold text-slate-500 hover:text-blue-600 shrink-0 pl-2">
                    Sample answer →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: DO / DON'T */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Internship answer: do's and don'ts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DO */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-lg mb-4">
                <IconCheckCircle className="h-5 w-5 text-emerald-600" /> Do
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Name your major and year</strong> right away so they understand your current academic level.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Give one real project, club or job</strong> that produced a real tangible outcome.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Show you researched the company</strong> by naming a product or client type you admire.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Say what you want to learn</strong> and how their mentorship will help you grow.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Keep it under a minute</strong> (45 to 60 seconds is the sweet spot).</span>
                </li>
              </ul>
            </div>

            {/* DON'T */}
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 text-red-800 font-black text-lg mb-4">
                <IconXCircle className="h-5 w-5 text-red-600" /> Don't
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Apologize for having no experience.</strong> They know you are an intern!</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>List every class you have taken.</strong> Pick only the single most relevant skill.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Say you just need credits or a line on your resume.</strong> Show genuine passion.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Give a generic answer</strong> that could apply to any company in the world.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Read from notes or sound scripted.</strong> Speak from the heart.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-blue-50/70 p-4 text-xs text-blue-900 font-medium flex items-center gap-2">
            <span>Want the full guide for any job? See</span>
            <Link href="/interview-questions/tell-me-about-yourself" className="font-bold underline hover:text-blue-950">
              how to answer "Tell me about yourself"
            </Link>.
          </div>
        </div>
      </section>

      {/* SECTION 9: PRACTICE CTA BAND */}
      <section className="border-b border-slate-200/80 bg-slate-950 text-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
            <IconSparkles className="h-3 w-3 text-blue-400" />
            BUILD INTERNSHIP CONFIDENCE
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Practice your internship interview out loud
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Most students know what to say but freeze when they say it. Rehearse with Hakkiri before the real interview.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-blue-400 font-black text-lg mb-1">1. Add the internship</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste the internship listing and upload your resume (CV).
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-indigo-400 font-black text-lg mb-1">2. Answer out loud</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI interviewer asks "Tell me about yourself" and follows up like a real interviewer.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="text-emerald-400 font-black text-lg mb-1">3. Get feedback</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                See your score and what to improve, then try again.
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

      {/* SECTION 10: FAQ */}
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

          <InternshipFaqAccordion />
        </div>
      </section>
    </div>
  );
}
