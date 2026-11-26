import { describe, expect, it } from "vitest";
import { letterCv } from "../letter/testing";
import { isEntrySection } from "../schema";
import { confirmExperience, homesFor } from "./confirm";

describe("“Yes, I've done this”", () => {
  const cv = letterCv();
  const req = cv.requirements[0];

  it("adds the person's own words as one line under the role they chose, and links it as the evidence", () => {
    const home = homesFor(cv)[1];
    const done = confirmExperience(cv, req.id, "trained four new volunteers in safe handling of rare maps.", home.e.id);
    if (!done.ok) throw new Error(done.problem);
    expect(done.text).toBe("Trained four new volunteers in safe handling of rare maps");
    const entry = done.patch.sections.filter(isEntrySection).flatMap((s) => s.entries).find((e) => e.id === home.e.id)!;
    const line = entry.bullets[entry.bullets.length - 1];
    expect(line.text).toBe(done.text);
    expect(line.sources).toEqual([{ kind: "typed", ref: "requirement", text: "trained four new volunteers in safe handling of rare maps." }]);
    const linked = done.patch.requirements.find((r) => r.id === req.id)!;
    expect(linked).toMatchObject({ judged: "met", gap: false, evidence: [{ section: home.s.id, entry: home.e.id, field: line.id }] });
    expect(done.patch.changes.at(-1)).toMatchObject({ kind: "included", after: done.text, requirementId: req.id });
  });

  it("writes nothing the person didn't say: a bare yes is refused", () => {
    expect(confirmExperience(cv, req.id, "yes")).toEqual({ ok: false, problem: expect.stringContaining("“Yes” alone can’t go on a CV") });
  });

  it("needs somewhere for the line to go", () => {
    const bare = { ...cv, sections: cv.sections.filter((s) => !isEntrySection(s)) };
    expect(confirmExperience(bare, req.id, "Trained four volunteers in handling maps").ok).toBe(false);
  });
});
