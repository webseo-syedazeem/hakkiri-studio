import { describe, expect, it } from "vitest";
import type { CvDoc, Letter } from "../schema";
import { newBullet } from "../schema";
import { checkSentence, paragraphText, reviewLetter } from "./check";
import { asSentence, blankParagraphs, defaultSignoff, greeting, insertEvidence, letterByRule, lineSentence, shortenings, tidySentence, voiceOf } from "./draft";
import { poolOf } from "./sources";
import { NOW, REASON, experience, letterCv, lineAt } from "./testing";

const text = (cv: CvDoc) => letterByRule(cv, NOW).paragraphs.map((p) => p.sentences.map((s) => s.text));
/** The sample letter CV for a region, with the first line of its second role changed. */
function letterCvWith(region: "uk" | "us", line: string): CvDoc {
  const c = letterCv({}, region);
  experience(c).entries[1].bullets[0].text = line;
  return c;
}

describe("how the person writes", () => {
  it("notices contractions, and uses them only if they do", () => {
    expect(voiceOf(["I've loved maps since I was a child. I don't want to leave York."]).contractions).toBe(true);
    expect(voiceOf(["I have loved maps since I was a child. I do not want to leave York."]).contractions).toBe(false);
    expect(voiceOf([""]).contractions).toBe(false);
  });

  it("uses their own word for the job, and their own word for talking", () => {
    expect(voiceOf(["This position suits me. The position is in York."]).roleWord).toBe("position");
    expect(voiceOf(["I want this job."]).roleWord).toBe("job");
    expect(voiceOf(["Maps."]).roleWord).toBe("role");
    expect(voiceOf(["I would like to discuss it."]).talkWord).toBe("discuss");
    expect(voiceOf(["I'd love to chat."]).talkWord).toBe("talk about");
  });

  it("carries their formality into the letter", () => {
    const casual = letterByRule(letterCv({ reason: "I've loved maps since I was a child. This job is the one I want." }), NOW);
    expect(casual.paragraphs[0].sentences[0].text).toBe("I’m applying for the Collections officer job at Lantern Atlas.");
    expect(casual.paragraphs.at(-1)!.sentences[0].text).toBe("I’d welcome the chance to talk about how I could contribute to Lantern Atlas.");
    expect(casual.signoff).toBe("Kind regards");
    const formal = letterByRule(letterCv({ reason: "I have loved maps since I was a child. I would like to discuss the position." }), NOW);
    expect(formal.paragraphs[0].sentences[0].text).toBe("I am applying for the Collections officer position at Lantern Atlas.");
    expect(formal.paragraphs.at(-1)!.sentences[0].text).toBe("I would welcome the chance to discuss how I could contribute to Lantern Atlas.");
    expect(formal.signoff).toBe("Yours faithfully");
  });
});

describe("greeting and sign-off", () => {
  it("is “Dear Hiring Manager” when no recipient is given", () => {
    expect(greeting("")).toBe("Dear Hiring Manager,");
    expect(greeting("  ")).toBe("Dear Hiring Manager,");
    expect(greeting("Dr Okafor")).toBe("Dear Dr Okafor,");
  });

  it("signs off to match: by name “sincerely”, to nobody named “faithfully”, and “Sincerely” in the US", () => {
    expect(defaultSignoff("uk", "")).toBe("Yours faithfully");
    expect(defaultSignoff("uk", "Dr Okafor")).toBe("Yours sincerely");
    expect(defaultSignoff("us", "")).toBe("Sincerely");
  });
});

