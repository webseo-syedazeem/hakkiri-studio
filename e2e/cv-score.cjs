// The CV score, walked as new users: the number and its four groups, every finding linked to its line,
// findings under the field as it is typed, Fixed and Excluded, accepting a word, the gap prompt, the file
// checks, "good enough" at 85, the Software view with its ATS-ready label, the record of each download,
// and the free public check running on the same engine.
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { BASE, OUT, PHONE, check, noForbidden, newUser, setUp, bothThemes, a11y, fitsWidth, run } = require("./cv-helpers.cjs");

const FILES = path.join(OUT, "cv-score-downloads");
fs.rmSync(FILES, { recursive: true, force: true });
fs.mkdirSync(FILES, { recursive: true });
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const idOf = (page) => /\/cv\/v\/(cv_[a-f0-9]+)/.exec(page.url())[1];
const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
/** Changes the saved CV as the person would through the builder: read it, change it, save it on its revision. */
async function patch(page, id, change) {
  let status = 0;
  // If the builder's own save lands in between, the change is made again on the newer copy.
  for (let i = 0; i < 4 && status !== 200; i++) {
    if (i) await page.waitForTimeout(900);
    const cv = await getCv(page, id);
    const body = change(cv);
    status = await page.evaluate(async ({ id, rev, body }) => (await fetch(`/api/cv/versions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev, ...body }) })).status, { id, rev: cv.rev, body });
    if (status !== 409) break;
  }
  return status;
}
const saved = (page) => page.locator('[data-testid="save-state"]', { hasText: /^Saved$/ }).waitFor({ timeout: 15000 });
const scoreOf = async (page) => Number(/(\d+)/.exec(await page.getByTestId("score").innerText())[1]);
const buttonScore = async (page) => Number(/(\d+)$/.exec((await page.getByTestId("score-button").innerText()).trim())?.[1] ?? NaN);
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

/** A CV that says what was done, with figures, in the person's own words. */
const STRONG = (cv) => {
  const b = (id, text) => ({ id, text, visible: true, origin: "typed", sources: [] });
  const entry = (id, more) => ({ id, visible: true, title: "", org: "", orgInfo: "", location: "", start: "", end: "", current: false, subject: "", grade: "", link: "", bullets: [], ...more });
  const sections = cv.sections.map((s) => {
    if (s.kind === "summary") return { ...s, text: "Archive assistant caring for paper maps. Catalogued 3,200 maps in two years. Trained 40 volunteers to handle paper safely." };
    if (s.kind === "experience")
      return {
        ...s,
        entries: [
          entry("e_aaaaaaaaaaaaaaa1", { title: "Archive assistant", org: "Paper Kite Archive", location: "York", start: "2023-09", current: true, bullets: [b("b_aaaaaaaaaaaaaaa1", "Catalogued 3,200 maps in two years by rebuilding the intake process"), b("b_aaaaaaaaaaaaaaa2", "Wrote a 40-page handling guide used at every induction since March 2024"), b("b_aaaaaaaaaaaaaaa3", "Trained 40 volunteers to handle paper safely each term")] }),
          entry("e_aaaaaaaaaaaaaaa2", { title: "Library assistant", org: "Folio House", location: "Leeds", start: "2021-08", end: "2023-08", bullets: [b("b_aaaaaaaaaaaaaaa4", "Prepared 30 reading-room requests a week for visiting researchers"), b("b_aaaaaaaaaaaaaaa5", "Cut retrieval time from 3 days to 1 by re-shelving the reading room"), b("b_aaaaaaaaaaaaaaa6", "Inducted 6 new starters on the catalogue and the till")] }),
        ],
      };
    if (s.kind === "education") return { ...s, entries: [entry("e_aaaaaaaaaaaaaaa3", { title: "BA (Hons)", subject: "History", org: "Example University", start: "2018", end: "2021", grade: "2:1" })] };
    if (s.kind === "skills") return { ...s, groups: [{ id: "g_aaaaaaaaaaaaaaa1", name: "", visible: true, skills: ["Cataloguing", "handling", "maps", "volunteers", "induction", "intake", "reading room", "re-shelving"].map((name, i) => ({ id: `k_aaaaaaaaaaaaaaa${i}`, name, visible: true })) }] };
    return s;
  });
  return { contact: { fullName: "Fern Example", email: "fern@example.com", phone: "07700 900456", location: "York", links: ["linkedin.com/in/fern-example"] }, sections };
};

run("CV score", async (browser) => {
  /* --------------------------------------------------- nothing to score yet */
  const a = await newUser(browser, "fern");
  let page = a.page;
  await setUp(page, { name: "Fern CV", level: "Experienced" });
  const id = idOf(page);
  await page.getByLabel("Name").waitFor();
  await page.locator('[data-testid="score-button"]', { hasText: "Add content to score" }).waitFor({ timeout: 8000 });
  check(true, "an empty CV has no score: the button says “Add content to score”");
  await page.getByTestId("score-button").click();
  await page.waitForURL(/\/findings/);
  await page.getByRole("heading", { name: "Add content to score" }).waitFor();
  check((await page.getByTestId("score").count()) === 0 && (await page.locator(".cv-finding").count()) === 0, "the score screen shows no number and no findings for an empty CV");
  await noForbidden(page, "empty score");
  await bothThemes(page, "score-empty");

  /* ------------------------------------------ a weak CV: a low score, no floor */
  await patch(page, id, (cv) => ({
    contact: { ...cv.contact, fullName: "Fern Example" },
    sections: cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries: [{ id: "e_bbbbbbbbbbbbbbb1", visible: true, title: "Assistant", org: "Some Shop", orgInfo: "", location: "", start: "", end: "", current: false, subject: "", grade: "", link: "", bullets: [{ id: "b_bbbbbbbbbbbbbbb1", text: "Responsible for various tasks", visible: true, origin: "typed", sources: [] }, { id: "b_bbbbbbbbbbbbbbb2", text: "Helped the team", visible: true, origin: "typed", sources: [] }] }] } : s)),
  }));
  await page.goto(`${BASE}/cv/v/${id}/findings`);
  await page.getByTestId("score").waitFor({ timeout: 20000 });
  const weak = await scoreOf(page);
  check(weak > 0 && weak < 50, `a weak CV gets a low score (${weak}): there is no floor`);
  check(await page.getByRole("button", { name: /^Fix next/ }).isVisible(), "below 85 the main action is to fix the next finding");
  check((await page.getByTestId("good-enough").count()) === 0, "and it is not called good enough");
  const groups = await page.locator("li[data-group]").evaluateAll((els) => els.map((e) => e.textContent));
  check(groups.length === 4 && /Evidence.*\/ 45/.test(groups[0]) && /Clarity.*\/ 20/.test(groups[1]) && /Structure.*\/ 20/.test(groups[2]) && /Readable by software.*\/ 15/.test(groups[3]), "the score is shown in four groups: 45, 20, 20 and 15", groups.join(" | "));
  check(/points confirmed · [\d.]+ pending/.test(await page.getByTestId("score-pending").innerText()), "points that wait on the file checks are shown as pending, not as lost", await page.getByTestId("score-pending").innerText());
  check((await page.locator('[data-part="Issues"] .cv-finding').count()) >= 2 && (await page.locator('[data-part="Suggestions"] .cv-finding').count()) >= 4, "findings are listed as issues and suggestions");
  const duty = page.locator('.cv-finding[data-rule="duty"]');
  check((await duty.locator(".cv-underline").innerText()) === "Responsible for" && /describes the job, not what you did in it/.test(await duty.innerText()), "a finding quotes the line and underlines the phrase it is about", await duty.innerText());
  await bothThemes(page, "score-weak");

  // How this is scored.
  await page.getByRole("button", { name: "How this is scored" }).click();
  let dialog = page.getByRole("dialog", { name: "How this is scored" });
  await dialog.waitFor();
  check(/panel=score-method/.test(page.url()), "“How this is scored” has its own address");
  check((await dialog.locator("tr[data-check]").count()) === 35, "it lists all 35 checks", String(await dialog.locator("tr[data-check]").count()));
  check(/1 of 2 bullets|0 of 2 bullets/.test(await dialog.locator('tr[data-check="duty"]').innerText()), "each with its real count and points", await dialog.locator('tr[data-check="duty"]').innerText());
  check(/Not checked yet/.test(await dialog.locator('tr[data-check="pdf-readback"]').innerText()) && /Doesn’t apply/.test(await dialog.locator('tr[data-check="phone"]').innerText()), "a check that has not run says so, and one that does not apply says so");
  await bothThemes(page, "score-method");
  await dialog.getByRole("button", { name: "Close" }).click();

  // A finding opens its line; the way back is one click.
  await duty.getByRole("button", { name: /^Go to this line/ }).click();
  await page.waitForURL(/\/edit\/experience/);
  await page.waitForFunction(() => document.activeElement && document.activeElement.value === "Responsible for various tasks", null, { timeout: 8000 });
  check(true, "“Go to this line” opens the tab, the entry and the field the finding is about");
  const marked = await page.locator("svg.cv-paper g[data-marked]").allTextContents();
  check(marked.length === 1 && marked[0].includes("Responsible for various tasks"), "and the line is marked on the paper", JSON.stringify(marked));
  const inline = page.getByTestId("inline-finding");
  await inline.waitFor();
  check(/Suggestion/.test(await inline.innerText()) && (await inline.getByRole("button", { name: /^View \d+ more/ }).isVisible()), "under the field: the most important finding, and “View more” for the rest", await inline.innerText());
  await inline.getByRole("button", { name: /^View \d+ more/ }).click();
  check((await inline.locator(".cv-note").count()) >= 3, "“View more” shows the other findings for that field");
  await bothThemes(page, "score-inline");
  const before = await buttonScore(page);
  await page.getByRole("textbox", { name: "Bullet 1" }).fill("Catalogued 3,200 maps in two years by rebuilding the intake process");
  await page.locator(".cv-fixed", { hasText: "Fixed" }).waitFor({ timeout: 8000 });
  check(true, "rewriting the line clears its findings, and “Fixed” shows under the field");
  await page.waitForFunction((was) => Number(/(\d+)$/.exec(document.querySelector('[data-testid="score-button"]').textContent.trim())?.[1]) > was, before, { timeout: 8000 });
  check((await buttonScore(page)) > before, "the score in the bar goes up without a reload", `${before} → ${await buttonScore(page)}`);
  await saved(page);
  await page.getByRole("link", { name: "Back to findings" }).click();
  await page.waitForURL(/\/findings/);
  await page.locator('[data-part="Fixed"]').waitFor();
  check(/✓ fixed/i.test(await page.locator('[data-part="Fixed"] .cv-finding').first().innerText()), "“Back to findings” returns to the list, with the findings just cleared under Fixed", await page.locator('[data-part="Fixed"] .cv-finding').first().innerText());

  // Switching a line off is not the same as fixing it.
  await page.locator('.cv-finding[data-rule="fragment"]').getByRole("button", { name: /^Go to this line/ }).click();
  await page.waitForURL(/\/edit\/experience/);
  await page.getByRole("switch", { name: "Include bullet 2 in this version" }).click();
  await saved(page);
  await page.getByRole("link", { name: "Back to findings" }).click();
  await page.locator('[data-part="Excluded from this version"]').waitFor();
  check((await page.locator('[data-part="Excluded from this version"] .cv-finding').count()) >= 1, "a finding on a line that was switched off moves to “Excluded from this version”, not to Fixed");

  /* ----------------------------------------- spelling, numbers, missing email */
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  await page.getByRole("button", { name: "+ Add bullet" }).click();
  await page.getByRole("textbox", { name: "Bullet 3" }).fill("Organized the map store for the reading room team");
  await inline.waitFor({ timeout: 8000 });
  await inline.getByRole("button", { name: /^View \d+ more/ }).click().catch(() => {});
  const spelling = inline.locator(".cv-note", { hasText: "US spelling" });
  check(/“Organized” is the US spelling\. Use “Organised” in a UK CV/.test(await spelling.innerText()), "a US spelling in a UK CV is flagged, with the UK spelling", await spelling.innerText());
  await spelling.getByRole("button", { name: "Accept “Organized”" }).click();
  await page.waitForFunction(() => !document.querySelector('[data-testid="inline-finding"]')?.textContent.includes("US spelling"), null, { timeout: 8000 });
  await saved(page);
  check((await getCv(page, id)).accepted.includes("Organized"), "“Accept” leaves that word alone from then on, and is saved");
  await page.getByRole("textbox", { name: "Bullet 3" }).fill("Trained volunteers to handle paper safely");
  await inline.locator(".cv-note", { hasText: "how big this was" }).waitFor({ timeout: 8000 }).catch(async () => inline.getByRole("button", { name: /^View \d+ more/ }).click());
  await inline.getByRole("button", { name: "Add the number" }).click();
  dialog = page.getByRole("dialog", { name: "Add the number" });
  await dialog.waitFor();
  check(await dialog.getByText("We never suggest a number. Only you know it.").isVisible(), "a line with no scale offers “Add the number”, which asks and never supplies");
  await dialog.getByRole("button", { name: "I don’t know" }).click();
  await page.getByTestId("bullet-help").getByRole("button", { name: "Back to paper" }).click();

  await page.goto(`${BASE}/cv/v/${id}/findings`);
  await page.getByTestId("score").waitFor({ timeout: 20000 });
  const first = page.locator('[data-part="Issues"] .cv-finding').first();
  check(/There is no email address, so an employer cannot reply/.test(await page.locator('.cv-finding[data-rule="email"]').innerText()), "a missing email is an issue");
  await page.locator('.cv-finding[data-rule="email"]').getByRole("button", { name: /^Go to this line/ }).click();
  await page.waitForURL(/\/edit\/contact/);
  await page.waitForFunction(() => document.activeElement && document.activeElement.type === "email", null, { timeout: 8000 });
  check(true, "its link opens Contact with the cursor in Email");
  check((await page.getByTestId("inline-finding").count()) === 0, "an empty field is not nagged while it is being filled in");
  await page.getByLabel("Email").fill("fern@");
  await page.locator('[data-testid="inline-finding"]', { hasText: "not a complete email address" }).waitFor({ timeout: 8000 });
  check(/Issue/.test(await page.getByTestId("inline-finding").innerText()) && /“fern@” is not a complete email address/.test(await page.getByTestId("inline-finding").innerText()), "a half-typed email is an issue, shown under the field after a pause", await page.getByTestId("inline-finding").innerText());
  await page.getByLabel("Email").fill("fern@example.com");
  await page.locator(".cv-fixed", { hasText: "Fixed" }).waitFor({ timeout: 8000 });
  check(true, "completing it shows Fixed");
  void first;
  await saved(page);

  /* -------------------------------- a strong CV, the file checks, and 85 */
  check((await patch(page, id, STRONG)) === 200, "(a fuller CV is saved for the next checks)");
  await page.goto(`${BASE}/cv/v/${id}/findings`);
  await page.getByTestId("score").waitFor({ timeout: 20000 });
  const unchecked = await scoreOf(page);
  check(/pending/.test(await page.getByTestId("score-pending").innerText()), "before the files are checked, their points are pending");
  check((await page.locator('.cv-finding[data-rule="pdf-readback"]').getByRole("button", { name: /^Go to this line/ }).innerText()) === "Check the file", "the pending file check links to the file");
  await page.locator('.cv-finding[data-rule="pdf-readback"]').getByRole("button", { name: /^Go to this line/ }).click();
  await page.waitForURL(/\/software\/pdf/);
  await page.locator('[data-testid="file-status"]', { hasText: /✓ Checked/ }).waitFor({ timeout: 30000 });
  check(true, "it opens the Software view, which makes the real PDF and reads it back");
  check(await page.getByTestId("ats-ready").isVisible(), "a file that reads back, with standard headings and every field in place, is labelled ATS-ready");
  check(/No file can be promised to pass every employer’s system/.test(await page.getByTestId("software-status").locator("..").innerText()), "and the label says what it does and does not promise");
  const rows = await page.locator("table.cv-fields tbody tr").count();
  const same = await page.locator('table.cv-fields tbody tr[data-ok="true"]').count();
  check(rows >= 10 && rows === same, `every field read from the file is the same as the CV (${same} of ${rows})`);
  check(/Archive assistant · Paper Kite Archive/.test(await page.locator("table.cv-fields tbody tr", { hasText: "Role 1" }).first().innerText()) && /Sep 2023 – Present/.test(await page.locator("table.cv-fields tbody tr", { hasText: "Role 1: dates" }).innerText()), "roles are compared entry by entry: title, employer and dates");
  await bothThemes(page, "score-software-fields");
  await page.getByRole("group", { name: "Compare by" }).getByRole("button", { name: "Reading order" }).click();
  const expected = await page.getByTestId("expected-lines").locator("li").allInnerTexts();
  const read = (await page.getByTestId("read-lines").locator("li").allInnerTexts()).join("\n");
  check(expected[0] === "Fern Example" && expected.length > 15 && read.includes("Catalogued 3,200 maps in two years by rebuilding the intake process"), "Reading order shows the CV line by line beside what was read from the file");
  await bothThemes(page, "score-software-order");
  await page.getByRole("navigation", { name: "File" }).getByRole("link", { name: "Word" }).click();
  await page.waitForURL(/\/software\/docx/);
  await page.locator('[data-testid="file-status"]', { hasText: /✓ Checked/ }).waitFor({ timeout: 30000 });
  check(await page.getByTestId("ats-ready").isVisible(), "the Word file is checked the same way");
  await page.getByRole("link", { name: "Back to findings" }).click();
  await page.waitForURL(/\/findings/);
  await page.getByTestId("score").waitFor();
  const checked = await scoreOf(page);
  check(checked > unchecked && (await page.getByTestId("score-pending").count()) === 0, `with both files checked the pending points are earned (${unchecked} → ${checked})`);
  check(checked >= 85, `this CV reaches 85 (${checked})`);
  const enough = page.getByTestId("good-enough");
  check((await enough.innerText()).startsWith("Your CV is good enough to apply. Stop polishing and send it when you’re ready."), "at 85 it says the CV is good enough and to stop polishing", await enough.innerText());
  check((await page.getByRole("button", { name: /^Fix next/ }).count()) === 0 && (await enough.getByRole("link", { name: "Export CV" }).isVisible()), "and the main action becomes “Export CV”, not more score work");
  await bothThemes(page, "score-good-enough");

  // A gap in work is a prompt, not a deduction.
  await patch(page, id, (cv) => ({ sections: cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries: s.entries.map((e, i) => (i === 1 ? { ...e, start: "2020-01", end: "2022-06" } : e)) } : s)) }));
  await page.goto(`${BASE}/cv/v/${id}/findings`);
  await page.getByTestId("gap").waitFor({ timeout: 20000 });
  check(/Jul 2022 to Aug 2023: 14 months/.test(await page.getByTestId("gap").innerText()) && /costs no points/.test(await page.getByTestId("gap").innerText()), "a gap of more than six months is shown as “Be ready to explain this”, and costs no points", await page.getByTestId("gap").innerText());
  check((await page.getByTestId("gap").getByRole("link", { name: "Practise an answer" }).getAttribute("href")) === "/practice", "with a way to practise an answer");
  await a11y(page, "score with a gap");

  /* ------------------------------------ the Software view when something is off */
  await patch(page, id, (cv) => ({ sections: cv.sections.map((s) => (s.kind === "experience" ? { ...s, title: "Where I have been" } : s)) }));
  await page.goto(`${BASE}/cv/v/${id}/software/pdf`);
  await page.locator('[data-testid="file-status"]', { hasText: /✓ Checked/ }).waitFor({ timeout: 30000 });
  check((await page.getByTestId("ats-ready").count()) === 0 && /not standard: “Where I have been”/.test(await page.getByTestId("ats-why").innerText()), "a heading software does not look for takes the ATS-ready label away, and says why", await page.getByTestId("ats-why").innerText());
  await patch(page, id, (cv) => ({ sections: cv.sections.map((s) => (s.kind === "experience" ? { ...s, title: "" } : s)), contact: { ...cv.contact, fullName: "Fern 陈 Example" } }));
  await page.goto(`${BASE}/cv/v/${id}/software/pdf`);
  await page.locator('[data-testid="file-status"]', { hasText: "Loss found" }).waitFor({ timeout: 30000 });
  const whyNot = await page.getByTestId("ats-why").innerText();
  check(/The fonts can’t draw these characters: 陈\./.test(whyNot), "a character the fonts cannot draw is a loss, named", whyNot);
  // No font here has Chinese, so another pairing is not offered as a way out: Latin letters or the Word file are.
  check(/None of our fonts can draw these/.test(whyNot) && /use the Word file/.test(whyNot) && !/font pairing/.test(whyNot), "the advice given is one that can work: Latin letters, or the Word file", whyNot);
  const loss = await page.getByTestId("first-loss").innerText();
  check(/^The PDF reads name as “Fern Example”\. Your CV says “Fern 陈 Example”\./.test(loss), "the first difference is said in words: what the file reads, and what the CV says", loss);
  await bothThemes(page, "score-software-loss");
  await patch(page, id, (cv) => ({ contact: { ...cv.contact, fullName: "Fern Example" } }));

  /* ------------------------------------------------ the record of a download */
  await page.goto(`${BASE}/cv/v/${id}/edit/finish`);
  await page.getByRole("heading", { name: "Files" }).waitFor();
  check((await page.getByTestId("downloads").count()) === 0, "before any download, nothing is listed as downloaded");
  const firstFile = await download(page, "Download PDF", "first.pdf");
  await page.getByTestId("downloads").waitFor();
  check((await page.getByTestId("downloads").getByRole("link", { name: "Fern Example - CV.pdf" }).count()) === 1, "a download is remembered under “What you have downloaded”");
  await tab(page, "Contact");
  await page.getByLabel("Name", { exact: true }).fill("Fern A. Example");
  await saved(page);
  await tab(page, "Finish");
  await page.getByTestId("downloads").getByRole("link", { name: "Fern Example - CV.pdf" }).click();
  await page.waitForURL(/\/exports\/exp_/);
  await page.getByTestId("export-record").waitFor();
  check(/has been changed since\. This page shows what you downloaded/.test(await page.getByTestId("record-changed").innerText()), "the record says the CV has changed since");
  await page.locator("svg.cv-paper text", { hasText: "Fern Example" }).first().waitFor({ timeout: 20000 });
  check((await page.locator("svg.cv-paper text", { hasText: "Fern A. Example" }).count()) === 0, "and shows the CV exactly as it was sent, not as it is now");
  const again = await download(page, "Download this file again", "again.pdf");
  check(again.name === "Fern Example - CV.pdf" && sha(firstFile.file) === sha(again.file), "“Download this file again” gives the very same file, byte for byte", `${sha(firstFile.file).slice(0, 12)} / ${sha(again.file).slice(0, 12)}`);
  await bothThemes(page, "score-export-record");
  const recordUrl = page.url();

  const b = await newUser(browser, "other");
  await b.page.goto(`${BASE}/cv`);
  const exportId = /exports\/(exp_[a-f0-9]+)/.exec(recordUrl)[1];
  const theirs = await b.page.evaluate(async ({ id, exportId }) => [(await fetch(`/api/cv/versions/${id}/software?format=pdf`)).status, (await fetch(`/api/cv/versions/${id}/exports`)).status, (await fetch(`/api/cv/exports/${exportId}`)).status, (await fetch(`/api/cv/exports/${exportId}/file`)).status], { id, exportId });
  check(theirs.join(",") === "404,404,404,404", "another account cannot see the Software view or the downloads", theirs.join(","));
  await b.page.goto(recordUrl);
  await b.page.getByText(/not found/i).first().waitFor();
  check(true, "and the record's address shows them nothing");
  await page.getByRole("button", { name: "Delete this record" }).click();
  await page.waitForURL(/\/edit\/finish/);
  await page.getByRole("heading", { name: "Files" }).waitFor();
  await page.waitForTimeout(600);
  check((await page.getByTestId("downloads").count()) === 0 && (await getCv(page, id)).contact.fullName === "Fern A. Example", "deleting the record removes it and leaves the CV alone");

  /* ---------------------------------- the free public check: the same engine */
  const text = (await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}/software?format=docx`)).json()).expected.join("\n"), id)) || "";
  const pub = await newUser(browser, "public");
  await pub.page.goto(`${BASE}/cv-audit`);
  const audit = await pub.page.evaluate(async (t) => (await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: t, region: "uk" }) })).json(), "Sam Example\n\nExperience\nAssistant, Some Shop\n- Responsible for various tasks\n- Helped the team\n- I was a hard-working team player\n");
  check(audit.score > 0 && audit.score < 45 && audit.isGoodEnough === false, `the free check gives a weak CV a low score too (${audit.score}): no floor`);
  check(audit.teaserFindings.length === 3 && audit.teaserFindings.every((f) => f.problem && f.fix), "with its first three findings, each saying the problem and the fix");
  const good = await pub.page.evaluate(async (t) => (await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: t, region: "uk" }) })).json(), text);
  check(good.score > audit.score + 25 && good.pendingPoints > 6, `the same text as the CV above scores well (${good.score}), with the file's points left pending (${good.pendingPoints})`);
  const tiny = await pub.page.evaluate(async () => (await fetch("/api/audit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "a b c d e f g h i j k l m n o p q r s t u v w x y z a b c d e f", region: "uk" }) })).status);
  check(tiny === 400, "too little text is refused with a reason, not scored", String(tiny));

  /* ------------------------------------------------------------------ phone */
  const ph = await newUser(browser, "phone", PHONE);
  await setUp(ph.page, { name: "Phone CV" });
  const phoneId = idOf(ph.page);
  await patch(ph.page, phoneId, STRONG);
  await ph.page.goto(`${BASE}/cv/v/${phoneId}/findings`);
  await ph.page.getByTestId("score").waitFor({ timeout: 20000 });
  await fitsWidth(ph.page, "score on a phone");
  await bothThemes(ph.page, "score-phone");
  await ph.page.goto(`${BASE}/cv/v/${phoneId}/software/pdf`);
  await ph.page.locator('[data-testid="file-status"]', { hasText: /✓ Checked/ }).waitFor({ timeout: 30000 });
  await fitsWidth(ph.page, "Software view on a phone");
  await a11y(ph.page, "Software view on a phone");

  for (const u of [a, b, pub, ph]) check(u.errors.length === 0, "no page errors", u.errors.join("\n"));
});
