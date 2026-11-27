import "server-only";
import { z } from "zod";
import { aiConfig } from "@/lib/ai/config";
import { ask } from "@/lib/ai/ask";
import { mockAiEnabled } from "@/lib/ai/mock";
import { normText } from "@/lib/ai/interview/build-plan";
import type { Difficulty } from "@/lib/interviews/settings";
import { CATEGORY_ASSESSES, CATEGORY_KEYS, CATEGORY_NAME, SECTORS, type CategoryKey, type IndustryKey } from "./catalogue";
import { BANK, PROFESSION_BANK, profileText } from "./knowledge";

/**
 * Writes the questions for one General practice session (developer note:
 * industry-specific question generation). The industry decides what is
 * assessed, the question type how it is assessed, and the profession the
 * context and level. With a model, fresh questions are written from the
 * industry's knowledge profile and checked before they are used; without
 * one, the starter bank is used. Either way nothing the person has been
 * asked before comes back, reworded or not.
 */

export interface GeneralSpec {
  industry: IndustryKey;
  profession: string;
  difficulty: Difficulty;
}

export interface GeneralQuestion {
  category: CategoryKey;
  text: string;
  short: string;
}

const STOP = new Set(["the", "and", "you", "your", "for", "with", "that", "this", "what", "how", "about", "time", "tell", "when", "did", "was", "are", "have", "would", "who", "why", "describe", "from", "into", "they", "them", "their", "does", "can", "had", "has", "our", "its", "were", "one", "any", "some"]);
const tokens = (s: string) => new Set(normText(s).split(" ").filter((w) => w.length > 2 && !STOP.has(w)));

/** True when two questions ask the same thing, even reworded. */
export function tooSimilar(a: string, b: string): boolean {
  if (normText(a) === normText(b)) return true;
  const x = tokens(a);
  const y = tokens(b);
  if (!x.size || !y.size) return false;
  let shared = 0;
  for (const w of x) if (y.has(w)) shared += 1;
  return shared / (x.size + y.size - shared) >= 0.6;
}

const INDUSTRY_WORDS = /\b(banking|finance|financial services|government|public sector|public services|civil service|healthcare|health care|social care|technology|tech|digital|education|teaching|this industry|the industry|this sector)\b/i;

/** "What are your greatest strengths in banking?": a generic question with the industry dropped in. */
export function superficial(text: string): boolean {
  const generic = /^(what are your (greatest |biggest |main |key )?(strengths|weaknesses)|tell me about yourself|why do you want to work in|why are you interested in|what do you know about|what skills do you have)/i;
  return generic.test(text.trim()) && INDUSTRY_WORDS.test(text);
}

const short = (text: string) => {
  const t = text.replace(/^(tell me about a time (when )?you|describe a time (when )?you|how do you|how would you|what do you|what)\s+/i, "").replace(/[?.]$/, "");
  const words = t.split(/\s+/).slice(0, 5).join(" ");
  return (words.charAt(0).toUpperCase() + words.slice(1)).slice(0, 48);
};

/* ------------------------------------------------------------------ the bank */

const ORDER: Record<Difficulty, number[]> = { easy: [0, 1, 2, 3], medium: [1, 2, 0, 3], hard: [3, 2, 1, 0] };

/** Bank questions for a type, most suitable first: the profession's, then the industry's, at this difficulty. */
function candidates(spec: GeneralSpec, category: CategoryKey): string[] {
  const own = PROFESSION_BANK[spec.profession]?.[category] ?? [];
  const industry = ORDER[spec.difficulty].map((i) => BANK[spec.industry][category][i]);
  return [...own, ...industry];
}

