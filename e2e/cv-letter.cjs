// The cover letter, walked as new users: nothing there until the person gives their reason and chooses lines of
// their CV; a draft assembled only from their words; every sentence showing what it rests on; a hand-typed claim
// with no source marked and holding back the download until it is removed, rewritten from the CV or backed by a
// note; "Review source" when a CV line changes; the page-overflow fix; and real PDF and Word files, on their own
// and with the CV, opened and read back here.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const JSZip = require("jszip");
const { BASE, OUT, PHONE, check, noForbidden, newUser, setUp, bothThemes, a11y, fitsWidth, run } = require("./cv-helpers.cjs");
const { readPdf, readDocx, squash } = require("./cv-files.cjs");

const FILES = path.join(OUT, "cv-letters");
fs.mkdirSync(FILES, { recursive: true });

const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const saved = (page) => page.getByTestId("save-state").filter({ hasText: /^Saved$/ }).waitFor({ timeout: 15000 });
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const paragraphs = (cv) => cv.letter.paragraphs.map((p) => p.sentences.map((s) => s.text));
const para = (page, role, n = 0) => page.locator(`.cv-lpara[data-role="${role}"]`).nth(n);

/** Changes the saved CV through the API, as another tab would. If the screen's own save lands in between, it is made again. */
async function patch(page, id, change) {
  let status = 0;
  for (let i = 0; i < 4 && status !== 200; i++) {
    if (i) await page.waitForTimeout(900);
    const cv = await getCv(page, id);
    const body = change(cv);
    status = await page.evaluate(async ({ id, rev, body }) => (await fetch(`/api/cv/versions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev, ...body }) })).status, { id, rev: cv.rev, body });
  }
  return status;
}

async function download(page, button, name) {
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 45000 }), page.getByRole("button", { name: button, exact: true }).click()]);
  const file = path.join(FILES, name);
  await dl.saveAs(file);
  return { file, name: dl.suggestedFilename() };
}

/** The letter as plain text, from the paper's Text view. */
async function paperText(page) {
  const toggle = page.getByRole("button", { name: "Text view" });
  if ((await toggle.getAttribute("aria-pressed")) !== "true") await toggle.click();
  const text = await page.locator(".cv-textview").innerText();
  await toggle.click();
  return text;
}

/** Adds a sentence to the end of a paragraph, as a person typing would. */
async function addTo(box, sentence) {
  await box.click();
  await box.press("End");
  await box.press("Control+End");
  await box.pressSequentially(` ${sentence}`, { delay: 2 });
}

const ADVERT = `Paid Media Lead
Example Travel, Leeds

About us
We are a travel company. We offer 28 days holiday and a pension.

The role
You will run Google Ads and Meta campaigns for our travel brands.

Essential
- Experience managing junior executives
- Experience with budget pacing
- Experience with Tableau

Desirable
- Knowledge of SQL
- Fluent French

How to apply
Send your CV by 1 December. We are an equal opportunities employer.`;

const REASON = "I've planned travel campaigns for years, and I want to lead a team that paces its budgets properly.";
const MANAGE = "Manage two junior executives and review their weekly reports";
const PACING = "Introduced weekly budget pacing that stopped overspend in peak season";

run("CV cover letter", async (browser) => {
  const a = await newUser(browser, "maya");
  const page = a.page;
  await setUp(page, { name: "Maya base CV", file: "maya-chen.writer.pdf" });
  const importId = page.url().split("/").pop();
  const baseId = (await page.evaluate(async (imp) => (await fetch(`/api/cv/imports/${imp}/confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json(), importId)).versionId;
  const id = (await page.evaluate(async ({ baseId, advert }) => (await fetch(`/api/cv/versions/${baseId}/tailor`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Paid media lead", employer: "Example Travel", advert }) })).json(), { baseId, advert: ADVERT })).id;

  /* ------------------------------------------------ nothing until it is given */
  await page.goto(`${BASE}/cv/v/${id}/edit/contact`);
  await page.getByTestId("letter-button").click();
  await page.waitForURL(new RegExp(`/cv/v/${id}/letter`));
  await page.getByTestId("letter-inputs").waitFor({ timeout: 20000 });
  check((await getCv(page, id)).letter === undefined, "a version has no letter until one is started");
  check((await page.getByLabel("Why do you want this role?").inputValue()) === "" && (await page.getByTestId("evidence-list").locator("input:checked").count()) === 0, "the reason is empty and no line is chosen: nothing is filled in for the person");
  check(/Paid media lead · Example Travel/.test(await page.getByTestId("letter-job").innerText()) && /6 things it asks for/.test(await page.getByTestId("letter-job").innerText()), "it starts from this version's job and advert");
  check((await page.getByTestId("letter-editor").count()) === 0 && !/Dear Hiring Manager/.test(await paperText(page)), "there is no letter on the page yet");
  await noForbidden(page, "letter, before anything");
  await bothThemes(page, "letter-start");

  await page.getByRole("button", { name: "Draft letter" }).click();
  await page.getByText("Say why you want this role, in a sentence or two. The letter opens with it.").waitFor();
  check(await page.getByText("Choose one or two lines of your CV for the letter to use.").isVisible(), "it will not draft without the person's reason and a line of their CV");
  check((await getCv(page, id)).letter === undefined || (await getCv(page, id)).letter.paragraphs.length === 0, "and nothing was drafted");

  /* ----------------------------------------- the reason, the evidence, the tone */
  await page.getByRole("button", { name: "Record your answer" }).click();
  await page.getByText(/microphone isn’t available|can’t record|isn’t switched on/).waitFor({ timeout: 10000 });
  check((await page.getByLabel("Why do you want this role?").inputValue()) === "", "with no microphone the person is told to type, and no words are put in for them");
  await page.getByLabel("Why do you want this role?").fill(REASON);
  const list = page.getByTestId("evidence-list");
  const first = await list.locator("label.cv-choice").first().innerText();
  check(/Shows what the advert asks for/.test(first), "lines that are evidence for what the advert asks for are offered first", first);
  await list.getByRole("button", { name: /^Show all \d+ lines$/ }).click();
  const offered = (await list.locator("label.cv-choice > span").allInnerTexts()).map((t) => t.split("\n")[0].trim());
  check(offered.length >= 7 && !offered.some((t) => ["Google Ads", "Excel", "Looker Studio", "Meta Ads Manager", "Maya Chen", "Leeds, UK"].includes(t)), "the lines offered are things the person did, not single skills or contact details", offered.join(" | "));
  await list.locator("label.cv-choice", { hasText: MANAGE }).locator("input").check();
  await list.locator("label.cv-choice", { hasText: PACING }).locator("input").check();
  check(await list.locator("label.cv-choice", { hasText: "Cut average cost per lead" }).locator("input").isDisabled(), "two lines is the most: a third cannot be ticked until one is unticked");
  await page.getByLabel("Something you wrote (optional)").fill("Hi Sam, thanks for this. I'm happy with the plan and I'll send the numbers on Friday.");
  await saved(page);
  let cv = await getCv(page, id);
  check(cv.letter.reason === REASON && cv.letter.evidence.length === 2 && cv.letter.paragraphs.length === 0 && cv.letter.started === false, "the reason and the chosen lines are saved with the version; still no letter");

  /* -------------------------------------------------------------- the draft */
  await page.getByRole("button", { name: "Draft letter" }).click();
  await page.getByTestId("letter-editor").waitFor({ timeout: 30000 });
  await saved(page);
  cv = await getCv(page, id);
  const drafted = paragraphs(cv);
  check(cv.letter.started && cv.letter.paragraphs.map((p) => p.role).join(",") === "opening,evidence,evidence,close", "the draft is an opening, a paragraph for each chosen line and a short close", cv.letter.paragraphs.map((p) => p.role).join(","));
  check(drafted[0][0] === "I’m applying for the Paid media lead role at Example Travel." && drafted[0][1] === REASON, "it opens with the role and the person's reason, word for word", JSON.stringify(drafted[0]));
  check(drafted[1].join(" ") === "Your advert asks for experience managing junior executives. At Northlight Agency, I manage two junior executives and review their weekly reports.", "the first evidence paragraph says what the advert asks for, then the CV line in the first person", JSON.stringify(drafted[1]));
  check(drafted[2].join(" ") === "Your advert asks for experience with budget pacing. At Harbour Travel Group, I introduced weekly budget pacing that stopped overspend in peak season.", "and so does the second", JSON.stringify(drafted[2]));
  check(drafted[3][0] === "I’d welcome the chance to talk about how I could contribute to Example Travel." && cv.letter.signoff === "Kind regards", "the close and the sign-off follow the person's own informal style (they wrote “I've” and “I'm”)", `${drafted[3][0]} / ${cv.letter.signoff}`);
  const everything = drafted.flat().join(" ");
  check(!/passionate|excited|proven|track record|Tableau|SQL|French|dynamic|results-driven/i.test(everything), "nothing is added: no praise words, and nothing from the advert presented as the person's own");
  check(cv.letter.paragraphs.every((p) => p.sentences.every((s) => s.origin === "drafted")) && cv.letter.paragraphs[1].sentences[1].sources.some((s) => s.kind === "cv" && s.text === MANAGE), "each drafted sentence is saved with the line it was made from");
  check(/Assembled from your own words/.test(await page.getByTestId("draft-notes").innerText()), "the screen says how the draft was made");
  check(/^All 8 sentences are sourced/.test((await page.getByTestId("letter-review").innerText()).trim()), "all eight sentences pass the source check", await page.getByTestId("letter-review").innerText());
  const onPaper = await paperText(page);
  check(/Maya Chen/.test(onPaper) && /Example Travel\s+Dear Hiring Manager,/.test(onPaper) && /Kind regards,\s+Maya Chen/.test(onPaper), "the page shows the letter: “Dear Hiring Manager” when no recipient is given, the sign-off and the name");
  check(drafted.every((p) => squash(onPaper).includes(squash(p.join(" ")))), "and every paragraph, as written");
  check((await page.getByTestId("page-count").innerText()).trim() === "Page 1 of 1" && (await page.getByTestId("letter-fit").isVisible()), "it fits one page");
  await noForbidden(page, "letter, drafted");
  await bothThemes(page, "letter-draft");

  /* ---------------------------------------- select a sentence, see its source */
  const ev1 = para(page, "evidence", 0);
  await ev1.getByRole("button", { name: "Show sources" }).click();
  await ev1.locator("li.cv-lsent", { hasText: "I manage two junior executives" }).locator("button").first().click();
  let sources = await page.getByTestId("sentence-sources").innerText();
  check(/Your CV · Paid Media Manager · Northlight Agency/i.test(sources) && sources.includes(MANAGE), "selecting a sentence shows the CV line it rests on, and where that line is", sources);
  await ev1.locator("li.cv-lsent", { hasText: "Your advert asks for" }).locator("button").first().click();
  sources = await page.getByTestId("sentence-sources").innerText();
  check(/The advert/i.test(sources) && sources.includes("Experience managing junior executives"), "a sentence about the employer shows the advert clause it rests on", sources);
  // On the page itself: each sentence can be clicked.
  const reasonId = cv.letter.paragraphs[0].sentences[1].id;
  await page.locator(`.cv-lmark[data-sentence="${reasonId}"] rect`).last().click({ force: true });
  await page.getByTestId("sentence-sources").filter({ hasText: "Your reason for applying" }).waitFor({ timeout: 5000 });
  check((await page.locator(`li.cv-lsent[data-selected] `).innerText()).includes("I've planned travel campaigns"), "clicking a sentence on the page selects it and shows its source: the person's own reason");
  const closeId = cv.letter.paragraphs[3].sentences[1].id;
  await page.locator(`.cv-lmark[data-sentence="${closeId}"] rect`).last().click({ force: true });
  await page.getByText("This sentence makes no claim about you or the employer, so it needs no source.").waitFor({ timeout: 5000 });
  check(true, "“Thank you for considering my application” is shown as needing no source");
  await bothThemes(page, "letter-sources");

  /* --------------------------- a claim typed by hand goes through the same review */
  const box2 = para(page, "evidence", 1).locator("textarea");
  await addTo(box2, "I have five years’ experience with Tableau.");
  check((await box2.inputValue()).endsWith("I have five years’ experience with Tableau."), "typing in a paragraph keeps every character as typed");
  await para(page, "evidence", 1).getByTestId("para-status").filter({ hasText: "1 of 3 sentences needs attention." }).waitFor({ timeout: 5000 });
  const flagged = para(page, "evidence", 1).locator('li.cv-lsent[data-state="unsupported"]');
  check((await flagged.count()) === 1 && /Needs a source/i.test(await flagged.innerText()), "the typed sentence is marked “Needs a source”; the others are untouched");
  await flagged.locator("button").first().click();
  check(/“Tableau” is in the advert, not in your CV, your reason or your notes/.test(await page.getByTestId("sentence-sources").innerText()), "it says exactly why: the word is the advert's, not the person's", await page.getByTestId("sentence-sources").innerText());
  check((await page.locator('.cv-lmark[data-state="unsupported"]').count()) >= 1, "the sentence is underlined on the page");
  check(/One sentence needs attention before this letter can be downloaded/.test(await page.getByTestId("letter-review").innerText()) && (await page.getByRole("button", { name: "Download PDF", exact: true }).isDisabled()) && (await page.getByRole("button", { name: "Download Word", exact: true }).isDisabled()), "the letter cannot be downloaded while a sentence has no source");
  await saved(page);
  const refused = await page.evaluate(async (cvId) => {
    const r = await fetch(`/api/cv/versions/${cvId}/letter/export?format=pdf`);
    return { status: r.status, body: await r.json() };
  }, id);
  check(refused.status === 409 && refused.body.error === "unsourced" && refused.body.sentences[0].text === "I have five years’ experience with Tableau.", "and the server refuses too, naming the sentence", JSON.stringify(refused).slice(0, 200));
  await bothThemes(page, "letter-unsupported");

  // 1. Back it with a note.
  await page.getByTestId("sentence-sources").getByRole("button", { name: "Review this sentence" }).click();
  let dialog = page.getByRole("dialog", { name: "Review this sentence" });
  await dialog.waitFor();
  check(/panel=review-letter-claim&item=ls_/.test(page.url()), "reviewing a sentence has its own address");
  check(/“Tableau” is in the advert/.test(await dialog.getByTestId("claim-problems").innerText()), "the dialog lists what has no source");
  await bothThemes(page, "letter-review-claim");
  await dialog.getByRole("button", { name: "Add this note" }).click();
  await dialog.getByText("Say what backs this up, in a sentence of your own.").waitFor();
  await dialog.getByLabel("Back it with a note").fill("I built the weekly client dashboards in Tableau for five years at Northlight Agency.");
  await dialog.getByRole("button", { name: "Add this note" }).click();
  await dialog.getByTestId("claim-ok").waitFor({ timeout: 5000 });
  check(/This sentence now has a source/.test(await dialog.getByTestId("claim-ok").innerText()) && /Your note/i.test(await dialog.innerText()), "a note in the person's own words backs the sentence, and it is shown as its source");
  await dialog.getByRole("button", { name: "Done" }).click();
  check(/Tableau for five years/.test(await page.getByTestId("letter-notes").innerText()) && /^All 9 sentences are sourced/.test((await page.getByTestId("letter-review").innerText()).trim()), "the note is kept with the letter, and the letter can be downloaded again");

  // 2. Rewrite it from a line of the CV.
  await addTo(box2, "I am fluent in French.");
  await para(page, "evidence", 1).locator('li.cv-lsent[data-state="unsupported"] button').first().click();
  await page.getByTestId("sentence-sources").getByRole("button", { name: "Review this sentence" }).click();
  dialog = page.getByRole("dialog", { name: "Review this sentence" });
  await dialog.waitFor();
  await dialog.locator("label.cv-choice", { hasText: "Managed search campaigns across 12 European markets" }).locator("input").check();
  check((await dialog.getByTestId("line-preview").innerText()).includes("At Harbour Travel Group, I managed search campaigns across 12 European markets."), "choosing a CV line shows the sentence it would become");
  await dialog.getByRole("button", { name: "Use this sentence" }).click();
  await dialog.waitFor({ state: "hidden" });
  check((await box2.inputValue()).includes("I managed search campaigns across 12 European markets.") && !(await box2.inputValue()).includes("French"), "the unsupported sentence is replaced by one that says what the CV line says");

  // 3. Remove it; and what is said about the employer has to be in the advert.
  await addTo(box2, "Example Travel is the UK’s biggest travel company.");
  await para(page, "evidence", 1).locator('li.cv-lsent[data-state="unsupported"] button').first().click();
  check(/isn’t in the advert|which the advert’s words don’t/.test(await page.getByTestId("sentence-sources").innerText()), "a claim about the employer that the advert does not make is marked too", await page.getByTestId("sentence-sources").innerText());
  await page.getByTestId("sentence-sources").getByRole("button", { name: "Review this sentence" }).click();
  dialog = page.getByRole("dialog", { name: "Review this sentence" });
  await dialog.getByRole("button", { name: "Remove the sentence" }).click();
  await dialog.waitFor({ state: "hidden" });
  check(!(await box2.inputValue()).includes("biggest travel company"), "“Remove the sentence” takes it out");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  check((await box2.inputValue()).includes("biggest travel company"), "Undo brings it back");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  check(!(await box2.inputValue()).includes("biggest travel company") && /sentences are sourced/.test(await page.getByTestId("letter-review").innerText()), "Redo removes it again, and every sentence is sourced");
  await saved(page);

  /* ----------------------------------------- when the CV line behind it changes */
  cv = await getCv(page, id);
  const edit = (from, to) => (c) => ({ sections: c.sections.map((s) => (s.entries ? { ...s, entries: s.entries.map((e) => ({ ...e, bullets: e.bullets.map((b) => (b.text === from ? { ...b, text: to } : b)) })) } : s)) });
  check((await patch(page, id, edit(MANAGE, "Manage three junior executives and review their weekly reports"))) === 200, "(the CV line is changed in the builder: two becomes three)");
  await page.reload();
  await page.getByTestId("letter-editor").waitFor({ timeout: 20000 });
  const reviewing = page.locator('li.cv-lsent[data-state="review"]');
  await reviewing.first().waitFor({ timeout: 10000 });
  check((await reviewing.count()) === 1 && /Review source/i.test(await reviewing.innerText()) && (await reviewing.innerText()).includes("I manage two junior executives"), "only the sentence that rested on that line is marked “Review source”");
  check((await page.locator('li.cv-lsent[data-state="unsupported"]').count()) === 0 && /One sentence needs attention/.test(await page.getByTestId("letter-review").innerText()), "the rest of the letter is untouched, and the download waits");
  await reviewing.locator("button").first().click();
  await page.getByTestId("sentence-sources").getByRole("button", { name: "Review source" }).click();
  dialog = page.getByRole("dialog", { name: "Review source" });
  await dialog.waitFor();
  const change = await dialog.getByTestId("source-change").first().innerText();
  check(change.includes(MANAGE) && change.includes("Manage three junior executives"), "it shows the line as it was when the sentence was checked, and as it reads now", change);
  check((await dialog.getByRole("button", { name: "It still holds: keep the sentence" }).count()) === 0, "the sentence says “two” and the line now says “three”, so “It still holds” is not offered");
  await bothThemes(page, "letter-review-source");
  await dialog.locator("label.cv-choice", { hasText: "Manage three junior executives" }).locator("input").check();
  await dialog.getByRole("button", { name: "Use this sentence" }).click();
  await dialog.waitFor({ state: "hidden" });
  check((await para(page, "evidence", 0).locator("textarea").inputValue()).includes("I manage three junior executives") && (await page.locator('li.cv-lsent[data-state="review"]').count()) === 0, "rewriting from the line as it reads now clears it");
  await saved(page);
  // A change that leaves the sentence true: "It still holds".
  check((await patch(page, id, edit(PACING, `${PACING} every year`))) === 200, "(another line gains a detail)");
  await page.reload();
  await page.locator('li.cv-lsent[data-state="review"]').first().waitFor({ timeout: 20000 });
  await page.locator('li.cv-lsent[data-state="review"] button').first().click();
  await page.getByTestId("sentence-sources").getByRole("button", { name: "Review source" }).click();
  dialog = page.getByRole("dialog", { name: "Review source" });
  await dialog.getByRole("button", { name: "It still holds: keep the sentence" }).click();
  await dialog.waitFor({ state: "hidden" });
  check((await page.locator('li.cv-lsent[data-state="review"]').count()) === 0 && /sentences are sourced/.test(await page.getByTestId("letter-review").innerText()), "where the sentence still matches the changed line, “It still holds” keeps it");
  await saved(page);

  /* ------------------------------------------- who it is to, the date, sign-off */
  await page.getByLabel("Who it is to").fill("Priya Shah");
  await page.getByLabel("Sign-off").fill("");
  await page.getByLabel("Date on the letter").fill("2026-12-01");
  await saved(page);
  let text = await paperText(page);
  check(/1 December 2026\s+Priya Shah\s+Example Travel\s+Dear Priya Shah,/.test(text), "the date is written out, and a named recipient is greeted by name", text.slice(0, 260));
  check(/Yours sincerely,\s+Maya Chen/.test(text), "with a named recipient and no sign-off of the person's own, it is “Yours sincerely”");

  /* --------------------------------------------------------- one page, or say so */
  const long = Array.from({ length: 12 }, () => "At Harbour Travel Group, I managed search campaigns across 12 European markets.").join(" ");
  for (let i = 0; i < 4; i++) await page.getByRole("button", { name: "+ Add a paragraph" }).click();
  check(await page.getByRole("button", { name: "+ Add a paragraph" }).isDisabled(), "a letter holds eight paragraphs at most");
  const boxes = page.locator(".cv-lpara textarea");
  for (let i = 3; i < 8; i++) await boxes.nth(i).fill(long);
  await page.getByTestId("letter-overflow").waitFor({ timeout: 10000 });
  check(/Runs onto a second page/.test(await page.getByTestId("letter-overflow").innerText()) && (await page.getByTestId("page-count").innerText()).includes("of 2"), "a letter that is too long says so; it is not shrunk to fit");
  check((await page.locator(".cv-lpara[data-over]").count()) === 1, "the paragraph that crosses onto the second page is marked");
  check(/sentences are sourced/.test(await page.getByTestId("letter-review").innerText()), "(every sentence of the long letter is still sourced)");
  await page.getByRole("button", { name: "Fix the overflow" }).click();
  dialog = page.getByRole("dialog", { name: "Your letter runs onto a second page" });
  await dialog.waitFor();
  check(/panel=page-overflow/.test(page.url()) && (await dialog.locator("blockquote").innerText()).includes("12 European markets"), "the overflow dialog shows the paragraph that crosses the page");
  const options = dialog.getByTestId("shortening");
  check((await options.count()) >= 1 && /Saves \d+ words?\. The letter (then fits on one page|is still over one page after this)\./.test(await options.first().innerText()), "each way of shortening says how many words it saves and whether the letter then fits", await options.first().innerText());
  await bothThemes(page, "letter-overflow");
  const before = (await getCv(page, id)).letter.paragraphs.flatMap((p) => p.sentences).length;
  await options.first().getByRole("button", { name: "Use this" }).click();
  await saved(page);
  const afterCut = (await getCv(page, id)).letter;
  check(afterCut.paragraphs.flatMap((p) => p.sentences).length === before - 1 && afterCut.paragraphs.every((p) => p.sentences.every((s) => s.sources.length > 0 || /Thank you/.test(s.text))), "taking out one sentence leaves every other sentence with its source");
  await dialog.getByRole("button", { name: "Not now" }).click();
  // Take the extra paragraphs out again.
  for (let i = 0; i < 5; i++) await page.locator(".cv-lpara").nth(3).getByRole("button", { name: /^Remove / }).click();
  await page.getByTestId("letter-fit").waitFor({ timeout: 10000 });
  check((await page.getByTestId("page-count").innerText()).trim() === "Page 1 of 1" && (await page.getByTestId("letter-overflow").count()) === 0, "with the extra paragraphs removed it fits one page again");
  await saved(page);

  /* ------------------------------------------------------- real files, read back */
  cv = await getCv(page, id);
  const body = paragraphs(cv).map((p) => p.join(" "));
  check(body.length === 3 && cv.letter.paragraphs.at(-1).role === "evidence", "(the letter now has an opening and two evidence paragraphs; the close went with the long ones)", JSON.stringify(cv.letter.paragraphs.map((p) => p.role)));
  check((await page.getByTestId("letter-filename").innerText()).trim() === "Maya Chen - Paid media lead - Cover Letter", "the file is named for the person, the role and what it is");
  const pdf = await download(page, "Download PDF", "letter.pdf");
  check(pdf.name === "Maya Chen - Paid media lead - Cover Letter.pdf", "the PDF downloads with that name", pdf.name);
  const readPdfLetter = await readPdf(pdf.file);
  check(readPdfLetter.pages === 1 && readPdfLetter.title === "Maya Chen – Paid media lead – Cover Letter" && readPdfLetter.author === "" && readPdfLetter.marked, "the PDF is one tagged page, titled as a cover letter, with no author written into it", JSON.stringify({ ...readPdfLetter, text: undefined }));
  const want = ["Maya Chen", "1 December 2026", "Priya Shah", "Example Travel", "Dear Priya Shah,", ...body, "Yours sincerely,", "Maya Chen"];
  const got = squash(readPdfLetter.text);
  let at = 0;
  const inOrder = want.every((piece) => {
    const i = got.indexOf(squash(piece), at);
    if (i < 0) return false;
    at = i + squash(piece).length;
    return true;
  });
  check(inOrder, "opened and read back: the date, the recipient, the greeting, every paragraph, the sign-off and the name, in order");
  check(!/Google Ads Search Certification|Brightside Digital|University of Leeds|Cut average cost per lead|Looker Studio/.test(readPdfLetter.text), "the letter on its own holds no part of the CV");
  check(/✓ Checked/.test(await page.getByTestId("letter-status-pdf").innerText()), "the screen says the file was checked before it was sent");
  const docx = await download(page, "Download Word", "letter.docx");
  const readWord = await readDocx(docx.file);
  check(docx.name === "Maya Chen - Paid media lead - Cover Letter.docx" && readWord.tables === 0 && body.every((p) => readWord.paragraphs.some((x) => x.text === p)), "the Word file holds each paragraph of the letter as a real paragraph, exactly as written");
  check(readWord.paragraphs.some((x) => x.text === "Dear Priya Shah,") && readWord.paragraphs.at(-1).text === "Maya Chen" && readWord.paragraphs.at(-2).text === "Yours sincerely,", "with the greeting, the sign-off and the name");
  check(Math.abs(readWord.size[0] - readPdfLetter.size[0]) < 1 && Math.abs(readWord.size[0] - 595.3) < 1, "both files are A4, as the CV is");

  // With the CV, in one file.
  await page.getByTestId("letter-with").getByRole("button", { name: "Letter and CV in one file" }).click();
  check((await page.getByTestId("letter-filename").innerText()).trim() === "Maya Chen - Paid media lead - Cover Letter and CV" && /Not checked yet/.test(await page.getByTestId("letter-status-pdf").innerText()), "choosing “Letter and CV in one file” changes the name, and the earlier check no longer counts");
  const both = await download(page, "Download PDF", "letter-and-cv.pdf");
  const readBoth = await readPdf(both.file);
  check(both.name === "Maya Chen - Paid media lead - Cover Letter and CV.pdf" && readBoth.pages >= 2 && readBoth.title === "Maya Chen – Paid media lead – Cover Letter and CV", "the letter and the CV download as one PDF", `${both.name}, ${readBoth.pages} pages`);
  const joined = squash(readBoth.text);
  check(joined.indexOf(squash("Yours sincerely,")) < joined.indexOf(squash("Cut average cost per lead by 18%")) && joined.includes(squash(body[0])) && joined.includes(squash("Google Ads Search Certification")), "read back: the whole letter first, then the whole CV");
  const bothWord = await download(page, "Download Word", "letter-and-cv.docx");
  const xml = await (await JSZip.loadAsync(fs.readFileSync(bothWord.file))).file("word/document.xml").async("string");
  check((xml.match(/<w:pageBreakBefore\/>/g) || []).length === 1 && xml.indexOf("Yours sincerely,") < xml.indexOf("<w:pageBreakBefore/>"), "in the Word file the CV starts on a new page after the letter");
  await page.getByRole("button", { name: "Check both files" }).click();
  await page.getByTestId("letter-status-docx").filter({ hasText: "✓ Checked" }).waitFor({ timeout: 45000 });
  check(/✓ Checked/.test(await page.getByTestId("letter-status-pdf").innerText()), "“Check both files” reads both back and reports each");
  await bothThemes(page, "letter-files");

  /* ---------------------------------------------- what was sent is remembered */
  const downloads = page.getByTestId("downloads");
  await downloads.waitFor({ timeout: 10000 });
  check((await downloads.locator("li").count()) === 4 && /Cover Letter and CV\.docx/.test(await downloads.locator("li").first().innerText()), "the four downloads are listed, newest first");
  await downloads.locator("a", { hasText: "Cover Letter.pdf" }).first().click();
  await page.waitForURL(/\/exports\/exp_/);
  await page.getByTestId("export-record").waitFor({ timeout: 20000 });
  check(/cover letter exactly as it was/i.test(await page.locator("main").innerText()) && (await page.getByTestId("record-advert").count()) === 1, "a download's record shows the letter as it was sent, with the advert it was for");
  await page.getByTestId("record-advert").locator("summary").click();
  check((await page.getByTestId("record-advert").innerText()).includes("Experience with budget pacing"), "the advert is kept word for word with the record");
  const recordText = await paperText(page);
  check(/Dear Priya Shah,/.test(recordText) && squash(recordText).includes(squash(body[1])), "and the page shows the letter itself");
  const [again] = await Promise.all([page.waitForEvent("download", { timeout: 45000 }), page.getByRole("button", { name: "Download this file again" }).click()]);
  const againFile = path.join(FILES, "letter-again.pdf");
  await again.saveAs(againFile);
  check(sha(againFile) === sha(pdf.file), "“Download this file again” gives the very same file, byte for byte");
  await bothThemes(page, "letter-record");
  await page.getByRole("link", { name: "Back to the letter" }).click();
  await page.getByTestId("letter-editor").waitFor({ timeout: 20000 });

  /* ------------------------------------------ drafting again, and the CV list */
  await page.getByRole("button", { name: "What it’s written from" }).click();
  await page.getByTestId("letter-inputs").waitFor();
  check((await page.getByLabel("Why do you want this role?").inputValue()) === REASON, "what the letter was written from is still there to change");
  await page.getByRole("button", { name: "Draft again" }).click();
  await page.getByTestId("letter-editor").waitFor({ timeout: 30000 });
  await saved(page);
  check((await getCv(page, id)).letter.paragraphs.map((p) => p.role).join(",") === "opening,evidence,evidence,close", "“Draft again” replaces the paragraphs with a fresh draft");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await saved(page);
  check((await getCv(page, id)).letter.paragraphs.length === 3, "and Undo brings back the letter as it was");
  await page.goto(`${BASE}/cv`);
  await page.getByTestId("row-letter").first().waitFor({ timeout: 15000 });
  const labels = await page.getByTestId("row-letter").allInnerTexts();
  check(labels.map((l) => l.trim()).sort().join(",") === "Letter,Write letter", "the list of CVs shows which version has a letter", labels.join(","));
  check((await getCv(page, baseId)).letter === undefined, "the base CV has no letter: the letter belongs to the tailored version");

  /* ------------------------------------------------------------ someone else */
  const b = await newUser(browser, "other");
  await b.page.goto(`${BASE}/cv`);
  const theirs = await b.page.evaluate(async (cvId) => {
    const draft = await fetch(`/api/cv/versions/${cvId}/letter/draft`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    const file = await fetch(`/api/cv/versions/${cvId}/letter/export?format=pdf`);
    const check = await fetch(`/api/cv/versions/${cvId}/letter/check`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    return [draft.status, file.status, check.status];
  }, id);
  check(theirs.join(",") === "404,404,404", "another account cannot draft, download or check this letter: “not found”", theirs.join(","));
  await b.page.goto(`${BASE}/cv/v/${id}/letter`);
  await b.page.getByText("CV not found").waitFor({ timeout: 20000 });
  check(true, "and the letter screen shows them “CV not found”");
  await b.context.close();
  check(a.errors.length === 0, "no errors on any letter screen", a.errors.join(" | "));
  await a.context.close();

  /* ------------------------------------ writing it yourself, on a phone, no advert */
  const c = await newUser(browser, "tom", { ...PHONE });
  const phone = c.page;
  await setUp(phone, { name: "Maya phone CV", file: "maya-chen.writer.pdf" });
  const imp = phone.url().split("/").pop();
  const pid = (await phone.evaluate(async (i) => (await fetch(`/api/cv/imports/${i}/confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json(), imp)).versionId;
  await phone.goto(`${BASE}/cv/v/${pid}/letter`);
  await phone.getByTestId("letter-inputs").waitFor({ timeout: 20000 });
  check(await phone.getByText("A cover letter is written for one job. Say which.").isVisible(), "with no job on the CV, the letter asks which job it is for");
  await fitsWidth(phone, "letter start, phone");
  await a11y(phone, "letter start, phone");
  await phone.getByRole("button", { name: "Add the job" }).click();
  let sheet = phone.getByRole("dialog", { name: "The job this letter is for" });
  await sheet.getByRole("button", { name: "Save" }).click();
  await sheet.getByText("Give the job title or the employer.").waitFor();
  await sheet.getByLabel("Job title").fill("Paid media lead");
  await sheet.getByLabel("Employer").fill("Example Travel");
  await fitsWidth(phone, "job dialog, phone");
  await sheet.getByRole("button", { name: "Save" }).click();
  await sheet.waitFor({ state: "hidden" });
  check(/No advert saved/.test(await phone.getByTestId("letter-job").innerText()), "a letter can be written without an advert, and the screen says what one would add");
  await phone.getByRole("button", { name: "Write it myself" }).click();
  await phone.getByTestId("letter-editor").waitFor();
  check((await phone.locator(".cv-lpara textarea").count()) === 3 && (await phone.locator(".cv-lpara textarea").evaluateAll((els) => els.every((e) => e.value === ""))), "“Write it myself” gives three empty paragraphs: nothing is written for the person");
  const opening = phone.locator('.cv-lpara[data-role="opening"] textarea');
  await opening.fill("I am applying for the Paid media lead role at Example Travel. I am a passionate marketer.");
  await phone.locator('.cv-lpara[data-role="opening"]').getByTestId("para-status").filter({ hasText: "1 of 2 sentences needs attention." }).waitFor({ timeout: 5000 });
  const rows = phone.locator('.cv-lpara[data-role="opening"] li.cv-lsent');
  check((await rows.nth(0).getAttribute("data-state")) === "sourced" && (await rows.nth(1).getAttribute("data-state")) === "unsupported", "what the person types is checked as they type: naming the job is sourced; “passionate marketer” is not");
  await opening.fill("I am applying for the Paid media lead role at Example Travel.");
  await phone.getByRole("button", { name: "Insert a line from my CV" }).click();
  sheet = phone.getByRole("dialog", { name: "Insert a line from your CV" });
  await sheet.locator("label.cv-choice", { hasText: "Cut average cost per lead by 18%" }).locator("input").check();
  check((await sheet.getByTestId("line-preview").innerText()).includes("At Northlight Agency, I cut average cost per lead by 18% in six months by rebuilding account structure."), "inserting a CV line shows the sentence first");
  await fitsWidth(phone, "insert a line, phone");
  await sheet.getByRole("button", { name: "Insert", exact: true }).click();
  await sheet.waitFor({ state: "hidden" });
  check((await phone.locator('.cv-lpara[data-role="evidence"] textarea').inputValue()) === "At Northlight Agency, I cut average cost per lead by 18% in six months by rebuilding account structure.", "and puts it in the evidence paragraph with its figure intact");
  await saved(phone);
  check(/^All 2 sentences are sourced/.test((await phone.getByTestId("letter-review").innerText()).trim()), "the hand-written letter passes the source check");
  await fitsWidth(phone, "letter editor, phone");
  await bothThemes(phone, "letter-phone");
  await phone.getByRole("group", { name: "Show" }).last().getByRole("button", { name: "Paper" }).click();
  await phone.getByTestId("page-count").waitFor();
  const phoneText = await paperText(phone);
  check(/Dear Hiring Manager,/.test(phoneText) && phoneText.includes("I cut average cost per lead by 18%"), "on a phone the Paper view shows the letter, readable as text");
  await fitsWidth(phone, "letter paper, phone");
  await a11y(phone, "letter paper, phone");
  await phone.getByRole("group", { name: "Show" }).last().getByRole("button", { name: "Edit" }).click();
  const phonePdf = await download(phone, "Download PDF", "letter-phone.pdf");
  const readPhone = await readPdf(phonePdf.file);
  check(readPhone.pages === 1 && squash(readPhone.text).includes(squash("I am applying for the Paid media lead role at Example Travel.")) && squash(readPhone.text).includes(squash("Yours faithfully, Maya Chen")), "the hand-written letter downloads and reads back, signed “Yours faithfully” to nobody named");
  check(c.errors.length === 0, "no errors on the phone", c.errors.join(" | "));
  await c.context.close();
});
