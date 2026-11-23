import Link from "next/link";

export function LandingBeta() {
  return (
    <section aria-labelledby="beta-h" className="scroll-mt-14 bg-mk-mist py-10 sm:py-14" id="beta">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-mk-blue shadow-[inset_0_0_0_1px_var(--color-mk-line)]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-mk-cta"></span>
            Beta · Free for everyone, for a limited time
          </p>
          <h2
            className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px]"
            id="beta-h"
          >
            Free AI interview practice for everyone, while the beta runs.
          </h2>
          <p className="text-[15px] leading-[1.5] text-mk-slate [text-wrap:pretty] sm:text-[16px] mt-2.5">
            Sign up, add a job, and start your first mock interview in about two minutes. Everything included, no card, no catch beyond one ask: tell us where it is wrong.
          </p>
        </div>

        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <article
            aria-labelledby="plan-beta"
            className="relative flex flex-col justify-center rounded-[24px] bg-white px-6 py-7 shadow-[0_0_0_2px_var(--color-mk-cta),0_20px_40px_-20px_rgb(74_90_240/0.35)] sm:px-8 sm:py-8"
          >
            <span className="absolute -top-3.5 left-8 rounded-full bg-mk-cta px-3 py-1 text-[12px] font-semibold text-white">
              Everything included
            </span>
            <h3 className="text-[22px] font-bold leading-tight tracking-[-0.015em] [text-wrap:balance] sm:text-[26px]" id="plan-beta">
              Your first interview, tonight.
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-mk-slate">
              Sign up with email or Google, then paste the job description and add your CV. The AI interviewer does the rest.
            </p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="num text-[36px] font-bold leading-none tracking-[-0.035em]">Free</span>
              <span className="text-[17px] text-mk-slate">for 10 hours a month, while the beta runs</span>
            </p>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-mk-cta font-medium text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:bg-mk-cta-hover hover:shadow-lg hover:shadow-mk-cta/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta px-7 py-3.5 text-[17px] mt-5 w-full"
              href="/signup"
            >
              Sign up free
            </Link>
            <p className="mt-4 text-center text-[14px] text-mk-slate">
              No card. Nothing to cancel. Already have an account?{" "}
              <Link className="font-medium text-mk-blue underline-offset-4 hover:underline" href="/login">
                Sign in
              </Link>
            </p>
          </article>

          <div className="rounded-[24px] bg-white px-6 py-6">
            <h3 className="text-[19px] font-semibold">What’s in the beta</h3>
            <ul className="mt-3.5 flex flex-col gap-2.5 text-[14px]">
              <li className="flex gap-2.5">
                <svg aria-hidden="true" className="mt-0.5 shrink-0 text-mk-cta" fill="none" height="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="17"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                <span>Mock interviews built from your job and CV, with follow-ups on what you say</span>
              </li>
              <li className="flex gap-2.5">
                <svg aria-hidden="true" className="mt-0.5 shrink-0 text-mk-cta" fill="none" height="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="17"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                <span>A report after every interview, and feedback on every answer</span>
              </li>
              <li className="flex gap-2.5">
                <svg aria-hidden="true" className="mt-0.5 shrink-0 text-mk-cta" fill="none" height="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="17"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                <span>Focused practice, the story bank, your prep sheet and the stages tracker</span>
              </li>
              <li className="flex gap-2.5">
                <svg aria-hidden="true" className="mt-0.5 shrink-0 text-mk-cta" fill="none" height="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="17"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                <span>Presentations and audience Q&amp;A</span>
              </li>
              <li className="flex gap-2.5">
                <svg aria-hidden="true" className="mt-0.5 shrink-0 text-mk-cta" fill="none" height="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="17"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                <span>10 hours of practice a month: about twenty 30-minute interviews</span>
              </li>
              <li className="flex gap-2.5">
                <svg aria-hidden="true" className="mt-0.5 shrink-0 text-mk-cta" fill="none" height="17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="17"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                <span>Download or delete everything you have made, any time</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 12 Top: Three small cards */}
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          <li className="rounded-[22px] bg-white px-5 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mk-mist text-mk-blue">
              <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="22"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">Tell us where it's wrong</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-mk-slate">
              Every screen has a Feedback button. When a score feels harsh, a question feels off or something confuses you, say so there.
            </p>
          </li>
          <li className="rounded-[22px] bg-white px-5 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mk-mist text-mk-blue">
              <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="22"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2"></path></svg>
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">Use it for a real interview</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-mk-slate">
              Build the mock interview from the real job description. We want to see how it does against the job you are actually going for.
            </p>
          </li>
          <li className="rounded-[22px] bg-white px-5 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mk-mist text-mk-blue">
              <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">Ten minutes at the end</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-mk-slate">
              A short survey after your interview. Beta users hear first when plans arrive, with a thank-you price.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
