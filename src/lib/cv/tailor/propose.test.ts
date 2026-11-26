import { describe, expect, it } from "vitest";
import { fernCv } from "../render/testing";
import { type Achievement, type CvDoc, type EntrySection, type Requirement, newBullet } from "../schema";
import { jobFit } from "./fit";
import { applyProposals, bestRoleFor, effectOf, mergeRequirements, proposeChanges } from "./propose";
import { extractRequirements, manualRequirement } from "./requirements";

const NOW = new Date("2026-11-23T12:00:00Z");
const req = (text: string, more: Partial<Requirement> = {}): Requirement => ({ ...manualRequirement(text), ...more });
const exp = (cv: CvDoc) => cv.sections.find((s) => s.kind === "experience") as EntrySection;
function cvWith(bullets: string[], requirements: Requirement[]): CvDoc {
  const cv = fernCv() as CvDoc;
  const sections = cv.sections.filter((s) => s.kind === "experience" || s.kind === "skills");
  const e = sections.find((s) => s.kind === "experience") as EntrySection;
  e.entries = [{ ...e.entries[0], bullets: bullets.map((t) => newBullet(t)) }, { ...e.entries[1], bullets: [newBullet("Prepared reading-room requests for visiting researchers")] }];
  return { ...cv, sections, level: "experienced", accepted: [], changes: [], requirements, target: { title: "Collections officer", employer: "Example Museum", advert: "" } };
}
const achievement = (text: string, more: Partial<Achievement> = {}): Achievement => ({ id: `ach_${"0".repeat(15)}${text.length % 10}`, userId: "u", text, original: text, sources: [], role: "", org: "", skills: [], private: false, createdAt: "", updatedAt: "", ...more });

describe("assembling a tailored version", () => {
  const bullets = ["Answered the enquiries phone", "Tidied the store room weekly", "Trained 40 volunteers to handle paper safely", "Ordered archive boxes", "Catalogued 3,200 paper maps in two years"];
  const requirements = [req("Experience training volunteers"), req("Experience cataloguing paper maps")];

  it("proposes moving the lines that show what the advert asks for to the top of their role", () => {
    const cv = cvWith(bullets, requirements);
    const move = proposeChanges(cv).find((p) => p.kind === "moved")!;
    expect(move).toMatchObject({ recommended: true, where: "Archive assistant · Paper Kite Archive" });
    expect(move.after.split("\n").slice(0, 2)).toEqual(["Trained 40 volunteers to handle paper safely", "Catalogued 3,200 paper maps in two years"]);
    expect(move.reason).toBe("Lines that show what the advert asks for go first: “Experience training volunteers”.");
    // The other lines keep their own order beneath.
    expect(move.after.split("\n").slice(2)).toEqual(["Answered the enquiries phone", "Tidied the store room weekly", "Ordered archive boxes"]);
  });

  it("offers to switch off lines that show nothing asked for, without recommending it, and never leaves a role under three lines", () => {
    const cv = cvWith(bullets, requirements);
    const off = proposeChanges(cv).filter((p) => p.kind === "off");
    expect(off.map((p) => p.before)).toEqual(["Ordered archive boxes", "Tidied the store room weekly"]);
    expect(off.every((p) => p.recommended === false)).toBe(true);
    expect(off[0].reason).toContain("stays in your CV");
    // A role with four lines or fewer is left alone.
    expect(proposeChanges(cvWith(bullets.slice(0, 4), requirements)).filter((p) => p.kind === "off")).toEqual([]);
  });

  it("never proposes switching off a line that shows a requirement", () => {
    const cv = cvWith(bullets, requirements);
    const off = proposeChanges(cv).filter((p) => p.kind === "off").map((p) => p.before);
    expect(off).not.toContain("Trained 40 volunteers to handle paper safely");
    expect(off).not.toContain("Catalogued 3,200 paper maps in two years");
  });

  it("proposes nothing when there is nothing to do", () => {
    expect(proposeChanges(cvWith(["Trained 40 volunteers to handle paper safely", "Answered the phone"], requirements.slice(0, 1)))).toEqual([]);
    expect(proposeChanges(cvWith(bullets, []))).toEqual([]);
  });

  it("offers a saved achievement that shows something the CV is missing, under the role it belongs to", () => {
    const cv = cvWith(["Answered the enquiries phone"], [req("Experience with Spectrum")]);
    const bank = [achievement("Moved 3,200 records into Spectrum", { role: "Library assistant", org: "Folio House" }), achievement("Ran Spectrum training for the team", { private: true })];
    const add = proposeChanges(cv, bank).find((p) => p.kind === "included")!;
    expect(add).toMatchObject({ after: "Moved 3,200 records into Spectrum", where: "Library assistant · Folio House", recommended: true });
    expect(add.reason).toBe("Your saved achievement shows “Experience with Spectrum”, which this version doesn’t yet.");
    // A private achievement is never offered, and one already on the CV is not offered again.
    expect(proposeChanges(cv, [bank[1]]).filter((p) => p.kind === "included")).toEqual([]);
    const applied = { ...cv, sections: applyProposals(cv, [add], NOW).sections };
    expect(proposeChanges(applied, bank).filter((p) => p.kind === "included")).toEqual([]);
  });
});