/** Picks from the bank, never repeating what's in `history`; when a type runs dry, the one asked longest ago comes back. */
export function fromBank(spec: GeneralSpec, plan: CategoryKey[], history: string[]): GeneralQuestion[] {
  const used = [...history];
  const out: GeneralQuestion[] = [];
  for (const category of plan) {
    const pool = candidates(spec, category);
    let text = pool.find((q) => !used.some((u) => tooSimilar(u, q)));
    if (!text) {
      // Every one has been asked: reuse the one asked longest ago, but never twice in one session.
      const lastSeen = (q: string) => history.map((h, i) => (tooSimilar(h, q) ? i : -1)).reduce((a, b) => Math.max(a, b), -1);
      text = pool.filter((q) => !out.some((o) => tooSimilar(o.text, q))).sort((a, b) => lastSeen(a) - lastSeen(b))[0];
    }
    if (!text) continue;
    used.push(text);
    out.push({ category, text, short: short(text) });
  }
  return out;
}

/* ------------------------------------------------------------------ the model */

const ReplySchema = z.object({
  questions: z
    .array(z.object({ category: z.enum(CATEGORY_KEYS as [CategoryKey, ...CategoryKey[]]), text: z.string().min(12).max(260), short: z.string().min(2).max(48) }))
    .min(1)
    .max(24),
});
type Reply = z.infer<typeof ReplySchema>;

const DIFFICULTY: Record<Difficulty, string> = {
  easy: "Easy: common, approachable questions a friendly interviewer would ask at entry or early-career level. One idea per question.",
  medium: "Medium: realistic questions a typical hiring manager in this industry would ask, with some depth.",
  hard: "Hard: probing, senior-panel questions with a constraint, trade-off or twist. Still fair and answerable.",
};

function counts(plan: CategoryKey[]): Partial<Record<CategoryKey, number>> {
  const c: Partial<Record<CategoryKey, number>> = {};
  for (const k of plan) c[k] = (c[k] ?? 0) + 1;
  return c;
}

/** The checks every question must pass before it is shown (developer note, "Question quality and validation"). */
export function checkReply(reply: Reply, plan: CategoryKey[], history: string[]): string[] {
  const problems: string[] = [];
  const want = counts(plan);
  for (const [k, n] of Object.entries(want) as [CategoryKey, number][]) {
    const got = reply.questions.filter((q) => q.category === k).length;
    if (got < n) problems.push(`Write ${n} ${k} questions, not ${got}.`);
  }
  const seen: string[] = [...history];
  reply.questions.forEach((q, i) => {
    const t = q.text.trim();
    if (!/[?.]$/.test(t)) problems.push(`Question ${i + 1} must end with a question mark.`);
    if (/tell me about yourself/i.test(t)) problems.push(`Question ${i + 1}: leave out “Tell me about yourself”.`);
    if (superficial(t)) problems.push(`Question ${i + 1} is a generic question with the industry's name inserted. Make the industry change what is being assessed.`);
    if (seen.some((s) => tooSimilar(s, t))) problems.push(`Question ${i + 1} repeats or rewords a question the candidate has already had.`);
    if (q.category === "strengths" && /^(tell me about a time|describe a time|give an example)/i.test(t)) problems.push(`Question ${i + 1} is a strengths question: ask what they enjoy or what comes naturally, not for a STAR example.`);
    if (q.category === "behaviour" && !/(time|example|occasion|describe|tell me)/i.test(t)) problems.push(`Question ${i + 1} is a competency question: ask for a real past example.`);
    seen.push(t);
  });
  return problems.slice(0, 8);
}

