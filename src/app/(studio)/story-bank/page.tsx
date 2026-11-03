import Link from "next/link";
import { cookies } from "next/headers";
import clsx from "clsx";
import { ButtonLink, Chip, Icon, Panel } from "@/components/ui";
import { StoryCard } from "@/components/stories/StoryCard";
import { storyBank } from "@/lib/stories/bank";
import { londonToday } from "@/lib/dates";

export const dynamic = "force-dynamic"; // stories change as you build and practise

export default async function StoryBankPage() {
  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const bank = storyBank(londonToday());
  const complete = bank.stories.filter((s) => s.missing.length === 0).length;
  const missingParts = bank.stories.length - complete;
  const uncovered = bank.themes.filter((t) => t.stories.length === 0);
  const covered = bank.themes.length - uncovered.length;
  const buildHref = (skill: string, question: string, interviewId = bank.buildIn?.id) =>
    `/interviews/${interviewId}/story?skill=${encodeURIComponent(skill)}&question=${encodeURIComponent(question)}&from=bank`;

  return (
    <div className="flex grow flex-col gap-7 pb-10">
      {/* Top Header */}
      <header className="flex animate-rise flex-wrap items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <Icon name="book" size={14} className="text-blue-soft" />
            <span>Behavioral Framework Suite</span>
          </div>
          <h1 className="mt-1 text-[32px] font-extrabold tracking-tight text-ink">STAR Story Bank</h1>
          <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-muted">
            The proven real-world achievements you draw upon for “Tell me about a time…” questions. Master 6 to 8 structured stories to answer 90% of behavioral prompts.
          </p>
        </div>

        {bank.buildIn && (
          <ButtonLink href={buildHref("A key milestone or result", "Tell me about an achievement you’re most proud of.")} variant="primary" size="md" className="shadow-lg">
            <Icon name="plus" size={16} strokeWidth={2.4} />
            <span>Build New Story</span>
          </ButtonLink>
        )}
      </header>

      {/* KPI Overview Banner across full desktop */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 animate-rise [animation-delay:0.05s]">
        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Total Stories in Vault</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-ink">{bank.stories.length}</span>
            <span className="text-xs text-blue-soft">Ready for practice</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Complete STAR Framework</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">{complete}</span>
            <span className="text-xs text-muted">All 4 parts verified</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Missing Result or Action</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className={clsx("text-2xl font-extrabold", missingParts > 0 ? "text-amber-400" : "text-emerald-400")}>
              {missingParts}
            </span>
            <span className="text-xs text-muted">Needs metrics</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-panel/70 p-4 backdrop-blur-sm">
          <div className="text-xs font-medium text-muted">Prompt Themes Covered</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-ink">{covered} / {bank.themes.length}</span>
            <span className="text-xs text-blue-soft">Themes matched</span>
          </div>
        </div>
      </div>

      {bank.demo && (
        <div role="status" className="animate-rise rounded-2xl border border-blue/20 bg-blue/10 px-5 py-3.5 text-sm text-lilac backdrop-blur-sm">
          <span className="font-semibold text-ink">Preloaded Demo Career Stories:</span> These stories represent past achievements from Fernway and Brightpay.{" "}
          <Link href="/interviews/new" className="font-bold text-blue-soft underline-offset-2 hover:underline">
            Create your own interview pipeline
          </Link>{" "}
          and Hakkiri automatically parses stories directly from your uploaded CV.
        </div>
      )}

      {bank.stories.length === 0 ? (
        <Panel className="mt-2 max-w-[680px] animate-rise rounded-2xl border border-white/[0.08] p-8 shadow-xl">
          <h2 className="text-lg font-bold text-ink">No stories recorded yet</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Hakkiri extracts your achievements from your CV and cover letter when you set up an interview pipeline. You can also build one manually using our 4-step guided prompt.
          </p>
          <div className="mt-5 flex gap-3">
            <ButtonLink href="/interviews/new" variant="primary">
              Set up an interview
            </ButtonLink>
            {bank.buildIn && (
              <ButtonLink href={buildHref("A result you’re proud of", "Tell me about an achievement you’re proud of.")}>
                Build a story manually
              </ButtonLink>
            )}
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          {/* Main Column: Story Cards */}
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <span className="text-sm font-bold text-ink">Recorded Career Stories</span>
              <span className="text-xs text-muted">Structured in Situation, Task, Action, Result</span>
            </div>

            <div className="flex flex-col gap-4">
              {bank.stories.map((s, k) => (
                <StoryCard key={s.key} story={s} answers={bank.answers} micOk={micOk} delay={0.04 * k} />
              ))}
            </div>
          </div>

          {/* Right Column: Theme Coverage & Job Spec Gaps */}
          <aside className="flex min-w-0 flex-col gap-6">
            <Panel aria-label="What your stories cover" className="animate-rise rounded-2xl border border-white/[0.08] bg-panel/80 p-6 shadow-xl backdrop-blur-md">
              <h2 className="text-base font-bold text-ink">Core Behavioral Theme Coverage</h2>
              <p className="mt-1 text-xs text-muted">
                Essential situational questions that interviewers will ask during competency rounds:
              </p>
              <ul className="mt-4 space-y-1">
                {bank.themes.map((t) => (
                  <li key={t.id} className="grid grid-cols-[20px_1fr_auto] items-start gap-3 border-t border-line/60 py-3 first:border-t-0">
                    <Icon
                      name={t.stories.length ? "check" : "x"}
                      size={16}
                      strokeWidth={2.4}
                      className={clsx("mt-0.5", t.stories.length ? "text-emerald-400" : "text-red-soft")}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-ink">{t.label}</div>
                      <div className="mt-0.5 truncate text-[11px] text-muted" title={t.stories.join("; ")}>
                        {t.stories.length ? t.stories.join("; ") : "No story mapped yet"}
                      </div>
                    </div>
                    {!t.stories.length && bank.buildIn && (
                      <ButtonLink href={buildHref(t.label, t.question)} size="sm">
                        Build
                      </ButtonLink>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>

            {bank.gaps.length > 0 && (
              <Panel aria-label="Skills the job asks for" className="animate-rise rounded-2xl border border-amber-500/20 bg-panel/80 p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Icon name="flag" size={15} className="text-amber-400" />
                  <h2 className="text-base font-bold text-ink">Target Job Spec Gaps</h2>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Required skills flagged in the job specification that currently lack a dedicated STAR story:
                </p>
                <ul className="mt-4 space-y-2">
                  {bank.gaps.map((g) => (
                    <li key={`${g.interviewId}-${g.skill}`} className="flex items-center justify-between gap-3 rounded-xl bg-booth/70 p-3 border border-white/[0.04]">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-ink">{g.skill}</div>
                        <div className="text-[11px] text-muted">{g.company}</div>
                      </div>
                      <ButtonLink href={buildHref(g.skill, g.question, g.interviewId)} size="sm" variant="primary">
                        Draft Story
                      </ButtonLink>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <div className="rounded-2xl border border-white/[0.06] bg-booth/40 p-4 text-xs leading-relaxed text-dim">
              <span className="font-semibold text-muted">Framework Tip:</span> Stories should emphasize specific metrics and outcomes (e.g. “improved checkout completion from 41% to 58% in 6 weeks”) rather than generic responsibilities.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
