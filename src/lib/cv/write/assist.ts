import "server-only";
import { z } from "zod";
import { ask } from "@/lib/ai/ask";
import { aiConfig } from "@/lib/ai/config";
import { mockAiEnabled } from "@/lib/ai/mock";
import type { CvDoc, CvRegion } from "../schema";
import { type Problem, type Verdict, checkGrounded, checkMerge, checkProfile, checkRewrite, refusalMessage } from "./check";
import { type Capture, type DraftBullet, type ProfileDraft, bulletsByRule, mergeDetail, profilesByRule, tidyByRule, visibleRoles, visibleText, yearsOfExperience } from "./draft";
import { oneLine } from "./facts";

/**
 * The writing help. Each tool asks the AI service for a draft and then puts
 * that draft through the checks in `check.ts`. A draft that adds a fact, loses
 * one, or claims more than the person said never reaches them: it is refused
 * with the exact difference, or replaced by what can be done by rule from
 * their own words.
 *
 *   "ai":    keys are present; drafts come from the model and are checked.
 *   "rules": test mode (HAKKIRI_MOCK_AI=1); drafts are made by rule, checked the same way. Nothing is invented.
 *   "off":   no keys; only what needs no model is offered.
 */
export type Mode = "ai" | "rules" | "off";
export function writingMode(): Mode {
  if (mockAiEnabled()) return "rules";
  return aiConfig.anthropicKey || aiConfig.geminiKey ? "ai" : "off";
}

const spelling = (region: CvRegion) => (region === "us" ? "US" : "UK");
const RULES = `You help a person word their own CV. You never add a fact.
- Every number, name, tool, employer, timeframe and result you write must already be in the person's own text.
- Reuse their words. You may reorder them, cut filler, fix grammar and change a word's ending. Do not swap in a different word that carries meaning.
- Do not strengthen a claim. "helped" stays "helped". "roughly 40" stays "roughly 40". "up to" stays "up to".
- Never write "I" or "we". No full stop at the end of a bullet.
- Reply with one JSON object and nothing else.`;

/** One checked call: the draft and, when it was refused twice, why. Null when the service did not answer. */
export async function drafted<T>(o: { label: string; system: string; user: string; maxTokens: number; schema: z.ZodType<T> }, verify: (value: T) => Verdict): Promise<{ value: T } | { refused: Verdict } | null> {
  let last: Verdict | null = null;
  const value = await ask<T>({
    model: aiConfig.mainModel,
    system: o.system,
    user: o.user,
    maxTokens: o.maxTokens,
    temperature: 0.2,
    timeoutMs: 25000,
    schema: o.schema,
    label: o.label,
    check: (v) => {
      last = verify(v);
      return last.problems.map((p) => p.say);
    },
  });
  if (value !== null) return { value };
  const verdict = last as Verdict | null;
  return verdict && !verdict.ok ? { refused: verdict } : null;
}

const all = (verdicts: Verdict[]): Verdict => ({ ok: verdicts.every((v) => v.ok), problems: verdicts.flatMap((v) => v.problems) });
const NO_I = /\b(?:I|we|my|our)\b/;

/* ----------------------------------------------------- bullets from notes */

export interface BulletsResult {
  by: "ai" | "rules";
  bullets: DraftBullet[];
  /** Said to the person when the drafts are their own sentences because the AI did not give usable ones. */
  note?: string;
}

const BulletsReply = z.object({ bullets: z.array(z.object({ text: z.string().trim().min(8).max(400), quotes: z.array(z.string().trim().min(2).max(600)).min(1).max(4) })).min(1).max(8) });

