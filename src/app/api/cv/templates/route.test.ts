import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { EXAMPLE_TEMPLATES } from "@/lib/cv/templates/examples";

let testUserSeq = 0;

vi.mock("@/lib/cv/access", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cv/access")>();
  return {
    ...actual,
    requireUserId: vi.fn(async () => `usr_test_template_${++testUserSeq}`),
  };
});

describe("POST /api/cv/templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns template summaries on GET", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.templates.length).toBe(EXAMPLE_TEMPLATES.length);
  });

  it("successfully creates a new CV for every single example template", async () => {
    for (const template of EXAMPLE_TEMPLATES) {
      const req = new Request("http://localhost/api/cv/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const res = await POST(req);
      const json = await res.json();
      expect(res.status, `Template ${template.id} failed with status ${res.status}: ${JSON.stringify(json)}`).toBe(201);
      expect(json.id).toMatch(/^cv_[a-f0-9]{16}$/);
      expect(json.name).toContain(template.title);
    }
  });

  it("handles custom CV name when provided", async () => {
    const req = new Request("http://localhost/api/cv/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: EXAMPLE_TEMPLATES[0].id, name: "My Custom Resume" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.name).toBe("My Custom Resume");
  });

  it("returns 400 badInput when templateId is missing", async () => {
    const req = new Request("http://localhost/api/cv/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Template ID is required.");
  });

  it("returns 400 badInput when templateId is unknown", async () => {
    const req = new Request("http://localhost/api/cv/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: "non_existent_template" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Template not found.");
  });
});
