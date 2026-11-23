import type { CvDoc, Locator } from "../schema";
import { type Flow, type FlowNode, type FlowText, buildFlow, href } from "../render/flow";
import { type Fonts, type Layout, layoutFlow } from "../render/layout";
import { type PaperStyle, paperStyle } from "../render/templates";
import { paragraphText } from "./check";
import { defaultSignoff, greeting } from "./draft";

/**
 * The cover letter as it will be printed, in reading order: the person's name
 * and contact line exactly as on their CV, the date, who it is to, the
 * greeting, the paragraphs, the sign-off and their name. It is the same kind
 * of list the CV is printed from, in the same fonts, colour and margins, so
 * the paper, the PDF, the Word file and the read-back check all work for a
 * letter as they do for a CV.
 */

export type LetterPrintable = Pick<CvDoc, "contact" | "sections" | "design" | "region" | "target" | "letter">;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** A date written out, with the month as a word: "23 November 2026" in the UK, "November 23, 2026" in the US. */
export function longDate(iso: string, region: "uk" | "us"): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const day = Number(m[3]);
  const month = MONTHS[Number(m[2]) - 1];
  return region === "us" ? `${month} ${day}, ${m[1]}` : `${day} ${month} ${m[1]}`;
}

/** Today as "2026-11-23", in the clock's own time zone. */
export const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Space above the pieces of a letter, in points. */
const GAP = { block: 20, line: 0, para: 10.5 };

/** `today` is used when the letter has no date of its own: "2026-11-23". */
export function letterFlow(cv: LetterPrintable, today: string): Flow {
  const nodes: FlowNode[] = [];
  const c = cv.contact;
  const letter = cv.letter;
  const sectionId = "letter";
  if (c.fullName.trim()) nodes.push({ kind: "name", text: c.fullName.trim(), at: { section: "contact", field: "fullName" } });
  const items: (FlowText & { at: Locator })[] = [];
  if (c.location.trim()) items.push({ text: c.location.trim(), at: { section: "contact", field: "location" } });
  if (c.email.trim()) items.push({ text: c.email.trim(), link: `mailto:${c.email.trim()}`, at: { section: "contact", field: "email" } });
  if (c.phone.trim()) items.push({ text: c.phone.trim(), at: { section: "contact", field: "phone" } });
  for (const link of c.links) if (link.trim()) items.push({ text: link.trim(), link: href(link.trim()), at: { section: "contact", field: "links" } });
  if (items.length) nodes.push({ kind: "contact", items });

  const paragraphs = (letter?.paragraphs ?? []).map((p) => ({ id: p.id, text: paragraphText(p).trim() })).filter((p) => p.text);
  const line = (text: string, field: string, space: number, keep = false): FlowNode => ({ kind: "para", role: "body", runs: [{ text }], sectionId, at: { section: "letter", field }, space, keep: keep || undefined });
  if (paragraphs.length) {
    const date = longDate(letter?.date || today, cv.region);
    if (date) nodes.push(line(date, "date", GAP.block));
    const to = [letter?.recipient.trim() ?? "", cv.target?.employer.trim() ?? ""].filter(Boolean);
    to.forEach((text, i) => nodes.push(line(text, "recipient", i ? GAP.line : GAP.block, true)));
    nodes.push(line(greeting(letter?.recipient ?? ""), "greeting", GAP.block, true));
    for (const p of paragraphs) nodes.push({ kind: "para", role: "body", runs: [{ text: p.text }], sectionId, at: { section: "letter", entry: p.id }, space: GAP.para });
    const signoff = (letter?.signoff.trim() || defaultSignoff(cv.region, letter?.recipient ?? "")).replace(/,+$/, "");
    nodes.push(line(`${signoff},`, "signoff", GAP.block, !!c.fullName.trim()));
    if (c.fullName.trim()) nodes.push(line(c.fullName.trim(), "name", GAP.para));
  }

  return {
    nodes,
    lang: cv.region === "us" ? "en-US" : "en-GB",
    docWord: "Cover letter",
    title: [c.fullName.trim(), cv.target?.title.trim() ?? "", "Cover Letter"].filter(Boolean).join(" – "),
  };
}

/** The letter followed by the CV in one document: the CV starts on a new page. */
export function joinFlows(letter: Flow, cv: Flow): Flow {
  return {
    nodes: [...letter.nodes, ...cv.nodes],
    lang: letter.lang,
    docWord: `Cover letter and ${cv.docWord}`,
    title: letter.title.replace(/Cover Letter$/, `Cover Letter and ${cv.docWord}`),
    breaks: cv.nodes.length && letter.nodes.length ? [letter.nodes.length] : [],
  };
}

export interface LetterPaper {
  flow: Flow;
  layout: Layout;
  style: PaperStyle;
}

/** The letter on pages, in the CV's own template, fonts, colour, paper size and spacing. */
export function layoutLetter(cv: LetterPrintable, fonts: Fonts, today: string, withCv = false): LetterPaper {
  const style = paperStyle(cv.design);
  const own = letterFlow(cv, today);
  const flow = withCv ? joinFlows(own, buildFlow(cv, style.template)) : own;
  return { flow, layout: layoutFlow(flow, style, fonts), style };
}

export interface LetterFit {
  pages: number;
  /** The letter is meant to fill one page. */
  fits: boolean;
  /** The first paragraph with a line on the second page: the one to shorten. */
  over: Locator | null;
  /** Lines that ran past the first page. */
  linesOver: number;
}

/** Whether the letter fits its one page and, if not, which paragraph crosses the boundary. */
export function letterFit(layout: Layout): LetterFit {
  const body = layout.blocks.filter((b) => b.at.section === "letter");
  const pages = body.length ? Math.max(...body.flatMap((b) => b.lines.map((l) => l.page))) + 1 : 1;
  const crossing = body.find((b) => b.lines.some((l) => l.page >= 1));
  // The paragraph to work on is a real paragraph: if only the sign-off fell over, it is the last paragraph before it.
  const paragraphs = body.filter((b) => !!b.at.entry);
  const over = !crossing ? null : crossing.at.entry ? crossing.at : (paragraphs[paragraphs.length - 1]?.at ?? null);
  return { pages, fits: pages <= 1, over, linesOver: body.reduce((n, b) => n + b.lines.filter((l) => l.page >= 1).length, 0) };
}
