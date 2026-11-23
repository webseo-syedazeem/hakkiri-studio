import { type Contact, type EntryKind, type ListItem, type Locator, type Section, type SectionKind, type SkillGroup, cvStrings, emptySection, isEntrySection, isListSection, newId } from "../schema";
import { SECTION_DEFS } from "../sections";
import { type FlagDraft, type Sources, parseContact } from "./contact";
import { DATE_WORD } from "./dates";
import { type EntryContext, parseCustom, parseEducation, parseProjects, parseRoles, parseSimple } from "./entries";
import { type HeadingHit, findHeadings, headingKey } from "./headings";
import { PRIVATE_DETAIL } from "./lexicon";
import { type DocLine, plain, wordCount } from "./lines";

/** One line of the file's text, as shown beside the fields when the person checks what was read. */
export interface SourceLine {
  text: string;
  page: number;
  bullet: boolean;
  heading: boolean;
}

export interface ParsedFlag {
  id: string;
  at: Locator;
  /** A short machine name for the kind of doubt ("no-dates", "title-or-employer"…). */
  code: string;
  /** What the person should check, in plain words. */
  message: string;
  /** The lines of the file the doubt is about. */
  lines: number[];
}

export interface ParsedCv {
  contact: Contact;
  sections: Section[];
  flags: ParsedFlag[];
  /** Which lines of the file each field came from. Keys are whereKey(section, entry, field). */
  where: Sources;
  /** Lines from the file that ended up nowhere in the CV. Shown to the person; never silently dropped. */
  unassigned: { line: number; text: string }[];
  /** Lines deliberately not brought in (date of birth, "references on request"), each with the reason. */
  omitted: { text: string; reason: string; line: number }[];
  /** The file's text, line by line. Every number above points into this list. */
  lines: SourceLine[];
  /** The file is LinkedIn's own "Save to PDF". */
  linkedin: boolean;
}

/** The key for a place in the CV in the `where` map: a contact field, an entry's field, a bullet, a skill. */
export const whereKey = (section: string, entry = "", field = "") => `${section}/${entry}/${field}`;

/* ------------------------------------------------------------ page furniture */

const FURNITURE = /^(?:page\s+)?\d{1,2}(?:\s*(?:of|\/)\s*\d{1,2})?$|^page\s+\d+$|^-\s*\d+\s*-$|^(?:continued|cont\.?d?)(?:\s+(?:on next page|overleaf))?\.{0,3}$/i;

/** LinkedIn's PDF: a profile address tagged "(LinkedIn)", its "Top Skills" box and "Page 1 of 2" footers. */
export function looksLikeLinkedIn(lines: DocLine[]): boolean {
  const all = lines.map((l) => plain(l));
  const hasProfile = all.some((t) => /linkedin\.com\/in\//i.test(t)) && all.some((t) => /\(LinkedIn\)/.test(t));
  return hasProfile && (all.some((t) => /^Top Skills$/i.test(t)) || all.some((t) => /^Page \d+ of \d+$/i.test(t)));
}

/* -------------------------------------------------------------------- skills */

const LIST_SEP = /\t|\s*[,;|•●▪∙⋅·]\s*|\s+[–—]\s+/;
const clean = (s: string) => s.replace(/^[\s,;:.–-]+|[\s,;:.–-]+$/g, "").trim();
/** Splits on separators, but not inside brackets: "Languages (French, Spanish), SQL". */
function splitList(text: string, dashes = true): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const t of text.split(dashes ? /(\t|[,;|•●▪∙⋅·]|\s[–—]\s|[()])/ : /(\t|[,;|•●▪∙⋅·]|[()])/)) {
    if (t === "(") depth++;
    if (t === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && t !== ")" && t.trim().length <= 1 && LIST_SEP.test(t)) {
      out.push(cur);
      cur = "";
    } else cur += t;
  }
  out.push(cur);
  return out.map(clean).filter(Boolean);
}

