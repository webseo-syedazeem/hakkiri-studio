import { describe, expect, it, beforeAll } from "vitest";
import { GET } from "./route";
import { DEMO_INTERVIEW_ID, getInterview, saveInterview } from "@/lib/interviews/store";

describe("admin interviews API (/api/admin/interviews)", () => {
  const adminSecret = "test-admin-secret-key-12345";

  beforeAll(() => {
    process.env.ADMIN_SECRET_KEY = adminSecret;
    // The list is of interviews people have set up, not the built-in demos: one is saved for the tests below.
    const demo = getInterview(DEMO_INTERVIEW_ID, "usr_admin_list_test")!;
    saveInterview({ ...demo, id: "iv-admin-list", company: "Acme Payroll" }, "usr_admin_list_test");
  });

  it("rejects unauthorized access without valid admin secret or admin session", async () => {
    const req = new Request("http://localhost:3000/api/admin/interviews");
    // A visitor with no session and no secret is told to sign in; a signed-in person who is not an
    // administrator gets 403 (covered in lib/auth/admin.test.ts).
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("unauthorised");
  });

  it("returns list of interviews with company, role, and questions when authorized", async () => {
    const req = new Request("http://localhost:3000/api/admin/interviews", {
      headers: { authorization: `Bearer ${adminSecret}` },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.count).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(data.interviews)).toBe(true);

    const first = data.interviews[0];
    expect(first.company).toBeDefined();
    expect(first.role).toBeDefined();
    expect(Array.isArray(first.questions)).toBe(true);
    expect(first.questions.length).toBeGreaterThanOrEqual(1);

    // Verify candidate answers and recordings are NEVER present
    expect(first).not.toHaveProperty("answers");
    expect(first).not.toHaveProperty("audio");
    expect(first).not.toHaveProperty("recordings");
    expect(first).not.toHaveProperty("transcripts");
  });

  it("exports CSV formatted data with questions and job roles when authorized", async () => {
    const req = new Request("http://localhost:3000/api/admin/interviews?format=csv", {
      headers: { authorization: `Bearer ${adminSecret}` },
    });
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("hakkiri-interviews-and-questions.csv");

    const text = await res.text();
    expect(text).toContain("Interview ID,Company,Job Title / Role");
    expect(text).toContain("Question Category,Question Title,AI Question Prompt");
  });
});
