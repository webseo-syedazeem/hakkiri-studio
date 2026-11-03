import type { Word } from "@/lib/types";

/**
 * Demo transcripts written as scripts, turned into timed words the way
 * speech-to-text returns them. {braces} mark fillers; a filler phrase like
 * {you know} counts once.
 */

export function wordsFromScript(segments: { start: number; end: number; text: string }[]): Word[] {
  const words: Word[] = [];
  for (const seg of segments) {
    const tokens = [...seg.text.matchAll(/\{([^}]+)\}([,.]?)|(\S+)/g)].map((m) =>
      m[3] ? { text: m[3], filler: false } : { text: m[1] + (m[2] ?? ""), filler: true },
    );
    const slot = (seg.end - seg.start) / tokens.length;
    tokens.forEach((t, i) => {
      const start = seg.start + i * slot;
      words.push({ text: t.text, start: round2(start), end: round2(start + slot * 0.82), ...(t.filler ? { filler: true } : {}) });
    });
  }
  return words;
}

export function indexOfPhrase(words: Word[], phrase: string, from = 0): number {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9%']/g, "");
  const target = phrase.split(" ").map(clean);
  for (let i = from; i <= words.length - target.length; i++) {
    if (target.every((t, k) => clean(words[i + k].text) === t)) return i;
  }
  throw new Error(`Phrase not found in transcript: ${phrase}`);
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * A script spoken between two times at a natural pace: about 2.6 words a
 * second within a sentence and a breath between sentences. If the script is
 * shorter than the time, the breaths get longer (up to 2.4 seconds) and any
 * time left over is quiet at the end, as when you look at the next slide.
 * If it's longer, it's spoken faster to fit.
 */
export function speakBetween(text: string, from: number, to: number): Word[] {
  const sentences = (text.match(/[^.!?]+[.!?]+["”’]?|[^.!?]+$/g) ?? []).map((s) => s.trim()).filter(Boolean);
  const toks = sentences.map((s) => [...s.matchAll(/\{([^}]+)\}([,.]?)|(\S+)/g)].map((m) => (m[3] ? { text: m[3], filler: false } : { text: m[1] + (m[2] ?? ""), filler: true })));
  const n = toks.reduce((a, t) => a + t.length, 0);
  if (!n || to <= from) return [];
  const span = Math.max(0.5, to - from - 0.6);
  let rate = 2.6;
  let gap = 0.6;
  const gaps = Math.max(0, sentences.length - 1);
  const need = n / rate + gaps * gap;
  if (need > span) {
    const k = need / span;
    rate *= k;
    gap /= k;
  } else if (gaps) {
    gap = Math.min(2.4, gap + (span - need) / gaps);
  }
  const words: Word[] = [];
  let t = from + 0.3;
  toks.forEach((sentence, si) => {
    for (const tok of sentence) {
      words.push({ text: tok.text, start: round2(t), end: round2(t + 0.82 / rate), ...(tok.filler ? { filler: true } : {}) });
      t += 1 / rate;
    }
    if (si < toks.length - 1) t += gap;
  });
  return words;
}