function parseSkills(lines: DocLine[], groupName: string, sectionId: string): { groups: SkillGroup[]; flags: FlagDraft[]; sources: Sources } {
  const groups: SkillGroup[] = [];
  const flags: FlagDraft[] = [];
  const sources: Sources = {};
  const group = (name: string, l: DocLine): SkillGroup => {
    const found = groups.find((g) => g.name.toLowerCase() === name.toLowerCase());
    if (found) return found;
    const g: SkillGroup = { id: newId("g_"), name, visible: true, skills: [] };
    groups.push(g);
    if (name) sources[whereKey(sectionId, g.id, "name")] = [l.n];
    return g;
  };
  let current = groupName;
  let labelLine: DocLine | null = null;
  lines.forEach((l, i) => {
    const text = plain(l);
    if (!text) return;
    const labelled = text.match(/^([^:,;|]{2,40}):\s*(.*)$/);
    let items: string[];
    let into = current;
    if (labelled) {
      into = clean(labelled[1]);
      items = splitList(labelled[2]);
      if (!items.length) {
        // "Tools:" on a line of its own names the lines that follow.
        current = into;
        labelLine = l;
        return;
      }
    } else if (!l.bullet && l.bold && wordCount(text) <= 4 && !LIST_SEP.test(text) && lines[i + 1] && !lines[i + 1].bold) {
      current = text;
      labelLine = l;
      return;
    } else items = splitList(l.text);
    const g = group(into, labelled || !labelLine ? l : labelLine);
    for (const name of items) {
      if (g.skills.length >= 40) break;
      const skill = { id: newId("k_"), name: name.slice(0, 80), visible: true };
      g.skills.push(skill);
      sources[whereKey(sectionId, "", skill.id)] = [l.n];
      if (wordCount(name) > 7) flags.push({ section: sectionId, field: skill.id, code: "long-skill", message: "This reads as a sentence, not a skill. Shorten it or move it to a role.", lines: [l.n] });
    }
  });
  return { groups: groups.filter((g) => g.skills.length), flags, sources };
}

function parseList(lines: DocLine[], kind: "languages" | "interests", sectionId: string): { items: ListItem[]; sources: Sources } {
  const items: ListItem[] = [];
  const sources: Sources = {};
  for (const l of lines) {
    const text = plain(l);
    // In a language list a dash joins the language to its level: "French – B1".
    const pieces = kind === "interests" && wordCount(text) > 14 && !/[,;|•]/.test(text) ? [text] : splitList(l.text, kind !== "languages");
    for (const p of pieces) {
      if (items.length >= 40) break;
      const m = kind === "languages" ? p.match(/^(.+?)\s*(?:\(([^()]+)\)|[:–—-]\s*(.+))$/) : null;
      const item = { id: newId("i_"), name: clean(m ? m[1] : p).slice(0, 120), level: clean(m ? (m[2] ?? m[3] ?? "") : "").slice(0, 60), visible: true };
      if (!item.name) continue;
      items.push(item);
      sources[whereKey(sectionId, "", item.id)] = [l.n];
    }
  }
  return { items, sources };
}

/* --------------------------------------------------------- nothing gets lost */

/** Labels and web address parts that are tidied away, not content. */
const IGNORED = new Set(["https", "http", "www", "email", "e", "mail", "phone", "telephone", "tel", "mobile", "mob", "cell", "m", "t", "p", "a", "w", "l", "address", "location", "linkedin", "website", "web", "portfolio", "github", "url", "profile", "graduated", "graduating", "graduation", "completed", "completion", "class", "of", "due", "grade", "result", "in", "at", "by", "issued", "awarded", "based", "contact", "number"]);
const words = (s: string) => (s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => !DATE_WORD.test(w) && !IGNORED.has(w));
/** Where one piece of a line ends and the next begins: the reader may put each piece in a different box. */
const CHUNK = /\t|[|·•●▪∙⋅,;:()[\]–—]|\s-\s|[.!?]\s|\s+(?:at|by|from)\s+/;

const everyString = (contact: Contact, sections: Section[], omitted: { text: string }[]): string[] => [...cvStrings({ contact, sections }), ...omitted.map((o) => o.text)];

/**
 * Checks every line of the file against what was put in the CV. Each piece of
 * a line must appear, word for word, somewhere in the CV; and no word may
 * appear fewer times in the CV than in the file. A line the reader never
 * placed fails outright. What fails is returned (the whole line, or just the
 * piece that is missing), so the person sees it as unassigned text instead of
 * losing it.
 */
