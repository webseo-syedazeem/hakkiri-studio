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
} from "@/components/interview-questions/Icons";
import {
  StrengthsWeaknessesBuilder,
  SampleCard,
  StrengthsWeaknessesFaqAccordion,
} from "@/components/blog/StrengthsWeaknessesClient";
import {
  STRENGTH_SAMPLES,
  WEAKNESS_SAMPLES,
  FAQ_LIST,
} from "@/lib/blog/strengths-weaknesses-data";

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
    <div className="w-full bg-white text-slate-900">
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
      <nav aria-label="Breadcrumb" className="border-b border-slate-100 bg-slate-50/50 py-3 text-xs text-slate-500">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 flex items-center gap-2">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <IconChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
          <IconChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-800 truncate">Strengths and Weaknesses</span>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-blue-50/40 via-white to-white py-14 sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            INTERVIEW QUESTION GUIDE
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-950 leading-[1.14]">
            How to Answer &ldquo;What Are Your Strengths and Weaknesses?&rdquo; (With Examples)
          </h1>

          <div className="mt-6 rounded-2xl border-l-4 border-blue-600 bg-slate-50 p-5 sm:p-6 text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
            To answer <strong className="text-slate-900">&ldquo;What are your strengths and weaknesses?&rdquo;</strong>, pick one or two strengths the job actually needs and prove each with a short example. For your weakness, choose a real but fixable skill gap that is not essential for the role, explain what you are doing to improve it, and show the progress you have made. Keep the whole answer under two minutes.
          </div>

          <p className="mt-5 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Interviewers ask this to see how well you know yourself, whether your strengths match the job, and whether you can talk about a weakness honestly without panicking. Here is a simple way to answer both halves, with examples you can adapt.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconSparkles className="h-4 w-4" />
              Practice with Free AI Mock Interview
            </Link>
            <a
              href="#formula"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all"
            >
              The Quick Answer Formula
              <IconArrowRight className="h-4 w-4 text-slate-500" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE QUICK ANSWER FORMULA */}
      <section id="formula" className="py-14 sm:py-20 border-b border-slate-100">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Framework</span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              The Quick Answer Formula
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Break your response into two distinct, balanced halves. Spend equal time proving your strength and demonstrating self-correction on your weakness.
            </p>
          </div>

          {/* Formula Table */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200/90 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th scope="col" className="px-6 py-4 w-28">Step</th>
                    <th scope="col" className="px-6 py-4">Strength</th>
                    <th scope="col" className="px-6 py-4">Weakness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-900 bg-slate-50/40">Step 1</td>
                    <td className="px-6 py-4 text-slate-800">
                      <strong className="text-slate-900">Name a strength the job needs</strong>
                    </td>
                    <td className="px-6 py-4 text-slate-800">
                      <strong className="text-slate-900">Name a real weakness that is not core to the job</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-900 bg-slate-50/40">Step 2</td>
                    <td className="px-6 py-4 text-slate-800">
                      <strong className="text-slate-900">Prove it with one specific example</strong>
                    </td>
                    <td className="px-6 py-4 text-slate-800">
                      <strong className="text-slate-900">Give a short example of how it affected your work</strong>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-bold text-slate-900 bg-slate-50/40">Step 3</td>
                    <td className="px-6 py-4 text-slate-800">
                      <strong className="text-slate-900">Say how it will help in this role</strong>
                    </td>
                    <td className="px-6 py-4 text-slate-800">
                      <strong className="text-slate-900">Explain what you are doing to fix it, and the progress so far</strong>
                    </td>
                  </tr>
                  <tr className="bg-blue-50/30">
                    <td className="px-6 py-4 font-bold text-blue-900 bg-blue-100/50">Length</td>
                    <td className="px-6 py-4 font-semibold text-blue-900">30 to 60 seconds</td>
                    <td className="px-6 py-4 font-semibold text-blue-900">30 to 60 seconds</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Answer Builder Component */}
          <StrengthsWeaknessesBuilder />
        </div>
      </section>

      {/* SECTION 3: HOW TO ANSWER STRENGTHS */}
      <section className="py-14 sm:py-20 bg-slate-50/50 border-b border-slate-200/80">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Part 1</span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How to Answer &ldquo;What Are Your Strengths?&rdquo;
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              The mistake most people make is listing adjectives: <em className="text-slate-800">&ldquo;I&apos;m hardworking, a team player and a quick learner.&rdquo;</em> Every candidate says that. What makes your answer stand out is <strong className="text-slate-900">proof</strong>.
            </p>
          </div>

          {/* 3-Step Proof Method Box */}
          <div className="mt-8 rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <IconTarget className="h-5 w-5 text-blue-600" />
              The 3-Step Proof Method
            </h3>
            <ol className="space-y-4 text-sm sm:text-base text-slate-700">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
                <div>
                  <strong className="text-slate-900">Read the job description</strong> and circle the 3 or 4 skills that come up most.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</span>
                <div>
                  <strong className="text-slate-900">Pick the one or two</strong> you can prove with a real story.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">3</span>
                <div>
                  <strong className="text-slate-900">Add a number if you can</strong>: time saved, sales made, customers helped, grades improved.
                </div>
              </li>
            </ol>
          </div>

          {/* Strength Sample Answers */}
          <div className="mt-12">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
              Strength Sample Answers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STRENGTH_SAMPLES.map((s) => (
                <SampleCard
                  key={s.id}
                  title={s.role}
                  badge={s.badge}
                  quote={s.text}
                  note={s.whyItWorks}
                />
              ))}
            </div>
          </div>

          {/* Strengths to Choose From Table */}
          <div className="mt-12">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              Strengths to Choose From
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Choose strengths that align directly with the category of role you are interviewing for:
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200/90 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th scope="col" className="px-6 py-4 w-40">Type</th>
                      <th scope="col" className="px-6 py-4">Examples</th>
                      <th scope="col" className="px-6 py-4">Good For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-6 py-4 font-bold text-slate-900">People skills</td>
                      <td className="px-6 py-4 text-slate-700">Communication, empathy, teamwork, patience</td>
                      <td className="px-6 py-4 text-slate-600">Customer service, healthcare, teaching, sales</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-slate-900">Work habits</td>
                      <td className="px-6 py-4 text-slate-700">Organization, reliability, attention to detail, time management</td>
                      <td className="px-6 py-4 text-slate-600">Admin, finance, operations, any first job</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-slate-900">Thinking skills</td>
                      <td className="px-6 py-4 text-slate-700">Problem solving, analytical thinking, creativity</td>
                      <td className="px-6 py-4 text-slate-600">Tech, marketing, product, engineering</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-slate-900">Leadership</td>
                      <td className="px-6 py-4 text-slate-700">Taking initiative, coaching others, making decisions</td>
                      <td className="px-6 py-4 text-slate-600">Supervisor and manager roles</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-bold text-slate-900">Adaptability</td>
                      <td className="px-6 py-4 text-slate-700">Learning fast, staying calm under pressure, flexibility</td>
                      <td className="px-6 py-4 text-slate-600">Fast-paced jobs, startups, career changers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW TO ANSWER WEAKNESSES */}
      <section className="py-14 sm:py-20 border-b border-slate-100">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Part 2</span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How to Answer &ldquo;What Is Your Greatest Weakness?&rdquo;
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              This is the half that makes people nervous. The interviewer is not trying to catch you out. They want to know three things: <strong className="text-slate-900">are you honest, do you know yourself, and are you working on it?</strong>
            </p>
          </div>

          {/* 3 Rules for a Good Weakness */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/40 p-6 sm:p-8 border border-purple-200/80">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <IconCompass className="h-5 w-5 text-purple-600" />
              A Good Weakness Is:
            </h3>
            <ul className="space-y-3 text-sm sm:text-base text-slate-800">
              <li className="flex items-start gap-3">
                <IconCheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-950">Real.</strong> Not a strength in disguise, like &ldquo;I&apos;m a perfectionist&rdquo; or &ldquo;I work too hard.&rdquo;
                </div>
              </li>
              <li className="flex items-start gap-3">
                <IconCheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-950">Not essential for the job.</strong> Don&apos;t tell a sales interviewer you struggle to talk to strangers.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <IconCheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-950">Something you are fixing.</strong> The improvement is the most important part of the answer.
                </div>
              </li>
            </ul>
          </div>

          {/* Weakness Sample Answers Grid */}
          <div className="mt-12">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
              Weakness Sample Answers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {WEAKNESS_SAMPLES.map((w) => (
                <SampleCard
                  key={w.id}
                  title={w.title}
                  badge={w.badge}
                  quote={w.text}
                  note={w.whyItWorks}
                />
              ))}
            </div>
          </div>

          {/* Weaknesses to Choose From vs Avoid Table */}
          <div className="mt-12">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
              Weaknesses to Choose From (and Ones to Avoid)
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Compare acceptable, constructive weaknesses with answers that immediately raise red flags with hiring managers:
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200/90 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-emerald-700 bg-emerald-50/50 w-1/2">
                        <span className="inline-flex items-center gap-1.5">
                          <IconCheckCircle className="h-4 w-4 text-emerald-600" />
                          Good Weaknesses to Use
                        </span>
                      </th>
                      <th scope="col" className="px-6 py-4 text-rose-700 bg-rose-50/50 w-1/2">
                        <span className="inline-flex items-center gap-1.5">
                          <IconXCircle className="h-4 w-4 text-rose-600" />
                          Weaknesses to Avoid
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-6 py-3.5 text-slate-800">Public speaking or presenting</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">
                        &ldquo;I&apos;m a perfectionist&rdquo; <span className="text-xs text-rose-600 font-normal">(sounds rehearsed)</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 text-slate-800">Delegating tasks</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">
                        &ldquo;I work too hard&rdquo; <span className="text-xs text-rose-600 font-normal">(not believable)</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 text-slate-800">Saying no to extra work</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">Being late or missing deadlines</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 text-slate-800">Being too critical of your own work</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">A core skill the job needs</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 text-slate-800">A specific software or technical skill</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">&ldquo;I don&apos;t have any weaknesses&rdquo;</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3.5 text-slate-800">Asking for help too late</td>
                      <td className="px-6 py-3.5 text-slate-700 font-medium">Personal problems or anything about your health</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: WHEN THEY ASK BOTH IN ONE QUESTION */}
      <section className="py-14 sm:py-20 bg-slate-50/50 border-b border-slate-200/80">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Combined Question</span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              When They Ask Both in One Question
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              Some interviewers ask <em className="text-slate-800">&ldquo;What are your strengths and weaknesses?&rdquo;</em> as one question. Keep it short and balanced: <strong className="text-slate-900">one strength with proof, one weakness with the fix, and finish on a positive note</strong>.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">
              <IconSparkles className="h-4 w-4" />
              Full Balanced Sample Answer
            </div>
            <blockquote className="rounded-xl border-l-4 border-blue-600 bg-blue-50/40 p-5 text-sm sm:text-base text-slate-800 italic leading-relaxed">
              &ldquo;My biggest strength is problem solving. When our ordering system kept double-booking, I found the cause and built a simple check that stopped it. My weakness is that I used to say yes to every request, which overloaded me. I now plan my week and agree realistic deadlines up front, and I&apos;ve hit every deadline this quarter.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* SECTION 6: COMMON MISTAKES */}
      <section className="py-14 sm:py-20 border-b border-slate-100">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Pitfalls</span>
            <h2 className="mt-1 text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              5 Common Mistakes to Avoid
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Steer clear of these five habits that cost candidates marks during interview evaluations:
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
            <div className="flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">1</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Listing strengths with no examples</h4>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Proof beats adjectives every time. Always ground strengths in real stories.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">2</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Using a fake weakness</h4>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Interviewers have heard &ldquo;perfectionist&rdquo; thousands of times. It signals insincerity.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">3</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Choosing a weakness that rules you out</h4>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Check it against the essential requirements in the job description before speaking.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">4</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Talking too long about the weakness</h4>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Spend 80% of your time on how you are actively fixing it, not dwelling on the flaw.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50/40 p-5 md:col-span-2">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">5</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Memorizing word for word</h4>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">Learn your bullet-point stories, not a rigid script, so you sound conversational and natural under pressure.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: PRACTICE IT OUT LOUD & CTA */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
              <IconSparkles className="h-3.5 w-3.5" />
              Verbal Delivery Check
            </span>
            <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Practice It Out Loud
            </h2>
            <p className="mt-4 text-base sm:text-lg text-blue-100 leading-relaxed">
              This question is easy to answer in your head and hard to answer out loud, especially when the interviewer follows up with <em className="text-white">&ldquo;Can you give me another example?&rdquo;</em> or <em className="text-white">&ldquo;How do you know you&apos;ve improved?&rdquo;</em>. Practice saying it until it takes under two minutes and feels natural.
            </p>
            <p className="mt-4 text-sm sm:text-base text-blue-100 leading-relaxed">
              You can <Link href="/signup" className="underline font-bold text-white hover:text-blue-200 transition-colors">practice with a free AI mock interview on Hakkiri</Link>: it asks questions from the job you applied for, listens to your answer out loud and asks a follow-up, just like a real interviewer.
            </p>
            <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
              For the other questions that usually come up, see our list of the <Link href="/interview-questions" className="underline font-bold text-white hover:text-blue-200 transition-colors">20 most common interview questions</Link> and how to answer <Link href="/interview-questions/tell-me-about-yourself" className="underline font-bold text-white hover:text-blue-200 transition-colors">&ldquo;Tell me about yourself&rdquo;</Link>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-blue-700 shadow-lg hover:bg-blue-50 transition-all hover:scale-105 active:scale-95"
              >
                Start Free AI Mock Interview
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/interview-questions"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition-all"
              >
                Browse All 20 Questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FREQUENTLY ASKED QUESTIONS */}
      <section className="py-14 sm:py-20 border-b border-slate-100">
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
    </div>
  );
}
