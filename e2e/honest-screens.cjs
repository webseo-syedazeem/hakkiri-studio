// Nothing on screen is sample content shown as the person's own. As a brand-new account this walks the
// Practice Hub, the Experience Library, interview set-up (an unreadable file, an empty form, a build the
// server refuses, a real build), the prep sheet of the interview just built, and the Apply pages, and
// checks that none of the stock people, employers, figures or sentences an earlier build showed is there,
// and that what is there is the person's own or an honest "nothing yet".
// These screens have one (dark) theme, so there is no light pass here.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");
const { BASE, OUT, FIXTURES, JOB_SPEC, signIn } = require("./helpers.cjs");

const results = [];
const check = (ok, what, detail = "") => {
  results.push({ ok: !!ok, what });
  console.log(`${ok ? "ok  " : "FAIL"} ${what}${ok || !detail ? "" : `  → ${detail}`}`);
};
const text = (page) => page.locator("body").innerText();
/** None of `stock` is on the page. */
const none = async (page, where, stock) => {
  const body = await text(page);
  const found = stock.filter((s) => body.includes(s));
  check(found.length === 0, `${where} shows none of the stock content`, found.join(" | "));
};

const HUB_STOCK = ["45 mins", "3 sessions completed", "3.6 / 5.0", "+0.6 from last week", "Interview in 3 days", "Interview in 4 days", "Interview in 5 days", "Why Halden", "RECOMMENDED", "PRIORITY AREA", "Commercial Judgement & Risk"];
const LIBRARY_STOCK = ["Led a cross-functional project to launch a digital service", "Resolved a high-risk issue under time pressure", "Influenced stakeholders to agree a change in approach", "ministerial briefing", "Import from CV", "Senior Adviser"];
const SETUP_STOCK = ["Halden", "Senior Product Manager", "halden.com", "CV content for", "CV text for", "12 Nov", "Link attached", "saved locally", "Uploaded"];
const PREP_STOCK = ["Fernway", "41%", "58%", "17%", "payments software", "Product judgement", "commercial judgement", "career transitions", "Roadmap change", "balance conversion and fraud", "changed a roadmap", "engineers who disagree", "biggest payment challenges", "Halden", "Stage 2: Hiring manager"];
const APPLY_STOCK = ["Alex Morgan", "FinTech Scaleup", "+44 7700 900123", "University of Manchester", "Senior Software Engineer", "Senior Full Stack Engineer", "Cloud Infrastructure Labs", "Global FinTech", "Innovative Tech Group", "driven by customer impact", "Scam Recruitment", "14.2", "92% Fit", "85% Fit", "88", "Greenhouse", "100% Truth"];

