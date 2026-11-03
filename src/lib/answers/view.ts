import type { Answer, ContextType, ScoreParts } from "@/lib/types";
import { followUpProfile, profileFor, type ContextProfile } from "@/lib/scoring/profiles";
import { computeDelivery, deliveryScore, type DeliveryMetrics } from "@/lib/scoring/delivery";
import { overallScore } from "@/lib/scoring/combine";

/**
 * A saved answer with everything measured in code filled in: delivery for
 * the main answer and each follow-up reply, and the overall scores.
 * Used by the feedback screen and the mock report, so both show the same numbers.
 */
export interface ScoredAnswer {
  profile: ContextProfile;
  metrics: DeliveryMetrics;
  scores: ScoreParts;
  overall: number | null;
  followUps: (Answer["followUps"][number] & { metrics: DeliveryMetrics; overall: number | null; lengthSec: number })[];
}

export function scoreAnswerView(answer: Answer, type: ContextType): ScoredAnswer {
  const profile = profileFor(type);
  const metrics = computeDelivery(answer.words, {
    targetSec: profile.targetSec,
    pointWordIndex: answer.pointWordIndex >= 0 ? answer.pointWordIndex : null,
    pointWithinSec: profile.pointWithinSec,
  });
  const scores = { ...answer.scores, delivery: deliveryScore(metrics, profile) };
  const followUps = (answer.followUps ?? []).map((f) => {
    const fp = followUpProfile(f.kind);
    const fm = computeDelivery(f.words, { targetSec: fp.targetSec, pointWordIndex: null, pointWithinSec: fp.pointWithinSec });
    const fScores = { ...f.scores, delivery: deliveryScore(fm, fp) };
    return { ...f, scores: fScores, metrics: fm, overall: overallScore(fScores, fp.weights), lengthSec: fm.lengthSec };
  });
  return { profile, metrics, scores, overall: overallScore(scores, profile.weights), followUps };
}
