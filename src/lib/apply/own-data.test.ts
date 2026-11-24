import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-apply-own-data-"));
process.env.HAKKIRI_DATA_DIR = dataDir;
let signedIn: { id: string; email: string; firstName?: string; lastName?: string } | null = null;
vi.mock("@/lib/auth/require", () => ({
  requireUser: async () => {
    if (!signedIn) throw new Response(JSON.stringify({ error: "unauthorised" }), { status: 401 });
    return signedIn;
  },
}));

import type { Profile } from "./schema";

const rules = await import("./own-data");
const { SEEDED_PROFILE, SEEDED_VOICE, SEEDED_SETTINGS, isSeededMatch } = await import("./seeded");
const db = await import("./db");
const profileRoute = await import("@/app/api/apply/profile/route");
const voiceRoute = await import("@/app/api/apply/voice/route");
const samplesRoute = await import("@/app/api/apply/voice/samples/route");
const settingsRoute = await import("@/app/api/apply/settings/route");
const matchesRoute = await import("@/app/api/apply/matches/route");
const jobsRoute = await import("@/app/api/apply/jobs/route");
const appsRoute = await import("@/app/api/apply/applications/route");
const appRoute = await import("@/app/api/apply/applications/[id]/route");
const answersRoute = await import("@/app/api/apply/applications/[id]/answers/[questionId]/route");
const letterRoute = await import("@/app/api/apply/applications/[id]/letter/route");
const packRoute = await import("@/app/api/apply/applications/[id]/pack/route");
const evidenceRoute = await import("@/app/api/apply/evidence/route");

const sam = { id: "usr_sam", email: "sam@example.com", firstName: "Sam", lastName: "Okafor" };
const NOW = "2026-11-24T10:00:00.000Z";
const json = (body: unknown, method = "POST") => new Request("http://localhost/api", { method, headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });
const ctx = <T extends Record<string, string>>(params: T) => ({ params: Promise.resolve(params) });
const ADVERT = `Archive Assistant
Employer: Lantern Atlas
Location: York

You will catalogue the map collection.

Essential
- Experience with paper conservation
- A track record of careful handling of fragile items
Desirable
- Knowledge of Spectrum would be an advantage`;
const INVENTED = ["Innovative Tech Group", "London, UK", "Remote / Hybrid", "5+ years commercial experience", "Senior Engineer", "FinTech", "+44 7700", "TypeScript", "85000", "Global FinTech", "Staff Software Engineer", "weekly alignment cadence", "executive sign-off", "previous contract"];

beforeEach(() => {
  signedIn = sam;
  for (const k of Object.keys(globalThis._applyMemoryStore ?? {})) delete globalThis._applyMemoryStore![k];
  fs.rmSync(path.join(dataDir, "apply"), { recursive: true, force: true });
});

/** The sample profile an earlier build saved into every account, exactly as it was written. */
function seededProfile(userId: string): Profile {
  const S = SEEDED_PROFILE;
  return {
    userId,
    region: "uk" as const,
    contact: { name: "Sam Okafor", email: "sam@example.com", phone: S.phone, location: S.location, links: [...S.links] },
    headline: S.headline,
    summary: S.summary,
    roles: [{ id: "role-1", title: S.roleTitle, employer: S.roleEmployer, location: "London, UK", start: "2023", end: "Present", current: true, bullets: S.bullets.map((text, i) => ({ id: `b-${i + 1}`, text, evidenceIds: [] })) }],
    education: [{ id: "edu-1", institution: S.institution, qualification: S.qualification, grade: "First Class Honours", start: "2016", end: "2019" }],
    skills: S.skills.map((name) => ({ name, group: "Languages", evidenceIds: [] })),
    extras: [{ kind: "certificate", title: S.extra, detail: "Amazon Web Services" }],
    screening: { rightToWork: S.rightToWork, noticePeriod: "1 month", salaryMin: S.salaryMin, salaryCurrency: "GBP", relocate: false, remote: "hybrid" as const, visaNeeded: false, custom: [] },
    completeness: 85,
    createdAt: NOW,
    updatedAt: NOW,
  };
}

