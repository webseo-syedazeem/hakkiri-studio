// The fixes from the independent review and the browser audit, walked as real users:
//   1. a brand-new visitor checks a CV for free, unlocks the report, presses "Open in CV Builder", signs up,
//      and lands on the score of a CV made from the text they checked, without pasting it again;
//   2. one score everywhere: the list, the builder and a reloaded builder show the same number;
//   3. a CV with almost nothing in it is not told it is good enough;
//   4. every field holds what is saved: counts near the limit, and a refused or signed-out save says so;
//   5. the cursor is in a new item after "+ Add", and on the heading after a change of screen;
//   6. ordinary punctuation and a very long link download as checked files;
//   7. invented sentences in a cover letter are refused, and a present-tense CV line is never left as a fragment.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { BASE, OUT, check, noForbidden, newUser, setUp, bothThemes, a11y, run } = require("./cv-helpers.cjs");
const { readPdf, readDocx, squash } = require("./cv-files.cjs");

const FILES = path.join(OUT, "cv-review-downloads");
fs.rmSync(FILES, { recursive: true, force: true });
fs.mkdirSync(FILES, { recursive: true });

const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const idOf = (page) => /\/cv\/v\/(cv_[a-f0-9]+)/.exec(page.url())[1];
const saved = (page) => page.locator('[data-testid="save-state"]', { hasText: /^Saved$/ }).waitFor({ timeout: 15000 });
const scoreOf = async (page) => Number(/(\d+)/.exec(await page.getByTestId("score").innerText())[1]);
const focused = (page) => page.evaluate(() => {
  const el = document.activeElement;
  return el ? { tag: el.tagName, text: (el.textContent || "").trim().slice(0, 60), label: el.getAttribute("aria-label") || (el.id && document.querySelector(`label[for="${el.id}"]`)?.textContent) || "" } : { tag: "", text: "", label: "" };
});
async function patch(page, id, change) {
  let status = 0;
  for (let i = 0; i < 4 && status !== 200; i++) {
    if (i) await page.waitForTimeout(900);
    const cv = await getCv(page, id);
    const body = change(cv);
    status = await page.evaluate(async ({ id, rev, body }) => (await fetch(`/api/cv/versions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev, ...body }) })).status, { id, rev: cv.rev, body });
    if (status !== 409) break;
  }
  return status;
}
async function tab(page, name) {
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
  await page.locator('nav[aria-label="Sections"] a[aria-current="page"]', { hasText: new RegExp(`^${name}`) }).waitFor({ timeout: 15000 });
}
async function download(page, button, name) {
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 45000 }), page.getByRole("button", { name: button, exact: true }).click()]);
  const file = path.join(FILES, name);
  await dl.saveAs(file);
  return { file, name: dl.suggestedFilename() };
}
const rowScore = async (page, name) => {
  await page.goto(`${BASE}/cv`);
  const row = page.locator(".cv-pick", { hasText: name }).first();
  await row.getByTestId("row-score").waitFor({ timeout: 20000 });
  return Number(/(\d+)/.exec(await row.getByTestId("row-score").innerText())[1]);
};

// Everything in this text has a place in a CV: nothing is left over for the person to sort out.
const CHECKED = `Ada Example
Leeds · ada.example@example.com · 07700 900123

Experience
Gallery Assistant, Northgate Museum
Sep 2019 – Present
- Catalogued 1,200 objects in the collections database in one year
- Trained four volunteers to handle ceramics safely each term
- Wrote the 12-page handling guide used at every induction
- Cut retrieval time from 3 days to 1 by re-shelving the store
- Scanned 600 glass negatives for the online collection in one summer
- Ran the monthly conservation audit across both stores for two years

Education
BA History, University of Leeds, 2016 – 2019

Skills
Cataloguing, handling, volunteers, induction, conservation
`;

run("CV review fixes", async (browser) => {
  /* =============================== 1. a new visitor: free check → builder */
  const from = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${1 + Math.floor(Math.random() * 250)}`;
  const visitor = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, extraHTTPHeaders: { "x-forwarded-for": from } });
  await visitor.addInitScript(() => sessionStorage.setItem("dismiss_phone_notice", "1"));
  const v = await visitor.newPage();
  await v.goto(`${BASE}/cv-audit`);
  const heading = await v.locator("h1").first().innerText();
  check(heading === "Free CV and resume check" && !/\bAI\b/.test(heading), "the free check's heading does not say “AI”: none is used", heading);

  // One line of text is not called readable, ready or anything else it is not.
  await v.locator("#cv-text").fill("Sam Example worked in a shop for a while doing various things for people");
  await v.getByRole("button", { name: /Check my CV/ }).click();
  await v.getByTestId("check-summary").waitFor({ timeout: 20000 });
  const thin = await v.locator("body").innerText();
  check(/There is not much here to score yet: no lines saying what you did, where a CV needs at least 6\./.test(await v.getByTestId("check-summary").innerText()), "a one-line paste is told there is not much to score, in words made from its own result", await v.getByTestId("check-summary").innerText());
  check(/Evidence \(45 points\)/.test(thin) && /Clarity \(20 points\)/.test(thin) && /Structure \(20 points\)/.test(thin) && /Readable by software \(15 points\)/.test(thin) && !/\(35%\)|\(25%\)|\(10%\)/.test(thin), "the four parts show their real weights: 45, 20, 20 and 15");
  check(/Readable by software \(15 points\)\s*0%/.test(thin) && !/High-severity duty phrasing|callback rates|Ready to Apply/.test(thin), "“readable by software” is not 100% of nothing, and no stock line is shown");
  check(!/the 0 challenger questions/.test(thin), "nothing is offered “0 questions”");
  check((await v.locator(".italic", { hasText: /^""$/ }).count()) === 0, "no empty quote boxes");
  await v.getByRole("button", { name: "Scan Another" }).click();

  await v.locator("#cv-text").fill(CHECKED);
  await v.getByRole("button", { name: /Check my CV/ }).click();
  await v.getByTestId("check-summary").waitFor({ timeout: 20000 });
  const publicScore = Number((await v.locator("span.text-4xl").first().innerText()).trim());
  check(Number.isFinite(publicScore) && publicScore > 30, "the pasted CV gets a score", String(publicScore));

  // Unlocking needs something shaped like an email address, and the id must be one of ours.
  const auditId = await v.evaluate(async (text) => (await (await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, region: "uk" }) })).json()).auditId, CHECKED);
  const tries = await v.evaluate(async (id) => {
    const post = async (path, body) => (await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).status;
    return { at: await post(`/api/audit/${id}/unlock`, { email: "@" }), proto: (await fetch("/api/audit/__proto__")).status, ctor: (await fetch("/api/audit/constructor")).status, big: await post("/api/audit", { text: "a".repeat(400000) }) };
  }, auditId);
  check(tries.at === 400, "“@” is not accepted as an email address to unlock a report", JSON.stringify(tries));
  check(tries.proto === 404 && tries.ctor === 404, "an id that is not one of ours (“__proto__”, “constructor”) is simply not found", JSON.stringify(tries));
  check(tries.big === 413, "a body far larger than a CV is refused", JSON.stringify(tries));

  await v.locator('input[type="email"]').fill(`ada-${Date.now()}@example.com`);
  await v.locator('input[type="checkbox"]').first().check();
  await v.getByRole("button", { name: /Unlock Full Report/ }).click();
  await v.waitForURL(/\/audit\/aud_[a-f0-9]+$/, { timeout: 20000 });
  const reportId = v.url().split("/").pop();
  await v.getByTestId("open-in-builder").waitFor({ timeout: 20000 });
  const report = await v.evaluate(async (id) => (await fetch(`/api/audit/${id}`)).json(), reportId);
  check(report.isUnlocked === true && !("text" in report) && !("textHash" in report) && !("unlockedBy" in report) && !JSON.stringify(report).includes("07700 900123"), "the unlocked report does not carry the pasted text, its hash or who unlocked it");
  check(/Evidence \(45 points\)/.test(await v.locator("body").innerText()), "the report shows the real weights too");
  await v.screenshot({ path: path.join(OUT, "cv-review-report.png"), fullPage: true });
  // The report sits on the white public page: everything on it must be readable there.
  await a11y(v, "free check report");

  // "Open in CV Builder": not signed in, so sign-in comes first; then straight on, with the text.
  await v.getByTestId("open-in-builder").click();
  await v.waitForURL(/\/login/, { timeout: 20000 });
  check(true, "a visitor with no account is asked to sign in");
  await v.goto(`${BASE}/signup`);
  await v.locator("#auth-name").fill("Ada Example");
  await v.locator("#auth-email").fill(`ada-new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`);
  await v.locator("#auth-password").fill("Password123!");
  await v.locator('button[type="submit"]').click();
  await v.waitForURL(/\/cv\/import\/imp_[a-f0-9]+/, { timeout: 45000 });
  check(true, "after signing up they are taken on to the CV made from the text they checked");
  await v.getByRole("link", { name: "Start checking" }).waitFor({ timeout: 30000 });
  const body = await v.locator("main").innerText();
  check(/Pasted text/.test(body), "it came through the same reader as pasted text", body.slice(0, 200));
  await noForbidden(v, "from a free check");

  // The check of what was read, step by step, as for any upload.
  await v.getByRole("link", { name: "Start checking" }).click();
  await v.waitForURL(/review\/contact/);
  check((await v.getByLabel("Name", { exact: true }).inputValue()) === "Ada Example" && (await v.getByLabel("Email").inputValue()) === "ada.example@example.com", "their name and email were read from the text they checked: nothing is typed again");
  for (let step = 0; step < 12; step++) {
    // Each step ends in one button: "Confirm and continue", or on the last step "Open in builder".
    const onward = v.getByRole("button", { name: /^(?:Open in builder|Confirm and continue)$/ }).first();
    await onward.waitFor({ timeout: 20000 });
    for (const b of await v.getByRole("button", { name: "This is right" }).all()) await b.click().catch(() => {});
    const last = (await onward.innerText()).trim() === "Open in builder";
    const before = v.url();
    await onward.click();
    if (last) break;
    await v.waitForURL((u) => u.toString() !== before, { timeout: 15000 });
  }
  await v.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/findings/, { timeout: 30000 });
  await v.getByTestId("score").waitFor({ timeout: 30000 });
  const vid = idOf(v);
  const made = await getCv(v, vid);
  check(made.name === "CV from my free check" && made.contact.fullName === "Ada Example", "they land on the score of that CV, where its findings are", `${made.name} / ${made.contact.fullName}`);
  const lines = made.sections.flatMap((s) => (s.entries || []).flatMap((e) => e.bullets.map((b) => b.text)));
  check(lines.includes("Catalogued 1,200 objects in the collections database in one year") && lines.length === 6, "every line they pasted into the check is in the CV", lines.join(" | "));
  check((await v.locator(".cv-finding").count()) > 0, "with the findings listed, each linked to its line");
  await bothThemes(v, "review-from-check");
  // Pressing the button again (Back, a reload) does not make a second CV.
  await v.goto(`${BASE}/cv/from-check/${reportId}`);
  await v.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/findings/, { timeout: 30000 });
  const count = await v.evaluate(async () => (await (await fetch("/api/cv/versions")).json()).cvs.length);
  check(count === 1 && idOf(v) === vid, "asked again, it opens the same CV and makes no second one", String(count));

  /* ================================================ 2. one score everywhere */
  const inBuilder = await scoreOf(v);
  check((await rowScore(v, "CV from my free check")) === inBuilder, "the list shows the same score as the builder", `${inBuilder}`);
  await v.goto(`${BASE}/cv/v/${vid}/edit/finish`);
  await v.getByRole("button", { name: "Check both files" }).click();
  await v.locator('[data-testid="file-pdf"], [data-testid="file-status"]').first().waitFor({ timeout: 5000 }).catch(() => {});
  await v.getByText(/Both files checked|the check found a problem/).first().waitFor({ timeout: 60000 }).catch(() => {});
  await v.waitForTimeout(800);
  await v.goto(`${BASE}/cv/v/${vid}/findings`);
  await v.getByTestId("score").waitFor({ timeout: 30000 });
  await v.waitForTimeout(700);
  const checkedScore = await scoreOf(v);
  check(checkedScore > inBuilder && (await v.getByTestId("score-pending").count()) === 0, "once both files are checked the score counts them, and nothing is pending", `${inBuilder} → ${checkedScore}`);
  await v.reload();
  await v.getByTestId("score").waitFor({ timeout: 30000 });
  await v.waitForTimeout(700);
  check((await scoreOf(v)) === checkedScore && (await v.getByTestId("score-pending").count()) === 0, "a reload does not forget the file checks or change the score", `${await scoreOf(v)}`);
  check((await rowScore(v, "CV from my free check")) === checkedScore, "and the list shows that same number", String(checkedScore));
  await visitor.close();

  /* ============================ 3. a CV with almost nothing is not “good enough” */
  const b = await newUser(browser, "thin");
  const page = b.page;
  await setUp(page, { name: "Thin CV" });
  const id = idOf(page);
  check((await patch(page, id, (cv) => ({ contact: { fullName: "Ada Example", email: "ada@example.com", phone: "07700 900123", location: "Leeds", links: [] }, sections: cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries: [{ id: "e_thin00001", visible: true, title: "Gallery Assistant", org: "Northgate Museum", orgInfo: "", location: "", start: "2019-09", end: "", current: true, subject: "", grade: "", link: "", bullets: [{ id: "b_thin00001", text: "Cut cataloguing backlog by 40% in six months by rebuilding the intake process across the Leeds site", visible: true, origin: "typed", sources: [] }] }] } : s)) }))) === 200, "a CV of about sixty words: a name, an email, a phone, a town and one role with one line");
  await page.goto(`${BASE}/cv/v/${id}/edit/finish`);
  await page.getByRole("button", { name: "Check both files" }).click();
  await page.getByText(/Both files checked/).first().waitFor({ timeout: 60000 });
  await page.goto(`${BASE}/cv/v/${id}/findings`);
  await page.getByTestId("score").waitFor({ timeout: 30000 });
  await page.waitForTimeout(700);
  const thinScore = await scoreOf(page);
  check(thinScore < 45 && (await page.getByTestId("good-enough").count()) === 0, "with both files checked it scores low and is not told it is good enough to apply (it was 87, “good enough”)", String(thinScore));
  check(/Your CV has 1 line saying what you did, and a CV needs at least 6/.test(await page.getByTestId("thin-note").innerText()), "it is told why: one line where a CV needs six", await page.getByTestId("thin-note").innerText());
  await page.getByRole("button", { name: "How this is scored" }).click();
  const how = await page.getByRole("dialog").innerText();
  check(/85 is good enough to apply, as long as your CV also has: your name and an email address that works; at least one role/.test(how) && /a qualification, certificate or course/.test(how), "the scoring dialog says exactly what “good enough” needs");
  check(/Your CV has 1 of the 6 different lines it needs/.test(await page.getByTestId("thin-rule").innerText()), "and that easy passes earn a share until there are six lines");
  await bothThemes(page, "review-thin-score");
  await page.keyboard.press("Escape");
  check((await rowScore(page, "Thin CV")) === thinScore, "the list shows the same low number", String(thinScore));

  /* ====================== 4. fields hold what is saved, and a save says the truth */
  await page.goto(`${BASE}/cv/v/${id}/edit/contact`);
  const name = page.getByLabel("Name", { exact: true });
  await name.waitFor({ timeout: 20000 });
  check((await name.getAttribute("maxlength")) === "120" && (await page.getByLabel("Email").getAttribute("maxlength")) === "160" && (await page.getByLabel("Phone").getAttribute("maxlength")) === "40", "name, email and phone each stop at what is saved: 120, 160 and 40 characters");
  await name.fill("N".repeat(300));
  check((await name.inputValue()).length === 120, "300 characters typed into the name: the box keeps 120, not more than is saved");
  check(/That is the most this field holds: 120 characters\./.test(await page.locator('[data-testid="field-count"]').first().innerText()), "and it says so, as the limit is reached", await page.locator('[data-testid="field-count"]').first().innerText().catch(() => ""));
  await name.fill("Ada Example");
  await saved(page);
  await tab(page, "Experience");
  const bullet = page.getByRole("textbox", { name: "Bullet 1", exact: true });
  await bullet.waitFor({ timeout: 15000 });
  check((await bullet.getAttribute("maxlength")) === "600", "a bullet stops at 600 characters, the same as is saved");

  // A save the server refuses is not reported as "offline", and "Retry" on its banner saves again.
  await page.route(`**/api/cv/versions/${id}`, (route) => (route.request().method() === "PATCH" ? route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: "invalid_input", message: "The job title is too long: it holds 400 characters." }) }) : route.continue()));
  await bullet.fill("Cut cataloguing backlog by 40% in six months by rebuilding the intake process across the Leeds site and the York site");
  const trouble = page.getByTestId("save-trouble");
  await trouble.waitFor({ timeout: 20000 });
  const refusal = await trouble.innerText();
  check(/The job title is too long: it holds 400 characters\./.test(refusal) && !/offline|connection/i.test(refusal), "a refused save says why, in the server's words, and does not blame the connection", refusal);
  check(!/^Saved$/.test((await page.getByTestId("save-state").innerText()).trim()), "and the page does not say “Saved”", await page.getByTestId("save-state").innerText());
  await page.unroute(`**/api/cv/versions/${id}`);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await saved(page);
  check((await getCv(page, id)).sections.find((s) => s.kind === "experience").entries[0].bullets[0].text.endsWith("and the York site"), "“Retry” on the save banner saves: the text is on the server (the button did nothing before)");

  // Signed out in another tab: the save says so.
  await page.route(`**/api/cv/versions/${id}`, (route) => (route.request().method() === "PATCH" ? route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "unauthorised" }) }) : route.continue()));
  await bullet.fill("Cut cataloguing backlog by 40% in six months by rebuilding the intake process across the Leeds site");
  await page.getByText(/You’ve been signed out\. Sign in again to save\./).first().waitFor({ timeout: 20000 });
  check(true, "a save made after being signed out says “You’ve been signed out. Sign in again to save.”");
  await page.unroute(`**/api/cv/versions/${id}`);
  await page.reload();
  await page.getByRole("textbox", { name: "Bullet 1", exact: true }).waitFor({ timeout: 20000 });
  await saved(page).catch(() => {});

  /* ================================= 5. the cursor: new items, and new screens */
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  await page.getByRole("textbox", { name: "Bullet 1", exact: true }).waitFor({ timeout: 20000 });
  const before = (await getCv(page, id)).sections.find((s) => s.kind === "experience").entries[0].bullets.length;
  await page.getByRole("button", { name: "+ Add bullet" }).click();
  await page.keyboard.type("Trained four volunteers to handle ceramics safely each term", { delay: 3 });
  await saved(page);
  const after = (await getCv(page, id)).sections.find((s) => s.kind === "experience").entries[0].bullets;
  check(after.length === before + 1 && after[after.length - 1].text === "Trained four volunteers to handle ceramics safely each term", "after “+ Add bullet”, typing straight away goes into the new bullet: one bullet, with the words in it (it was nine empty bullets and no words)", `${after.length - before} added: ${JSON.stringify(after.map((x) => x.text))}`);
  await tab(page, "Education");
  await page.getByRole("button", { name: /^\+ Add (?!section)/ }).first().click();
  await page.keyboard.type("BA History", { delay: 3 });
  await saved(page);
  const edu = (await getCv(page, id)).sections.find((s) => s.kind === "education").entries;
  check(edu.length === 1 && Object.values(edu[0]).includes("BA History"), "the same for “+ Add qualification”: one entry, holding what was typed", JSON.stringify(edu.map((e) => [e.title, e.subject, e.org])));
  await page.getByRole("button", { name: /^Continue to / }).first().click();
  await page.waitForTimeout(900);
  const at = await focused(page);
  check(at.tag === "H1", "after “Continue to …” the cursor is on the new screen's heading, not thrown back to the top of the page", JSON.stringify(at));
  await a11y(page, "after continue");

  /* ================= 6. punctuation and a very long link download as checked files */
  const link = `https://portfolio.example.com/${"work-samples-and-case-studies/".repeat(8)}`.slice(0, 147);
  check((await patch(page, id, (cv) => ({ contact: { ...cv.contact, links: [link] }, sections: cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries: [{ ...s.entries[0], bullets: [{ ...s.entries[0].bullets[0], text: "Rebuilt the induction for front-of-house volunteers at the Leeds and Bradford sites - from a two-day course to a half-day session" }, { ...s.entries[0].bullets[1], text: "Ran pre- and post-launch checks for “Maps & Makers”, the museum’s 2023 show (12 rooms; 40,000 visitors)" }] }] } : s)) }))) === 200, "a 147-character link, a spaced hyphen, “pre- and post-launch”, curly quotes, an ampersand and brackets are put on the CV");
  await page.goto(`${BASE}/cv/v/${id}/edit/finish`);
  await page.getByRole("button", { name: "Download PDF", exact: true }).waitFor({ timeout: 20000 });
  const pdf = await download(page, "Download PDF", "punctuation.pdf");
  // Compared with every space taken out, so that where a line happened to wrap makes no difference.
  const pdfText = squash((await readPdf(pdf.file)).text);
  check(pdfText.includes(squash("pre- and post-launch checks for “Maps & Makers”, the museum’s 2023 show (12 rooms; 40,000 visitors)")) && pdfText.includes(squash("Leeds and Bradford sites - from a two-day course")), "the PDF downloads (it was refused as “not matching” before) and holds the punctuation as typed", pdfText.slice(0, 200));
  check(pdfText.includes(squash(link)), "all 147 characters of the link are in the PDF: none ran off the page");
  const docx = await download(page, "Download Word", "punctuation.docx");
  const docxText = squash((await readDocx(docx.file)).text);
  check(docxText.includes(squash("pre- and post-launch checks for “Maps & Makers”, the museum’s 2023 show (12 rooms; 40,000 visitors)")) && docxText.includes(squash(link)), "and the Word file the same");
  await b.context.close();

  /* ============================== 7. the cover letter: invented claims refused */
  const c = await newUser(browser, "letter");
  const lp = c.page;
  await setUp(lp, { name: "Maya base CV", file: "maya-chen.writer.pdf" });
  const importId = lp.url().split("/").pop();
  const baseId = (await lp.evaluate(async (imp) => (await fetch(`/api/cv/imports/${imp}/confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json(), importId)).versionId;
  const ADVERT = "Paid Media Lead\nExample Travel, Leeds\n\nAbout us\nWe are a travel company. We offer 28 days holiday and a pension.\n\nThe role\nYou will run Google Ads and Meta campaigns for our travel brands.\n\nEssential\n- Experience managing junior executives\n- Experience with budget pacing\n- Experience with Tableau\n\nDesirable\n- Knowledge of SQL\n- Fluent French";
  const lid = (await lp.evaluate(async ({ baseId, advert }) => (await fetch(`/api/cv/versions/${baseId}/tailor`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Paid media lead", employer: "Example Travel", advert }) })).json(), { baseId, advert: ADVERT })).id;
  await lp.goto(`${BASE}/cv/v/${lid}/letter`);
  await lp.getByTestId("letter-inputs").waitFor({ timeout: 20000 });
  check(/at least five words/.test(await lp.locator("body").innerText()), "the reason's minimum of five words is stated beside the box");
  await lp.getByLabel("Why do you want this role?").fill("I've planned travel campaigns for years, and I want to lead a team that paces its budgets properly.");
  const list = lp.getByTestId("evidence-list");
  await list.getByRole("button", { name: /^Show all \d+ lines$/ }).click();
  await list.locator("label.cv-choice", { hasText: "Manage two junior executives and review their weekly reports" }).locator("input").check();
  await list.locator("label.cv-choice", { hasText: "Introduced weekly budget pacing that stopped overspend in peak season" }).locator("input").check();
  await saved(lp);
  await lp.getByRole("button", { name: "Draft letter" }).click();
  await lp.getByTestId("letter-editor").waitFor({ timeout: 30000 });
  await saved(lp);
  const drafted = (await getCv(lp, lid)).letter.paragraphs.map((p) => p.sentences.map((s) => s.text));
  check(drafted[1].join(" ").endsWith("At Northlight Agency, I manage two junior executives and review their weekly reports."), "a present-tense line of a current role is put in the first person: “I manage …”, never a bare fragment", JSON.stringify(drafted[1]));
  check(/standard wording we add/.test(await lp.getByTestId("draft-notes").innerText()), "the screen says which sentences are standard wording and not the person's own", await lp.getByTestId("draft-notes").innerText());
  check(/^All \d+ sentences are sourced/.test((await lp.getByTestId("letter-review").innerText()).trim()) && !(await lp.getByRole("button", { name: "Download PDF", exact: true }).isDisabled()), "the letter assembled by rule passes its own check and can be downloaded (an advert that says “We are …” does not trip it)", await lp.getByTestId("letter-review").innerText());
  const afterDraft = await focused(lp);
  check(afterDraft.tag === "TEXTAREA" || afterDraft.tag === "H1", "after “Draft letter” the cursor is in the draft, not thrown to the top of the page", JSON.stringify(afterDraft));

  // The eight invented sentences an independent review got past the check. Each must now be refused.
  const INVENTED = [
    "Your advert asks for fluent French, which I have.",
    "You are looking for someone with knowledge of SQL, and I am one.",
    "I have managed twelve junior executives.",
    "I have five years’ experience with Tableau.",
    "I ran search campaigns for 12 European clients.",
    "At Northlight Agency, I doubled every client’s revenue.",
    "I am fluent in French and SQL.",
    "I have never missed a budget in ten years.",
  ];
  const verdicts = await lp.evaluate(async ({ id, sentences }) => {
    const cv = (await (await fetch(`/api/cv/versions/${id}`)).json()).cv;
    const out = [];
    for (const text of sentences) {
      const paragraphs = cv.letter.paragraphs.map((p, i) => (i === 1 ? { ...p, sentences: [...p.sentences, { id: `ls_${Math.random().toString(16).slice(2, 18).padEnd(16, "0")}`, text, origin: "typed", sources: [] }] } : p));
      const now = (await (await fetch(`/api/cv/versions/${id}`)).json()).cv;
      const saved = await fetch(`/api/cv/versions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: now.rev, letter: { ...now.letter, paragraphs } }) });
      const r = await fetch(`/api/cv/versions/${id}/letter/export?format=pdf`);
      const body = r.status === 200 ? {} : await r.json();
      out.push({ text, saved: saved.status, status: r.status, error: body.error, named: (body.sentences || []).some((s) => s.text === text) });
    }
    // Put the letter back as it was drafted.
    const last = (await (await fetch(`/api/cv/versions/${id}`)).json()).cv;
    await fetch(`/api/cv/versions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: last.rev, letter: cv.letter }) });
    return out;
  }, { id: lid, sentences: INVENTED });
  for (const r of verdicts) check(r.saved === 200 && r.status === 409 && r.error === "unsourced" && r.named, `refused, and named: “${r.text}”`, JSON.stringify(r));

  // And on the page: one of them typed into a paragraph is marked, with the reason, and the download is held.
  await lp.reload();
  await lp.getByTestId("letter-editor").waitFor({ timeout: 30000 });
  const box = lp.locator('.cv-lpara[data-role="evidence"]').nth(0).locator("textarea");
  await box.click();
  await box.press("Control+End");
  await box.pressSequentially(" Your advert asks for fluent French, which I have.", { delay: 2 });
  const flagged = lp.locator('.cv-lpara[data-role="evidence"]').nth(0).locator('li.cv-lsent[data-state="unsupported"]');
  await flagged.first().waitFor({ timeout: 10000 });
  check(/Needs a source/i.test(await flagged.first().innerText()), "typed on the page, “…, which I have” is marked “Needs a source”");
  await flagged.first().locator("button").first().click();
  const why = await lp.getByTestId("sentence-sources").innerText();
  check(/claims what the advert asks for as your own|is in the advert, not in your CV/.test(why), "and it says why: it claims what the advert asks for as the person's own", why);
  check(await lp.getByRole("button", { name: "Download PDF", exact: true }).isDisabled(), "the letter cannot be downloaded while that sentence stands");
  await bothThemes(lp, "review-letter-refused");

  // More than a paragraph holds: said at once, and the words are kept in the box.
  const long = lp.locator('.cv-lpara[data-role="close"]').locator("textarea");
  await long.click();
  await long.press("Control+End");
  await long.pressSequentially(` ${Array.from({ length: 13 }, (_, i) => `Thank you again ${i + 1}.`).join(" ")}`, { delay: 0 });
  await lp.getByTestId("para-limit").first().waitFor({ timeout: 10000 });
  check(/12 sentences/.test(await lp.getByTestId("para-limit").first().innerText()), "past twelve sentences in a paragraph it says so at once (they used to vanish on reload with no message)", await lp.getByTestId("para-limit").first().innerText());
  check((await long.inputValue()).includes("Thank you again 13."), "and the words stay in the box, to be moved to another paragraph");
  await c.context.close();

  /* ============== 8. a graduate with no jobs is not left at a dead end when tailoring */
  const g = await newUser(browser, "graduate");
  const gp = g.page;
  await setUp(gp, { name: "Graduate CV", level: "Student or graduate" }).catch(async () => setUp(gp, { name: "Graduate CV" }));
  const gid = idOf(gp);
  check((await patch(gp, gid, (cv) => ({
    contact: { fullName: "Tom Example", email: "tom@example.com", phone: "", location: "Leeds", links: [] },
    sections: cv.sections.map((s) => (s.kind === "education" ? { ...s, entries: [{ id: "e_grad00001", visible: true, title: "BSc (Hons)", org: "University of Leeds", orgInfo: "", location: "", start: "2021", end: "2024", current: false, subject: "Marine Biology", grade: "2:1", link: "", bullets: [] }] } : s.kind === "experience" ? { ...s, entries: [] } : s)),
  }))) === 200, "a graduate's CV: a degree, and no jobs at all");
  const GRAD_ADVERT = "Field Assistant\nCoastal Survey Trust, Whitby\n\nEssential\n- A degree in marine biology, ecology or a related subject\n- Experience of intertidal survey work\n- Full UK driving licence";
  const tid = (await gp.evaluate(async ({ id, advert }) => (await fetch(`/api/cv/versions/${id}/tailor`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Field assistant", employer: "Coastal Survey Trust", advert }) })).json(), { id: gid, advert: GRAD_ADVERT })).id;
  await gp.goto(`${BASE}/cv/v/${tid}/tailor`);
  const degree = gp.locator("li, .cv-req, [data-req]", { hasText: "A degree in marine biology, ecology or a related subject" }).first();
  await degree.waitFor({ timeout: 30000 });
  const fit = await gp.evaluate(async (id) => (await (await fetch("/api/cv/versions")).json()).cvs.find((c) => c.id === id).fit, tid);
  check(typeof fit === "number" && fit > 0, "their degree counts as evidence for “a degree in marine biology, ecology or a related subject”: job fit is above zero", String(fit));
  const survey = gp.locator("li, .cv-req, [data-req]", { hasText: "Experience of intertidal survey work" }).first();
  await survey.getByRole("button", { name: "Yes, add my experience" }).click();
  const ask = gp.getByRole("dialog", { name: "Do you have this?" });
  await ask.waitFor({ timeout: 10000 });
  const places = await ask.locator("#cv-req-role option").allInnerTexts();
  check(places.length === 1 && /BSc \(Hons\) · University of Leeds/.test(places[0]), "with no jobs, the new line can go under their qualification: it is offered, not a dead end", JSON.stringify(places));
  await ask.getByLabel("What you did, in one line").fill("Surveyed the intertidal zone at Robin Hood’s Bay for my dissertation, over 12 visits");
  await ask.getByRole("button", { name: /^Add to my / }).click();
  await ask.waitFor({ state: "hidden", timeout: 10000 });
  await saved(gp).catch(() => {});
  const added = (await getCv(gp, tid)).sections.find((s) => s.kind === "education").entries[0].bullets.map((x) => x.text);
  check(added.length === 1 && added[0] === "Surveyed the intertidal zone at Robin Hood’s Bay for my dissertation, over 12 visits", "and it is added there, in their own words", JSON.stringify(added));
  await bothThemes(gp, "review-graduate-tailor");
  await g.context.close();
  void chromium;
});
