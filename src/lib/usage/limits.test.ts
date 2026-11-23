import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

// The beta's figures: ten hours of practice a month per tester, and whole-app spending ceilings.
process.env.HAKKIRI_BETA = "1";
delete process.env.HAKKIRI_DAILY_MINUTES;
delete process.env.HAKKIRI_BETA_MINUTES;
delete process.env.HAKKIRI_DAILY_SPEND_USD;
delete process.env.HAKKIRI_MONTHLY_SPEND_USD;
delete process.env.HAKKIRI_USER_DAILY_SPEND_USD;
delete process.env.HAKKIRI_USER_MONTHLY_SPEND_USD;
delete process.env.HAKKIRI_TRUST_PROXY;

const { guard, limitReached, limitStanding, LIMITS } = await import("./limits");
const { recordUsage } = await import("./store");

const ALICE = "usr_alice";
const BOB = "usr_bob";
const TODAY = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const req = (address = "203.0.113.9") => new Request("http://localhost/api/x", { method: "POST", headers: { "x-forwarded-for": address } });
const entries = () => (globalThis as unknown as { __hakkiriUsage: unknown[] }).__hakkiriUsage;
const hits = () => (globalThis as unknown as { __hakkiriRate: Map<string, number[]> }).__hakkiriRate;
/** Minutes of speech transcribed for an account. An hour costs about 26 cents, so minutes alone stay well under the spending ceilings. */
const spoke = (userId: string, minutes: number) => recordUsage({ userId, service: "deepgram", label: "speech-to-text", seconds: minutes * 60 });
/** Dollars spent for an account, as voice characters (5 cents a thousand). */
const spent = (userId: string | undefined, usd: number) => recordUsage({ userId, service: "elevenlabs", label: "interviewer-voice", characters: usd * 20_000 });

beforeEach(() => {
  entries().length = 0;
  hits().clear();
});

describe("the beta's figures", () => {
  it("are ten hours a month per tester, whole-app spending ceilings, and a smaller ceiling per account", () => {
    expect(LIMITS.monthlyMinutes).toBe(600);
    expect(LIMITS.dailyUsd).toBe(25);
    expect(LIMITS.monthlyUsd).toBe(200);
    expect(LIMITS.userDailyUsd).toBe(5);
    expect(LIMITS.userMonthlyUsd).toBe(25);
    // One account's ceiling is below the app's, so no single account can use up everyone's.
    expect(LIMITS.userDailyUsd).toBeLessThan(LIMITS.dailyUsd);
    expect(LIMITS.userMonthlyUsd).toBeLessThan(LIMITS.monthlyUsd);
  });
});

describe("a person's allowance is their own", () => {
  it("minutes are counted from that account's practice only", () => {
    spoke(ALICE, 90);
    spoke(BOB, 15);
    expect(limitStanding(TODAY, ALICE).minutesMonth).toBeCloseTo(90, 5);
    expect(limitStanding(TODAY, BOB).minutesMonth).toBeCloseTo(15, 5);
    expect(limitStanding(TODAY, "usr_new").minutesMonth).toBe(0);
  });

  it("one tester using their ten hours doesn't stop another", () => {
    spoke(ALICE, 601);
    const alice = guard(req(), "plan", { practice: true, userId: ALICE });
    expect(alice?.status).toBe(429);
    expect(guard(req(), "plan", { practice: true, userId: BOB })).toBeNull();
    expect(guard(req(), "answer", { practice: true, userId: "usr_new" })).toBeNull();
  });

  it("the message says it is this month's beta practice, and something already under way may finish", async () => {
    spoke(ALICE, 601);
    const body = (await guard(req(), "plan", { practice: true, userId: ALICE })!.json()) as { error: string; message: string };
    expect(body.error).toBe("limit");
    expect(body.message).toContain("10 h of beta practice");
    // A session that had started gets a quarter more, so it isn't cut off mid-answer.
    expect(guard(req(), "answer", { inSession: true, userId: ALICE })).toBeNull();
    spoke(ALICE, 200);
    expect(guard(req(), "answer", { inSession: true, userId: ALICE })).toBeNull(); // not practice: minutes aren't checked
    expect(guard(req(), "answer", { practice: true, userId: ALICE })?.status).toBe(429);
  });

  it("one account reaching its own spending ceiling doesn't stop another", async () => {
    spent(ALICE, LIMITS.userDailyUsd + 0.5);
    expect(limitStanding(TODAY, ALICE).mySpentToday).toBeCloseTo(LIMITS.userDailyUsd + 0.5, 5);
    expect(limitStanding(TODAY, BOB).mySpentToday).toBe(0);
    const alice = guard(req(), "ai", { userId: ALICE });
    expect(alice?.status).toBe(429);
    expect(((await alice!.json()) as { message: string }).message).toContain("for your account");
    expect(guard(req(), "ai", { userId: BOB })).toBeNull();
    expect(guard(req(), "build", { userId: BOB })).toBeNull();
  });

  it("the monthly ceiling per account works the same way", () => {
    const s = { minutesToday: 0, spentToday: 0, spentMonth: 30, mySpentToday: 0, mySpentMonth: LIMITS.userMonthlyUsd };
    expect(limitReached({}, s)).toContain("this month’s practice limit for your account");
    expect(limitReached({}, { ...s, mySpentMonth: LIMITS.userMonthlyUsd - 0.01 })).toBeNull();
  });

  it("test-mode samples count towards nothing", () => {
    recordUsage({ userId: ALICE, service: "deepgram", label: "speech-to-text", seconds: 700 * 60, simulated: true });
    recordUsage({ userId: ALICE, service: "elevenlabs", label: "interviewer-voice", characters: 10_000_000, simulated: true });
    expect(guard(req(), "plan", { practice: true, userId: ALICE })).toBeNull();
  });
});

