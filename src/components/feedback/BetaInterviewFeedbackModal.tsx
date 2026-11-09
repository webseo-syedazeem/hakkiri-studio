"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Button, Icon } from "@/components/ui";

interface BetaInterviewFeedbackModalProps {
  interviewId?: string;
  mockId?: string;
  company?: string;
  role?: string;
  autoPrompt?: boolean;
  isEligible?: boolean;
  ineligibleReason?: "ended-early" | "not-full-interview";
}

const Q1_OPTIONS = [
  "Very realistic",
  "Mostly realistic",
  "A little robotic",
  "The interview felt too rushed",
];

const Q2_OPTIONS = [
  "Highly relevant and tailored",
  "Mostly relevant",
  "Too generic",
  "Missed important skills or topics",
];

const Q3_OPTIONS = [
  "Fair, accurate and constructive",
  "Too critical",
  "Too generous",
  "Some scores or feedback felt inaccurate",
];

const Q4_OPTIONS = [
  "Everything worked smoothly",
  "Audio lag or interruptions",
  "Feedback took too long to generate",
  "Some features were confusing to use",
];

const Q7_OPTIONS = [
  "Definitely!",
  "Maybe, with a few improvements",
  "Not yet",
];

export function BetaInterviewFeedbackModal({
  interviewId = "",
  mockId = "",
  company = "",
  role = "",
  autoPrompt = true,
  isEligible = true,
  ineligibleReason = "not-full-interview",
}: BetaInterviewFeedbackModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState("");
  const [q1Choice, setQ1Choice] = useState("");
  const [q1More, setQ1More] = useState("");

  const [q2Choice, setQ2Choice] = useState("");
  const [q2More, setQ2More] = useState("");

  const [q3Choice, setQ3Choice] = useState("");
  const [q3More, setQ3More] = useState("");

  const [q4Choices, setQ4Choices] = useState<string[]>([]);
  const [q4More, setQ4More] = useState("");

  const [q5LikesDislikes, setQ5LikesDislikes] = useState("");
  const [q6Changes, setQ6Changes] = useState("");

  const [q7Choice, setQ7Choice] = useState("");
  const [q7More, setQ7More] = useState("");

  const draftKey = `hk_beta_survey_draft_v2_${mockId || interviewId || "default"}`;
  const submittedKey = `hk_beta_survey_done_${mockId || interviewId || "default"}`;
  const dismissedKey = `hk_beta_survey_dismissed_${mockId || interviewId || "default"}`;

  useEffect(() => {
    setMounted(true);

    if (!isEligible) return;

    try {
      if (localStorage.getItem(submittedKey)) {
        setSubmitted(true);
        return;
      }

      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const p = JSON.parse(saved);
        if (p.email) setEmail(p.email);
        if (p.q1Choice) setQ1Choice(p.q1Choice);
        if (p.q1More) setQ1More(p.q1More);
        if (p.q2Choice) setQ2Choice(p.q2Choice);
        if (p.q2More) setQ2More(p.q2More);
        if (p.q3Choice) setQ3Choice(p.q3Choice);
        if (p.q3More) setQ3More(p.q3More);
        if (Array.isArray(p.q4Choices)) setQ4Choices(p.q4Choices);
        if (p.q4More) setQ4More(p.q4More);
        if (p.q5LikesDislikes) setQ5LikesDislikes(p.q5LikesDislikes);
        if (p.q6Changes) setQ6Changes(p.q6Changes);
        if (p.q7Choice) setQ7Choice(p.q7Choice);
        if (p.q7More) setQ7More(p.q7More);
      }

      const dismissed = sessionStorage.getItem(dismissedKey);
      if (autoPrompt && !dismissed) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [autoPrompt, isEligible, draftKey, submittedKey, dismissedKey]);

  // Persist draft on changes
  useEffect(() => {
    if (!mounted || submitted || !isEligible) return;
    try {
      const data = {
        email,
        q1Choice,
        q1More,
        q2Choice,
        q2More,
        q3Choice,
        q3More,
        q4Choices,
        q4More,
        q5LikesDislikes,
        q6Changes,
        q7Choice,
        q7More,
      };
      localStorage.setItem(draftKey, JSON.stringify(data));
    } catch {}
  }, [
    email,
    q1Choice,
    q1More,
    q2Choice,
    q2More,
    q3Choice,
    q3More,
    q4Choices,
    q4More,
    q5LikesDislikes,
    q6Changes,
    q7Choice,
    q7More,
    mounted,
    draftKey,
    submitted,
    isEligible,
  ]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(dismissedKey, "1");
    } catch {}
  };

  const toggleQ4Choice = (choice: string) => {
    setQ4Choices((prev) => {
      if (choice === "Everything worked smoothly") {
        return prev.includes(choice) ? [] : [choice];
      }
      const filtered = prev.filter((c) => c !== "Everything worked smoothly");
      return filtered.includes(choice)
        ? filtered.filter((c) => c !== choice)
        : [...filtered, choice];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isEligible) {
      setErrorMessage("The £15 voucher survey can only be submitted after completing a full mock interview.");
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address so we can send your £15 Amazon voucher.");
      return;
    }

    if (!q1Choice) {
      setErrorMessage("Please select an answer for Question 1 (How realistic did your mock interview feel?).");
      return;
    }
    if (!q2Choice) {
      setErrorMessage("Please select an answer for Question 2 (How relevant were the questions?).");
      return;
    }
    if (!q3Choice) {
      setErrorMessage("Please select an answer for Question 3 (How accurate and helpful were scores?).");
      return;
    }
    if (!q4Choices.length) {
      setErrorMessage("Please select at least one option for Question 4 (Technical issues or difficulties).");
      return;
    }
    if (!q7Choice) {
      setErrorMessage("Please select an answer for Question 7 (Would you recommend Hakkiri?).");
      return;
    }

    const q1Full = q1Choice + (q1More.trim() ? ` — ${q1More.trim()}` : "");
    const q2Full = q2Choice + (q2More.trim() ? ` — ${q2More.trim()}` : "");
    const q3Full = q3Choice + (q3More.trim() ? ` — ${q3More.trim()}` : "");
    const q4Full = q4Choices.join(", ") + (q4More.trim() ? ` — ${q4More.trim()}` : "");
    const q7Full = q7Choice + (q7More.trim() ? ` — ${q7More.trim()}` : "");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback/survey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          interviewId,
          mockId,
          q1_realism: q1Full,
          q2_questions: q2Full,
          q3_feedback: q3Full,
          q4_issues: q4Full,
          q5_likes_dislikes: q5LikesDislikes.trim(),
          q6_changes: q6Changes.trim(),
          q7_recommend: q7Full,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Failed to submit survey");
      }

      setSubmitted(true);
      try {
        localStorage.setItem(submittedKey, "1");
        localStorage.removeItem(draftKey);
      } catch {}
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong sending your survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Top Banner on the Interview Report Page */}
      {!isEligible ? (
        <div className="mb-6 overflow-hidden rounded-[16px] border border-line bg-panel-2/60 p-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-muted border border-white/10">
              <Icon name="lock" size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[10px] font-semibold text-muted border border-white/10">
                  £15 Amazon Voucher
                </span>
                <span className="text-xs font-semibold text-ink">
                  Full Interview Required
                </span>
              </div>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                {ineligibleReason === "ended-early"
                  ? "This session ended before all planned questions were finished. The £15 Amazon voucher survey is only unlocked after completing a full, uninterrupted mock interview."
                  : "Complete a full mock interview without skipping rounds to qualify for the £15 Amazon voucher survey."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 overflow-hidden rounded-[16px] border border-[#f59e0b]/40 bg-gradient-to-r from-[#241a0b] via-[#1c1a24] to-[#171926] p-4.5 shadow-[0_8px_30px_rgba(245,158,11,0.12)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f59e0b]/20 text-[#fbbf24] shadow-[0_0_15px_rgba(245,158,11,0.35)]">
                <span className="text-xl">🎁</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#f59e0b]/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#fbbf24] border border-[#f59e0b]/40">
                    Beta Reward
                  </span>
                  <span className="text-sm font-bold text-white">
                    {submitted ? "Survey Submitted · £15 Voucher Claimed" : "Get a £15 Amazon voucher for your feedback"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {submitted
                    ? `Thanks for your help! We're processing your £15 voucher to ${email || "your email"}.`
                    : "Completed your full interview? Take 3–5 minutes to fill out our beta survey and we'll email you a £15 Amazon voucher."}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
              {submitted ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                  <Icon name="check" size={13} strokeWidth={3} />
                  Voucher claimed
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsOpen(true)}
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-4 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <span>Take survey · £15 voucher</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Popup Survey Modal */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-fade-in"
            onClick={handleDismiss}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="survey-title"
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col w-full max-w-[720px] max-h-[92vh] rounded-[22px] border border-line bg-[#131622] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(245,158,11,0.2)] animate-scale-in overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative border-b border-line bg-gradient-to-b from-[#221c13] via-[#1a1b27] to-[#131622] p-5 sm:p-6">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close survey"
                >
                  <Icon name="x" size={16} />
                </button>

                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f59e0b]/20 text-base shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                    🎁
                  </span>
                  <span className="rounded-full bg-[#f59e0b]/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#fbbf24] border border-[#f59e0b]/40">
                    £15 Amazon Voucher
                  </span>
                  <span className="text-[11px] text-muted font-medium">Estimated time: 3–5 minutes</span>
                </div>

                <h2 id="survey-title" className="mt-2.5 text-xl font-bold text-white tracking-tight sm:text-2xl">
                  {submitted ? "Survey Complete! 🎉" : "Help us make Hakkiri better"}
                </h2>
                <p className="mt-1 text-xs text-muted sm:text-sm leading-relaxed">
                  {submitted
                    ? "Thank you for helping us polish Hakkiri during the beta."
                    : "Thank you for testing Hakkiri! We'd love to hear about your experience. Your feedback will help us make Hakkiri more realistic, useful and enjoyable."}
                </p>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6 space-y-6">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center animate-rise">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-3xl border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                      ✓
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-white">We’ve received your feedback!</h3>
                    <p className="mt-2 max-w-[460px] text-sm text-muted leading-relaxed">
                      Your responses are saved. We will review your submission and email your{" "}
                      <b className="text-white">£15 Amazon voucher</b> code to{" "}
                      <span className="font-semibold text-blue-soft">{email}</span> within 24–48 hours.
                    </p>
                    <p className="mt-3 text-xs text-muted">
                      Thank you for helping us shape the future of Hakkiri!
                    </p>
                    <div className="mt-6 flex gap-3">
                      <Button variant="primary" onClick={() => setIsOpen(false)} className="px-6">
                        Back to interview report
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {errorMessage && (
                      <div className="rounded-xl border border-red-soft/40 bg-red-soft/10 p-3.5 text-xs text-red-soft flex items-start gap-2.5">
                        <Icon name="x" size={15} className="mt-0.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Question 1 */}
                    <div className="space-y-3 rounded-xl bg-panel-2 p-4 sm:p-5 border border-line">
                      <div>
                        <span className="block text-xs font-bold text-white sm:text-sm">
                          1. How realistic did your mock interview feel?
                        </span>
                        <span className="text-[11px] text-muted">Select one answer.</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Q1_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQ1Choice(opt)}
                            className={clsx(
                              "rounded-lg p-2.5 text-left text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
                              q1Choice === opt
                                ? "border-blue-fill bg-blue-fill/15 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                                : "border-line bg-panel text-muted hover:border-line-strong hover:text-ink"
                            )}
                          >
                            <span
                              className={clsx(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                                q1Choice === opt
                                  ? "border-blue-fill bg-blue-fill text-white"
                                  : "border-line bg-transparent"
                              )}
                            >
                              {q1Choice === opt && "•"}
                            </span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                      <div className="pt-1">
                        <label className="block text-[11px] font-medium text-muted mb-1">
                          Tell us more (optional): What made the interview feel realistic or unrealistic?
                        </label>
                        <textarea
                          rows={2}
                          value={q1More}
                          onChange={(e) => setQ1More(e.target.value)}
                          placeholder="What made the interview feel realistic or unrealistic?"
                          className="w-full rounded-lg bg-[#0e111a] p-2.5 text-xs text-white border border-line focus:border-blue-fill focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Question 2 */}
                    <div className="space-y-3 rounded-xl bg-panel-2 p-4 sm:p-5 border border-line">
                      <div>
                        <span className="block text-xs font-bold text-white sm:text-sm">
                          2. How relevant were the questions and follow-ups to your role?
                        </span>
                        <span className="text-[11px] text-muted">Select one answer.</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Q2_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQ2Choice(opt)}
                            className={clsx(
                              "rounded-lg p-2.5 text-left text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
                              q2Choice === opt
                                ? "border-blue-fill bg-blue-fill/15 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                                : "border-line bg-panel text-muted hover:border-line-strong hover:text-ink"
                            )}
                          >
                            <span
                              className={clsx(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                                q2Choice === opt
                                  ? "border-blue-fill bg-blue-fill text-white"
                                  : "border-line bg-transparent"
                              )}
                            >
                              {q2Choice === opt && "•"}
                            </span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                      <div className="pt-1">
                        <label className="block text-[11px] font-medium text-muted mb-1">
                          Tell us more (optional): Were there any questions or topics you expected but didn&apos;t receive?
                        </label>
                        <textarea
                          rows={2}
                          value={q2More}
                          onChange={(e) => setQ2More(e.target.value)}
                          placeholder="Were there any questions or topics you expected but didn't receive?"
                          className="w-full rounded-lg bg-[#0e111a] p-2.5 text-xs text-white border border-line focus:border-blue-fill focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Question 3 */}
                    <div className="space-y-3 rounded-xl bg-panel-2 p-4 sm:p-5 border border-line">
                      <div>
                        <span className="block text-xs font-bold text-white sm:text-sm">
                          3. How accurate and helpful did you find your scores and feedback?
                        </span>
                        <span className="text-[11px] text-muted">Select one answer.</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Q3_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQ3Choice(opt)}
                            className={clsx(
                              "rounded-lg p-2.5 text-left text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
                              q3Choice === opt
                                ? "border-blue-fill bg-blue-fill/15 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                                : "border-line bg-panel text-muted hover:border-line-strong hover:text-ink"
                            )}
                          >
                            <span
                              className={clsx(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                                q3Choice === opt
                                  ? "border-blue-fill bg-blue-fill text-white"
                                  : "border-line bg-transparent"
                              )}
                            >
                              {q3Choice === opt && "•"}
                            </span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                      <div className="pt-1">
                        <label className="block text-[11px] font-medium text-muted mb-1">
                          Tell us more (optional): Was there a particular score or piece of feedback you agreed or disagreed with?
                        </label>
                        <textarea
                          rows={2}
                          value={q3More}
                          onChange={(e) => setQ3More(e.target.value)}
                          placeholder="Was there a particular score or piece of feedback you agreed or disagreed with?"
                          className="w-full rounded-lg bg-[#0e111a] p-2.5 text-xs text-white border border-line focus:border-blue-fill focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Question 4 (ALLOW MULTIPLE SELECTIONS) */}
                    <div className="space-y-3 rounded-xl bg-panel-2 p-4 sm:p-5 border border-line">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="block text-xs font-bold text-white sm:text-sm">
                            4. Did you experience any technical issues or difficulties?
                          </span>
                          <span className="rounded bg-lilac/20 px-1.5 py-0.5 text-[10px] font-semibold text-lilac">
                            Multiple selections allowed
                          </span>
                        </div>
                        <span className="text-[11px] text-muted">Select all that apply.</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Q4_OPTIONS.map((opt) => {
                          const isSelected = q4Choices.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleQ4Choice(opt)}
                              className={clsx(
                                "rounded-lg p-2.5 text-left text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
                                isSelected
                                  ? "border-blue-fill bg-blue-fill/15 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                                  : "border-line bg-panel text-muted hover:border-line-strong hover:text-ink"
                              )}
                            >
                              <span
                                className={clsx(
                                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[11px]",
                                  isSelected
                                    ? "border-blue-fill bg-blue-fill text-white font-bold"
                                    : "border-line bg-transparent"
                                )}
                              >
                                {isSelected && "✓"}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="pt-1">
                        <label className="block text-[11px] font-medium text-muted mb-1">
                          Tell us more (optional): What happened, and how could we improve the experience?
                        </label>
                        <textarea
                          rows={2}
                          value={q4More}
                          onChange={(e) => setQ4More(e.target.value)}
                          placeholder="What happened, and how could we improve the experience?"
                          className="w-full rounded-lg bg-[#0e111a] p-2.5 text-xs text-white border border-line focus:border-blue-fill focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Question 5 (Optional) */}
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 sm:p-5 border border-line">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        5. What did you like most and least about Hakkiri? <span className="text-muted font-normal">(Optional)</span>
                      </label>
                      <p className="text-[11px] text-muted">
                        Tell us what worked particularly well and what you think could be better.
                      </p>
                      <textarea
                        rows={3}
                        value={q5LikesDislikes}
                        onChange={(e) => setQ5LikesDislikes(e.target.value)}
                        placeholder="Tell us what worked particularly well and what you think could be better..."
                        className="w-full rounded-lg bg-[#0e111a] p-2.5 text-xs text-white border border-line focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Question 6 (Optional) */}
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 sm:p-5 border border-line">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        6. If you could change or add one thing to Hakkiri, what would it be? <span className="text-muted font-normal">(Optional)</span>
                      </label>
                      <p className="text-[11px] text-muted">
                        We&apos;re open to any ideas, big or small!
                      </p>
                      <textarea
                        rows={2}
                        value={q6Changes}
                        onChange={(e) => setQ6Changes(e.target.value)}
                        placeholder="We're open to any ideas, big or small..."
                        className="w-full rounded-lg bg-[#0e111a] p-2.5 text-xs text-white border border-line focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Question 7 */}
                    <div className="space-y-3 rounded-xl bg-panel-2 p-4 sm:p-5 border border-line">
                      <div>
                        <span className="block text-xs font-bold text-white sm:text-sm">
                          7. Would you recommend Hakkiri to a friend or colleague?
                        </span>
                        <span className="text-[11px] text-muted">Select one answer.</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {Q7_OPTIONS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setQ7Choice(opt)}
                            className={clsx(
                              "rounded-lg p-2.5 text-left text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
                              q7Choice === opt
                                ? "border-blue-fill bg-blue-fill/15 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                                : "border-line bg-panel text-muted hover:border-line-strong hover:text-ink"
                            )}
                          >
                            <span
                              className={clsx(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                                q7Choice === opt
                                  ? "border-blue-fill bg-blue-fill text-white"
                                  : "border-line bg-transparent"
                              )}
                            >
                              {q7Choice === opt && "•"}
                            </span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                      <div className="pt-1">
                        <label className="block text-[11px] font-medium text-muted mb-1">
                          What influenced your answer? (Optional)
                        </label>
                        <textarea
                          rows={2}
                          value={q7More}
                          onChange={(e) => setQ7More(e.target.value)}
                          placeholder="What influenced your answer? (Optional)"
                          className="w-full rounded-lg bg-[#0e111a] p-2.5 text-xs text-white border border-line focus:border-blue-fill focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Voucher Claim Section */}
                    <div className="rounded-xl border border-[#f59e0b]/40 bg-gradient-to-r from-[#241a0b] via-[#1c1822] to-[#171a25] p-5 shadow-[0_0_25px_rgba(245,158,11,0.15)] space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎁</span>
                        <h4 className="text-sm font-bold text-white">Your £15 Amazon voucher</h4>
                      </div>
                      <p className="text-xs text-muted">
                        Where should we send your £15 Amazon voucher?
                      </p>
                      <div>
                        <label htmlFor="voucher-email-input" className="block text-xs font-semibold text-ink mb-1.5">
                          Email address:
                        </label>
                        <input
                          id="voucher-email-input"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-xl bg-[#0e111a] px-3.5 py-2.5 text-sm text-white border border-line focus:border-[#f59e0b] focus:outline-none transition-colors"
                        />
                        <p className="mt-1 text-[11px] text-muted">
                          We&apos;ll only use this email address to send your voucher.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? "Submitting feedback..." : "Submit feedback"}
                      </button>
                      <p className="text-center text-[11px] text-dim">
                        Thank you for helping us shape the future of Hakkiri!
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
