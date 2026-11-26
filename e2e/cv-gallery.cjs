// The public template galleries: every template by number with a preview drawn by the renderer, filters and search,
// a page for each template, the UK (CV) and US (resume) wording, and "Use this template" carrying the design into a
// new CV, through sign-in when needed.
const path = require("node:path");
const { BASE, OUT, PHONE, check, newUser, a11y, bothThemes, fitsWidth, run } = require("./cv-helpers.cjs");

const cards = (page) => page.locator("main ul li a[href*='-templates/']");

run("Template galleries", async (browser) => {
  const visitor = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await visitor.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  // The UK gallery: all 45, in number order, each with a preview that loads.
  await page.goto(`${BASE}/cv-templates`);
  await page.getByRole("heading", { level: 1, name: "CV templates" }).waitFor();
  const labels = await page.locator("main ul li a > span.font-semibold").allInnerTexts();
  check(labels.length === 45 && labels[0] === "No. 01 · Clean Sans" && labels[44] === "No. 45 · Bold Band", "the CV gallery lists all 45 templates by number", `${labels.length}: ${labels.slice(0, 2).join(", ")}`);
  await page.locator("main img").first().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => [...document.querySelectorAll("main img")].slice(0, 3).every((i) => i.complete && i.naturalWidth > 0));
  check(true, "the preview images load");
  await page.screenshot({ path: path.join(OUT, "cv-gallery-uk.png") });
  await a11y(page, "CV gallery");
  await fitsWidth(page, "CV gallery");

  // Filters and search.
  await page.getByRole("button", { name: "Technical", exact: true }).click();
  check((await cards(page).count()) === 5 && (await page.getByRole("status").innerText()).includes("5 of 45"), "a family filter shows its five templates");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByLabel("Search templates by name, number or style").fill("07");
  check((await cards(page).count()) === 1 && (await cards(page).first().innerText()).includes("No. 07 · Header Band"), "searching by number finds that template");
  await page.getByLabel("Search templates by name, number or style").fill("serif");
  check((await cards(page).count()) > 3, "searching by style finds the templates with it");
  await page.getByLabel("Search templates by name, number or style").fill("zzzz");
  await page.getByText("No template matches that.").waitFor();
  check(true, "a search that finds nothing says so");

  // One template's page.
  await page.getByLabel("Search templates by name, number or style").fill("header band");
  await cards(page).first().click();
  await page.waitForURL(/\/cv-templates\/07-header-band$/);
  await page.getByRole("heading", { level: 1, name: "No. 07 · Header Band CV template" }).waitFor();
  check((await page.title()).startsWith("No. 07 · Header Band CV template"), "the template's page has its own title", await page.title());
  const use = page.getByRole("link", { name: "Use this template" });
  check((await use.getAttribute("href")) === "/cv/new?template=harbour", "Use this template goes to a new CV with the design chosen");
  await a11y(page, "CV template page");
  await page.screenshot({ path: path.join(OUT, "cv-gallery-detail.png"), fullPage: true });

  // Signed out, using it goes through sign-in and keeps the choice.
  await use.click();
  await page.waitForURL(/\/login|\/signin|\/sign-in/);
  check(decodeURIComponent(page.url()).includes("/cv/new?template=harbour"), "signing in first keeps the chosen template", page.url());

  // The US gallery: resume wording and US spelling throughout.
  await page.goto(`${BASE}/resume-templates`);
  await page.getByRole("heading", { level: 1, name: "Resume templates" }).waitFor();
  let text = await page.locator("main").innerText();
  check(!/colour|centred/i.test(text) && /color band/i.test(text), "the resume gallery is in US spelling", (text.match(/colour|centred/gi) || []).join(", "));
  await page.goto(`${BASE}/resume-templates/07-header-band`);
  text = await page.locator("main").innerText();
  check(/No\. 07 · Header Band resume template/.test(text) && /US Letter/.test(text) && !/colour|centred/i.test(text), "the resume template page says resume, US Letter and color");
  await a11y(page, "Resume template page");

  // The cover letter gallery: the same 45 designs, each drawn as a letter, linked to its matching CV.
  await page.goto(`${BASE}/cover-letter-templates`);
  await page.getByRole("heading", { level: 1, name: "Cover letter templates" }).waitFor();
  check((await cards(page).count()) === 45, "the cover letter gallery lists all 45 designs");
  await a11y(page, "Cover letter gallery");
  await page.goto(`${BASE}/cover-letter-templates/07-header-band`);
  await page.getByRole("heading", { level: 1, name: "No. 07 · Header Band cover letter template" }).waitFor();
  check((await page.getByRole("link", { name: "See the matching CV" }).getAttribute("href")) === "/cv-templates/07-header-band", "a letter design links to its matching CV template");
  await page.waitForFunction(() => [...document.querySelectorAll("main img")].slice(0, 1).every((i) => i.complete && i.naturalWidth > 0));
  check(true, "the letter preview loads");
  await a11y(page, "Cover letter template page");
  await page.goto(`${BASE}/cv-templates/07-header-band`);
  check((await page.getByRole("link", { name: "See the matching cover letter" }).getAttribute("href")) === "/cover-letter-templates/07-header-band", "a CV template links to its matching cover letter");

  // The example CVs with their cover letters, by industry, for the UK and the US.
  await page.goto(`${BASE}/cv-examples`);
  await page.getByRole("heading", { level: 1, name: "CV examples" }).waitFor();
  check((await page.getByRole("heading", { level: 2, name: "Marketing and advertising" }).count()) === 1, "the examples are grouped by industry");
  await a11y(page, "CV examples");
  await page.getByRole("link", { name: /Marketing Manager CV/ }).click();
  await page.waitForURL(/\/cv-examples\/marketing-lead$/);
  text = await page.locator("main").innerText();
  check(/Marketing Manager CV example/.test(text) && /Chloe Bennett/.test(text) && /Grew qualified leads by 52%/.test(text) && /Dear Ms Patel,/.test(text) && /Yours sincerely,/.test(text), "an example page shows the CV and its cover letter in full");
  check(/Words adverts use/.test(text) && /£1\.5 million/.test(text) && !/\$/.test(text), "with what employers in the industry look for, and UK money only");
  check((await page.getByRole("link", { name: "Start from this example" }).getAttribute("href")) === "/cv/examples?example=marketing-lead&region=uk", "Start from this example opens it in the app");
  await a11y(page, "CV example page");
  await page.getByRole("link", { name: "See the US resume version" }).click();
  await page.waitForURL(/\/resume-examples\/marketing-lead$/);
  text = await page.locator("main").innerText();
  check(/Marketing Manager resume example/.test(text) && /Dear Ms\. Patel,/.test(text) && /\$1\.9 million/.test(text) && !/£|programme/.test(text), "the US page is the US resume and letter");
  await a11y(page, "Resume example page");
  const noExample = await page.goto(`${BASE}/cv-examples/not-an-example`);
  check(noExample.status() === 404, "an unknown example address is not found", String(noExample.status()));

  // An address that is not a template is not found.
  const missing = await page.goto(`${BASE}/cv-templates/99-nothing`);
  check(missing.status() === 404, "an unknown template address is not found", String(missing.status()));

  // The sitemap lists the galleries and each template's page.
  const map = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
  check(map.includes("/cv-templates/07-header-band") && map.includes("/resume-templates/45-bold-band") && map.includes("/cover-letter-templates/01-clean-sans") && map.includes("/resume-examples/marketing-lead"), "the sitemap lists every template and example page");

  // On a phone.
  const phone = await browser.newContext({ ...PHONE });
  const small = await phone.newPage();
  await small.goto(`${BASE}/cv-templates`);
  await small.getByRole("heading", { level: 1, name: "CV templates" }).waitFor();
  await fitsWidth(small, "CV gallery on a phone");
  await small.screenshot({ path: path.join(OUT, "cv-gallery-phone.png") });
  await small.goto(`${BASE}/cv-templates/28-graduate-band`);
  await fitsWidth(small, "template page on a phone");
  await phone.close();
  check(errors.length === 0, "no errors on the public pages", errors.join(" | "));
  await visitor.close();

  // Signed in: the chosen design is shown on the form and the new CV starts in it.
  const a = await newUser(browser, "gallery");
  await a.page.goto(`${BASE}/cv/new?template=harbour`);
  await a.page.getByText("Design: No. 07 · Header Band").waitFor();
  check(true, "the New CV form shows the design chosen in the gallery");
  await a.page.getByLabel("CV name").fill("Gallery test");
  await a.page.getByText("Experienced", { exact: true }).click();
  await a.page.getByText("UK", { exact: true }).click();
  await a.page.getByRole("button", { name: "Create CV" }).click();
  await a.page.waitForURL(/\/cv\/v\/(cv_[a-f0-9]+)\/edit\/contact/, { timeout: 30000 });
  const id = a.page.url().match(/cv_[a-f0-9]+/)[0];
  let cv = await a.page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
  check(cv.design.template === "harbour", "the new CV starts in the chosen design", cv.design.template);

  // Dropping it gives the usual starting design.
  await a.page.goto(`${BASE}/cv/new?template=harbour`);
  await a.page.getByRole("button", { name: "Don’t use this design" }).click();
  check((await a.page.getByText("Design: No. 07 · Header Band").count()) === 0, "the chosen design can be dropped");
  await a.page.getByLabel("CV name").fill("Gallery test two");
  await a.page.getByText("Experienced", { exact: true }).click();
  await a.page.getByText("UK", { exact: true }).click();
  await a.page.getByRole("button", { name: "Create CV" }).click();
  await a.page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/edit\/contact/, { timeout: 30000 });
  const id2 = a.page.url().match(/cv_[a-f0-9]+/)[0];
  cv = await a.page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id2);
  check(cv.design.template === "standard", "without it, the CV starts in the usual design", cv.design.template);

  // A link from a public example page opens that example in the app.
  await a.page.goto(`${BASE}/cv/examples?example=staff-nurse&region=us`);
  await a.page.getByRole("dialog", { name: /Registered Nurse: example resume/ }).waitFor();
  check(true, "a link from an example page opens that example, in the region it was read in");
  await a.page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).first().click();

  // The example CVs and their cover letters, in the app.
  await a.page.goto(`${BASE}/cv/examples`);
  await a.page.getByRole("button", { name: "UK CV" }).click();
  await a.page.getByRole("button", { name: "Read the Marketing Manager example" }).click();
  const dialog = a.page.getByRole("dialog");
  await dialog.getByText("Grew qualified leads by 52%").first().waitFor();
  check(true, "an example can be read in full");
  await dialog.getByRole("button", { name: "Cover letter" }).click();
  const letterText = await dialog.getByTestId("example-letter").innerText();
  check(/Dear Ms Patel,/.test(letterText) && /Yours sincerely,/.test(letterText) && /Fernbrook Outdoor/.test(letterText), "its cover letter can be read, with a UK greeting and sign-off");
  await bothThemes(a.page, "examples-letter");
  await dialog.getByRole("button", { name: "US", exact: true }).click();
  const usText = await dialog.getByTestId("example-letter").innerText();
  check(/Dear Ms\. Patel,/.test(usText) && /Sincerely,/.test(usText) && /\$480,000/.test(usText) && !/£|programme/.test(usText), "the US version is the US letter: dollars, US spelling, US sign-off");
  await dialog.getByRole("button", { name: "Start from this, with the letter" }).click();
  await a.page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/letter/, { timeout: 30000 });
  const id3 = a.page.url().match(/cv_[a-f0-9]+/)[0];
  cv = await a.page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id3);
  check(cv.region === "us" && cv.target?.employer === "Fernbrook Outdoor" && cv.letter?.paragraphs?.length === 5, "starting from it with the letter gives a US resume with its letter and the job it is for", JSON.stringify({ region: cv.region, target: cv.target?.employer, paras: cv.letter?.paragraphs?.length }));
  await a.page.getByTestId("letter-fit").waitFor({ timeout: 30000 });
  check(true, "the letter opens on the letter screen and fits one page");
  check(a.errors.length === 0, "no errors on the CV screens", a.errors.join(" | "));
});