describe("a new account's Apply data", () => {
  it("the profile holds the account's name and email and nothing else", async () => {
    const profile = await (await profileRoute.GET()).json();
    expect(profile.contact).toEqual({ name: "Sam Okafor", email: "sam@example.com", phone: "", location: "", links: [] });
    expect(profile).toMatchObject({ headline: "", summary: "", roles: [], education: [], skills: [], extras: [], completeness: 20 });
    expect(profile.screening).toMatchObject({ rightToWork: "", noticePeriod: "", salaryMin: 0 });
    // Reading it doesn't save anything.
    expect(await db.getProfile(sam.id)).toBeNull();
  });

  it("the voice has nothing measured, and no phrase or banned word chosen for the person", async () => {
    const voice = await (await voiceRoute.GET()).json();
    expect(voice).toMatchObject({ samples: [], signature: [], never: [] });
    expect(voice.measured).toMatchObject({ sentenceMean: 0, sentenceSpread: 0, opens: [], closes: [] });
    expect(await db.getVoice(sam.id)).toBeNull();
  });

  it("there are no job preferences, no matches and no applications", async () => {
    expect(await (await settingsRoute.GET()).json()).toMatchObject({ titles: [], locations: [], salaryMin: 0, remote: false, excludeEmployers: [] });
    expect(await (await matchesRoute.GET()).json()).toEqual([]);
    expect(await (await appsRoute.GET()).json()).toEqual([]);
  });

  it("none of it contains anything from the samples an earlier build showed", async () => {
    const all = JSON.stringify([await (await profileRoute.GET()).json(), await (await voiceRoute.GET()).json(), await (await settingsRoute.GET()).json(), await (await matchesRoute.GET()).json()]);
    for (const s of [...INVENTED, "Product Manager", "driven by customer impact", "passionate", "University of Manchester"]) expect(all.includes(s), s).toBe(false);
  });
});

describe("what an earlier build saved into existing accounts", () => {
  it("the sample profile is removed on read; the account's own name and email stay", async () => {
    await db.saveProfile(seededProfile(sam.id));
    const profile = await (await profileRoute.GET()).json();
    expect(profile.contact).toEqual({ name: "Sam Okafor", email: "sam@example.com", phone: "", location: "", links: [] });
    expect(profile).toMatchObject({ headline: "", summary: "", roles: [], education: [], skills: [], extras: [], completeness: 20 });
    expect(profile.screening).toMatchObject({ rightToWork: "", salaryMin: 0 });
    expect((await db.getProfile(sam.id))!.roles).toEqual([]);
  });

  it("a part the person changed is theirs and is kept", () => {
    const edited = seededProfile(sam.id);
    edited.headline = "Archive assistant";
    edited.roles[0].bullets[0].text = "Catalogued 4,000 maps in a year.";
    edited.contact.phone = "07700 000000";
    edited.contact.location = "London, UK";
    const { profile } = rules.withoutSeededProfile(edited);
    expect(profile.headline).toBe("Archive assistant");
    expect(profile.roles).toHaveLength(1);
    expect(profile.contact).toMatchObject({ phone: "07700 000000", location: "London, UK" });
    // The untouched sample parts still go.
    expect(profile.education).toEqual([]);
    expect(profile.summary).toBe("");
  });

  it("a profile the person wrote themselves is left exactly as it is", () => {
    const own = { ...rules.emptyProfile(sam, NOW), headline: "Archive assistant", contact: { name: "Sam Okafor", email: "sam@example.com", phone: "07700 000000", location: "London, UK", links: [] } };
    own.completeness = rules.profileCompleteness(own);
    expect(rules.withoutSeededProfile(own)).toEqual({ profile: own, changed: false });
  });

  it("the sample voice, preferences and matches are removed too", async () => {
    await db.saveVoice({ userId: sam.id, samples: [], measured: { sentenceMean: SEEDED_VOICE.sentenceMean, sentenceSpread: SEEDED_VOICE.sentenceSpread, formality: 3, contractions: true, firstPerson: true, spelling: "uk", opens: [...SEEDED_VOICE.opens], closes: [...SEEDED_VOICE.closes] }, signature: [...SEEDED_VOICE.signature, "plain and specific"], never: [...SEEDED_VOICE.never], learnedFromEdits: [], createdAt: NOW, updatedAt: NOW });
    const voice = await (await voiceRoute.GET()).json();
    expect(voice.signature).toEqual(["plain and specific"]);
    expect(voice.never).toEqual([]);
    expect(voice.measured).toMatchObject({ sentenceMean: 0, opens: [], closes: [] });

    await db.saveApplySettings({ ...rules.emptySettings(sam.id, NOW), titles: [...SEEDED_SETTINGS.titles], locations: [...SEEDED_SETTINGS.locations], salaryMin: SEEDED_SETTINGS.salaryMin, remote: true });
    expect(await (await settingsRoute.GET()).json()).toMatchObject({ titles: [], locations: [], salaryMin: 0, remote: false });
    // Preferences the person set themselves are kept.
    await db.saveApplySettings({ ...rules.emptySettings(sam.id, NOW), titles: ["Archivist"], locations: ["York"], salaryMin: 28000, remote: true });
    expect(await (await settingsRoute.GET()).json()).toMatchObject({ titles: ["Archivist"], locations: ["York"], salaryMin: 28000, remote: true });

    await db.saveMatch({ id: "match_seed", userId: sam.id, jobId: "job_1", fit: 88, reasons: ["Strong TypeScript & Next.js commercial experience"], missing: [], state: "new", createdAt: NOW, updatedAt: NOW });
    expect(isSeededMatch({ fit: 88, reasons: ["Strong TypeScript & Next.js commercial experience"] })).toBe(true);
    expect(await (await matchesRoute.GET()).json()).toEqual([]);
    expect(await db.listMatches(sam.id)).toEqual([]);
  });
});

