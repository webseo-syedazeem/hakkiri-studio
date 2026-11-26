import {
  type CvDoc,
  type CvRegion,
  type Entry,
  type Section,
  type SectionKind,
  emptySection,
  newBullet,
  newId,
} from "../schema";
import { wrongRegionSpelling } from "../score/detect";
import type { ExampleEntry, ExampleSpec, Regional } from "./types";

/** True when a value is written separately for each region. */
const split = <T>(v: Regional<T>): v is { uk: T; us: T } => typeof v === "object" && v !== null && !Array.isArray(v) && "uk" in v && "us" in v;

/**
 * Text written once, in UK spelling, put into the region's spelling. Only
 * the app's own list of UK/US spelling pairs is used ("organise" and
 * "organize", "colour" and "color"), never a guess; anything else that
 * differs is written for each region.
 */
export function respell(text: string, region: CvRegion): string {
  if (region === "uk") return text;
  let out = "";
  let at = 0;
  for (const hit of wrongRegionSpelling(text, region)) {
    if (hit.isTypo || hit.start < at) continue;
    out += text.slice(at, hit.start) + hit.suggest;
    at = hit.end;
  }
  return out + text.slice(at);
}

/** The value for a region: its own version, or the shared one respelled. */
export function pick(v: Regional<string>, region: CvRegion): string {
  return split(v) ? v[region] : respell(v, region);
}
export function pickAny<T>(v: Regional<T>, region: CvRegion): T {
  return split(v) ? v[region] : v;
}
/** A list for a region: its own list, or the shared one with each item respelled. */
export function pickList(v: Regional<string[]>, region: CvRegion): string[] {
  return split(v) ? v[region] : v.map((s) => respell(s, region));
}

function entry(e: ExampleEntry, region: CvRegion): Entry {
  const p = (v: Regional<string> | undefined) => (v === undefined ? "" : pick(v, region));
  return {
    id: newId("e_"),
    visible: true,
    title: p(e.title),
    org: p(e.org),
    orgInfo: "",
    location: p(e.location),
    start: e.start ?? "",
    end: e.current ? "" : (e.end ?? ""),
    current: Boolean(e.current),
    subject: p(e.subject),
    grade: p(e.grade),
    link: "",
    bullets: (e.bullets ?? []).map((b) => newBullet(p(b))),
  };
}

function entries(kind: SectionKind, list: ExampleEntry[] | undefined, region: CvRegion): Section[] {
  if (!list?.length) return [];
  const s = emptySection(kind);
  return "entries" in s ? [{ ...s, entries: list.map((e) => entry(e, region)) }] : [];
}

/** The sections of an example, in the order its level suits: study first for a student. */
export function exampleSections(spec: ExampleSpec, region: CvRegion): Section[] {
  const summary = emptySection("summary");
  const skills = emptySection("skills");
  const profile = summary.kind === "summary" ? [{ ...summary, text: pick(spec.profile, region) }] : [];
  const skillList = skills.kind === "skills" ? [{ ...skills, groups: [{ id: newId("g_"), name: "", visible: true, skills: spec.skills.map((k) => ({ id: newId("k_"), name: pick(k, region), visible: true })) }] }] : [];
  const languages = spec.languages?.length
    ? (() => {
        const s = emptySection("languages");
        return "items" in s ? [{ ...s, items: spec.languages.map((l) => ({ id: newId("i_"), name: l.name, level: pick(l.level, region), visible: true })) }] : [];
      })()
    : [];
  const work = entries("experience", spec.experience, region);
  const study = entries("education", spec.education, region);
  const middle = spec.level === "student" ? [...study, ...entries("projects", spec.projects, region), ...work] : [...work, ...entries("projects", spec.projects, region), ...study];
  return [...profile, ...middle, ...entries("certificates", spec.certificates, region), ...entries("volunteering", spec.volunteering, region), ...skillList, ...languages];
}

/** The example as a CV of the person's own, ready to edit. */
export function exampleCv(spec: ExampleSpec, region: CvRegion, userId: string, name?: string, now = new Date()): CvDoc {
  const at = now.toISOString();
  const p = spec.person;
  return {
    id: newId("cv_"),
    userId,
    rev: 1,
    name: name || `${pick(spec.role, region)} (example)`,
    kind: "base",
    level: spec.level,
    region,
    contact: { fullName: p.name, email: p.email, phone: pick(p.phone, region), location: pick(p.location, region), links: p.links ?? [] },
    sections: exampleSections(spec, region),
    design: { template: spec.template, pageSize: region === "us" ? "letter" : "a4", density: spec.density ? pickAny(spec.density, region) : "default", pageTarget: spec.level === "student" || spec.level === "early" ? 1 : 2 },
    accepted: spec.names ?? [],
    requirements: [],
    changes: [],
    createdAt: at,
    updatedAt: at,
  };
}