describe("the whole app's spending ceilings", () => {
  it("are counted across everyone, whoever is asking", () => {
    for (let i = 0; i < 6; i++) spent(`usr_tester_${i}`, 4.5); // each under their own $5, $27 in all
    const standing = limitStanding(TODAY, BOB);
    expect(standing.spentToday).toBeCloseTo(27, 5);
    expect(standing.mySpentToday).toBe(0);
    // The app's ceiling ($25 a day) is there to protect the bill: once reached it stops new work for everyone.
    expect(guard(req(), "ai", { userId: BOB })?.status).toBe(429);
  });

  it("with no account named there is no personal figure, only the app's", () => {
    spent(ALICE, 6);
    const s = limitStanding(TODAY);
    expect(s.mySpentToday).toBeUndefined();
    expect(s.spentToday).toBeCloseTo(6, 5);
    // Background work names no account: it is held by the app's ceilings, not by any one person's.
    expect(limitReached({}, s)).toBeNull();
  });
});

describe("requests per minute", () => {
  it("are counted per account, so two people at one address don't share a limit", () => {
    const office = "198.51.100.7";
    for (let i = 0; i < 20; i++) expect(guard(req(office), "ai", { userId: ALICE })).toBeNull();
    const blocked = guard(req(office), "ai", { userId: ALICE });
    expect(blocked?.status).toBe(429);
    expect(guard(req(office), "ai", { userId: BOB })).toBeNull();
  });

  it("follow the account, not the address it comes from", () => {
    for (let i = 0; i < 20; i++) guard(req(`10.0.0.${i}`), "ai", { userId: ALICE });
    expect(guard(req("10.9.9.9"), "ai", { userId: ALICE })?.status).toBe(429);
  });

  it("a route open to visitors is counted by address", () => {
    process.env.HAKKIRI_TRUST_PROXY = "1";
    try {
      for (let i = 0; i < 10; i++) expect(guard(req("192.0.2.1"), "audit")).toBeNull();
      expect(guard(req("192.0.2.1"), "audit")?.status).toBe(429);
      expect(guard(req("192.0.2.2"), "audit")).toBeNull();
    } finally {
      delete process.env.HAKKIRI_TRUST_PROXY;
    }
  });
});

describe("every signed-in route names the account", () => {
  const root = path.join(process.cwd(), "src/app/api");
  const routes = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? routes(path.join(dir, e.name)) : e.name === "route.ts" ? [path.join(dir, e.name)] : []));
  /** Open to visitors by design: counted by address. */
  const PUBLIC = new Set(["audit/route.ts"]);

  it("each limit check in a route that signs the person in passes their id", () => {
    const missing: string[] = [];
    for (const file of routes(root)) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      const source = fs.readFileSync(file, "utf8");
      const calls = source.match(/\bguard\([^;]*\);/g) ?? [];
      // The CV section signs people in with its own helper and only uses the "read" count, which has no allowance.
      if (!calls.length || PUBLIC.has(rel) || rel.startsWith("cv/")) continue;
      expect(source, `${rel} checks a limit without signing the person in`).toMatch(/requireUser\(\)|getCurrentUser\(\)/);
      for (const call of calls) if (!/userId/.test(call)) missing.push(`${rel}: ${call}`);
    }
    expect(missing).toEqual([]);
  });

  it("each route that calls an AI service links what it uses to the account", () => {
    const missing: string[] = [];
    for (const file of routes(root)) {
      const rel = path.relative(root, file).split(path.sep).join("/");
      const source = fs.readFileSync(file, "utf8");
      for (const call of source.match(/\b(setUsageContext|withUsageContext)\(\{[^}]*\}/g) ?? []) if (!/userId/.test(call)) missing.push(`${rel}: ${call}`);
    }
    expect(missing).toEqual([]);
  });
});