/** Bullets from the three answers on "Tell me what you did". Each comes with the exact passages it was made from. */
export async function draftBullets(capture: Capture, role: { title: string; org: string }, region: CvRegion): Promise<BulletsResult> {
  const byRule = bulletsByRule(capture);
  if (writingMode() !== "ai" || !byRule.length) return { by: "rules", bullets: byRule };
  const notes = oneLine([capture.did, capture.changed, capture.number].join("\n"));
  const out = await drafted(
    {
      label: "cv-bullets",
      maxTokens: 900,
      schema: BulletsReply,
      system: `${RULES}\n\nThe person has answered three questions about one role. Write 1 to 6 CV bullets from their answers, ${spelling(region)} spelling. Start each with the verb they used. One point per bullet. For each bullet give "quotes": the one or two passages of their answers it was built from, copied character for character.\nReply as {"bullets":[{"text":"...","quotes":["..."]}]}.`,
      user: JSON.stringify({ role: role.title, employer: role.org, answers: { responsible_for: capture.did, what_changed: capture.changed, a_number_they_stand_behind: capture.number } }),
    },
    (v) =>
      all(
        v.bullets.map((b) => {
          const missing = b.quotes.filter((q) => !notes.includes(oneLine(q)));
          const problems: Problem[] = missing.map((q) => ({ kind: "added-word", proposed: q, say: `The quote “${q.slice(0, 80)}” is not in the answers word for word.` }));
          if (NO_I.test(b.text)) problems.push({ kind: "first-person", say: `“${b.text.slice(0, 60)}” uses “I” or “we”.` });
          return all([{ ok: !problems.length, problems }, checkGrounded(b.text, missing.length ? [notes] : b.quotes, { whose: "the answers" })]);
        }),
      ),
  );
  if (out && "value" in out) return { by: "ai", bullets: out.value.bullets.map((b) => ({ text: oneLine(b.text).replace(/[.\s]+$/, ""), quotes: b.quotes.map(oneLine) })) };
  return { by: "rules", bullets: byRule, note: "The AI drafts didn’t pass the check against your words, so these are your own sentences as you wrote them." };
}

/* ------------------------------------------------------------------ rewrite */

export type RewriteResult =
  | { status: "ready"; proposed: string; by: "ai" | "rules" }
  /** There was nothing to tighten. */
  | { status: "unchanged"; by: "ai" | "rules" }
  /** The draft changed the claim, twice. It is not shown; the reasons are. */
  | { status: "refused"; message: string; problems: Problem[] }
  | { status: "unavailable"; message: string };

const TextReply = z.object({ text: z.string().trim().min(3).max(700) });
const same = (a: string, b: string) => oneLine(a).replace(/[.\s]+$/, "").toLowerCase() === oneLine(b).replace(/[.\s]+$/, "").toLowerCase();
const UNAVAILABLE = "Rewriting needs the AI service, which isn’t available right now. Your bullet is unchanged, and you can still edit it yourself.";

/** A tighter wording of one bullet that keeps every fact in it. */
export async function rewriteBullet(original: string, region: CvRegion): Promise<RewriteResult> {
  const mode = writingMode();
  if (mode === "off") return { status: "unavailable", message: UNAVAILABLE };
  if (mode === "rules") {
    const proposed = tidyByRule(original);
    if (same(proposed, original)) return { status: "unchanged", by: "rules" };
    const verdict = checkRewrite(original, proposed);
    return verdict.ok ? { status: "ready", proposed, by: "rules" } : { status: "refused", message: refusalMessage(verdict), problems: verdict.problems };
  }
  const out = await drafted(
    {
      label: "cv-rewrite",
      maxTokens: 300,
      schema: TextReply,
      system: `${RULES}\n\nRewrite this one CV bullet so it is tighter: verb first, no filler, ${spelling(region)} spelling. Keep every number, unit, currency, timeframe, estimate word, name and the outcome. If it is already tight, return it unchanged.\nReply as {"text":"..."}.`,
      user: JSON.stringify({ bullet: original }),
    },
    (v) => checkRewrite(original, v.text),
  );
  if (!out) return { status: "unavailable", message: "The rewrite didn’t come back. Your bullet is unchanged. Try again in a moment." };
  if ("refused" in out) return { status: "refused", message: refusalMessage(out.refused), problems: out.refused.problems };
  const proposed = oneLine(out.value.text).replace(/[.\s]+$/, "");
  return same(proposed, original) ? { status: "unchanged", by: "ai" } : { status: "ready", proposed, by: "ai" };
}

