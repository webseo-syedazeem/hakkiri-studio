import Link from "next/link";
import { cookies } from "next/headers";
import clsx from "clsx";
import { ButtonLink, Icon, Panel } from "@/components/ui";
import { VoiceSetting } from "@/components/settings/VoiceSetting";
import { AccountControls } from "@/components/settings/AccountControls";
import {
  DataButtons,
  RetentionSetting,
} from "@/components/settings/DataControls";
import { UsageChart } from "@/components/settings/UsageChart";
import { londonToday } from "@/lib/dates";
import { isBeta, isLaunch } from "@/lib/launch";
import { mockAiEnabled } from "@/lib/ai/mock";
import { elevenLabsKey } from "@/lib/ai/providers/elevenlabs";
import {
  byFeature,
  dailyCosts,
  totals,
  usageInMonth,
  usageOn,
} from "@/lib/usage/store";
import { LIMITS, limitStanding } from "@/lib/usage/limits";
import { dollars } from "@/lib/usage/prices";
import { dataCounts, hasData } from "@/lib/data/account";
import { getSettings } from "@/lib/settings/store";
import { pruneRecordings } from "@/lib/answers/audio";
import { alertsConfigured, recentProblems } from "@/lib/alerts/store";
import { TestAlert } from "@/components/settings/TestAlert";

export const dynamic = "force-dynamic";

const FEATURE_LABEL: Record<string, string> = {
  "set-up": "Setting up interviews",
  questions: "Writing questions",
  interview: "Interviews",
  "single question": "Single questions",
  presentation: "Presentation rehearsals",
  "q&a": "Audience Q&A",
  stories: "Story bank",
  voice: "Interviewer voice",
  other: "Other",
};

const SERVICE_LABEL = {
  claude: "Claude (questions, follow-ups, feedback)",
  deepgram: "Deepgram (speech to text)",
  elevenlabs: "ElevenLabs (interviewer voice)",
} as const;

const mins = (m: number) => {
  const r = Math.round(m);
  return r >= 60
    ? `${Math.floor(r / 60)} h${r % 60 ? ` ${r % 60} min` : ""}`
    : `${r} min`;
};

function Bar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Number(value.toFixed(2))}
      className="h-2 overflow-hidden rounded-full bg-white/[0.07]"
    >
      <div
        className={clsx(
          "h-full rounded-full",
          pct >= 100 ? "bg-red" : pct >= 80 ? "bg-lilac" : "bg-blue",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Panel
      id={id}
      aria-labelledby={`${id}-h`}
      className="scroll-mt-6 px-6 py-5"
    >
      <h2
        id={`${id}-h`}
        className="text-[17px] font-semibold tracking-[-0.01em]"
      >
        {title}
      </h2>
      {intro && <p className="mt-1 text-sm text-muted">{intro}</p>}
      <div className="mt-4">{children}</div>
    </Panel>
  );
}

