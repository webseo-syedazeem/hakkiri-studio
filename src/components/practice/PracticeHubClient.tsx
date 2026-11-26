"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Icon, type IconName } from "@/components/ui";
import { AnsweringGuides } from "@/components/practice/AnsweringGuides";
import { QuestionPlaybooks } from "@/components/interview/QuestionPlaybooks";
import type { PracticeStats, PracticeType } from "@/lib/sessions/practice-stats";

export type PracticeQuestionType = PracticeType;

/** One of the person's interviews, with what the hub shows about it. All of it is worked out on the server. */
export interface HubInterview {
  id: string;
  role: string;
  company: string;
  companyInitial: string;
  /** A built-in example interview, not one the person set up. */
  isDemo: boolean;
  /** The interview's own next stage. Null when it has no stages. */
  stage: string | null;
  /** When the real interview is, from the date the person gave. */
  when: { text: string; rel: string | null };
  /** From the person's own finished sessions on this interview. */
  stats: PracticeStats;
  /** Their lowest-scoring category. Null until a session has been scored. */
  focus: { name: string; score: number } | null;
  /** The practice topics the app matches to this job. */
  topics: { id: string; title: string; focusLabel: string; subtitle: string; minutes: number; type: PracticeType }[];
}

export interface PracticeHubClientProps {
  interviews: HubInterview[];
  initialInterviewId?: string;
  initialType?: PracticeType;
  /** One of the person's own presentations, when they have added one. */
  presentation: { id: string; title: string } | null;
  claim?: string;
  question?: string;
  returnTo?: string;
}

