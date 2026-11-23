import { LiveDemo } from "./LiveDemo";

export function LandingLiveSection() {
  return (
    <section aria-labelledby="why-h" className="overflow-hidden bg-mk-mist py-10 sm:py-14 w-full max-w-full">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10 min-w-0">
        <div className="min-w-0 w-full">
          <h2 className="text-[24px] xs:text-[26px] font-bold leading-[1.12] tracking-[-0.025em] [text-wrap:balance] sm:text-[34px] lg:text-[38px] break-words" id="why-h">
            Not a question list. A live AI interviewer.
          </h2>
          <p className="text-[15px] leading-[1.5] text-mk-slate [text-wrap:pretty] sm:text-[16px] mt-3">
            Most interview prep tools hand you a list of questions or mark a recording later. Hakkiri runs a real mock interview: built from your job description and CV, asked out loud, and the next question comes from what you just said.
          </p>
          <ul className="mt-6 flex flex-col gap-3.5">
            <li className="flex items-center gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-mk-blue shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
                <svg aria-hidden="true" fill="none" height="21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="21">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                </svg>
              </span>
              <span className="text-[15px] font-medium leading-snug">Follow-up questions on what you actually said</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-mk-blue shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
                <svg aria-hidden="true" fill="none" height="21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="21">
                  <path d="M7 3h7l5 5v13H7z M14 3v5h5 M10 13h6 M10 17h6"></path>
                </svg>
              </span>
              <span className="text-[15px] font-medium leading-snug">Built from your job description and CV</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-mk-blue shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
                <svg aria-hidden="true" fill="none" height="21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="21">
                  <path d="M5 21V4 M5 4h11l-2 4 2 4H5"></path>
                </svg>
              </span>
              <span className="text-[15px] font-medium leading-snug">Every answer scored and rewritten. Never your accent</span>
            </li>
          </ul>
        </div>
        <div className="min-w-0 w-full overflow-hidden">
          <LiveDemo />
        </div>
      </div>
    </section>
  );
}
