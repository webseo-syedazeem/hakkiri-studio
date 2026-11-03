import type { Word } from "@/lib/types";
import { isLaunch } from "@/lib/launch";
import type { ScoreResult } from "./score-answer";
import type { FollowUpScores } from "./score-follow-ups";
import { followUpWords, roadmapAnswer } from "@/lib/mock-data";

/**
 * Offline stand-ins for Deepgram and Claude, switched on with HAKKIRI_MOCK_AI=1.
 * They let the whole record → follow-up → score → feedback flow run without
 * keys or credit, which is useful for working on screens and for automated tests.
 */
export const mockAiEnabled = () => process.env.HAKKIRI_MOCK_AI === "1" && !isLaunch();

/** Words as Deepgram returns them: one word at a time, fillers kept but not marked. */
function asDeepgram(words: Word[]): Word[] {
  return words.flatMap(({ text, start, end }) => {
    const parts = text.split(" ");
    const step = (end - start) / parts.length;
    return parts.map((t, i) => ({ text: t, start: Math.round((start + i * step) * 100) / 100, end: Math.round((start + (i + 1) * step) * 100) / 100 }));
  });
}

/** The main answer: the roadmap story. */
export function mockTranscript(): Word[] {
  return asDeepgram(roadmapAnswer.words);
}

/** A reply to a follow-up: the same short reply each time. */
export function mockFollowUpTranscript(): Word[] {
  return asDeepgram(followUpWords);
}

export function mockScore(): ScoreResult {
  return {
    content: { score: 4, evidence: ["payment completion went up from 41% to 58% in six weeks"] },
    structure: { score: 3, evidence: ["I took that to my director"] },
    pointSentence: "I took that to my director and we, um, agreed to pause onboarding and move two engineers onto payments for six weeks.",
    fillerPhrases: ["like", "you know"],
    strength: "A specific result with numbers and a timeframe.",
    oneFix: "Open with the decision, then the reason.",
    notes: [
      { tone: "fix", title: "Lead with the decision", body: "It arrives at 0:52. Say what you did first, then why.", quote: "move two engineers onto payments for six weeks." },
      { tone: "fix", title: "Say what you did", body: "You said “we” seven times. Interviewers listen for your part: “I proposed”, “I moved”.", quote: "difficult conversations along the way." },
      { tone: "strength", title: "Strong result", body: "Numbers and a timeframe. Keep it exactly as it is.", quote: "payment completion went up from 41% to 58% in six weeks," },
    ],
    strongerVersion:
      "I paused a quarter’s roadmap halfway through, because the data showed we were fixing the wrong problem. I was leading onboarding at Fernway when support flagged that new users were leaving at their first payment, not during onboarding. I checked the data: 60% dropped at that one step. I took it to my director with a proposal to pause onboarding and move two engineers onto payments for six weeks. Payment completion went from 41% to 58% in those six weeks, and the new onboarding shipped the next quarter on top of a payment step that worked.",
  };
}

export function mockFollowUpScores(count: number): FollowUpScores {
  return {
    followUps: Array.from({ length: count }, () => ({
      content: 3,
      structure: 2,
      tripped: "Back to “we” again",
      fillerPhrases: ["you know"],
      note: {
        tone: "fix" as const,
        title: "Keep it to your part",
        body: "You started with what you found, then the decision went back to “we”. Say what you proposed and who decided.",
        quote: "we agreed the plan in that meeting.",
      },
    })),
  };
}
