import { type CvDoc, type Entry, type EntrySection, type Locator, type Section, isEntrySection, isListSection, sectionIsEmpty, storable } from "../schema";
import { docWord, formatDates, sectionHeading } from "../sections";
import { type TemplateDef, kindOrder } from "./templates";

/**
 * The CV as it will be printed, in reading order: the name, the contact line,
 * then each section's heading and content. Only what is switched on is here.
 * The paper preview, the PDF, the Word file and the check that reads files
 * back all start from this one list, so they cannot disagree about what the
 * CV says. Every piece carries a pointer to the field it came from.
 */

export interface FlowText {
  text: string;
  bold?: boolean;
  /** A web or email address the text links to. */
  link?: string;
}

export type FlowNode =
  | { kind: "name"; text: string; at: Locator }
  | { kind: "contact"; items: (FlowText & { at: Locator })[] }
  | { kind: "heading"; text: string; sectionId: string; at: Locator }
  /** The first line of an entry: "Archive assistant · Paper Kite Archive". */
  | { kind: "entry"; runs: FlowText[]; sectionId: string; entryId: string; at: Locator }
  /** A paragraph: dates and place, a line about the employer, a profile, a line of skills. */
  | {
      kind: "para";
      runs: FlowText[];
      role: "meta" | "context" | "body";
      sectionId: string;
      entryId?: string;
      at: Locator;
      /** For a letter: the space above this paragraph in points, in place of the CV's own spacing. */
      space?: number;
      /** For a letter: stays on the same page as the paragraph after it (a greeting, a sign-off). */
      keep?: boolean;
    }
  | { kind: "bullet"; text: string; sectionId: string; entryId: string; at: Locator };

export interface Flow {
  nodes: FlowNode[];
  /** "en-GB" or "en-US". */
  lang: string;
  /** "CV" or "Resume". */
  docWord: string;
  /** The document's title: "[Name] – [Target role] – CV", leaving out what is empty. */
  title: string;
  /** Pieces that start a new page: the CV, when it follows a cover letter in the same file. */
  breaks?: number[];
}

/**
 * Every piece of text, without characters that cannot be seen or written to a
 * file. Text is cleaned when it is saved; this is for a CV saved before that,
 * so that the paper, the files and the check still agree about it.
 */
export function printable(nodes: FlowNode[]): FlowNode[] {
  const t = (text: string) => storable(text).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
  return nodes.map((n): FlowNode => {
    if (n.kind === "contact") return { ...n, items: n.items.map((i) => ({ ...i, text: t(i.text) })) };
    if (n.kind === "entry" || n.kind === "para") return { ...n, runs: n.runs.map((r) => ({ ...r, text: t(r.text) })) };
    return { ...n, text: t(n.text) };
  });
}

const SEP = " · ";
const join = (parts: string[]) => parts.map((p) => p.trim()).filter(Boolean).join(SEP);
/**
 * A link as an address a file can open: "linkedin.com/in/x" → "https://linkedin.com/in/x".
 * Only web and email addresses are made into live links. Anything else a person types
 * ("javascript:…", "file:…") is printed as the text it is and opens nothing.
 */
export const href = (link: string): string | undefined => {
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(link)?.[1].toLowerCase();
  if (!scheme) return `https://${link}`;
  return scheme === "http" || scheme === "https" || scheme === "mailto" ? link : undefined;
};

/** The sections in the order they are printed: the person's own order if they set one, else the template's. */
export function paperOrder(cv: Pick<CvDoc, "sections" | "design">, template: TemplateDef): Section[] {
  const kinds = kindOrder(template);
  const byTemplate = [...cv.sections].sort((a, b) => kinds.indexOf(a.kind) - kinds.indexOf(b.kind));
  const own = cv.design.order;
  if (!own?.length) return byTemplate;
  // Sections added since the order was set go where the template would put them, after the ordered ones.
  const listed = own.map((id) => cv.sections.find((s) => s.id === id)).filter((s): s is Section => !!s);
  return [...listed, ...byTemplate.filter((s) => !own.includes(s.id))];
}

/** The first line of an entry, by kind. */
function entryHead(kind: EntrySection["kind"], e: Entry): string {
  if (kind === "education") return join([[e.title, e.subject].filter(Boolean).join(" "), e.org]);
  return join([e.title, e.org]);
}

