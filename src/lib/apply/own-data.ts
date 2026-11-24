import type { ApplicationGapItem, ApplySettings, Evidence, JobRequirement, Profile, Voice } from "./schema";
import { SEEDED_PROFILE, SEEDED_SETTINGS, SEEDED_VOICE } from "./seeded";

/**
 * The rules that keep the Apply area to what the person has given it. A new
 * account's profile, voice and job preferences are empty. What is read from a
 * job advert is what the advert says, and a field that isn't there is empty.
 * The fit is the figure the requirements and the person's evidence give. An
 * answer is the person's own notes, tidied: nothing is added to it.
 */

const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

/* ------------------------------------------------------------------ profile */

export function emptyProfile(user: { id: string; email?: string; firstName?: string; lastName?: string }, now: string): Profile {
  const profile: Profile = {
    userId: user.id,
    region: "uk",
    // The name and email are the account's own. Everything else is for the person to fill in.
    contact: { name: [user.firstName, user.lastName].filter(Boolean).join(" "), email: user.email ?? "", phone: "", location: "", links: [] },
    headline: "",
    summary: "",
    roles: [],
    education: [],
    skills: [],
    extras: [],
    screening: { rightToWork: "", noticePeriod: "", salaryMin: 0, salaryCurrency: "GBP", relocate: false, remote: "any", visaNeeded: false, custom: [] },
    completeness: 0,
    createdAt: now,
    updatedAt: now,
  };
  return { ...profile, completeness: profileCompleteness(profile) };
}

/** How much of the profile the person has filled in, as a percentage of ten parts. */
export function profileCompleteness(p: Profile): number {
  const parts = [
    p.contact.name.trim(),
    p.contact.email.trim(),
    p.contact.phone.trim(),
    p.contact.location.trim(),
    p.headline.trim(),
    p.summary.trim(),
    p.roles.length > 0,
    p.education.length > 0,
    p.skills.length > 0,
    p.screening.rightToWork.trim(),
  ];
  return Math.round((parts.filter(Boolean).length / parts.length) * 100);
}

/**
 * A stored profile without the parts an earlier build wrote in for everyone.
 * Each part is removed only if it is still exactly as it was written; a part
 * the person changed is theirs and stays. `changed` says whether anything went.
 */
export function withoutSeededProfile(p: Profile): { profile: Profile; changed: boolean } {
  const S = SEEDED_PROFILE;
  const seededRole = (r: Profile["roles"][number]) => r.employer === S.roleEmployer && r.title === S.roleTitle && r.bullets.length > 0 && r.bullets.every((b) => (S.bullets as readonly string[]).includes(b.text));
  const seededEdu = (e: Profile["education"][number]) => e.institution === S.institution && e.qualification === S.qualification;
  const seededSkills = sameList(p.skills.map((s) => s.name), S.skills);
  // The phone number is the tell for the contact block: it is a made-up number nobody has.
  const seededContact = p.contact.phone === S.phone;
  const seededScreening = p.screening.rightToWork === S.rightToWork && p.screening.salaryMin === S.salaryMin;
  const next: Profile = {
    ...p,
    contact: seededContact
      ? { ...p.contact, phone: "", location: p.contact.location === S.location ? "" : p.contact.location, links: sameList(p.contact.links, S.links) ? [] : p.contact.links }
      : p.contact,
    headline: p.headline === S.headline ? "" : p.headline,
    summary: p.summary === S.summary ? "" : p.summary,
    roles: p.roles.filter((r) => !seededRole(r)),
    education: p.education.filter((e) => !seededEdu(e)),
    skills: seededSkills ? [] : p.skills,
    extras: p.extras.filter((x) => x.title !== S.extra),
    screening: seededScreening ? { ...p.screening, rightToWork: "", noticePeriod: "", salaryMin: 0, remote: "any" } : p.screening,
  };
  next.completeness = profileCompleteness(next);
  const strip = ({ completeness: _c, updatedAt: _u, ...rest }: Profile) => JSON.stringify(rest);
  const changed = strip(next) !== strip(p);
  return { profile: changed ? next : { ...p, completeness: profileCompleteness(p) }, changed: changed || p.completeness !== profileCompleteness(p) };
}

/* -------------------------------------------------------------------- voice */

/** Nothing is measured until the person adds a writing sample. */
export const UNMEASURED: Voice["measured"] = { sentenceMean: 0, sentenceSpread: 0, formality: 3, contractions: false, firstPerson: false, spelling: "uk", opens: [], closes: [] };

export function emptyVoice(userId: string, now: string): Voice {
  return { userId, samples: [], measured: { ...UNMEASURED }, signature: [], never: [], learnedFromEdits: [], createdAt: now, updatedAt: now };
}

