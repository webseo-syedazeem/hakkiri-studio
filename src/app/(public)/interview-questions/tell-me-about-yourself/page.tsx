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
  IconCompass 
} from "@/components/interview-questions/Icons";
import { 
  InteractiveAnswerBuilder, 
  SampleAnswersSection, 
  GuideFaqAccordion 
} from "@/components/interview-questions/TellMeAboutYourselfClient";
import { GUIDE_FAQS } from "@/components/interview-questions/data";

export const metadata: Metadata = {
  title: {
    absolute: "How to Answer \"Tell Me About Yourself\" (+ Examples) | Hakkiri",
  },
  description:
    "How to answer \"Tell me about yourself\" in 60 seconds: a simple present-past-future formula, an answer builder and sample answers for every level.",
  keywords: [
    "how to answer tell me about yourself",
    "tell me about yourself",
    "tell me about yourself interview question",
    "sample answer",
    "tell me about yourself examples",
    "with no experience sample answer",
    "how long should tell me about yourself be"
  ],
  alternates: {
    canonical: "https://hakkiri.studio/interview-questions/tell-me-about-yourself",
  },
  openGraph: {
    title: "How to Answer \"Tell Me About Yourself\" (+ Examples) | Hakkiri",
    description: "How to answer \"Tell me about yourself\" in 60 seconds: a simple present-past-future formula, an answer builder and sample answers for every level.",
    url: "https://hakkiri.studio/interview-questions/tell-me-about-yourself",
    siteName: "Hakkiri",
    type: "article",
  },
};

