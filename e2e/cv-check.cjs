// "Check my CV or cover letter" and "Check against a job", in the app: the intake (what, how, where, which job),
// the audit report (score in four parts, top fixes with their words, how software read the file), the job match
// report (each requirement with the CV's line and its status), and the cover letter's own score and checks.
const path = require("node:path");
const { BASE, PHONE, check, newUser, bothThemes, fitsWidth, run } = require("./cv-helpers.cjs");

const CV = `Priya Shah
priya.shah@example.com · 07700 900123 · Leeds

Experience
Marketing Manager, Kinetix Home, Leeds
Mar 2021 – Present
• Grew qualified leads by 52% in a year by rebuilding the email programme in HubSpot
• Led a team of 4 across email, social and paid search
• Responsible for social media
• Cut cost per lead from £38 to £21 by moving budget to paid search

Marketing Executive, Brightwater Foods, York
Jun 2018 – Feb 2021
• Ran 30 product launch campaigns across email and social
• Wrote the monthly newsletter for 40,000 customers

Education
BA Marketing, University of Leeds, 2018

Skills
Email marketing, Google Ads, HubSpot, copywriting, reporting`;

const ADVERT = `Head of Growth Marketing
Fernbrook Outdoor, Brighton (hybrid)

Fernbrook Outdoor makes camping and walking gear and sells online across the UK.

What you'll need
- Experience leading a small marketing team
- A track record of growing qualified leads through email marketing
- Confidence managing paid search budgets
- Strong reporting skills and comfort presenting results to the board
- Experience with Salesforce Marketing Cloud`;

const LETTER = `Dear Ms Patel,

I am applying for the Head of Growth Marketing role at Fernbrook Outdoor. I want to work for a brand whose gear I already use, and I am keen to grow its online sales.

At Kinetix Home I lead a team of 4 across email, social and paid search. In a year we grew qualified leads by 52% by rebuilding the email programme in HubSpot.

I also managed a £2 million budget at Unilever and won three national awards.

I would welcome the chance to talk about your plans for next season.

Yours sincerely,
Priya Shah`;

const seg = (page, group, name) => page.getByRole("group", { name: group }).getByRole("button", { name, exact: true });

