import { type Achievement, type ChangeRecord, type CvDoc, type Entry, type Locator, type Requirement, type Section, isEntrySection, newBullet, newId } from "../schema";
import { terms } from "../write/facts";
import { type JobFit, assess, jobFit, keyTerms } from "./fit";

/**
 * Assembling a tailored version before any rewording: move the lines that show
 * what the advert asks for to the top of their role, offer to switch off lines
 * that show none of it, and offer saved achievements that show something the
 * CV is missing. Each is a proposal with its reason. Nothing changes until the
 * person applies the ones they choose, and each applied change is recorded.
 */

export type Proposal = {
  id: string;
  /** The role or section it is in, by name. */
  where: string;
  before: string;
  after: string;
  reason: string;
  requirementId?: string;
  /** Ticked to begin with. Switching content off is offered, not recommended. */
  recommended: boolean;
} & ({ kind: "moved"; sectionId: string; entryId: string; order: string[] } | { kind: "off"; at: Locator } | { kind: "included"; sectionId: string; entryId: string; achievement: Pick<Achievement, "id" | "text" | "sources"> });

type Tailorable = Pick<CvDoc, "sections" | "requirements" | "target">;
const key = (at: Locator) => `${at.section}:${at.entry ?? ""}:${at.field ?? ""}`;
const WORK = new Set(["experience", "projects", "volunteering"]);
const nameOf = (e: Entry) => [e.title, e.org].filter(Boolean).join(" · ") || "This entry";
const short = (r: Requirement) => (r.text || r.quote).replace(/\s+/g, " ").slice(0, 120);

export function proposeChanges(cv: Tailorable, bank: Achievement[] = []): Proposal[] {
  // With nothing asked for, there is nothing to tailor to.
  if (!cv.requirements.length) return [];
  const rows = assess(cv);
  // Which lines show a requirement, and the first requirement each one shows.
  const shows = new Map<string, Requirement>();
  for (const r of rows) if (r.status !== "missing") for (const l of r.lines) if (!shows.has(key(l.at))) shows.set(key(l.at), r.requirement);
  const out: Proposal[] = [];

  for (const s of cv.sections) {
    if (!s.visible || !isEntrySection(s) || !WORK.has(s.kind)) continue;
    for (const e of s.entries) {
      if (!e.visible) continue;
      const at = (bulletId: string): Locator => ({ section: s.id, entry: e.id, field: bulletId });
      const visible = e.bullets.filter((b) => b.visible && b.text.trim());
      const supported = visible.filter((b) => shows.has(key(at(b.id))));
      // Move: lines that show what the advert asks for go first. The others keep their order beneath.
      const order = [...e.bullets.filter((b) => supported.includes(b)), ...e.bullets.filter((b) => !supported.includes(b))];
      if (supported.length && order.some((b, i) => b.id !== e.bullets[i].id)) {
        const first = shows.get(key(at(supported[0].id)))!;
        out.push({ id: `moved:${e.id}`, kind: "moved", sectionId: s.id, entryId: e.id, order: order.map((b) => b.id), where: nameOf(e), before: visible.map((b) => b.text).join("\n"), after: order.filter((b) => visible.includes(b)).map((b) => b.text).join("\n"), reason: `Lines that show what the advert asks for go first: “${short(first)}”.`, requirementId: first.id, recommended: true });
      }
      // Switch off: only where a role has more than four lines, and never below three.
      const spare = visible.filter((b) => !supported.includes(b));
      let room = visible.length - Math.max(3, supported.length);
      if (visible.length > 4) {
        for (const b of [...spare].reverse()) {
          if (room-- <= 0) break;
          out.push({ id: `off:${b.id}`, kind: "off", at: at(b.id), where: nameOf(e), before: b.text, after: "", reason: "Shows nothing this advert asks for. It is switched off in this version only, and stays in your CV.", recommended: false });
        }
      }
    }
  }

  // Include: a saved achievement that shows something the CV does not.
  const onCv = new Set(cv.sections.flatMap((s) => (isEntrySection(s) ? s.entries.flatMap((e) => e.bullets.flatMap((b) => [b.bankId ?? "", b.text.trim().toLowerCase()])) : [])));
  const roles = cv.sections.flatMap((s) => (s.visible && isEntrySection(s) && s.kind === "experience" ? s.entries.filter((e) => e.visible).map((e) => ({ e, s })) : []));
  const used = new Set<string>();
  for (const r of rows) {
    if (r.status === "met" || r.requirement.gap || !roles.length) continue;
    const keys = keyTerms(r.requirement.text || r.requirement.quote);
    if (!keys.length) continue;
    const match = bank.find((a) => {
      if (a.private || used.has(a.id) || onCv.has(a.id) || onCv.has(a.text.trim().toLowerCase())) return false;
      const have = new Set(terms(a.text).map((t) => t.stem));
      return keys.every((k) => have.has(k.stem));
    });
    if (!match) continue;
    used.add(match.id);
    const same = (a: string, b: string) => !!a.trim() && a.trim().toLowerCase() === b.trim().toLowerCase();
    const home = roles.find(({ e }) => same(e.title, match.role) && (!match.org || same(e.org, match.org))) ?? roles.find(({ e }) => same(e.org, match.org)) ?? roles[0];
    out.push({ id: `included:${match.id}`, kind: "included", sectionId: home.s.id, entryId: home.e.id, achievement: { id: match.id, text: match.text, sources: match.sources }, where: nameOf(home.e), before: "", after: match.text, reason: `Your saved achievement shows “${short(r.requirement)}”, which this version doesn’t yet.`, requirementId: r.requirement.id, recommended: true });
  }
  return out;
}

