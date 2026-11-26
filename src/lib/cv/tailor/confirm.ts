import { addBullets } from "../edit";
import { type CvDoc, type Entry, type Section, newBullet, newId } from "../schema";
import { asBullet } from "../write/draft";

/** Where a line of the person's own can go: a visible role, project, qualification or volunteering entry. */
export function homesFor(cv: Pick<CvDoc, "sections">): { s: Section; e: Entry }[] {
  return cv.sections.flatMap((s) =>
    s.visible && "entries" in s && (s.kind === "experience" || s.kind === "projects" || s.kind === "volunteering" || s.kind === "education") ? s.entries.filter((e) => e.visible && (e.title.trim() || e.org.trim())).map((e) => ({ s, e })) : [],
  );
}

export type Confirmed = { ok: true; text: string; patch: Pick<CvDoc, "sections" | "requirements" | "changes"> } | { ok: false; problem: string };

/**
 * "Yes, I've done this": the person's own words, made into one line under the
 * role they chose, linked to the requirement as its evidence. Nothing is
 * written for them: the line is their sentence, tidied (a capital first, no
 * full stop), and it carries their words as its source. Used by Tailor to a
 * job and by the job keywords beside the page.
 */
export function confirmExperience(cv: Pick<CvDoc, "sections" | "requirements" | "changes">, requirementId: string, words: string, entryId?: string): Confirmed {
  const req = cv.requirements.find((r) => r.id === requirementId);
  if (!req) return { ok: false, problem: "That requirement is no longer in the list." };
  const text = asBullet(words);
  if (text.split(" ").length < 3) return { ok: false, problem: "Say what you did and where, in one line. “Yes” alone can’t go on a CV." };
  const homes = homesFor(cv);
  // The list shows its first entry as chosen until another is picked: that is the one used.
  const home = homes.find((h) => h.e.id === entryId) ?? homes[0];
  if (!home) return { ok: false, problem: "Add a role, a project or a qualification to your CV first, so this line has somewhere to go." };
  const bullet = { ...newBullet(text), sources: [{ kind: "typed" as const, ref: "requirement", text: words.trim() }] };
  const out = addBullets(cv.sections, home.s.id, home.e.id, [bullet]);
  return {
    ok: true,
    text,
    patch: {
      sections: out.sections,
      requirements: cv.requirements.map((r) => (r.id === req.id ? { ...r, evidence: [{ section: home.s.id, entry: home.e.id, field: bullet.id }], judged: "met" as const, uncovered: "", gap: false } : r)),
      changes: [...cv.changes, { id: newId("c_"), at: new Date().toISOString(), kind: "included" as const, where: [home.e.title, home.e.org].filter(Boolean).join(" · "), before: "", after: text, reason: `You said you have this, and where: “${(req.text || req.quote).slice(0, 120)}”.`, requirementId: req.id }].slice(-200),
    },
  };
}
