import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { agenda, homeHeadline, whenOf, type HomeInterview, type HomePresentation } from "./home";

const TODAY = "2026-11-23"; // a Monday
const iv = (over: Partial<HomeInterview> = {}): HomeInterview => ({ id: "iv-1", role: "Data Analyst", company: "Acme Payroll", isDemo: false, ...over });
const pres = (over: Partial<HomePresentation> = {}): HomePresentation => ({ id: "p-1", title: "Board update", isDemo: false, ...over });

describe("reading a date the person gave", () => {
  it("understands ISO dates and date-times, in London time", () => {
    expect(whenOf("2026-11-28", undefined, TODAY)).toEqual({ day: "2026-11-28", time: "" });
    expect(whenOf("2026-11-28", "9:30", TODAY)).toEqual({ day: "2026-11-28", time: "09:30" });
    expect(whenOf("2026-11-28T14:00", undefined, TODAY)).toEqual({ day: "2026-11-28", time: "14:00" });
    expect(whenOf("2026-11-28T10:00:00.000Z", undefined, TODAY)).toEqual({ day: "2026-11-28", time: "10:00" });
    // In summer London is an hour ahead of UTC.
    expect(whenOf("2027-07-01T23:30:00Z", undefined, TODAY)).toEqual({ day: "2027-07-02", time: "00:30" });
  });

  it("understands dates written in words, with or without a year or a weekday", () => {
    expect(whenOf("12 Dec 2026", "10:00", TODAY)).toEqual({ day: "2026-12-12", time: "10:00" });
    expect(whenOf("Thu 26 Nov", undefined, TODAY)).toEqual({ day: "2026-11-26", time: "" });
    expect(whenOf("3rd December, 14:15", undefined, TODAY)).toEqual({ day: "2026-12-03", time: "14:15" });
    // No year, and that day has gone this year: it means next year's.
    expect(whenOf("4 Nov", undefined, TODAY)).toEqual({ day: "2027-11-04", time: "" });
    // A year was given, so a past date stays in the past.
    expect(whenOf("4 Nov 2026", undefined, TODAY)).toEqual({ day: "2026-11-04", time: "" });
  });

  it("gives no date for anything else, rather than guessing one", () => {
    for (const text of [undefined, "", "Just Practice", "TBC", "Upcoming", "next week", "31 Feb 2027", "2026-13-40", "12 Foo 2026", "Completed"]) expect(whenOf(text, "10:00", TODAY), String(text)).toBeNull();
  });
});

describe("the home screen's agenda", () => {
  it("is empty for a new account: the examples are not the person's diary", () => {
    expect(agenda([iv({ id: "halden", isDemo: true, date: "2026-11-26T10:00:00Z", stages: [{ name: "Hiring manager", date: "26 Nov 2026", status: "next" }] })], [pres({ id: "q1-roadmap", isDemo: true, date: "2026-11-27T09:30:00Z" })], TODAY)).toEqual([]);
    expect(agenda([], [], TODAY)).toEqual([]);
  });

  it("lists the person's own dated stages and presentations, soonest first", () => {
    const events = agenda(
      [
        iv({ stages: [{ name: "Recruiter screen", date: "20 Nov 2026", status: "completed" }, { name: "Hiring manager", date: "27 Nov 2026", time: "10:00", status: "next" }, { name: "Final panel", status: "upcoming" }] }),
        iv({ id: "iv-2", role: "Staff Nurse", company: "Northgate Trust", date: "2026-11-24T09:00:00Z" }),
        iv({ id: "iv-3", role: "Practice only", company: "Nowhere" }),
      ],
      [pres({ date: "2026-12-10T15:00:00Z", minutes: 10 })],
      TODAY,
    );
    expect(events.map((e) => [e.id, e.dateGroup, e.time, e.relative, e.thisWeek])).toEqual([
      ["iv-2", "Tue 24 Nov", "09:00", "tomorrow", true],
      ["iv-1:stage-2", "Fri 27 Nov", "10:00", "in 4 days", true],
      ["p-1", "Thu 10 Dec", "15:00", "in 17 days", false],
    ]);
    expect(events[1]).toMatchObject({ title: "Data Analyst", subtitle: "Acme Payroll · Hiring manager", href: "/interviews/iv-1", actionLabel: "Prepare" });
    expect(events[2]).toMatchObject({ type: "presentation", title: "Board update", subtitle: "10 min", href: "/presentations/p-1", actionLabel: "Rehearse" });
  });

  it("leaves out what is past, completed or undated", () => {
    expect(agenda([iv({ date: "2026-11-20T10:00:00Z" }), iv({ id: "iv-2", stages: [{ name: "Done", date: "2026-11-30", status: "completed" }, { name: "No date", status: "next" }] })], [pres({ date: "2026-11-01T10:00:00Z" })], TODAY)).toEqual([]);
  });

  it("an interview happening today is in it", () => {
    expect(agenda([iv({ date: `${TODAY}T16:00:00Z` })], [], TODAY).map((e) => e.relative)).toEqual(["today"]);
  });
});

describe("the line at the top of the home screen", () => {
  it("counts what is really coming up, and says so when nothing is", () => {
    const week = agenda([iv({ date: "2026-11-24T09:00:00Z" }), iv({ id: "iv-2", date: "2026-11-27T09:00:00Z" })], [], TODAY);
    expect(homeHeadline(week, 2, 0)).toBe("You have 2 things coming up this week.");
    expect(homeHeadline(week.slice(0, 1), 1, 0)).toBe("You have 1 thing coming up this week.");
    const later = agenda([iv({ date: "2026-12-20T09:00:00Z" })], [], TODAY);
    expect(homeHeadline(later, 1, 0)).toBe("Nothing this week. Your next one is in 27 days.");
    expect(homeHeadline([], 1, 0)).toBe("Nothing is booked yet. Add a date to an interview and it will show here.");
    expect(homeHeadline([], 0, 0)).toBe("Set up your first interview to get started.");
  });
});

describe("the home screen and its parts", () => {
  const read = (p: string) => fs.readFileSync(path.join(__dirname, "../..", p), "utf8");
  const sources = ["app/(studio)/dashboard/page.tsx", "components/dashboard/DashboardClientView.tsx", "components/dashboard/StageTracker.tsx", "components/dashboard/UpcomingAgenda.tsx", "lib/interviews/archive-store.ts"].map(read).join("\n");

  it("hold none of the fixed agenda, counts, interviews, archive entries or notes an earlier build showed to every account", () => {
    for (const stock of [
      "You have 3 things coming up",
      "interview-halden",
      "Q1 roadmap",
      "q1-roadmap",
      "Case Interview & Metrics Practice",
      "Math.max(1,",
      "/interviews/halden",
      "Senior Product Manager, Payments",
      "Staff Nurse",
      "Example NHS Trust",
      "HMRC",
      "Stripe",
      "Monzo",
      "Strong domain depth",
      "Unsuccessful after hiring manager review",
      "Completed · 4 Nov",
      "hk_recent_practice",
      'return "09:30"',
      "admin@",
    ]) {
      expect(sources.includes(stock), stock).toBe(false);
    }
  });
});
