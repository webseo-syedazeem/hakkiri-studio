// Nothing on screen is made up. A new account sees zeros and empty states on the home screen, not a
// sample week. After setting up an interview with a dated stage, the home screen shows that and only
// that. After a practice interview, the report and the answer's feedback show what was recorded and
// measured in it, and none of the fixed text earlier builds showed to everyone. Runs in test mode
// (HAKKIRI_MOCK_AI=1), where the app says on the screen that scores are stand-ins.
const { chromium } = require("playwright");
const fs = require("fs");
const { BASE, OUT, FAKE_MIC, signIn, answerUntil, closeSurvey } = require("./helpers.cjs");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

// Text that earlier builds showed to every account as if it were theirs.
const STOCK = [
  "Halden",
  "Senior Product Manager, Payments",
  "Q1 roadmap",
  "You have 3 things coming up",
  "Staff Nurse",
  "HMRC",
  "Stripe",
  "Monzo",
  "Strong domain depth",
  "I explained a new digital process",
  "walked them through how it worked",
  "digital triage",
  "Rubric Match",
  "Communicating & Influencing",
  "Clear strengths in experience and motivation",
  "Strong, relevant examples and clear motivation",
  "Described the issue and your actions",
  "Build technical depth",
  "Fri 13 Nov",
  "Wed 5 Nov",
  "A payments metric drops",
];

const results = [];
const check = (ok, what, detail = "") => {
  results.push({ ok: !!ok, what });
  console.log(`${ok ? "ok  " : "FAIL"} ${what}${ok || !detail ? "" : `  → ${String(detail).slice(0, 300)}`}`);
};
const text = (page, sel = "body") => page.locator(sel).first().innerText();
const noStock = async (page, where) => {
  const body = await text(page);
  const found = STOCK.filter((s) => body.includes(s));
  check(found.length === 0, `${where}: none of the old fixed content is on screen`, found.join(" | "));
};
const axe = async (page, where) => {
  await page.addScriptTag({ content: AXE });
  // Scanned as a person sees it: once anything fading in has finished.
  const v = await page.evaluate(async () => (await Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 1500))]), await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map((x) => `${x.id} (${x.nodes.length}): ${x.nodes[0].target.join(" ")}`));
  check(v.length === 0, `${where}: accessibility scan is clean`, v.join(" ; "));
};
const api = (page, method, path, data) =>
  page.evaluate(
    async ([m, p, d]) => {
      const res = await fetch(p, { method: m, headers: d === undefined ? {} : { "content-type": "application/json" }, body: d === undefined ? undefined : JSON.stringify(d) });
      return { status: res.status, body: await res.json().catch(() => null) };
    },
    [method, path, data],
  );
const inDays = (n) => new Date(Date.now() + n * 86400000).toLocaleDateString("en-CA", { timeZone: "Europe/London" });

