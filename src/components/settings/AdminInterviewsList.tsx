"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";

export interface AdminQuestionItem {
  id: string;
  group: string;
  short: string;
  text: string;
  type?: string;
  slot?: string | null;
}

export interface AdminInterviewItem {
  id: string;
  company: string;
  role: string;
  seniority?: string;
  format?: string;
  date?: string | null;
  createdAt?: string | null;
  jobSummary?: string;
  questionCount: number;
  questions: AdminQuestionItem[];
}

const GROUP_COLORS: Record<string, string> = {
  competency: "bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30",
  technical: "bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30",
  motivation: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
  cv: "bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30",
  curveball: "bg-[#f43f5e]/15 text-[#fb7185] border-[#f43f5e]/30",
};

export function AdminInterviewsList({
  interviews,
}: {
  interviews: AdminInterviewItem[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const totalQuestions = interviews.reduce((acc, i) => acc + (i.questions?.length || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div>
          <span className="text-sm font-semibold text-ink">
            {interviews.length} {interviews.length === 1 ? "interview" : "interviews"} · {totalQuestions} AI questions
          </span>
          <p className="text-xs text-muted">
            See candidate job titles, companies, and the AI questions generated for each interview (candidate answers excluded).
          </p>
        </div>
        <a
          href="/api/admin/interviews?format=csv"
          download="hakkiri-interviews-and-questions.csv"
          className="inline-flex items-center gap-1.5 rounded-lg bg-panel-2 px-3 py-1.5 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:bg-[#2b2d38] transition-colors"
        >
          <Icon name="download" size={13} />
          Download CSV
        </a>
      </div>

      {!interviews.length ? (
        <p className="mt-3 text-sm text-muted">No interviews created yet.</p>
      ) : (
        <ul className="divide-y divide-line text-xs">
          {interviews.map((interview) => {
            const isExpanded = expandedId === interview.id;
            return (
              <li key={interview.id} className="py-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {interview.role}
                      </span>
                      <span className="text-sm text-muted">at</span>
                      <span className="text-sm font-medium text-[#cbd5e1]">
                        {interview.company}
                      </span>
                      {interview.format && (
                        <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-dim uppercase">
                          {interview.format}
                        </span>
                      )}
                      {interview.seniority && (
                        <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-muted">
                          {interview.seniority}
                        </span>
                      )}
                    </div>
                    {interview.jobSummary && (
                      <p className="text-[11px] text-muted line-clamp-1">
                        {interview.jobSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(interview.id)}
                      className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1 text-[11px] font-medium text-ink transition-colors"
                    >
                      <span>
                        {isExpanded ? "Hide Questions" : `View ${interview.questions.length} AI Questions`}
                      </span>
                      <Icon
                        name={isExpanded ? "chevronDown" : "chevronRight"}
                        size={12}
                        className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"}
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 rounded-lg border border-line bg-panel-2 p-3 space-y-2">
                    <div className="text-[11px] font-semibold text-ink flex items-center justify-between">
                      <span>AI-Generated Question Bank ({interview.questions.length}):</span>
                      <span className="text-[10px] text-muted font-normal">Candidate answers are not stored in the question bank.</span>
                    </div>
                    <ul className="divide-y divide-line/40 space-y-2 pt-1">
                      {interview.questions.map((q, idx) => {
                        const colorClass = GROUP_COLORS[q.group] || "bg-white/[0.06] text-ink border-white/[0.1]";
                        return (
                          <li key={q.id || idx} className="pt-2 first:pt-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="num text-[11px] text-muted font-mono">
                                #{idx + 1}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border ${colorClass}`}
                              >
                                {q.group}
                              </span>
                              <span className="font-semibold text-ink text-[12px]">
                                {q.short}
                              </span>
                            </div>
                            <p className="text-muted text-[12px] pl-6 leading-relaxed">
                              {q.text}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-lg border border-line bg-[#0d1117] p-3 text-[11px] text-muted flex items-start gap-2">
        <span className="text-base select-none">🔒</span>
        <div>
          <span className="font-semibold text-ink">Candidate Answer Privacy:</span> Candidate answers, voice recordings, and practice transcripts are kept strictly confidential to the candidate’s personal session and are never exposed in the interview question bank or admin exports.
        </div>
      </div>
    </div>
  );
}
