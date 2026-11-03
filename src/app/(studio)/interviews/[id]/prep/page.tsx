import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Icon, Panel, Sep } from "@/components/ui";
import { InterviewTabs } from "@/components/interview/InterviewTabs";
import { PrintButton } from "@/components/interview/PrintButton";
import { StartButton } from "@/components/interview/StartSession";
import { getInterview } from "@/lib/interviews/store";
import { buildPrepSheet } from "@/lib/interviews/prep";
import { settingsOr } from "@/lib/interviews/settings";
import { findAnswer, listAnswers } from "@/lib/answers/store";
import { doneSessions, isFresh, rowsFor } from "@/lib/mocks/store";
import { buildReport } from "@/lib/mocks/report";
import { interviewWhen } from "@/lib/sessions/labels";
import { londonToday } from "@/lib/dates";
import { whenSaid } from "@/lib/format";
import type { Answer } from "@/lib/types";

export const dynamic = "force-dynamic";

/** The first two sentences of a stronger answer, so the sheet stays on one page. */
function gist(text: string, maxWords = 55): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let out = sentences.slice(0, 2).join(" ");
  const words = out.split(/\s+/);
  if (words.length > maxWords) out = `${words.slice(0, maxWords).join(" ")}…`;
  else if (sentences.length > 2) out += " …";
  return out;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="border-b border-paper-line pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-paper-accent">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/**
 * The prep sheet: one page to read the morning of the interview, built from
 * your own practice. It appears after your first interview and gets better
 * every time you practise. Print it, or save it as a PDF.
 */
