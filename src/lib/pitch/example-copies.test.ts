import { beforeEach, describe, expect, it } from "vitest";
import { demoPresentation, demoRuns, demoQaSession } from "./demo";
import { allPitchData, clearPitch, deletePresentation, featuredPresentation, getPresentation, isDemoPresentation, listPresentations, listQa, listRuns, savePresentation, saveQa, saveRun } from "./store";

const A = "usr_alice";
const B = "usr_bob";
const EXAMPLE = demoPresentation.id;

beforeEach(() => clearPitch());

describe("the example presentation", () => {
  it("is each person's own copy once they change it", () => {
    savePresentation({ ...demoPresentation, title: "Alice's version", ask: "Alice's ask" }, A);
    expect(getPresentation(EXAMPLE, A)?.title).toBe("Alice's version");
    // Bob still has the example as built, and his list shows that, not Alice's.
    expect(getPresentation(EXAMPLE, B)?.title).toBe(demoPresentation.title);
    expect(listPresentations(B).find((p) => p.id === EXAMPLE)?.title).toBe(demoPresentation.title);
    expect(listPresentations(A).find((p) => p.id === EXAMPLE)?.title).toBe("Alice's version");
    expect(listPresentations(A).filter((p) => p.id === EXAMPLE)).toHaveLength(1);
  });

  it("one person's change does not replace another's", () => {
    savePresentation({ ...demoPresentation, title: "Alice's version" }, A);
    savePresentation({ ...demoPresentation, title: "Bob's version" }, B);
    expect(getPresentation(EXAMPLE, A)?.title).toBe("Alice's version");
    expect(getPresentation(EXAMPLE, B)?.title).toBe("Bob's version");
  });

  it("stays the example for everyone, whoever has changed their copy", () => {
    expect(isDemoPresentation(EXAMPLE)).toBe(true);
    savePresentation({ ...demoPresentation, title: "Alice's version" }, A);
    expect(isDemoPresentation(EXAMPLE)).toBe(true);
    // It is never "the presentation Home is about" for someone who has none of their own…
    expect(featuredPresentation(B)?.id).toBe(EXAMPLE);
    // …and a person's real presentation comes before it.
    savePresentation({ ...demoPresentation, id: "p-bob", title: "Bob's talk", date: new Date(Date.now() + 86_400_000).toISOString() }, B);
    expect(featuredPresentation(B)?.id).toBe("p-bob");
  });

  it("is not saved for nobody", () => {
    savePresentation({ ...demoPresentation, title: "Nobody's" }, "");
    expect(allPitchData().presentations).toEqual([]);
  });
});

describe("practice on the example", () => {
  const run = (id: string) => ({ ...demoRuns[0], id, presentationId: EXAMPLE });
  const round = (id: string) => ({ ...demoQaSession, id, presentationId: EXAMPLE });

  it("is each person's own: listed, downloaded and deleted for them alone", () => {
    saveRun(run("r-alice"), A);
    saveRun(run("r-bob"), B);
    saveQa(round("q-alice"), A);
    savePresentation({ ...demoPresentation, title: "Alice's version" }, A);
    expect(listRuns(EXAMPLE, A).map((r) => r.id).filter((id) => id.startsWith("r-"))).toEqual(["r-alice"]);
    expect(listRuns(EXAMPLE, B).map((r) => r.id).filter((id) => id.startsWith("r-"))).toEqual(["r-bob"]);
    expect(listQa(EXAMPLE, B).map((s) => s.id)).not.toContain("q-alice");
    // Alice's download holds her copy and her practice, and none of Bob's, although both are "on" the example.
    const mine = allPitchData(A);
    expect(mine.presentations.map((p) => p.title)).toEqual(["Alice's version"]);
    expect(mine.runs.map((r) => r.id)).toEqual(["r-alice"]);
    expect(mine.qa.map((s) => s.id)).toEqual(["q-alice"]);
    expect(allPitchData(B).runs.map((r) => r.id)).toEqual(["r-bob"]);
  });

  it("deleting your copy or all your data leaves the example and other people's practice alone", () => {
    saveRun(run("r-alice"), A);
    saveRun(run("r-bob"), B);
    saveQa(round("q-bob"), B);
    savePresentation({ ...demoPresentation, title: "Alice's version" }, A);
    expect(deletePresentation(EXAMPLE, A)).toEqual({ runIds: ["r-alice"], answerIds: [] });
    expect(getPresentation(EXAMPLE, A)?.title).toBe(demoPresentation.title);
    expect(allPitchData(B).runs.map((r) => r.id)).toEqual(["r-bob"]);
    expect(allPitchData(B).qa.map((s) => s.id)).toEqual(["q-bob"]);
    // Bob never changed the example, but he practised on it: "delete all my data" removes that practice.
    clearPitch(B);
    expect(allPitchData(B)).toEqual({ presentations: [], runs: [], qa: [] });
    expect(getPresentation(EXAMPLE, B)?.id).toBe(EXAMPLE);
    // Someone with nothing on the example has nothing to delete there.
    expect(deletePresentation(EXAMPLE, "usr_carol")).toBeNull();
  });
});
