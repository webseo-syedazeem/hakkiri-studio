import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { ButtonLink, Chip, Crumbs, Panel, Pin, Sep } from "@/components/ui";
import { AnswerClip } from "@/components/feedback/AnswerClip";
import { HearButton } from "@/components/feedback/HearButton";
import { Transcript } from "@/components/feedback/Transcript";
import { SlideView } from "@/components/pitch/SlideView";
import { getPresentation, getPresentationAsync, getQa, getQaAsync } from "@/lib/pitch/store";
import { demoQaSession } from "@/lib/pitch/demo";
import { devOr, isLaunch } from "@/lib/launch";
import { QA_STYLE_LABEL } from "@/lib/pitch/labels";
import { scoreAnswerView } from "@/lib/answers/view";
import { hasRecording } from "@/lib/answers/audio";
import { scoreLabel } from "@/lib/scoring/combine";
import { mmss, whenSaid } from "@/lib/format";

export const dynamic = "force-dynamic";

const DEMO_NOTE: Record<string, string> = {
  "no-keys": devOr("This is the demo Q&A report. Add DEEPGRAM_API_KEY and GEMINI_API_KEY or ANTHROPIC_API_KEY to .env.local to score your own answers.", "Scoring isn’t available right now, so this is an example. Try again in a few minutes."),
  "no-audio": "No recording was captured (the mic may be blocked), so this is the demo Q&A report.",
};

function Score({ value }: { value: number | null }) {
  if (value == null) return <span className="text-dim">Not scored</span>;
  return (
    <span>
      <span className={clsx("num font-semibold", value < 3 ? "text-red-soft" : "text-ink")}>{value.toFixed(1)}</span> <span className="text-muted">{scoreLabel(value)}</span>
    </span>
  );
}