export default async function PrepSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const interview = getInterview(id);
  if (!interview) notFound();
  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const sessions = doneSessions(interview.id);
  const fresh = sessions.filter(isFresh);
  const when = interviewWhen(interview.date, londonToday());

  const header = (
    <header className="print-hide flex animate-rise items-center justify-between gap-6">
      <div className="flex min-w-0 items-center gap-4">
        <span aria-hidden className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[13px] bg-halden text-[22px] font-bold text-[#ddebe5]">
          {interview.companyInitial}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-[-0.02em]">{interview.role}</h1>
          <div className="mt-0.5 text-sm text-muted">
            {interview.company}
            <Sep />
            {when.text}
            {when.rel && when.rel !== "done" && (
              <>
                <Sep />
                <b className="font-semibold text-ink">{when.rel}</b>
              </>
            )}
          </div>
        </div>
      </div>
      {fresh.length > 0 && <PrintButton />}
    </header>
  );

  if (!fresh.length) {
    return (
      <div className="flex grow flex-col">
        {header}
        <InterviewTabs id={interview.id} current="prep" prepReady={false} />
        <Panel className="mt-5 max-w-[680px] animate-rise px-6 py-6">
          <div className="flex items-center gap-2.5 text-[15px] font-semibold">
            <Icon name="lock" size={16} className="text-muted" />
            Your prep sheet appears after your first interview
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            It’s built from your own answers, not handed to you before you’ve practised: your best answers to the key questions, which story to use for which question, what they’ll probe on your CV and how to handle it, questions to ask them, and three things to remember. It gets better every time you practise.
          </p>
          <StartButton interviewId={interview.id} micOk={micOk} body={{ kind: "interview", settings: settingsOr(interview.settings, interview.style) }} variant="primary" className="mt-4">
            <Icon name="mic" size={16} strokeWidth={2} />
            Start your first interview
          </StartButton>
        </Panel>
      </div>
    );
  }

  // Every answer you've given here: in interviews, re-runs, drills and single questions.
  const byId = new Map<string, Answer>();
  for (const a of listAnswers(interview.id)) byId.set(a.id, a);
  for (const m of sessions) for (const aid of m.answerIds) if (!byId.has(aid)) {
    const a = findAnswer(aid);
    if (a) byId.set(aid, a);
  }
  const latest = fresh[0];
  const latestRows = rowsFor(latest);
  const sheet = buildPrepSheet(interview, { answers: [...byId.values()], interviews: fresh.length, fixes: buildReport(latestRows, interview.interviewer.name).fixes, rows: latestRows });

  return (
    <div className="flex grow flex-col">
      {header}
      <div className="print-hide">
        <InterviewTabs id={interview.id} current="prep" />
        <p className="mt-4 text-[13px] text-muted">
          Built from {sheet.basedOn.interviews} interview{sheet.basedOn.interviews === 1 ? "" : "s"} and {sheet.basedOn.answers} answer{sheet.basedOn.answers === 1 ? "" : "s"}, last updated {whenSaid(latest.finishedAt).toLowerCase()}. It improves each time you practise.
        </p>
      </div>

      <article aria-label="Prep sheet" className="print-sheet mt-4 w-full max-w-[1000px] animate-rise rounded-[14px] bg-paper px-10 py-9 text-[13px] leading-[1.5] text-paper-ink shadow-[0_20px_60px_rgb(0_0_0/0.35)]">
        <div className="flex items-baseline justify-between gap-6 border-b-2 border-paper-ink pb-2.5">
          <div>
            <div className="text-[22px] font-bold tracking-[-0.02em]">
              {interview.company}: {interview.role}
            </div>
            <div className="text-paper-muted">
              {when.text}
              {interview.format ? ` · ${interview.format === "in-person" ? "In person" : interview.format === "video" ? "Video call" : "Phone"}` : ""}
            </div>
          </div>
          <div className="text-right text-xs font-semibold text-paper-muted">Hakkiri prep sheet</div>
        </div>

        <div className="mt-5 grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-x-8 gap-y-5">
          <div className="space-y-5">
            <Section title="The company and the job">
              {sheet.company.whatTheyDo && <p>{sheet.company.whatTheyDo}</p>}
              <p className={sheet.company.whatTheyDo ? "mt-1.5" : ""}>
                <b>The job: </b>
                {sheet.company.jobSummary}
              </p>
              {sheet.company.skills.length > 0 && (
                <p className="mt-1.5 text-paper-muted">
                  <b className="text-paper-ink">They want: </b>
                  {sheet.company.skills.join(", ")}
                </p>
              )}
              {sheet.company.whyYou.length > 0 && (
                <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                  {sheet.company.whyYou.slice(0, 2).map((w) => (
                    <li key={w}>
                      <b>Why you: </b>
                      {w}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Your best answers">
              {sheet.bestAnswers.length === 0 && <p className="text-paper-muted">Your scored answers appear here as you practise.</p>}
              <div className="space-y-3">
                {sheet.bestAnswers.slice(0, 3).map((b) => (
                  <div key={b.questionId} className="break-inside-avoid">
                    <div className="flex items-baseline justify-between gap-3">
                      <b>{b.question}</b>
                      <Link href={`/interviews/${interview.id}/answers/${b.answerId}`} className="print-hide shrink-0 text-xs font-semibold text-paper-accent hover:underline">
                        Full answer
                      </Link>
                    </div>
                    <p className="mt-0.5 text-paper-muted">{gist(b.text)}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="If pay comes up">
              {sheet.pay.answer ? <p>“{gist(sheet.pay.answer, 40)}”</p> : <p className="text-paper-muted">Practise “Talking about pay” and your best answer appears here.</p>}
              <p className="mt-1 text-paper-muted">{sheet.pay.tip}</p>
            </Section>
          </div>

          <div className="space-y-5">
            <Section title="Which story for which question">
              {sheet.stories.length === 0 && <p className="text-paper-muted">No stories yet. Build one from your training.</p>}
              <ul className="space-y-1.5">
                {sheet.stories.slice(0, 4).map((s) => (
                  <li key={s.title}>
                    <b>{s.title}</b> <span className="text-paper-muted">({s.source})</span>
                    {s.useFor.length > 0 && <div className="text-paper-muted">For: {s.useFor.join("; ")}</div>}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="They’re likely to probe">
              {sheet.probes.length === 0 && <p className="text-paper-muted">Nothing on your CV stands out as a likely probe.</p>}
              <ul className="space-y-1.5">
                {sheet.probes.slice(0, 3).map((p) => (
                  <li key={p.ask}>
                    <b>{p.ask}</b>
                    {p.handle && <div className="text-paper-muted">{p.handle}</div>}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Questions to ask them">
              <ol className="list-decimal space-y-0.5 pl-4">
                {sheet.questionsToAsk.slice(0, 3).map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </Section>

            <Section title="Three things to remember">
              <ol className="space-y-1">
                {sheet.remember.map((r, k) => (
                  <li key={r} className="flex gap-2">
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-paper-ink text-[11px] font-bold text-paper">{k + 1}</span>
                    <b>{r}</b>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        </div>
      </article>
    </div>
  );
}
