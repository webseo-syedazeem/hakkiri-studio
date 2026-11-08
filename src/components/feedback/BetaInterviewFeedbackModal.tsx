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
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [q4, setQ4] = useState("");
  const [q5, setQ5] = useState("");
  const [q6, setQ6] = useState("");
  const [q7, setQ7] = useState("");

  const draftKey = `hk_beta_survey_draft_${mockId || interviewId || "default"}`;
  const submittedKey = `hk_beta_survey_done_${mockId || interviewId || "default"}`;
  const dismissedKey = `hk_beta_survey_dismissed_${mockId || interviewId || "default"}`;

  useEffect(() => {
    setMounted(true);

    // If not a full interview, do not prompt
    if (!isEligible) return;

    // Check if already completed
    try {
      if (localStorage.getItem(submittedKey)) {
        setSubmitted(true);
        return;
      }

      // Restore saved draft
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.q1) setQ1(parsed.q1);
        if (parsed.q2) setQ2(parsed.q2);
        if (parsed.q3) setQ3(parsed.q3);
        if (parsed.q4) setQ4(parsed.q4);
        if (parsed.q5) setQ5(parsed.q5);
        if (parsed.q6) setQ6(parsed.q6);
        if (parsed.q7) setQ7(parsed.q7);
      }

      // Auto-prompt after full interview report loads if not dismissed
      const dismissed = sessionStorage.getItem(dismissedKey);
      if (autoPrompt && !dismissed) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [autoPrompt, isEligible, draftKey, submittedKey, dismissedKey]);

  // Persist draft on change
  useEffect(() => {
    if (!mounted || submitted || !isEligible) return;
    try {
      const data = { email, q1, q2, q3, q4, q5, q6, q7 };
      localStorage.setItem(draftKey, JSON.stringify(data));
    } catch {}
  }, [email, q1, q2, q3, q4, q5, q6, q7, mounted, draftKey, submitted, isEligible]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(dismissedKey, "1");
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isEligible) {
      setErrorMessage("The £15 voucher survey can only be submitted after completing a full mock interview.");
      return;
    }

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address so we can send your £15 Amazon voucher.");
      return;
    }

    if (!q1.trim() || !q2.trim() || !q3.trim() || !q4.trim() || !q5.trim() || !q6.trim() || !q7.trim()) {
      setErrorMessage("Please share a quick response for all 7 questions to qualify for the £15 voucher.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback/survey", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          interviewId,
          mockId,
          q1_realism: q1,
          q2_questions: q2,
          q3_feedback: q3,
          q4_issues: q4,
          q5_likes_dislikes: q5,
          q6_changes: q6,
          q7_recommend: q7,
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

  const appendTag = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, tag: string) => {
    if (!current) {
      setter(tag + " — ");
    } else if (!current.includes(tag)) {
      setter(`${tag}. ${current}`);
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
                    : "Completed your full interview? Take 2 minutes to fill out our beta survey and we'll email you a £15 Amazon voucher."}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md animate-fade-in"
            onClick={handleDismiss}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="survey-title"
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col w-full max-w-[680px] max-h-[92vh] rounded-[20px] border border-line bg-[#151824] shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(245,158,11,0.2)] animate-scale-in overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative border-b border-line bg-gradient-to-b from-[#211a12] via-[#1a1b26] to-[#151824] p-5 sm:p-6">
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
                  <span className="text-[11px] text-muted font-medium">Hakkiri Beta Survey</span>
                </div>

                <h2 id="survey-title" className="mt-2 text-xl font-bold text-white tracking-tight sm:text-2xl">
                  {submitted ? "Survey Complete! 🎉" : "How was your mock interview?"}
                </h2>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {submitted
                    ? "Thank you for helping us polish Hakkiri during the beta."
                    : "Fill out the 7 quick questions below and we'll email you a £15 Amazon voucher to say thank you."}
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
                    <p className="mt-2 max-w-[440px] text-sm text-muted leading-relaxed">
                      Your responses are saved. We will review your submission and email your{" "}
                      <b className="text-white">£15 Amazon voucher</b> code to{" "}
                      <span className="font-semibold text-blue-soft">{email}</span> within 24–48 hours.
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
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 border border-line/80">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        1. Did the mock interview feel like a real one? What made it feel real or not?
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Very realistic", "Somewhat realistic", "A bit robotic", "Too fast"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => appendTag(setQ1, q1, tag)}
                            className="rounded-lg bg-panel px-2.5 py-1 text-[11px] text-muted hover:text-white hover:bg-white/10 border border-line transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={q1}
                        onChange={(e) => setQ1(e.target.value)}
                        placeholder="Tell us what felt natural (e.g. interviewer questions, follow-ups) or what felt artificial..."
                        className="w-full rounded-lg bg-[#141620] p-2.5 text-xs text-white border border-line/80 focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Question 2 */}
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 border border-line/80">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        2. Were the questions and follow-ups right for the job?
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Spot on for the role", "Mostly relevant", "Too generic", "Missed core skills"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => appendTag(setQ2, q2, tag)}
                            className="rounded-lg bg-panel px-2.5 py-1 text-[11px] text-muted hover:text-white hover:bg-white/10 border border-line transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={q2}
                        onChange={(e) => setQ2(e.target.value)}
                        placeholder="Did the questions match your seniority and industry? Did follow-ups dig into the right details?"
                        className="w-full rounded-lg bg-[#141620] p-2.5 text-xs text-white border border-line/80 focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Question 3 */}
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 border border-line/80">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        3. Did the scores and feedback feel fair and useful? Any that were wrong?
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Fair & constructive", "Felt too harsh", "Felt too generous", "One score was wrong"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => appendTag(setQ3, q3, tag)}
                            className="rounded-lg bg-panel px-2.5 py-1 text-[11px] text-muted hover:text-white hover:bg-white/10 border border-line transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={q3}
                        onChange={(e) => setQ3(e.target.value)}
                        placeholder="Which feedback tip was most useful? Were any numbers or ratings off base?"
                        className="w-full rounded-lg bg-[#141620] p-2.5 text-xs text-white border border-line/80 focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Question 4 */}
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 border border-line/80">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        4. Was anything confusing, slow or broken?
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Ran smoothly", "Audio lag", "Scoring took too long", "UI confusing"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => appendTag(setQ4, q4, tag)}
                            className="rounded-lg bg-panel px-2.5 py-1 text-[11px] text-muted hover:text-white hover:bg-white/10 border border-line transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={q4}
                        onChange={(e) => setQ4(e.target.value)}
                        placeholder="Any bugs, lag in speech recognition, or confusing screens? (Write 'None' if all good)"
                        className="w-full rounded-lg bg-[#141620] p-2.5 text-xs text-white border border-line/80 focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Question 5 */}
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 border border-line/80">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        5. What did you like most, and what did you like least?
                      </label>
                      <textarea
                        rows={2}
                        value={q5}
                        onChange={(e) => setQ5(e.target.value)}
                        placeholder="Liked most: ... / Liked least: ..."
                        className="w-full rounded-lg bg-[#141620] p-2.5 text-xs text-white border border-line/80 focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Question 6 */}
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 border border-line/80">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        6. What's one thing you'd change or add?
                      </label>
                      <textarea
                        rows={2}
                        value={q6}
                        onChange={(e) => setQ6(e.target.value)}
                        placeholder="A feature you wish existed, or something you would adjust..."
                        className="w-full rounded-lg bg-[#141620] p-2.5 text-xs text-white border border-line/80 focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Question 7 */}
                    <div className="space-y-2 rounded-xl bg-panel-2 p-4 border border-line/80">
                      <label className="block text-xs font-bold text-white sm:text-sm">
                        7. Would you recommend Hakkiri to a friend? Why or why not?
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {["Definitely yes ⭐", "Maybe / Needs polish", "Not yet"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => appendTag(setQ7, q7, tag)}
                            className="rounded-lg bg-panel px-2.5 py-1 text-[11px] text-muted hover:text-white hover:bg-white/10 border border-line transition-colors cursor-pointer"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={q7}
                        onChange={(e) => setQ7(e.target.value)}
                        placeholder="Why or why not? What would make it an essential tool for your interview prep?"
                        className="w-full rounded-lg bg-[#141620] p-2.5 text-xs text-white border border-line/80 focus:border-blue-fill focus:outline-none transition-colors"
                      />
                    </div>

                    {/* £15 Voucher Email Input Card */}
                    <div className="rounded-xl border border-[#f59e0b]/50 bg-gradient-to-r from-[#231b0c] to-[#181926] p-4.5 space-y-2 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✉️</span>
                        <label htmlFor="voucher-email" className="text-xs font-bold text-[#fbbf24] uppercase tracking-wider">
                          Where should we email your £15 Amazon voucher?
                        </label>
                      </div>
                      <input
                        id="voucher-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full rounded-lg bg-[#141620] p-3 text-sm text-white placeholder-muted/60 border border-line focus:border-[#f59e0b] focus:outline-none transition-colors shadow-inner"
                      />
                      <p className="text-[11px] text-muted">
                        We will only use this address to send your voucher code. We do not sell data or send spam.
                      </p>
                    </div>

                    {/* Submit Actions */}
                    <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-line bg-[#151824]/95 px-5 py-4 backdrop-blur-md flex items-center justify-between gap-3 sm:-mx-7 sm:-mb-6 sm:px-7">
                      <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-xs font-semibold text-muted hover:text-white transition-colors cursor-pointer"
                      >
                        Maybe later
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <span>{isSubmitting ? "Submitting survey…" : "Submit & Claim £15 Voucher"}</span>
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
