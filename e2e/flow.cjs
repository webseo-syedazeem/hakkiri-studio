// End-to-end: the whole interview in mock mode (HAKKIRI_MOCK_AI=1, fake mic), as a new signed-in user.
// Set-up (four steps) → overview → interview with a skip → report → an answer → run it again →
// focused practice on a topic → story → prep sheet → report an issue → rebuild → three skips → edit → lists → Home.
const { chromium } = require("playwright");
const { BASE, OUT, FAKE_MIC, signIn, setUpInterview, closeSurvey } = require("./helpers.cjs");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.error("step", ...a);

async function newPage(browser) {
  const { context, page } = await signIn(browser, "flow");
  context.setDefaultTimeout(30000);
  page.errors = [];
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("pageerror", (e) => page.errors.push(String(e)));
  return page;
}

/**
 * Answers whatever is asked until the URL matches `done`, or `until()` says so. `onQuestion(info)`
 * may return "skip:<reason label>" to skip the question instead of answering it.
 */
async function runUntil(page, done, { onQuestion, until, shots = {}, drill = false } = {}) {
  const seen = [];
  const t0 = Date.now();
  let n = 0;
  while (!done.test(page.url())) {
    if (++n > 200) throw new Error("runUntil: too many loops at " + page.url());
    if (until && (await until())) return { seen, stopped: true };
    if (drill) {
      // Focused practice gives feedback after each answer, then "Next question →" or "See your summary".
      const nextQ = page.getByRole("button", { name: /^(Next question|See your summary)/ });
      if (await nextQ.isVisible().catch(() => false)) {
        const h = await page.locator("main").innerText();
        seen.push(`feedback: ${h.replace(/\n+/g, " | ").slice(0, 220)}`);
        if (shots.feedback) {
          await page.screenshot({ path: `${OUT}/${shots.feedback}.png` });
          delete shots.feedback;
        }
        await nextQ.click();
        continue;
      }
    }
    const startAnswering = page.getByRole("button", { name: "Start answering" });
    const asked = await startAnswering.waitFor({ timeout: 1500 }).then(() => true, () => false);
    if (!asked) {
      if (n % 10 === 0) {
        const btns = await page.$$eval("button", (bs) => bs.filter((b) => b.offsetParent).map((b) => b.innerText.trim()).filter(Boolean)).catch(() => []);
        const h1 = await page.locator("h1").first().innerText().catch(() => "");
        console.error(`  waiting #${n} ${page.url().replace(BASE, "")} | ${h1.slice(0, 60)} | ${btns.join(" / ")}`);
        if (n === 20) await page.screenshot({ path: `${OUT}/stuck.png` });
      }
      continue;
    }
    const progress = await page.locator('[aria-label^="Question "]').first().getAttribute("aria-label", { timeout: 1000 }).catch(() => "");
    const isFollowUp = await page.getByText(/^Follow-up \d of \d$/).first().isVisible();
    const h1 = await page.locator("h1").innerText();
    const left = await page.getByText(/ left$/).first().innerText({ timeout: 1000 }).catch(() => "");
    const info = { progress, isFollowUp, h1, left };
    seen.push(`${((Date.now() - t0) / 1000).toFixed(0)}s ${progress} ${left} ${isFollowUp ? "follow-up" : "question"}: ${h1.slice(0, 70)}`);
    const key = `${progress}|${isFollowUp ? "f" : "q"}`;
    if (shots[key]) await page.screenshot({ path: `${OUT}/${shots[key]}.png` });
    const act = onQuestion ? await onQuestion(info) : null;
    if (act && act.startsWith("skip:")) {
      // "Skip" asks why and brings a replacement; "Skip question" next to it just moves on.
      await page.getByRole("button", { name: "Skip", exact: true }).click();
      await sleep(200);
      if (shots.skipmenu) {
        await page.screenshot({ path: `${OUT}/${shots.skipmenu}.png` });
        delete shots.skipmenu;
      }
      await page.getByRole("menuitem", { name: act.slice(5) }).click();
      seen.push(`  skipped (${act.slice(5)})`);
      await sleep(400);
      continue;
    }
    // The question may finish being read out before the click lands.
    await startAnswering.click({ timeout: 2500 }).catch(() => {});
    const finish = page.getByRole("button", { name: "Finish answer" });
    await finish.waitFor({ timeout: 20000 });
    await sleep(3600);
    await finish.click();
  }
  return { seen };
}

