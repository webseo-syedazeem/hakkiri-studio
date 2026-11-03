import type { ContextType, InterviewRound, Question, Word } from "@/lib/types";

/**
 * Talking about pay: a drill on the part of an interview people worry about
 * most. Sam asks what you're looking for, what you earn now and pushes back
 * once; then you practise asking about pay, bonus and benefits in a way
 * that suits the round. Checks are measured in code from your words, so the
 * same answer always gets the same marks. Safe to import in the browser.
 */

export const PAY_IDS = ["pay1", "pay2", "pay3", "pay4"] as const;

/** Which round you're practising for, as it changes how to talk about pay. */
export type PayStage = "recruiter" | "manager" | "final";

export function payStage(round: InterviewRound): PayStage {
  if (round === "screening") return "recruiter";
  if (round === "final") return "final";
  return "manager";
}

export const PAY_STAGE_LABEL: Record<PayStage, string> = {
  recruiter: "a screening call with a recruiter",
  manager: "an interview with the hiring manager",
  final: "a final round or an offer",
};

/** When and how to raise pay, for the round you're practising. */
export const PAY_TIPS: Record<PayStage, { when: string; ask: string[]; avoid: string }> = {
  recruiter: {
    when: "Recruiters expect to talk about pay early. It’s fine to ask the range for the role on the first call.",
    ask: ["What’s the salary range for this role?", "Is there a bonus, and how is it decided?", "What does the rest of the package look like: pension, holiday, hybrid working?"],
    avoid: "Don’t lead with your current salary. Give the range you’re looking for, based on the market.",
  },
  manager: {
    when: "With the hiring manager, keep your questions on the role. Pay is usually for the recruiter or the offer stage.",
    ask: ["How is pay reviewed here, and how often?", "At what stage would we talk about the package?", "What would great performance look like in the first year?"],
    avoid: "Don’t open with bonus or holiday questions here. If they ask your expectations, give your range and move on.",
  },
  final: {
    when: "This is the stage to be specific. Ask about every part of the package before you say yes.",
    ask: ["How is the bonus structured, and what did it pay out last year?", "What’s the pension contribution?", "When is the first pay review?"],
    avoid: "Don’t accept on the spot. Thank them, ask for it in writing, and say when you’ll come back to them.",
  },
};

/** The four questions, written for the round. */
export function payQuestions(stage: PayStage, company: string): Pick<Question, "id" | "text" | "short" | "type">[] {
  const closing: Record<PayStage, string> = {
    recruiter: "Before we wrap up, is there anything you’d like to ask about pay or the package?",
    manager: "Do you have any questions for me? Ask whatever you’d want to know about pay, as you would here.",
    final: `If we made you an offer, what would you want to know about the package at ${company}?`,
  };
  return [
    { id: "pay1", type: "salary", text: "What are your salary expectations for this role?", short: "Your salary expectations" },
    { id: "pay2", type: "salary", text: "And what are you earning at the moment?", short: "What you earn now" },
    { id: "pay3", type: "salary", text: "That’s a bit above what we’d budgeted for. Is there any flexibility?", short: "When they push back" },
    { id: "pay4", type: "pay-question", text: closing[stage], short: "Asking about the package" },
  ];
}

export interface PayCheck {
  label: string;
  /** null: a note rather than a pass or fail. */
  ok: boolean | null;
  note?: string;
}

const NUMBER_WORDS = /\b(thousand|grand|k|hundred|forty|fifty|sixty|seventy|eighty|ninety|thirty|twenty)\b/;

/** What the checks look for in your words. */
function said(words: Word[]) {
  const text = ` ${words.map((w) => w.text).join(" ").toLowerCase()} `;
  const has = (re: RegExp) => re.test(text);
  const numbers = (text.match(/£?\d[\d,.]*\s?(k|000)?/g) ?? []).length + (has(NUMBER_WORDS) ? 1 : 0);
  return {
    text,
    has,
    figure: numbers > 0,
    range: numbers >= 2 || has(/\b(between|to|from)\b.*\d/) || has(/\b(range|bracket)\b/),
    research: has(/\b(research|market|similar roles?|benchmark|looked at|industry|typical|going rate|levels\.fyi|glassdoor|comparable)\b/),
    package: has(/\b(package|benefits?|bonus|pension|equity|shares|holiday|total|overall)\b/),
    open: has(/\b(flexib\w*|open to|happy to (talk|discuss)|negotia\w*|discuss)\b/),
    apology: has(/\b(sorry|apologi[sz]e|i don.?t know|whatever you think|not sure what|i guess)\b/),
    expectations: has(/\b(looking for|expect\w*|aiming|hoping|worth|my range|the range)\b/),
    asks: has(/\b(could you|would you|can you|how (is|does|do|are|often)|what (is|does|are|would)|when (is|would|do)|is there)\b/) || text.includes("?"),
    payTopics: has(/\b(pay|salary|package|bonus|pension|benefits?|holiday|review|equity|shares|stock|raise|rise)\b/),
  };
}

/**
 * The checks for one answer in the pay drill. pay1: your expectations;
 * pay2: what you earn now; pay3: the push-back; pay4: asking about the package.
 */
export function payChecks(questionId: string, words: Word[], stage: PayStage): PayCheck[] {
  const s = said(words);
  const noApology: PayCheck = { label: "Said it plainly, without apologising", ok: !s.apology };
  switch (questionId) {
    case "pay1":
      return [
        { label: "Gave a range", ok: s.range },
        { label: "Based it on the market, not on your current pay", ok: s.research },
        { label: "Left room for the whole package", ok: s.package || s.open },
        noApology,
      ];
    case "pay2":
      return [
        { label: "Moved to what you’re looking for", ok: s.expectations },
        s.figure
          ? { label: "You shared your current pay", ok: null, note: "That’s your choice. You don’t have to: you can say what you’re looking for instead." }
          : { label: "Kept your current pay to yourself", ok: null, note: "That’s fine. If they press, a range you’re looking for is enough." },
        noApology,
      ];
    case "pay3":
      return [
        { label: "Held your range, or explained why it’s fair", ok: s.range || s.research || s.has(/\b(value|bring|experience|skills)\b/) },
        { label: "Asked about the rest of the package", ok: s.package },
        { label: "Stayed open to a conversation", ok: s.open },
        noApology,
      ];
    default:
      return [
        { label: "Asked a clear question", ok: s.asks },
        { label: stage === "manager" ? "Kept it to how pay is decided, or when you’ll discuss it" : "Asked about the package: pay, bonus, pension or benefits", ok: stage === "manager" ? s.has(/\b(review|decided|stage|process|progression|when)\b/) : s.payTopics },
        noApology,
      ];
  }
}

export function isPayType(type: ContextType): boolean {
  return type === "salary" || type === "pay-question";
}
