import { describe, expect, it } from "vitest";
import { type CvDoc, type Letter, newBullet } from "../schema";
import { acceptSources, checkSentence, clausesOf, letterIsEmpty, paragraphText, recordSources, reflow, reviewLetter, splitSentences } from "./check";
import { letterByRule } from "./draft";
import { evidenceLines, poolOf, sourceState } from "./sources";
import { NOW, REASON, experience, letterCv, lineAt } from "./testing";

const cv = letterCv();
const pool = poolOf(cv, NOW);
const check = (text: string, from = pool) => checkSentence(text, from);
const says = (text: string, from = pool) => check(text, from).problems.map((p) => p.say);
const kinds = (text: string, from = pool) => check(text, from).sources.map((s) => s.kind);

/** The sample CV with a drafted letter in place. */
function drafted(change: (cv: CvDoc) => void = () => {}): CvDoc {
  const base = letterCv();
  const letter: Letter = { ...base.letter!, paragraphs: letterByRule(base, NOW).paragraphs, started: true };
  const out = { ...base, letter };
  change(out);
  return out;
}

describe("what a letter may rest on", () => {
  it("is every line of the CV that is switched on, the reason, the notes and the advert", () => {
    expect(pool.personal.some((s) => s.kind === "cv" && s.text.startsWith("Wrote a handling guide"))).toBe(true);
    expect(pool.personal.some((s) => s.kind === "cv" && s.text.includes("Archive assistant · Paper Kite Archive"))).toBe(true);
    expect(pool.personal.filter((s) => s.kind === "reason").map((s) => s.text)).toEqual([REASON]);
    expect(pool.employer.some((s) => s.text === "Experience training volunteers")).toBe(true);
    expect(pool.job[0].text).toBe("Collections officer, Lantern Atlas");
  });

  it("leaves out anything switched off", () => {
    const off = letterCv();
    experience(off).entries[0].bullets[1].visible = false;
    experience(off).entries[1].visible = false;
    const p = poolOf(off, NOW);
    expect(p.personal.some((s) => s.text.startsWith("Wrote a handling guide"))).toBe(false);
    expect(p.personal.some((s) => s.text.includes("Folio House"))).toBe(false);
  });

  it("offers as evidence the lines that say what the person did", () => {
    const lines = evidenceLines(cv, NOW);
    expect(lines.every((l) => /^b_|^[a-z0-9]/i.test(l.at?.field ?? ""))).toBe(true);
    expect(lines.map((l) => l.text)).toContain("Trained six new starters on the café till & the catalogue.");
    expect(lines.some((l) => l.text === "Excel")).toBe(false);
  });
});

describe("the parts of a sentence", () => {
  it("tells what is about the person from what is about the employer", () => {
    expect(clausesOf("Your advert asks for volunteer training; at Folio House I trained six new starters.", "Lantern Atlas").map((c) => c.about)).toEqual(["employer", "me"]);
    expect(clausesOf("I am applying for the Collections officer role at Lantern Atlas.", "Lantern Atlas")[0].about).toBe("both");
    expect(clausesOf("The role combines cataloguing and enquiries.", "Lantern Atlas")[0].about).toBe("employer");
  });

  it("gives a part that names nobody to the part beside it", () => {
    expect(clausesOf("I wrote a handling guide – 40 pages, used at every induction.", "").map((c) => c.about)).toEqual(["me", "me"]);
  });
});

