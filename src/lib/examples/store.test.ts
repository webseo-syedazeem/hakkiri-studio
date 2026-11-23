import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { exampleTitle, isSeededExample, looksLikeStar, newExample, readExamples } from "./store";

const NOW = new Date("2026-11-23T12:00:00.000Z");
const mine = { id: "ex-1795435200000", title: "Our payroll report kept missing errors", question: "Tell me about a time you fixed a recurring error.", answer: "Situation: our payroll report kept missing errors. Action: I rebuilt the checks. Result: errors fell by a third.", competency: "", role: "", interviewType: "", tags: ["Payroll"], isFavorite: false, isStarStructure: true, createdAt: "2026-11-23T12:00:00.000Z" };

describe("a new library", () => {
  it("is empty: nothing is put in it for the person", () => {
    expect(readExamples(null)).toEqual([]);
    expect(readExamples("")).toEqual([]);
    expect(readExamples("[]")).toEqual([]);
  });

  it("an unreadable or wrong-shaped store is empty too, never a set of samples", () => {
    for (const raw of ["not json", "{}", "null", "7", JSON.stringify([null, 4, "x", { id: "a" }, { id: "b", question: "Q?", answer: "  " }])]) expect(readExamples(raw), raw).toEqual([]);
  });

  it("keeps the person's own examples exactly as they were", () => {
    expect(readExamples(JSON.stringify([mine]))).toEqual([mine]);
  });
});

describe("the samples an earlier build wrote into every browser", () => {
  // One of the eight, as it was stored. It is here only to prove it is recognised and removed.
  const seeded = JSON.parse(fs.readFileSync(path.join(__dirname, "seeded-sample.fixture.json"), "utf8"));

  it("are recognised and removed on load, and the person's own are kept", () => {
    expect(isSeededExample(seeded)).toBe(true);
    expect(readExamples(JSON.stringify([seeded, mine]))).toEqual([mine]);
  });

  it("one the person changed is theirs now and is kept", () => {
    const edited = { ...seeded, answer: `${seeded.answer} And I led it.` };
    expect(isSeededExample(edited)).toBe(false);
    expect(readExamples(JSON.stringify([edited]))).toHaveLength(1);
  });

  it("an example of the person's own is never taken for one", () => {
    expect(isSeededExample(mine)).toBe(false);
  });
});

describe("keeping a new example", () => {
  it("holds only what the person gave: no competency, role, type or tag is filled in", () => {
    const e = newExample({ question: " Tell me about a time you led a team. ", answer: "I led six people through a system move.\nIt finished a week early." }, NOW)!;
    expect(e).toEqual({
      id: "ex-1795435200000",
      title: "I led six people through a system move",
      question: "Tell me about a time you led a team.",
      answer: "I led six people through a system move.\nIt finished a week early.",
      competency: "",
      role: "",
      interviewType: "",
      tags: [],
      isFavorite: false,
      isStarStructure: false,
      createdAt: "2026-11-23T12:00:00.000Z",
    });
  });

  it("keeps what was chosen, once each", () => {
    const e = newExample({ question: "Q about budgets?", answer: "A long enough answer about budgets.", competency: "Influencing", role: "Analyst", interviewType: "Final panel", tags: ["Budget", " Budget ", "", "Data"] }, NOW)!;
    expect(e).toMatchObject({ competency: "Influencing", role: "Analyst", interviewType: "Final panel", tags: ["Budget", "Data"] });
  });

  it("is refused without a question or an answer", () => {
    expect(newExample({ question: "", answer: "An answer." }, NOW)).toBeNull();
    expect(newExample({ question: "A question?", answer: "   " }, NOW)).toBeNull();
  });
});

describe("the STAR mark", () => {
  it("is given only when the answer is written in labelled parts", () => {
    expect(looksLikeStar("Situation: a. Task: b. Action: c. Result: d.")).toBe(true);
    expect(looksLikeStar("Situation - the report was wrong.\nAction - I rebuilt it.\nResult - errors fell.")).toBe(true);
    expect(looksLikeStar("I led six people through a system move. It finished a week early.")).toBe(false);
    expect(looksLikeStar("The situation was hard and the result was good, after some action.")).toBe(false);
    expect(looksLikeStar("")).toBe(false);
  });
});

describe("an example's heading", () => {
  it("is the first sentence of the answer without its label, or the question when that is too short", () => {
    expect(exampleTitle("Q?", "Situation: Our payroll report kept missing errors that clients found first. Task: …")).toBe("Our payroll report kept missing errors that clients found first");
    expect(exampleTitle("Tell me about a time you led a team.", "Yes. I did.")).toBe("Tell me about a time you led a team.");
    expect(exampleTitle("Q?", `${"A very long opening sentence that keeps going ".repeat(3)}.`).endsWith("...")).toBe(true);
  });
});

describe("the library's screens", () => {
  const read = (p: string) => fs.readFileSync(path.join(__dirname, "../..", p), "utf8");
  const sources = ["lib/examples/store.ts", "components/examples/InterviewExamplesView.tsx", "components/examples/AddExampleView.tsx"].map(read).join("\n");

  it("hold no sample examples, no made-up import and no values chosen for the person", () => {
    for (const stock of ["DEFAULT_EXAMPLES", "Led a cross-functional project", "ministerial briefing", "ImportFromCv", "Import from CV", "Resume_Candidate", '"Senior Role"', '|| "Leadership"', '|| "General"', '|| "Competency"', '["Leadership"]']) {
      expect(sources.includes(stock), stock).toBe(false);
    }
    expect(fs.existsSync(path.join(__dirname, "../../components/examples/ImportFromCvModal.tsx"))).toBe(false);
  });
});
