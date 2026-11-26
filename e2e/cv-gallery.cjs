// The public template galleries: every template by number with a preview drawn by the renderer, filters and search,
// a page for each template, the UK (CV) and US (resume) wording, and "Use this template" carrying the design into a
// new CV, through sign-in when needed.
const path = require("node:path");
const { BASE, OUT, PHONE, check, newUser, a11y, fitsWidth, run } = require("./cv-helpers.cjs");

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
  check(labels.length === 45 && labels[0] === "No. 01 · Hallmark" && labels[44] === "No. 45 · Palette", "the CV gallery lists all 45 templates by number", `${labels.length}: ${labels.slice(0, 2).join(", ")}`);
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
  check((await cards(page).count()) === 1 && (await cards(page).first().innerText()).includes("No. 07 · Harbour"), "searching by number finds that template");
  await page.getByLabel("Search templates by name, number or style").fill("serif");
  check((await cards(page).count()) > 3, "searching by style finds the templates with it");
  await page.getByLabel("Search templates by name, number or style").fill("zzzz");
  await page.getByText("No template matches that.").waitFor();
  check(true, "a search that finds nothing says so");

  // One template's page.
  await page.getByLabel("Search templates by name, number or style").fill("harbour");
  await cards(page).first().click();
  await page.waitForURL(/\/cv-templates\/07-harbour$/);
  await page.getByRole("heading", { level: 1, name: "No. 07 · Harbour CV template" }).waitFor();
  check((await page.title()).startsWith("No. 07 · Harbour CV template"), "the template's page has its own title", await page.title());
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
  await page.goto(`${BASE}/resume-templates/07-harbour`);
  text = await page.locator("main").innerText();
  check(/No\. 07 · Harbour resume template/.test(text) && /US Letter/.test(text) && !/colour|centred/i.test(text), "the resume template page says resume, US Letter and color");
  await a11y(page, "Resume template page");

  // An address that is not a template is not found.
  const missing = await page.goto(`${BASE}/cv-templates/99-nothing`);
  check(missing.status() === 404, "an unknown template address is not found", String(missing.status()));

  // The sitemap lists the galleries and each template's page.
  const map = await (await page.request.get(`${BASE}/sitemap.xml`)).text();
  check(map.includes("/cv-templates/07-harbour") && map.includes("/resume-templates/45-palette"), "the sitemap lists every template page");

  // On a phone.
  const phone = await browser.newContext({ ...PHONE });
  const small = await phone.newPage();
  await small.goto(`${BASE}/cv-templates`);
  await small.getByRole("heading", { level: 1, name: "CV templates" }).waitFor();
  await fitsWidth(small, "CV gallery on a phone");
  await small.screenshot({ path: path.join(OUT, "cv-gallery-phone.png") });
  await small.goto(`${BASE}/cv-templates/28-first-light`);
  await fitsWidth(small, "template page on a phone");
  await phone.close();
  check(errors.length === 0, "no errors on the public pages", errors.join(" | "));
  await visitor.close();

  // Signed in: the chosen design is shown on the form and the new CV starts in it.
  const a = await newUser(browser, "gallery");
  await a.page.goto(`${BASE}/cv/new?template=harbour`);
  await a.page.getByText("Design: No. 07 · Harbour").waitFor();
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
  check((await a.page.getByText("Design: No. 07 · Harbour").count()) === 0, "the chosen design can be dropped");
  await a.page.getByLabel("CV name").fill("Gallery test two");
  await a.page.getByText("Experienced", { exact: true }).click();
  await a.page.getByText("UK", { exact: true }).click();
  await a.page.getByRole("button", { name: "Create CV" }).click();
  await a.page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/edit\/contact/, { timeout: 30000 });
  const id2 = a.page.url().match(/cv_[a-f0-9]+/)[0];
  cv = await a.page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id2);
  check(cv.design.template === "standard", "without it, the CV starts in the usual design", cv.design.template);
  check(a.errors.length === 0, "no errors on the CV screens", a.errors.join(" | "));
});
