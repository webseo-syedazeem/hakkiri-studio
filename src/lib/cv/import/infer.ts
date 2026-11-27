import type { CvLevel, CvRegion, Section } from "../schema";
import { isEntrySection } from "../schema";

/**
 * Start in three steps: nothing is asked before an upload. UK or US, the level
 * and the CV's name are worked out from the file, shown as chips in the editor,
 * and changed there in one press. Each comes with why, in plain words.
 */

export interface Inferred {
  region: CvRegion;
  level: CvLevel;
  name: string;
  /** Why each was chosen, for the person: "UK phone number and spelling". */
  why: { region: string; level: string };
}

const UK_WORDS = /\b(organis(?:e|ed|es|ing|ation|ations)|colour(?:s|ed)?|centre(?:s|d)?|programme(?:s)?|analys(?:e|ed|es|ing)|behaviour(?:s)?|favour(?:ite|s)?|licence|travelled|travelling|optimis(?:e|ed|ing|ation)|prioritis(?:e|ed|ing)|catalogu(?:e|ed|ing)|whilst|GCSEs?|A-?levels?|\(Hons\)|2:1|2:2|First-class)\b/gi;
const US_WORDS = /\b(organiz(?:e|ed|es|ing|ation|ations)|color(?:s|ed)?|center(?:s|ed)?|analyz(?:e|ed|es|ing)|behavior(?:s)?|favor(?:ite|s)?|license[ds]?|traveled|traveling|optimiz(?:e|ed|ing|ation)|prioritiz(?:e|ed|ing)|GPA|B\.S\.|B\.A\.|M\.S\.|resum[eé])\b/gi;
const UK_PHONE = /(?:\+44\s?\(?0?\)?\s?\d{2,4}|\b0[1-9]\d{2,4})[\s-]?\d{3}[\s-]?\d{3,4}\b/;
const US_PHONE = /(?:\+1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/;
const UK_POSTCODE = /\b[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}\b/;
const US_PLACE = /,\s(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b(?:\s\d{5})?/;

/** UK or US, from the phone number, the address and the spelling. A tie stays UK. */
export function inferRegion(text: string): { region: CvRegion; why: string } {
  const uk: string[] = [];
  const us: string[] = [];
  let ukScore = 0;
  let usScore = 0;
  if (UK_PHONE.test(text)) (ukScore += 3), uk.push("phone number");
  if (US_PHONE.test(text) && !UK_PHONE.test(text)) (usScore += 3), us.push("phone number");
  if (UK_POSTCODE.test(text)) (ukScore += 2), uk.push("postcode");
  if (US_PLACE.test(text)) (usScore += 2), us.push("state");
  const ukWords = (text.match(UK_WORDS) ?? []).length;
  const usWords = (text.match(US_WORDS) ?? []).length;
  if (ukWords > usWords) (ukScore += Math.min(3, ukWords)), uk.push("spelling");
  if (usWords > ukWords) (usScore += Math.min(3, usWords)), us.push("spelling");
  if (usScore > ukScore) return { region: "us", why: `US ${us.join(" and ")}` };
  if (ukScore > 0) return { region: "uk", why: `UK ${uk.join(" and ")}` };
  return { region: "uk", why: "Nothing in the file said UK or US, so UK is used. Change it any time." };
}

const year = (d: string | undefined) => (d && /^\d{4}/.test(d) ? Number(d.slice(0, 4)) : null);

/** The level, from how long ago the first job started, and whether study is recent. */
export function inferLevel(sections: Section[], now = new Date()): { level: CvLevel; why: string } {
  const thisYear = now.getUTCFullYear();
  const starts: number[] = [];
  let studyEnd: number | null = null;
  let studying = false;
  for (const s of sections) {
    if (!isEntrySection(s)) continue;
    for (const e of s.entries) {
      if (s.kind === "experience") {
        const y = year(e.start);
        if (y && y >= 1950 && y <= thisYear) starts.push(y);
      }
      if (s.kind === "education") {
        if (e.current) studying = true;
        const y = year(e.end);
        if (y && (studyEnd === null || y > studyEnd)) studyEnd = y;
      }
    }
  }
  if (!starts.length) {
    if (studying || (studyEnd !== null && studyEnd >= thisYear - 1)) return { level: "student", why: "No work history yet, and recent study" };
    return { level: "early", why: "No dated work history" };
  }
  const years = thisYear - Math.min(...starts);
  const said = `${years} ${years === 1 ? "year" : "years"} since your first role`;
  if (years >= 12) return { level: "senior", why: said };
  if (years >= 2) return { level: "experienced", why: said };
  if (studying || (studyEnd !== null && studyEnd >= thisYear - 1)) return { level: "student", why: `${said}, and recent study` };
  return { level: "early", why: said };
}

/** The CV's name: the person and their latest role, else the file's name. */
export function inferName(fullName: string, sections: Section[], fileName: string): string {
  const exp = sections.find((s) => s.kind === "experience");
  const latest = exp && isEntrySection(exp) ? exp.entries.find((e) => e.title.trim()) : undefined;
  const person = fullName.trim();
  if (person) return (latest ? `${person} – ${latest.title.trim()}` : person).slice(0, 120);
  const fromFile = fileName.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return (fromFile && !/^pasted text$/i.test(fromFile) ? fromFile : "My CV").slice(0, 120);
}

export function inferSetup(input: { fullName: string; sections: Section[]; text: string; fileName: string }, now = new Date()): Inferred {
  const r = inferRegion(input.text);
  const l = inferLevel(input.sections, now);
  return { region: r.region, level: l.level, name: inferName(input.fullName, input.sections, input.fileName), why: { region: r.why, level: l.why } };
}
