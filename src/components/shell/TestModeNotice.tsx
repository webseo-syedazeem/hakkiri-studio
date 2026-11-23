import clsx from "clsx";

/**
 * Shown wherever results are on screen while the app is running without live
 * AI (test mode). In that mode the questions, transcripts, scores and feedback
 * are stand-ins made by the app itself: they are not a reading of what the
 * person said, and the person is told so on the screen that shows them.
 */
export function TestModeNotice({ what = "The questions, transcripts, scores and feedback here", className }: { what?: string; className?: string }) {
  return (
    <p role="note" data-testid="test-mode-notice" className={clsx("rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100", className)}>
      <b className="font-semibold">Test mode.</b> {what} are stand-ins made without AI. They are not a reading of what you said, and they don’t show how you did.
    </p>
  );
}