describe("applying the chosen changes", () => {
  const bullets = ["Answered the enquiries phone", "Tidied the store room weekly", "Trained 40 volunteers to handle paper safely", "Ordered archive boxes", "Catalogued 3,200 paper maps in two years"];
  const requirements = [req("Experience training volunteers"), req("Experience cataloguing paper maps")];

  it("changes only what was chosen, deletes nothing, and records each change with its reason", () => {
    const cv = cvWith(bullets, requirements);
    const all = proposeChanges(cv);
    const chosen = all.filter((p) => p.kind === "moved" || p.before === "Ordered archive boxes");
    const { sections, records } = applyProposals(cv, chosen, NOW);
    const role = (sections.find((s) => s.kind === "experience") as EntrySection).entries[0];
    expect(role.bullets.map((b) => b.text)).toEqual(["Trained 40 volunteers to handle paper safely", "Catalogued 3,200 paper maps in two years", "Answered the enquiries phone", "Tidied the store room weekly", "Ordered archive boxes"]);
    expect(role.bullets.filter((b) => !b.visible).map((b) => b.text)).toEqual(["Ordered archive boxes"]);
    expect(role.bullets).toHaveLength(5);
    expect(records.map((r) => r.kind)).toEqual(["moved", "off"]);
    for (const r of records) expect(r).toMatchObject({ at: NOW.toISOString(), where: "Archive assistant · Paper Kite Archive" });
    expect(records.every((r) => r.reason.length > 10)).toBe(true);
    // The CV it started from is untouched.
    expect(exp(cv).entries[0].bullets.map((b) => b.text)).toEqual(bullets);
  });

  it("says what the changes do to job fit before they are applied", () => {
    const cv = cvWith(["Answered the enquiries phone"], [req("Experience with Spectrum")]);
    const bank = [achievement("Moved 3,200 records into Spectrum")];
    const effect = effectOf(cv, proposeChanges(cv, bank), NOW);
    expect([effect.before.score, effect.after.score]).toEqual([0, 100]);
    expect(effect.worse).toEqual([]);
  });

  it("flags a change that would remove the only line showing something else the advert asks for", () => {
    const cv = cvWith(bullets, requirements);
    const b = exp(cv).entries[0].bullets[2];
    const harmful = { id: "off:x", kind: "off" as const, at: { section: exp(cv).id, entry: exp(cv).entries[0].id, field: b.id }, where: "", before: b.text, after: "", reason: "test", recommended: false };
    const effect = effectOf(cv, [harmful], NOW);
    expect(effect.worse.map((r) => r.text)).toEqual(["Experience training volunteers"]);
    expect(effect.after.score!).toBeLessThan(effect.before.score!);
  });
});

describe("where a new line belongs, and keeping work when the advert changes", () => {
  it("suggests the role whose own lines share most words with the new one", () => {
    const cv = cvWith(["Trained 40 volunteers to handle paper safely"], []);
    const [a, b] = exp(cv).entries;
    expect(bestRoleFor(cv, "Inducted new volunteers on paper handling")!.entryId).toBe(a.id);
    expect(bestRoleFor(cv, "Fetched reading-room requests for researchers")!.entryId).toBe(b.id);
  });

  it("keeps what the person did with a requirement while its words are still in the advert", () => {
    const advert = "Essential\n- Experience training volunteers\n- Knowledge of Spectrum";
    const old = extractRequirements(advert);
    old[0] = { ...old[0], gap: true, priority: "preferred" };
    const edited = "Essential\n- Experience training volunteers\n- Fluent French";
    const merged = mergeRequirements(old, extractRequirements(edited), edited);
    expect(merged.map((r) => r.quote)).toEqual(["Experience training volunteers", "Fluent French"]);
    expect(merged[0]).toMatchObject({ id: old[0].id, gap: true, priority: "preferred" });
  });
});

describe("job fit moves with the version", () => {
  it("rises when the evidence is added and falls when it is switched off", () => {
    const cv = cvWith(["Answered the enquiries phone"], [req("Experience with Spectrum")]);
    expect(jobFit(cv).score).toBe(0);
    const b = newBullet("Moved 3,200 records into Spectrum");
    exp(cv).entries[0].bullets.push(b);
    expect(jobFit(cv).score).toBe(100);
    b.visible = false;
    expect(jobFit(cv).score).toBe(0);
  });

  describe("CV-4: tailoring without dead ends", () => {
    it("offers at least one proposal for every missing requirement even with empty bank", () => {
      const missingReqs = [
        req("Experience with Tableau"),
        req("Knowledge of Google Analytics 4"),
        req("Experience with paid search campaigns"),
      ];
      const cv = cvWith(["Answered enquiries phone daily."], missingReqs);
      const proposals = proposeChanges(cv, []);
      expect(proposals.length).toBeGreaterThanOrEqual(missingReqs.length);
      for (const r of missingReqs) {
        expect(proposals.some((p) => p.requirementId === r.id)).toBe(true);
      }
    });

    it("accepts all proposals in one click and applies them", () => {
      const missingReqs = [req("Experience with Tableau")];
      const cv = cvWith(["Answered enquiries phone daily."], missingReqs);
      const proposals = proposeChanges(cv, []);
      const applied = applyProposals(cv, proposals, NOW);
      expect(applied.records.length).toBe(proposals.length);
      const fit = jobFit({ ...cv, sections: applied.sections });
      expect(fit.score).toBeGreaterThan(0);
    });
  });
});