/* ------------------------------------------------------------ add the number */

export interface NumberResult {
  proposed: string;
  by: "ai" | "rules";
}

/**
 * Sets a detail the person has just given into their bullet. The detail is
 * theirs; nothing here supplies one. If the model's wording fails the check,
 * the detail is placed by rule, which keeps both texts word for word.
 */
export async function addNumber(original: string, detail: string, region: CvRegion): Promise<NumberResult> {
  const byRule = mergeDetail(original, detail);
  if (writingMode() !== "ai") return { proposed: byRule, by: "rules" };
  const out = await drafted(
    {
      label: "cv-number",
      maxTokens: 300,
      schema: TextReply,
      system: `${RULES}\n\nThe person has given a detail to add to their CV bullet. Put the detail into the bullet where it reads naturally, ${spelling(region)} spelling. Use the detail exactly as given, estimate words included. Change nothing else.\nReply as {"text":"..."}.`,
      user: JSON.stringify({ bullet: original, detail }),
    },
    (v) => checkMerge(original, detail, v.text),
  );
  return out && "value" in out ? { proposed: oneLine(out.value.text).replace(/[.\s]+$/, ""), by: "ai" } : { proposed: byRule, by: "rules" };
}

/* ------------------------------------------------------------------ profile */

export interface ProfileResult {
  by: "ai" | "rules";
  versions: ProfileDraft[];
  /** Whole years of work, worked out from the dates on the CV. */
  years?: number;
  note?: string;
}

const ProfileReply = z.object({ versions: z.array(z.object({ style: z.enum(["experience", "contribution"]), text: z.string().trim().min(40).max(700) })).length(2) });

/** Two versions of the profile, written last from what is on the CV: one led by experience, one by contribution. */
export async function draftProfiles(cv: Pick<CvDoc, "contact" | "sections" | "region">, pick: { entryId?: string; skills: string[] }, now: Date): Promise<ProfileResult> {
  const byRule = profilesByRule(cv, pick, now);
  const roles = visibleRoles(cv);
  const role = roles.find((e) => e.id === pick.entryId) ?? roles[0];
  if (writingMode() !== "ai" || !role) return { by: "rules", ...byRule };
  const text = visibleText(cv);
  const years = yearsOfExperience(cv, now);
  const out = await drafted(
    {
      label: "cv-profile",
      maxTokens: 700,
      schema: ProfileReply,
      system: `${RULES}\n\nWrite two versions of the profile that opens this CV, ${spelling(region(cv))} spelling, 3 to 4 sentences each, without "I". Use only the role, the skills to highlight and the lines of the CV given. You may state the years of experience only as the figure given, or leave it out when none is given.\nVersion "experience" opens with the job title and years. Version "contribution" opens with the strongest result. They must differ clearly.\nReply as {"versions":[{"style":"experience","text":"..."},{"style":"contribution","text":"..."}]}.`,
      user: JSON.stringify({ role: role.title, employer: role.org, years_of_experience: years ?? null, skills_to_highlight: pick.skills, cv_lines: roles.flatMap((e) => e.bullets.filter((b) => b.visible).map((b) => b.text)) }),
    },
    (v) => {
      const styles = new Set(v.versions.map((x) => x.style));
      const twins: Problem[] = styles.size < 2 || same(v.versions[0].text, v.versions[1].text) ? [{ kind: "length", say: "The two versions must be one of each style and must differ." }] : [];
      return all([{ ok: !twins.length, problems: twins }, ...v.versions.map((x) => checkProfile(x.text, text, { years }))]);
    },
  );
  if (out && "value" in out) return { by: "ai", versions: out.value.versions.map((v) => ({ style: v.style, text: oneLine(v.text) })), years };
  return { by: "rules", ...byRule, note: "The AI versions didn’t pass the check against your CV, so these are assembled from your CV’s own lines." };
}

const region = (cv: Pick<CvDoc, "region">) => cv.region;