describe("a line of the CV as a sentence", () => {
  const cv = letterCv();
  it("says the same thing in the first person, with where it happened", () => {
    expect(lineSentence(cv, lineAt(cv, 1, 1))).toBe("At Folio House, I trained six new starters on the café till & the catalogue.");
    expect(lineSentence(cv, lineAt(cv, 1, 0))).toBe("At Folio House, I prepared reading-room requests for visiting researchers.");
  });

  it("uses “I also” for a second line from the same role", () => {
    expect(lineSentence(cv, lineAt(cv, 1, 0), true)).toBe("I also prepared reading-room requests for visiting researchers.");
  });

  it("handles lines that do not start with what was done", () => {
    const c = letterCv();
    const e = experience(c).entries[1];
    e.bullets.push(newBullet("Responsible for the weekend rota"), newBullet("Managing the returns desk on Saturdays"), newBullet("Volunteer of the Year 2022"), newBullet("Experienced in handling fragile items"));
    const at = (i: number) => ({ section: experience(c).id, entry: e.id, field: e.bullets[i].id });
    expect(lineSentence(c, at(2))).toBe("At Folio House, I was responsible for the weekend rota.");
    expect(lineSentence(c, at(3))).toBe("At Folio House, my work included managing the returns desk on Saturdays.");
    // Not something done: given as what the CV says, in a whole sentence, rather than turned into "I …" or left as a fragment.
    expect(lineSentence(c, at(4))).toBe("At Folio House, my CV says: “Volunteer of the Year 2022”.");
    expect(lineSentence(c, at(5))).toBe("At Folio House, my CV says: “Experienced in handling fragile items”.");
    expect(lineSentence(c, at(4), true)).toBe("My CV also says: “Volunteer of the Year 2022”.");
    const us = letterCvWith("us", "Volunteer of the Year 2022");
    expect(lineSentence(us, lineAt(us, 1, 0))).toBe("At Folio House, my resume says: “Volunteer of the Year 2022”.");
  });

  it("a present-tense line of a role that has not ended gets its “I”: no bare fragments", () => {
    const c = letterCv();
    const role = experience(c).entries[0];
    expect(role.current).toBe(true);
    const say = (line: string) => {
      role.bullets[0].text = line;
      return lineSentence(c, lineAt(c, 0, 0));
    };
    expect(say("Schedule 40 drivers a day across three depots")).toBe("At Paper Kite Archive, I schedule 40 drivers a day across three depots.");
    expect(say("Lead a team of five dispatchers")).toBe("At Paper Kite Archive, I lead a team of five dispatchers.");
    expect(say("Plan and schedule daily routes for 60 drivers")).toBe("At Paper Kite Archive, I plan and schedule daily routes for 60 drivers.");
    expect(say("Process supplier invoices each week")).toBe("At Paper Kite Archive, I process supplier invoices each week.");
    expect(say("Report on-time performance to the depot manager weekly")).toBe("At Paper Kite Archive, I report on-time performance to the depot manager weekly.");
    expect(say("Was promoted twice in three years")).toBe("At Paper Kite Archive, I was promoted twice in three years.");
    expect(say("Have managed budgets of £2m")).toBe("At Paper Kite Archive, I have managed budgets of £2m.");
    // The same words as a noun are not something done: they are given as what the CV says.
    expect(say("Schedule of works for the new depot")).toBe("At Paper Kite Archive, my CV says: “Schedule of works for the new depot”.");
    expect(say("Support for three regional teams")).toBe("At Paper Kite Archive, my CV says: “Support for three regional teams”.");
    expect(say("Design lead for the routing app")).toBe("At Paper Kite Archive, my CV says: “Design lead for the routing app”.");
    // Every one of these is a whole sentence that passes the letter's own check against the CV.
    for (const line of ["Schedule 40 drivers a day across three depots", "Lead a team of five dispatchers", "Was promoted twice in three years", "Schedule of works for the new depot"]) {
      const text = say(line)!;
      expect(checkSentence(text, poolOf(c, NOW)).status, text).not.toBe("unsupported");
      expect(text).toMatch(/^At Paper Kite Archive, (?:I|my CV says:) /);
    }
  });

  it("in a role that has ended, a present-tense line is not given a tense it may not have", () => {
    const c = letterCv();
    const role = experience(c).entries[1];
    expect(role.current || !role.end).toBe(false);
    role.bullets[0].text = "Schedule 40 drivers a day across three depots";
    expect(lineSentence(c, lineAt(c, 1, 0))).toBe("At Folio House, my CV says: “Schedule 40 drivers a day across three depots”.");
  });

  it("reads a present-tense line of a current role as something done, but not a job-title noun", () => {
    const c = letterCv();
    expect(lineSentence(c, lineAt(c, 0, 0))).toBe("At Paper Kite Archive, I catalogue incoming paper maps and record their condition.");
    experience(c).entries[0].bullets[0].text = "Lead developer on the map viewer";
    expect(lineSentence(c, lineAt(c, 0, 0))).toBe("At Paper Kite Archive, my CV says: “Lead developer on the map viewer”.");
  });

  it("keeps a supporting word: “helped” stays “helped”", () => {
    const c = letterCv();
    experience(c).entries[1].bullets[1].text = "Helped train six new starters";
    expect(lineSentence(c, lineAt(c, 1, 1))).toBe("At Folio House, I helped train six new starters.");
  });

  it("gives nothing for a line that is switched off or gone", () => {
    const c = letterCv();
    experience(c).entries[1].bullets[1].visible = false;
    expect(lineSentence(c, lineAt(c, 1, 1))).toBeNull();
    expect(lineSentence(c, { section: "s_nope", entry: "e_nope", field: "b_nope" })).toBeNull();
  });

  it("makes a sentence of any text without changing its words", () => {
    expect(asSentence("i want this job")).toBe("I want this job.");
    expect(asSentence("Is it open?")).toBe("Is it open?");
  });
});