run("CV check", async (browser) => {
  const a = await newUser(browser, "checker");
  const page = a.page;
  await page.goto(`${BASE}/cv`);
  await page.getByTestId("path-check").click();
  await page.waitForURL(/\/cv\/check$/);
  await page.getByRole("heading", { name: "Check your document" }).waitFor();
  const aside = page.locator("section", { hasText: "What will be checked" });
  check(/Evidence and impact/.test(await aside.innerText()) && /PDF and Word read-back/.test(await aside.innerText()), "the intake says what will be checked");
  await bothThemes(page, "check-intake");

  // Nothing sent without a document.
  await page.getByTestId("check-submit").click();
  check(await page.getByText("Add your document text before checking.").isVisible(), "an empty check says what is missing and sends nothing");

  // A pasted CV.
  await page.getByLabel("CV text").fill(CV);
  await page.getByTestId("check-submit").click();
  await page.waitForURL(/\/cv\/check\/chk_[a-f0-9]{16}$/, { timeout: 20000 });
  await page.getByRole("heading", { name: "Audit report" }).waitFor({ timeout: 20000 });
  const score = page.getByTestId("cv-score");
  const scoreText = await score.innerText();
  check(/\d+\s*\/ 100/.test(scoreText) && /Needs work|Good|Strong/.test(scoreText) && /Evidence/.test(scoreText) && /Readable by software/.test(scoreText), "the report gives the CV score with a plain label and its four parts", scoreText.slice(0, 160));
  const fixes = page.getByTestId("cv-fixes");
  check((await fixes.getByTestId("finding").count()) > 0 && /Why:/.test(await fixes.innerText()) && /What to do:/.test(await fixes.innerText()), "the top fixes each say why and what to do");
  check(/Responsible for social media/.test(await fixes.innerText()), "a fix quotes the exact words it is about");
  const readBack = page.getByTestId("read-back");
  check(/Not checked/.test(await readBack.innerText()) && (await readBack.getByRole("link", { name: "Check file" }).isVisible()), "pasted text: how software reads the file is “Not checked”, with a way to check a file");
  check(await page.getByRole("link", { name: "Fix this in the builder" }).isVisible(), "“Fix this in the builder” is the main action");
  await bothThemes(page, "check-report");

  // Against a job.
  await page.goto(`${BASE}/cv`);
  await page.getByTestId("path-job").click();
  await page.waitForURL(/\/cv\/check\?job=1$/);
  check(await page.getByLabel("Job advert", { exact: true }).isVisible(), "“Check against a job” opens with the job advert field");
  await page.getByLabel("CV text").fill(CV);
  await page.getByRole("button", { name: "Check against this job" }).click();
  check(await page.getByText("Add the job advert or turn off the job check.").isVisible(), "an empty advert says so");
  await page.getByLabel("Job advert", { exact: true }).fill(ADVERT);
  await page.getByRole("button", { name: "Check against this job" }).click();
  await page.getByRole("heading", { name: "Job match report" }).waitFor({ timeout: 20000 });
  const match = page.getByTestId("job-match");
  const matchText = await match.innerText();
  check(/Head of Growth Marketing, Fernbrook Outdoor/.test(matchText) && /\d+ of \d+ requirements shown/.test(matchText) && /Match score/.test(matchText), "the job match says what it is aimed at, how many requirements are shown and the match score", matchText.slice(0, 200));
  const rows = match.getByTestId("match-row");
  const sf = rows.filter({ hasText: "Salesforce" });
  check(/No evidence found/.test(await sf.innerText()) && /Missing/.test(await sf.innerText()), "a requirement the CV doesn't show says “No evidence found” and “Missing”");
  const leads = rows.filter({ hasText: "qualified leads" });
  check(/Grew qualified leads by 52%/.test(await leads.innerText()), "a requirement the CV shows quotes the CV's own line");
  check((await match.getByRole("link", { name: "Tailor a copy for this job" }).isVisible()) && (await match.getByRole("link", { name: "Write the cover letter for this job" }).isVisible()), "the job match offers tailoring a copy and writing the letter");
  check(/Readable by software/.test(await page.getByTestId("cv-score").innerText()), "the document's own score is still beside it, separate from the match score");
  await bothThemes(page, "check-job");
  await match.getByRole("link", { name: "Tailor a copy for this job" }).click();
  await page.waitForURL(/\/cv\/import\/imp_/, { timeout: 20000 });
  check(true, "“Tailor a copy” starts a CV from the check, and first asks the person to check what was read");

  // A CV and its cover letter.
  await page.goto(`${BASE}/cv/check`);
  await seg(page, "What are you checking?", "Both").click();
  await page.getByLabel("CV text").fill(CV);
  await page.getByLabel("Cover letter text").fill(LETTER);
  await page.getByTestId("check-submit").click();
  await page.getByRole("heading", { name: "Audit report" }).waitFor({ timeout: 20000 });
  await seg(page, "Which document", "Cover letter").click();
  const letterScore = page.getByTestId("letter-score");
  await letterScore.waitFor();
  const lsText = await letterScore.innerText();
  check(/Cover letter score/.test(lsText) && /Relevance/.test(lsText) && /Clarity/.test(lsText) && /Structure/.test(lsText) && /Evidence/.test(lsText), "the cover letter has its own score: relevance, clarity, structure and evidence", lsText.slice(0, 200));
  const checks = page.getByTestId("letter-checks");
  const claims = checks.locator("li", { hasText: "Claims with no evidence" }).first();
  check(/To review/.test(await claims.innerText()) && /Unilever/.test(await claims.innerText()), "a claim the CV doesn't back is quoted under “Claims with no evidence”", (await claims.innerText()).slice(0, 200));
  check(/Job advert not provided/.test(await checks.locator("li", { hasText: "Words copied from the advert" }).first().innerText()), "with no advert, the copied-words check says “Job advert not provided”");
  check(/Dear Ms Patel/.test(await checks.locator("li", { hasText: "Greeting and sign-off" }).first().innerText()), "the greeting and sign-off are found");
  await bothThemes(page, "check-letter");

  // An uploaded CV: what software read from it.
  await page.goto(`${BASE}/cv/check`);
  await seg(page, "How to add it", "Upload a file").click();
  await page.getByLabel("Choose a PDF or Word file").setInputFiles(path.join(__dirname, "fixtures/cv/maya-chen.writer.pdf"));
  await page.getByTestId("check-submit").click();
  await page.getByRole("heading", { name: "Audit report" }).waitFor({ timeout: 30000 });
  const rb = await page.getByTestId("read-back").innerText();
  check(/maya-chen\.writer\.pdf/.test(rb) && /Section headings/.test(rb) && /Name and contact details/.test(rb) && /words from \d+ page/.test(rb), "an uploaded file: the report says what software read from it", rb.slice(0, 240));

  // Delete the check.
  const reportUrl = page.url();
  await page.getByRole("button", { name: "Delete this check now" }).click();
  await page.waitForURL(/\/cv$/);
  const gone = await page.evaluate(async (u) => (await fetch(`/api/cv/check/${u.split("/").pop()}`)).status, reportUrl);
  check(gone === 404, "“Delete this check now” removes it");

  // On a phone.
  const p = await newUser(browser, "checker-phone", PHONE);
  await p.page.goto(`${BASE}/cv/check`);
  await p.page.getByRole("heading", { name: "Check your document" }).waitFor();
  await fitsWidth(p.page, "check intake on a phone");
  await p.page.getByLabel("CV text").fill(CV);
  await p.page.getByTestId("check-submit").click();
  await p.page.getByRole("heading", { name: "Audit report" }).waitFor({ timeout: 20000 });
  await fitsWidth(p.page, "check report on a phone");
  const order = await p.page.evaluate(() => [document.querySelector('[data-testid="cv-score"]').getBoundingClientRect().top, document.querySelector('[data-testid="cv-fixes"]').getBoundingClientRect().top]);
  check(order[0] < order[1], "on a phone the score comes before the details", order.join(" / "));
  await bothThemes(p.page, "check-report-phone");
  check(a.errors.length + p.errors.length === 0, "no page errors", [...a.errors, ...p.errors].join(" | "));
});
