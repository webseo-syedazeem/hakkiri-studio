import { describe, expect, it } from "vitest";
import { type CvDoc, emptyContact, emptyEntry, emptyLetter, emptySection, newBullet } from "../schema";
import { extractRequirements } from "../tailor/requirements";
import { checkSentence, clausesOf, reviewLetter } from "./check";
import { letterByRule } from "./draft";
import { poolOf } from "./sources";
import { NOW, letterCv } from "./testing";

/**
 * The letter's source check, attacked. Two lists: sentences that are invented
 * and must be refused, and ordinary honest sentences that must pass. The first
 * of each are the ones an independent review found on the wrong side; the rest
 * are there so the rule cannot be bent to fit those few.
 */

const ADVERT = `Collections Assistant
Aire Museum, Leeds

The role
You will catalogue new acquisitions using Spectrum and Adlib.

Essential
- Experience of managing a team of volunteers
- A confident user of collections management systems
- Experience with Spectrum

Desirable
- Fluent French`;

function cvWith(lines: string[], reason: string, more: Partial<CvDoc> = {}): CvDoc {
  const exp = emptySection("experience");
  if (exp.kind !== "experience") throw new Error("no experience section");
  exp.entries = [{ ...emptyEntry(), title: "Collections volunteer", org: "Hall Lane Archive", start: "2020-01", end: "2021-12", bullets: lines.map((t) => newBullet(t)) }];
  const edu = emptySection("education");
  if (edu.kind !== "education") throw new Error("no education section");
  edu.entries = [{ ...emptyEntry(), title: "BA (Hons)", subject: "History", org: "University of Leeds", start: "2016", end: "2019" }];
  return {
    id: "cv_00000000000000a1",
    userId: "usr_test",
    rev: 1,
    name: "Sam",
    kind: "tailored",
    level: "early",
    region: "uk",
    contact: { ...emptyContact(), fullName: "Sam Example", location: "Leeds" },
    sections: [exp, edu],
    design: { template: "standard", pageSize: "a4", density: "default", pageTarget: 1 },
    accepted: [],
    changes: [],
    requirements: extractRequirements(ADVERT),
    target: { title: "Collections assistant", employer: "Aire Museum", advert: ADVERT },
    letter: { ...emptyLetter(), reason },
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...more,
  };
}

/** The reviewer's first case: one line on the CV, and a reason that says what the person has NOT done. */
const student = poolOf(cvWith(["Served customers and handled the till"], "I want this role because I like museums. I have not worked in a museum before."), NOW);
/** A CV with two figures about two different things. */
const volunteer = poolOf(cvWith(["Catalogued 1,200 objects in the collections database", "Trained 4 volunteers in object handling", "Served customers and handled the till"], "I want this role because I like museums. I have not managed a budget before."), NOW);

const status = (text: string, pool = volunteer) => checkSentence(text, pool).status;
const says = (text: string, pool = volunteer) => checkSentence(text, pool).problems.map((p) => p.say).join(" ");

