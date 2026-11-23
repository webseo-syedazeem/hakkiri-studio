// Shared helpers for the CV browser tests: fresh accounts, checks, both themes, accessibility and a plain pass/fail log.
const { chromium, devices } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.env.BASE || "http://127.0.0.1:3179";
const OUT = path.join(__dirname, "out");
const FIXTURES = path.join(__dirname, "fixtures", "cv");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
function check(ok, label, detail = "") {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${label}${!ok && detail ? `\n        ${detail}` : ""}`);
  if (!ok) failures++;
}

/** Words that must never appear in the CV section: a competitor's name, the old sample people, invented or unsupported claims. */
const FORBIDDEN = [/rezi/i, /bloomberg/i, /spearheaded/i, /tested parsers/i, /workday/i, /greenhouse/i, /\bverified\b/i, /100% ats/i, /fintech scaleup/i, /alex morgan/i];
async function noForbidden(page, where) {
  const text = await page.locator("body").innerText();
  const hits = FORBIDDEN.filter((re) => re.test(text)).map(String);
  check(hits.length === 0, `${where}: no sample names or unsupported claims`, hits.join(", "));
}

/** A brand-new account, signed in, in its own browser context (so cookies never mix). */
async function newUser(browser, label, opts = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...opts });
  // The app's "best on desktop" notice is dismissed, as a person would on first visit.
  await context.addInitScript(() => sessionStorage.setItem("dismiss_phone_notice", "1"));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
  // Sign-ups are limited per address. The test server trusts the forwarded address (HAKKIRI_TRUST_PROXY=1),
  // so each test account signs up from its own.
  const from = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${1 + Math.floor(Math.random() * 250)}`;
  const res = await page.request.post(`${BASE}/api/auth/signup`, { data: { email, password: "Password123!", name: label }, headers: { "x-forwarded-for": from } });
  if (!res.ok()) throw new Error(`Sign-up failed for ${label}: ${res.status()} ${await res.text()}`);
  return { context, page, email, errors };
}

/** Fills in the set-up form. `method` is "empty", or a file name from the fixtures to upload. */
async function setUp(page, { name = "Test CV", level = "Experienced", region = "UK", file, paste } = {}) {
  await page.goto(`${BASE}/cv/new`);
  await page.getByLabel("CV name").fill(name);
  await page.getByText(level, { exact: true }).click();
  await page.getByText(region, { exact: true }).click();
  if (file || paste) await page.getByText("Upload a CV", { exact: true }).click();
  if (file) {
    await page.getByLabel("CV file").setInputFiles(path.join(FIXTURES, file));
    await page.waitForURL(/\/cv\/import\/imp_/, { timeout: 45000 });
  } else if (paste) {
    await page.getByRole("button", { name: "Paste the text instead" }).click();
    await page.getByLabel("The text of your CV").fill(paste);
    await page.getByRole("button", { name: "Read this text" }).click();
    await page.waitForURL(/\/cv\/import\/imp_/, { timeout: 45000 });
  } else {
    await page.getByRole("button", { name: "Create CV" }).click();
    await page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/edit\/contact/, { timeout: 30000 });
  }
}

/** Switches the page to the app's light surface (the same tokens the public pages use), or back to dark. */
async function theme(page, mode) {
  await page.evaluate((light) => document.documentElement.classList.toggle("mk", light), mode === "light");
  await page.waitForTimeout(120);
}

/** Accessibility (axe, WCAG 2.1 AA, colour contrast included) on the CV screen that is showing. */
async function a11y(page, label) {
  if (!(await page.evaluate(() => typeof window.axe !== "undefined"))) await page.addScriptTag({ content: AXE });
  const found = await page.evaluate(async () => {
    const root = document.querySelector("main") || document;
    const r = await window.axe.run(root, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
    return r.violations.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => `${n.html.slice(0, 110)} → ${((n.any[0] || n.all[0] || {}).message || "").slice(0, 130)}`).join(" ¦ ")}`);
  });
  check(found.length === 0, `${label}: no accessibility problems (axe, WCAG 2.1 AA)`, found.join("\n        "));
}

/** A screenshot of the screen in the dark and the light theme, with an accessibility pass on each. */
async function bothThemes(page, name) {
  for (const mode of ["dark", "light"]) {
    await theme(page, mode);
    await page.screenshot({ path: path.join(OUT, `cv-${name}-${mode}.png`), fullPage: true });
    await a11y(page, `${name} (${mode})`);
  }
  await theme(page, "dark");
}

/** Nothing on the page is wider than the screen (no sideways scrolling on a phone). */
async function fitsWidth(page, label) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(over <= 1, `${label}: fits the width of the screen`, `${over}px too wide`);
}

async function run(name, fn) {
  const browser = await chromium.launch();
  try {
    await fn(browser);
  } catch (e) {
    check(false, `${name} crashed`, e && e.stack ? e.stack : String(e));
  } finally {
    await browser.close();
  }
  console.log(failures ? `\n${failures} check(s) failed.` : `\nAll ${name} checks passed.`);
  process.exit(failures ? 1 : 0);
}

const PHONE = { ...devices["iPhone 13"] };

module.exports = { BASE, OUT, FIXTURES, PHONE, check, noForbidden, newUser, setUp, theme, a11y, bothThemes, fitsWidth, run };
