export function LandingSteps() {
  return (
    <section aria-labelledby="how-h" className="scroll-mt-14 py-10 sm:py-14" id="how">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <h2
          className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] text-center"
          id="how-h"
        >
          How AI interview practice works, in three steps
        </h2>
        <ol className="mx-auto mt-8 grid max-w-[1000px] gap-4 sm:grid-cols-3 sm:gap-5">
          <li className="group relative flex flex-col rounded-[20px] bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.06)] hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/[0.04] sm:p-6">
            <span className="num text-[38px] font-bold leading-none tracking-[-0.03em] text-mk-cta transition-transform duration-300 group-hover:scale-110 origin-left">
              1
            </span>
            <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.015em]">Add the job and your CV</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-mk-slate">
              Paste the job description or a link, add your CV or resume, and note the stages of the hiring process. Hakkiri shows what it understood about the role, so you can correct it before you start.
            </p>
          </li>
          <li className="group relative flex flex-col rounded-[20px] bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.06)] hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/[0.04] sm:p-6">
            <span className="num text-[38px] font-bold leading-none tracking-[-0.03em] text-mk-cta transition-transform duration-300 group-hover:scale-110 origin-left">
              2
            </span>
            <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.015em]">Practice out loud</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-mk-slate">
              A real-length mock interview with follow-up questions. Ask for a question to be rephrased or repeated, pause when you need to, and finish early if you have to: you still get your report.
            </p>
          </li>
          <li className="group relative flex flex-col rounded-[20px] bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.06)] hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/[0.04] sm:p-6">
            <span className="num text-[38px] font-bold leading-none tracking-[-0.03em] text-mk-cta transition-transform duration-300 group-hover:scale-110 origin-left">
              3
            </span>
            <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.015em]">Fix what matters most</h3>
            <p className="mt-1.5 text-[14px] leading-relaxed text-mk-slate">
              See if you are Ready, Nearly or Not yet for this job, your top three fixes, and a stronger version of every answer in your own words. Then run the interview again and see the before and after.
            </p>
          </li>
        </ol>
        <div className="mt-14 flex flex-col items-center gap-3">
          <a
            className="inline-flex items-center justify-center rounded-full bg-mk-cta font-medium text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:bg-mk-cta-hover hover:shadow-lg hover:shadow-mk-cta/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mk-cta px-7 py-3.5 text-[17px]"
            href="/signup"
            title="Not part of this preview"
          >
            Sign up free
          </a>
          <p className="text-[14px] text-mk-slate">Free for a limited time. No card. Takes about two minutes.</p>
        </div>
      </div>
    </section>
  );
}
