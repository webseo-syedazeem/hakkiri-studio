import "server-only";
import { z } from "zod";
import type { LetterParagraph, LetterSentence } from "../schema";
import { newId } from "../schema";
import { drafted, writingMode } from "../write/assist";
import type { Problem, Verdict } from "../write/check";
import { figures, oneLine } from "../write/facts";
import { checkSentence, paragraphText } from "./check";
import { type RuleDraft, letterByRule, voiceOf } from "./draft";
import { type LetterCv, type Pool, evidenceLines, poolOf, sameAt } from "./sources";

/**
 * Drafting a cover letter. The AI service is asked for a draft, and every
 * sentence of that draft is put through the same source check a sentence
 * typed by hand goes through. A draft with one sentence that fails is not
 * shown: the person gets the letter assembled from their own words instead,
 * and is told so. In test mode, and without keys, the assembled letter is
 * what is offered.
 */

export interface LetterDraft extends RuleDraft {
  by: "ai" | "rules";
}

const RULES = `You write a cover letter for a person from their own material. You never add a fact.
- Everything about the person (experience, results, skills, why they want the job) must be in their CV lines, their reason or their notes. Reuse their words.
- Everything about the employer must be in the advert. Never present something from the advert as the person's own experience.
- No praise, enthusiasm or character words the person did not write themselves.
- Keep every number exactly as written. "roughly 40" stays "roughly 40". "helped" stays "helped".
- First person. Plain sentences. No greeting and no sign-off: only the paragraphs.
- Reply with one JSON object and nothing else.`;

const Reply = z.object({
  paragraphs: z
    .array(z.object({ role: z.enum(["opening", "evidence", "close"]), sentences: z.array(z.string().trim().min(8).max(600)).min(1).max(6) }))
    .min(3)
    .max(5),
});

const sentenceFrom = (text: string, pool: Pool): LetterSentence => {
  const c = checkSentence(text, pool);
  return { id: newId("ls_"), text: oneLine(text), origin: "drafted", sources: c.sources.map((s) => ({ kind: s.kind, at: s.at, noteId: s.noteId, text: s.text })) };
};

/** Every sentence must pass the source check, and the letter must have the shape and length of a letter. */
function verify(paragraphs: { role: string; sentences: string[] }[], pool: Pool): Verdict {
  const problems: Problem[] = [];
  if (paragraphs[0]?.role !== "opening" || paragraphs[paragraphs.length - 1]?.role !== "close") problems.push({ kind: "length", say: "The first paragraph must be the opening and the last the close." });
  const words = paragraphs.reduce((n, p) => n + p.sentences.join(" ").split(/\s+/).length, 0);
  if (words > 330) problems.push({ kind: "length", say: `The letter runs to ${words} words. It must fit one page: 330 at most.` });
  for (const p of paragraphs)
    for (const s of p.sentences) {
      const c = checkSentence(s, pool);
      for (const x of c.problems) problems.push({ ...x, say: `In “${s.slice(0, 70)}”: ${x.say}` });
    }
  return { ok: problems.length === 0, problems };
}

/** The letter for this version, from the reason, the chosen lines and the advert already saved with it. */
export async function draftLetter(cv: LetterCv, now: Date): Promise<LetterDraft> {
  const byRule = letterByRule(cv, now);
  const mode = writingMode();
  if (mode === "rules") return { by: "rules", ...byRule };
  if (mode === "off") return { by: "rules", ...byRule, notes: [...byRule.notes, "AI drafting isn’t available right now, so this letter is assembled from your own words: your reason, and the lines you chose."] };
  const letter = cv.letter!;
  const pool = poolOf(cv, now);
  const lines = evidenceLines(cv, now);
  const chosen = letter.evidence.map((at) => lines.find((l) => sameAt(l.at, at))).filter((l): l is NonNullable<typeof l> => !!l);
  const voice = voiceOf([letter.reason, letter.voice]);
  const out = await drafted(
    {
      label: "cv-letter",
      maxTokens: 1400,
      schema: Reply,
      system: `${RULES}\n\nWrite the paragraphs of the letter, ${cv.region === "us" ? "US" : "UK"} spelling, 150 to 280 words: an opening that names the job and gives the person's reason in their own words; one or two "evidence" paragraphs, each built on one of the chosen lines and, where the advert asks for what the line shows, saying so in the advert's words; and a short close. Match how the person writes in their reason and their writing sample: ${voice.contractions ? "they use contractions (I'm, I've)" : "they do not use contractions"}, and they call it a "${voice.roleWord}". Reply as {"paragraphs":[{"role":"opening"|"evidence"|"close","sentences":["…"]}]}.`,
      user: JSON.stringify({
        job: { title: cv.target?.title ?? "", employer: cv.target?.employer ?? "" },
        reason_in_their_words: letter.reason,
        chosen_lines: chosen.map((l) => ({ where: l.label, line: l.text })),
        their_notes: letter.notes.map((n) => n.text),
        other_cv_lines: pool.personal.filter((p) => p.kind === "cv").map((p) => p.text).slice(0, 60),
        advert_clauses: pool.employer.map((p) => p.text).slice(0, 80),
        sample_of_their_writing_for_tone_only: letter.voice.slice(0, 1500),
      }),
    },
    (v) => verify(v.paragraphs, pool),
  );
  if (out && "value" in out) {
    const paragraphs: LetterParagraph[] = out.value.paragraphs.map((p) => ({ id: newId("lp_"), role: p.role, sentences: p.sentences.map((s) => sentenceFrom(s, pool)) }));
    return { by: "ai", paragraphs, signoff: byRule.signoff, notes: [] };
  }
  return { by: "rules", ...byRule, notes: [...byRule.notes, "The AI draft didn’t pass the source check, so this letter is assembled from your own words instead."] };
}

const Shorter = z.object({ sentences: z.array(z.string().trim().min(8).max(600)).min(1).max(8) });

/**
 * A shorter wording of one paragraph that keeps what it rests on: every
 * sentence still passes the source check, and no figure is lost. Null when
 * the AI service is not available or its wording did not pass.
 */
export async function shortenParagraph(cv: LetterCv, paragraph: LetterParagraph, now: Date): Promise<LetterSentence[] | null> {
  if (writingMode() !== "ai") return null;
  const pool = poolOf(cv, now);
  const before = paragraphText(paragraph);
  const count = before.split(/\s+/).length;
  const out = await drafted(
    {
      label: "cv-letter-shorten",
      maxTokens: 600,
      schema: Shorter,
      system: `${RULES}\n\nShorten this paragraph of the person's cover letter by about a quarter. Keep every number and every claim; cut filler and repetition; reuse their words. Reply as {"sentences":["…"]}.`,
      user: JSON.stringify({ paragraph: before }),
    },
    (v) => {
      const problems: Problem[] = [];
      const after = v.sentences.join(" ");
      if (after.split(/\s+/).length >= count) problems.push({ kind: "length", say: "It is not shorter." });
      const kept = new Set(figures(after).map((f) => f.key));
      for (const f of figures(before)) if (!kept.has(f.key)) problems.push({ kind: "dropped-figure", original: f.text, say: `It dropped “${f.text}”.` });
      for (const s of v.sentences) for (const x of checkSentence(s, pool).problems) problems.push({ ...x, say: `In “${s.slice(0, 70)}”: ${x.say}` });
      return { ok: problems.length === 0, problems };
    },
  );
  return out && "value" in out ? out.value.sentences.map((s) => sentenceFrom(s, pool)) : null;
}