describe("reading a job advert", () => {
  it("takes what the advert says", () => {
    const read = rules.readJobAdvert(ADVERT);
    expect(read).toMatchObject({ title: "Archive Assistant", employer: "Lantern Atlas", location: "York", remote: false, keywords: [], tone: "neutral" });
    expect(read.requirements.map((r) => [r.text, r.kind])).toEqual([
      ["Experience with paper conservation", "must"],
      ["A track record of careful handling of fragile items", "must"],
      ["Knowledge of Spectrum would be an advantage", "nice"],
    ]);
  });

  it("leaves empty what the advert doesn't say: no employer, place, requirement or keyword is supplied", () => {
    const read = rules.readJobAdvert("We are a small team looking for someone friendly to help out in the shop at weekends. Apply by email.");
    expect(read).toEqual({ title: "", employer: "", location: "", remote: false, requirements: [], keywords: [], tone: "neutral" });
  });

  it("finds only the keywords that are in the text", () => {
    expect(rules.readJobAdvert("Analyst\nMust have experience with SQL and Excel reporting.").keywords).toEqual(["SQL", "Excel"]);
  });
});

describe("the fit", () => {
  const reqs = rules.readJobAdvert(ADVERT).requirements;
  const ev = (id: string, text: string, skillTags: string[] = [], numbers: string[] = []) => ({ id, text, skillTags, numbers });

  it("is the share of the requirements the person's evidence covers, and is never raised", () => {
    expect(rules.gapAndFit(reqs, [])).toMatchObject({ fit: 0 });
    const some = rules.gapAndFit(reqs, [ev("e1", "Two years of paper conservation at the county archive.", ["paper conservation"])]);
    expect(some.gapMap.map((g) => g.strength)).toEqual(["partial", "none", "none"]);
    expect(some.fit).toBe(21);
    expect(rules.fitFromGapMap(reqs, some.gapMap)).toBe(21);
  });

  it("is unknown, not a number, when the advert gave no requirements", () => {
    expect(rules.gapAndFit([], [ev("e1", "Anything.")])).toEqual({ gapMap: [], fit: null });
    expect(rules.fitFromGapMap([], [])).toBeNull();
  });
});

describe("an answer shaped from notes", () => {
  const notes = "  The donor wanted the maps back.   I met her twice and agreed a loan instead. The collection stayed open to the public.  ";

  it("is the person's own sentences, tidied, with nothing added", () => {
    const a = rules.shapeAnswer(notes, 150, "words");
    expect(a).toEqual({ text: "The donor wanted the maps back. I met her twice and agreed a loan instead. The collection stayed open to the public.", sentences: ["The donor wanted the maps back.", "I met her twice and agreed a loan instead.", "The collection stayed open to the public."], cut: false });
    for (const word of a.text.split(/\s+/)) expect(notes.includes(word), word).toBe(true);
  });

  it("is cut to the limit at the end of a sentence, in words or characters", () => {
    expect(rules.shapeAnswer(notes, 16, "words")).toMatchObject({ text: "The donor wanted the maps back. I met her twice and agreed a loan instead.", cut: true });
    expect(rules.shapeAnswer(notes, 40, "chars")).toMatchObject({ text: "The donor wanted the maps back.", cut: true });
    expect(rules.shapeAnswer(notes, 3, "words")).toEqual({ text: "The donor wanted", sentences: ["The donor wanted"], cut: true });
  });
});

