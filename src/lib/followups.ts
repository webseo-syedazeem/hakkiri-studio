import type { ContextType, FollowUpKind, InterviewerStyle } from "@/lib/types";

/**
 * Follow-up rules shared by the live screen and the server
 * (spec: "Follow-up questions"). Safe to import in the browser.
 */

export const FOLLOW_UP_KIND_LABEL: Record<FollowUpKind, string> = {
  ownership: "Your part",
  result: "The result",
  challenge: "Challenge",
  technical: "Technical drill-down",
  cv: "From your CV",
  clarify: "Clarify",
};

/**
 * How many follow-ups one question can get. The spec's hard limit is two;
 * a friendly interviewer asks at most one. These are starting points for
 * the "follow-up behaviour" test in the launch plan.
 */
export function followUpLimit(style: InterviewerStyle, type: ContextType): number {
  if (type === "questions-for-us" || type === "presentation-opening" || type === "salary" || type === "pay-question") return 0;
  return style === "friendly" ? 1 : 2;
}
