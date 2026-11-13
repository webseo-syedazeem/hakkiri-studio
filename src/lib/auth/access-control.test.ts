import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import JSZip from "jszip";
import { POST as signup } from "@/app/api/auth/signup/route";
import { POST as saveSettingsRoute } from "@/app/api/settings/route";
import { GET as exportData } from "@/app/api/data/export/route";
import { POST as deleteData } from "@/app/api/data/delete/route";
import { POST as postVoice } from "@/app/api/voice/route";
import { POST as postQuestion } from "@/app/api/questions/route";
import {
  getInterview,
  listInterviews,
  saveInterview,
  deleteInterview,
  allSavedInterviews,
} from "@/lib/interviews/store";
import { findAnswer, saveAnswer, allAnswers, listAnswers } from "@/lib/answers/store";
import { allMocks, saveMock } from "@/lib/mocks/store";
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
  });
});