describe("invented sentences are refused", () => {
  it.each([
    "I have years of experience in this role.",
    "I have worked in a museum before.",
    "You are looking for experience of managing a team of volunteers, which I have.",
    "Your advert asks for a confident user of collections management systems; I am one.",
    "I want this role because I use Spectrum and Adlib.",
    "I am pleased to say I catalogue new acquisitions using Spectrum and Adlib.",
    "I have all the skills and experience you need.",
    "I have already worked with your team.",
  ])("the review's own example, on a CV with one line: %s", (text) => {
    expect(status(text, student)).toBe("unsupported");
  });

  it("a figure is not moved from what it counted to something else", () => {
    expect(says("I trained 1,200 volunteers to catalogue objects.")).toBe("It says “1,200 volunteers”. In your CV, your reason or your notes, “1,200” is about something else.");
    expect(status("I catalogued 4 objects in the collections database.")).toBe("unsupported");
    expect(status("I trained volunteers for 4 years.")).toBe("unsupported");
  });

  it.each([
    // What the advert asks for, said as the person's own.
    "I am a confident user of collections management systems.",
    "I have managed a team of volunteers.",
    "I am fluent in French.",
    "As your advert asks, I have experience with Spectrum.",
    "I use Spectrum every day.",
    "I know Adlib well.",
    "I can catalogue new acquisitions using Spectrum.",
    "I would bring five years of Spectrum experience.",
    "I have worked with Adlib, which you use.",
    "With Spectrum and Adlib experience, I am ready to start.",
    "You need Spectrum experience and I have it.",
    "I have the experience you require.",
    "I am looking forward to continuing my work with Spectrum.",
    // Claims that name nothing.
    "I have done this before.",
    "I have extensive experience.",
    "I am highly skilled.",
    "I meet every requirement.",
    "I am exactly what you are looking for.",
    "I do all of this already.",
    // Figures and words that are not theirs.
    "I catalogued 12,000 objects in the collections database.",
    "I trained 4 staff in object handling.",
    "I led the cataloguing of 1,200 objects.",
    "I am passionate about museums.",
    "I am a quick learner and a team player.",
    // "Not" taken out of what they said.
    "I have managed a budget before.",
    // Things about the employer that the advert does not say.
    "Aire Museum is the largest museum in Leeds.",
    "Your team catalogued 1,200 objects.",
    "You hold 1,200 objects in the collections database.",
  ])("%s", (text) => {
    expect(status(text)).toBe("unsupported");
  });

  it("says why, in each kind of case", () => {
    expect(says("I have years of experience in this role.")).toBe("“I have years of experience in this role” says something about you, but names nothing from your CV, your reason or your notes. Say what you did, in the words of a line on your CV, or add a note.");
    expect(says("You are looking for experience of managing a team of volunteers, which I have.")).toBe("“which I have” claims what the advert asks for as your own. Say it with a line of your CV, or take it out.");
    expect(says("Your advert asks for a confident user of collections management systems; I am one.")).toBe("“I am one” claims what the advert asks for as your own. Say it with a line of your CV, or take it out.");
    expect(says("I want this role because I use Spectrum and Adlib.")).toContain("“Spectrum” is in the advert, not in your CV, your reason or your notes. As written, this says it is yours.");
    expect(says("I have managed a budget before.")).toBe("Your reason says “I have not managed a budget before.” This sentence leaves out the “not”.");
    expect(says("I have worked in a museum before.", student)).toBe("Your reason says “I have not worked in a museum before.” This sentence leaves out the “not”.");
  });
});