(async () => {
  const browser = await chromium.launch({ args: FAKE_MIC });
  const p = await newPage(browser);
  const out = {};

  /* ---------------------------------------------------------------- set-up */
  log("set-up");
  // Job details (company, title, pasted job description, CV), stages, practice set-up (Hard, 30 min), review.
  const id = await setUpInterview(p, {
    difficulty: "Hard",
    minutes: 30,
    onStep: async (name) => {
      if (name === "practice setup") out.practiceSetup = (await p.locator("main").innerText()).replace(/\n+/g, " | ").slice(0, 900);
      if (name === "review") out.review = (await p.locator("main").innerText()).replace(/\n+/g, " | ").slice(0, 900);
      await p.screenshot({ path: `${OUT}/01-setup-${name.replace(/ /g, "-")}.png`, fullPage: true });
    },
  });
  out.id = id;
  // Set-up ends on the list, with the new interview on it.
  await p.locator(`a[href="/interviews/${id}"]`).first().click();
  await p.waitForURL(new RegExp(`/interviews/${id}$`));
  await p.getByRole("heading", { level: 1, name: "Data Analyst" }).waitFor();
  await sleep(800);
  await p.screenshot({ path: `${OUT}/02-overview-new.png`, fullPage: true });
  out.overviewNew = (await p.locator("main").innerText()).slice(0, 1400);
  if (!/Acme Payroll/.test(out.overviewNew) || !/Hard/.test(out.overviewNew)) throw new Error("The overview doesn't show the company and the difficulty chosen in set-up.");

  /* ------------------------------------------------------------- interview */
  log("interview");
  await p.getByRole("button", { name: "Practise interview" }).click();
  await p.waitForURL(/\/mock\/.*session=/, { timeout: 60000 });
  await sleep(500);
  await p.screenshot({ path: `${OUT}/03-live-ready.png` });
  out.liveReady = (await p.locator("main").innerText()).replace(/\n+/g, " | ");
  await p.getByRole("button", { name: "Start interview" }).click();
  let mains = 0;
  const run1 = await runUntil(p, /\/mocks\//, {
    shots: { "Question 1 of 8|q": "04-live-q1", "Question 2 of 8|f": "05-live-followup", skipmenu: "06-skip-menu" },
    onQuestion: async (i) => {
      if (i.isFollowUp) return null;
      mains++;
      return mains === 3 ? "skip:Not relevant to the role" : null;
    },
  });
  out.run1 = run1.seen;
  if (!run1.seen.some((s) => /skipped \(Not relevant to the role\)/.test(s))) throw new Error("The third question wasn't skipped.");
  if (!run1.seen.some((s) => / follow-up: /.test(s))) throw new Error("The interviewer never followed up.");
  await p.waitForLoadState("networkidle");
  await closeSurvey(p);
  await p.getByRole("heading", { level: 1, name: "Interview report" }).waitFor();
  await sleep(1200);
  await p.screenshot({ path: `${OUT}/07-report.png`, fullPage: true });
  out.report = (await p.locator("main").innerText()).slice(0, 2600);
  const reportUrl = p.url();

  // An answer from the report, and back.
  await p.locator('a[href*="/answers/"]').first().click();
  await p.waitForURL(/\/answers\//);
  out.answer = (await p.locator("main").innerText()).replace(/\n+/g, " | ").slice(0, 500);
  await p.getByTitle("Close and return to report").click();
  await p.waitForURL((u) => u.href.split("?")[0] === reportUrl.split("?")[0]);
  out.answerBack = true;
  await closeSurvey(p);

  /* ---------------------------------------------------------- run it again */
  log("rerun");
  await p.getByRole("button", { name: /Run it again/ }).first().click();
  await p.waitForURL(/session=/, { timeout: 30000 });
  await sleep(500);
  await p.screenshot({ path: `${OUT}/08-rerun-ready.png` });
  out.rerunReady = (await p.locator("main").innerText()).replace(/\n+/g, " | ");
  await p.getByRole("button", { name: "Start interview" }).click();
  const run2 = await runUntil(p, /\/mocks\//);
  out.run2 = run2.seen;
  await p.waitForLoadState("networkidle");
  await p.getByRole("heading", { level: 1, name: "Run it again: before and after" }).waitFor();
  await sleep(1000);
  await p.screenshot({ path: `${OUT}/09-rerun-report.png`, fullPage: true });
  out.rerunReport = (await p.locator("main").innerText()).slice(0, 1800);

  /* ------------------------------------------------------- focused practice */
  log("focused practice");
  await p.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
  await sleep(600);
  await p.screenshot({ path: `${OUT}/10-overview-after.png`, fullPage: true });
  out.overviewAfter = (await p.locator("main").innerText()).slice(0, 2400);
  // "Focus by topic" on the overview: a few questions on one topic, with feedback after each.
  const topic = p.getByRole("link", { name: /STAR framework workout/ });
  out.firstDrill = (await topic.innerText()).replace(/\n+/g, " | ");
  await topic.click();
  await p.waitForURL(/\/mock\/.*topic=star/, { timeout: 30000 });
  await sleep(500);
  await p.screenshot({ path: `${OUT}/11-drill-ready.png` });
  out.drillReady = (await p.locator("main").innerText()).replace(/\n+/g, " | ");
  await p.getByRole("button", { name: "Start practice" }).click();
  const run3 = await runUntil(p, /\/mocks\//, { drill: true, shots: { feedback: "12-drill-feedback" } });
  out.run3 = run3.seen;
  if (!run3.seen.some((s) => s.startsWith("feedback: "))) throw new Error("Focused practice gave no feedback after an answer.");
  await p.waitForLoadState("networkidle");
  // Its summary: each answer, under the topic's name.
  await p.getByRole("heading", { level: 1, name: "Focused practice: STAR framework workout" }).waitFor();
  await sleep(1000);
  await p.screenshot({ path: `${OUT}/13-drill-report.png`, fullPage: true });
  out.drillReport = (await p.locator("main").innerText()).slice(0, 1400);
  const drillAnswers = await p.locator('section[aria-label="Each answer"] a[href*="/answers/"]').count();
  if (!drillAnswers) throw new Error("The summary of the focused practice lists no answers.");

  /* ------------------------------------------------------------------ story */
  log("story");
  await p.goto(`${BASE}/interviews/${id}/story`, { waitUntil: "networkidle" });
  await p.fill("#story-situation", "Our payroll accuracy report kept missing errors that clients found first.");
  await p.fill("#story-task", "I had to find out why before the next pay run.");
  await p.fill("#story-action", "I rebuilt the SQL checks, added a Python test for every rule, and walked finance through the new dashboard.");
  await p.fill("#story-result", "Errors caught before pay day went from 3 in 10 to 9 in 10.");
  await p.screenshot({ path: `${OUT}/14-story.png`, fullPage: true });
  await p.getByRole("button", { name: "Draft my story" }).click();
  await p.getByText("Saved to your stories and your prep sheet").waitFor({ timeout: 20000 });
  await p.screenshot({ path: `${OUT}/15-story-done.png`, fullPage: true });
  out.story = (await p.locator('section[aria-label="Your story"]').innerText()).slice(0, 600);

  /* ------------------------------------------------------------- prep sheet */
  log("prep");
  await p.goto(`${BASE}/interviews/${id}/prep`, { waitUntil: "networkidle" });
  await sleep(600);
  await p.screenshot({ path: `${OUT}/16-prep.png`, fullPage: true });
  out.prep = (await p.locator("main").innerText()).slice(0, 2400);
  if (!/Acme Payroll/.test(out.prep)) throw new Error("The prep sheet isn't about this interview.");
  await p.emulateMedia({ media: "print" });
  await p.screenshot({ path: `${OUT}/17-prep-print.png`, fullPage: true });
  await p.pdf({ path: `${OUT}/prep.pdf`, format: "A4", printBackground: true });
  await p.emulateMedia({ media: "screen" });

  /* ------------------------------------------------------- report an issue */
  log("report an issue");
  await p.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
  await p.getByRole("button", { name: "Practise interview" }).click();
  await p.waitForURL(/session=/, { timeout: 60000 });
  await p.getByRole("button", { name: "Start interview" }).click();
  await p.getByRole("button", { name: "Start answering" }).waitFor();
  await p.getByRole("button", { name: "Report an issue" }).click();
  await p.getByRole("dialog", { name: "Something’s wrong" }).waitFor();
  await p.getByRole("button", { name: "Wrong kind of questions" }).click();
  await p.fill("#wrong-note", "It's an analyst job, I keep getting questions about managing a sales team.");
  await sleep(200);
  await p.screenshot({ path: `${OUT}/18-something-wrong.png` });
  await p.getByRole("button", { name: "Fix it and restart" }).click();
  await p.waitForURL(/\/rebuild\?from=/, { timeout: 30000 });
  await p.getByRole("button", { name: "Rebuild and start" }).waitFor({ timeout: 30000 });
  await sleep(400);
  await p.screenshot({ path: `${OUT}/19-rebuild.png`, fullPage: true });
  out.rebuild = (await p.locator("main").innerText()).slice(0, 1500);
  await p.getByRole("button", { name: "Rebuild and start" }).click();
  await p.waitForURL(/\/mock\/.*session=/, { timeout: 60000 });
  out.afterRebuild = p.url().replace(BASE, "");

  /* -------------------------------------------------------- three skips */
  log("three skips");
  await p.getByRole("button", { name: "Start interview" }).click();
  let skips = 0;
  const dialog = p.getByRole("dialog", { name: "Something’s wrong" });
  const run4 = await runUntil(p, /\/mocks\//, {
    // The third skip opens the panel by itself.
    until: () => dialog.isVisible(),
    onQuestion: async (i) => {
      if (i.isFollowUp) return null;
      // The opening isn't replaced when skipped and doesn't count as a skip, so it's answered here.
      if (/^Tell me about yourself/.test(i.h1)) return null;
      skips++;
      return `skip:${["Not true about me", "Not relevant to the role", "Wrong level"][skips - 1] ?? "Already asked"}`;
    },
  });
  if (!run4.stopped || skips !== 3) throw new Error(`The panel should open by itself on the third skip (skipped ${skips}, ended at ${p.url()}).`);
  out.threeSkips = { seen: run4.seen, panel: (await dialog.innerText()).replace(/\n+/g, " | ") };
  if (!/skipped three questions/.test(out.threeSkips.panel)) throw new Error("The panel doesn't say three questions were skipped.");
  await p.screenshot({ path: `${OUT}/20-three-skips.png` });
  await p.getByRole("button", { name: "Fix it and restart" }).click();
  await p.waitForURL(/\/rebuild\?from=/, { timeout: 30000 });
  await p.getByRole("button", { name: "Rebuild and start" }).waitFor({ timeout: 30000 });
  await sleep(400);
  out.secondRebuild = (await p.locator("main").innerText()).slice(0, 900);
  await p.screenshot({ path: `${OUT}/21-rebuild-second.png`, fullPage: true });

  /* ------------------------------------------------------------- edit */
  log("edit understanding");
  await p.goto(`${BASE}/interviews/${id}/rebuild?edit=1`, { waitUntil: "networkidle" });
  await p.fill('input[aria-label="Level"]', "Senior");
  await p.getByRole("button", { name: "Rebuild, start later" }).click();
  await p.waitForURL(/rebuilt=1/, { timeout: 60000 });
  await sleep(500);
  out.afterEdit = (await p.locator("main").innerText()).slice(0, 600);

  /* --------------------------------------------------------------- lists */
  log("lists and home");
  await p.goto(`${BASE}/interviews/${id}/mocks`, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${OUT}/22-past.png`, fullPage: true });
  out.past = await p.locator("main").innerText();
  for (const kind of ["Interview", "Run it again", "STAR framework workout", "Stopped: rebuilt"]) {
    if (!out.past.includes(kind)) throw new Error(`Past interviews doesn't list "${kind}".`);
  }
  // Home for a signed-in user is the dashboard (the address "/" is the public landing page).
  await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await sleep(600);
  await p.screenshot({ path: `${OUT}/23-home.png`, fullPage: true });
  out.home = (await p.locator("main").innerText()).slice(0, 1600);
  await p.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
  await p.locator(`a[href="/interviews/${id}"]`).first().waitFor();
  await p.screenshot({ path: `${OUT}/24-interviews.png`, fullPage: true });

  out.errors = p.errors;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