describe("a sentence about the person", () => {
  it("passes when the CV says it, and names the line", () => {
    const c = check("I wrote the handling guidance now used by 40 volunteers.");
    expect(c.status).toBe("sourced");
    expect(c.sources[0]).toMatchObject({ kind: "cv" });
    expect(c.sources[0].text).toContain("handling guidance now used by 40 volunteers");
  });

  it("passes when the reason or a note says it", () => {
    expect(kinds("I have loved maps since I was a child.")).toEqual(["reason"]);
    const noted = poolOf(letterCv({ notes: [{ id: "ln_1", text: "I ran the Saturday family workshops for two summers." }] }), NOW);
    expect(check("I ran the Saturday family workshops for two summers.", noted)).toMatchObject({ status: "sourced", sources: [{ kind: "note", noteId: "ln_1" }] });
  });

  it("is refused for a figure that is not theirs, with the figure named", () => {
    expect(says("I wrote the handling guidance now used by 400 volunteers.")).toEqual(["This says “400”, which isn’t in your CV, your reason or your notes."]);
  });

  it("is refused for a figure borrowed from a line about something else", () => {
    // "six" is on the CV, about pupils and about new starters. Not about maps.
    expect(says("At Paper Kite Archive, I catalogued six maps.")).toEqual(["No line in your CV, your reason or your notes says “six maps”: the figure “six” is there about something else."]);
    expect(check("At Folio House, I trained six new starters.").status).toBe("sourced");
  });

  it("is refused for praise and character words they never wrote", () => {
    expect(says("I am a quick learner and enjoy working with people.").join(" ")).toMatch(/“quick”.*“learner”.*“enjoy”.*“people”/);
    expect(says("I am excited by your work on new acquisitions.")).toEqual(["This says “excited”, which isn’t in your CV, your reason or your notes."]);
  });

  it("is refused when it claims more of the work than the CV does", () => {
    expect(says("I led the cataloguing team at Paper Kite Archive.")[0]).toContain("“led”");
  });

  it("may state the years of work, worked out from the dates of the roles", () => {
    const years = pool.years!;
    expect(years).toBeGreaterThan(3);
    expect(check(`I have ${years} years of experience.`).status).toBe("sourced");
    expect(check(`I have ${years + 4} years of experience.`).status).toBe("unsupported");
  });
});

describe("words from the advert are not the person's experience", () => {
  it("refuses a skill that is only in the advert, and says where it is", () => {
    expect(says("I have five years’ experience with Spectrum.")).toContain("“Spectrum” is in the advert, not in your CV, your reason or your notes. As written, this says it is yours.");
    expect(check("I am fluent in French.").status).toBe("unsupported");
    expect(check("I have used Spectrum.").status).toBe("unsupported");
    expect(check("Experienced with Spectrum.").status).toBe("unsupported");
  });

  it("lets the person say what they want to do there, in the advert's words", () => {
    const c = check("I would welcome the chance to catalogue new acquisitions and answer enquiries from researchers.");
    expect(c.status).toBe("sourced");
    expect(c.sources.map((s) => s.kind)).toEqual(["advert"]);
    expect(check("I am interested in your work on new acquisitions.").status).toBe("sourced");
  });

  it("but not once the wish is dressed as experience", () => {
    expect(check("I would bring experience of Spectrum.").status).toBe("unsupported");
  });
});

describe("a sentence about the employer", () => {
  it("passes when the advert says it", () => {
    expect(check("Your advert asks for experience training volunteers.")).toMatchObject({ status: "sourced", sources: [{ kind: "advert", text: "Experience training volunteers" }] });
  });

  it("is refused when the advert does not, even if the person's own CV has the words", () => {
    expect(says("You hold 3,200 maps.")).toContain("This says “3,200” about the employer. That is in your own CV or notes, not in the advert.");
    expect(check("Lantern Atlas is the UK’s leading map museum.").status).toBe("unsupported");
  });

  it("checks each part of a mixed sentence against its own kind of source", () => {
    const c = check("Your advert asks for experience training volunteers; at Folio House I trained six new starters.");
    expect(c.status).toBe("sourced");
    expect(c.sources.map((s) => s.kind)).toEqual(["advert", "cv", "cv"]);
  });
});

describe("sentences that claim nothing", () => {
  it.each(["Thank you for considering my application.", "I look forward to hearing from you.", "I’d welcome the chance to talk.", "Please find my CV attached."])("need no source: %s", (text) => {
    expect(check(text)).toMatchObject({ status: "plain", problems: [], sources: [] });
  });

  it("the job itself is the source for naming the job", () => {
    expect(check("I am writing to apply for the Collections officer role at Lantern Atlas.")).toMatchObject({ status: "sourced", sources: [{ kind: "job" }] });
    expect(check("I’m applying for the Collections officer role at Lantern Atlas.").status).toBe("sourced");
  });
});