/** Settings: microphone, interviewer voice, practice and usage, your data. */
export default async function SettingsPage() {
  const jar = await cookies();
  const micOk = jar.get("hk_mic_ok")?.value === "1";
  const voiceChoice =
    jar.get("hk_voice")?.value === "browser" ? "browser" : "natural";
  const launch = isLaunch();
  const beta = isBeta();
  const testMode = mockAiEnabled() && !launch;
  const naturalAvailable = !!elevenLabsKey() && !mockAiEnabled();
  const unavailableNote = naturalAvailable
    ? null
    : launch
      ? null
      : mockAiEnabled()
        ? "Test mode is on (HAKKIRI_MOCK_AI=1), so the browser voice is used. Turn test mode off and add ELEVENLABS_API_KEY to .env.local for the natural voice."
        : "Add ELEVENLABS_API_KEY to .env.local and restart for the natural voice.";

  pruneRecordings();
  const today = londonToday();
  const standing = limitStanding(today);
  const todayT = totals(usageOn(today));
  const month = usageInMonth(today);
  const monthT = totals(month);
  const features = byFeature(month);
  const days = dailyCosts(today, 14);
  const counts = dataCounts();
  const settings = getSettings();
  const problems = launch ? [] : recentProblems(8);
  const alerts = alertsConfigured();

  return (
    <div className="flex grow flex-col">
      <header className="animate-rise">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">
          Settings
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Your microphone, the interviewer’s voice, how much you’ve practised,
          and your data.
        </p>
      </header>

      <div className="mt-6 grid animate-rise grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Section id="microphone" title="Microphone">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-sm">
                <Icon
                  name={micOk ? "check" : "mic"}
                  size={17}
                  strokeWidth={2.2}
                  className={micOk ? "text-blue-soft" : "text-muted"}
                />
                {micOk
                  ? "Checked and working in this browser."
                  : "Not checked in this browser yet."}
              </div>
              <ButtonLink href="/mic-check?next=/settings" size="sm">
                {micOk ? "Check again" : "Check your microphone"}
              </ButtonLink>
            </div>
          </Section>

          <Section
            id="voice"
            title="Interviewer voice"
            intro="How the interviewer sounds when they ask you questions."
          >
            <VoiceSetting
              initial={voiceChoice}
              naturalAvailable={naturalAvailable}
              unavailableNote={unavailableNote}
            />
          </Section>

          <Section
            id="data"
            title="Your data"
            intro="Everything you’ve given Hakkiri or made in it is yours. Download a copy or delete it at any time."
          >
            <dl className="grid grid-cols-3 gap-x-4 gap-y-3 text-sm">
              {(
                [
                  ["Interviews", counts.interviews],
                  ["Practice sessions", counts.sessions],
                  ["Answers", counts.answers],
                  ["Recordings", counts.recordings],
                  ["Presentations", counts.presentations],
                  ["Rehearsals", counts.rehearsals],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[13px] text-muted">{k}</dt>
                  <dd className="num text-lg font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t border-line pt-5">
              <RetentionSetting initial={settings.retentionDays} />
            </div>
            <div className="mt-5 border-t border-line pt-5">
              <DataButtons hasData={hasData(counts)} />
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-5">
          <Section
            id="usage"
            title={launch ? "Your practice" : "Usage"}
            intro={
              beta
                ? "How much of this month’s beta allowance you’ve used. It resets on the 1st; hours count only while you practise."
                : launch
                  ? "How long you’ve practised. There’s a daily limit so the service stays quick for everyone."
                  : "What Hakkiri has used today and this month, against the limits in .env.local."
            }
          >
            {testMode && (
              <div
                role="status"
                className="mb-4 rounded-[10px] bg-blue/12 px-4 py-2.5 text-[13px] text-lilac shadow-[inset_0_0_0_1px_rgb(123_136_255/0.3)]"
              >
                Test mode is on, so these are samples of what real calls would
                use. They don’t count towards the limits and nothing is charged.
              </div>
            )}
            <div className="flex flex-col gap-4">
              {LIMITS.monthlyMinutes > 0 && (
                <div>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>Beta practice this month</span>
                    <span className="num text-muted">
                      {mins(standing.minutesMonth ?? 0)} of{" "}
                      {mins(LIMITS.monthlyMinutes)}
                    </span>
                  </div>
                  <Bar
                    value={standing.minutesMonth ?? 0}
                    max={LIMITS.monthlyMinutes}
                    label="Minutes of practice this month, against your monthly beta allowance"
                  />
                </div>
              )}
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>Speaking today</span>
                  <span className="num text-muted">
                    {mins(standing.minutesToday)}
                    {LIMITS.dailyMinutes
                      ? ` of ${mins(LIMITS.dailyMinutes)}`
                      : ""}
                  </span>
                </div>
                {LIMITS.dailyMinutes > 0 && (
                  <Bar
                    value={standing.minutesToday}
                    max={LIMITS.dailyMinutes}
                    label="Minutes of speaking today, against the daily limit"
                  />
                )}
              </div>
              {!launch && (
                <>
                  <div>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span>Spent today</span>
                      <span className="num text-muted">
                        {dollars(standing.spentToday)}
                        {LIMITS.dailyUsd ? ` of $${LIMITS.dailyUsd}` : ""}
                      </span>
                    </div>
                    {LIMITS.dailyUsd > 0 && (
                      <Bar
                        value={standing.spentToday}
                        max={LIMITS.dailyUsd}
                        label="Spending today, against the daily limit"
                      />
                    )}
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span>Spent this month</span>
                      <span className="num text-muted">
                        {dollars(standing.spentMonth)}
                        {LIMITS.monthlyUsd ? ` of $${LIMITS.monthlyUsd}` : ""}
                      </span>
                    </div>
                    {LIMITS.monthlyUsd > 0 && (
                      <Bar
                        value={standing.spentMonth}
                        max={LIMITS.monthlyUsd}
                        label="Spending this month, against the monthly limit"
                      />
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 border-t border-line pt-5">
              {launch ? (
                <UsageChart
                  title="Minutes of speaking, last 14 days"
                  value="Minutes"
                  days={days.map((d) => ({ day: d.day, value: d.minutes }))}
                  format={(n) => mins(n)}
                />
              ) : (
                <UsageChart
                  title={`Estimated cost per day, last 14 days${testMode ? " (including test samples)" : ""}`}
                  value="Cost"
                  days={days.map((d) => ({ day: d.day, value: d.costUsd }))}
                  format={dollars}
                />
              )}
            </div>

            {!launch && (
              <>
                <div className="mt-6 border-t border-line pt-5">
                  <h3 className="text-[13px] font-semibold">
                    This month by service
                  </h3>
                  <table className="mt-2 w-full text-sm">
                    <tbody>
                      {(["claude", "deepgram", "elevenlabs"] as const).map(
                        (s) => (
                          <tr
                            key={s}
                            className="border-t border-line first:border-t-0"
                          >
                            <td className="py-2 text-muted">
                              {SERVICE_LABEL[s]}
                            </td>
                            <td className="num py-2 text-right text-muted">
                              {s === "claude"
                                ? `${monthT.claudeCalls} calls · ${Math.round((monthT.inputTokens + monthT.outputTokens) / 1000)}k tokens`
                                : s === "deepgram"
                                  ? mins(monthT.audioSeconds / 60)
                                  : `${monthT.voiceCharacters.toLocaleString("en-GB")} characters`}
                            </td>
                            <td className="num w-[90px] py-2 text-right font-semibold">
                              {dollars(monthT.byService[s])}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-5 border-t border-line pt-5">
                  <h3 className="text-[13px] font-semibold">
                    This month by feature
                  </h3>
                  {features.length ? (
                    <table className="mt-2 w-full text-sm">
                      <tbody>
                        {features.map((f) => (
                          <tr
                            key={f.feature}
                            className="border-t border-line first:border-t-0"
                          >
                            <td className="py-2 text-muted">
                              {FEATURE_LABEL[f.feature] ?? f.feature}
                            </td>
                            <td className="num py-2 text-right text-muted">
                              {f.calls} call{f.calls === 1 ? "" : "s"}
                            </td>
                            <td className="num w-[90px] py-2 text-right font-semibold">
                              {dollars(f.costUsd)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="mt-1.5 text-sm text-muted">
                      Nothing yet this month.
                    </p>
                  )}
                </div>
                <p className="mt-5 text-[12px] leading-normal text-muted">
                  Today: {dollars(todayT.costUsd)}. Estimates from public price
                  lists, not invoices; check each provider’s dashboard for what
                  you’re billed. Change the limits with HAKKIRI_DAILY_MINUTES,
                  HAKKIRI_DAILY_SPEND_USD and HAKKIRI_MONTHLY_SPEND_USD (0 turns
                  one off).
                </p>
              </>
            )}
          </Section>

          {!launch && (
            <Section
              id="problems"
              title="Problems and alerts"
              intro="Errors on the server or in a browser, grouped, newest first. The first of each kind sends an alert."
            >
              <p className="text-sm text-muted">
                {alerts.webhook || alerts.email
                  ? `Alerts go to your ${[alerts.webhook && "webhook", alerts.email && "email"].filter(Boolean).join(" and ")}.`
                  : "No alerts set up yet. Add ALERT_WEBHOOK_URL (Slack, Discord or Teams) or RESEND_API_KEY and ALERT_EMAIL_TO to .env.local."}
              </p>
              {(alerts.webhook || alerts.email) && (
                <div className="mt-3">
                  <TestAlert />
                </div>
              )}
              {problems.length ? (
                <ul className="mt-4 flex flex-col">
                  {problems.map((p) => (
                    <li
                      key={p.key}
                      className="border-t border-line py-2.5 text-sm first:border-t-0"
                    >
                      <div className="flex justify-between gap-3">
                        <span className="min-w-0 truncate font-semibold">
                          {p.where}
                        </span>
                        <span className="num shrink-0 text-[12px] text-muted">
                          {p.count > 1 ? `${p.count}× · ` : ""}
                          {p.last.slice(0, 16).replace("T", " ")}
                        </span>
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-[13px] text-muted">
                        {p.message}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted">
                  No problems in the last 30 days.
                </p>
              )}
            </Section>
          )}

          <Section id="account" title="Account">
            <AccountControls />
          </Section>
        </div>
      </div>
    </div>
  );
}