/** Q&A report: each answer scored (answer first, honest, linked back to your ask), and a stronger version of your weakest. */
export default async function QaReportPage({ params, searchParams }: { params: Promise<{ id: string; sessionId: string }>; searchParams: Promise<{ q?: string; demo?: string }> }) {
  const { id, sessionId } = await params;
  const { q: qParam, demo } = await searchParams;
  const p = (await getPresentationAsync(id)) ?? getPresentation(id);
  let s = (await getQaAsync(sessionId)) ?? getQa(sessionId);
  if (!s && p?.id === "q1-roadmap" && !isLaunch()) {
    s = { ...demoQaSession, id: sessionId };
  }
  if (!p || !s || s.presentationId !== p.id) notFound();

  const views = s.answers.map((a) => ({ a, v: scoreAnswerView(a, "presentation-qa"), q: s.questions[a.questionNumber - 1] }));
  const pressed = views.filter((x) => x.a.followUps.length).length;
  const weakest = [...views].sort((x, y) => (x.v.overall ?? 5) - (y.v.overall ?? 5))[0];
  const selected = views.find((x) => String(x.a.questionNumber) === qParam) ?? views[0];
  const sel = selected;
  const pointIdx = sel.a.pointWordIndex;
  const late = sel.a.highlights.find((h) => h.kind === "late");
  const audio = (turn: number) => (hasRecording(sel.a.id, turn) ? `/api/answers/${sel.a.id}/audio/${turn}` : null);
  const slide = sel.q?.slide != null ? p.slides.find((x) => x.n === sel.q.slide) : undefined;

  return (
    <div className="flex grow flex-col">
      <header className="flex animate-rise items-end justify-between gap-8">
        <div className="min-w-0">
          <Crumbs items={[{ label: p.title, href: `/presentations/${p.id}` }, { label: "Audience Q&A", href: `/presentations/${p.id}` }]} />
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.025em]">Q&A: {QA_STYLE_LABEL[s.style].toLowerCase()} audience</h1>
          <div className="mt-1 text-sm text-muted">
            {whenSaid(s.startedAt)}
            <Sep />
            {s.persona.name}, {s.persona.title}
            <Sep />
            {s.answers.length} question{s.answers.length === 1 ? "" : "s"}
            {s.answers.length < s.questions.length && ` (ended early, ${s.questions.length} planned)`}
            {pressed > 0 && (
              <>
                , asked again on {pressed}
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="num text-[44px] font-semibold leading-none tracking-[-0.035em]">{s.overall?.toFixed(1) ?? "n/a"}</div>
          <div className="mt-1.5 text-[13px] text-muted">Q&A handling{s.overall != null ? `, ${scoreLabel(s.overall).toLowerCase()}` : ""}</div>
        </div>
      </header>

      <div className="mt-5 grid min-h-0 grow grid-cols-[minmax(0,1fr)_400px] gap-5">
        <div className="flex min-w-0 flex-col gap-5">
          <Panel aria-label="Question by question" className="animate-rise px-5 pb-1.5 pt-4 [animation-delay:0.05s]">
            <div className="grid grid-cols-[28px_minmax(0,1fr)_60px_120px] gap-4 px-1 pb-2.5 text-[13px] text-muted">
              <span />
              <span className="text-[15px] font-semibold text-ink">Question by question</span>
              <span>Length</span>
              <span>Score</span>
            </div>
            {views.map((x) => (
              <Link
                key={x.a.id}
                href={`/presentations/${p.id}/qa/${s.id}?q=${x.a.questionNumber}`}
                scroll={false}
                aria-current={x === sel ? "true" : undefined}
                className={clsx("grid grid-cols-[28px_minmax(0,1fr)_60px_120px] items-center gap-4 rounded-md border-t border-line px-1 py-2.5 text-sm hover:bg-white/[0.03]", x === sel && "bg-white/[0.04]")}
              >
                <span className="num text-dim">{x.a.questionNumber}</span>
                <span className="min-w-0">
                  <span className="block truncate">{x.q?.text}</span>
                  {x.v.followUps[0] && (
                    <span className="mt-1 flex items-center gap-2 text-[13px] text-muted">
                      <span className="text-dim">↳</span> Asked again
                      {x.v.followUps[0].tripped ? <Chip tone="red">{x.v.followUps[0].tripped}</Chip> : <span className="text-blue-soft">then answered</span>}
                    </span>
                  )}
                </span>
                <span className="num text-muted">{mmss(x.v.metrics.lengthSec)}</span>
                <Score value={x.v.overall} />
              </Link>
            ))}
          </Panel>

          <Panel aria-label={`Question ${sel.a.questionNumber}`} className="flex min-h-[420px] grow animate-rise flex-col px-6 py-5 [animation-delay:0.1s]">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0">
                <div className="text-[13px] text-muted">
                  Question {sel.a.questionNumber}: {s.persona.name} asked
                </div>
                <h2 className="mt-1 text-xl font-semibold leading-snug tracking-[-0.015em]">{sel.q?.text}</h2>
                {sel.q?.pressIf && <p className="mt-1 text-[13px] text-dim">Would ask again if {sel.q.pressIf.replace(/^if\s+/i, "").replace(/\.$/, "")}.</p>}
              </div>
              {slide && <SlideView slide={slide} presentationId={p.id} className="w-[150px] shrink-0 rounded-[5px] shadow-[0_0_0_1px_var(--color-line-strong)]" />}
            </div>
            <div className="mt-4">
              <AnswerClip
                words={sel.a.words}
                metrics={sel.v.metrics}
                late={late ? { start: sel.a.words[late.from].start, end: sel.a.words[late.to].end } : null}
                belongsWithinSec={sel.v.profile.pointWithinSec}
                targetSec={sel.v.profile.targetSec}
                audioSrc={audio(0)}
              />
            </div>
            <div className="mt-4 grid min-h-0 grow grid-cols-[minmax(0,1fr)_260px] gap-6">
              <div className="min-h-[260px]">
                <Transcript
                  words={sel.a.words}
                  highlights={sel.a.highlights}
                  notes={sel.a.notes}
                  stronger={sel.a.strongerVersion}
                  strongerLengthSec={sel.a.strongerLengthSec}
                  followUps={sel.v.followUps.map((f, i) => ({ ...f, audioSrc: audio(i + 1) }))}
                  interviewerName={s.persona.name}
                />
              </div>
              <div>
                <div className="text-[13px] font-semibold">Notes</div>
                {sel.a.notes.map((n) => (
                  <div key={n.id} className="mt-2.5 grid grid-cols-[26px_1fr] gap-1.5 text-[13px] leading-normal">
                    <Pin n={n.id} tone={n.tone} />
                    <span>
                      <span className="font-semibold text-ink">{n.title}.</span> <span className="text-muted">{n.body}</span>
                    </span>
                  </div>
                ))}
                {pointIdx >= 0 && sel.v.metrics.pointArrivesAt != null && (
                  <p className="mt-3 border-t border-line pt-3 text-[13px] text-muted">
                    {sel.v.metrics.pointArrivesAt <= sel.v.profile.pointWithinSec ? (
                      <>
                        Your answer came at <b className="num font-semibold text-ink">{mmss(sel.v.metrics.pointArrivesAt)}</b>, inside the first {sel.v.profile.pointWithinSec} seconds. That’s what they want.
                      </>
                    ) : (
                      <>
                        Your answer arrives at <b className="num font-semibold text-red-soft">{mmss(sel.v.metrics.pointArrivesAt)}</b>. In Q&A it should come in the first {sel.v.profile.pointWithinSec} seconds.
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {weakest && (
            <Panel aria-label="Your weakest answer, stronger" className="animate-rise px-5 py-4 [animation-delay:0.12s]">
              <div className="text-[13px] text-muted">Your weakest answer, made stronger</div>
              <div className="mt-1 text-sm font-semibold leading-snug">{weakest.q?.text}</div>
              <div className="mt-1 text-[13px] text-muted">
                You scored <Score value={weakest.v.overall} />. {weakest.a.oneFix}
              </div>
              <div className="mt-3 border-t border-line pt-3 text-[15px] leading-relaxed text-[#d4d5dd]">
                {weakest.a.strongerVersion.map((x, i) => (
                  <p key={i} className={clsx(i > 0 && "mt-2")}>
                    {x.highlight ? <span className="good">{x.text}</span> : x.text}
                  </p>
                ))}
              </div>
              <HearButton text={weakest.a.strongerVersion.map((x) => x.text).join(" ")} />
              <p className="mt-3 text-xs text-dim">Built from your own words: answer first, then the reason, then back to your ask.</p>
            </Panel>
          )}

          <Panel aria-label="What went well" className="animate-rise px-5 py-4 [animation-delay:0.14s]">
            <div className="text-[13px] font-semibold">What to keep</div>
            <ul className="mt-2 space-y-2">
              {views
                .filter((x) => (x.v.overall ?? 0) >= 4)
                .slice(0, 2)
                .map((x) => (
                  <li key={x.a.id} className="text-[13px] leading-normal">
                    <span className="num text-dim">Q{x.a.questionNumber}</span> <span className="text-muted">{x.a.strength}</span>
                  </li>
                ))}
              {views.every((x) => (x.v.overall ?? 0) < 4) && <li className="text-[13px] text-muted">Nothing scored 4 yet. Lead with the answer, then one reason.</li>}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <ButtonLink href={`/qa/${p.id}?style=${s.style}`} variant="primary">
                Practise Q&A again
              </ButtonLink>
              <ButtonLink href={`/presentations/${p.id}`}>Back to presentation</ButtonLink>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