describe("reviewing a whole letter", () => {
  it("passes a letter assembled from the person's own words, sentence by sentence", () => {
    const r = reviewLetter(drafted(), NOW);
    expect(r.sentences.length).toBeGreaterThanOrEqual(5);
    expect(r.open).toEqual([]);
    expect(r.sentences.every((s) => s.state === "sourced" || s.state === "plain")).toBe(true);
    expect(r.words).toBeGreaterThan(40);
  });

  it("applies the same review to a sentence typed by hand", () => {
    const d = drafted((c) => {
      c.letter!.paragraphs[1].sentences = reflow(c.letter!.paragraphs[1].sentences, `${paragraphText(c.letter!.paragraphs[1])} I also managed a budget of £40,000.`);
    });
    const r = reviewLetter(d, NOW);
    expect(r.open).toHaveLength(1);
    expect(r.open[0]).toMatchObject({ state: "unsupported", text: "I also managed a budget of £40,000." });
    expect(r.open[0].problems.map((p) => p.say).join(" ")).toContain("£40,000");
  });

  it("marks only the affected sentences “Review source” when a CV line they rest on changes", () => {
    const d = drafted();
    const before = reviewLetter(d, NOW);
    experience(d).entries[1].bullets[1].text = "Trained eight new starters on the café till & the catalogue.";
    const after = reviewLetter(d, NOW);
    const changed = after.sentences.filter((s) => s.state === "review");
    expect(changed).toHaveLength(1);
    expect(changed[0].text).toContain("I trained six new starters");
    expect(changed[0].changed[0]).toMatchObject({ state: "changed", now: "Trained eight new starters on the café till & the catalogue." });
    expect(changed[0].changed[0].was.text).toBe("Trained six new starters on the café till & the catalogue.");
    // Every other sentence is as it was.
    expect(after.sentences.filter((s) => s.state !== "review").map((s) => s.state)).toEqual(before.sentences.filter((s) => !s.text.includes("six new starters")).map((s) => s.state));
  });

  it("says when the line was switched off, and when it is gone", () => {
    const off = drafted((c) => void (experience(c).entries[1].bullets[1].visible = false));
    expect(reviewLetter(off, NOW).open[0].changed[0].state).toBe("off");
    const gone = drafted((c) => void experience(c).entries[1].bullets.splice(1, 1));
    expect(reviewLetter(gone, NOW).open[0].changed[0].state).toBe("gone");
  });

  it("marks the sentences that rested on the reason when the reason is rewritten", () => {
    const d = drafted((c) => void (c.letter!.reason = "I want a job nearer home."));
    const r = reviewLetter(d, NOW);
    expect(r.open.map((s) => s.text)).toEqual(["I've loved maps since I was a child, and I want to work somewhere that opens its collection to the public."]);
    expect(r.open[0].state).toBe("review");
  });

  it("a letter with nothing in it has nothing to review", () => {
    expect(reviewLetter(letterCv(), NOW)).toMatchObject({ sentences: [], open: [], words: 0 });
    expect(letterIsEmpty(letterCv().letter)).toBe(true);
    expect(letterIsEmpty(drafted().letter)).toBe(false);
  });
});

