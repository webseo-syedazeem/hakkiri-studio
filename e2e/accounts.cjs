// Two people, one app. Everything a person makes is theirs alone: this walks what one account can
// see and do with another's interview, story, added question, practice session and demo copy, in a
// real browser and through the API with the second account's own session. Then one shared browser:
// what the app keeps on the device for one account is never shown to the next person who signs in.
// Finally, the admin area: an ordinary account and a signed-out visitor both get nothing.
const { chromium } = require("playwright");
const JSZip = require("jszip");
const { BASE, OUT, signIn } = require("./helpers.cjs");

const COMPANY = "Quillon Biotech Confidential";
const ROLE = "Regulatory Affairs Manager";
const CV = "Alex Morgan\nRegulatory Affairs Lead, Helix Pharma, 2019 to 2025\n- Led 14 submissions to the MHRA with no rejections\n- Managed a team of six\nBSc Chemistry, University of Leeds";
const JOB = "Quillon Biotech Confidential is hiring a Regulatory Affairs Manager to lead MHRA submissions, manage a small team and work with clinical operations. You must have experience with submissions and stakeholder management.";
const DRAFT_COMPANY = "Zephyr Secret Holdings";
const DRAFT_ROLE = "Head of Quiet Projects";

const results = [];
const check = (ok, what, detail = "") => {
  results.push({ ok: !!ok, what });
  console.log(`${ok ? "ok  " : "FAIL"} ${what}${ok || !detail ? "" : `  → ${detail}`}`);
};
/**
 * A request made by the page itself, so it carries that person's own session exactly as the app's
 * own requests do. Returns { status, ok, text() , json() } like a response.
 */
async function call(page, method, path, data) {
  if (!page.url().startsWith(BASE)) await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  const r = await page.evaluate(
    async ([m, p, d]) => {
      const res = await fetch(p, { method: m, headers: d === undefined ? {} : { "content-type": "application/json" }, body: d === undefined ? undefined : JSON.stringify(d), redirect: "manual" });
      return { status: res.status, ok: res.ok, type: res.type, body: await res.text().catch(() => "") };
    },
    [method, path, data],
  );
  const status = r.type === "opaqueredirect" ? 307 : r.status;
  return { status: () => status, ok: () => r.ok, text: async () => r.body, json: async () => JSON.parse(r.body) };
}
const req = (page) => ({
  get: (url) => call(page, "GET", url.replace(BASE, "")),
  post: (url, o = {}) => call(page, "POST", url.replace(BASE, ""), o.data),
  patch: (url, o = {}) => call(page, "PATCH", url.replace(BASE, ""), o.data),
  delete: (url) => call(page, "DELETE", url.replace(BASE, "")),
});
/** Everything in a person's "Download my data" zip, unpacked and read as text (recordings aside). */
async function download(page) {
  const b64 = await page.evaluate(async () => {
    const res = await fetch("/api/data/export");
    if (!res.ok) return `!${res.status}`;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  });
  if (b64.startsWith("!")) throw new Error(`The data download failed: ${b64.slice(1)}`);
  const zip = await JSZip.loadAsync(Buffer.from(b64, "base64"));
  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
  const texts = await Promise.all(names.filter((n) => /\.(json|txt|md|csv)$/i.test(n)).map((n) => zip.files[n].async("string")));
  return { names, text: texts.join("\n") };
}
const personalKeys = (page) =>
  page.evaluate(() => Object.keys(localStorage).filter((k) => (k.startsWith("hk_") || k.startsWith("hakkiri.cv.")) && k !== "hk_browser_owner" && !k.startsWith("hk_vault:") && k !== "hk_vis_id"));

