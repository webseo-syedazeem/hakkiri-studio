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
  IconBookOpen,
  IconFolderKanban,
  IconUsers,
  IconCoffee,
  IconHeartHandshake,
  IconLaptopCode,
  IconGraduationCap,
  IconLightbulb
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
      <section className="border-b border-slate-200/80 bg-slate-50/80 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              🎯 WHAT MATTERS MOST
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              What internship interviewers want to hear
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              They know you are a student. They are not judging your past tenure—they are evaluating your growth potential.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="group relative rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/90 via-white to-blue-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl group-hover:bg-blue-400/20 transition-all" />
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-black mb-4">
                  PASSION & PURPOSE
                </span>
                <h3 className="text-2xl font-black text-slate-900">Interest</h3>
                <p className="mt-2 text-sm font-bold text-slate-800 leading-snug">
                  Do you care about this field, and can you say why?
                </p>
              </div>
              <p className="mt-6 pt-4 border-t border-blue-100 text-xs text-slate-600 leading-relaxed font-medium">
                They want to hear genuine excitement about the subject matter rather than someone looking for just any resume line.
              </p>
            </div>

            <div className="group relative rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/90 via-white to-purple-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-purple-400/10 blur-2xl group-hover:bg-purple-400/20 transition-all" />
              <div>
                <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-3 py-1 text-xs font-black mb-4">
                  SELF-STARTER
                </span>
                <h3 className="text-2xl font-black text-slate-900">Initiative</h3>
                <p className="mt-2 text-sm font-bold text-slate-800 leading-snug">
                  Have you done something on your own, like a project, club or job?
                </p>
              </div>
              <p className="mt-6 pt-4 border-t border-purple-100 text-xs text-slate-600 leading-relaxed font-medium">
                Showing you built, organized, or led something demonstrates curiosity and work ethic without formal corporate experience.
              </p>
            </div>

            <div className="group relative rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 p-7 sm:p-8 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl group-hover:bg-emerald-400/20 transition-all" />
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black mb-4">
                  LEARNING SPEED
                </span>
                <h3 className="text-2xl font-black text-slate-900">Coachability</h3>
                <p className="mt-2 text-sm font-bold text-slate-800 leading-snug">
                  Will you learn fast and take feedback well?
                </p>
              </div>
              <p className="mt-6 pt-4 border-t border-emerald-100 text-xs text-slate-600 leading-relaxed font-medium">
                Managers love interns who listen actively, ask smart clarifying questions, and quickly apply constructive guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE FORMULA (3 STEP CARDS) */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <IconCompass className="h-3.5 w-3.5" /> PROVEN STUDENT FORMULA
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              The student version of present–past–future
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Structure your 60-second answer into three clear sentences:
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
                    PRESENT
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">What you study</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Your major, current academic year and the exact aspect of the field you find most fascinating.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs sm:text-sm italic text-blue-950 font-serif leading-relaxed shadow-2xs">
                "I'm a third-year marketing student, and I'm most interested in social media analytics."
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
                    PAST
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">What you have done</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  One university project, student club role, volunteer job or part-time job, backed by an outcome.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-xs sm:text-sm italic text-purple-950 font-serif leading-relaxed shadow-2xs">
                "I ran the Instagram account for my university's film club and grew engagement by 60% with student reviews."
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
                    FUTURE
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Why this internship</h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  What practical skill you want to master here and why their mentorship or product appeals to you.
                </p>
              </div>
              <blockquote className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs sm:text-sm italic text-emerald-950 font-serif leading-relaxed shadow-2xs">
                "I want to learn how a real brand plans campaigns, and your team's work for local businesses stood out."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: WHAT COUNTS AS EXPERIENCE (TABLE) */}
      <section className="border-b border-slate-200/80 bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <IconLightbulb className="h-3.5 w-3.5" /> ALTERNATIVE PROOF POINTS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              No work experience? Use these instead
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Interviewers look for evidence of curiosity and dedication. Any of these 6 proof points can anchor your pitch:
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Use this</th>
                    <th scope="col" className="px-6 py-4">What it proves to the interviewer</th>
                    <th scope="col" className="px-6 py-4 text-amber-300">How to say it in your pitch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {INTERNSHIP_EXPERIENCE_TABLE.map((row, idx) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      folder: <IconFolderKanban className="h-4 w-4" />,
                      users: <IconUsers className="h-4 w-4" />,
                      coffee: <IconCoffee className="h-4 w-4" />,
                      heart: <IconHeartHandshake className="h-4 w-4" />,
                      laptop: <IconLaptopCode className="h-4 w-4" />,
                      graduation: <IconGraduationCap className="h-4 w-4" />,
                    };
                    return (
                      <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${row.badgeClass}`}>
                              {iconMap[row.iconKey] || <IconBriefcase className="h-4 w-4" />}
                            </div>
                            <span className="text-[14px] font-bold text-slate-900 tracking-tight">{row.useThis}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{row.shows}</td>
                        <td className="px-6 py-4 text-blue-900 font-serif italic bg-blue-50/20 leading-relaxed">{row.howToSay}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ANSWER BUILDER */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              <IconSparkles className="h-3.5 w-3.5" /> INTERACTIVE BUILDER
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Build your internship answer
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in the blanks below, time yourself out loud, and keep it under 60 seconds.
            </p>
          </div>

          <InternshipAnswerBuilder />
        </div>
      </section>

      {/* SECTION 6: SAMPLE ANSWERS BY FIELD */}
      <section id="sample-fields" className="scroll-mt-20 border-b border-slate-200/80 bg-slate-50/70 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              🎓 7 FIELD EXAMPLES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              "Tell me about yourself" internship sample answers
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Select your academic discipline to see a field-tested sample answer.
            </p>
          </div>

          <InternshipFieldTabs />
        </div>
      </section>

      {/* SECTION 7: COMMON INTERNSHIP QUESTIONS (LIST) */}
      <section className="border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 text-purple-700 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              🚀 STUDENT INTERVIEW PREP
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Common internship interview questions to prepare next
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              After "Tell me about yourself," these are the questions asked most frequently in student interviews:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { q: "Why do you want this internship?", href: "/interview-questions#q14", label: "Jump to answer" },
              { q: "Why are you interested in this field?", href: "/interview-questions#q15", label: "Jump to answer" },
              { q: "Tell me about a project you're proud of.", href: "/interview-questions#q6", label: "Jump to answer" },
              { q: "Describe a time you worked in a team.", href: "/interview-questions#q12", label: "Jump to answer" },
              { q: "What are your strengths and weaknesses?", href: "/interview-questions#q3", label: "Jump to answer" },
              { q: "Where do you see yourself after graduation?", href: "/interview-questions#q17", label: "Jump to answer" },
              { q: "Why should we hire you?", href: "/interview-questions/why-should-we-hire-you", label: "View full guide" },
              { q: "Do you have any questions for us?", href: "/interview-questions#q20", label: "Jump to answer" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50/50 to-white shadow-xs hover:border-blue-400 hover:shadow-md transition-all group">
                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.q}</span>
                <Link href={item.href} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0 pl-3">
                  {item.label} <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: DO / DON'T */}
      <section className="border-b border-slate-200/80 bg-slate-50/80 py-16 sm:py-24">
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 text-slate-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3">
              ⚖️ STUDENT DOS & DON'TS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Internship answer: do's and don'ts
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Keep these guidelines in mind to stand out from other student applicants.
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
                  <h3 className="text-xl font-black text-slate-900">Do (Standout Moves)</h3>
                  <p className="text-xs text-emerald-800 font-semibold">What signals high potential</p>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Name your major and year</strong> right away so they understand your academic background.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Highlight one specific project</strong> or club activity with a tangible metric or milestone.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Emphasize hunger to learn:</strong> Employers value curiosity and teachability above prior experience.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-emerald-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xs">✓</span>
                  <span><strong className="text-slate-900">Mention why this company:</strong> Cite their recent launch, open source, or client portfolio.</span>
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
                  <h3 className="text-xl font-black text-slate-900">Don't (Student Traps)</h3>
                  <p className="text-xs text-rose-800 font-semibold">Mistakes that lower your score</p>
                </div>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Apologizing for lack of experience:</strong> Everyone knows you are a student—own your projects proudly!</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Listing all your courses</strong> like a course catalog; focus on one applied project instead.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Giving a generic answer</strong> that could apply to any company or any internship.</span>
                </li>
                <li className="flex items-start gap-3 rounded-2xl bg-white p-3.5 border border-rose-100 shadow-2xs">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-black text-xs">✕</span>
                  <span><strong className="text-slate-900">Sounding passive:</strong> Say "I led," "I built," and "I organized" instead of "We were told to."</span>
                </li>
              </ul>
            </div>
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