describe("a reason longer than an opening paragraph", () => {
  it("is used from the start, and the letter says how much of it was left out", () => {
    const long = Array.from({ length: 6 }, (_, i) => `I have spent ${i + 2} years working with paper maps and want to do more of it.`).join(" ");
    const draft = letterByRule(letterCv({ reason: long }), NOW);
    // The opening: the sentence saying which job, then the first three of the person's own.
    expect(draft.paragraphs[0].sentences).toHaveLength(4);
    expect(draft.notes).toContain("Your reason is longer than an opening paragraph holds, so only the start of it was used: the last 3 sentences were left out. All of it is still under “Why do you want this role?”.");
    // A reason that fits says nothing of the kind.
    expect(letterByRule(letterCv(), NOW).notes.join(" ")).not.toMatch(/longer than an opening paragraph/);
  });
});

describe("the letter assembled by rule", () => {
  const cv = letterCv();
  const draft = letterByRule(cv, NOW);

  it("is an opening from their reason, a paragraph for each role's evidence and a short close", () => {
    expect(draft.paragraphs.map((p) => p.role)).toEqual(["opening", "evidence", "evidence", "close"]);
    expect(text(cv)).toEqual([
      ["I’m applying for the Collections officer role at Lantern Atlas.", REASON],
      ["At Paper Kite Archive, I wrote a handling guide for volunteers working with fragile maps – 40 pages, used at every induction since March 2024."],
      ["At Folio House, I trained six new starters on the café till & the catalogue."],
      ["I’d welcome the chance to talk about how I could contribute to Lantern Atlas.", "Thank you for considering my application."],
    ]);
  });

  it("uses the person's reason word for word", () => {
    expect(paragraphText(draft.paragraphs[0])).toContain(REASON);
  });

  it("passes its own review: every sentence is sourced or claims nothing", () => {
    const pool = poolOf(cv, NOW);
    for (const p of draft.paragraphs) for (const s of p.sentences) expect(checkSentence(s.text, pool).status, s.text).not.toBe("unsupported");
    expect(reviewLetter({ ...cv, letter: { ...cv.letter!, paragraphs: draft.paragraphs } }, NOW).open).toEqual([]);
  });

  it("notes with each sentence the lines it was made from", () => {
    const evidence = draft.paragraphs[2].sentences[0];
    expect(evidence.origin).toBe("drafted");
    expect(evidence.sources.map((s) => [s.kind, s.text])).toEqual([
      ["cv", "Trained six new starters on the café till & the catalogue."],
      ["cv", "Library assistant · Folio House · Leeds · Aug 2021 – Aug 2023"],
    ]);
    expect(draft.paragraphs[0].sentences[1].sources.map((s) => s.kind)).toEqual(["reason"]);
  });

  it("says what the advert asks for, in its words, when a chosen line is evidence of it", () => {
    const c = letterCv();
    experience(c).entries[1].bullets[1].text = "Trained 14 volunteers to handle paper safely";
    const out = letterByRule(c, NOW).paragraphs.find((p) => p.sentences.some((s) => s.text.includes("14 volunteers")))!;
    expect(out.sentences.map((s) => s.text)).toEqual(["Your advert asks for experience training volunteers.", "At Folio House, I trained 14 volunteers to handle paper safely."]);
    expect(out.sentences[0].sources).toEqual([{ kind: "advert", at: undefined, noteId: undefined, text: "Experience training volunteers" }]);
  });

  it("puts two lines from the same role in one paragraph", () => {
    const c = letterCv();
    c.letter!.evidence = [lineAt(c, 1, 0), lineAt(c, 1, 1)];
    const evidence = letterByRule(c, NOW).paragraphs.filter((p) => p.role === "evidence");
    expect(evidence).toHaveLength(1);
    expect(evidence[0].sentences.map((s) => s.text)).toEqual(["At Folio House, I prepared reading-room requests for visiting researchers.", "I also trained six new starters on the café till & the catalogue."]);
  });

  it("leaves out a sentence of the reason that says something about the employer the advert does not, and says so", () => {
    const c = letterCv({ reason: `${REASON} Lantern Atlas does that better than anyone.` });
    const out = letterByRule(c, NOW);
    expect(paragraphText(out.paragraphs[0])).not.toContain("better than anyone");
    expect(out.notes).toEqual(["One sentence of your reason was left out: it says something about the employer that isn’t in the advert."]);
  });

  it("adds no claim: every word that carries one is in the CV, the reason or the advert", () => {
    const all = text(cv).flat().join(" ");
    for (const invented of ["passionate", "excited", "proven", "track record", "team player", "Spectrum", "French", "degree"]) expect(all).not.toContain(invented);
  });

  it("leaves out a chosen line that is no longer on this version, and says so", () => {
    const c = letterCv();
    experience(c).entries[1].bullets[1].visible = false;
    const out = letterByRule(c, NOW);
    expect(out.paragraphs.filter((p) => p.role === "evidence")).toHaveLength(1);
    expect(out.notes).toContain("A line you chose is no longer on this version, so it was left out.");
  });

  it("still makes a letter with no employer or title given", () => {
    const c = letterCv();
    c.target = { title: "", employer: "", advert: "" };
    const out = letterByRule(c, NOW);
    expect(out.paragraphs[0].sentences[0].text).toBe("I’m applying for this role.");
    expect(out.paragraphs.at(-1)!.sentences[0].text).toBe("I’d welcome the chance to talk about how I could contribute.");
  });
});

