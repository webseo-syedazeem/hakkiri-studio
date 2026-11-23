import type { Answer, Highlight } from "@/lib/types";

/** A run of consecutive words of the transcript that share one mark (or none). */
export interface ExtractRun {
  text: string;
  kind: Highlight["kind"] | null;
}

export interface FeedbackPoint {
  /** The coach note's heading, when the point came from a note pinned to the transcript. */
  title?: string;
  body: string;
}

/**
 * What the feedback screen says about one answer. Every line of it comes from
 * the saved answer: the words that were heard, the marks and notes made on
 * them, and the one strength and one fix that were written for it. Where the
 * answer holds nothing for a part, that part is empty and the screen says so.
 * Nothing here is ever filled in with a stand-in.
 */
export interface AnswerFeedback {
  /** The whole answer as it was heard. Empty when nothing was heard. */
  transcript: string;
  /** The opening of the answer, with its marks. */
  extract: ExtractRun[];
  /** True when the extract stops before the end of the answer. */
  extractCut: boolean;
  strengths: FeedbackPoint[];
  fixes: FeedbackPoint[];
  /** The stronger version written from the person's own words. Empty when none was written. */
  stronger: string;
}

const clean = (s: string | undefined | null) => (s ?? "").trim();
const sameText = (a: string, b: string) => a.toLowerCase().replace(/\s+/g, " ") === b.toLowerCase().replace(/\s+/g, " ");

export function answerFeedback(answer: Answer, extractWords = 60): AnswerFeedback {
  const words = answer.words ?? [];
  const highlights = answer.highlights ?? [];
  const kindAt = (i: number) => highlights.find((h) => i >= h.from && i <= h.to)?.kind ?? null;

  const extract: ExtractRun[] = [];
  words.slice(0, extractWords).forEach((w, i) => {
    const kind = kindAt(i);
    const last = extract[extract.length - 1];
    if (last && last.kind === kind) last.text += ` ${w.text}`;
    else extract.push({ text: w.text, kind });
  });

  const points = (tone: "strength" | "fix", lead: string): FeedbackPoint[] => {
    const out: FeedbackPoint[] = [];
    if (lead) out.push({ body: lead });
    for (const note of answer.notes ?? []) {
      if (note.tone !== tone) continue;
      const title = clean(note.title);
      const body = clean(note.body);
      if (!title && !body) continue;
      // The lead line is often the same note in other words: it isn't listed twice.
      if (out.some((p) => sameText(p.body, body) || sameText(p.body, title))) continue;
      out.push(body ? { title: title || undefined, body } : { body: title });
    }
    return out;
  };

  return {
    transcript: words.map((w) => w.text).join(" "),
    extract,
    extractCut: words.length > extractWords,
    strengths: points("strength", clean(answer.strength)),
    fixes: points("fix", clean(answer.oneFix)),
    stronger: (answer.strongerVersion ?? [])
      .map((s) => clean(s.text))
      .filter(Boolean)
      .join(" "),
  };
}
