import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { dataCounts, deleteAll, exportAll, hasData } from "./account";
import { getRecording, pruneRecordings, saveRecordings } from "@/lib/answers/audio";
import { saveAnswer, findAnswer } from "@/lib/answers/store";
import { getInterview, saveInterview, DEMO_INTERVIEW_ID } from "@/lib/interviews/store";
import { saveSettings } from "@/lib/settings/store";
import { recordUsage, usageFor } from "@/lib/usage/store";
import { withUsageContext } from "@/lib/usage/store";
import type { Answer } from "@/lib/types";

/** The account these tests act as. Every record has an owner. */
const U = "usr_test_owner";

const audio = () => ({ data: new Uint8Array([1, 2, 3, 4]).buffer, type: "audio/webm" });

function seed() {
  const demo = getInterview(DEMO_INTERVIEW_ID, U)!;
  saveInterview({ ...demo, id: "iv-data", company: "Acme" }, U);
  const base = findAnswer("a1", U) ?? findAnswer(demo.questions[1].id, U);
  const answer = { ...(base as Answer), id: "ans-data", interviewId: "iv-data" } as Answer;
  saveAnswer(answer, U);
  saveRecordings("ans-data", [audio()]);
  withUsageContext({ interviewId: "iv-data" }, () => recordUsage({ service: "deepgram", label: "speech-to-text", seconds: 60 }));
}

describe("your data", () => {
  it("counts, exports and deletes everything", async () => {
    seed();
    const counts = dataCounts();
    expect(counts.interviews).toBeGreaterThanOrEqual(1);
    expect(counts.recordings).toBeGreaterThanOrEqual(1);
    expect(hasData(counts)).toBe(true);

    const zip = await JSZip.loadAsync(await exportAll());
    const data = JSON.parse(await zip.file("data.json")!.async("string"));
    expect(data.interviews.map((i: { id: string }) => i.id)).toContain("iv-data");
    expect(data.answers.map((a: { id: string }) => a.id)).toContain("ans-data");
    expect(zip.file("README.txt")).toBeTruthy();

    deleteAll();
    const after = dataCounts();
    expect(hasData(after)).toBe(false);
    expect(getInterview("iv-data", U)).toBeUndefined();
    expect(getRecording("ans-data", 0)).toBeNull();
    // The demo is still there, and usage stays but loses its link to you.
    expect(getInterview(DEMO_INTERVIEW_ID, U)).toBeDefined();
    expect(usageFor({ interviewId: "iv-data" })).toHaveLength(0);
  });

  it("deletes recordings older than you chose to keep them", () => {
    saveRecordings("ans-old", [audio()]);
    saveSettings({ retentionDays: 30 });
    expect(pruneRecordings({ force: true, now: Date.now() + 10 * 86_400_000 })).toBe(0);
    expect(pruneRecordings({ force: true, now: Date.now() + 31 * 86_400_000 })).toBe(1);
    saveRecordings("ans-keep", [audio()]);
    saveSettings({ retentionDays: 0 });
    expect(pruneRecordings({ force: true, now: Date.now() + 999 * 86_400_000 })).toBe(0);
  });
});

describe("deleting one presentation", () => {
  it("removes its runs, Q&A and recordings, and never the demo", async () => {
    const { deletePresentation, getPresentation, listPresentations, listRuns, savePresentation, saveRun, getRun } = await import("@/lib/pitch/store");
    const { demoPresentation, demoRuns } = await import("@/lib/pitch/demo");
    savePresentation({ ...demoPresentation, id: "p-del", title: "Mine" }, U);
    saveRun({ ...demoRuns[0], id: "r-del", presentationId: "p-del" }, U);
    saveRecordings("run-r-del", [audio()]);
    expect(getRecording("run-r-del", 0)).not.toBeNull();
    const removed = deletePresentation("p-del", U);
    expect(removed?.runIds).toEqual(["r-del"]);
    expect(getPresentation("p-del", U)).toBeUndefined();
    expect(getRun("r-del", U)).toBeUndefined();
    expect(listRuns("p-del", U)).toEqual([]);
    expect(listPresentations(U).some((p) => p.id === "p-del")).toBe(false);
    expect(deletePresentation(demoPresentation.id, U)).toBeNull();
  });
});