(async () => {
  const browser = await chromium.launch({ args: FAKE_MIC });
  try {
    const { page: p, errors } = await signIn(browser, "honest");
    p.context().setDefaultTimeout(30000);

    // ── A new account: the home screen is empty, and says what to do first ───────────────────────
    await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    check((await text(p, '[data-testid="home-headline"]')) === "Set up your first interview to get started.", "New account: the headline says to set up a first interview", await text(p, '[data-testid="home-headline"]'));
    for (const [id, label] of [["home-interviews", "Your interviews"], ["home-presentations", "Your presentations"], ["home-sessions", "Practice sessions completed"]]) {
      const t = (await text(p, `[data-testid="${id}"]`)).replace(/\s+/g, " ");
      check(new RegExp(`^${label} 0\\b`).test(t), `New account: “${label}” is 0`, t);
    }
    check(await p.locator('[data-testid="home-agenda-empty"]').count(), "New account: the agenda says nothing is booked");
    check(await p.locator('[data-testid="tracker-empty"]').count(), "New account: the stage tracker has no interviews in it");
    check(await p.locator('[data-testid="home-no-next-steps"]').count(), "New account: “Continue practising” has nothing to continue");
    check(await p.locator('[data-testid="home-no-recent"]').count(), "New account: “Recent practice” is empty");
    await noStock(p, "New account's home screen");
    await p.getByTestId("home-archive").click();
    const dialog = p.getByRole("dialog", { name: "Archive" });
    await dialog.waitFor();
    check(/Nothing archived yet/.test(await dialog.innerText()), "New account: the archive is empty", await dialog.innerText());
    await p.keyboard.press("Escape");
    check(await dialog.waitFor({ state: "hidden", timeout: 5000 }).then(() => true, () => false), "The archive closes with Escape");
    await p.screenshot({ path: `${OUT}/honest-01-home-new.png`, fullPage: true });
    await axe(p, "New account's home screen");

    // ── One interview of their own, with one dated stage ────────────────────────────────────────
    const built = await api(p, "POST", "/api/interviews", {
      company: { name: "Northgate Trust" },
      job: { title: "Ward Manager", text: "Northgate Trust is hiring a Ward Manager to lead a 28-bed medical ward, manage rotas and budgets, and improve patient flow. You must have experience leading nursing teams and handling complaints." },
      cv: { text: "Priya Shah\nSenior Staff Nurse, Northgate Trust, 2018 to 2025\n- Led a team of 12 on a 28-bed ward\n- Cut agency spend by 18% in a year\nBSc Adult Nursing, University of Leeds", label: "CV.pdf" },
      format: "in-person",
      settings: { difficulty: "easy", minutes: 10 },
      stages: [
        { id: "st-1", name: "Panel interview", date: inDays(3), time: "10:00", status: "next" },
        { id: "st-2", name: "Ward visit", status: "upcoming" },
      ],
    });
    if (built.status !== 200) throw new Error(`The interview couldn't be built: ${built.status} ${JSON.stringify(built.body)}`);
    const id = built.body.id;

    await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    check((await text(p, '[data-testid="home-headline"]')) === "You have 1 thing coming up this week.", "With one dated stage: the headline counts one thing this week", await text(p, '[data-testid="home-headline"]'));
    check(/^Your interviews 1\b/.test((await text(p, '[data-testid="home-interviews"]')).replace(/\s+/g, " ")), "…and “Your interviews” is 1");
    const agenda = (await text(p, '[data-testid="home-agenda"]')).replace(/\s+/g, " ");
    check(agenda.includes("Ward Manager") && agenda.includes("Northgate Trust · Panel interview") && agenda.includes("10:00") && agenda.includes("in 3 days"), "…and the agenda shows that stage, its time and how soon", agenda);
    check((agenda.match(/Prepare/g) || []).length === 1, "…and nothing else");
    const tracker = p.locator('[data-testid="home-metrics"] ~ div').first();
    check(/Stage 1 of 2/.test(await text(p)) && /Stage 1 · Panel interview/.test(await text(p)) && /Stage 2 · Ward visit/.test(await text(p)), "The stage tracker shows the interview's own two stages");
    check(/Ward Manager/.test(await text(p, '[data-testid="home-next-steps"]')), "“Continue practising” offers that interview");
    await noStock(p, "Home screen with one interview");
    await p.screenshot({ path: `${OUT}/honest-02-home-one.png`, fullPage: true });
    void tracker;

    // "Mark successful" is saved to the interview, not just shown.
    const saved = p.waitForResponse((r) => r.url().endsWith(`/api/interviews/${id}`) && r.request().method() === "PATCH");
    await p.getByRole("button", { name: "Mark successful" }).click();
    check((await saved).ok(), "“Mark successful” saves the stage change to the interview");
    await p.reload({ waitUntil: "networkidle" });
    check(/Stage 2 of 2/.test(await text(p)), "…and after a reload the tracker is on stage 2", (await text(p)).match(/Stage \d of \d/)?.[0]);
    const agenda2 = await p.locator('[data-testid="home-agenda-empty"]').count();
    check(agenda2 === 1, "…and the completed stage has left the agenda");

    // "End application" asks first, and how it ended; the archive entry is the person's own interview.
    await p.getByRole("button", { name: "End application" }).click();
    check(await p.getByText("Move this application to your archive?").count(), "“End application” asks before it acts");
    await p.getByRole("button", { name: "Not successful", exact: true }).click();
    await p.getByText(/moved to your archive/).waitFor();
    await p.getByTestId("home-archive").click();
    await dialog.waitFor();
    const archived = (await dialog.innerText()).replace(/\s+/g, " ");
    check(archived.includes("Ward Manager") && archived.includes("Northgate Trust") && archived.includes("Stage 2 · Ward visit") && archived.includes("None written."), "The archive entry holds the real role, company and stage, and no invented notes", archived);
    await dialog.getByRole("button", { name: "Take out of the archive" }).click();
    await p.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    check(/Stage 2 of 2/.test(await text(p)), "Taken out of the archive, the interview is tracked again");

    // ── Its workspace before any practice ──────────────────────────────────────────────────────
    await p.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
    const ws = await text(p, "main");
    check(/No practice scores recorded yet/.test(ws) && /No practice sessions yet/.test(ws), "Workspace before practice: no scores and no sessions are shown");
    check(!/\d\.\d\s*\/\s*5/.test(ws), "…and no score figure appears anywhere on it", ws.match(/\d\.\d\s*\/\s*5/)?.[0]);
    await noStock(p, "Workspace before practice");

    // ── A practice interview, then its report ──────────────────────────────────────────────────
    await p.getByRole("button", { name: /Start practising|Practise interview/ }).first().click();
    await p.waitForURL(/\/mock\/.*session=/, { timeout: 90000 });
    check(await p.getByTestId("test-mode-notice").count(), "Live interview: says it is in test mode");
    await p.getByRole("button", { name: "Start interview" }).click();
    const answered = await answerUntil(p, /\/mocks\/[^/]+$/);
    await p.waitForLoadState("networkidle");
    await closeSurvey(p);
    await p.getByRole("heading", { level: 1, name: "Interview report" }).waitFor();
    check(answered >= 2, `The practice interview ran (${answered} answers given)`);
    check(await p.getByTestId("test-mode-notice").count(), "Report: says the scores are stand-ins (test mode)");
    const score = (await text(p, '[data-testid="report-score"]')).trim();
    check(/^\d\.\d$|^–$/.test(score), "Report: the score is this session's own, or a dash when not scored", score);
    const summary = (await text(p, '[data-testid="report-summary"]')).replace(/\s+/g, " ");
    check(/\d+ questions?/.test(summary) && (/out of 5 overall/.test(summary) || /could be scored|Not scored/.test(summary)), "Report: the summary states this session's own counts and score", summary);
    const rows = p.locator('[data-testid="report-rows"] tbody tr');
    const n = await rows.count();
    check(n >= 1, `Report: lists the questions answered (${n})`);
    let rowsOk = n > 0;
    let detail = "";
    for (let i = 0; i < n; i++) {
      const cells = await rows.nth(i).locator("td").allInnerTexts();
      const scored = /^\d\.\d \/ 5$|^Not scored$/.test(cells[3].trim());
      const measured = /filler word|the target|point came|“I”|result|too short|Nothing could be measured/.test(cells[4]);
      if (!scored || !measured) {
        rowsOk = false;
        detail = cells.join(" | ");
      }
    }
    check(rowsOk, "Report: every row shows its own score (or “Not scored”) and what was measured in that answer", detail);
    check(!/2\.0 \/ 5/.test(await text(p, '[data-testid="report-rows"]')) || /2\.0/.test(score), "Report: no default “2.0 / 5” stands in for a missing score");
    await p.getByRole("tab", { name: "Session details" }).click();
    const details = (await text(p, '[data-testid="report-details"]')).replace(/\s+/g, " ");
    check(/Practice settings Easy · 10 min/.test(details) && /Questions planned \d+/.test(details), "Report: “Session details” shows the session's own settings and counts", details);
    await p.getByRole("tab", { name: "Question review" }).click();
    await noStock(p, "Report");
    await p.screenshot({ path: `${OUT}/honest-03-report.png`, fullPage: true });
    await axe(p, "Report");
    const reportUrl = p.url();

    // ── One answer's feedback ──────────────────────────────────────────────────────────────────
    await p.locator('[data-testid="report-rows"] a[href*="/answers/"]').first().click();
    await p.waitForURL(/\/answers\//);
    await p.getByTestId("answer-feedback").waitFor();
    check(await p.getByTestId("test-mode-notice").count(), "Answer feedback: says it is in test mode");
    const badge = (await text(p, '[data-testid="answer-score"]')).replace(/\s+/g, " ").trim();
    check(/^\d\.\d \/ 5$|^Not scored$/.test(badge), "Answer feedback: the score is the answer's own, or “Not scored”", badge);
    const extract = (await text(p, '[data-testid="answer-extract"]')).replace(/[“”…]/g, "").replace(/\s+/g, " ").trim();
    await p.getByRole("tab", { name: "Transcript" }).click();
    const transcript = (await text(p, '[data-testid="answer-transcript"]')).replace(/\s+/g, " ");
    const opening = extract.split(" ").slice(0, 6).join(" ");
    check(extract.length > 0 && (transcript.includes(opening) || /No words were heard/.test(extract)), "Answer feedback: the quoted extract is the opening of this answer's own transcript", `${opening} ≠ ${transcript.slice(0, 120)}`);
    await p.getByRole("tab", { name: "Feedback" }).click();
    check(!(await p.getByRole("tab", { name: "Job match" }).count()), "Answer feedback: the made-up “Job match” tab is gone");
    await noStock(p, "Answer feedback");
    await p.screenshot({ path: `${OUT}/honest-04-feedback.png`, fullPage: true });
    await axe(p, "Answer feedback");

    // A correction is saved for real, and the screen says the scores were not re-worked.
    await p.getByRole("button", { name: "Correct the transcript" }).first().click();
    const box = p.getByLabel("Your answer, corrected");
    await box.fill("I led twelve nurses on a twenty-eight bed ward and cut agency spend by eighteen per cent.");
    const edit = p.waitForResponse((r) => /\/api\/answers\/[^/]+\/edit$/.test(r.url()));
    await p.getByRole("button", { name: "Save correction" }).click();
    check((await edit).ok(), "Correcting the transcript is saved by the server");
    await p.getByText(/Saved\. The scores and feedback were worked out from the answer as it was first heard/).waitFor();
    await p.reload({ waitUntil: "networkidle" });
    check((await text(p, '[data-testid="answer-extract"]')).includes("cut agency spend by eighteen per cent"), "…and after a reload the corrected words are what is shown");

    // A failed save is not reported as saved.
    await p.route(/\/api\/answers\/[^/]+\/edit$/, (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "failed" }) }));
    await p.getByRole("button", { name: "Correct the transcript" }).first().click();
    await box.fill("This change will not be saved.");
    await p.getByRole("button", { name: "Save correction" }).click();
    const alert = p.getByRole("alert").filter({ hasText: /couldn’t be saved/ });
    check(await alert.waitFor({ timeout: 8000 }).then(() => true, () => false), "A correction the server refuses is shown as not saved");
    check((await box.inputValue()) === "This change will not be saved.", "…and the person's text is still in the box");
    await p.unroute(/\/api\/answers\/[^/]+\/edit$/);

    // ── Back home: the session is counted and listed ───────────────────────────────────────────
    await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    check(/^Practice sessions completed 1\b/.test((await text(p, '[data-testid="home-sessions"]')).replace(/\s+/g, " ")), "Home: “Practice sessions completed” is now 1");
    const recent = (await text(p, '[data-testid="home-recent"]')).replace(/\s+/g, " ");
    check(recent.includes("Ward Manager · Northgate Trust") && /\d\.\d \/ 5|Not scored/.test(recent), "Home: “Recent practice” lists that session with its interview and score", recent);
    await p.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
    const ws2 = await text(p, "main");
    check(!/No practice sessions yet/.test(ws2), "Workspace: the session is listed under recent practice");
    await noStock(p, "Workspace after practice");
    void reportUrl;

    check(errors.length === 0, "No page errors on the way", errors.join(" | "));
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