(async () => {
  const browser = await chromium.launch();
  try {
    const { context, page: p, errors } = await signIn(browser, "honest");

    // ── Practice Hub ────────────────────────────────────────────────────────────────────────────
    await p.goto(`${BASE}/practice`, { waitUntil: "networkidle" });
    await none(p, "The Practice Hub", HUB_STOCK);
    const hub = await text(p);
    check(/\b0 sessions\b/.test(hub) && hub.includes("Not scored yet") && hub.includes("Not known yet"), "A new account's Practice Hub says there is no practice, score or focus area yet");
    check(/No date set|\(example\)|\bExample\b/.test(hub), "The interview shown is marked as an example, with its own date or none");
    await p.screenshot({ path: `${OUT}/honest-practice.png`, fullPage: true });

    // ── Experience Library ──────────────────────────────────────────────────────────────────────
    await p.goto(`${BASE}/interview-examples`, { waitUntil: "networkidle" });
    await p.getByText("Your library is empty").waitFor({ timeout: 10000 });
    await none(p, "The Experience Library", LIBRARY_STOCK);
    check((await text(p)).includes("All examples (0)"), "A new account's library holds no examples");
    check((await text(p)).includes("Kept in this browser only"), "The library says where it is kept");
    check((await p.evaluate(() => localStorage.getItem("hk_interview_examples") ?? "[]")) === "[]" || (await p.evaluate(() => JSON.parse(localStorage.getItem("hk_interview_examples") ?? "[]").length)) === 0, "Nothing was written into the browser's library for the person");
    await p.screenshot({ path: `${OUT}/honest-library.png`, fullPage: true });

    // ── Interview set-up: an empty form ─────────────────────────────────────────────────────────
    await p.goto(`${BASE}/interviews/new`, { waitUntil: "networkidle" });
    await none(p, "An empty set-up form", SETUP_STOCK);
    const company = p.getByPlaceholder("e.g. HMRC, Monzo, Google");
    const title = p.getByPlaceholder("e.g. Associate Product Manager");
    check((await company.inputValue()) === "" && (await title.inputValue()) === "", "The company and job title start empty");
    check((await p.getByTestId("draft-status").innerText()).includes("Nothing to save yet"), "Nothing is said to be saved before anything is entered");
    check((await p.getByTestId("side-cv").first().innerText()).includes("Not added yet") && (await p.getByTestId("side-job").first().innerText()).includes("Not added yet"), "The overview says the CV and job description aren't added yet");

    // A file with no readable CV in it is refused, with the reason. Nothing stands in for its text.
    // (With the job description set to paste, the CV's file input is the first on the page.)
    await p.getByRole("button", { name: "Paste Job Description" }).click();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hk-honest-"));
    const empty = path.join(tmp, "scanned.txt");
    fs.writeFileSync(empty, "page 1");
    await p.locator('input[type="file"]').first().setInputFiles(empty);
    await p.getByTestId("cv-error").waitFor({ timeout: 10000 }).catch(() => undefined);
    const cvError = (await p.getByTestId("cv-error").count()) ? await p.getByTestId("cv-error").innerText() : "";
    check(/scanned\.txt/.test(cvError) && /Paste/.test(cvError), "An unreadable CV is refused with the reason and a way forward", cvError);
    check((await p.getByTestId("side-cv").first().innerText()).includes("Not added yet"), "…and is not shown as added");

    // Building with nothing: the form says what is missing and nothing is sent.
    let posts = 0;
    p.on("request", (r) => r.url() === `${BASE}/api/interviews` && r.method() === "POST" && posts++);
    for (const name of [/^Continue to stages/, /^Continue to practice setup/, /^Continue to review/]) await p.getByRole("button", { name }).click();
    await p.getByText("Ready to build?").waitFor();
    check((await p.getByTestId("build-checks").innerText()).split("Missing").length - 1 === 2, "The last step shows what is missing, not three ticks", await p.getByTestId("build-checks").innerText());
    await p.getByRole("button", { name: /^Build interview/ }).click();
    await p.getByTestId("build-error").waitFor({ timeout: 10000 });
    const missing = await p.getByTestId("build-error").innerText();
    check(/company/i.test(missing) && /CV/.test(missing) && posts === 0 && /\/interviews\/new$/.test(p.url()), "Building an empty form names what is missing and sends nothing", `${missing} (requests: ${posts})`);
    await p.screenshot({ path: `${OUT}/honest-setup-missing.png`, fullPage: true });

    // ── Interview set-up: a real form, and a build the server refuses ───────────────────────────
    await company.fill("Acme Payroll");
    await title.fill("Data Analyst");
    await p.getByPlaceholder(/^Paste the full job description/).fill(JOB_SPEC);
    await p.locator('input[type="file"]').first().setInputFiles(path.join(FIXTURES, "sam-okafor-cv.pdf"));
    await p.getByText("sam-okafor-cv.pdf", { exact: true }).first().waitFor({ timeout: 20000 });
    check((await p.getByTestId("side-cv").first().innerText()).includes("Added"), "A readable CV is shown as added");
    await p.waitForFunction(() => /Draft saved in this browser/.test(document.querySelector('[data-testid="draft-status"]')?.textContent ?? ""), null, { timeout: 10000 }).catch(() => undefined);
    check((await p.getByTestId("draft-status").innerText()).includes("Draft saved in this browser"), "Once something is entered the draft is saved, and the screen says so");

    // A refresh brings the draft back.
    await p.reload({ waitUntil: "networkidle" });
    check((await company.inputValue()) === "Acme Payroll" && (await title.inputValue()) === "Data Analyst", "After a refresh the form is as it was left");
    check((await p.getByTestId("side-cv").first().innerText()).includes("Added"), "…with the CV still added");

    for (const name of [/^Continue to stages/, /^Continue to practice setup/]) await p.getByRole("button", { name }).click();
    await p.getByRole("heading", { name: "Practice setup", level: 1 }).waitFor();
    const mixShown = await p.getByTestId("mix-sent").innerText();
    check(/Technical 50% · Skills 30% · Experience 20%/.test(mixShown), "The question mix is shown as it will be sent", mixShown);
    check(/(^|\D)1 round selected/.test(await text(p)), "One stage shows as one round selected");
    await p.getByRole("button", { name: /^Continue to review/ }).click();
    await p.getByText("Ready to build?").waitFor();

    await p.route(`${BASE}/api/interviews`, (route) => (route.request().method() === "POST" ? route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "down", message: "Questions can’t be written right now. Try again in a minute." }) }) : route.continue()));
    await p.getByRole("button", { name: /^Build interview/ }).click();
    await p.getByTestId("build-error").waitFor({ timeout: 15000 });
    check((await p.getByTestId("build-error").innerText()).includes("Questions can’t be written right now"), "When the server can't build, its message is shown");
    check(/\/interviews\/new$/.test(p.url()), "…and the person stays on the form");
    check((await p.evaluate(() => localStorage.getItem("hk_custom_interviews") ?? "")).includes("Acme") === false, "…and no interview is made up in the browser");
    await p.unroute(`${BASE}/api/interviews`);
    const listPage = await context.newPage();
    await listPage.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    // The draft card may name the company; what must not be there is an interview for it.
    const made = await listPage.locator('a[href^="/interviews/"]:not([href="/interviews/new"])').evaluateAll((links) => links.filter((l) => (l.textContent || "").includes("Acme Payroll")).length);
    check(made === 0, "…and no interview appears in the list");
    await listPage.close();
    await p.screenshot({ path: `${OUT}/honest-setup-refused.png`, fullPage: true });

    // ── Interview set-up: the real build sends what was given, with the mix that was shown ──────
    const sent = p.waitForRequest((r) => r.url() === `${BASE}/api/interviews` && r.method() === "POST", { timeout: 20000 });
    const answered = p.waitForResponse((r) => r.url() === `${BASE}/api/interviews` && r.request().method() === "POST", { timeout: 120000 });
    await p.getByRole("button", { name: /^Build interview/ }).click();
    const body = (await sent).postDataJSON();
    const res = await answered;
    check(res.ok(), "The interview builds", `${res.status()}`);
    check(body.company.name === "Acme Payroll" && body.job.title === "Data Analyst" && /Sam Okafor|Okafor/i.test(body.cv.text) && !/CV text for|CV content for/.test(body.cv.text), "The request holds the person's own company, job and CV text");
    check(JSON.stringify(body.settings.mix) === JSON.stringify({ technical: 50, competency: 30, cv: 20, motivation: 0, curveball: 0 }), "The mix sent is the mix shown", JSON.stringify(body.settings.mix));
    check(!JSON.stringify(body).includes("Halden") && !/"date":"12 Nov|"time":"10:00"/.test(JSON.stringify(body)), "No stand-in company, date or time is sent");
    const { id } = await res.json();
    await p.waitForURL(/\/interviews$/, { timeout: 30000 });
    check(await p.locator(`a[href="/interviews/${id}"]`).first().waitFor({ timeout: 15000 }).then(() => true, () => false), "The new interview is in the list");
    check((await p.evaluate(() => localStorage.getItem("hk_interview_wizard_draft"))) === null, "The draft is cleared once the interview is built");

    // ── The prep sheet of the interview just built ──────────────────────────────────────────────
    await p.goto(`${BASE}/interviews/${id}/prep`, { waitUntil: "networkidle" });
    await none(p, "The prep sheet", PREP_STOCK);
    const prep = await text(p);
    check(prep.includes("Data Analyst") && prep.includes("Acme Payroll"), "The prep sheet is headed by the person's own role and company");
    check((await p.getByTestId("prep-based-on").innerText()).includes("haven’t practised"), "It says nothing has been practised yet");
    check((await p.getByTestId("prep-best-answers").innerText()).includes("No scored answers yet"), "There are no best answers before any practice");
    check((await p.getByTestId("prep-priorities").innerText()).length > 40, "The priorities part is the person's own, or says what fills it");
    check((await p.getByTestId("prep-questions").locator("a").count()) > 0, "The questions listed are the ones written for this interview");
    await p.screenshot({ path: `${OUT}/honest-prep.png`, fullPage: true });

    // The hub now opens on the person's own interview and keeps the choice in the address.
    await p.goto(`${BASE}/practice`, { waitUntil: "networkidle" });
    check((await p.getByTestId("hub-interview").innerText()).includes("Acme Payroll"), "With an interview of their own, the hub opens on it");
    await p.getByTestId("hub-interview").click();
    await p.getByRole("option").filter({ hasText: "example" }).first().click();
    await p.waitForURL(/\/practice\?interview=/, { timeout: 10000 });
    const chosen = await p.getByTestId("hub-interview").innerText();
    await p.reload({ waitUntil: "networkidle" });
    check((await p.getByTestId("hub-interview").innerText()) === chosen && /\(example\)/.test(chosen), "The interview chosen is still chosen after a refresh");
    await none(p, "The Practice Hub on an example interview", HUB_STOCK);

    // ── Apply ───────────────────────────────────────────────────────────────────────────────────
    for (const [where, url, expect] of [
      ["The Apply home", "/apply", null],
      ["The Apply profile", "/apply/profile", null],
      ["The Apply voice page", "/apply/voice", "Nothing has been measured yet"],
      ["The Apply settings", "/apply/settings", null],
      ["The Apply evidence bank", "/apply/evidence", null],
      ["The Apply applications", "/apply/applications", "You have no applications yet"],
    ]) {
      await p.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
      await p.waitForTimeout(600);
      await none(p, where, APPLY_STOCK);
      if (expect) check((await text(p)).includes(expect), `${where} says: ${expect}`);
    }
    await p.goto(`${BASE}/apply/profile`, { waitUntil: "networkidle" });
    const inputs = await p.locator("input, textarea").evaluateAll((els) => els.map((el) => el.value).filter(Boolean));
    check(inputs.every((v) => /honest|example\.com|^GBP$|^0$|^any$|^uk$/i.test(v)), "A new profile holds only the account's own name and email", inputs.join(" | "));
    await p.screenshot({ path: `${OUT}/honest-apply-profile.png`, fullPage: true });

    // A pasted advert that names no employer, place or requirement.
    await p.goto(`${BASE}/apply/jobs/new`, { waitUntil: "networkidle" });
    await none(p, "The add-a-job page", APPLY_STOCK);
    await p.locator("textarea").first().fill("We are a small team looking for someone friendly to help out in the shop at weekends. Apply by email to the manager.");
    await p.getByRole("button", { name: /Intake Job/ }).click();
    await p.waitForURL(/\/apply\/applications\/app_/, { timeout: 20000 });
    await p.getByText("Match Fit").waitFor({ timeout: 15000 });
    await none(p, "The application made from that advert", APPLY_STOCK);
    const workspace = await p.locator("main").innerText();
    check(/title not found in the advert/i.test(workspace) && /employer not found in the advert/i.test(workspace), "…and the title and employer the advert didn't give are shown as not found");
    check(/not known/i.test(workspace) && !/\b\d+%\s*(fit|match)/i.test(workspace), "With nothing in the advert to measure against, the fit is shown as not known", workspace.slice(0, 300).replace(/\n+/g, " | "));
    await p.goto(`${BASE}/apply/applications`, { waitUntil: "networkidle" });
    const tracker = await text(p);
    check(/fit not known/i.test(tracker) && /employer not found/i.test(tracker), "The tracker says what the advert didn't give, with no stand-in", tracker.slice(0, 300).replace(/\n+/g, " | "));
    await p.screenshot({ path: `${OUT}/honest-apply-tracker.png`, fullPage: true });

    // An application that isn't there shows "not found", not a sample.
    await p.goto(`${BASE}/apply/applications/app_does_not_exist`, { waitUntil: "networkidle" });
    await p.getByTestId("application-not-found").waitFor({ timeout: 10000 });
    await none(p, "A missing application", APPLY_STOCK);

    // Moving on while the browser is still fetching a page's lazy chunks aborts those requests, which the
    // browser reports as a chunk-load error. That is this script leaving the page, not a fault in it.
    const real = errors.filter((e) => !/ChunkLoadError/.test(e));
    check(real.length === 0, "No page errors along the way", real.join(" | "));
    await context.close();
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