describe("honest sentences pass", () => {
  it.each([
    "I can start immediately.",
    "I am available to start in January.",
    "I would be grateful for the opportunity to discuss my application.",
    "However, I catalogued 1,200 objects in the collections database.",
    "Thank you for taking the time to read my application.",
    "Please let me know if you need any more information.",
    "I live in Leeds.",
    "I graduated from the University of Leeds in 2019.",
    "I catalogued about 1,200 objects in the collections database.",
    "I was responsible for cataloguing 1,200 objects.",
  ])("the review's own example of a wrongly refused sentence: %s", (text) => {
    expect(says(text)).toBe("");
  });

  it.each([
    "I am applying for the Collections assistant role at Aire Museum.",
    "I want this role because I like museums.",
    "At Hall Lane Archive, I trained 4 volunteers in object handling.",
    "I also served customers and handled the till.",
    "I catalogued 1,200 objects and trained 4 volunteers.",
    "As a collections volunteer at Hall Lane Archive, I catalogued 1,200 objects.",
    "Since 2020, I have catalogued 1,200 objects.",
    "I have served customers and handled the till.",
    "I studied History at the University of Leeds.",
    "I hold a BA (Hons) in History.",
    "I am based in Leeds.",
    "Your advert asks for experience with Spectrum.",
    "I understand you are looking for experience with Spectrum.",
    "I noticed your advert mentions Spectrum and Adlib.",
    "I have not used Spectrum, but I would welcome the chance to learn it.",
    "I have not managed a budget before.",
    "I would welcome the chance to catalogue new acquisitions.",
    "I am interested in working with Spectrum and Adlib.",
    "I look forward to hearing from you.",
    "My CV is attached.",
    "I have attached my CV.",
    "I am happy to travel for an interview.",
    "I could start in March with four weeks’ notice.",
    "Therefore, I would like to apply.",
  ])("%s", (text) => {
    expect(says(text)).toBe("");
  });

  it("a figure may be said less exactly, never more", () => {
    expect(status("I catalogued about 1,200 objects.")).toBe("sourced");
    const rough = poolOf(cvWith(["Catalogued roughly 1,200 objects in the collections database"], "I like museums."), NOW);
    expect(status("I catalogued 1,200 objects.", rough)).toBe("unsupported");
    expect(status("I catalogued over 1,200 objects.")).toBe("unsupported");
  });

  it("when the person can start is theirs to say, and only that", () => {
    expect(status("I am available from 3 March.")).toBe("plain");
    // A date is not a way in for a claim.
    expect(status("I am available from 3 March, having managed 12 staff.")).toBe("unsupported");
  });
});

describe("each statement in a sentence is judged alone", () => {
  it("cuts before every “I” after the first, and before the employer as a new subject", () => {
    const parts = (t: string) => clausesOf(t, "Aire Museum").map((c) => [c.text, c.about]);
    expect(parts("I want this role because I use Spectrum.")).toEqual([["I want this role", "both"], ["because I use Spectrum.", "me"]]);
    expect(parts("I am pleased to say I catalogue new acquisitions.")).toEqual([["I am pleased to say", "me"], ["I catalogue new acquisitions.", "me"]]);
    expect(parts("I understand you are looking for experience with Spectrum.")).toEqual([["I understand", "me"], ["you are looking for experience with Spectrum.", "employer"]]);
    expect(parts("You are looking for volunteers, which I have.").map((c) => c[1])).toEqual(["employer", "me"]);
  });

  it("keeps a few scene-setting words with the statement they lead into", () => {
    expect(clausesOf("At Hall Lane Archive, I trained 4 volunteers.")).toHaveLength(1);
    expect(clausesOf("However, I catalogued 1,200 objects.")).toHaveLength(1);
  });
});

describe("the letter assembled by rule still passes its own review", () => {
  it("on the sample CV", () => {
    const cv = letterCv();
    const paragraphs = letterByRule(cv, NOW).paragraphs;
    expect(paragraphs.flatMap((p) => p.sentences).length).toBeGreaterThanOrEqual(5);
    expect(reviewLetter({ ...cv, letter: { ...cv.letter!, paragraphs } }, NOW).open).toEqual([]);
  });

  it("and on a CV with a reason that says what the person has not done", () => {
    const cv = cvWith(["Catalogued 1,200 objects in the collections database", "Trained 4 volunteers in object handling"], "I want this role because I like museums. I have not managed a budget before.");
    const exp = cv.sections[0];
    if (exp.kind !== "experience") throw new Error("no experience");
    cv.letter!.evidence = exp.entries[0].bullets.map((b) => ({ section: exp.id, entry: exp.entries[0].id, field: b.id }));
    const paragraphs = letterByRule(cv, NOW).paragraphs;
    const all = paragraphs.flatMap((p) => p.sentences.map((s) => s.text));
    expect(all).toContain("I have not managed a budget before.");
    expect(all).toContain("At Hall Lane Archive, I catalogued 1,200 objects in the collections database.");
    expect(reviewLetter({ ...cv, letter: { ...cv.letter!, paragraphs } }, NOW).open).toEqual([]);
  });
});