export function buildFlow(cv: Pick<CvDoc, "contact" | "sections" | "design" | "region" | "target">, template: TemplateDef): Flow {
  const nodes: FlowNode[] = [];
  const region = cv.region;
  const c = cv.contact;
  if (c.fullName.trim()) nodes.push({ kind: "name", text: c.fullName.trim(), at: { section: "contact", field: "fullName" } });
  const items: (FlowText & { at: Locator })[] = [];
  if (c.location.trim()) items.push({ text: c.location.trim(), at: { section: "contact", field: "location" } });
  if (c.email.trim()) items.push({ text: c.email.trim(), link: `mailto:${c.email.trim()}`, at: { section: "contact", field: "email" } });
  if (c.phone.trim()) items.push({ text: c.phone.trim(), at: { section: "contact", field: "phone" } });
  for (const link of c.links) if (link.trim()) items.push({ text: link.trim(), link: href(link.trim()), at: { section: "contact", field: "links" } });
  if (items.length) nodes.push({ kind: "contact", items });

  for (const s of paperOrder(cv, template)) {
    if (!s.visible || sectionIsEmpty(s)) continue;
    const body: FlowNode[] = [];
    const sectionId = s.id;
    if (s.kind === "summary") {
      for (const para of s.text.split(/\n+/)) if (para.trim()) body.push({ kind: "para", role: "body", runs: [{ text: para.trim() }], sectionId, at: { section: s.id, field: "text" } });
    } else if (s.kind === "skills") {
      for (const g of s.groups) {
        const names = g.skills.filter((k) => k.visible && k.name.trim()).map((k) => k.name.trim());
        if (!g.visible || !names.length) continue;
        const runs: FlowText[] = g.name.trim() ? [{ text: `${g.name.trim()}: `, bold: true }, { text: names.join(", ") }] : [{ text: names.join(", ") }];
        body.push({ kind: "para", role: "body", runs, sectionId, entryId: g.id, at: { section: s.id, entry: g.id, field: g.skills[0]?.id } });
      }
    } else if (isListSection(s)) {
      const shown = s.items.filter((i) => i.visible && i.name.trim()).map((i) => (i.level.trim() ? `${i.name.trim()} (${i.level.trim()})` : i.name.trim()));
      if (shown.length) body.push({ kind: "para", role: "body", runs: [{ text: shown.join(", ") }], sectionId, at: { section: s.id, field: s.items[0]?.id } });
    } else if (isEntrySection(s)) {
      for (const e of s.entries) {
        if (!e.visible) continue;
        const bullets = e.bullets.filter((b) => b.visible && b.text.trim());
        const entryId = e.id;
        const at: Locator = { section: s.id, entry: e.id, field: "title" };
        const dates = formatDates(e);
        if (s.kind === "certificates" || s.kind === "awards" || s.kind === "courses" || s.kind === "publications") {
          // One line each: the name, then who gave it and when.
          const rest = join([e.org, dates]);
          const runs: FlowText[] = [];
          if (e.title.trim()) runs.push({ text: e.title.trim(), bold: s.kind !== "publications" });
          if (rest) runs.push({ text: (runs.length ? SEP : "") + rest });
          if (e.link.trim()) runs.push({ text: (runs.length ? SEP : "") + e.link.trim(), link: href(e.link.trim()) });
          if (runs.length) body.push({ kind: "para", role: "body", runs, sectionId, entryId, at });
        } else if (s.kind === "custom" || s.kind === "achievements") {
          if (e.title.trim()) body.push({ kind: "entry", runs: [{ text: e.title.trim(), bold: true }], sectionId, entryId, at });
        } else {
          const head = entryHead(s.kind, e);
          if (head) body.push({ kind: "entry", runs: [{ text: head, bold: true }], sectionId, entryId, at });
          const meta: FlowText[] = [];
          const line = join([dates, s.kind === "education" ? e.grade : "", e.location]);
          if (line) meta.push({ text: line });
          if (e.link.trim()) meta.push({ text: (line ? SEP : "") + e.link.trim(), link: href(e.link.trim()) });
          if (meta.length) body.push({ kind: "para", role: "meta", runs: meta, sectionId, entryId, at: { section: s.id, entry: e.id, field: "start" } });
          if (e.orgInfo.trim()) body.push({ kind: "para", role: "context", runs: [{ text: e.orgInfo.trim() }], sectionId, entryId, at: { section: s.id, entry: e.id, field: "orgInfo" } });
        }
        for (const b of bullets) body.push({ kind: "bullet", text: b.text.trim(), sectionId, entryId, at: { section: s.id, entry: e.id, field: b.id } });
      }
    }
    if (!body.length) continue;
    nodes.push({ kind: "heading", text: sectionHeading(s, region), sectionId, at: { section: s.id } }, ...body);
  }

  const word = region === "us" ? "Resume" : "CV";
  return {
    nodes: printable(nodes),
    lang: region === "us" ? "en-US" : "en-GB",
    docWord: word,
    title: [c.fullName.trim(), cv.target?.title.trim() ?? "", word].filter(Boolean).join(" – "),
  };
}

/** The words a person would read on the paper, piece by piece, in order: what a file must still say when it is read back. */
export function flowText(flow: Flow): string[] {
  return flow.nodes.flatMap((n) => {
    if (n.kind === "name" || n.kind === "heading" || n.kind === "bullet") return [n.text];
    if (n.kind === "contact") return n.items.map((i) => i.text);
    return [n.runs.map((r) => r.text).join("")];
  });
}

export { docWord };
