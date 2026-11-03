import type { Word } from "@/lib/types";
import type { ScoreResult } from "../score-answer";
import type { FollowUpScores } from "../score-follow-ups";
import { speakBetween } from "@/lib/demo-words";
import { DEMO_PRESENTATION_ID, demoQaTurn, demoScript, speakRun } from "@/lib/pitch/demo";
import type { Focus, Mark, Presentation } from "@/lib/pitch/types";
import type { RunModelResult } from "@/lib/pitch/run";
import type { RunScoreInput } from "./score-run";

/**
 * Offline stand-ins for presentations (HAKKIRI_MOCK_AI=1), so set-up,
 * rehearsal, the run report and Q&A all work without keys, and in tests.
 */

/** A run's words: the demo deck's scripts, or each slide's own text read as speech. */
export function mockRunTranscript(p: Presentation, marks: Mark[], totalSec: number): Word[] {
  const script = (n: number) => {
    if (p.id === DEMO_PRESENTATION_ID || p.source.kind === "demo") return demoScript(n);
    const s = p.slides.find((x) => x.n === n);
    if (!s) return undefined;
    return `So, ${s.title.replace(/[.!?]$/, "")}. ${s.lines.map((l) => l.replace(/[.!?]$/, "")).join(". ")}. {Um}, the point here is that ${s.point.charAt(0).toLowerCase()}${s.point.slice(1)}`;
  };
  return speakRun(marks, totalSec, script);
}

/** A plausible verdict per slide from how much was said, and fixed part scores. */
export function mockRunModel(input: RunScoreInput, focus: Focus): RunModelResult {
  const all = input.slides.flatMap((s) => s.words);
  const quoteOf = (ws: Word[]) => (ws.length >= 4 ? ws.slice(0, 4).map((w) => w.text).join(" ") : null);
  return {
    opening: { score: input.mode === "section" ? null : 4, evidence: quoteOf(all) },
    message: { score: input.mode === "full" ? 3 : null, evidence: null },
    structure: { score: input.mode === "full" ? 4 : null, evidence: null },
    audience: { score: input.mode === "full" ? 4 : null, evidence: null },
    slides: input.slides.filter((s) => s.seconds >= 3).map((s) => ({ n: s.n, covered: s.words.length >= 15 ? "yes" : s.words.length >= 5 ? "partly" : "no", quote: s.words.length >= 15 ? quoteOf(s.words) : null })),
    fixBody: null,
    fixFor: focus.kind,
    cuts: [],
    openingRewrite: input.mode === "section" ? null : "Good morning. Here’s why this matters to you, and what I’ll ask you for at the end.",
  };
}

/** Q&A answer k (0-based): the demo answers in turn; turn 1 is the reply to a press. */
export function mockQaTranscript(k: number, turn: number): Word[] {
  const { script } = demoQaTurn(k, turn);
  return speakBetween(script, 0.4, script.split(/\s+/).length / 2.5 + 1);
}

export function mockQaScore(k: number): ScoreResult {
  return demoQaTurn(k, 0).result!;
}

export function mockQaPressScores(k: number): FollowUpScores {
  const press = demoQaTurn(k, 1).press!;
  return { followUps: [{ content: press.content, structure: press.structure, tripped: press.tripped, fillerPhrases: [], note: press.note }] };
}
