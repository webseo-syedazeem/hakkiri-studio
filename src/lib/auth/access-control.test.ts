import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import JSZip from "jszip";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as saveSettingsRoute } from "@/app/api/settings/route";
import { GET as exportData } from "@/app/api/data/export/route";
import { POST as deleteData } from "@/app/api/data/delete/route";
import { POST as postVoice } from "@/app/api/voice/route";
import { POST as postQuestion } from "@/app/api/questions/route";
import { GET as getLogout, POST as postLogout } from "@/app/logout/route";
import {
  getInterview,
  listInterviews,
  saveInterview,
  deleteInterview,
  allSavedInterviews,
} from "@/lib/interviews/store";
import { findAnswer, saveAnswer, allAnswers, listAnswers } from "@/lib/answers/store";
import { allMocks, saveMock } from "@/lib/mocks/store";
import {
  getPresentation,
  savePresentation,
  listPresentations,
  deletePresentation,
  saveRun,
  getRun,
  saveQa,
  getQa,
  clearPitch,
} from "@/lib/pitch/store";
import type { Presentation, Run, QaSession } from "@/lib/pitch/types";
import { exportAll, deleteAll } from "@/lib/data/account";
import { halden } from "@/lib/mock-data";
import type { Interview, Answer } from "@/lib/types";