export function unplacedLines(lines: DocLine[], skip: Set<number>, placed: Set<number>, contact: Contact, sections: Section[], omitted: { text: string }[]): { line: number; text: string }[] {
  const strings = everyString(contact, sections, omitted);
  // Fields that sat side by side in the file ("BSc Computer Science", "French – B1") are also checked joined up.
  const joined = sections.flatMap((s) => (isEntrySection(s) ? s.entries.flatMap((e) => [`${e.title} ${e.subject}`, `${e.title} ${e.org}`, `${e.org} ${e.title}`, `${e.org} ${e.location}`]) : isListSection(s) ? s.items.map((i) => `${i.name} ${i.level}`) : []));
  const corpus = ` ${[...strings, ...joined].flatMap((s) => s.split(CHUNK)).map((s) => words(s).join(" ")).filter(Boolean).join(" | ")} `;
  const have = new Map<string, number>();
  for (const s of strings) for (const w of words(s)) have.set(w, (have.get(w) ?? 0) + 1);

  const lost = new Map<number, string>();
  const need = new Map<string, number>();
  const lastAt = new Map<string, number>();
  lines.forEach((l, i) => {
    if (skip.has(i)) return;
    const text = plain(l);
    const pieces = text.split(CHUNK).map((raw) => ({ raw: raw.trim(), key: words(raw).join(" ") })).filter((p) => p.key);
    if (!pieces.length) return;
    // A line the reader never put anywhere is reported whole.
    if (!placed.has(i)) {
      lost.set(i, text);
      return;
    }
    // A line with a piece that is not in the CV: report that piece.
    const missing = pieces.filter((p) => !corpus.includes(` ${p.key} `));
    if (missing.length) {
      lost.set(i, missing.length === pieces.length ? text : missing.map((p) => p.raw).join(", "));
      return;
    }
    for (const w of pieces.map((p) => p.key).join(" ").split(" ")) {
      need.set(w, (need.get(w) ?? 0) + 1);
      lastAt.set(w, i);
    }
  });
  // A word used more often in the file than in the CV: one of its lines was dropped.
  for (const [w, n] of need) {
    const at = lastAt.get(w)!;
    if (n > (have.get(w) ?? 0) && !lost.has(at)) lost.set(at, plain(lines[at]));
  }
  return [...lost.entries()].sort((a, b) => a[0] - b[0]).map(([line, text]) => ({ line, text }));
}

/* ---------------------------------------------------------------- the reader */

const KEEP_TITLE: SectionKind[] = ["volunteering", "custom", "achievements", "projects", "awards", "certificates", "publications", "courses"];
const PRIVATE_REASON = "Personal details such as date of birth or nationality are not needed on a CV.";
const REFERENCES_REASON = "References are not needed on a CV. Employers ask for them later.";

/**
 * Turns the lines of a CV into a structured CV. Text is only ever sorted into
 * boxes: nothing is reworded and nothing is added. Where the reader is unsure
 * (which is the title and which the employer, missing dates, a paragraph split
 * into bullets) it says so with a flag on that exact place, and every field
 * keeps a pointer to the lines of the file it was read from.
 */
