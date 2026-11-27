import type { CvLevel, CvRegion } from "../schema";
import type { CvImport } from "./record";

/**
 * Upload first (design spec v3 §01): the CV's name, UK or US, and level are
 * read from the file instead of asked before it. Each is either worked out
 * from clear evidence or left as unknown for the person to set: a conflict or
 * too little evidence is never silently chosen as a fact.
 */

export interface Inferred {
  /** A name for the CV: the person's name and latest role, or the file's name. Always set; the person may rename it. */
  name: string;
  region: CvRegion | null;
  level: CvLevel | null;
  /** Why each was or wasn't worked out, in plain words. */
  why: { region: string; level: string };
}

const US_WORDS = /\b(resume|color|colors|organize[ds]?|organizing|organization|center|centers|analyze[ds]?|analyzing|behavior|favorite|program manager|labor|license[ds]?|optimize[ds]?|utilize[ds]?|prioritize[ds]?|GPA)\b/gi;
const UK_WORDS = /\b(CV|curriculum vitae|colour|colours|organise[ds]?|organising|organisation|centre|centres|analyse[ds]?|analysing|behaviour|favourite|programme|labour|licence|optimise[ds]?|utilise[ds]?|prioritise[ds]?|GCSEs?|A[- ]levels?)\b/gi;
const UK_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/;
const US_ZIP_STATE = /,\s?(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b(\s\d{5})?/;

function regionFrom(text: string, phone: string): { region: CvRegion | null; why: string } {
  let uk = (text.match(UK_WORDS) ?? []).length;
  let us = (text.match(US_WORDS) ?? []).length;
  if (/^\s*\+?44|^\s*0\d{4}\s?\d{6}|^\s*07\d{3}/.test(phone)) uk += 3;
  if (/^\s*\+?1[\s(-]|^\s*\(\d{3}\)/.test(phone)) us += 3;
  if (UK_POSTCODE.test(text)) uk += 2;
  if (US_ZIP_STATE.test(text)) us += 2;
  if (uk >= 2 && us === 0) return { region: "uk", why: "UK spelling and details in your file." };
  if (us >= 2 && uk === 0) return { region: "us", why: "US spelling and details in your file." };
  if (uk >= us + 3) return { region: "uk", why: "Mostly UK spelling and details in your file." };
  if (us >= uk + 3) return { region: "us", why: "Mostly US spelling and details in your file." };
  return { region: null, why: uk || us ? "Your file mixes UK and US conventions." : "Your file doesn’t show whether it’s for the UK or the US." };
}

const yearOf = (d: string) => (/^\d{4}/.test(d) ? Number(d.slice(0, 4)) : null);

function levelFrom(imp: Pick<CvImport, "draft">, nowYear: number): { level: CvLevel | null; why: string } {
  const work = imp.draft.sections.filter((s) => s.kind === "experience");
  const entries = work.flatMap((s) => ("entries" in s ? s.entries : []));
  const starts = entries.map((e) => yearOf(e.start)).filter((y): y is number => y != null && y > 1950 && y <= nowYear);
  const titles = entries.map((e) => e.title.toLowerCase()).join(" ");
  if (!entries.length) {
    const studying = imp.draft.sections.some((s) => s.kind === "education" && "entries" in s && s.entries.length > 0);
    return studying ? { level: "student", why: "Your file has education and no work history." } : { level: null, why: "Your file has no dated work history to go by." };
  }
  if (!starts.length) return { level: null, why: "Your roles have no dates we could read." };
  const years = nowYear - Math.min(...starts);
  if (/\b(director|head of|chief|vp|vice president|partner)\b/.test(titles) && years >= 8) return { level: "senior", why: `A leadership role and about ${years} years of dated work.` };
  if (years >= 4) return { level: "experienced", why: `About ${years} years of dated work.` };
  if (years >= 1) return { level: "early", why: `About ${years} year${years === 1 ? "" : "s"} of dated work.` };
  return { level: "student", why: "Under a year of dated work." };
}

function nameFrom(imp: Pick<CvImport, "draft" | "fileName">): string {
  const person = imp.draft.contact.fullName.trim();
  const latest = imp.draft.sections
    .filter((s) => s.kind === "experience")
    .flatMap((s) => ("entries" in s ? s.entries : []))
    .find((e) => e.title.trim())?.title.trim();
  if (person && latest) return `${person} — ${latest}`.slice(0, 120);
  if (person) return `${person} — CV`.slice(0, 120);
  const file = imp.fileName.replace(/\.(pdf|docx?)$/i, "").replace(/[_-]+/g, " ").trim();
  return (file && file !== "Pasted text" ? file : "My CV").slice(0, 120);
}

export function inferAbout(imp: Pick<CvImport, "draft" | "fileName" | "lines">, now = new Date()): Inferred {
  const text = imp.lines.map((l) => l.text).join("\n");
  const r = regionFrom(text, imp.draft.contact.phone ?? "");
  const l = levelFrom(imp, now.getUTCFullYear());
  return { name: nameFrom(imp), region: r.region, level: l.level, why: { region: r.why, level: l.why } };
}