describe("Access Control & Multi-Tenant Isolation", () => {
  beforeEach(() => {
    deleteAll();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Route-level unauthenticated guards", () => {
    it("POST /api/auth/signup returns 403 Forbidden when HAKKIRI_BETA=1", async () => {
      vi.stubEnv("HAKKIRI_BETA", "1");
      const req = new Request("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "tester@example.com", password: "Password123!" }),
      });
      // @ts-expect-error NextRequest wrapper mock
      const res = await signup(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain("closed during the beta");
    });

    it("POST /api/settings rejects unauthenticated requests with 401", async () => {
      const req = new Request("http://localhost:3000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retentionDays: 30 }),
      });
      const res = await saveSettingsRoute(req);
      expect(res.status).toBe(401);
    });

    it("GET /api/data/export rejects unauthenticated requests with 401", async () => {
      const req = new Request("http://localhost:3000/api/data/export");
      const res = await exportData(req);
      expect(res.status).toBe(401);
    });

    it("POST /api/data/delete rejects unauthenticated requests with 401", async () => {
      const req = new Request("http://localhost:3000/api/data/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "delete" }),
      });
      const res = await deleteData(req);
      expect(res.status).toBe(401);
    });

    it("POST /api/voice rejects unauthenticated requests with 401", async () => {
      const req = new Request("http://localhost:3000/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Tell me about yourself", voice: "medium" }),
      });
      const res = await postVoice(req);
      expect(res.status).toBe(401);
    });

    it("POST /api/questions rejects unauthenticated requests with 401", async () => {
      const req = new Request("http://localhost:3000/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: "halden", text: "Tell me about a time you led a team?", group: "leadership" }),
      });
      const res = await postQuestion(req);
      expect(res.status).toBe(401);
    });
  });

  describe("Multi-tenant user data scoping", () => {
    const userA = "usr_alice_123";
    const userB = "usr_bob_456";

    it("prevents User B from accessing or listing User A's interviews", () => {
      const interviewA: Interview = {
        ...halden,
        id: "iv-alice-job",
        userId: userA,
        company: "Alice Corp",
      };
      const interviewB: Interview = {
        ...halden,
        id: "iv-bob-job",
        userId: userB,
        company: "Bob Tech",
      };

      saveInterview(interviewA, userA);
      saveInterview(interviewB, userB);

      // User A can access their own interview
      expect(getInterview("iv-alice-job", userA)?.id).toBe("iv-alice-job");
      // User B cannot access User A's interview
      expect(getInterview("iv-alice-job", userB)).toBeUndefined();
      // User B can access their own interview
      expect(getInterview("iv-bob-job", userB)?.id).toBe("iv-bob-job");

      // Listing interviews for User B does NOT include User A's interview
      const bobList = listInterviews("2026-11-13", userB);
      expect(bobList.map((i) => i.id)).toContain("iv-bob-job");
      expect(bobList.map((i) => i.id)).not.toContain("iv-alice-job");

      // User B cannot delete User A's interview
      const deleted = deleteInterview("iv-alice-job", userB);
      expect(deleted).toBe(false);
      expect(getInterview("iv-alice-job", userA)).toBeDefined();
    });

    it("prevents User B from accessing User A's answers and recordings", () => {
      const answerA = {
        id: "ans-alice-1",
        userId: userA,
        interviewId: "iv-alice-job",
        questionId: "q1",
        questionNumber: 1,
        questionsInMock: 5,
        words: [{ text: "Hello", start: 0, end: 1 }],
        pointWordIndex: 0,
        highlights: [],
        notes: [],
        scores: { content: 4, structure: 4, delivery: 4 },
        strength: "Clear",
        oneFix: "None",
        strongerVersion: [],
        strongerLengthSec: 10,
        followUps: [],
      } as Answer;

      saveAnswer(answerA, userA);

      // User A can find their own answer
      expect(findAnswer("ans-alice-1", userA)?.id).toBe("ans-alice-1");
      // User B cannot find User A's answer
      expect(findAnswer("ans-alice-1", userB)).toBeUndefined();

      // allAnswers for User B does not include User A's answer
      expect(allAnswers(userB).map((a) => a.id)).not.toContain("ans-alice-1");
      expect(allAnswers(userA).map((a) => a.id)).toContain("ans-alice-1");
    });

    it("exportAll(userId) and deleteAll(userId) strictly isolates user data", async () => {
      const interviewA: Interview = {
        ...halden,
        id: "iv-alice-export",
        userId: userA,
        company: "Alice Enterprise",
      };
      const interviewB: Interview = {
        ...halden,
        id: "iv-bob-export",
        userId: userB,
        company: "Bob Ventures",
      };

      saveInterview(interviewA, userA);
      saveInterview(interviewB, userB);

      // User A exports their data
      const zipBytes = await exportAll(userA);
      const zip = await JSZip.loadAsync(zipBytes);
      const dataJson = JSON.parse(await zip.file("data.json")!.async("string"));

      // User A's export must contain only Alice's interview and NOT Bob's
      const exportedIds = dataJson.interviews.map((i: any) => i.id);
      expect(exportedIds).toContain("iv-alice-export");
      expect(exportedIds).not.toContain("iv-bob-export");

      // User A deletes all their data
      deleteAll(userA);

      // Alice's data is wiped
      expect(getInterview("iv-alice-export", userA)).toBeUndefined();
      // Bob's data remains completely intact!
      expect(getInterview("iv-bob-export", userB)?.id).toBe("iv-bob-export");
    });

    it("prevents User B from accessing User A's presentations, runs, and QA", () => {
      clearPitch();
      const presentationA: Presentation = {
        id: "p-alice-1",
        userId: userA,
        title: "Alice Series A Pitch",
        audience: "investors",
        timeLimitSec: 600,
        createdAt: new Date().toISOString(),
        ask: "Invest $2m",
        date: "2026-12-01",
        qaStyle: "sceptical",
        source: { kind: "demo" },
        askSlide: 1,
        warnings: [],
        planBy: "you",
        slides: [{ n: 1, title: "Intro", lines: ["Hello"], plannedSec: 60, point: "Intro" }],
      };
      const presentationB: Presentation = {
        id: "p-bob-1",
        userId: userB,
        title: "Bob Product Launch",
        audience: "team",
        timeLimitSec: 300,
        createdAt: new Date().toISOString(),
        ask: "Ship v1",
        date: "2026-12-02",
        qaStyle: "curious",
        source: { kind: "demo" },
        askSlide: 1,
        warnings: [],
        planBy: "you",
        slides: [{ n: 1, title: "Launch", lines: ["Launch details"], plannedSec: 60, point: "Launch" }],
      };

      savePresentation(presentationA, userA);
      savePresentation(presentationB, userB);

      // User A can access their own presentation
      expect(getPresentation("p-alice-1", userA)?.id).toBe("p-alice-1");
      // User B cannot access User A's presentation
      expect(getPresentation("p-alice-1", userB)).toBeUndefined();

      // Listing presentations for User B does NOT include User A's presentation
      const bobList = listPresentations(userB);
      expect(bobList.map((p) => p.id)).toContain("p-bob-1");
      expect(bobList.map((p) => p.id)).not.toContain("p-alice-1");

      // User B cannot delete User A's presentation
      const deleted = deletePresentation("p-alice-1", userB);
      expect(deleted).toBeNull();
      expect(getPresentation("p-alice-1", userA)).toBeDefined();

      // Runs isolation
      const runA = {
        id: "run-alice-1",
        presentationId: "p-alice-1",
        userId: userA,
        number: 1,
        mode: "full",
        from: 1,
        to: 1,
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        totalSec: 120,
        endedEarly: false,
        marks: [],
        slides: [],
        delivery: { wordsPerMinute: 140, fillerCount: 0, fillersPerMinute: 0, longPauses: 0 },
        scores: { opening: null, message: null, structure: null, coverage: null, timing: null, audience: null, delivery: null },
        overall: null,
        focus: { kind: "keep", slide: null },
        fix: { title: "Good", body: "Keep it up" },
        cuts: [],
        openingRewrite: null,
        evidence: {},
        partial: false,
        hasAudio: false,
      } as Run;
      saveRun(runA, userA);
      expect(getRun("run-alice-1", userA)?.id).toBe("run-alice-1");
      expect(getRun("run-alice-1", userB)).toBeUndefined();

      // QA Session isolation
      const qaA = {
        id: "qa-alice-1",
        presentationId: "p-alice-1",
        userId: userA,
        style: "sceptical",
        persona: { name: "Audience", title: "Reviewer" },
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        questions: [],
        answers: [],
        overall: null,
      } as QaSession;
      saveQa(qaA, userA);
      expect(getQa("qa-alice-1", userA)?.id).toBe("qa-alice-1");
      expect(getQa("qa-alice-1", userB)).toBeUndefined();
    });

    it("ensures unowned legacy records are never exposed to any user", () => {
      const unownedInterview: Interview = {
        ...halden,
        id: "iv-unowned-legacy",
        userId: undefined,
        company: "Legacy Unowned Corp",
      };
      saveInterview(unownedInterview);

      // Neither User A nor User B can see unowned interview
      expect(getInterview("iv-unowned-legacy", userA)).toBeUndefined();
      expect(getInterview("iv-unowned-legacy", userB)).toBeUndefined();
      expect(listInterviews("2026-11-13", userA).map((i) => i.id)).not.toContain("iv-unowned-legacy");
      expect(listInterviews("2026-11-13", userB).map((i) => i.id)).not.toContain("iv-unowned-legacy");
    });
  });

  describe("Logout security", () => {
    it("GET /logout rejects with 405 Method Not Allowed to prevent CSRF image-tag logout", async () => {
      const res = await getLogout();
      expect(res.status).toBe(405);
      expect(res.headers.get("Allow")).toBe("POST");
    });
  });
});