(async () => {
  const browser = await chromium.launch();
  try {
    // ── Alice sets up an interview, adds a question and builds a story ───────────────────────────
    const alice = await signIn(browser, "acct-alice");
    const a = alice.page;
    await a.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    const aApi = req(a);
    const built = await aApi.post(`${BASE}/api/interviews`, {
      data: { company: { name: COMPANY }, job: { title: ROLE, text: JOB }, cv: { text: CV, label: "CV.pdf" }, format: "video" },
    });
    if (!built.ok()) throw new Error(`Alice's interview couldn't be built: ${built.status()} ${await built.text()}`);
    const { id } = await built.json();
    const added = await aApi.post(`${BASE}/api/questions`, { data: { interviewId: id, text: "Why did you leave Helix after the labelling dispute?", group: "motivation" } });
    check(added.ok(), "Alice adds her own question to her interview", `${added.status()}`);
    const story = { skill: "Stakeholders", question: "Tell me about a time you handled a difficult stakeholder.", parts: { situation: "At Helix the clinical lead disputed a label change.", task: "I had to agree wording before the submission date.", action: "I met her twice, brought the MHRA guidance and redrafted the label with her.", result: "The submission went in on time and was accepted first time." } };
    const storyRes = await aApi.post(`${BASE}/api/interviews/${id}/stories`, { data: story });
    check(storyRes.ok(), "Alice builds a story in her interview", `${storyRes.status()} ${(await storyRes.text()).slice(0, 120)}`);
    await a.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    check(await a.locator(`a[href="/interviews/${id}"]`).count(), "Alice sees her interview in her list");
    await a.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
    check((await a.locator("body").innerText()).includes(COMPANY), "Alice can open her interview");
    await a.screenshot({ path: `${OUT}/accounts-alice-workspace.png` });
    const aliceBefore = await download(a);
    check(aliceBefore.text.includes(COMPANY) && aliceBefore.text.includes("labelling dispute") && aliceBefore.text.includes("clinical lead disputed"), "Alice's download holds her interview, her question and her story", aliceBefore.names.join(", "));

    // ── Bob, a different account in a different browser ─────────────────────────────────────────
    const bob = await signIn(browser, "acct-bob");
    const b = bob.page;
    await b.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    const bobsList = await b.locator("body").innerText();
    check(!bobsList.includes(COMPANY) && !(await b.locator(`a[href="/interviews/${id}"]`).count()), "Bob's list doesn't show Alice's interview");
    await b.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    check(!(await b.locator("body").innerText()).includes(COMPANY), "Bob's home screen doesn't mention Alice's interview");

    for (const path of ["", "/prep", "/briefing", "/story", "/rebuild", "/mocks", "/answers/ans-anything", "/mocks/mock-anything"]) {
      const res = await b.goto(`${BASE}/interviews/${id}${path}`, { waitUntil: "networkidle" });
      const text = await b.locator("body").innerText();
      check(res.status() === 404 && !text.includes(COMPANY) && !text.includes(ROLE), `Bob opening Alice's interview${path || " workspace"} gets “not found” (${res.status()}) and none of it`);
    }
    await b.screenshot({ path: `${OUT}/accounts-bob-not-found.png` });
    for (const path of [`/mock/${id}`, `/rehearse/${id}`, `/practice?interview=${id}`]) {
      const res = await b.goto(`${BASE}${path}`, { waitUntil: "networkidle" }).catch(() => null);
      const text = await b.locator("body").innerText();
      check(!text.includes(COMPANY) && !text.includes(ROLE), `Bob naming Alice's interview on ${path.split("?")[0]} is shown none of it (${res ? res.status() : "no page"})`);
    }

    const api = req(b);
    const tries = [
      ["change", () => api.patch(`${BASE}/api/interviews/${id}`, { data: { stages: [{ name: "Changed by Bob" }] } })],
      ["delete", () => api.delete(`${BASE}/api/interviews/${id}`)],
      ["add a question to", () => api.post(`${BASE}/api/questions`, { data: { interviewId: id, text: "A question Bob wrote into Alice's interview?", group: "motivation" } })],
      ["write a story into", () => api.post(`${BASE}/api/interviews/${id}/stories`, { data: { ...story, parts: { ...story.parts, action: "BOB-WAS-HERE wrote this into someone else's interview." } } })],
      ["plan a session on", () => api.post(`${BASE}/api/interviews/${id}/sessions`, { data: { kind: "drill", drill: { kind: "pressure" } } })],
      ["save a session against", () => api.post(`${BASE}/api/mocks`, { data: { interviewId: id, startedAt: new Date().toISOString(), planned: 2, answerIds: ["ans-x"] } })],
    ];
    for (const [what, call] of tries) {
      const res = await call();
      check(res.status() === 404, `Bob can't ${what} Alice's interview through the API (${res.status()})`);
    }
    // These two check what was sent before they look for the interview, so the refusal is a 4xx of either kind.
    for (const [what, path, data] of [["rebuild", "rebuild", { rules: [], start: false }], ["reread the job for", "rethink", { sessionId: "sess-none" }]]) {
      const res = await api.post(`${BASE}/api/interviews/${id}/${path}`, { data });
      check(res.status() >= 400 && res.status() < 500, `Bob can't ${what} Alice's interview (${res.status()})`);
    }
    const fill = await api.post(`${BASE}/api/stories`, { data: { key: "at helix the clinical lead disputed a label change", parts: { situation: "", task: "BOB-WAS-HERE", action: "", result: "" } } });
    check(fill.status() === 404 || fill.status() === 400, `Bob can't reach Alice's story by its title (${fill.status()})`);
    const bobsExport = await download(b);
    check(bobsExport.names.length > 0 && !bobsExport.text.includes(COMPANY) && !bobsExport.text.includes("labelling dispute") && !bobsExport.text.includes("Helix"), "Bob's download holds nothing of Alice's", bobsExport.names.join(", "));

    const aliceAfter = await download(a);
    check(aliceAfter.text.includes(COMPANY) && !aliceAfter.text.includes("BOB-WAS-HERE") && !aliceAfter.text.includes("Changed by Bob") && !aliceAfter.text.includes("A question Bob wrote"), "Nothing Bob sent was written into Alice's data");
    await a.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
    check((await a.locator("body").innerText()).includes(COMPANY), "Alice's interview is still there, unchanged");

    // ── The demo interview is each person's own copy ────────────────────────────────────────────
    await b.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    const demoHref = await b.locator('a[href^="/interviews/"]').evaluateAll((links) => links.map((l) => l.getAttribute("href")).find((h) => h && !/\/new$/.test(h)) || "");
    const demoId = demoHref.split("/").pop();
    if (demoId) {
      const mine = await aApi.patch(`${BASE}/api/interviews/${demoId}`, { data: { settings: { difficulty: "hard", minutes: 10 }, stages: [{ name: "Alice's private stage note" }] } });
      check(mine.ok(), "Alice changes the demo interview's settings and stages", `${mine.status()}`);
      const theirs = await api.patch(`${BASE}/api/interviews/${demoId}`, { data: {} });
      const copy = theirs.ok() ? (await theirs.json()).interview : null;
      check(copy && copy.settings?.difficulty !== "hard" && !JSON.stringify(copy).includes("Alice's private stage note"), "Bob's copy of the demo has none of Alice's changes");
      const q = await aApi.post(`${BASE}/api/questions`, { data: { interviewId: demoId, text: "A question only Alice should see on the demo?", group: "technical" } });
      check(q.ok(), "Alice adds a question to her copy of the demo", `${q.status()}`);
      await b.goto(`${BASE}/interviews/${demoId}`, { waitUntil: "networkidle" });
      const bobsDemo = await b.locator("body").innerText();
      check(!bobsDemo.includes("Alice's private stage note") && !bobsDemo.includes("only Alice should see"), "Bob's demo workspace shows none of Alice's changes");
      check(!(await download(b)).text.includes("only Alice should see"), "Bob's download doesn't hold the question Alice added to the demo");
      check((await download(a)).text.includes("only Alice should see"), "…and Alice's own download does");
    } else {
      check(true, "No demo interview is listed for a new account (nothing to share)");
    }

    // ── Signed out: nothing ─────────────────────────────────────────────────────────────────────
    const visitor = await browser.newContext();
    const vp = await visitor.newPage();
    await vp.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
    const v = req(vp);
    for (const [what, call] of [
      ["read the interview page", () => v.get(`${BASE}/interviews/${id}`)],
      ["change the interview", () => v.patch(`${BASE}/api/interviews/${id}`, { data: { stages: [] } })],
      ["add a question", () => v.post(`${BASE}/api/questions`, { data: { interviewId: id, text: "A question from nobody at all?", group: "cv" } })],
      ["write a story", () => v.post(`${BASE}/api/interviews/${id}/stories`, { data: story })],
      ["download data", () => v.get(`${BASE}/api/data/export`)],
      ["list admin interviews", () => v.get(`${BASE}/api/admin/interviews`)],
    ]) {
      const res = await call();
      check([401, 307, 302].includes(res.status()) && !(await res.text()).includes(COMPANY), `A signed-out visitor can't ${what} (${res.status()})`);
    }
    await visitor.close();

    // ── The admin area, as an ordinary account ──────────────────────────────────────────────────
    const adminPage = await b.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
    check(adminPage.status() === 404 && !(await b.locator("body").innerText()).includes(COMPANY), `An ordinary account opening /admin gets “not found” (${adminPage.status()})`);
    for (const path of ["/api/admin/interviews", "/api/admin/users", "/api/admin/backup", "/api/feedback/survey"]) {
      const res = await api.get(`${BASE}${path}`);
      check(res.status() === 403 || res.status() === 404, `An ordinary account is refused ${path} (${res.status()})`);
    }
    await alice.context.close();
    await bob.context.close();

    // ── One shared browser, two accounts ────────────────────────────────────────────────────────
    const first = await signIn(browser, "acct-shared-first");
    const s = first.page;
    await s.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    const sApi = req(s);
    const firstUser = await (await sApi.get(`${BASE}/api/auth/me`)).json();
    await s.goto(`${BASE}/interviews/new`, { waitUntil: "networkidle" });
    await s.getByPlaceholder("e.g. HMRC, Monzo, Google").fill(DRAFT_COMPANY);
    await s.getByPlaceholder("e.g. Associate Product Manager").fill(DRAFT_ROLE);
    await s.getByRole("button", { name: "Save draft" }).first().click();
    await s.waitForFunction(() => !!localStorage.getItem("hk_interview_wizard_draft"), null, { timeout: 10000 });
    check((await s.evaluate(() => localStorage.getItem("hk_interview_wizard_draft"))).includes(DRAFT_COMPANY), "The first person's set-up draft is kept in the browser");
    check((await s.evaluate(() => localStorage.getItem("hk_browser_owner"))) === firstUser.user.id, "The browser records whose entries it holds");

    // Their session ends without a sign-out (it expired, or they closed the tab), and someone else signs up here.
    await first.context.clearCookies();
    const secondEmail = `acct-shared-second-${Date.now()}@example.com`;
    const signup = await sApi.post(`${BASE}/api/auth/signup`, { data: { email: secondEmail, password: "Password123!", name: "Second" } });
    if (!signup.ok()) throw new Error(`The second account couldn't sign up: ${signup.status()} ${await signup.text()}`);
    await first.context.addCookies([{ name: "hk_welcomed", value: "1", url: BASE }, { name: "hk_mic_ok", value: "1", url: BASE }]);
    await s.goto(`${BASE}/interviews/new`, { waitUntil: "networkidle" });
    const secondScreen = await s.locator("body").innerText();
    check(!secondScreen.includes(DRAFT_COMPANY) && !secondScreen.includes(DRAFT_ROLE) && !/Continuing saved draft/.test(secondScreen), "The next person to sign in is not shown the first person's draft");
    check((await s.getByPlaceholder("e.g. HMRC, Monzo, Google").inputValue()) !== DRAFT_COMPANY, "…and the set-up form is not filled in with it");
    check((await personalKeys(s)).length === 0, "…and nothing of the first person's is in view in the browser's storage", (await personalKeys(s)).join(", "));
    await s.screenshot({ path: `${OUT}/accounts-shared-second.png` });
    for (const path of ["/dashboard", "/interviews", "/interview-examples"]) {
      await s.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      const text = await s.locator("body").innerText();
      check(!text.includes(DRAFT_COMPANY) && !text.includes(DRAFT_ROLE), `The second person's ${path} doesn't mention the first person's draft`);
    }

    // The second person signs out with the button; the browser is left clean.
    await s.goto(`${BASE}/interviews/new`, { waitUntil: "networkidle" });
    await s.getByPlaceholder("e.g. HMRC, Monzo, Google").fill("Second Person Co");
    await s.getByRole("button", { name: "Save draft" }).first().click();
    await s.waitForFunction(() => !!localStorage.getItem("hk_interview_wizard_draft"), null, { timeout: 10000 });
    await s.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    await s.getByRole("button", { name: "Sign Out" }).first().click();
    await s.waitForURL((u) => !/\/settings/.test(u.pathname), { timeout: 15000 });
    check((await personalKeys(s)).length === 0 && (await s.evaluate(() => localStorage.getItem("hk_browser_owner"))) === null, "After signing out, nothing of that person's is in view in the browser");

    // The first person signs back in on the same browser and has their draft back.
    const login = await sApi.post(`${BASE}/api/auth/login`, { data: { email: first.email, password: "Password123!" } });
    if (!login.ok()) throw new Error(`The first person couldn't sign back in: ${login.status()} ${await login.text()}`);
    await s.goto(`${BASE}/interviews/new`, { waitUntil: "networkidle" });
    await s.waitForFunction((c) => (localStorage.getItem("hk_interview_wizard_draft") || "").includes(c), DRAFT_COMPANY, { timeout: 10000 }).catch(() => undefined);
    const back = await s.evaluate(() => localStorage.getItem("hk_interview_wizard_draft") || "");
    check(back.includes(DRAFT_COMPANY) && !back.includes("Second Person Co"), "The first person, signing back in, gets their own draft back and not the second person's");
    check((await s.getByPlaceholder("e.g. HMRC, Monzo, Google").inputValue()) === DRAFT_COMPANY, "…and the set-up form shows it");
    await s.screenshot({ path: `${OUT}/accounts-shared-first-back.png` });

    // Deleting all data clears what the browser holds as well.
    await s.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    const del = s.getByRole("button", { name: /Delete (all )?my data|Delete everything/i }).first();
    if (await del.count()) {
      await del.click();
      const box = s.getByRole("textbox").last();
      await box.fill("delete");
      const done = s.waitForResponse((r) => r.url().endsWith("/api/data/delete"), { timeout: 20000 });
      await s.getByRole("button", { name: /^Delete/ }).last().click();
      const res = await done;
      check(res.ok(), "“Delete all my data” succeeds", `${res.status()}`);
      await s.waitForFunction(() => !localStorage.getItem("hk_interview_wizard_draft"), null, { timeout: 10000 }).catch(() => undefined);
      check((await personalKeys(s)).length === 0, "…and what the browser held for that person is gone too", (await personalKeys(s)).join(", "));
    } else {
      check(false, "The “Delete all my data” button was not found on Settings");
    }
    check(first.errors.length === 0, "No page errors in the shared-browser walk", first.errors.join(" | "));
    await first.context.close();
  } finally {
    await browser.close();
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
