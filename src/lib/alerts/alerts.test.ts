import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProblems, recentProblems, reportProblem } from "./store";
import { checkSpendAlerts, LIMITS } from "@/lib/usage/limits";
import { POST as clientError } from "@/app/api/client-error/route";

const ok = () => new Response("ok", { status: 200 });

beforeEach(() => clearProblems());
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("problems and alerts", () => {
  it("groups the same problem and alerts once per 30 minutes", async () => {
    vi.stubEnv("ALERT_WEBHOOK_URL", "https://hooks.example.com/x");
    const fetchMock = vi.fn(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
    const t0 = new Date("2026-10-26T10:00:00Z");
    await reportProblem({ source: "service", where: "Claude: score-answer", message: "claude returned 529: overloaded (request 123)" }, t0);
    await reportProblem({ source: "service", where: "Claude: score-answer", message: "claude returned 529: overloaded (request 456)" }, new Date(t0.getTime() + 60_000));
    expect(recentProblems()).toHaveLength(1);
    expect(recentProblems()[0].count).toBe(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(body.text).toMatch(/score-answer/);
    expect(body.content).toMatch(/overloaded/);
    await reportProblem({ source: "service", where: "Claude: score-answer", message: "claude returned 529: overloaded (request 789)" }, new Date(t0.getTime() + 31 * 60_000));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("emails through Resend when that's set up", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("ALERT_EMAIL_TO", "me@example.com");
    const fetchMock = vi.fn(async () => ok());
    vi.stubGlobal("fetch", fetchMock);
    await reportProblem({ source: "server", where: "GET /interviews/[id] [render]", message: "Cannot read properties of undefined" });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(JSON.parse(String(init.body))).toMatchObject({ to: ["me@example.com"], subject: expect.stringContaining("GET /interviews/[id]") });
  });

  it("records without alerting when nothing is set up, and never throws", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await reportProblem({ source: "browser", where: "/settings (Safari)", message: "x is not a function" })).not.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("warns about spending at 80% of a limit, once a day", () => {
    const today = "2026-10-26";
    const s = { minutesToday: 0, spentToday: LIMITS.dailyUsd * 0.85, spentMonth: 1 };
    checkSpendAlerts(today, s);
    checkSpendAlerts(today, s);
    const spend = recentProblems().filter((p) => p.source === "spending");
    expect(spend).toHaveLength(1);
    expect(spend[0].message).toMatch(/85% of the/);
  });

  it("takes browser errors, names the browser, and rate-limits them", async () => {
    const send = (ip: string) =>
      clientError(new Request("http://x/api/client-error", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify({ message: "boom", path: "/mock/acme?session=1", agent: "Mozilla/5.0 (Macintosh) AppleWebKit/605 Version/18.0 Safari/605.1.15" }) }));
    expect((await send("203.0.113.50")).status).toBe(204);
    expect(recentProblems()[0].where).toBe("/mock/acme (Safari)");
    for (let i = 0; i < 25; i++) await send("203.0.113.51");
    expect(recentProblems().find((p) => p.where === "/mock/acme (Safari)")!.count).toBeLessThanOrEqual(21);
  });
});
