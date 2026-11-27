import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Icon, Panel, type IconName } from "@/components/ui";
import { InterviewTabs } from "@/components/interview/InterviewTabs";
import { PrintButton } from "@/components/interview/PrintButton";
import { StartButton } from "@/components/interview/StartSession";
import { PrepChecklist } from "@/components/interview/PrepChecklist";
import { PrepDocumentsViewer } from "@/components/interview/PrepDocumentsViewer";
import { getInterview, isDemoInterview } from "@/lib/interviews/store";
import { buildPrepSheet } from "@/lib/interviews/prep";
import { likelyQuestions, prepPriorities, prepStage } from "@/lib/interviews/prep-view";
import { settingsOr } from "@/lib/interviews/settings";
import { findAnswer, listAnswers } from "@/lib/answers/store";
import { doneSessions, isFresh, rowsFor } from "@/lib/mocks/store";
import { buildReport } from "@/lib/mocks/report";
import { interviewWhen } from "@/lib/sessions/labels";
import { londonToday } from "@/lib/dates";
import { getChecklistForInterview } from "@/lib/sessions/topics";
import type { Answer } from "@/lib/types";
import { requirePageUser } from "@/lib/auth/require";

export const dynamic = "force-dynamic";

function Card({ icon, tone, title, note, children, testid }: { icon: IconName; tone: string; title: string; note?: string; children: React.ReactNode; testid: string }) {
  return (
    <Panel className="p-5 sm:p-6 space-y-3" data-testid={testid}>
      <div className="flex items-start gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone}`}>
          <Icon name={icon} size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {note ? <p className="mt-0.5 text-xs text-muted">{note}</p> : null}
        </div>
      </div>
      {children}
    </Panel>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => <p className="rounded-xl bg-panel-2 border border-line px-3.5 py-3 text-xs leading-relaxed text-muted">{children}</p>;

/**
 * The prep sheet for one interview. Every line on it comes from this
 * interview (what was read from the job, the company and the CV at set-up)
 * or from this person's own practice on it (scored answers, stories, the
 * patterns their interviews showed). A part with nothing behind it says so
 * and says what would fill it.
 */
export default async function PrepSheetPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const interview = getInterview(id, user.id);
  if (!interview) notFound();
  const micOk = (await cookies()).get("hk_mic_ok")?.value === "1";
  const sessions = doneSessions(interview.id, user.id);
  const fresh = sessions.filter(isFresh);
  const when = interviewWhen(interview.date, londonToday());

  // Every answer this person has given on this interview.
  const byId = new Map<string, Answer>();
  for (const a of listAnswers(interview.id, user.id)) byId.set(a.id, a);
  for (const m of sessions)
    for (const aid of m.answerIds)
      if (!byId.has(aid)) {
        const a = findAnswer(aid, user.id);
        if (a) byId.set(aid, a);
      }
  const latest = fresh[0];
  const latestRows = latest ? rowsFor(latest, user.id) : [];
  const fixes = latest ? buildReport(latestRows, interview.interviewer.name).fixes : [];
  const sheet = buildPrepSheet(interview, { answers: [...byId.values()], interviews: fresh.length, fixes, rows: latestRows });

  const stage = prepStage(interview);
  const priorities = prepPriorities({ interviewId: interview.id, fixes, gaps: interview.gaps ?? [], stories: interview.stories ?? [] });
  const questions = likelyQuestions(interview);
  const probes = sheet.probes.filter((p) => p.ask.trim());
  const checklistItems = getChecklistForInterview(interview);
  const storyHref = `/interviews/${interview.id}/story`;

  return (
    <div className="flex grow flex-col pb-12">
      <div className="animate-rise">
        <Link href="/interviews" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors mb-3">
          <Icon name="back" size={12} />
          <span>Interviews</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3.5">
            <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-[19px] font-bold text-emerald-700 border border-emerald-500/30 dark:bg-emerald-900/40 dark:text-emerald-300 shadow-sm">
              {interview.companyInitial || interview.company.charAt(0).toUpperCase() || "?"}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-ink">{interview.role || "Prep sheet"}</h1>
              <div className="mt-0.5 text-xs text-muted flex flex-wrap items-center gap-2">
                {interview.company ? <span>{interview.company}</span> : null}
                {stage ? (
                  <>
                    <span aria-hidden>·</span>
                    <span>{stage}</span>
                  </>
                ) : null}
                <span aria-hidden>·</span>
                <span>
                  {when.text} {when.rel && when.rel !== "done" && <b className="font-semibold text-ink">({when.rel})</b>}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <PrintButton />
            <StartButton
              interviewId={interview.id}
              micOk={micOk}
              body={{ kind: "interview", settings: settingsOr(interview.settings, interview.style) }}
              variant="primary"
              size="md"
              buttonClassName="px-4 py-2 rounded-xl text-xs flex items-center gap-2 group shadow-[0_4px_20px_rgba(79,82,248,0.35)] hover:shadow-[0_6px_26px_rgba(79,82,248,0.6)]"
            >
              <Icon name="play" size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              <span>Practise this interview</span>
            </StartButton>
          </div>
        </div>

        <InterviewTabs id={interview.id} current="prep" sample={isDemoInterview(interview.id)} />
        <p className="mt-4 text-xs text-muted" data-testid="prep-based-on">
          Built from what Hakkiri read at set-up
          {sheet.basedOn.interviews > 0 || sheet.basedOn.answers > 0
            ? `, ${sheet.basedOn.interviews} practice interview${sheet.basedOn.interviews === 1 ? "" : "s"} and ${sheet.basedOn.answers} scored answer${sheet.basedOn.answers === 1 ? "" : "s"}.`
            : ". You haven’t practised this interview yet, so the parts that come from your answers are empty."}
        </p>
      </div>

      {/* One-Stop Shop: Application Documents Hub */}
      <div className="mt-5 animate-rise [animation-delay:0.03s]">
        <PrepDocumentsViewer
          role={interview.role}
          company={interview.company}
          jobText={interview.documents?.job || interview.jobSummary}
          jobUrl={interview.sources?.job || interview.companyUrl}
          cvText={interview.documents?.cv}
          cvFileName={interview.sources?.cv}
          coverLetterText={interview.documents?.coverLetter}
          coverLetterFileName={interview.sources?.coverLetter}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5 animate-rise [animation-delay:0.05s]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5">
          <Card testid="prep-company" icon="brief" tone="bg-blue-fill/15 text-blue-soft border-blue-fill/25" title="The company and the role">
            {sheet.company.whatTheyDo ? <p className="text-xs text-muted leading-relaxed">{sheet.company.whatTheyDo}</p> : <Empty>Hakkiri has no summary of this company. It writes one when the company’s website can be read at set-up: rebuild the interview with the website to add it.</Empty>}
            {sheet.company.jobSummary ? (
              <p className="text-xs text-muted leading-relaxed">
                <b className="font-semibold text-ink">The job: </b>
                {sheet.company.jobSummary}
              </p>
            ) : null}

            <div className="border-t border-line/60 pt-3">
              <h3 className="text-xs font-bold text-ink mb-2">What the job asks for</h3>
              {sheet.company.skills.length ? (
                <ul className="flex flex-wrap gap-1.5 text-xs">
                  {sheet.company.skills.map((s) => (
                    <li key={s} className="rounded-md bg-panel-2 border border-line px-2 py-1 text-ink">
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No skills were picked out from the job description.</Empty>
              )}
            </div>

            {sheet.company.toKnow.length > 0 && (
              <div className="border-t border-line/60 pt-3">
                <h3 className="text-xs font-bold text-ink mb-2">Worth knowing</h3>
                <ul className="space-y-1.5 text-xs text-muted">
                  {sheet.company.toKnow.map((k) => (
                    <li key={k} className="flex items-start gap-2">
                      <span aria-hidden className="text-dim">•</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sheet.company.whyYou.length > 0 && (
              <div className="border-t border-line/60 pt-3">
                <h3 className="text-xs font-bold text-ink mb-2">Links between your CV and this role</h3>
                <ul className="space-y-1.5 text-xs text-muted">
                  {sheet.company.whyYou.map((k) => (
                    <li key={k} className="flex items-start gap-2">
                      <span aria-hidden className="text-emerald-300 font-bold">✓</span>
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card testid="prep-priorities" icon="target" tone="bg-purple-500/15 text-purple-300 border-purple-500/25" title="Your preparation priorities" note="From your latest practice interview, and from skills the job asks for that your stories don’t yet cover.">
            {priorities.length ? (
              <ol className="space-y-4 pt-1">
                {priorities.map((p, i) => (
                  <li key={p.title} className="flex items-start gap-3">
                    <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-fill/25 text-blue-soft text-xs font-bold border border-blue-fill/30">
                      {i + 1}
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-ink">{p.title}</div>
                      <p className="text-muted leading-relaxed">{p.detail}</p>
                      <Link href={p.href} className="inline-block font-semibold text-blue-soft hover:underline">
                        {p.action} →
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty>Nothing yet. Priorities come from your scored answers: do a practice interview and the habits it shows will be listed here.</Empty>
            )}
          </Card>

          <Card testid="prep-best-answers" icon="sparkle" tone="bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/25" title="Your best answers" note="Your highest-scoring answer to each question, in its stronger version.">
            {sheet.bestAnswers.length ? (
              <ul className="space-y-3">
                {sheet.bestAnswers.map((a) => (
                  <li key={a.questionId} className="rounded-xl bg-panel-2 p-3.5 border border-line space-y-2">
                    <div className="flex items-start justify-between gap-3 text-xs font-bold text-ink">
                      <Link href={`/interviews/${interview.id}/answers/${a.answerId}`} className="hover:text-blue-soft">
                        {a.question}
                      </Link>
                      <span className="num shrink-0 text-ink">{a.score.toFixed(1)} / 5</span>
                    </div>
                    {a.text ? <p className="text-[11px] leading-relaxed text-muted">“{a.text}”</p> : <p className="text-[11px] text-muted">No stronger version was written for this answer.</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No scored answers yet. After you practise, your best answer to each question appears here.</Empty>
            )}
          </Card>

          <Card testid="prep-stories" icon="book" tone="bg-emerald-500/15 text-emerald-300 border-emerald-500/25" title="Your stories" note="Stories found in your CV at set-up, and the ones you built.">
            {sheet.stories.length ? (
              <ul className="space-y-3">
                {sheet.stories.map((s) => (
                  <li key={s.title} className="rounded-xl bg-panel-2 p-3.5 border border-line space-y-1.5 text-xs">
                    <div className="font-bold text-ink">{s.title}</div>
                    <div className="text-[11px] text-dim">{s.source}</div>
                    {s.text ? <p className="text-[11px] leading-relaxed text-muted">{s.text}</p> : null}
                    {s.useFor.length ? <p className="text-[11px] text-muted">Use it for: {s.useFor.join(", ")}.</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>
                No stories yet.{" "}
                {(interview.gaps ?? []).length ? (
                  <Link href={storyHref} className="font-semibold text-blue-soft hover:underline">
                    Build one for a skill the job asks for
                  </Link>
                ) : (
                  "Stories are picked out of your CV at set-up, and added when you build one."
                )}
              </Empty>
            )}
          </Card>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-5">
          <Card testid="prep-questions" icon="chat" tone="bg-blue-fill/15 text-blue-soft border-blue-fill/25" title="Likely questions and how to approach them" note="The questions written for this interview, most important first.">
            {questions.length ? (
              <div className="divide-y divide-line/60">
                <div className="grid grid-cols-[1.2fr_1.8fr] gap-3 pb-2 text-[11px] font-semibold text-muted uppercase tracking-wider">
                  <span>Likely question</span>
                  <span>How to approach it</span>
                </div>
                {questions.map((q) => (
                  <Link key={q.id} href={`/mock/${interview.id}?q=${encodeURIComponent(q.id)}`} className="grid grid-cols-[1.2fr_1.8fr] gap-3 py-3 items-start text-xs group hover:bg-panel-2/70 rounded-lg transition-colors px-1">
                    <span className="font-semibold text-ink group-hover:text-blue-soft transition-colors">{q.text}</span>
                    <span className="flex items-start justify-between gap-2 text-muted leading-relaxed text-[11px]">
                      <span>{q.approach}</span>
                      <Icon name="chevronRight" size={13} className="shrink-0 text-dim mt-0.5 group-hover:text-blue-fill dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty>No questions have been written for this interview yet.</Empty>
            )}
          </Card>

          <Card testid="prep-probes" icon="chat" tone="bg-indigo-500/15 text-indigo-300 border-indigo-500/25" title="Be ready for follow-up questions" note="What an interviewer is likely to probe in your CV.">
            {probes.length ? (
              <ul className="space-y-2.5">
                {probes.map((p) => (
                  <li key={p.ask} className="rounded-xl bg-panel-2 p-3.5 border border-line text-xs space-y-1">
                    <div className="font-bold text-ink">{p.ask}</div>
                    {p.handle ? <p className="text-[11px] leading-relaxed text-muted">{p.handle}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Nothing in your CV was picked out as likely to be probed.</Empty>
            )}
          </Card>

          <Card testid="prep-checklist" icon="layers" tone="bg-teal-500/15 text-teal-300 border-teal-500/25" title="Topics to practise" note="Practice topics matched to the job’s title and description. Tick them off as you go: the ticks are kept on this page only until you leave it.">
            {checklistItems.length ? <PrepChecklist items={checklistItems} interviewId={interview.id} /> : <Empty>No practice topics matched this job.</Empty>}
          </Card>

          <Card testid="prep-ask" icon="target" tone="bg-emerald-500/15 text-emerald-300 border-emerald-500/25" title="Questions to ask the interviewer">
            {sheet.questionsToAsk.length ? (
              <ul className="space-y-2 text-xs text-muted pl-1">
                {sheet.questionsToAsk.map((q) => (
                  <li key={q} className="flex items-start gap-2">
                    <span aria-hidden className="text-dim">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>None were written for this interview. They are written at set-up when the job description can be read.</Empty>
            )}
          </Card>

          <Card testid="prep-remember" icon="checkCircle" tone="bg-amber-500/15 text-amber-300 border-amber-500/25" title="On the day" note={fixes.length ? "Reminders from the habits your latest interview showed." : "General reminders: they become your own after a practice interview."}>
            <ul className="space-y-2 text-xs text-muted pl-1">
              {sheet.remember.map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span aria-hidden className="text-dim">•</span>
                  <span>{r}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span aria-hidden className="text-dim">•</span>
                <span>
                  <b className="font-semibold text-ink">Pay: </b>
                  {sheet.pay.tip}
                  {sheet.pay.answer ? ` Your best answer so far: “${sheet.pay.answer}”` : ""}
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
