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
  IconTarget 
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
      <section className="border-b border-slate-200/80 bg-slate-50/80 py-16 sm:py-20">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              ⚡ At A Glance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              "Tell me about yourself" at a glance
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Three essential rules to remember before you walk into the interview.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="group relative rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl group-hover:bg-blue-400/20 transition-all" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/25">
                    <IconClock className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-800">
                    Target Pace
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-blue-600 tracking-tight">60–90 sec</div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Recommended Duration</h3>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                  Long enough to prove value, short enough to keep the interviewer fully hooked.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-blue-100/80 flex items-center gap-2 text-xs text-blue-700 font-semibold">
                <span>⏱️ ~130–160 spoken words</span>
              </div>
            </div>

            <div className="group relative rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/90 via-white to-purple-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-purple-400/10 blur-2xl group-hover:bg-purple-400/20 transition-all" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/25">
                    <IconCompass className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold text-purple-800">
                    Structure
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-purple-600 tracking-tight">3 parts</div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Proven Architecture</h3>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                  Present (who you are), past (relevant achievement), and future (why this job).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-purple-100/80 flex items-center gap-1.5 text-xs text-purple-700 font-semibold">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500" /> Present
                <span className="inline-block h-2 w-2 rounded-full bg-purple-500 ml-1.5" /> Past
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ml-1.5" /> Future
              </div>
            </div>

            <div className="group relative rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl group-hover:bg-emerald-400/20 transition-all" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/25">
                    <IconTarget className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                    First Impression
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight">1st question</div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Sets The Whole Tone</h3>
                <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                  Almost every interview opens here. Nailing it creates immediate interviewer confidence.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-100/80 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <span>🎯 Creates positive anchor bias</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE FORMULA (3 STEP CARDS) */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <IconCompass className="h-3.5 w-3.5" /> PROVEN FRAMEWORK
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              The present–past–future formula
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              This is the simplest, most effective way to structure your answer. Each part is only one to three punchy sentences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Present */}
            <div className="group rounded-3xl border-2 border-blue-200/90 bg-gradient-to-b from-blue-50/50 via-white to-white p-7 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 absolute top-0 left-0" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-sm shadow-md shadow-blue-500/30">
                    1
                  </span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">
                    PRESENT
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Who you are now</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  State your current role, field or recent degree, and highlight the main skill you excel at.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs sm:text-sm italic text-blue-950 font-serif leading-relaxed shadow-2xs">
                "I'm a customer service rep with three years of experience in fast-paced call center teams."
              </blockquote>
            </div>

            {/* Step 2: Past */}
            <div className="group rounded-3xl border-2 border-purple-200/90 bg-gradient-to-b from-purple-50/50 via-white to-white p-7 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600 absolute top-0 left-0" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black text-sm shadow-md shadow-purple-500/30">
                    2
                  </span>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-800">
                    PAST
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">What you have done</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Share 1 or 2 achievements with a concrete result that proves you can do this job.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-xs sm:text-sm italic text-purple-950 font-serif leading-relaxed shadow-2xs">
                "Last year I was chosen to train 12 new hires, and our team's satisfaction scores increased by 15%."
              </blockquote>
            </div>

            {/* Step 3: Future */}
            <div className="group rounded-3xl border-2 border-emerald-200/90 bg-gradient-to-b from-emerald-50/50 via-white to-white p-7 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-600 absolute top-0 left-0" />
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 mt-1">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-black text-sm shadow-md shadow-emerald-500/30">
                    3
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                    FUTURE
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Why this job</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Bridge your ambition to their exact position and explain why their mission excites you.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs sm:text-sm italic text-emerald-950 font-serif leading-relaxed shadow-2xs">
                "Now I want a role where I can step into team leadership, which is why this position stood out."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ANSWER BUILDER (FILL-IN TEMPLATE) */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <IconSparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> INSTANT PITCH STUDIO
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Build your answer in 2 minutes
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in each part of your background below. The studio automatically formats your speech and calculates your spoken time.
            </p>
          </div>

          <InteractiveAnswerBuilder />
        </div>
      </section>

      {/* SECTION 5: SAMPLE ANSWERS (TABS / ACCORDION) */}
      <section id="sample-answers" className="scroll-mt-20 border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              🎯 9 TAILORED PERSONAS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              "Tell me about yourself" sample answers
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick the one closest to your career stage and swap in your own details.
            </p>
          </div>

          <SampleAnswersSection />
        </div>
      </section>

      {/* SECTION 6: DO / DON'T (TWO COLUMNS) */}
      <section className="border-b border-slate-200/80 bg-slate-50/80 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 text-slate-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              ⚖️ INTERVIEW STRATEGY
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              What to say and what to leave out
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Hiring managers filter candidates rapidly in the first 2 minutes. Keep these green and red flags in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DO COLUMN */}
            <div className="rounded-[28px] border-2 border-emerald-300/80 bg-gradient-to-b from-emerald-50/90 via-white to-white p-7 sm:p-8 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-emerald-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
                  <IconCheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Do These (Green Flags)</h3>
                  <p className="text-xs text-emerald-800 font-semibold">What interviewers love to hear</p>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Start with your current role or field</strong> to establish context and competence immediately.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Pick one or two achievements</strong> that directly solve problems mentioned in the job description.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Use a number or tangible metric</strong> (e.g. 40% latency cut, $50k saved) to make your value undeniable.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">End by connecting your goals</strong> to their mission and why this specific company appeals to you.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Keep it strictly to 60–90 seconds</strong> to leave plenty of room for engaging follow-up dialogue.</span>
                </li>
              </ul>
            </div>

            {/* DON'T COLUMN */}
            <div className="rounded-[28px] border-2 border-rose-300/80 bg-gradient-to-b from-rose-50/90 via-white to-white p-7 sm:p-8 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-rose-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25">
                  <IconXCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Avoid These (Red Flags)</h3>
                  <p className="text-xs text-rose-800 font-semibold">Common pitfalls that lose offers</p>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Telling your life story from childhood</strong> or listing every high school achievement.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Reading your resume chronologically.</strong> They have your resume; tell the story behind the bullet points.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Sharing personal details</strong> like marital status, age, political beliefs or hobbies unrelated to work.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Badmouthing your previous manager</strong> or company culture, which signals negativity.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Reciting a memorized script</strong> word for word that sounds robotic, flat or uninspired.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FOLLOW-UPS */}
      <section id="follow-ups" className="scroll-mt-20 border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              🔮 BE ONE STEP AHEAD
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Questions that often come next
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Your opening answer sets up the next 20 minutes. Prepare for these immediate follow-up probes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/60 to-white p-6 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-800 mb-3">
                  Follow-up 1
                </span>
                <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  "Tell me more about that project."
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Have specific metrics, the team size, and your exact personal role and challenges ready.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                Uses STAR method
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/60 to-white p-6 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold text-purple-800 mb-3">
                  Follow-up 2
                </span>
                <h3 className="text-base font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                  "Why are you leaving your current job?"
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Focus on what you are moving toward (growth, new scale) rather than running away from issues.
                </p>
              </div>
              <Link href="/interview-questions#q7" className="mt-5 pt-3 border-t border-slate-100 inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:text-purple-800">
                View recommended answer <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/60 to-white p-6 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 mb-3">
                  Follow-up 3
                </span>
                <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  "Why do you want to work here?"
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Reference their product, culture, or recent milestones rather than generic platitudes.
                </p>
              </div>
              <Link href="/interview-questions#q15" className="mt-5 pt-3 border-t border-slate-100 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:text-emerald-800">
                View recommended answer <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/60 to-white p-6 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800 mb-3">
                  Follow-up 4
                </span>
                <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  "Why should we hire you?"
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Deliver the 3-sentence Need-Proof-Value pitch that proves you deliver immediate ROI.
                </p>
              </div>
              <Link href="/interview-questions/why-should-we-hire-you" className="mt-5 pt-3 border-t border-slate-100 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover:text-amber-800">
                View full 3-sentence guide <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/60 to-white p-6 shadow-sm hover:shadow-lg hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group sm:col-span-2 lg:col-span-2">
              <div>
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-800 mb-3">
                  Follow-up 5
                </span>
                <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  "What are your strengths?"
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                  Pick two high-impact strengths that match the job description, backed by measurable examples.
                </p>
              </div>
              <Link href="/interview-questions#q3" className="mt-5 pt-3 border-t border-slate-100 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
                How to pick 2 matching strengths <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
