import type { Story, Word } from "@/lib/types";

/**
 * The kinds of "tell me about a time…" question nearly every interview asks.
 * Most people need six to eight good stories to cover them all. A story covers
 * a theme when its title, the questions it fits or its text say so; a theme
 * with no story is worth building one for. Safe to import in the browser.
 */

export interface Theme {
  id: string;
  label: string;
  /** The question the story builder practises for it. */
  question: string;
  match: RegExp;
}

export const THEMES: Theme[] = [
  { id: "results", label: "A result you’re proud of", question: "Tell me about an achievement you’re proud of.", match: /\b(grew|grow\w*|increas\w*|improv\w*|rais\w*|cut|reduc\w*|sav\w*|won|record|proud|achiev\w*)\b|\d+%/i },
  { id: "conflict", label: "Disagreement or conflict", question: "Tell me about a time you disagreed with a colleague.", match: /\b(disagree\w*|conflict\w*|push(ed)? back|argu\w*|tension|difficult (person|colleague|manager))\b/i },
  { id: "failure", label: "A mistake or setback", question: "Tell me about a time something went wrong. What did you do?", match: /\b(fail\w*|mistake\w*|missed|setback\w*|went wrong|didn.t go|lost|wrong)\b/i },
  { id: "leadership", label: "Leading or influencing", question: "Tell me about a time you led people or influenced without authority.", match: /\b(led|lead\w*|team of|manag(ed|ing) (a|the) team|mentor\w*|influenc\w*|persuad\w*|convinc\w*)\b/i },
  { id: "change", label: "Changing course", question: "Tell me about a time you had to change your plan.", match: /\b(paus\w*|chang\w*|pivot\w*|switch\w*|moved|moving|adapt\w*|reprioriti\w*|reorg\w*|redesign\w*)\b/i },
  { id: "pressure", label: "Pressure or a deadline", question: "Tell me about a time you worked to a tight deadline.", match: /\b(deadline\w*|pressure|urgent|tight|crisis|outage|incident|rush\w*)\b/i },
  { id: "customer", label: "A customer or stakeholder", question: "Tell me about a time you handled a difficult customer or stakeholder.", match: /\b(customer\w*|client\w*|stakeholder\w*|complain\w*)\b/i },
  { id: "learning", label: "Learning something fast", question: "Tell me about a time you had to learn something quickly.", match: /\b(learn\w*|taught myself|new to|picked up|feedback)\b/i },
];

const storyText = (s: Pick<Story, "title" | "useFor" | "text" | "skill">) => [s.title, ...(s.useFor ?? []), s.skill ?? "", s.text ?? ""].join(" ");

export function themesOf(s: Pick<Story, "title" | "useFor" | "text" | "skill">): string[] {
  const text = storyText(s);
  return THEMES.filter((t) => t.match.test(text)).map((t) => t.id);
}

export const PART_ORDER = ["situation", "task", "action", "result"] as const;
export type Part = (typeof PART_ORDER)[number];

export function missingParts(s: Pick<Story, "parts">): Part[] {
  return PART_ORDER.filter((p) => !s.parts[p]);
}

const STOP = new Set(["about", "after", "again", "their", "there", "these", "those", "which", "while", "with", "from", "into", "that", "this", "your", "when", "what", "time"]);

/** "pausing" and "pause" both become "paus"; "payments" becomes "payme". */
const stem = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(ing|ed|es|s|e)$/, "").slice(0, 5);

/** The words that identify a story in a transcript: the title's longer words, stemmed. */
export function storyKeys(s: Pick<Story, "title">): string[] {
  return [...new Set(s.title.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length >= 5 && !STOP.has(w)).map(stem).filter((w) => w.length >= 4))];
}

/**
 * Whether an answer tells this story: at least two of its title's words.
 * A rough match, used only to say which stories you reach for most.
 */
export function answerTells(s: Pick<Story, "title">, words: Word[]): boolean {
  const keys = storyKeys(s);
  if (keys.length < 2) return false;
  const said = new Set(words.map((w) => stem(w.text)));
  return keys.filter((k) => said.has(k)).length >= 2;
}