function prompt(spec: GeneralSpec, plan: CategoryKey[], history: string[]): { system: string; user: string } {
  const name = SECTORS[spec.industry].name;
  const want = counts(plan);
  const types = (Object.keys(want) as CategoryKey[]).map((k) => `- ${k} (${CATEGORY_NAME[k]}) × ${want[k]}: assess ${CATEGORY_ASSESSES[k]}.`);
  const examples = (Object.keys(want) as CategoryKey[]).map((k) => `- ${k}: “${BANK[spec.industry][k][1]}”`);
  const scope =
    spec.industry !== "any" && spec.profession
      ? `Questions must reflect the intersection of ${name} and the profession ${spec.profession}.`
      : spec.industry !== "any"
        ? `Questions must be specific to ${name}, without assuming a specialist job within it.`
        : spec.profession
          ? `Questions must be specific to the profession ${spec.profession}, and work across industries.`
          : "Write general professional interview questions.";
  const system = [
    "You are Hakkiri's interview coach. Write interview practice questions for one session.",
    "The industry decides WHAT is assessed, the question type decides HOW it is assessed, and the profession decides the context and level of specialisation.",
    scope,
    "Use the industry knowledge profile: its real challenges, responsibilities, rules, stakeholders, pressures and trends must shape the substance of every question, not just its wording.",
    "",
    "Write exactly these, in this order of types:",
    ...types,
    `- ${DIFFICULTY[spec.difficulty]}`,
    "",
    "Every question must pass all of these checks:",
    "- Genuinely relevant to the industry (and profession, when given): realistic, and could be asked in a real interview in it.",
    "- Matches its type: strengths questions ask what energises the person or comes naturally (never STAR); competency questions ask for a real past example; situational and case questions present a realistic situation from this industry.",
    "- Complexity matches the difficulty.",
    "- Doesn't assume experience, qualifications or seniority the candidate hasn't stated.",
    "- Not the same as, or a rewording of, any question the candidate has already had, or another in this set.",
    "- Never superficial: “What are your greatest strengths in banking?” is wrong; “How naturally do you identify inconsistencies in financial information, and what do you enjoy about this process?” is right.",
    "- UK English, plain spoken, one question each, ending with a question mark. No numbers or facts that aren't common knowledge in the industry.",
    "short: 2 to 5 words naming what the question tests.",
    "Reply with JSON only.",
  ].join("\n");
  const user = [
    "<industry-profile>",
    profileText(spec.industry, name, spec.profession),
    "</industry-profile>",
    "",
    "Style examples for this industry (do not reuse them):",
    ...examples,
    "",
    history.length ? `Already asked (never repeat or reword these):\n${history.slice(-60).map((h) => `- ${h}`).join("\n")}` : "Nothing asked yet.",
    "",
    `Reply with: { "questions": [{ "category": ${CATEGORY_KEYS.map((k) => `"${k}"`).join(" | ")}, "text": "the question", "short": "2 to 5 words" }] }`,
  ].join("\n");
  return { system, user };
}

const canWrite = () => !mockAiEnabled() && Boolean(aiConfig.anthropicKey || aiConfig.geminiKey);

/** The session's questions, in plan order: written fresh when a model is available, otherwise from the bank. */
export async function writeGeneralQuestions(spec: GeneralSpec, plan: CategoryKey[], history: string[]): Promise<{ questions: GeneralQuestion[]; by: "model" | "bank" }> {
  if (canWrite()) {
    const { system, user } = prompt(spec, plan, history);
    const reply = await ask({ model: aiConfig.mainModel, system, user, maxTokens: 2500, temperature: 0.7, timeoutMs: 45_000, schema: ReplySchema, check: (r) => checkReply(r, plan, history), label: "general-practice" });
    if (reply) {
      const pool = [...reply.questions];
      const slots: (GeneralQuestion | null)[] = plan.map((category) => {
        const i = pool.findIndex((q) => q.category === category);
        if (i < 0) return null;
        const [q] = pool.splice(i, 1);
        return { category, text: q.text.trim(), short: q.short.trim() || short(q.text) };
      });
      // Anything the model left short comes from the bank, in its place in the plan.
      const written = slots.filter((s): s is GeneralQuestion => Boolean(s));
      const filler = fromBank(spec, plan.filter((_, i) => !slots[i]), [...history, ...written.map((o) => o.text)]);
      const out = slots.map((s) => s ?? filler.shift() ?? null).filter((s): s is GeneralQuestion => Boolean(s));
      return { questions: out, by: "model" };
    }
  }
  return { questions: fromBank(spec, plan, history), by: "bank" };
}
