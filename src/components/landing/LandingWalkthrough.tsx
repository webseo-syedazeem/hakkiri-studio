export function LandingWalkthrough() {
  return (
    <>
      {/* Section 4: A live interview */}
      <section aria-labelledby="interviews-h" className="scroll-mt-14 py-10 sm:py-14 bg-mk-mist" id="interviews">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
          <div className="mx-auto max-w-[820px] text-center">
            <span className="text-[13px] font-semibold text-mk-blue uppercase tracking-wider">A live mock interview</span>
            <h2 className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] mt-2" id="interviews-h">
              An AI interviewer that follows up on what you actually said.
            </h2>
            <p className="text-[19px] leading-[1.5] text-mk-slate [text-wrap:pretty] sm:text-[21px] mx-auto mt-5 max-w-[680px]">
              Say “we agreed to pause onboarding” and the next question is about your part in that decision. Hakkiri listens to each answer and asks what a hiring manager would ask next, in a natural voice, at the difficulty you choose.
            </p>
          </div>
          <ul className="mx-auto mt-8 flex max-w-[860px] flex-wrap justify-center gap-x-7 gap-y-3 text-[15px] text-mk-ink/80">
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Follow-up questions built from your last answer
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Rephrase, repeat or pause any question
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Easy, Medium or Hard
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              A checklist of what a complete answer covers
            </li>
          </ul>
          <div className="mt-14 sm:mt-16">
            <div className="group rounded-[20px] bg-mk-bezel p-[5px] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_60px_120px_-40px_rgb(23_28_80/0.45)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_0_1px_rgb(59_130_246/0.25),0_80px_160px_-40px_rgb(37_99_235/0.35)] sm:rounded-[26px] sm:p-[9px]">
              <div className="relative overflow-hidden rounded-[15px] sm:rounded-[18px]">
                <img
                  alt="Live AI mock interview for a Senior Product Manager role, question 1 of 8"
                  className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.012]"
                  decoding="async"
                  height="1800"
                  loading="lazy"
                  src="/landing/followup.webp"
                  width="2880"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Your report */}
      <section aria-labelledby="your-report-h" className="scroll-mt-14 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
          <div className="mx-auto max-w-[820px] text-center">
            <span className="text-[13px] font-semibold text-mk-blue uppercase tracking-wider">Your interview report</span>
            <h2 className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] mt-2" id="your-report-h">
              Ready, Nearly or Not yet. For this job.
            </h2>
            <p className="text-[19px] leading-[1.5] text-mk-slate [text-wrap:pretty] sm:text-[21px] mx-auto mt-5 max-w-[680px]">
              After every mock interview you get a clear verdict for the level of this job, an interview score for every category, and the three changes that would raise your score most, each with short focused practice. Stop halfway and you still get a report on what you did.
            </p>
          </div>
          <ul className="mx-auto mt-8 flex max-w-[860px] flex-wrap justify-center gap-x-7 gap-y-3 text-[15px] text-mk-ink/80">
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              A score for each category
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Your top three fixes
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Focused practice for each fix
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Run it again and see the before and after
            </li>
          </ul>
          <div className="mt-14 sm:mt-16">
            <div className="group rounded-[20px] bg-mk-bezel p-[5px] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_60px_120px_-40px_rgb(23_28_80/0.45)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_0_1px_rgb(59_130_246/0.25),0_80px_160px_-40px_rgb(37_99_235/0.35)] sm:rounded-[26px] sm:p-[9px]">
              <div className="relative overflow-hidden rounded-[15px] sm:rounded-[18px]">
                <img
                  alt="A Hakkiri interview report: the overall verdict and score, a score for each category, and the changes that would raise the score most."
                  className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.012]"
                  decoding="async"
                  height="1600"
                  loading="lazy"
                  src="/landing/report-new.webp"
                  width="2880"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Feedback on every answer */}
      <section aria-labelledby="feedback-on-every-answer-h" className="scroll-mt-14 py-10 sm:py-14 bg-mk-mist">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
          <div className="mx-auto max-w-[820px] text-center">
            <span className="text-[13px] font-semibold text-mk-blue uppercase tracking-wider">Interview feedback on every answer</span>
            <h2 className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] mt-2" id="feedback-on-every-answer-h">
              See exactly where an answer loses them.
            </h2>
            <p className="text-[19px] leading-[1.5] text-mk-slate [text-wrap:pretty] sm:text-[21px] mx-auto mt-5 max-w-[680px]">
              Every answer comes back marked up: the lines that worked, what was missing, and a stronger answer using the STAR method (Situation, Task, Action, Result), built from facts in your own CV. Edit your answer and have it scored again.
            </p>
          </div>
          <ul className="mx-auto mt-8 flex max-w-[860px] flex-wrap justify-center gap-x-7 gap-y-3 text-[15px] text-mk-ink/80">
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Your transcript with the strong and weak lines marked
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              What worked, what was missing
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              A stronger version in your own words
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Rewrite it and score it again
            </li>
          </ul>
          <div className="mt-14 sm:mt-16">
            <div className="group rounded-[20px] bg-mk-bezel p-[5px] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_60px_120px_-40px_rgb(23_28_80/0.45)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_0_1px_rgb(59_130_246/0.25),0_80px_160px_-40px_rgb(37_99_235/0.35)] sm:rounded-[26px] sm:p-[9px]">
              <div className="relative overflow-hidden rounded-[15px] sm:rounded-[18px]">
                <img
                  alt="Feedback on one answer: the transcript with key lines highlighted, what worked and what was missing, a refined STAR answer, and an Edit response button."
                  className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.012]"
                  decoding="async"
                  height="1600"
                  loading="lazy"
                  src="/landing/review.webp"
                  width="2880"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Every stage, in one place */}
      <section aria-labelledby="every-stage-in-one-place-h" className="scroll-mt-14 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
          <div className="mx-auto max-w-[820px] text-center">
            <span className="text-[13px] font-semibold text-mk-blue uppercase tracking-wider">Every interview stage, in one place</span>
            <h2 className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] mt-2" id="every-stage-in-one-place-h">
              Track the whole hiring process, not just one interview.
            </h2>
            <p className="text-[19px] leading-[1.5] text-mk-slate [text-wrap:pretty] sm:text-[21px] mx-auto mt-5 max-w-[680px]">
              Screening call, panel interview, presentation, final round: add each stage with its date, format and who you will meet. Your dashboard shows what is next, and each interview keeps its own practice settings.
            </p>
          </div>
          <ul className="mx-auto mt-8 flex max-w-[860px] flex-wrap justify-center gap-x-7 gap-y-3 text-[15px] text-mk-ink/80">
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Every stage of every application
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Dates, formats and interviewers
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              What is next, on your dashboard
            </li>
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" className="shrink-0 text-mk-cta" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="16"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
              Practice settings per interview
            </li>
          </ul>
          <div className="mt-14 sm:mt-16">
            <div className="group rounded-[20px] bg-mk-bezel p-[5px] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_60px_120px_-40px_rgb(23_28_80/0.45)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_0_1px_rgb(59_130_246/0.25),0_80px_160px_-40px_rgb(37_99_235/0.35)] sm:rounded-[26px] sm:p-[9px]">
              <div className="relative overflow-hidden rounded-[15px] sm:rounded-[18px]">
                <img
                  alt="An interview overview: the company and role, the stages of the process with dates and formats, and the practice settings for this interview."
                  className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.012]"
                  decoding="async"
                  height="1600"
                  loading="lazy"
                  src="/landing/stages.webp"
                  width="2880"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
