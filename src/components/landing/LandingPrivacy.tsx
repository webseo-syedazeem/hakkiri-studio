export function LandingPrivacy() {
  return (
    <section aria-labelledby="private-h" className="py-10 sm:py-12">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center">
        <div>
          <svg aria-hidden="true" className="text-mk-cta" fill="none" height="30" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="30">
            <path d="M5 11h14v9H5z M8 11V8a4 4 0 0 1 8 0v3"></path>
          </svg>
          <h2 className="mt-4 text-[22px] font-bold leading-tight tracking-[-0.02em] sm:text-[26px]" id="private-h">
            Your interview practice stays private.
          </h2>
        </div>
        <ul className="flex flex-col gap-3 text-[14px] leading-relaxed text-mk-slate">
          <li className="flex gap-3">
            <svg aria-hidden="true" className="mt-1 shrink-0 text-mk-cta" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="18"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
            <span>Recordings of your answers and rehearsals are deleted after the time you choose: 30 days, 90 days, a year, or only when you delete them.</span>
          </li>
          <li className="flex gap-3">
            <svg aria-hidden="true" className="mt-1 shrink-0 text-mk-cta" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="18"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
            <span>Download everything, or delete everything, from Settings at any time.</span>
          </li>
          <li className="flex gap-3">
            <svg aria-hidden="true" className="mt-1 shrink-0 text-mk-cta" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24" width="18"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
            <span>Your CV, slides and recordings are not used to train AI, and they are never shared with employers, recruiters or anyone else.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
