import { describe, expect, it } from "vitest";
import { type Snapshot, TYPING_PAUSE_MS, addBullets, bulletAt, changeBullet, diffParts, emptyHistory, fieldFor, formTabs, itemCount, moveById, moveItem, record, redo, samePassage, snapshotOf, switchOff, tabFor, undo } from "./edit";
import { buildFlow, flowText } from "./render/flow";
import { TEMPLATES } from "./render/templates";
import { fernCv } from "./render/testing";
import { type CvDoc, type EntrySection, type SkillsSection, emptySection, newBullet } from "./schema";

const cv = (): CvDoc => fernCv() as CvDoc;
const section = (c: CvDoc, kind: string) => c.sections.find((s) => s.kind === kind)!;

describe("moving an item", () => {
  it("moves up, down and to any place, and leaves the original list alone", () => {
    const list = ["a", "b", "c", "d"];
    expect(moveItem(list, 2, 1)).toEqual(["a", "c", "b", "d"]);
    expect(moveItem(list, 0, 3)).toEqual(["b", "c", "d", "a"]);
    expect(moveItem(list, 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(list).toEqual(["a", "b", "c", "d"]);
  });

  it("changes nothing when the move is off either end", () => {
    const list = ["a", "b", "c"];
    expect(moveItem(list, 0, -1)).toEqual(list);
    expect(moveItem(list, 2, 3)).toEqual(list);
    expect(moveItem(list, 5, 0)).toEqual(list);
    expect(moveItem(list, 1, 1)).toEqual(list);
  });

  it("moves by id, as a drag and drop does", () => {
    const list = [{ id: "x" }, { id: "y" }, { id: "z" }];
    expect(moveById(list, "z", "x").map((i) => i.id)).toEqual(["z", "x", "y"]);
    expect(moveById(list, "x", "missing").map((i) => i.id)).toEqual(["x", "y", "z"]);
  });
});

describe("the form's tabs", () => {
  it("run Contact, Experience, Education, Skills, added sections, Profile, Finish, whatever order the sections are stored in", () => {
    const c = cv();
    c.sections = [...c.sections].reverse();
    const keys = formTabs(c).map((t) => t.key);
    expect(keys[0]).toBe("contact");
    expect(keys.slice(1, 4)).toEqual(["experience", "education", "skills"]);
    expect(keys.slice(-2)).toEqual(["profile", "finish"]);
    for (const k of keys.slice(4, -2)) expect(["projects", "volunteering", "certificates", "languages", "interests", "awards", "courses", "publications", "achievements"].includes(k) || k.startsWith("s_")).toBe(true);
  });

  it("an added section sits before the profile, and a custom section is addressed by its own id", () => {
    const c = cv();
    const custom = { ...emptySection("custom", "Board roles") };
    c.sections = [...c.sections, custom];
    const tabs = formTabs(c);
    const at = tabs.findIndex((t) => t.key === custom.id);
    expect(tabs[at].label).toBe("Board roles");
    expect(at).toBeLessThan(tabs.findIndex((t) => t.key === "profile"));
  });

  it("uses the region's own headings", () => {
    const c = { ...cv(), region: "us" as const };
    expect(formTabs(c).find((t) => t.key === "profile")!.label).toBe("Summary");
    expect(formTabs({ ...c, region: "uk" }).find((t) => t.key === "profile")!.label).toBe("Profile");
  });

  it("finds the tab for any place in the CV", () => {
    const c = cv();
    expect(tabFor(c, { section: "contact", field: "email" })).toBe("contact");
    expect(tabFor(c, { section: section(c, "experience").id, entry: "x" })).toBe("experience");
    expect(tabFor(c, { section: section(c, "summary").id })).toBe("profile");
    expect(tabFor(c, { section: "gone" })).toBe("contact");
  });
});

describe("from a passage on the paper to its field", () => {
  it("opens the field the passage was printed from", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const e = exp.entries[0];
    expect(fieldFor(c, { section: "contact", field: "phone" })).toEqual({ entry: "", field: "phone" });
    expect(fieldFor(c, { section: exp.id, entry: e.id, field: "title" })).toEqual({ entry: e.id, field: "title" });
    expect(fieldFor(c, { section: exp.id, entry: e.id, field: e.bullets[0].id })).toEqual({ entry: e.id, field: e.bullets[0].id });
    expect(fieldFor(c, { section: section(c, "summary").id, field: "text" })).toEqual({ entry: "", field: "text" });
    const skills = section(c, "skills") as SkillsSection;
    expect(fieldFor(c, { section: skills.id, entry: skills.groups[0].id, field: skills.groups[0].skills[0].id })).toEqual({ entry: skills.groups[0].id, field: "skills" });
  });

  it("marks the line being edited, and only that line", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const [a, b] = exp.entries;
    const head = { section: exp.id, entry: a.id, field: "title" };
    const dates = { section: exp.id, entry: a.id, field: "start" };
    const bullet = { section: exp.id, entry: a.id, field: a.bullets[0].id };
    // The employer is printed on the same line as the job title; the end date on the line with the start date.
    expect(samePassage(c, head, { section: exp.id, entry: a.id, field: "org" })).toBe(true);
    expect(samePassage(c, dates, { section: exp.id, entry: a.id, field: "end" })).toBe(true);
    expect(samePassage(c, dates, { section: exp.id, entry: a.id, field: "location" })).toBe(true);
    expect(samePassage(c, head, { section: exp.id, entry: a.id, field: "end" })).toBe(false);
    expect(samePassage(c, bullet, { section: exp.id, entry: a.id, field: a.bullets[0].id })).toBe(true);
    expect(samePassage(c, bullet, { section: exp.id, entry: a.id, field: a.bullets[1].id })).toBe(false);
    expect(samePassage(c, head, { section: exp.id, entry: b.id, field: "title" })).toBe(false);
    expect(samePassage(c, head, null)).toBe(false);
  });

  it("treats the name and the contact line as two passages", () => {
    const c = cv();
    expect(samePassage(c, { section: "contact", field: "fullName" }, { section: "contact", field: "fullName" })).toBe(true);
    expect(samePassage(c, { section: "contact", field: "location" }, { section: "contact", field: "email" })).toBe(true);
    expect(samePassage(c, { section: "contact", field: "fullName" }, { section: "contact", field: "email" })).toBe(false);
  });

  it("marks a skill group's line whichever skill of it is being edited", () => {
    const c = cv();
    const skills = section(c, "skills") as SkillsSection;
    const [g1, g2] = skills.groups;
    const line = { section: skills.id, entry: g1.id, field: g1.skills[0].id };
    expect(samePassage(c, line, { section: skills.id, entry: g1.id, field: "skills" })).toBe(true);
    expect(samePassage(c, line, { section: skills.id, entry: "", field: g1.skills[1].id })).toBe(true);
    if (g2) expect(samePassage(c, line, { section: skills.id, entry: g2.id, field: "name" })).toBe(false);
  });
});

