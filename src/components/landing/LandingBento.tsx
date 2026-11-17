export function LandingBento() {
  return (
    <section aria-labelledby="tiles-h" className="py-10 sm:py-14 bg-mk-mist">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <h2
          className="text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] mx-auto max-w-[820px] text-center"
          id="tiles-h"
        >
          Everything you need for the day.
        </h2>

        {/* Top 2 Big Cards - Perfectly Aligned */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 items-stretch">
          {/* Card 1: Focused Practice */}
          <article className="group flex flex-col overflow-hidden rounded-[24px] bg-white border border-black/[0.04] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div className="px-6 pt-6 sm:px-8 sm:pt-7 min-h-[140px] sm:min-h-[125px] flex flex-col justify-start">
              <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.015em] transition-colors duration-200 group-hover:text-mk-blue sm:text-[22px]">
                Focused practice, when you’ve got twenty minutes.
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-mk-slate">
                Short drills for what employers actually test: behaviours and strengths, STAR structure, stakeholder management, technical depth, salary and curveball questions. Scored like the real thing.
              </p>
            </div>
            <div className="mt-4 grow pl-6 sm:pl-8 flex items-end">
              <div className="w-full h-[280px] sm:h-[320px] overflow-hidden rounded-tl-[16px] bg-mk-bezel p-[6px] pb-0 pr-0 transition-transform duration-500 group-hover:scale-[1.015]">
                <img
                  alt="The Practice Hub: short drill sets by topic, with scores and recent progress."
                  className="block h-full w-full object-cover object-left-top rounded-tl-[11px]"
                  decoding="async"
                  height="1600"
                  loading="lazy"
                  src="/landing/practice-hub.webp"
                  width="2880"
                />
              </div>
            </div>
          </article>

          {/* Card 2: Morning Prep Sheet */}
          <article className="group flex flex-col overflow-hidden rounded-[24px] bg-white border border-black/[0.04] shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div className="px-6 pt-6 sm:px-8 sm:pt-7 min-h-[140px] sm:min-h-[125px] flex flex-col justify-start">
              <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.015em] transition-colors duration-200 group-hover:text-mk-blue sm:text-[22px]">
                One page for the morning of the interview.
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-mk-slate">
                Your best answers, which story for which question, what they’ll probe on your CV, and what to ask them.
              </p>
            </div>
            <div className="mt-4 grow pl-6 sm:pl-8 flex items-end">
              <div className="w-full h-[280px] sm:h-[320px] overflow-hidden rounded-tl-[16px] bg-mk-bezel p-[6px] pb-0 pr-0 transition-transform duration-500 group-hover:scale-[1.015]">
                <img
                  alt="A one-page prep sheet: the company and the job, your best answers, which story for which question, and questions to ask."
                  className="block h-full w-full object-cover object-left-top rounded-tl-[11px]"
                  decoding="async"
                  height="1600"
                  loading="lazy"
                  src="/landing/prep-new.webp"
                  width="2880"
                />
              </div>
            </div>
          </article>
        </div>

        {/* Bottom 4 Feature Cards - Perfectly Aligned */}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {/* Feature 1 */}
          <li className="group flex flex-col rounded-[20px] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-md transition-all bg-white border border-black/[0.04] shadow-sm h-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mk-mist text-mk-blue transition-all duration-300 group-hover:scale-110 group-hover:bg-mk-cta group-hover:text-white shrink-0">
              <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
                <path d="M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M8 10v11 M12 10v11 M16 10v11 M20 10v11" />
              </svg>
            </div>
            <div className="mt-4 flex flex-col grow">
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] min-h-[44px] flex items-start">
                Public sector ready
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-mk-slate grow">
                Behaviours, strengths and values-based questions, asked the way a public-sector panel asks them.
              </p>
            </div>
          </li>

          {/* Feature 2 */}
          <li className="group flex flex-col rounded-[20px] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-md transition-all bg-white border border-black/[0.04] shadow-sm h-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mk-mist text-mk-blue transition-all duration-300 group-hover:scale-110 group-hover:bg-mk-cta group-hover:text-white shrink-0">
              <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
                <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 5v16" />
              </svg>
            </div>
            <div className="mt-4 flex flex-col grow">
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] min-h-[44px] flex items-start">
                A story for every “Tell me about a time…”
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-mk-slate grow">
                Hakkiri finds the real examples in your CV, shows what each one is missing, and which questions none of them covers yet.
              </p>
            </div>
          </li>

          {/* Feature 3 */}
          <li className="group flex flex-col rounded-[20px] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-md transition-all bg-white border border-black/[0.04] shadow-sm h-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mk-mist text-mk-blue transition-all duration-300 group-hover:scale-110 group-hover:bg-mk-cta group-hover:text-white shrink-0">
              <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
                <path d="M5 21V4 M5 4h11l-2 4 2 4H5" />
              </svg>
            </div>
            <div className="mt-4 flex flex-col grow">
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] min-h-[44px] flex items-start">
                Talking about pay
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-mk-slate grow">
                Practise “What are you looking for?” for your stage of the process.
              </p>
            </div>
          </li>

          {/* Feature 4 */}
          <li className="group flex flex-col rounded-[20px] p-5 sm:p-6 hover:-translate-y-0.5 hover:shadow-md transition-all bg-white border border-black/[0.04] shadow-sm h-full">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mk-mist text-mk-blue transition-all duration-300 group-hover:scale-110 group-hover:bg-mk-cta group-hover:text-white shrink-0">
              <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="20">
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M3 12h18 M12 3c3 3.5 3 14.5 0 18 M12 3c-3 3.5-3 14.5 0 18" />
              </svg>
            </div>
            <div className="mt-4 flex flex-col grow">
              <h3 className="text-[17px] font-semibold tracking-[-0.01em] min-h-[44px] flex items-start">
                Never your accent
              </h3>
              <p className="mt-1 text-[13px] leading-relaxed text-mk-slate grow">
                Scored on what you say and how you structure it, never on how you sound.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
