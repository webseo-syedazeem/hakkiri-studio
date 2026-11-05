import Link from "next/link";
import { devOr } from "@/lib/launch";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ButtonLink, Crumbs, Meter, Panel, Sep } from "@/components/ui";
import { HearButton } from "@/components/feedback/HearButton";
import { SlideRows, type SlideRow } from "@/components/pitch/SlideRows";
import { getPresentation, getRun, listRuns } from "@/lib/pitch/store";
import { slideFlags } from "@/lib/pitch/measure";
import { AUDIENCE_LABEL, PART_LABEL, PART_ORDER, runTitle } from "@/lib/pitch/labels";
import { hasRecording } from "@/lib/answers/audio";
import { mmss, whenSaid } from "@/lib/format";

export const dynamic = "force-dynamic";

const DEMO_NOTE: Record<string, string> = {
  "no-keys": devOr("This is the demo report. Add DEEPGRAM_API_KEY and GEMINI_API_KEY or ANTHROPIC_API_KEY to .env.local to score your own runs.", "Scoring isn’t available right now, so this is an example. Try again in a few minutes."),
  "no-audio": "No recording was captured (the mic may be blocked), so this is the demo report.",
};

/** Run report (design screen 13): how a rehearsal went, slide by slide, and the one fix for the next run. */
export default async function RunReportPage({ params, searchParams }: { params: Promise<{ id: string; runId: string }>; searchParams: Promise<{ demo?: string }> }) {
  const { id, runId } = await params;
  const { demo } = await searchParams;
  const p = getPresentation(id);
  const run = getRun(runId);
  if (!p || !run || run.presentationId !== p.id) notFound();

  const sameMode = listRuns(p.id).filter((r) => r.mode === run.mode && r.number <= run.number && (run.mode !== "section" || (r.from === run.from && r.to === run.to)));
  const history = sameMode.slice(-3);
  const prev = sameMode[sameMode.length - 2];
  const budget = run.mode === "full" ? p.timeLimitSec : run.mode === "opening" ? 60 : run.slides.reduce((a, s) => a + (p.slides.find((x) => x.n === s.n)?.plannedSec ?? 0), 0);
  const over = run.totalSec - budget;
  const audioSrc = run.hasAudio && hasRecording(`run-${run.id}`) ? `/api/answers/run-${run.id}/audio/0` : null;

  const rows: SlideRow[] = run.slides.flatMap((r) => {
    const slide = p.slides.find((s) => s.n === r.n);
    if (!slide) return [];
    const isAsk = r.n === p.askSlide;
    const first = run.marks.findIndex((m) => m.n === r.n);
    const flags = slideFlags(r, slide.plannedSec, isAsk);
    return [
      {
        slide,
        planned: slide.plannedSec,
        seconds: r.seconds,
        chip: flags.chip,
        note: flags.note,
        covered: r.covered,
        quote: r.quote,
        words: r.words,
        firstAt: first >= 0 ? run.marks[first].at : null,
        leftAt: first >= 0 ? (run.marks[first + 1]?.at ?? run.totalSec) : null,
        isAsk,
      },
    ];
  });

  const parts = PART_ORDER.filter((k) => run.scores[k] != null);
  const focusSlide = run.focus.slide;
  const rerun =
    run.focus.kind === "opening"
      ? { href: `/rehearse/${p.id}?mode=opening`, label: "Re-run the opening" }
      : focusSlide != null
        ? { href: `/rehearse/${p.id}?from=${focusSlide}&to=${focusSlide}`, label: `Re-run slide ${focusSlide}` }
        : { href: `/rehearse/${p.id}`, label: "Full run again" };
  const scoreLine =
    run.overall == null
      ? "not scored"
      : !prev?.overall
        ? run.mode === "full"
          ? "your first full run"
          : "your first run like this"
        : run.overall > prev.overall
          ? `up from ${prev.overall.toFixed(1)}`
          : run.overall < prev.overall
            ? `down from ${prev.overall.toFixed(1)}`
            : "same as last time";

  return (
    <div className="flex grow flex-col">
      {demo && DEMO_NOTE[demo] && (
        <div role="status" className="mb-4 rounded-[10px] bg-blue/12 px-4 py-2.5 text-[13px] text-lilac shadow-[inset_0_0_0_1px_rgb(123_136_255/0.3)]">
          {DEMO_NOTE[demo]}
        </div>
      )}
      {run.partial && (
        <div role="status" className="mb-4 rounded-[10px] bg-red/10 px-4 py-2.5 text-[13px] text-red-soft">
          The AI couldn’t score this run, so you’re seeing what was measured: time on each slide and your delivery. Run it again to get the full report.
        </div>
      )}

      <header className="flex animate-rise items-end justify-between gap-8">
        <div className="min-w-0">
          <Crumbs items={[{ label: p.title, href: `/presentations/${p.id}` }, { label: "Runs", href: `/presentations/${p.id}` }]} />
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">{runTitle(run)}</h1>
          <div className="mt-1 text-sm text-muted">
            {whenSaid(run.startedAt)}
            <Sep />
            {run.slides.length} slide{run.slides.length === 1 ? "" : "s"}
            {run.endedEarly && " (ended early)"}
            <Sep />
            {AUDIENCE_LABEL[p.audience]}
          </div>
        </div>
        <div className="flex shrink-0 items-end gap-7">
          {history.length > 1 && (
            <div className="flex gap-5">
              {history.map((h) => (
                <Link key={h.id} href={`/presentations/${p.id}/runs/${h.id}`} className={clsx("text-right", h.id === run.id ? "text-ink" : "text-muted hover:text-ink")}>
                  <div className="text-xs">Run {h.number}</div>
                  <div className="num mt-0.5 text-[15px] font-semibold">
                    {mmss(h.totalSec)}
                    <span className="mx-1.5 font-normal text-dim">|</span>
                    {h.overall?.toFixed(1) ?? "n/a"}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="border-l border-line pl-7 text-right">
            <div className={clsx("num text-[44px] font-semibold leading-none tracking-[-0.035em]", over > 5 && "text-red-soft")}>{mmss(run.totalSec)}</div>
            <div className="mt-1.5 text-[13px] text-muted">{over > 5 ? `${mmss(over)} over your ${mmss(budget)}` : over < -5 ? `${mmss(-over)} inside your ${mmss(budget)}` : `right on your ${mmss(budget)}`}</div>
          </div>
          <div className="border-l border-line pl-7 text-right">
            <div className="num text-[44px] font-semibold leading-none tracking-[-0.035em]">{run.overall?.toFixed(1) ?? "n/a"}</div>
            <div className="mt-1.5 text-[13px] text-muted">{scoreLine}</div>
          </div>
        </div>
      </header>

      <div className="mt-5 grid min-h-0 grow grid-cols-[minmax(0,1fr)_400px] gap-5">
        <Panel aria-label="Slide by slide" className="animate-rise px-5 pb-2 pt-4 [animation-delay:0.05s]">
          <div className="flex items-baseline justify-between pb-2.5">
            <h2 className="text-[15px] font-semibold">Slide by slide</h2>
            <div className="flex items-center gap-4 text-[13px] text-muted">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-6 rounded-[3px] shadow-[inset_0_0_0_1px_var(--color-line-strong)]" />
                Planned
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-5 rounded-full bg-blue" />
                Actual
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-5 rounded-full bg-red" />
                Over
              </span>
            </div>
          </div>
          <SlideRows rows={rows} presentationId={p.id} audioSrc={audioSrc} />
          <p className="border-t border-line px-1 pb-2 pt-3 text-xs text-dim">Open a slide to see what you said on it{audioSrc ? " and hear it back" : ""}.</p>
        </Panel>

        <div className="flex min-w-0 flex-col gap-5">
          <Panel aria-label="Scores" className="animate-rise px-5 pb-3 pt-4 [animation-delay:0.1s]">
            <h2 className="text-[15px] font-semibold">Scores</h2>
            <div className="mt-1.5">
              {parts.map((k) => {
                const v = run.scores[k]!;
                return (
                  <div key={k} className="grid grid-cols-[1fr_120px_18px] items-center gap-4 border-b border-line py-2 last:border-b-0" title={run.evidence[k] ? `“${run.evidence[k]}”` : undefined}>
                    <span className="text-sm">{PART_LABEL[k]}</span>
                    <Meter value={v} segments={5} height={9} tone={v <= 2 ? "not-ready" : "ready"} label={`${PART_LABEL[k]}: ${v} out of 5`} />
                    <span className="num text-right text-sm font-semibold">{v}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs leading-normal text-dim">
              {run.delivery.wordsPerMinute != null && <>Pace {run.delivery.wordsPerMinute} words a minute · </>}
              {run.delivery.fillerCount} filler{run.delivery.fillerCount === 1 ? "" : "s"}
              {run.delivery.fillersPerMinute != null && ` (${run.delivery.fillersPerMinute} a minute)`}
              {" · "}
              {run.delivery.longPauses ? `${run.delivery.longPauses} long pause${run.delivery.longPauses === 1 ? "" : "s"}` : "no long pauses"}
              {run.mode !== "full" && ". Opening, message, structure and audience fit are scored on full runs."}
            </p>
          </Panel>

          <Panel aria-label="Your one fix" className="flex grow animate-rise flex-col px-5 py-4 [animation-delay:0.15s]">
            <div className="text-[13px] text-muted">Your one fix for the next run</div>
            <h2 className="mt-1 text-lg font-semibold leading-snug tracking-[-0.01em]">{run.fix.title}</h2>
            <p className="mt-1.5 text-sm leading-normal text-muted">{run.fix.body}</p>

            {run.cuts.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <div className="text-[13px] font-semibold">To get inside {mmss(budget)}</div>
                <ul className="mt-1.5 space-y-1.5">
                  {run.cuts.map((c) => (
                    <li key={c.n} className="grid grid-cols-[62px_1fr] gap-2 text-[13px] leading-normal">
                      <span className="num text-muted">Slide {c.n}</span>
                      <span>
                        {c.text} <span className="num text-dim">Saves about {mmss(c.saveSec)}.</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {run.openingRewrite && (
              <div className="mt-4 border-t border-line pt-3">
                <div className="text-[13px] font-semibold">Your opening, rewritten from your own words</div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#c9cad3]">{run.openingRewrite}</p>
                <HearButton text={run.openingRewrite} label="Hear it" />
              </div>
            )}

            <div className="grow" />
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <ButtonLink href={rerun.href}>{rerun.label}</ButtonLink>
              <ButtonLink href={`/qa/${p.id}`} variant="primary">
                Practise Q&A
              </ButtonLink>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