describe("switching a passage off from the paper", () => {
  const words = (c: CvDoc) => flowText(buildFlow(c, TEMPLATES.standard)).join("\n");

  it("switches off one bullet: it leaves the paper and stays in the CV", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const b = exp.entries[0].bullets[0];
    const out = switchOff(c.sections, { section: exp.id, entry: exp.entries[0].id, field: b.id })!;
    expect(out.what).toBe("bullet");
    const after = { ...c, sections: out.sections };
    expect(words(c)).toContain(b.text);
    expect(words(after)).not.toContain(b.text);
    const kept = (section(after, "experience") as EntrySection).entries[0].bullets[0];
    expect(kept).toMatchObject({ id: b.id, text: b.text, visible: false });
    expect(itemCount(section(after, "experience"))).toBe(itemCount(exp));
    // The original is untouched.
    expect(exp.entries[0].bullets[0].visible).toBe(true);
  });

  it("switches off a whole entry when the passage is its first line", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const e = exp.entries[1];
    const out = switchOff(c.sections, { section: exp.id, entry: e.id, field: "title" })!;
    expect(out.what).toBe("entry");
    const after = { ...c, sections: out.sections };
    expect(words(after)).not.toContain(e.org);
    for (const b of e.bullets) expect(words(after)).not.toContain(b.text);
    expect((section(after, "experience") as EntrySection).entries).toHaveLength(exp.entries.length);
  });

  it("offers nothing for a passage that cannot be switched off on its own", () => {
    const c = cv();
    expect(switchOff(c.sections, { section: "contact", field: "email" })).toBeNull();
    expect(switchOff(c.sections, { section: section(c, "summary").id, field: "text" })).toBeNull();
    expect(switchOff(c.sections, { section: section(c, "experience").id, entry: "gone" })).toBeNull();
  });

  it("counts items, so a removal can be told from an edit", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const fewer = { ...exp, entries: [{ ...exp.entries[0], bullets: exp.entries[0].bullets.slice(1) }, ...exp.entries.slice(1)] };
    expect(itemCount(fewer)).toBe(itemCount(exp) - 1);
    expect(itemCount(section(c, "summary"))).toBe(0);
  });
});

