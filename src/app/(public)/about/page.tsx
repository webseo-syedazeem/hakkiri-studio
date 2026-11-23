import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/brand/Mark";

export const metadata: Metadata = {
  title: {
    absolute: "About Hakkiri · Practise for the interview you actually have",
  },
  description:
    "Why we built Hakkiri: interview practice and career applications grounded in truth, evidence, and your authentic voice. No AI hallucinations, no accent scoring.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-white text-mk-ink">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-mk-line/60 bg-gradient-to-b from-mk-mist/60 via-white to-white py-16 sm:py-24">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-mk-line bg-white px-3.5 py-1 text-xs font-semibold text-mk-blue shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-mk-blue animate-pulse" />
            Our Mission & Philosophy
          </div>

          <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-mk-ink leading-[1.12]">
            Practise for the interview <br className="hidden sm:inline" />
            <span className="text-mk-blue">you actually have.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-mk-slate max-w-2xl leading-relaxed">
            Hakkiri was founded on a simple conviction: interview practice was broken. 
            Robotic quiz bots and generic AI hype tools invent fake achievements and give empty compliments. 
            We built a platform grounded in verified truth, authentic candidate voice, and spoken rehearsal that prepares you for reality.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/signup"
              className="rounded-full bg-mk-cta px-6 py-3 text-sm font-semibold text-white shadow-md shadow-mk-cta/25 hover:bg-mk-cta-hover transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign up free
            </Link>
            <Link
              href="/cv-audit"
              className="rounded-full border border-mk-line bg-white px-5 py-3 text-sm font-semibold text-mk-ink hover:bg-mk-mist transition-all shadow-sm"
            >
              Free CV Audit →
            </Link>
          </div>
        </div>
      </section>

      {/* Core Numbers / Standard Banner */}
      <section className="border-b border-mk-line/60 bg-mk-mist/40 py-10">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-mk-ink">Zero</div>
              <div className="text-xs font-semibold text-mk-blue uppercase tracking-wider">Invention Rule</div>
              <p className="text-[11px] text-mk-slate leading-normal">
                Strict code enforcement: AI is forbidden from fabricating qualifications.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-mk-ink">85+</div>
              <div className="text-xs font-semibold text-mk-blue uppercase tracking-wider">Audit Benchmark</div>
              <p className="text-[11px] text-mk-slate leading-normal">
                Weighted scoring tells you exactly when to stop polishing and hit apply.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-mk-ink">100%</div>
              <div className="text-xs font-semibold text-mk-blue uppercase tracking-wider">Accent Neutral</div>
              <p className="text-[11px] text-mk-slate leading-normal">
                Feedback strictly measures STAR evidence, clarity, and depth—never your accent.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black text-mk-ink">End-to-End</div>
              <div className="text-xs font-semibold text-mk-blue uppercase tracking-wider">Career Suite</div>
              <p className="text-[11px] text-mk-slate leading-normal">
                From free CV diagnostic to live interview practice hand-off in one ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Story & Why We Built This */}
      <section className="py-16 sm:py-20 border-b border-mk-line/60">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-mk-blue">
              The Problem With Existing Tools
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-mk-ink tracking-tight">
              Why generic AI interview tools fail candidates.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-mk-line bg-mk-mist/50 p-6 sm:p-7 space-y-3">
              <div className="text-2xl">🚫</div>
              <h3 className="text-base font-bold text-mk-ink">AI Hallucinations & Buzzwords</h3>
              <p className="text-xs sm:text-sm text-mk-slate leading-relaxed">
                Most career AI tools invent numbers you never hit and stuff your resume with buzzwords like &quot;spearheaded synergy&quot;. When the interviewer asks for context, the candidate stumbles.
              </p>
            </div>

            <div className="rounded-3xl border border-mk-line bg-mk-mist/50 p-6 sm:p-7 space-y-3">
              <div className="text-2xl">🤖</div>
              <h3 className="text-base font-bold text-mk-ink">Robotic Questionnaire Bots</h3>
              <p className="text-xs sm:text-sm text-mk-slate leading-relaxed">
                Traditional interview tools ask generic behavioral questions from a static list. They don&apos;t listen to what you said, don&apos;t follow up on vague statements, and never test your depth.
              </p>
            </div>

            <div className="rounded-3xl border border-mk-line bg-mk-mist/50 p-6 sm:p-7 space-y-3">
              <div className="text-2xl">🎯</div>
              <h3 className="text-base font-bold text-mk-ink">Accent Bias & Superficial Scoring</h3>
              <p className="text-xs sm:text-sm text-mk-slate leading-relaxed">
                Many speech AI coaches penalize international professionals for natural accents or slight pauses, confusing pronunciation with technical competence and strategic leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Hakkiri Guiding Rules */}
      <section className="py-16 sm:py-24 bg-mk-mist/30 border-b border-mk-line/60">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 space-y-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-mk-blue">
              Our Principles
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-mk-ink tracking-tight">
              The 4 rules built directly into our software.
            </h2>
            <p className="text-xs sm:text-sm text-mk-slate max-w-xl">
              These are not marketing promises. They are hardcoded constraints enforced in our codebase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-mk-line bg-white p-7 space-y-3 shadow-sm">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue/10 text-mk-blue font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-mk-ink">Nothing Invented</h3>
              <p className="text-xs sm:text-sm text-mk-slate leading-relaxed">
                Generated CV bullets, cover letters, and application answers may only state facts found in your confirmed profile, Evidence Bank, or spoken notes. If evidence is missing, Hakkiri asks you—it never guesses.
              </p>
            </div>

            <div className="rounded-3xl border border-mk-line bg-white p-7 space-y-3 shadow-sm">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-mk-ink">Your Authentic Voice</h3>
              <p className="text-xs sm:text-sm text-mk-slate leading-relaxed">
                Every document mirrors your measured writing style—calibrated from your real writing samples. We enforce sentence length, natural contraction rate, and ban corporate clichés.
              </p>
            </div>

            <div className="rounded-3xl border border-mk-line bg-white p-7 space-y-3 shadow-sm">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-mk-ink">You Approve What Leaves</h3>
              <p className="text-xs sm:text-sm text-mk-slate leading-relaxed">
                Nothing is ever sent to an employer without your explicit review and sign-off. We reject unattended spam sending in favor of high-fit, curated applications with 100% audit trails.
              </p>
            </div>

            <div className="rounded-3xl border border-mk-line bg-white p-7 space-y-3 shadow-sm">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold text-sm">
                4
              </div>
              <h3 className="text-base font-bold text-mk-ink">Constructive Candor</h3>
              <p className="text-xs sm:text-sm text-mk-slate leading-relaxed">
                Our AI interviewers don&apos;t nod along politely. They simulate real, demanding hiring managers who follow up when your answer lacks metrics, probe your trade-offs, and show you exactly what to fix before the real call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Company Details */}
      <section className="py-16 sm:py-20 border-b border-mk-line/60">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6">
          <div className="rounded-3xl border border-mk-line bg-mk-mist/50 p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <h3 className="text-lg font-bold text-mk-ink">Privacy, Security & Ownership</h3>
            </div>
            <p className="text-xs sm:text-sm text-mk-slate leading-relaxed">
              Your career facts, CV documents, and audio recordings belong entirely to you. 
              We never sell your data to third parties, recruiters, or ad brokers, and we never use your proprietary career materials to train foundation AI models. 
              You can configure audio retention periods or delete your data with a single click at any time.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-mk-blue">
              <Link href="/privacy" className="hover:underline">
                Read our full Privacy Policy →
              </Link>
              <Link href="/terms" className="hover:underline">
                Terms of Service →
              </Link>
            </div>

            <div className="pt-4 border-t border-mk-line/70 text-xs text-mk-slate space-y-1">
              <div>
                <strong>Hakkiri Studio</strong> is a trading name of Happy Cheeks Ltd (company number 15146182) · Registered in England and Wales
              </div>
              <div>
                Contact support:{" "}
                <a href="mailto:support@hakkiri.studio" className="text-mk-blue hover:underline">
                  support@hakkiri.studio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-[700px] px-4 sm:px-6 space-y-6">
          <div className="inline-flex justify-center">
            <Mark size={40} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-mk-ink tracking-tight">
            Ready to prepare for the interview you actually have?
          </h2>
          <p className="text-sm sm:text-base text-mk-slate leading-relaxed">
            Create your account in under two minutes. No card required. Start with a free diagnostic CV audit or jump straight into tailored mock interview practice.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-full bg-mk-cta px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-mk-cta/25 hover:bg-mk-cta-hover transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign up free
            </Link>
            <Link
              href="/cv-audit"
              className="rounded-full border border-mk-line bg-white px-6 py-3.5 text-sm font-semibold text-mk-ink hover:bg-mk-mist transition-all shadow-sm"
            >
              Audit your CV free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
