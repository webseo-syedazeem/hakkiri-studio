import type { SectionKind } from "../schema";
import { type DocLine, isAllCaps, plain, wordCount } from "./lines";

/** What a heading in an uploaded CV introduces. "contact" and "references" are handled specially; "title" is the "Curriculum Vitae" banner. */
export type HeadingKind = SectionKind | "contact" | "references" | "title";

const H: [HeadingKind, string[]][] = [
  ["summary", ["summary", "professional summary", "executive summary", "career summary", "personal summary", "summary of qualifications", "profile", "personal profile", "professional profile", "career profile", "personal statement", "about me", "about", "objective", "career objective", "professional objective", "overview", "career overview", "introduction", "bio"]],
  ["experience", ["experience", "work experience", "professional experience", "relevant experience", "employment", "employment history", "employment experience", "work history", "career history", "professional history", "career experience", "professional background", "career", "positions held", "work", "industry experience", "internships", "internship experience", "experience and internships", "relevant work experience", "additional experience", "other experience", "freelance experience", "teaching experience", "research experience", "clinical experience", "military experience"]],
  ["education", ["education", "education and qualifications", "education and training", "qualifications", "academic qualifications", "academic background", "academic history", "educational background", "education history", "academic record", "academics", "education and certifications", "education and credentials"]],
  ["skills", ["skills", "key skills", "core skills", "technical skills", "professional skills", "relevant skills", "skills and expertise", "skills and abilities", "skills and competencies", "core competencies", "competencies", "key competencies", "areas of expertise", "expertise", "technical expertise", "technical proficiencies", "technologies", "tools", "tools and technologies", "skills and tools", "it skills", "computer skills", "software", "software skills", "top skills", "skills summary", "strengths", "key strengths", "hard skills", "soft skills", "additional skills", "other skills", "skills and interests", "technical skills and tools"]],
  ["projects", ["projects", "key projects", "selected projects", "personal projects", "academic projects", "side projects", "notable projects", "project experience", "relevant projects", "portfolio", "open source", "open source contributions"]],
  ["volunteering", ["volunteering", "volunteer experience", "volunteer work", "voluntary work", "voluntary experience", "volunteer", "community involvement", "community service", "involvement", "extracurricular activities", "extra curricular activities", "extracurricular", "activities", "leadership", "leadership experience", "leadership and activities", "positions of responsibility", "societies", "clubs and societies", "charity work"]],
  ["certificates", ["certificates", "certifications", "certification", "licences", "licenses", "licences and certifications", "licenses and certifications", "certifications and licenses", "certifications and licences", "professional certifications", "professional qualifications", "accreditations", "professional development", "training", "training and certifications", "credentials", "professional memberships", "memberships", "affiliations", "professional affiliations"]],
  ["awards", ["awards", "honours", "honors", "awards and honours", "awards and honors", "honors and awards", "honours and awards", "honors awards", "awards and achievements", "achievements and awards", "scholarships", "awards and scholarships", "recognition", "prizes"]],
  ["achievements", ["achievements", "key achievements", "selected achievements", "career achievements", "accomplishments", "key accomplishments", "career highlights", "highlights", "selected highlights"]],
  ["publications", ["publications", "selected publications", "papers", "research", "research and publications", "publications and presentations", "presentations", "talks", "conferences", "patents", "press"]],
  ["courses", ["courses", "coursework", "relevant coursework", "relevant courses", "relevant modules", "modules", "online courses", "short courses", "courses and training", "continuing education"]],
  ["languages", ["languages", "language skills", "language proficiency", "languages spoken"]],
  ["interests", ["interests", "hobbies", "hobbies and interests", "interests and hobbies", "personal interests", "interests and activities", "activities and interests", "outside work"]],
  ["contact", ["contact", "contact details", "contact information", "contact info", "personal details", "personal information", "details", "get in touch"]],
  ["references", ["references", "referees", "reference"]],
  ["custom", ["additional information", "additional info", "other information", "further information", "other", "miscellaneous", "additional", "additional details"]],
  ["title", ["curriculum vitae", "cv", "resume", "résumé"]],
];

const HEADINGS = new Map<string, HeadingKind>();
for (const [kind, names] of H) for (const n of names) HEADINGS.set(n, kind);

