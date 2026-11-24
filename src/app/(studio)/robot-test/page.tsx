import { notFound } from "next/navigation";
import { requirePageUser } from "@/lib/auth/require";
import { isAdminUser } from "@/lib/auth/admin";
import { NOT_RUN, PERSONAS } from "@/lib/robot-test/tester";

export const dynamic = "force-dynamic";

/**
 * The "robot tester" page, for administrators.
 *
 * It used to announce "ALL SECTIONS PASSED", "4 Learning Bots Verified" and a
 * score for each test person. None of that was measured: nothing was sent to
 * a model and nothing was run. The page now says so, and lists the written
 * test people as what they are: cases a real evaluation would use. It shows
 * no scores, no passes and no bots, because there are none.
 */
export default async function RobotTestPage() {
  const user = await requirePageUser();
  // Decided on the server. Anyone who is not an administrator gets "not found".
  if (!isAdminUser(user)) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[880px] grow flex-col gap-6 pb-12">
      <header>
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink">Robot tester</h1>
        <p className="mt-1 text-[15px] text-muted">Written test cases for the interview scoring. No automated check runs from this page.</p>
      </header>

      <p role="note" data-testid="robot-not-run" className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100">
        <b className="font-semibold">Nothing has been run.</b> {NOT_RUN}
      </p>

      <section aria-labelledby="how" className="rounded-2xl bg-panel p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <h2 id="how" className="text-base font-semibold text-ink">
          What does test the app today
        </h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted">
          <li>
            The unit tests: <code className="text-ink">npx vitest run</code>.
          </li>
          <li>
            The browser tests, which walk each flow as a new signed-in person on a built copy of the app: <code className="text-ink">npm run build &amp;&amp; npm run e2e</code>. They run in test mode, so they prove the screens and the rules, not the quality of the AI’s scoring.
          </li>
          <li>Scoring quality has no automated check yet. It needs live keys and a set of answers with agreed scores to compare against.</li>
        </ul>
      </section>

      <section aria-labelledby="cases" className="rounded-2xl bg-panel p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <h2 id="cases" className="text-base font-semibold text-ink">
          The written test people ({PERSONAS.length})
        </h2>
        <p className="mt-1 text-sm text-muted">Each is a made-up candidate with a CV summary and sample answers, written by hand as test material. None has been scored.</p>
        <ul className="mt-4 space-y-3">
          {PERSONAS.map((p) => (
            <li key={p.id} className="rounded-xl bg-panel-2 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{p.name}</h3>
                <span className="text-xs text-muted">Not run</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{p.role}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{p.cvSummary}</p>
              <p className="mt-1.5 text-xs text-muted">
                {Object.keys(p.sampleAnswers).length} sample {Object.keys(p.sampleAnswers).length === 1 ? "answer" : "answers"} written.
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