export function parseCv(input: DocLine[], opts: { linkedin?: boolean } = {}): ParsedCv {
  const lines = input.filter((l) => plain(l) && !FURNITURE.test(plain(l))).map((l, n) => ({ ...l, n }));
  const linkedin = opts.linkedin ?? looksLikeLinkedIn(lines);
  const ctx: EntryContext = { linkedin };
  const headings = findHeadings(lines);
  const consumed = new Set<number>(headings.keys());
  const order = [...headings.keys()].sort((a, b) => a - b);
  // A "Curriculum Vitae" banner is not a section: the name and contact lines carry on beneath it.
  const firstHeading = order.find((i) => headings.get(i)!.kind !== "title") ?? lines.length;

  // Blocks of lines under each heading. Inline headings ("Skills: SQL, Python") carry their content on the same line.
  interface Block {
    hit: HeadingHit;
    lines: DocLine[];
  }
  const blocks: Block[] = order.map((at, i) => {
    const hit = headings.get(at)!;
    const body = lines.slice(at + 1, i + 1 < order.length ? order[i + 1] : lines.length);
    return { hit, lines: hit.inline ? [{ ...lines[at], text: hit.inline, bold: false, bullet: false }, ...body] : body };
  });
  // An inline heading's own line holds content, so it must pass the lost-text check too.
  for (const [at, hit] of headings) if (hit.inline) consumed.delete(at);

  const flagDrafts: FlagDraft[] = [];
  const omitted: ParsedCv["omitted"] = [];
  const where: Sources = {};
  // Lines that never belong in a CV, wherever they sit in the file.
  const drop = new Set<number>();
  lines.forEach((l, i) => {
    if (headings.has(i)) return;
    const text = plain(l);
    if (PRIVATE_DETAIL.test(text)) {
      omitted.push({ text, reason: PRIVATE_REASON, line: l.n });
      drop.add(l.n);
    } else if (/^references?\b.{0,40}\b(?:on|upon) request\.?$/i.test(text)) {
      omitted.push({ text, reason: REFERENCES_REASON, line: l.n });
      drop.add(l.n);
    }
  });
  for (const b of blocks) b.lines = b.lines.filter((l) => !drop.has(l.n));

  const sections: Section[] = [];
  const sectionFor = (kind: SectionKind, title: string): Section => {
    if (kind !== "custom") {
      const found = sections.find((s) => s.kind === kind);
      if (found) return found;
    }
    const std = SECTION_DEFS[kind].heading;
    const keep = KEEP_TITLE.includes(kind) && ![headingKey(std.uk), headingKey(std.us)].includes(headingKey(title));
    const s = emptySection(kind, keep ? title.slice(0, 60) : "");
    sections.push(s);
    return s;
  };

  // Contact: the lines above the first heading, plus any under a "Contact" heading.
  const contactLines = [...lines.slice(0, firstHeading).filter((l) => !drop.has(l.n) && !headings.has(l.n)), ...blocks.filter((b) => b.hit.kind === "contact").flatMap((b) => b.lines)];
  const c = parseContact(contactLines);
  flagDrafts.push(...c.flags);
  omitted.push(...c.omitted);
  for (const [field, at] of Object.entries(c.sources)) where[whereKey("contact", "", field)] = at;

  const summaryLines: DocLine[] = [...c.summary];
  let summaryBulleted = false;
  const skillBlocks = blocks.filter((b) => b.hit.kind === "skills").length;

  for (const b of blocks) {
    const kind = b.hit.kind;
    if (kind === "contact" || kind === "title") continue;
    if (kind === "references") {
      for (const l of b.lines) omitted.push({ text: plain(l), reason: REFERENCES_REASON, line: l.n });
      continue;
    }
    if (!b.lines.length) continue;
    if (kind === "summary") {
      summaryLines.push(...b.lines);
      summaryBulleted ||= b.lines.some((l) => l.bullet);
      sectionFor("summary", "");
      continue;
    }
    const section = sectionFor(kind, b.hit.title);
    if (section.kind === "skills") {
      // "Technical skills" and "Soft skills" as separate headings become named groups.
      const name = skillBlocks > 1 && headingKey(b.hit.title) !== "skills" ? b.hit.title : "";
      const r = parseSkills(b.lines, name, section.id);
      section.groups.push(...r.groups);
      flagDrafts.push(...r.flags);
      Object.assign(where, r.sources);
    } else if (section.kind === "languages" || section.kind === "interests") {
      const r = parseList(b.lines, section.kind, section.id);
      section.items.push(...r.items);
      Object.assign(where, r.sources);
    } else if (isEntrySection(section)) {
      const k = section.kind as EntryKind;
      const r =
        k === "experience" || k === "volunteering"
          ? parseRoles(b.lines, ctx)
          : k === "education"
            ? parseEducation(b.lines, ctx)
            : k === "projects"
              ? parseProjects(b.lines, ctx)
              : k === "custom" || k === "achievements"
                ? parseCustom(b.lines)
                : parseSimple(b.lines, k);
      section.entries.push(...r.entries.slice(0, 40 - section.entries.length));
      flagDrafts.push(...r.flags.map((f) => ({ ...f, section: section.id })));
      for (const [key, at] of Object.entries(r.sources)) where[`${section.id}/${key}`] = at;
      if (!b.hit.known) flagDrafts.push({ section: section.id, code: "unknown-section", message: `We weren’t sure what “${b.hit.title}” is, so we’ve kept it as its own section. Check it’s in the right place.`, lines: b.lines.slice(0, 1).map((l) => l.n - 1) });
    }
  }

  if (summaryLines.length) {
    let summary: Section | undefined = sections.find((s) => s.kind === "summary");
    if (!summary) {
      summary = emptySection("summary");
      sections.unshift(summary);
    }
    if (summary.kind === "summary") {
      summary.text = summaryLines.map((l) => plain(l)).join(summaryBulleted || c.summary.length > 1 ? "\n" : " ").slice(0, 2000);
      where[whereKey(summary.id, "", "text")] = summaryLines.map((l) => l.n);
    }
  }

  // Sections stay in the order the person had them; core sections they didn't have are added, empty.
  const kept = sections.filter((s) => !(s.kind === "custom" && isEntrySection(s) && s.entries.length === 0));
  for (const kind of ["summary", "experience", "education", "skills"] as SectionKind[]) {
    if (!kept.some((s) => s.kind === kind)) {
      const s = emptySection(kind);
      if (kind === "summary") kept.unshift(s);
      else kept.push(s);
    }
  }

  const placed = new Set<number>([...Object.values(where).flat(), ...omitted.map((o) => o.line)]);
  const unassigned = unplacedLines(lines, consumed, placed, c.contact, kept, omitted).slice(0, 200);
  const live = new Set(kept.map((s) => s.id));
  const flags: ParsedFlag[] = flagDrafts
    .filter((f) => f.section === "contact" || live.has(f.section))
    .slice(0, 200)
    .map((f) => ({ id: newId("f_"), at: { section: f.section, entry: f.entry, field: f.field }, code: f.code, message: f.message, lines: (f.lines ?? []).filter((n) => n >= 0) }));

  return {
    contact: c.contact,
    sections: kept,
    flags,
    where,
    unassigned,
    omitted: omitted.slice(0, 50),
    lines: lines.slice(0, 1500).map((l, i) => ({ text: plain(l).slice(0, 1000), page: l.page, bullet: l.bullet, heading: headings.has(i) && !headings.get(i)!.inline })),
    linkedin,
  };
}