describe("changing and adding bullets", () => {
  it("finds a bullet by its pointer, and nothing for a pointer that names none", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const e = exp.entries[0];
    expect(bulletAt(c.sections, { section: exp.id, entry: e.id, field: e.bullets[1].id })).toMatchObject({ index: 1, bullet: e.bullets[1], entry: e });
    expect(bulletAt(c.sections, { section: exp.id, entry: e.id, field: "title" })).toBeNull();
    expect(bulletAt(c.sections, { section: "contact", field: "email" })).toBeNull();
    expect(bulletAt(c.sections, null)).toBeNull();
  });

  it("changes one bullet and leaves every other word alone", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const e = exp.entries[0];
    const at = { section: exp.id, entry: e.id, field: e.bullets[0].id };
    const next = changeBullet(c.sections, at, { text: "New wording", origin: "assisted" });
    expect(bulletAt(next, at)!.bullet).toMatchObject({ id: e.bullets[0].id, text: "New wording", origin: "assisted" });
    const strip = (sections: typeof c.sections) => JSON.stringify(sections).replace(JSON.stringify(bulletAt(sections, at)!.bullet), "");
    expect(strip(next)).toBe(strip(c.sections));
    expect(e.bullets[0].text).not.toBe("New wording");
  });

  it("adds bullets after the ones an entry already has", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const e = exp.entries[1];
    const out = addBullets(c.sections, exp.id, e.id, [newBullet("One"), newBullet("Two")]);
    const after = (out.sections.find((s) => s.id === exp.id) as EntrySection).entries[1];
    expect(out.entryId).toBe(e.id);
    expect(after.bullets.map((b) => b.text)).toEqual([...e.bullets.map((b) => b.text), "One", "Two"]);
  });

  it("starts a new role at the top when the entry does not exist yet", () => {
    const c = cv();
    const exp = section(c, "experience") as EntrySection;
    const out = addBullets(c.sections, exp.id, "new", [newBullet("Ran the till")], { title: "Shop assistant", org: "Example Books" });
    const entries = (out.sections.find((s) => s.id === exp.id) as EntrySection).entries;
    expect(entries).toHaveLength(exp.entries.length + 1);
    expect(entries[0]).toMatchObject({ id: out.entryId, title: "Shop assistant", org: "Example Books", visible: true });
    expect(entries[0].bullets.map((b) => b.text)).toEqual(["Ran the till"]);
    expect(out.entryId).not.toBe("new");
  });
});