/** A heading reduced to its words: lower case, "&" as "and", no punctuation or trailing colon. */
export function headingKey(text: string): string {
  return plain(text)
    .toLowerCase()
    .replace(/&|\+|\//g, " and ")
    .replace(/[^a-zà-ÿ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The kind of section a standard heading introduces, or null if the text is not a known heading. */
export function knownHeading(text: string): HeadingKind | null {
  return HEADINGS.get(headingKey(text)) ?? null;
}

/**
 * Names that are also ordinary words in a CV ("Leadership" in a list of skills,
 * "Research" as a line of its own). They count as headings only when they look
 * like the file's other headings.
 */
const WEAK = new Set(["leadership", "research", "training", "software", "tools", "activities", "involvement", "presentations", "talks", "press", "strengths", "work", "career", "details", "other", "additional", "about", "bio", "overview", "expertise", "technologies", "memberships", "affiliations", "recognition", "portfolio", "volunteer", "modules", "conferences", "patents", "papers", "accomplishments", "highlights", "introduction", "extracurricular", "prizes", "scholarships", "societies", "open source", "internships", "academics", "cv", "resume", "reference"]);

export interface HeadingHit {
  kind: HeadingKind;
  /** True for a name that is also an ordinary word; see WEAK. */
  weak?: boolean;
  /** The heading as written, tidied. */
  title: string;
  /** Text on the same line after "Skills:", if any. */
  inline: string;
  /** False when the heading is not one of the standard names. */
  known: boolean;
}

/** How a line looks, to compare lines with each other: size, weight, capitals. */
export const styleKey = (l: DocLine) => `${Math.round(l.size * 2) / 2}|${l.bold ? "b" : ""}|${isAllCaps(plain(l)) ? "c" : ""}|${l.heading || ""}`;

/**
 * Whether a line is a standard section heading: a whole line such as
 * "PROFESSIONAL EXPERIENCE", or "Skills: SQL, Python" with the content after a colon.
 * Bullets are never headings.
 */
export function standardHeading(l: DocLine): HeadingHit | null {
  if (l.bullet) return null;
  const text = plain(l);
  if (wordCount(text) <= 6) {
    const kind = knownHeading(text);
    if (kind) return { kind, title: text.replace(/[:\s]+$/, ""), inline: "", known: true, weak: WEAK.has(headingKey(text)) };
  }
  const colon = text.match(/^([A-Za-z&/+ ]{3,40}):\s*(\S.*)$/);
  if (colon) {
    const kind = knownHeading(colon[1]);
    // Only list-like sections are written this way; "Experience: 5 years" is a sentence, not a heading.
    if (kind && ["skills", "languages", "interests", "certificates", "courses"].includes(kind)) return { kind, title: colon[1].trim(), inline: colon[2].trim(), known: true, weak: WEAK.has(headingKey(colon[1])) };
  }
  return null;
}

const tidyTitle = (s: string) => (isAllCaps(s) ? s.charAt(0) + s.slice(1).toLowerCase() : s).replace(/[:\s]+$/, "");

/**
 * Finds the headings in a document. Standard headings are recognised by name.
 * A line with an unfamiliar name is also taken as a heading when it looks
 * exactly like the standard ones in the same file (same size, weight and
 * capitals) and that look is not used for ordinary lines.
 */
export function findHeadings(lines: DocLine[]): Map<number, HeadingHit> {
  const hits = new Map<number, HeadingHit>();
  const weak = new Map<number, HeadingHit>();
  lines.forEach((l, i) => {
    const h = standardHeading(l);
    if (h) (h.weak ? weak : hits).set(i, h);
  });

  // The look shared by the standard headings that were not written inline.
  const looks = new Map<string, number>();
  for (const [i, h] of hits) if (!h.inline && h.kind !== "title") looks.set(styleKey(lines[i]), (looks.get(styleKey(lines[i])) ?? 0) + 1);
  const [look, count] = [...looks.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  const sameLook = lines.filter((l) => styleKey(l) === look).length;
  const marked = look.split("|").some((p, idx) => idx > 0 && p) || lines.some((l) => l.size && Math.round(l.size * 2) / 2 < Number(look.split("|")[0]));
  // The look is only a signal if the headings share it and ordinary lines don't.
  const distinct = count >= 2 && marked && sameLook <= count + 6;

  for (const [i, h] of weak) {
    const l = lines[i];
    const text = plain(l);
    if (distinct ? styleKey(l) === look : isAllCaps(text) || /:$/.test(text) || l.heading > 0) hits.set(i, h);
  }
  // Inside a skills section, "Tools: Excel, SQL" is a named group of skills, not a new section.
  let within: HeadingKind | null = null;
  for (const i of [...hits.keys()].sort((a, b) => a - b)) {
    const h = hits.get(i)!;
    if (!h.inline) within = h.kind;
    else if (within === "skills" || within === h.kind) hits.delete(i);
  }
  const inOrder = () => new Map([...hits.entries()].sort((a, b) => a[0] - b[0]));
  if (!distinct) return inOrder();

  // Where capitals are the only thing marking a heading, a short word in capitals ("SQL", "AWS") is not one.
  const capsOnly = look.split("|").slice(1).join("") === "c" && !Number(look.split("|")[0]);
  const first = Math.min(...hits.keys());
  lines.forEach((l, i) => {
    if (hits.has(i) || l.bullet || styleKey(l) !== look) return;
    const text = plain(l);
    if (wordCount(text) > 5 || text.length < 3 || /[.,;]$/.test(text) || /\d{4}|@/.test(text)) return;
    if (capsOnly && (wordCount(text) < 2 || text.replace(/[^A-Za-z]/g, "").length < 8)) return;
    // Not before the first standard heading: that is the name and contact block.
    if (i < first) return;
    hits.set(i, { kind: "custom", title: tidyTitle(text), inline: "", known: false });
  });
  return inOrder();
}