export function withoutSeededVoice(v: Voice): { voice: Voice; changed: boolean } {
  const S = SEEDED_VOICE;
  const noSamples = v.samples.length === 0;
  const seededMeasure = noSamples && (v.measured.sentenceMean === S.sentenceMean || v.measured.sentenceMean === 14) && (v.measured.sentenceSpread === S.sentenceSpread || v.measured.sentenceSpread === 4);
  const signature = v.signature.filter((p) => !(S.signature as readonly string[]).includes(p));
  const never = sameList(v.never, S.never) || sameList(v.never, S.neverFromSample) ? [] : v.never;
  const measured = seededMeasure
    ? { ...UNMEASURED, spelling: v.measured.spelling }
    : { ...v.measured, opens: sameList(v.measured.opens, S.opens) ? [] : v.measured.opens, closes: sameList(v.measured.closes, S.closes) || sameList(v.measured.closes, ["Action-oriented"]) ? [] : v.measured.closes };
  const voice: Voice = { ...v, measured, signature, never };
  return { voice, changed: JSON.stringify(voice) !== JSON.stringify(v) };
}

/* ----------------------------------------------------------------- settings */

export function emptySettings(userId: string, now: string): ApplySettings {
  // The limits are the app's own starting values. What to look for is the person's to say.
  return { userId, titles: [], locations: [], remote: false, salaryMin: 0, excludeEmployers: [], minFit: 75, dailyCap: 3, perEmployerCap: 2, handsOff: false, createdAt: now, updatedAt: now };
}

export function withoutSeededSettings(s: ApplySettings): { settings: ApplySettings; changed: boolean } {
  const seededTitles = sameList(s.titles, SEEDED_SETTINGS.titles);
  const seededLocations = sameList(s.locations, SEEDED_SETTINGS.locations);
  if (!seededTitles && !seededLocations) return { settings: s, changed: false };
  const whole = seededTitles && seededLocations;
  const settings: ApplySettings = {
    ...s,
    titles: seededTitles ? [] : s.titles,
    locations: seededLocations ? [] : s.locations,
    salaryMin: whole && s.salaryMin === SEEDED_SETTINGS.salaryMin ? 0 : s.salaryMin,
    remote: whole ? false : s.remote,
  };
  return { settings, changed: true };
}

/* --------------------------------------------------------------- job advert */

export interface ReadAdvert {
  /** Empty when the advert's first line doesn't read as a title. */
  title: string;
  /** Empty when the advert doesn't name the employer in a way that can be read. */
  employer: string;
  /** Empty unless the advert has a "Location:" line. */
  location: string;
  remote: boolean;
  requirements: JobRequirement[];
  keywords: string[];
  tone: "formal" | "neutral" | "informal";
}