describe("undo and redo", () => {
  const snap = (name: string): Snapshot => ({ ...snapshotOf(cv()), name });

  it("typing in one field without a pause is one step", () => {
    let h = emptyHistory();
    h = record(h, snap("A"), "field-1", 1000);
    h = record(h, snap("Ab"), "field-1", 1300);
    h = record(h, snap("Abc"), "field-1", 1900);
    expect(h.past.map((s) => s.name)).toEqual(["A"]);
    const back = undo(h, snap("Abcd"))!;
    expect(back.snapshot.name).toBe("A");
  });

  it("a pause, or moving to another field, starts a new step", () => {
    let h = emptyHistory();
    h = record(h, snap("A"), "field-1", 1000);
    h = record(h, snap("Ab"), "field-1", 1000 + TYPING_PAUSE_MS + 1);
    h = record(h, snap("Abc"), "field-2", 1000 + TYPING_PAUSE_MS + 50);
    expect(h.past.map((s) => s.name)).toEqual(["A", "Ab", "Abc"]);
  });

  it("every click (a switch, a move, a removal) is its own step", () => {
    let h = emptyHistory();
    h = record(h, snap("1"), "", 1000);
    h = record(h, snap("2"), "", 1001);
    h = record(h, snap("3"), "", 1002);
    expect(h.past).toHaveLength(3);
  });

  it("undo goes back, redo comes forward, and both run out", () => {
    let h = record(record(emptyHistory(), snap("one"), "", 1), snap("two"), "", 2);
    const u1 = undo(h, snap("three"))!;
    expect(u1.snapshot.name).toBe("two");
    const u2 = undo(u1.history, u1.snapshot)!;
    expect(u2.snapshot.name).toBe("one");
    expect(undo(u2.history, u2.snapshot)).toBeNull();
    const r1 = redo(u2.history, u2.snapshot)!;
    expect(r1.snapshot.name).toBe("two");
    const r2 = redo(r1.history, r1.snapshot)!;
    expect(r2.snapshot.name).toBe("three");
    expect(redo(r2.history, r2.snapshot)).toBeNull();
    h = r2.history;
    expect(h.past.map((s) => s.name)).toEqual(["one", "two"]);
  });

  it("a new change after an undo clears what could be redone", () => {
    const h = record(emptyHistory(), snap("one"), "", 1);
    const back = undo(h, snap("two"))!;
    expect(back.history.future).toHaveLength(1);
    expect(record(back.history, back.snapshot, "", 5).future).toHaveLength(0);
  });

  it("typing straight after an undo is a new step, not part of the undone one", () => {
    let h = record(emptyHistory(), snap("one"), "f", 1);
    h = undo(h, snap("two"))!.history;
    h = record(h, snap("one"), "f", 2);
    expect(h.past.map((s) => s.name)).toEqual(["one"]);
  });

  it("keeps the last hundred steps", () => {
    let h = emptyHistory();
    for (let i = 0; i < 130; i++) h = record(h, snap(String(i)), "", i);
    expect(h.past).toHaveLength(100);
    expect(h.past[0].name).toBe("30");
  });
});

describe("two copies of the same CV", () => {
  it("are the same when nothing differs", () => {
    const one = cv();
    expect(diffParts(snapshotOf(one), snapshotOf(structuredClone(one)))).toEqual([]);
  });

  it("lists each part that differs, with both wordings", () => {
    const mine = cv();
    const theirs = structuredClone(mine);
    mine.contact = { ...mine.contact, phone: "07700 900111" };
    const exp = section(theirs, "experience") as EntrySection;
    exp.entries[0].bullets[0].text = "Changed in the other tab";
    exp.entries[1].visible = false;
    theirs.design = { ...theirs.design, template: "executive" };
    const diff = diffParts(snapshotOf(mine), snapshotOf(theirs));
    expect(diff.map((d) => d.label)).toEqual(["Contact", "Experience", "Layout"]);
    expect(diff[0].mine).toContain("07700 900111");
    expect(diff[0].theirs).not.toContain("07700 900111");
    expect(diff[1].theirs.join("\n")).toContain("• Changed in the other tab");
    expect(diff[1].theirs.join("\n")).toContain("(off)");
    expect(diff[2].mine[0]).toBe("Template: standard");
    expect(diff[2].theirs[0]).toBe("Template: executive");
  });

  it("shows a section that only one copy has", () => {
    const mine = cv();
    const theirs = structuredClone(mine);
    mine.sections = [...mine.sections, { ...emptySection("custom", "Board roles") }];
    const diff = diffParts(snapshotOf(mine), snapshotOf(theirs));
    const board = diff.find((d) => d.label === "Board roles")!;
    expect(board.theirs).toEqual(["(not in this copy)"]);
    expect(diff.some((d) => d.label === "Order of sections in the form")).toBe(true);
  });
});