describe("noting what a sentence rests on", () => {
  it("is done when the sentence is written, and left alone afterwards", () => {
    const d = drafted((c) => {
      c.letter!.paragraphs[2].sentences = reflow(c.letter!.paragraphs[2].sentences, "At Folio House, I prepared reading-room requests for visiting researchers.");
    });
    expect(d.letter!.paragraphs[2].sentences[0].sources).toEqual([]);
    const noted = recordSources(d.letter!, d, NOW);
    expect(noted.paragraphs[2].sentences[0].sources.map((s) => s.kind)).toEqual(["cv", "cv"]);
    // A second pass changes nothing: the same object comes back.
    expect(recordSources(noted, { ...d, letter: noted }, NOW)).toBe(noted);
  });

  it("does not note anything for a sentence that has no source", () => {
    const d = drafted((c) => void (c.letter!.paragraphs[2].sentences = reflow([], "I speak fluent Japanese.")));
    expect(recordSources(d.letter!, d, NOW).paragraphs[2].sentences[0].sources).toEqual([]);
  });

  it("“It still holds” re-reads the line as it is now, and refuses when the sentence no longer matches it", () => {
    const d = drafted();
    const id = d.letter!.paragraphs[2].sentences.find((s) => s.text.includes("six new starters"))!.id;
    // The line gains a detail: the sentence still holds.
    experience(d).entries[1].bullets[1].text = "Trained six new starters on the café till & the catalogue each autumn.";
    const kept = acceptSources(d.letter!, id, d, NOW)!;
    expect(reviewLetter({ ...d, letter: kept }, NOW).open).toEqual([]);
    // The figure changes: it does not.
    experience(d).entries[1].bullets[1].text = "Trained eight new starters on the café till & the catalogue.";
    expect(acceptSources(d.letter!, id, d, NOW)).toBeNull();
  });

  it("knows whether a noted source still reads the same", () => {
    const d = drafted();
    const at = lineAt(d, 1, 1);
    const p = poolOf(d, NOW);
    expect(sourceState({ kind: "cv", at, text: "Trained six new starters on the café till & the catalogue." }, d, p).state).toBe("same");
    expect(sourceState({ kind: "cv", at, text: "Trained five new starters." }, d, p)).toMatchObject({ state: "changed", now: "Trained six new starters on the café till & the catalogue." });
    expect(sourceState({ kind: "advert", text: "Experience training volunteers" }, d, p).state).toBe("same");
    expect(sourceState({ kind: "advert", text: "Experience training dragons" }, d, p).state).toBe("gone");
    expect(sourceState({ kind: "note", noteId: "ln_x", text: "Anything" }, d, p).state).toBe("gone");
  });

  it("a new line added to the CV can back a sentence that had no source", () => {
    const d = drafted((c) => void (c.letter!.paragraphs[2].sentences = reflow([], "At Folio House, I ran the Saturday family workshops.")));
    expect(reviewLetter(d, NOW).open).toHaveLength(1);
    experience(d).entries[1].bullets.push(newBullet("Ran the Saturday family workshops"));
    expect(reviewLetter(d, NOW).open).toEqual([]);
  });
});

describe("editing a paragraph", () => {
  it("splits text into sentences, keeping each as typed", () => {
    expect(splitSentences("I am applying for the role. I’ve worked with maps, e.g. Ordnance Survey sheets. Thank you!")).toEqual(["I am applying for the role.", "I’ve worked with maps, e.g. Ordnance Survey sheets.", "Thank you!"]);
    expect(splitSentences("  ")).toEqual([]);
  });

  it("keeps the sentences that were not touched, with what they rest on", () => {
    const d = drafted();
    const old = d.letter!.paragraphs[0].sentences;
    const next = reflow(old, `${paragraphText(d.letter!.paragraphs[0])} I can start in January.`);
    expect(next.slice(0, old.length)).toEqual(old);
    expect(next[old.length]).toMatchObject({ text: "I can start in January.", origin: "typed", sources: [] });
  });

  it("treats a changed sentence as a new one, to be checked afresh", () => {
    const d = drafted();
    const old = d.letter!.paragraphs[2].sentences;
    const target = old.find((s) => s.text.includes("six new starters"))!;
    const next = reflow(old, paragraphText(d.letter!.paragraphs[2]).replace("six new starters", "sixty new starters"));
    const changed = next.find((s) => s.text.includes("sixty"))!;
    expect(changed.id).not.toBe(target.id);
    expect(changed.sources).toEqual([]);
  });
});