const TYPES: { id: PracticeType; label: string; icon: IconName; color: string }[] = [
  { id: "strengths", label: "Strengths", icon: "star", color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30" },
  { id: "competency", label: "Competency", icon: "layers", color: "from-indigo-500/20 to-violet-500/20 text-indigo-300 border-indigo-500/30" },
  { id: "technical", label: "Technical", icon: "code", color: "from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30" },
  { id: "situational", label: "Situational", icon: "brain", color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "motivation", label: "Motivational", icon: "target", color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30" },
  { id: "experience", label: "Experience", icon: "cal", color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30" },
];
const typeOf = (id: PracticeType) => TYPES.find((t) => t.id === id) ?? TYPES[1];

export function PracticeHubClient({ interviews, initialInterviewId, initialType, presentation, claim, question, returnTo }: PracticeHubClientProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | undefined>(initialInterviewId ?? interviews[0]?.id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<PracticeType | null>(initialType ?? null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const current = interviews.find((i) => i.id === selectedId) ?? interviews[0];

  /** The choice is kept in the address, so a refresh, the back button or a shared tab opens the same interview. */
  const remember = (id: string | undefined, type: PracticeType | null) => {
    if (!id) return;
    const query = new URLSearchParams({ interview: id });
    if (type) query.set("type", type);
    router.replace(`/practice?${query.toString()}`, { scroll: false });
  };
  const chooseInterview = (id: string) => {
    setSelectedId(id);
    setIsDropdownOpen(false);
    remember(id, selectedType);
  };
  const chooseType = (type: PracticeType) => {
    const next = selectedType === type ? null : type;
    setSelectedType(next);
    remember(current?.id, next);
  };

  if (!current) {
    return (
      <div className="flex grow flex-col w-full pb-20 animate-rise text-white">
        <header className="border-b border-white/[0.08] pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">Practice Hub</h1>
          <p className="mt-1.5 text-sm text-[#a1a2b3] max-w-2xl leading-relaxed">Focused practice on the questions written for your interviews.</p>
        </header>
        <div className="mt-8 rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-8 text-center" data-testid="hub-empty">
          <p className="text-sm font-semibold text-white">You haven’t set up an interview yet</p>
          <p className="mt-1 text-xs text-muted">Practice is built from a job and your CV. Set up an interview and it will appear here.</p>
          <Link href="/interviews/new" className="mt-4 inline-flex rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white">
            Set up an interview
          </Link>
        </div>
      </div>
    );
  }

  const { stats, focus } = current;
  // The chosen kind of practice comes first; the rest keep the order the app matched them in.
  const cards = selectedType ? [...current.topics].sort((a, b) => Number(b.type === selectedType) - Number(a.type === selectedType)) : current.topics;
  const available = new Set(current.topics.map((t) => t.type));

  return (
    <div className="flex grow flex-col w-full pb-20 animate-rise text-white">
      {claim && (
        <div className="mb-6 rounded-2xl bg-[#1a1738] border border-indigo-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">Practising CV Claim</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">“{claim}”</p>
            {question && (
              <p className="mt-1 text-xs text-indigo-200/80">Anticipated question: {question}</p>
            )}
          </div>
          {returnTo && (
            <Link
              href={returnTo}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 text-xs font-medium text-white transition-all shrink-0 hover:-translate-y-0.5"
            >
              ← Return to CV
            </Link>
          )}
        </div>
      )}

      {/* 1. HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-soft uppercase tracking-wider mb-2">
            <Icon name="zap" size={15} />
            <span>Targeted Practice</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Practice Hub</h1>
          <p className="mt-1.5 text-sm text-[#a1a2b3] max-w-2xl leading-relaxed">Focused practice on the questions written for your interviews.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href={`/interviews/${current.id}/prep`} className="px-4 py-2.5 rounded-xl bg-[#141326] border border-white/10 hover:border-white/20 text-xs font-semibold text-white transition-all hover:-translate-y-0.5">
            {current.company} prep sheet
          </Link>
          <Link
            href={`/interviews/${current.id}`}
            className="pro-btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4f52f8] via-[#5c5ffc] to-[#6d5eff] text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:brightness-110 transition-all"
          >
            <Icon name="play" size={13} />
            <span>Start a full interview</span>
          </Link>
        </div>
      </header>

      {/* 2. FIGURES FROM THE PERSON'S OWN SESSIONS ON THIS INTERVIEW */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5" data-testid="hub-stats">
        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
            <Icon name="clock" size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium">Practice this week</div>
            <div className="mt-0.5 num text-2xl font-bold text-white tracking-tight">{stats.sessionsThisWeek === 0 ? "None yet" : `${stats.minutesThisWeek} min`}</div>
            <div className="text-[11px] text-muted mt-0.5">{stats.sessionsThisWeek === 0 ? "No sessions in the last 7 days" : `${stats.sessionsThisWeek} session${stats.sessionsThisWeek === 1 ? "" : "s"} in the last 7 days`}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
            <Icon name="target" size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium">Average score</div>
            <div className="mt-0.5 num text-2xl font-bold text-white tracking-tight">{stats.averageScore != null ? `${stats.averageScore.toFixed(1)} / 5` : "No scores yet"}</div>
            <div className="text-[11px] text-muted mt-0.5">
              {stats.averageScore == null
                ? "Appears after your first scored session"
                : `Across ${stats.scoredSessions} scored session${stats.scoredSessions === 1 ? "" : "s"}${stats.changeOnLastWeek != null && stats.changeOnLastWeek !== 0 ? `, ${stats.changeOnLastWeek > 0 ? "up" : "down"} ${Math.abs(stats.changeOnLastWeek).toFixed(1)} on last week` : ""}`}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/25">
            <Icon name="chart" size={22} />
          </div>
          <div>
            <div className="text-xs text-muted font-medium">Focus area</div>
            <div className="mt-0.5 text-base font-bold text-white tracking-tight">{focus ? focus.name : "Not known yet"}</div>
            <div className="text-[11px] text-muted mt-0.5">{focus ? `Your lowest category so far: ${focus.score.toFixed(1)} out of 5` : "Your lowest category shows here once an interview is scored"}</div>
          </div>
        </div>
      </div>

      {/* 3. CHOOSE THE INTERVIEW AND THE KIND OF PRACTICE */}
      <div className="mt-8 rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 shadow-2xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
                1
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">Which interview are you preparing for?</h2>
            </div>
            <p className="text-xs text-muted pl-8.5">Your choice is kept in this page’s address.</p>

            <div className="relative pt-1 pl-8.5">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#141326] border border-white/15 hover:border-indigo-500/50 text-left transition-all group"
                data-testid="hub-interview"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Icon name="cal" size={16} />
                  </div>
                  <div className="truncate text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                    {current.role} — {current.company}
                    {current.isDemo ? <span className="ml-1.5 text-xs font-medium text-muted">(example)</span> : null}
                  </div>
                </div>
                <Icon name="chevronDown" size={16} className={clsx("text-muted transition-transform duration-200 shrink-0", isDropdownOpen && "rotate-180")} />
              </button>

              {isDropdownOpen && (
                <div role="listbox" aria-label="Your interviews" className="absolute top-full left-8.5 right-0 mt-2 z-30 rounded-xl bg-[#121124] border border-white/15 shadow-2xl overflow-hidden py-1.5 animate-fade-in backdrop-blur-xl">
                  {interviews.map((iv) => {
                    const isSelected = iv.id === current.id;
                    return (
                      <button
                        key={iv.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => chooseInterview(iv.id)}
                        className={clsx("w-full flex items-center justify-between px-4 py-3 text-left transition-colors text-xs", isSelected ? "bg-indigo-600/20 text-white font-semibold" : "hover:bg-white/[0.06] text-[#c9cad4]")}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                            {iv.companyInitial}
                          </span>
                          <div className="truncate">
                            <span className="font-semibold text-white">{iv.role}</span>
                            <span className="text-muted ml-1.5">
                              ({iv.company}
                              {iv.isDemo ? ", example" : ""})
                            </span>
                          </div>
                        </div>
                        {isSelected && <Icon name="check" size={14} className="text-indigo-300 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-3" data-testid="hub-when">
                {current.stage ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#16152a] border border-white/10 px-3 py-1.5 text-xs font-medium text-[#d1d2dc]">
                    <Icon name="list" size={13} className="text-blue-300" />
                    <span>{current.stage}</span>
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#16152a] border border-white/10 px-3 py-1.5 text-xs font-medium text-[#d1d2dc]">
                  <Icon name="cal" size={13} className="text-indigo-300" />
                  <span>
                    {current.when.text}
                    {current.when.rel && current.when.rel !== "done" ? ` (${current.when.rel})` : ""}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2.5">
              <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7c3aed] text-xs font-bold text-white shadow-sm">
                2
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">What would you like to practise?</h2>
            </div>
            <p className="text-xs text-muted pl-8.5">Pick a kind of question to bring its practice to the top.</p>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5 pt-1 pl-0 sm:pl-8.5">
              {TYPES.map((t) => {
                const isActive = selectedType === t.id;
                const has = available.has(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={isActive}
                    disabled={!has}
                    title={has ? undefined : "No practice of this kind is matched to this job"}
                    onClick={() => chooseType(t.id)}
                    className={clsx(
                      "relative flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl border transition-all min-h-[78px] group",
                      !has
                        ? "bg-[#141326] border-white/5 text-[#6f7186] cursor-not-allowed"
                        : isActive
                          ? "bg-gradient-to-b from-[#241e4b] to-[#1c173d] border-2 border-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] ring-1 ring-[#7c3aed]/50 cursor-pointer"
                          : "bg-[#141326] border-white/10 text-[#a5a7b8] hover:border-white/20 hover:text-white cursor-pointer",
                    )}
                  >
                    <Icon name={t.icon} size={22} className="shrink-0" />
                    <span className="text-xs font-semibold mt-1.5 tracking-tight truncate w-full text-center">{t.label}</span>
                    {isActive && (
                      <span aria-hidden className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-md ring-2 ring-[#0d0c1c]">
                        <Icon name="check" size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted font-medium" id="hub-difficulty">
              Difficulty:
            </span>
            <div role="group" aria-labelledby="hub-difficulty" className="flex items-center rounded-lg bg-[#141326] border border-white/10 p-0.5">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button key={d} type="button" aria-pressed={difficulty === d} onClick={() => setDifficulty(d)} className={clsx("px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all", difficulty === d ? "bg-indigo-600 text-white shadow-sm" : "text-[#a9abc0] hover:text-white")}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-indigo-200 bg-indigo-500/10 border border-indigo-500/25 px-3 py-1.5 rounded-lg">
            <Icon name="sparkle" size={14} />
            <span>
              Practice mode: <b>one question at a time</b>, scored after you answer
            </span>
          </div>
        </div>
      </div>

      {/* 4. THE PRACTICE MATCHED TO THIS JOB */}
      <div className="mt-10">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Focused practice for this interview</h2>
          <p className="text-xs text-muted">
            Practice topics matched to {current.role} at {current.company} from its title and job description.
          </p>
        </div>

        {cards.length === 0 ? (
          <p className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 text-xs text-muted">No practice topics are matched to this job.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="hub-cards">
            {cards.map((card) => {
              const kind = typeOf(card.type);
              const highlighted = card.type === selectedType;
              const href = `/mock/${current.id}?practice=1&topic=${encodeURIComponent(card.id)}&type=${card.type}&difficulty=${difficulty}&duration=1-question`;
              return (
                <div
                  key={card.id}
                  className={clsx(
                    "rounded-2xl border p-6 shadow-xl flex flex-col justify-between transition-all group relative",
                    highlighted ? "border-[#7c3aed] bg-gradient-to-b from-[#1c163d] to-[#120f26] ring-2 ring-[#7c3aed]/50 shadow-[0_0_25px_rgba(124,58,237,0.35)]" : "bg-[#0d0c1c] border-white/[0.08] hover:border-white/20",
                  )}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br", kind.color)}>
                          <Icon name={kind.icon} size={18} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">{card.title}</h3>
                          <div className="text-xs text-muted">
                            {kind.label} · {card.focusLabel}
                          </div>
                        </div>
                      </div>
                      {highlighted ? <span className="rounded-full bg-[#7c3aed]/25 border border-[#7c3aed]/50 px-2.5 py-0.5 text-[10px] font-bold text-purple-200 uppercase tracking-wider">Selected</span> : null}
                    </div>
                    <p className="text-xs text-[#a5a7b8] leading-relaxed mt-2 mb-4">{card.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Icon name="clock" size={13} /> {card.minutes} min
                      </span>
                      <span aria-hidden>·</span>
                      <span className="capitalize">{difficulty}</span>
                      <span aria-hidden>·</span>
                      <span className="text-indigo-200">1 question</span>
                    </div>
                    <Link
                      href={href}
                      aria-label={`Start practice: ${card.title}`}
                      className={clsx(
                        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all",
                        highlighted ? "bg-gradient-to-r from-[#6366f1] to-[#7c3aed] hover:from-[#7073ff] hover:to-[#8b4bf0] shadow-md shadow-indigo-500/30" : "pro-btn-glow bg-[#141326] border border-white/10 hover:border-indigo-500/50 hover:bg-[#1a1932]",
                      )}
                    >
                      <span>Start practice</span>
                      <Icon name="chevronRight" size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. PRESENTATIONS: THE PERSON'S OWN, WHEN THEY HAVE ONE */}
      <div className="mt-10" data-testid="hub-presentation">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Presentation rehearsals</h2>
            <p className="text-xs text-muted">{presentation ? `Rehearse “${presentation.title}”.` : "Rehearse a presentation’s opening, a slide or the questions after it."}</p>
          </div>
          {presentation ? (
            <Link href={`/presentations/${presentation.id}`} className="text-xs font-semibold text-blue-soft hover:underline">
              Open the presentation →
            </Link>
          ) : null}
        </div>

        {presentation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(
              [
                { icon: "present", tone: "bg-purple-500/15 text-purple-300", title: "Rehearse it", text: "Run through your presentation and get feedback on each part.", href: `/rehearse/${presentation.id}`, action: "Start rehearsal" },
                { icon: "chat", tone: "bg-emerald-500/15 text-emerald-300", title: "Practise the Q&A", text: "Answer the questions an audience is likely to ask afterwards.", href: `/qa/${presentation.id}`, action: "Start Q&A" },
              ] as const
            ).map((c) => (
              <div key={c.title} className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={clsx("flex h-8 w-8 items-center justify-center rounded-lg", c.tone)}>
                      <Icon name={c.icon} size={15} />
                    </div>
                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mt-1 mb-4">{c.text}</p>
                </div>
                <div className="flex justify-end pt-3 border-t border-white/[0.06]">
                  <Link href={c.href} className="px-3.5 py-1.5 rounded-lg bg-[#141326] border border-white/10 hover:border-white/25 text-xs font-semibold text-white">
                    {c.action}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#0d0c1c] border border-white/[0.08] p-6 text-xs text-muted">
            <p>You haven’t added a presentation yet.</p>
            <Link href="/presentations" className="mt-2 inline-block font-semibold text-blue-soft hover:underline">
              Add a presentation →
            </Link>
          </div>
        )}
      </div>

      <div id="hub-playbooks" className="mt-12 pt-8 border-t border-white/[0.08]" data-testid="hub-answering-guides">
        <AnsweringGuides />
      </div>
    </div>
  );
}
