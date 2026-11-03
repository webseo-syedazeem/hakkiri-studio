// End-to-end: the new interview flow in mock mode (HAKKIRI_MOCK_AI=1, fake mic).
// Set-up with settings → overview → interview with a skip → report → run it again →
// drill → story → prep sheet → something's wrong → rebuild → three skips → edit → Home.
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:3100";
const S = __dirname, OUT = `${__dirname}/out`; require("fs").mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.error("step", ...a);

async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["microphone"] });
  await ctx.addCookies([{ name: "hk_welcomed", value: "1", url: BASE }, { name: "hk_mic_ok", value: "1", url: BASE }]);
  await ctx.addInitScript(() => {
    try {
      Object.defineProperty(window, "speechSynthesis", { value: undefined });
    } catch {}
  });
  ctx.setDefaultTimeout(30000);
  const page = await ctx.newPage();
  page.errors = [];
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("pageerror", (e) => page.errors.push(String(e)));
  return page;
}

/**
 * Answers whatever is asked until the URL matches `done`. `onQuestion(info)` may
 * return "skip:<reason label>" or "wrong" to act instead of answering.
 */
async function runUntil(page, done, { onQuestion, shots = {}, drill = false } = {}) {
  const seen = [];
  const t0 = Date.now();
  let n = 0;
  while (!done.test(page.url())) {
    if (++n > 200) throw new Error("runUntil: too many loops at " + page.url());
    if (drill) {
      const nextQ = page.getByRole("button", { name: /^(Next question|See your summary)$/ });
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
    const progress = await page.locator('[aria-label^="Question "]').first().getAttribute("aria-label").catch(() => "");
    const isFollowUp = await page.getByText(/^Follow-up \d of \d$/).isVisible();
    const h1 = await page.locator("h1").innerText();
    const left = await page.getByText(/ left$/).first().innerText().catch(() => "");
    const info = { progress, isFollowUp, h1, left };
    seen.push(`${((Date.now() - t0) / 1000).toFixed(0)}s ${progress} ${left} ${isFollowUp ? "follow-up" : "question"}: ${h1.slice(0, 70)}`);
    const key = `${progress}|${isFollowUp ? "f" : "q"}`;
    if (shots[key]) await page.screenshot({ path: `${OUT}/${shots[key]}.png` });
    const act = onQuestion ? await onQuestion(info) : null;
    if (act && act.startsWith("skip:")) {
      await page.getByRole("button", { name: "Skip" }).click();
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
    if (act === "wrong" || act === "stop") return { seen, stopped: true };
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
  const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const p = await newPage(browser);
  const out = {};

  /* ---------------------------------------------------------------- set-up */
  log("set-up");
  await p.goto(`${BASE}/interviews/new`, { waitUntil: "networkidle" });
  await p.fill("#company", "Acme Payroll");
  await p.fill("#job-title", "Data Analyst");
  const jd =
    "Acme Payroll runs payroll for 4,000 small businesses. As a Data Analyst you will own the SQL models behind our payroll accuracy dashboards, work with finance and operations stakeholders, and use Python to automate checks. You will present findings to leadership every month. We want someone who can explain data simply, spot errors early and care about getting pay right for every employee.";
  await p.fill('input[aria-label="Job spec: a link or the job description"]', jd);
  await p.getByText("Job description pasted").waitFor();
  await p.setInputFiles("#cv", `${S}/fixtures/sam-okafor-cv.pdf`);
  await p.getByText("sam-okafor-cv.pdf", { exact: true }).waitFor({ timeout: 20000 });
  // Settings: Hard, 30 min, Skills-heavy, then Situational off and more Technical.
  out.settingsRow = await p.getByText(/^About \d+ questions:/).first().innerText();
  await p.getByRole("button", { name: "Customise" }).click();
  await p.getByRole("radio", { name: "Hard" }).check({ force: true });
  await p.getByRole("radio", { name: "30 min" }).check({ force: true });
  await p.getByRole("radio", { name: "Skills-heavy" }).click();
  await p.getByRole("switch", { name: "Situational questions" }).click();
  await p.getByRole("button", { name: "More Technical" }).click();
  await sleep(300);
  out.mixAfterEdits = await p.locator('[aria-label$="%"]').evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  await p.screenshot({ path: `${OUT}/01-setup.png`, fullPage: true });
  await p.getByRole("button", { name: "Build my interview" }).click();
  await p.waitForURL(/\/interviews\/[^/]+\?new=1/, { timeout: 60000 });
  await sleep(800);
  const id = p.url().split("/interviews/")[1].split("?")[0];
  out.id = id;
  await p.screenshot({ path: `${OUT}/02-overview-new.png`, fullPage: true });
  out.overviewNew = (await p.locator("main").innerText()).slice(0, 1400);

  /* ------------------------------------------------------------- interview */
  log("interview");
  await p.getByRole("button", { name: "Start interview" }).first().click();
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
  await p.waitForLoadState("networkidle");
  await sleep(1200);
  await p.screenshot({ path: `${OUT}/07-report.png`, fullPage: true });
  out.report = (await p.locator("main").innerText()).slice(0, 2600);
  const reportUrl = p.url();

  // An answer from the report, and back.
  await p.locator('a[href*="/answers/"]').first().click();
  await p.waitForURL(/\/answers\//);
  out.answerBack = await p.getByRole("link", { name: "Back to report" }).isVisible();
  await p.goto(reportUrl, { waitUntil: "networkidle" });

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
  await sleep(1000);
  await p.screenshot({ path: `${OUT}/09-rerun-report.png`, fullPage: true });
  out.rerunReport = (await p.locator("main").innerText()).slice(0, 1800);

  /* ------------------------------------------------------------------ drill */
  log("drill");
  await p.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
  await sleep(600);
  await p.screenshot({ path: `${OUT}/10-overview-after.png`, fullPage: true });
  out.overviewAfter = (await p.locator("main").innerText()).slice(0, 2400);
  const training = p.locator('section[aria-label="Your training"]');
  const drillStart = training.getByRole("button", { name: /^(Start|Again)$/ }).first();
  out.firstDrill = await training.locator(".font-semibold").nth(1).innerText().catch(() => "");
  await drillStart.click();
  await p.waitForURL(/session=/, { timeout: 30000 });
  await sleep(500);
  await p.screenshot({ path: `${OUT}/11-drill-ready.png` });
  out.drillReady = (await p.locator("main").innerText()).replace(/\n+/g, " | ");
  await p.getByRole("button", { name: "Start drill" }).click();
  const run3 = await runUntil(p, /\/mocks\//, { drill: true, shots: { feedback: "12-drill-feedback" } });
  out.run3 = run3.seen;
  await sleep(1000);
  await p.screenshot({ path: `${OUT}/13-drill-report.png`, fullPage: true });
  out.drillReport = (await p.locator("main").innerText()).slice(0, 1400);

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
  out.prep = (await p.locator('article[aria-label="Prep sheet"]').innerText()).slice(0, 2400);
  await p.emulateMedia({ media: "print" });
  await p.screenshot({ path: `${OUT}/17-prep-print.png`, fullPage: true });
  await p.pdf({ path: `${OUT}/prep.pdf`, format: "A4", printBackground: true });
  await p.emulateMedia({ media: "screen" });

  /* ------------------------------------------------------ something's wrong */
  log("something wrong");
  await p.goto(`${BASE}/interviews/${id}#new-questions`, { waitUntil: "networkidle" });
  await p.getByRole("button", { name: "Start with new questions" }).click();
  await p.waitForURL(/session=/, { timeout: 60000 });
  await p.getByRole("button", { name: "Start interview" }).click();
  await p.getByRole("button", { name: "Start answering" }).waitFor();
  await p.getByRole("button", { name: "Something’s wrong" }).click();
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
  const run4 = await runUntil(p, /never/, {
    onQuestion: async (i) => {
      if (i.isFollowUp) return null;
      // "Tell me about yourself" can't be skipped: there's no Skip button on it.
      if (/^Tell me about yourself/.test(i.h1)) {
        out.noSkipOnOpening = !(await p.getByRole("button", { name: "Skip" }).isVisible());
        return null;
      }
      if (skips === 3) return "stop";
      skips++;
      return `skip:${["Not true about me", "Not relevant to the role", "Wrong level"][skips - 1]}`;
    },
  }).catch(async (e) => ({ seen: [String(e)] }));
  // The third skip opens the panel by itself.
  const dialog = p.getByRole("dialog", { name: "Something’s wrong" });
  await dialog.waitFor({ timeout: 10000 });
  out.threeSkips = { seen: run4.seen, panel: (await dialog.innerText()).replace(/\n+/g, " | ") };
  await p.screenshot({ path: `${OUT}/20-three-skips.png` });
  await p.getByRole("button", { name: "Fix it and restart" }).click();
  await p.waitForURL(/\/rebuild\?from=/, { timeout: 30000 });
  await p.getByRole("button", { name: "Rebuild and start" }).waitFor({ timeout: 30000 });
  await sleep(400);
  out.secondRebuildChecksDocs = await p.getByText("Still wrong after a rebuild?").isVisible();
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
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await sleep(600);
  await p.screenshot({ path: `${OUT}/23-home.png`, fullPage: true });
  out.home = (await p.locator("main").innerText()).slice(0, 1600);
  await p.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${OUT}/24-interviews.png`, fullPage: true });

  out.errors = p.errors;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