describe("saving a job and its application", () => {
  it("holds what the advert says, the real fit, and nothing the person hasn't done", async () => {
    const res = await jobsRoute.POST(json({ text: ADVERT }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.job).toMatchObject({ title: "Archive Assistant", employer: "Lantern Atlas", location: "York", applyRoute: "unknown", userId: sam.id });
    expect(body).toMatchObject({ fit: 0, fitKnown: true, notFound: [] });
    const app = (await db.getApplication(body.applicationId, sam.id))!;
    expect(app).toMatchObject({ status: "draft", fit: 0, stages: [], notes: "" });
  });

  it("an advert with nothing to measure against has no fit, and says what wasn't found", async () => {
    const body = await (await jobsRoute.POST(json({ text: "We are a small team looking for someone friendly to help out in the shop at weekends." }))).json();
    expect(body).toMatchObject({ fit: null, fitKnown: false, notFound: ["title", "employer", "location", "requirements"] });
    const listed = await (await appsRoute.GET()).json();
    expect(listed[0]).toMatchObject({ fitKnown: false, job: { title: "", employer: "", location: "" } });
    for (const s of INVENTED) expect(JSON.stringify([body, listed]).includes(s), s).toBe(false);
  });

  it("an application saved when the fit was raised to 50 shows its real fit", async () => {
    const { applicationId } = await (await jobsRoute.POST(json({ text: ADVERT }))).json();
    const app = (await db.getApplication(applicationId, sam.id))!;
    await db.saveApplication({ ...app, fit: 50 });
    expect((await (await appsRoute.GET()).json())[0]).toMatchObject({ fit: 0, fitKnown: true });
    expect((await (await appRoute.GET(new Request("http://localhost/x"), ctx({ id: applicationId }))).json()).application).toMatchObject({ fit: 0, fitKnown: true });
  });
});

describe("what is written for an application", () => {
  async function application() {
    return (await (await jobsRoute.POST(json({ text: ADVERT }))).json()).applicationId as string;
  }

  it("an answer is the person's notes and nothing else", async () => {
    const id = await application();
    const res = await answersRoute.POST(json({ question: "Tell us about a difficult donor.", notes: "The donor wanted the maps back. I agreed a loan instead.", limit: 150 }), ctx({ id, questionId: "q1" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.draft).toBe("The donor wanted the maps back. I agreed a loan instead.");
    expect(body.whatWeAdded).toMatch(/^Nothing/);
    const saved = (await db.listOutputs(id, sam.id))[0];
    expect(saved.versions[0].sentences.map((s) => s.text)).toEqual(["The donor wanted the maps back.", "I agreed a loan instead."]);
    for (const s of INVENTED) expect(JSON.stringify([body, saved]).includes(s), s).toBe(false);
  });

  it("a letter holds the person's reason and their own evidence, and no claim about them", async () => {
    await db.saveEvidence({ id: "ev_1", userId: sam.id, text: "Catalogued 4,000 maps in a year.", numbers: ["4,000"], skillTags: [], sourceKind: "typed-note", confirmed: true, createdAt: NOW, updatedAt: NOW });
    const id = await application();
    const body = await (await letterRoute.POST(json({ whyThisJob: "I have loved maps since I was a child." }), ctx({ id }))).json();
    const text = body.output.versions[0].text as string;
    expect(text).toContain("because I have loved maps since I was a child.");
    expect(text).toContain("Catalogued 4,000 maps in a year.");
    for (const s of ["6 years", "resilient systems", "cloud system migrations", "Mentored engineering teams", "engineering outcomes", "sustainable architecture"]) expect(text.includes(s), s).toBe(false);
    // The application now points at its letter.
    expect((await db.getApplication(id, sam.id))!.letterOutputId).toBe(body.output.id);
  });

  it("the pack holds no phone number, place or job detail the person or the advert didn't give", async () => {
    const id = await application();
    const pack = await (await packRoute.GET(new Request("http://localhost/x"), ctx({ id }))).json();
    expect(pack.candidate).toMatchObject({ name: "Sam Okafor", email: "sam@example.com", phone: "", location: "" });
    expect(pack.job).toMatchObject({ title: "Archive Assistant", employer: "Lantern Atlas", location: "York" });
  });
});

describe("what the Apply routes accept", () => {
  it("text that isn't JSON, or isn't the right shape, is refused with 400 and never a server error", async () => {
    const { applicationId: id } = await (await jobsRoute.POST(json({ text: ADVERT }))).json();
    const calls: [string, () => Promise<Response>][] = [
      ["jobs", () => jobsRoute.POST(json("not json"))],
      ["jobs shape", () => jobsRoute.POST(json({ text: 5 }))],
      ["evidence", () => evidenceRoute.POST(json("{"))],
      ["evidence shape", () => evidenceRoute.POST(json({ text: "A real note.", sourceKind: "made-up" }))],
      ["profile", () => profileRoute.PATCH(json("nope", "PATCH"))],
      ["profile shape", () => profileRoute.PATCH(json({ screening: { salaryMin: "lots" } }, "PATCH"))],
      ["voice", () => voiceRoute.PATCH(json("[", "PATCH"))],
      ["voice shape", () => voiceRoute.PATCH(json({ never: "none" }, "PATCH"))],
      ["samples", () => samplesRoute.POST(json("x"))],
      ["settings", () => settingsRoute.PUT(json("x", "PUT"))],
      ["settings shape", () => settingsRoute.PUT(json({ dailyCap: 500 }, "PUT"))],
      ["answers", () => answersRoute.POST(json("x"), ctx({ id, questionId: "q1" }))],
      ["letter", () => letterRoute.POST(json("x"), ctx({ id }))],
      ["application", () => appRoute.PATCH(json("x", "PATCH"), ctx({ id }))],
    ];
    for (const [what, call] of calls) expect((await call()).status, what).toBe(400);
  });

  it("an oversized body is refused", async () => {
    expect((await jobsRoute.POST(json({ text: "x".repeat(250_000) }))).status).toBe(413);
  });

  it("a profile update keeps what was sent, ignores what can't be set and works out completeness itself", async () => {
    const res = await profileRoute.PATCH(json({ headline: "Archive assistant", userId: "usr_other", completeness: 100, contact: { name: "Sam Okafor", email: "sam@example.com", phone: "07700 000000", location: "York", links: [] } }, "PATCH"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ userId: sam.id, headline: "Archive assistant", completeness: 50 });
  });

  it("a writing sample is measured from the person's own text", async () => {
    const res = await samplesRoute.POST(json({ text: "I catalogue maps for a small museum. I like the work because every sheet has a story. We open to the public twice a week." }));
    const { voice } = await res.json();
    expect(res.status).toBe(200);
    expect(voice.samples).toHaveLength(1);
    expect(voice.measured.sentenceMean).toBeGreaterThan(0);
    expect(voice.never).toEqual([]);
    expect((await samplesRoute.POST(json({ text: "Too short." }))).status).toBe(400);
  });
});

describe("the Apply routes and pages themselves", () => {
  const root = path.join(__dirname, "../..");
  const files = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name) ? [path.join(dir, e.name)] : []));
  const sources = [...files(path.join(root, "app/api/apply")), ...files(path.join(root, "app/(studio)/apply")), path.join(root, "lib/apply/db.ts"), path.join(root, "lib/apply/own-data.ts")].map((f) => [f, fs.readFileSync(f, "utf8")] as const);

  it("hold none of the sample people, jobs, figures or sentences an earlier build showed as the person's own", () => {
    const stock = ["usr_guest", "Alex Morgan", "FinTech Scaleup", "Innovative Tech Group", "+44 7700 900123", "Global FinTech", "Cloud Infrastructure Labs", "STARTER_APPLICATIONS", "Math.max(50", "weekly alignment cadence", "6 years of commercial experience", "Scam Recruitment", "candidate@example.com", "Job Posting from"];
    for (const [file, text] of sources) for (const s of stock) expect(text.includes(s), `${s} in ${path.relative(root, file)}`).toBe(false);
  });
});
