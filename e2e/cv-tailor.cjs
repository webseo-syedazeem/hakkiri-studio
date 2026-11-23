// Tailoring to a job, walked as new users: a tailored version made from a base CV, what the advert asks for
// read from its own words, each requirement matched to a line of the CV, job fit with its arithmetic shown,
// "Do you have this?" (yes needs a line; no records a gap), linking evidence, the advert's terms on the paper,
// proposed changes with reasons, and the report of what changed. The base CV is never touched.
const fs = require("node:fs");
const path = require("node:path");
const { BASE, OUT, PHONE, check, noForbidden, newUser, setUp, bothThemes, a11y, fitsWidth, run } = require("./cv-helpers.cjs");
const { readPdf, squash } = require("./cv-files.cjs");

const idOf = (page) => /\/cv\/v\/(cv_[a-f0-9]+)/.exec(page.url())[1];
const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const fitOf = async (page) => Number((await page.getByTestId("fit-score").innerText()).match(/\d+/)[0]);
const row = (page, text) => page.locator(`li.cv-req[data-req="${text}"]`);
const statusOf = async (page, text) => (await row(page, text).locator(".cv-status").innerText()).trim();
const settle = (page) => page.waitForTimeout(1300);

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

run("CV tailoring", async (browser) => {
  const a = await newUser(browser, "maya");
  let page = a.page;
  await setUp(page, { name: "Maya base CV", file: "maya-chen.writer.pdf" });
  const importId = page.url().split("/").pop();
  const baseId = (await page.evaluate(async (imp) => (await fetch(`/api/cv/imports/${imp}/confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json(), importId)).versionId;
  const baseBefore = JSON.stringify((await getCv(page, baseId)).sections);

  /* ------------------------------------------- a tailored version, made first */
  await page.goto(`${BASE}/cv`);
  await page.getByTestId("row-score").first().waitFor({ timeout: 15000 });
  check(/^Score \d+$/.test((await page.getByTestId("row-score").first().innerText()).trim()) && (await page.getByTestId("row-fit").count()) === 0, "the list shows the base CV's score, and no job fit: it has no advert");
  await page.getByRole("button", { name: "Tailor Maya base CV to a job" }).click();
  let dialog = page.getByRole("dialog", { name: "Tailor to a job" });
  await dialog.waitFor();
  check(/panel=tailor&item=cv_/.test(page.url()), "“Tailor to a job” has its own address");
  await dialog.getByRole("button", { name: "Make tailored version" }).click();
  await dialog.getByText("Paste the job advert. It is what this version is tailored to.").waitFor();
  check(await dialog.getByText("Give the job title or the employer, so you can tell this version from the others.").isVisible(), "it needs the job and the advert before it makes anything");
  await dialog.getByLabel("Job title").fill("Paid media lead");
  await dialog.getByLabel("Employer").fill("Example Travel");
  await dialog.getByLabel("The advert").fill(ADVERT);
  await bothThemes(page, "tailor-start");
  await dialog.getByRole("button", { name: "Make tailored version" }).click();
  await page.waitForURL((u) => /\/cv\/v\/cv_[a-f0-9]+\/tailor/.test(u.pathname) && !u.pathname.includes(baseId), { timeout: 20000 });
  const id = idOf(page);
  await page.getByTestId("fit-score").waitFor({ timeout: 20000 });
  let cv = await getCv(page, id);
  check(cv.kind === "tailored" && cv.parentId === baseId && cv.name === "Maya base CV – Example Travel", "it is a separate version linked to the base, named for the employer", `${cv.kind} ${cv.parentId} ${cv.name}`);
  check(cv.target.advert === ADVERT, "the advert is kept word for word");
  await noForbidden(page, "tailoring");

  /* --------------------------------------- what the advert asks for, and fit */
  const quotes = cv.requirements.map((r) => r.quote);
  check(quotes.length === 6 && quotes.every((q) => ADVERT.includes(q)), "six requirements are read from the advert, each in the advert's own words", JSON.stringify(quotes));
  check(!quotes.some((q) => /holiday|pension|equal opportunities|Send your CV|travel company/.test(q)), "benefits, “about us” and how to apply are left out");
  check((await page.locator("li.cv-req").count()) === 6, "there is one row per requirement");
  check((await statusOf(page, "Experience managing junior executives")) === "Met" && /Shown by\s+Manage two junior executives and review their weekly reports/i.test(await row(page, "Experience managing junior executives").innerText()), "a requirement the CV shows is Met, with the line that shows it");
  check((await statusOf(page, "Experience with Tableau")) === "Missing" && /No evidence in this version/.test(await row(page, "Experience with Tableau").innerText()), "one it does not show is Missing: “No evidence in this version”");
  const duty = "You will run Google Ads and Meta campaigns for our travel brands";
  check((await statusOf(page, duty)) === "Partly met" && /No single line shows all of this/.test(await row(page, duty).innerText()), "one shown only in pieces is Partly met, and says why", await row(page, duty).innerText());
  check((await fitOf(page)) === 50, "job fit is 50", String(await fitOf(page)));
  check((await page.getByTestId("fit-maths").innerText()).startsWith("4.5 of 9 points: 2 required met (4), 1 required missing (0), 1 preferred partly met (0.5), 2 preferred missing (0)."), "with the arithmetic shown: required counts 2, preferred 1, partly met half", await page.getByTestId("fit-maths").innerText());
  check((await page.getByTestId("fit-words").innerText()) === "This CV evidences 2 requirements fully and 1 partly. 3 have no supporting CV line.", "and said in words", await page.getByTestId("fit-words").innerText());
  await bothThemes(page, "tailor");

  // The advert beside it, with the chosen requirement marked.
  await row(page, "Experience with budget pacing").locator(".cv-req-quote").click();
  check((await page.getByTestId("advert").locator("mark").innerText()) === "Experience with budget pacing", "choosing a requirement marks its words in the advert");
  check(/Introduced weekly budget pacing/.test(await page.getByTestId("advert").innerText()), "and shows the CV line beside it");

  // The advert's terms, and where they are on the page.
  const terms = page.getByTestId("terms");
  check((await terms.getByRole("button", { name: "✓ Google Ads" }).count()) === 1 && /Tableau/.test(await terms.innerText()) && /SQL/.test(await terms.innerText()), "the advert's terms are listed as on the CV or not");
  await terms.getByRole("button", { name: "✓ Google Ads" }).click();
  await page.locator("svg.cv-paper .cv-termmark").first().waitFor({ timeout: 20000 });
  check((await page.locator("svg.cv-paper .cv-termmark").count()) >= 2, "pressing a term marks each place it appears on the paper");
  await a11y(page, "tailoring with the paper");

  /* -------------------------------------------------------- Do you have this? */
  await row(page, "Knowledge of SQL").getByRole("button", { name: "Yes, add my experience" }).click();
  dialog = page.getByRole("dialog", { name: "Do you have this?" });
  await dialog.waitFor();
  check(/The advert asks for\s+“Knowledge of SQL”\. If you’ve done it, tell us what you did and where\./.test(await dialog.innerText()), "“Do you have this?” quotes the advert and asks what you did and where");
  await dialog.getByLabel("What you did, in one line").fill("Yes");
  await dialog.getByRole("button", { name: "Add to my CV" }).click();
  check(await dialog.getByText("Say what you did and where, in one line. “Yes” alone can’t go on a CV.").isVisible(), "a bare “Yes” earns nothing: it asks for the line");
  check((await statusOf(page, "Knowledge of SQL")) === "Missing", "and the requirement is still Missing");
  const sql = "I wrote SQL queries to pull weekly spend by campaign.";
  await dialog.getByLabel("What you did, in one line").fill(sql);
  check((await dialog.getByTestId("experience-preview").innerText()) === "Wrote SQL queries to pull weekly spend by campaign", "the line is previewed as it will read, before anything is added");
  check(/\(suggested\)/.test(await dialog.getByLabel("Put it under").locator("option:checked").innerText()), "a role is suggested for it, and can be changed");
  await bothThemes(page, "tailor-do-you-have-this");
  await dialog.getByLabel("Put it under").selectOption({ index: 0 });
  await dialog.getByRole("button", { name: "Add to my CV" }).click();
  await dialog.waitFor({ state: "detached" });
  check((await statusOf(page, "Knowledge of SQL")) === "Met" && /You linked\s+Wrote SQL queries/i.test(await row(page, "Knowledge of SQL").innerText()), "with the line given, the requirement is Met and shows the line");
  check((await fitOf(page)) === 61, "job fit rises to 61", String(await fitOf(page)));

  await row(page, "Fluent French").getByRole("button", { name: "No, record the gap" }).click();
  check(/You said you don’t have this\. It stays in the total\./.test(await row(page, "Fluent French").innerText()) && (await fitOf(page)) === 61, "“No” records the gap: it stays in the total and the fit does not move");
  check(await row(page, "Fluent French").getByRole("button", { name: "I do have this" }).isVisible(), "and it can be taken back");

  // Required or preferred is the person's to correct.
  await row(page, "Experience with Tableau").getByLabel(/^Priority of/).selectOption("preferred");
  check((await fitOf(page)) === 69, "marking a requirement as preferred changes its weight, and the fit with it (5.5 of 8)", String(await fitOf(page)));
  await row(page, "Experience with Tableau").getByLabel(/^Priority of/).selectOption("required");
  check((await fitOf(page)) === 61, "and back");

  // Evidence in different words: the person links the line.
  await row(page, duty).getByRole("button", { name: "Link evidence" }).click();
  dialog = page.getByRole("dialog", { name: "Link evidence" });
  await dialog.waitFor();
  await dialog.getByRole("checkbox", { name: /^Run Google Ads and Meta campaigns for six retail clients/ }).check();
  await dialog.locator(".cv-seg label", { hasText: "Part of it" }).click();
  await dialog.getByRole("button", { name: "Save" }).click();
  check(await dialog.getByText("Say which part your evidence doesn’t cover.").isVisible(), "“part of it” must name the part not covered");
  await a11y(page, "link evidence dialog");
  await dialog.getByLabel("Which part is not covered?").fill("travel brands");
  await dialog.getByRole("button", { name: "Save" }).click();
  await dialog.waitFor({ state: "detached" });
  check(/Not covered: travel brands/.test(await row(page, duty).innerText()) && (await statusOf(page, duty)) === "Partly met", "a partly met row names what is covered and what is not");
  await row(page, duty).getByRole("button", { name: "Link evidence" }).click();
  await dialog.locator(".cv-seg label", { hasText: "All of it" }).click();
  await dialog.getByRole("button", { name: "Save" }).click();
  await dialog.waitFor({ state: "detached" });
  check((await statusOf(page, duty)) === "Met" && (await fitOf(page)) === 67, "linked as showing all of it, it is Met and the fit moves (6 of 9)", `${await statusOf(page, duty)} ${await fitOf(page)}`);

  // A requirement the reading missed, added from the advert's words; and removed again.
  await page.getByRole("button", { name: "+ Add a requirement" }).click();
  dialog = page.getByRole("dialog", { name: "Add a requirement" });
  await dialog.getByLabel("Words from the advert").fill("Experience with Looker Studio");
  await dialog.getByRole("button", { name: "Save" }).click();
  await row(page, "Experience with Looker Studio").waitFor();
  check((await statusOf(page, "Experience with Looker Studio")) === "Partly met" && /Listed as a skill\. No line shows where you used it\./.test(await row(page, "Experience with Looker Studio").innerText()), "a skill listed on its own is only Partly met: nothing shows where it was used");
  await row(page, "Experience with Looker Studio").getByRole("button", { name: /^Edit requirement/ }).click();
  dialog = page.getByRole("dialog", { name: "Edit requirement" });
  await dialog.getByRole("button", { name: "Remove" }).click();
  await row(page, "Experience with Looker Studio").waitFor({ state: "detached" });
  check((await page.locator("li.cv-req").count()) === 6, "a requirement can be removed");

  // Editing the advert keeps the work already done.
  await page.getByRole("button", { name: "Edit advert" }).click();
  dialog = page.getByRole("dialog", { name: "Edit advert" });
  await dialog.getByLabel("The advert").fill(ADVERT.replace("- Experience with Tableau", "- Experience with Tableau\n- Experience with Excel"));
  await dialog.getByRole("button", { name: "Save and read requirements" }).click();
  await row(page, "Experience with Excel").waitFor();
  check((await page.locator("li.cv-req").count()) === 7 && (await statusOf(page, "Knowledge of SQL")) === "Met" && /It stays in the total/.test(await row(page, "Fluent French").innerText()), "editing the advert adds what is new and keeps what was already worked on");
  await settle(page);

  /* ------------------------------------------------------- proposed changes */
  await page.evaluate(async () => fetch("/api/cv/bank", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: "Built Tableau dashboards for six retail clients", original: "I built the Tableau dashboards for our six retail clients.", role: "Paid Media Manager", org: "Northlight Agency" }) }));
  await page.getByRole("link", { name: "Review proposed changes" }).click();
  await page.waitForURL(/\/changes\/proposed/);
  await page.getByTestId("effect").waitFor({ timeout: 20000 });
  const included = page.locator('[data-part="Included"] .cv-change');
  check((await included.count()) === 1 && /Built Tableau dashboards for six retail clients/.test(await included.innerText()) && /Your saved achievement shows “Experience with Tableau”, which this version doesn’t yet\./.test(await included.innerText()), "a saved achievement that shows a missing requirement is proposed, with the reason", await included.innerText());
  const moved = page.locator('[data-part="Moved"] .cv-change');
  check((await moved.count()) >= 1 && /Lines that show what the advert asks for go first/.test(await moved.first().innerText()), "lines that show what the advert asks for are proposed to move up, with the reason");
  check(/Job fit with the selected changes: \d+ → \d+\./.test(await page.getByTestId("effect").innerText()), "what the changes would do to job fit is shown before anything is applied", await page.getByTestId("effect").innerText());
  const [from, to] = (await page.getByTestId("effect").innerText()).match(/\d+/g).map(Number);
  check(to > from, `the selected changes raise it (${from} → ${to})`);
  const untouched = JSON.stringify((await getCv(page, id)).sections);
  await bothThemes(page, "tailor-proposed");
  check(JSON.stringify((await getCv(page, id)).sections) === untouched, "looking at proposals changes nothing");
  await page.getByRole("button", { name: /^Apply \d+ selected changes?$/ }).click();
  await page.waitForURL(/\/changes\/report/);
  await page.getByRole("heading", { name: "What changed", level: 1 }).waitFor();
  check((await page.locator('[data-part="Included"] .cv-change').count()) >= 2, "the report lists what was included (the saved achievement, and the line given earlier), each with why");
  check(/Why: Your saved achievement shows/.test(await page.locator('[data-part="Included"]').innerText()) && /The advert says: “Experience with Tableau”/.test(await page.locator('[data-part="Included"]').innerText()), "each change carries its reason and the advert's words it was made for");
  check((await page.locator('[data-part="Moved"] .cv-change').count()) >= 1, "and what was moved");
  await bothThemes(page, "tailor-report");
  cv = await getCv(page, id);
  const role1 = cv.sections.find((s) => s.kind === "experience").entries[0];
  check(role1.bullets[0].text === "Built Tableau dashboards for six retail clients" && /^ach_/.test(role1.bullets[0].bankId) && cv.changes.length >= 3, "the changes are saved in the version, with the record of each");
  await page.getByRole("link", { name: "Back to tailoring" }).click();
  await page.getByTestId("fit-score").waitFor();
  check((await statusOf(page, "Experience with Tableau")) === "Met" && (await fitOf(page)) === to, `job fit is recalculated on the version as it now is (${await fitOf(page)})`);

  // With a longer role, lines that show nothing asked for are offered for switching off: offered, not chosen.
  await page.getByRole("link", { name: "Review proposed changes" }).click();
  await page.getByRole("heading", { level: 1 }).waitFor();
  await page.waitForTimeout(800);
  const off = page.locator('[data-part="Switched off"] .cv-change');
  if (await off.count()) {
    check(!(await off.first().getByRole("checkbox").isChecked()) && /Your call: not selected for you/.test(await off.first().innerText()), "switching a line off is offered, never selected for the person");
    check(/stays in your CV/.test(await off.first().innerText()), "and says the line stays in the CV");
  } else check(await page.getByText("No changes to propose").isVisible(), "with nothing left to arrange, it says so");

  /* ------------------------------------------------ the base is never touched */
  const baseNow = await getCv(page, baseId);
  check(JSON.stringify(baseNow.sections) === baseBefore && baseNow.requirements.length === 0 && baseNow.kind === "base", "the base CV is exactly as it was: nothing done to the version reached it");
  await page.goto(`${BASE}/cv`);
  await page.getByTestId("row-fit").waitFor({ timeout: 15000 });
  const rows = await page.locator(".cv-pick").evaluateAll((els) => els.map((e) => [e.innerText.replace(/\s+/g, " "), e.style.paddingLeft]));
  check(rows.length === 2 && /Maya base CV – Example Travel/.test(rows[1][0]) && rows[1][1] === "44px" && new RegExp(`Job fit ${to}`).test(rows[1][0]), "the list shows the tailored version under its base, with its job fit", JSON.stringify(rows));
  await bothThemes(page, "tailor-list");
  await page.getByRole("link", { name: "Maya base CV – Example Travel" }).click();
  await page.waitForURL(/\/tailor/);
  check(true, "a tailored version opens on its tailoring screen");
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  await page.locator('[data-testid="fit-button"]', { hasText: `Job fit ${to}` }).waitFor({ timeout: 15000 });
  check(true, "the builder's bar shows the version's job fit");
  await page.goto(`${BASE}/cv/v/${baseId}/edit/experience`);
  await page.locator('[data-testid="fit-button"]', { hasText: "Tailor to a job" }).waitFor({ timeout: 15000 });
  check(true, "and for the base, a way to tailor it");

  // Nothing from the advert gets into the file.
  await page.goto(`${BASE}/cv/v/${id}/edit/finish`);
  await page.getByRole("heading", { name: "Files" }).waitFor();
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 45000 }), page.getByRole("button", { name: "Download PDF", exact: true }).click()]);
  const file = path.join(OUT, "cv-tailored.pdf");
  await dl.saveAs(file);
  const pdf = squash((await readPdf(file)).text);
  check(dl.suggestedFilename() === "Maya Chen - Paid media lead - CV.pdf", "the tailored file is named for the job", dl.suggestedFilename());
  check(pdf.includes(squash("Built Tableau dashboards for six retail clients")) && !pdf.includes("FluentFrench") && !pdf.includes("equalopportunities") && !pdf.includes(squash("Knowledge of SQL")), "the PDF holds the CV's own lines and none of the advert's: no hidden keywords");
  fs.rmSync(file, { force: true });

  /* ------------------------------------------- honest scores: low, and none */
  const lowRes = await page.evaluate(async (bid) => (await fetch(`/api/cv/versions/${bid}/tailor`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Staff nurse", employer: "Example Hospital", advert: "Essential\n- NMC registration\n- Experience on an acute medical ward\n- Experience administering intravenous medication\n\nDesirable\n- A mentorship qualification" }) })).json(), baseId);
  await page.goto(`${BASE}/cv/v/${lowRes.id}/tailor`);
  await page.getByTestId("fit-score").waitFor({ timeout: 20000 });
  const low = await fitOf(page);
  check(low <= 10, `a CV that shows none of what a job asks for gets a job fit near nothing (${low}): there is no floor`);
  check(/0 requirements fully and \d partly\. \d have no supporting CV line\./.test(await page.getByTestId("fit-words").innerText()), "and says so plainly");
  await bothThemes(page, "tailor-low-fit");
  const noneRes = await page.evaluate(async (bid) => (await fetch(`/api/cv/versions/${bid}/tailor`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Team member", employer: "", advert: "Come and join us! We have a great team, free fruit and a dog in the office every Friday." }) })).json(), baseId);
  await page.goto(`${BASE}/cv/v/${noneRes.id}/tailor`);
  await page.getByRole("heading", { name: "No job fit yet" }).waitFor({ timeout: 20000 });
  check((await page.getByTestId("fit-score").count()) === 0, "an advert with nothing to assess has no job fit at all, not a made-up one");

  // A base CV with an advert from set-up is offered a copy to tailor.
  const other = await newUser(browser, "other");
  await other.page.goto(`${BASE}/cv`);
  const denied = await other.page.evaluate(async (bid) => (await fetch(`/api/cv/versions/${bid}/tailor`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "x", employer: "y", advert: "Essential - Experience with everything and anything at all" }) })).status, baseId);
  check(denied === 404, "another account cannot tailor someone else's CV", String(denied));

  /* ------------------------------------------------------------------ phone */
  const ph = await newUser(browser, "phone", PHONE);
  await setUp(ph.page, { name: "Phone CV", file: "maya-chen.writer.pdf" });
  const pImport = ph.page.url().split("/").pop();
  const pBase = (await ph.page.evaluate(async (imp) => (await fetch(`/api/cv/imports/${imp}/confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json(), pImport)).versionId;
  const pMade = await ph.page.evaluate(async ({ bid, advert }) => (await fetch(`/api/cv/versions/${bid}/tailor`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Paid media lead", employer: "Example Travel", advert }) })).json(), { bid: pBase, advert: ADVERT });
  await ph.page.goto(`${BASE}/cv/v/${pMade.id}/tailor`);
  await ph.page.getByTestId("fit-score").waitFor({ timeout: 20000 });
  await fitsWidth(ph.page, "tailoring on a phone");
  await bothThemes(ph.page, "tailor-phone");
  await ph.page.goto(`${BASE}/cv/v/${pMade.id}/changes/proposed`);
  await ph.page.getByRole("heading", { level: 1 }).waitFor();
  await fitsWidth(ph.page, "proposed changes on a phone");

  for (const u of [a, other, ph]) check(u.errors.length === 0, "no page errors", u.errors.join("\n"));
});