export default function TellMeAboutYourselfPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": GUIDE_FAQS.map((faq) => ({
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
          <span className="font-semibold text-slate-800">Tell Me About Yourself</span>
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
            How to Answer "Tell Me About Yourself"
          </h1>

          <div className="mt-6 rounded-2xl border-l-4 border-blue-600 bg-slate-50 p-5 sm:p-6 text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
            To answer <strong className="text-slate-900">"Tell me about yourself,"</strong> give a 60-second summary in three parts: <strong className="text-slate-900">who you are now</strong> (your current role and main skill), <strong className="text-slate-900">what you have done before</strong> that is relevant to this job (one or two achievements), and <strong className="text-slate-900">why you want this role next</strong>. Keep it about your work, not your life story, and end by linking back to the job.
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
              Free during beta. Speak your answer out loud and get a score.
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: AT A GLANCE (3 STAT CARDS) */}
      <section className="border-b border-slate-200/80 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              "Tell me about yourself" at a glance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs">
              <div className="text-3xl sm:text-4xl font-black text-blue-600">60–90 sec</div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600">
                How long your answer should be
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600">3 parts</div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600">
                Present, past, future structure
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-xs">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">1st question</div>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600">
                Often how the interview starts, so it sets the tone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE FORMULA (3 STEP CARDS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <IconCompass className="h-3.5 w-3.5" /> PROVEN FRAMEWORK
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              The present–past–future formula
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This is the simplest way to structure your answer. Each part is only one to three sentences.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Present */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-blue-100/80 px-2.5 py-1 text-xs font-black text-blue-800 mb-3">
                  1. Present
                </span>
                <h3 className="text-base font-bold text-slate-900">Who you are now</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Your current role, field or studies, and the main thing you are good at.
                </p>
              </div>
              <blockquote className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs italic text-slate-700 font-serif">
                "I'm a customer service rep with three years of experience in busy call centers."
              </blockquote>
            </div>

            {/* Step 2: Past */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-indigo-100/80 px-2.5 py-1 text-xs font-black text-indigo-800 mb-3">
                  2. Past
                </span>
                <h3 className="text-base font-bold text-slate-900">What you have done</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  One or two achievements or experiences that match this job.
                </p>
              </div>
              <blockquote className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs italic text-slate-700 font-serif">
                "Last year I was chosen to train new hires, and our team's satisfaction scores went up."
              </blockquote>
            </div>

            {/* Step 3: Future */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center rounded-lg bg-emerald-100/80 px-2.5 py-1 text-xs font-black text-emerald-800 mb-3">
                  3. Future
                </span>
                <h3 className="text-base font-bold text-slate-900">Why this job</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  What you want next and why this role and company fit.
                </p>
              </div>
              <blockquote className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs italic text-slate-700 font-serif">
                "Now I want a role where I can grow into team leadership, which is why this position stood out."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ANSWER BUILDER (FILL-IN TEMPLATE) */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Build your answer in 2 minutes
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in the blanks, then read it out loud and time it.
            </p>
          </div>

          <InteractiveAnswerBuilder />
        </div>
      </section>

      {/* SECTION 5: SAMPLE ANSWERS (TABS / ACCORDION) */}
      <section id="sample-answers" className="scroll-mt-20 border-b border-slate-200/80 bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              "Tell me about yourself" sample answers
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick the one closest to your situation and swap in your own details. Never invent results; interviewers often ask follow-up questions.
            </p>
          </div>

          <SampleAnswersSection />
        </div>
      </section>

      {/* SECTION 6: DO / DON'T (TWO COLUMNS) */}
      <section className="border-b border-slate-200/80 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              What to say and what to leave out
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DO COLUMN */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 sm:p-7">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-lg mb-4">
                <IconCheckCircle className="h-5 w-5 text-emerald-600" /> Do
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Start with your current role or field</strong> to set context immediately.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Pick one or two achievements</strong> that directly match this job's needs.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Use a number or tangible result</strong> where you can to prove credibility.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>End with why you want this role</strong> and connect your goals to their mission.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Keep it to 60 to 90 seconds</strong> to keep the interviewer fully engaged.</span>
                </li>
              </ul>
            </div>

            {/* DON'T COLUMN */}
            <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6 sm:p-7">
              <div className="flex items-center gap-2 text-red-800 font-black text-lg mb-4">
                <IconXCircle className="h-5 w-5 text-red-600" /> Don't
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Tell your life story from school onwards.</strong> Keep it focused on relevant work.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Read your resume line by line.</strong> They already have it in front of them.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Share personal details</strong> like age, marital status, family or religion.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Complain about your current employer</strong> or past managers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <IconXCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>Recite a memorized script word for word</strong> that sounds robotic or stiff.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FOLLOW-UPS */}
      <section id="follow-ups" className="scroll-mt-20 border-b border-slate-200/80 bg-slate-50/50 py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Questions that often come next
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your answer sets up the rest of the interview. Be ready for these follow-up questions:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Follow-up 1</span>
              <p className="text-sm font-bold text-slate-900">"Tell me more about that project."</p>
              <p className="mt-1 text-xs text-slate-500">Have specific metrics and your exact role ready.</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Follow-up 2</span>
              <p className="text-sm font-bold text-slate-900">"Why are you leaving your current job?"</p>
              <Link href="/interview-questions#q7" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                View recommended answer <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Follow-up 3</span>
              <p className="text-sm font-bold text-slate-900">"Why do you want to work here?"</p>
              <Link href="/interview-questions#q15" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                View recommended answer <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-400 block mb-1">Follow-up 4</span>
              <p className="text-sm font-bold text-slate-900">"Why should we hire you?"</p>
              <Link href="/interview-questions#q16" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                View 3-sentence formula <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:col-span-2 lg:col-span-2">
              <span className="text-xs font-bold text-slate-400 block mb-1">Follow-up 5</span>
              <p className="text-sm font-bold text-slate-900">"What are your strengths?"</p>
              <Link href="/interview-questions#q3" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                How to pick 2 matching strengths <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: PRACTICE CTA BAND */}
      <section className="border-b border-slate-200/80 bg-slate-950 text-white py-16 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
            <IconSparkles className="h-3 w-3 text-blue-400" />
            PRACTICE OUT LOUD
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Practice "Tell me about yourself" out loud
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            An answer that looks good on paper can sound rushed in the room. Hakkiri lets you rehearse it with an AI interviewer before the real thing.
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
                The AI interviewer asks "Tell me about yourself" and follows up on what you say.
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

      {/* SECTION 9: FAQ */}
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

          <GuideFaqAccordion />
        </div>
      </section>
    </div>
  );
}
