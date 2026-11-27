// The CV section of the home page (DESIGN-SPEC-v3 §06) and the one-time appearance choice on first sign-in (§07).
const { BASE, PHONE, check, newUser, fitsWidth, run } = require("./cv-helpers.cjs");
const fs = require("node:fs");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

/** Accessibility of one part of a page only: the rest of the home page is not part of this change. */
async function a11yOf(page, selector, label) {
  await page.addScriptTag({ content: AXE });
  const found = await page.evaluate(async (sel) => {
    const r = await window.axe.run(sel, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
    return r.violations.map((v) => `${v.id}: ${v.nodes.length}`);
  }, selector);
  check(found.length === 0, `${label}: no accessibility problems (axe, WCAG 2.1 AA)`, found.join(" | "));
}

run("CV home section and first sign-in", async (browser) => {
  /* ------------------------------------------------------------ the home page, signed out */
  const visitor = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const v = await visitor.newPage();
  const errors = [];
  v.on("pageerror", (e) => errors.push(String(e)));
  await v.goto(`${BASE}/`);
  const section = v.locator("section#cvs");
  await section.waitFor({ timeout: 20000 });
  const text = await section.innerText();
  check(/CVs & cover letters · Free beta/i.test(text) && (await section.getByRole("heading", { level: 2, name: "Build a CV you can stand behind." }).isVisible()), "the home page has the CV section, with its heading");
  check(/Build and check your CV and cover letter, free\. Then prepare for the interview your CV gets you\./.test(text), "it says what it is in one line");
  for (const p of ["Your words. Nothing invented.", "See what applicant software actually reads.", "Every download checked word for word.", "Practise the questions your CV will get."]) check(text.includes(p), `it says “${p}”`);
  check((await v.getByTestId("home-build-cv").getAttribute("href")) === "/cv/new" && (await v.getByTestId("home-check-cv").getAttribute("href")) === "/cv-audit", "Build my CV free starts a CV; Check my CV opens the free check");
  check(/Free CV check · No sign-up needed\./.test(text), "the free check needs no sign-up, and it says so");
  check(/01 · Build or upload/.test(text) && /02 · Check/.test(text) && /03 · Practise/.test(text), "three steps: Build or upload, Check, Practise");
  check(/Sample CV and check/i.test(text) && /Sample score/.test(text) && /Sample file check/.test(text), "the page, score and software check beside it are labelled as a sample");
  check(!/£|\$\d|per month|pricing|guarantee|100%/i.test(text), "no prices, plans or guarantees");
  const order = await v.locator("main section, body > div section").evaluateAll((els) => els.map((e) => e.id || e.getAttribute("aria-labelledby") || ""));
  check(order.indexOf("cvs") > 0, "it comes after the interview hero, which stays first", order.slice(0, 4).join(", "));
  check((await v.getByRole("link", { name: "CVs", exact: true }).first().getAttribute("href")) === "/#cvs", "CVs in the top navigation is a shortcut to this section");
  await a11yOf(v, "#cvs", "CV section");
  await section.screenshot({ path: require("node:path").join(require("./cv-helpers.cjs").OUT, "home-cv-section.png") });
  await v.getByTestId("home-build-cv").click();
  await v.waitForURL(/\/login|\/signup/, { timeout: 20000 });
  check(decodeURIComponent(v.url()).includes("/cv/new"), "signed out, Build my CV free goes through sign-in and keeps where it was going", v.url());
  const phone = await browser.newContext({ ...PHONE });
  const ph = await phone.newPage();
  await ph.goto(`${BASE}/#cvs`);
  await ph.locator("section#cvs").waitFor();
  await fitsWidth(ph, "home page CV section on a phone");
  const buttons = await ph.locator("section#cvs a[data-testid^=home-]").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  const sectionWidth = await ph.locator("section#cvs > div").evaluate((e) => e.clientWidth);
  check(buttons.length === 2 && buttons.every((w) => w >= sectionWidth - 40), "on a phone the two buttons are full width", `${buttons.join(", ")} of ${sectionWidth}`);
  await ph.locator("section#cvs").screenshot({ path: require("node:path").join(require("./cv-helpers.cjs").OUT, "home-cv-section-phone.png") });

  /* ------------------------------------------------------------ first sign-in: the appearance choice */
  const a = await newUser(browser, "first-light", { firstVisit: true });
  await a.page.goto(`${BASE}/cv`);
  const card = a.page.getByTestId("first-theme");
  await card.waitFor({ timeout: 15000 });
  const said = await card.innerText();
  check(/Welcome to Hakkiri/.test(said) && /Choose how your workspace looks\./.test(said) && /Hakkiri opens in dark\. Switch to light any time under Appearance\./.test(said) && /You can change this preference any time\./.test(said), "on first sign-in: Welcome to Hakkiri, and that it opens in dark, with a choice", said.replace(/\n/g, " / "));
  check((await a.page.evaluate(() => document.documentElement.dataset.theme)) === "dark", "nothing is chosen for her: the workspace is in dark until she picks");
  await a11yOf(a.page, '[data-testid="first-theme"]', "first sign-in choice (dark)");
  await card.getByRole("button", { name: "Use light" }).click();
  await card.waitFor({ state: "hidden" });
  check((await a.page.evaluate(() => [document.documentElement.dataset.theme, document.documentElement.classList.contains("mk"), localStorage.getItem("hk_theme")].join(","))) === "light,true,light", "Use light applies light at once and saves it");
  await a.page.reload();
  await a.page.getByRole("heading", { level: 1 }).first().waitFor();
  check((await card.count()) === 0 && (await a.page.evaluate(() => document.documentElement.dataset.theme)) === "light", "it is not asked again, and light stays");

  const b = await newUser(browser, "first-dark", { firstVisit: true, ...PHONE });
  await b.page.goto(`${BASE}/cv`);
  const cardB = b.page.getByTestId("first-theme");
  await cardB.waitFor({ timeout: 15000 });
  await fitsWidth(b.page, "first sign-in choice on a phone");
  await cardB.getByRole("button", { name: "Keep dark" }).click();
  await cardB.waitFor({ state: "hidden" });
  await b.page.reload();
  await b.page.getByRole("heading", { level: 1 }).first().waitFor();
  check((await b.page.getByTestId("first-theme").count()) === 0 && (await b.page.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem("hk_theme")].join(","))) === "dark,dark", "Keep dark keeps dark, saves it, and it is not asked again");

  // Someone who already chose is never asked.
  const c = await newUser(browser, "chose-before");
  await c.page.goto(`${BASE}/cv`);
  await c.page.getByRole("heading", { level: 1 }).first().waitFor();
  check((await c.page.getByTestId("first-theme").count()) === 0, "someone who has already chosen is not asked");

  check(errors.length + a.errors.length + b.errors.length + c.errors.length === 0, "no page errors", [...errors, ...a.errors, ...b.errors, ...c.errors].join(" | "));
});
