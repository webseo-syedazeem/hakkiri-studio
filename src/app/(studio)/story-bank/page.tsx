import Link from "next/link";
import { cookies } from "next/headers";
import clsx from "clsx";
import { ButtonLink, Icon, Panel } from "@/components/ui";
import { StoryCard } from "@/components/stories/StoryCard";
import { storyBank } from "@/lib/stories/bank";
import { londonToday } from "@/lib/dates";

export const dynamic = "force-dynamic"; // stories change as you build and practise

/**
 * The story bank (design screen 8): every story from every interview, with
 * the parts each one is missing, the kinds of question it covers, and how
 * often you reach for it. Fill in the gaps, practise a story, or build one
 * for a kind of question none of yours covers.
 */
export default async function StoryBankPage() {
  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const bank = storyBank(londonToday());
  const complete = bank.stories.filter((s) => s.missing.length === 0).length;
  const uncovered = bank.themes.filter((t) => t.stories.length === 0);
  const buildHref = (skill: string, question: string, interviewId = bank.buildIn?.id) => `/interviews/${interviewId}/story?skill=${encodeURIComponent(skill)}&question=${encodeURIComponent(question)}&from=bank`;

  return (
    <div className="flex grow flex-col">
      <header className="flex animate-rise items-end justify-between gap-6">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Story bank</h1>
          <p className="mt-1 max-w-[760px] text-[15px] text-muted">The real examples you tell when they ask “Tell me about a time…”. Most people need six to eight good ones to cover nearly every question.</p>
        </div>
        {bank.stories.length > 0 && (
          <div className="shrink-0 text-right text-sm">
            <div>
              <b className="num text-2xl font-semibold tracking-[-0.02em]">{bank.stories.length}</b> <span className="text-muted">stories</span>
            </div>
            <div className="text-[13px] text-muted">
              {complete} complete · {bank.stories.length - complete} missing a part · {uncovered.length} kind{uncovered.length === 1 ? "" : "s"} of question not covered
            </div>
          </div>
        )}
      </header>

      {bank.demo && (
        <div role="status" className="mt-5 animate-rise rounded-[12px] bg-blue/12 px-5 py-3 text-sm text-lilac shadow-[inset_0_0_0_1px_rgb(123_136_255/0.3)]">
          These are the demo’s stories. <Link href="/interviews/new" className="font-semibold text-ink underline-offset-2 hover:underline">Add your own interview</Link> and your stories come from your CV.
        </div>
      )}

      {bank.stories.length === 0 ? (
        <Panel className="mt-5 max-w-[680px] animate-rise px-6 py-6">
          <h2 className="text-[15px] font-semibold">No stories yet</h2>
          <p className="mt-1.5 text-sm text-muted">Hakkiri finds your stories in your CV and cover letter when you set up an interview. You can also build one from four quick prompts.</p>
          <div className="mt-4 flex gap-2.5">
            <ButtonLink href="/interviews/new" variant="primary">
              Set up an interview
            </ButtonLink>
            {bank.buildIn && <ButtonLink href={buildHref("A result you’re proud of", "Tell me about an achievement you’re proud of.")}>Build a story</ButtonLink>}
          </div>
        </Panel>
      ) : (
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_380px] items-start gap-5">
          <div className="flex min-w-0 flex-col gap-4">
            {bank.stories.map((s, k) => (
              <StoryCard key={s.key} story={s} answers={bank.answers} micOk={micOk} delay={0.04 * k} />
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Panel aria-label="What your stories cover" className="animate-rise px-6 py-5 [animation-delay:0.05s]">
              <h2 className="text-[15px] font-semibold">What your stories cover</h2>
              <p className="mt-0.5 text-[13px] text-muted">The kinds of “tell me about a time” question nearly every interview asks.</p>
              <ul className="mt-3">
                {bank.themes.map((t) => (
                  <li key={t.id} className="grid grid-cols-[18px_1fr_auto] items-start gap-2.5 border-t border-line py-2.5 first:border-t-0">
                    <Icon name={t.stories.length ? "check" : "x"} size={16} strokeWidth={2.4} className={clsx("mt-0.5", t.stories.length ? "text-blue-soft" : "text-red-soft")} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{t.label}</div>
                      <div className="truncate text-xs text-muted" title={t.stories.join("; ")}>
                        {t.stories.length ? t.stories.join("; ") : "No story yet"}
                      </div>
                    </div>
                    {!t.stories.length && bank.buildIn && (
                      <ButtonLink href={buildHref(t.label, t.question)} size="sm">
                        Build one
                      </ButtonLink>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>

            {bank.gaps.length > 0 && (
              <Panel aria-label="Skills the job asks for" className="animate-rise px-6 py-5 [animation-delay:0.08s]">
                <h2 className="text-[15px] font-semibold">Skills the job asks for</h2>
                <p className="mt-0.5 text-[13px] text-muted">In the job spec, but none of your stories shows them yet.</p>
                <ul className="mt-3">
                  {bank.gaps.map((g) => (
                    <li key={`${g.interviewId}-${g.skill}`} className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-line py-2.5 first:border-t-0">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{g.skill}</div>
                        <div className="text-xs text-muted">{g.company}</div>
                      </div>
                      <ButtonLink href={buildHref(g.skill, g.question, g.interviewId)} size="sm">
                        Build one
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <p className="px-1 text-xs leading-relaxed text-dim">
              Stories come from your CV and cover letter, and from the ones you build. A story counts as covering a kind of question from its title and what it fits. “Comes up in” is a rough match on your answers, to show which stories you reach for most.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
