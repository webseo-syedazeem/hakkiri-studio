import type { Finding as OldFinding, InterviewerQuestion } from "@/lib/apply/schema";
import { readCvText } from "../import";
import type { CvDoc, CvRegion } from "../schema";
import { questionFor } from "../write/draft";
import { figures } from "../write/facts";
import { GOOD_ENOUGH, type Score, scoreCv } from "./score";

/**
 * The free public check, on the same engine as the builder: the pasted text
 * is read into a CV by the upload reader and scored by the same 35 checks, so
 * the number someone sees before signing up is the number they see after.
 * There is no floor. What cannot be known from pasted text (the page count,
 * how the finished files read back) is left pending, not guessed.
 */
export interface PublicAudit {
  score: number;
  /** Each group as a percentage of its own points. */
  subscores: { evidence: number; clarity: number; structure: number; software: number };
  findings: OldFinding[];
  /** The ids of the findings to show first. */
  teaser: string[];
  interviewerQuestions: InterviewerQuestion[];
  isGoodEnough: boolean;
  /** Points that depend on the finished file, which a pasted text does not have. */
  pending: number;
  detail: Score;
}

export function auditText(text: string, region: CvRegion, now = new Date()): PublicAudit {
  const read = readCvText(text);
  const cv: Pick<CvDoc, "contact" | "sections" | "design" | "region" | "level" | "target" | "accepted"> = {
    contact: read.contact,
    sections: read.sections,
    design: { template: "standard", pageSize: region === "us" ? "letter" : "a4", density: "default", pageTarget: 2 },
    region,
    level: "experienced",
    target: undefined,
    accepted: [],
  };
  const detail = scoreCv({ cv, now, ownFile: false });
  const pct = (id: string) => {
    const g = detail.groups.find((x) => x.id === id)!;
    // The share of what could be judged from the text: points that wait on the finished file are left out of both sides.
    const judged = g.points - g.pending;
    return judged > 0 ? Math.round((g.earned / judged) * 100) : 0;
  };
  // Findings about the finished file do not apply to pasted text.
  const shown = detail.findings.filter((f) => f.fix !== "files" && f.rule !== "page-count");
  // Ids here are by rule and position, so the same text always gives the same answer.
  const findings: OldFinding[] = shown.map((f, i) => ({ id: `${f.rule}-${i + 1}`, area: f.group, severity: f.severity === "issue" ? "high" : f.points >= 1 ? "medium" : "low", quote: f.excerpt, problem: f.reason, fix: f.action }));
  const bullets = cv.sections.flatMap((s) => ("entries" in s ? s.entries.flatMap((e) => e.bullets.map((b) => b.text)) : []));
  const interviewerQuestions = [...bullets.filter((b) => figures(b).length), ...bullets.filter((b) => !figures(b).length)].slice(0, 5).map((quote, i) => ({ id: `q${i + 1}`, quote, question: questionFor(quote) }));
  return { score: detail.shown, subscores: { evidence: pct("evidence"), clarity: pct("clarity"), structure: pct("structure"), software: pct("software") }, findings, teaser: findings.slice(0, 3).map((f) => f.id), interviewerQuestions, isGoodEnough: detail.shown >= GOOD_ENOUGH, pending: detail.pending, detail };
}