/** Applies the chosen proposals and returns the new sections with a record of each change. */
export function applyProposals(cv: Tailorable, chosen: Proposal[], now: Date): { sections: Section[]; records: ChangeRecord[] } {
  let sections = cv.sections;
  const records: ChangeRecord[] = [];
  const inEntry = (sectionId: string, entryId: string, change: (e: Entry) => Entry) => sections.map((s) => (s.id === sectionId && isEntrySection(s) ? { ...s, entries: s.entries.map((e) => (e.id === entryId ? change(e) : e)) } : s));
  for (const p of chosen) {
    if (p.kind === "moved") sections = inEntry(p.sectionId, p.entryId, (e) => ({ ...e, bullets: [...p.order.map((id) => e.bullets.find((b) => b.id === id)).filter((b): b is Entry["bullets"][number] => !!b), ...e.bullets.filter((b) => !p.order.includes(b.id))] }));
    else if (p.kind === "off") sections = inEntry(p.at.section, p.at.entry ?? "", (e) => ({ ...e, bullets: e.bullets.map((b) => (b.id === p.at.field ? { ...b, visible: false } : b)) }));
    else sections = inEntry(p.sectionId, p.entryId, (e) => (e.bullets.some((b) => b.bankId === p.achievement.id) ? e : { ...e, bullets: [{ ...newBullet(p.achievement.text), sources: p.achievement.sources.slice(0, 6), bankId: p.achievement.id }, ...e.bullets] }));
    records.push({ id: newId("c_"), at: now.toISOString(), kind: p.kind, where: p.where, before: p.before, after: p.after, reason: p.reason, requirementId: p.requirementId });
  }
  return { sections, records };
}

/**
 * What a set of changes would do to job fit, and any requirement left worse
 * off by it: switching off the only line that showed something else the
 * advert asks for is flagged before it is applied.
 */
export function effectOf(cv: Tailorable, chosen: Proposal[], now: Date): { before: JobFit; after: JobFit; worse: Requirement[] } {
  const before = jobFit(cv);
  const after = jobFit({ ...cv, sections: applyProposals(cv, chosen, now).sections });
  const rank = { met: 2, partly: 1, missing: 0 } as const;
  const worse = after.rows.filter((r, i) => rank[r.status] < rank[before.rows[i].status]).map((r) => r.requirement);
  return { before, after, worse };
}

/** The role a new line most likely belongs under: the one whose own lines share most words with it. The person can choose another. */
export function bestRoleFor(cv: Pick<CvDoc, "sections">, text: string): { sectionId: string; entryId: string } | null {
  const want = new Set(terms(text).map((t) => t.stem));
  let best: { sectionId: string; entryId: string; n: number } | null = null;
  for (const s of cv.sections) {
    if (!s.visible || !isEntrySection(s) || !WORK.has(s.kind)) continue;
    for (const e of s.entries) {
      if (!e.visible) continue;
      const have = new Set(terms([e.title, e.org, e.orgInfo, ...e.bullets.map((b) => b.text)].join(" ")).map((t) => t.stem));
      const n = [...want].filter((w) => have.has(w)).length;
      if (!best || n > best.n) best = { sectionId: s.id, entryId: e.id, n };
    }
  }
  return best && { sectionId: best.sectionId, entryId: best.entryId };
}

/**
 * The requirements after the advert has been edited: those whose words are
 * still in it keep everything the person did with them; new ones are added;
 * those the advert no longer says are dropped.
 */
export function mergeRequirements(old: Requirement[], extracted: Requirement[], advert: string): Requirement[] {
  const flat = advert.replace(/\s+/g, " ");
  const kept = old.filter((r) => flat.includes(r.quote.replace(/\s+/g, " ")));
  const have = new Set(kept.map((r) => r.quote.replace(/\s+/g, " ").toLowerCase()));
  return [...kept, ...extracted.filter((r) => !have.has(r.quote.replace(/\s+/g, " ").toLowerCase()))].slice(0, 40);
}