describe("writing it yourself", () => {
  it("starts from three empty paragraphs", () => {
    expect(blankParagraphs().map((p) => [p.role, p.sentences.length])).toEqual([["opening", 0], ["evidence", 0], ["close", 0]]);
  });

  it("inserts a CV line as a sentence, into the evidence paragraph", () => {
    const cv = letterCv();
    const letter: Letter = { ...cv.letter!, paragraphs: blankParagraphs(), started: true };
    const next = insertEvidence(letter, cv, lineAt(cv, 1, 1), NOW)!;
    expect(next.paragraphs[1].sentences.map((s) => s.text)).toEqual(["At Folio House, I trained six new starters on the café till & the catalogue."]);
    expect(next.paragraphs[1].sentences[0].sources[0]).toMatchObject({ kind: "cv", at: lineAt(cv, 1, 1) });
    // A second line from the same role follows on with "I also".
    const again = insertEvidence(next, cv, lineAt(cv, 1, 0), NOW)!;
    expect(again.paragraphs[1].sentences[1].text).toBe("I also prepared reading-room requests for visiting researchers.");
    // A line from another role starts with where it happened.
    const other = insertEvidence(again, cv, lineAt(cv, 0, 0), NOW)!;
    expect(other.paragraphs[1].sentences[2].text).toBe("At Paper Kite Archive, I catalogue incoming paper maps and record their condition.");
  });
});

describe("shortening a paragraph without losing its sources", () => {
  it("cuts filler and nothing else", () => {
    expect(tidySentence("In order to do this, I very carefully trained a wide range of volunteers as well as staff.")).toBe("To do this, I carefully trained volunteers and staff.");
    expect(tidySentence("At Folio House, I trained six new starters.")).toBe("At Folio House, I trained six new starters.");
  });

  it("offers to cut filler, or to take out one sentence, and says how many words each saves", () => {
    const cv = letterCv();
    const letter: Letter = { ...cv.letter!, paragraphs: letterByRule(cv, NOW).paragraphs };
    const close = letter.paragraphs.at(-1)!;
    const review = reviewLetter({ ...cv, letter }, NOW).sentences;
    const options = shortenings(close, review);
    // Nothing to tidy here; the sentence that claims nothing is offered first.
    expect(options.map((o) => o.label)).toEqual(["Take out: “Thank you for considering my application.”", "Take out: “I’d welcome the chance to talk about how I could contribute to…”"]);
    expect(options[0].saves).toBe(6);
    expect(options[0].paragraph.sentences).toEqual([close.sentences[0]]);
  });

  it("keeps the other sentences exactly as they were, sources and all", () => {
    const cv = letterCv();
    const p = { ...letterByRule(cv, NOW).paragraphs[0] };
    p.sentences = [...p.sentences, { id: "ls_x", text: "I am really very keen to start.", origin: "typed" as const, sources: [] }];
    const tidy = shortenings(p, []).find((o) => o.id === "tidy")!;
    expect(tidy.paragraph.sentences.slice(0, 2)).toEqual(p.sentences.slice(0, 2));
    expect(tidy.paragraph.sentences[2].text).toBe("I am keen to start.");
    expect(tidy.saves).toBe(2);
  });

  it("offers nothing for a one-sentence paragraph with no filler", () => {
    const cv = letterCv();
    expect(shortenings(letterByRule(cv, NOW).paragraphs[2], [])).toEqual([]);
  });
});
