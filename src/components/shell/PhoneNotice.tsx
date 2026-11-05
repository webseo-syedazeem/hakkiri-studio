/** Studio is built for a laptop: on a phone, say so rather than show a squeezed layout. (Public pages work on phones.) */
export function PhoneNotice() {
  return (
    <div role="dialog" aria-label="Use a laptop" className="print-hide fixed inset-0 z-50 hidden flex-col items-center justify-center gap-3 bg-booth px-8 text-center max-[899px]:flex">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-blue-soft">
        <path d="M4 5h16v11H4z M2 19h20" />
      </svg>
      <p className="text-xl font-semibold tracking-[-0.015em]">Hakkiri Studio works on a laptop or desktop</p>
      <p className="max-w-[340px] text-[15px] leading-normal text-muted">Practice sessions need a bigger screen and a good microphone. Open this page on your computer to carry on.</p>
    </div>
  );
}