const REQUIREMENT = /experience (with|in|of)|proficiency in|knowledge of|ability to|responsible for|must have|track record|degree|bachelor|master|qualification|essential|desirable|required/i;
const OPTIONAL = /desirable|nice to have|bonus|preferred|ideally|advantage/i;
const KEYWORDS = ["TypeScript", "React", "Next.js", "AWS", "MongoDB", "PostgreSQL", "Docker", "Kubernetes", "CI/CD", "GraphQL", "Microservices", "REST API", "Tailwind", "System Design", "Python", "SQL", "Excel", "Agile"];
const labelled = (lines: string[], label: RegExp) => {
  for (const line of lines) {
    const m = line.match(label);
    if (m && m[1].trim()) return m[1].trim().slice(0, 80);
  }
  return "";
};
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** What a pasted job advert says. A field the advert doesn't give is left empty: nothing is supplied for it. */
export function readJobAdvert(text: string): ReadAdvert {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const titleLine = labelled(lines, /^(?:job )?title\s*[:\-–]\s*(.+)$/i) || (lines[0] && lines[0].length < 70 && !/[.!?]$/.test(lines[0]) ? lines[0].replace(/^(?:job )?title\s*[:\-–]\s*/i, "") : "");
  let employer = labelled(lines, /^(?:employer|company|organisation|organization)\s*[:\-–]\s*(.+)$/i);
  if (!employer) {
    const at = text.match(/\bat\s+([A-Z][A-Za-z0-9&.' -]{1,40}?)(?=[,.\n]|\s+(?:is|are|we|in|as)\b|$)/m);
    if (at) employer = at[1].trim();
  }
  const requirements: JobRequirement[] = lines
    .filter((l) => /^[-•*]\s*\S/.test(l) || REQUIREMENT.test(l))
    .filter((l) => REQUIREMENT.test(l) || /^[-•*]/.test(l))
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter((l) => l.length >= 12 && l.length <= 300 && REQUIREMENT.test(l))
    .slice(0, 12)
    .map((line, i) => ({
      id: `req-${i + 1}`,
      text: line,
      kind: OPTIONAL.test(line) ? ("nice" as const) : ("must" as const),
      group: /degree|bachelor|master|certified|qualification/i.test(line) ? ("qualification" as const) : /\byears?\b|track record|experience/i.test(line) ? ("experience" as const) : /communication|leadership|collaborat|team/i.test(line) ? ("trait" as const) : ("skill" as const),
      sourceQuote: line.slice(0, 100),
    }));
  return {
    title: titleLine.slice(0, 120),
    employer,
    location: labelled(lines, /^(?:location|based in|office)\s*[:\-–]\s*(.+)$/i),
    remote: /\b(remote|hybrid|work from home|wfh)\b/i.test(text),
    requirements,
    keywords: KEYWORDS.filter((k) => new RegExp(`(^|[^A-Za-z0-9])${escape(k)}([^A-Za-z0-9]|$)`, "i").test(text)),
    tone: /\b(dear|kindly|herein|shall)\b/i.test(text) ? "formal" : "neutral",
  };
}

/* ---------------------------------------------------------------------- fit */

/**
 * Each requirement against the person's evidence, and the fit that gives:
 * the share of the requirements' weight that is covered (a "must" counts
 * three times a "nice to have"). With no requirements there is nothing to
 * measure and the fit is null. It is never raised to look better.
 */
export function gapAndFit(requirements: JobRequirement[], evidence: Pick<Evidence, "id" | "text" | "skillTags" | "numbers">[]): { gapMap: ApplicationGapItem[]; fit: number | null } {
  let covered = 0;
  let total = 0;
  const gapMap = requirements.map((req) => {
    const weight = req.kind === "must" ? 3 : 1;
    total += weight;
    const needle = req.text.toLowerCase();
    const matched = evidence.filter((e) => e.skillTags.some((tag) => tag.trim() && needle.includes(tag.toLowerCase())) || (needle.length >= 15 && e.text.toLowerCase().includes(needle.slice(0, 15))));
    const strength: ApplicationGapItem["strength"] = matched.length >= 2 || matched.some((e) => e.numbers.length > 0) ? "strong" : matched.length === 1 ? "partial" : "none";
    covered += strength === "strong" ? weight : strength === "partial" ? weight * 0.5 : 0;
    return { requirementId: req.id, strength, evidenceIds: matched.map((e) => e.id) };
  });
  return { gapMap, fit: total === 0 ? null : Math.round((covered / total) * 100) };
}

/** The fit a stored gap map gives, for applications saved when the figure was floored at 50. */
export function fitFromGapMap(requirements: Pick<JobRequirement, "id" | "kind">[], gapMap: Pick<ApplicationGapItem, "requirementId" | "strength">[]): number | null {
  let covered = 0;
  let total = 0;
  for (const req of requirements) {
    const weight = req.kind === "must" ? 3 : 1;
    total += weight;
    const strength = gapMap.find((g) => g.requirementId === req.id)?.strength ?? "none";
    covered += strength === "strong" ? weight : strength === "partial" ? weight * 0.5 : 0;
  }
  return total === 0 ? null : Math.round((covered / total) * 100);
}

/* ------------------------------------------------------------------- answer */

export interface ShapedAnswer {
  text: string;
  sentences: string[];
  /** True when the notes were longer than the limit and were cut. */
  cut: boolean;
}

const count = (s: string, unit: "words" | "chars") => (unit === "words" ? s.split(/\s+/).filter(Boolean).length : s.length);

/**
 * An answer made from the person's own notes and nothing else: the spacing is
 * tidied and it is cut to the limit at the end of a sentence where it can be.
 * No sentence, phrase or word is added.
 */
export function shapeAnswer(notes: string, limit: number, unit: "words" | "chars"): ShapedAnswer {
  const clean = notes.replace(/\s+/g, " ").trim();
  const all = (clean.match(/[^.!?]+[.!?]*/g) ?? []).map((s) => s.trim()).filter(Boolean);
  const max = Math.max(1, Math.floor(limit));
  const kept: string[] = [];
  for (const sentence of all) {
    const next = [...kept, sentence].join(" ");
    if (count(next, unit) > max) break;
    kept.push(sentence);
  }
  if (kept.length === all.length) return { text: kept.join(" "), sentences: kept, cut: false };
  if (kept.length === 0 && all.length) {
    // Even the first sentence is over the limit: it is cut at the limit, with nothing added to mark the cut.
    const first = unit === "words" ? all[0].split(/\s+/).slice(0, max).join(" ") : all[0].slice(0, max).trimEnd();
    return { text: first, sentences: first ? [first] : [], cut: true };
  }
  return { text: kept.join(" "), sentences: kept, cut: true };
}
