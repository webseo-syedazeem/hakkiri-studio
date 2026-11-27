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
async function newUser(browser, label, { firstVisit = false, ...opts } = {}) {
  // Limits are counted per address. The test server trusts the forwarded address (HAKKIRI_TRUST_PROXY=1),
  // so each test account gets its own, as each real person has.
  const from = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${1 + Math.floor(Math.random() * 250)}`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, extraHTTPHeaders: { "x-forwarded-for": from }, ...opts });
  // The app's "best on desktop" notice is dismissed, as a person would on first visit.
  await context.addInitScript(() => sessionStorage.setItem("dismiss_phone_notice", "1"));
  // The one-time appearance choice is made (dark, the default), as a person would on first sign-in; `firstVisit` keeps it, to test it.
  if (!firstVisit)
    await context.addInitScript(() => {
      try {
        if (localStorage.getItem("hk_theme") === null) localStorage.setItem("hk_theme", "dark");
      } catch {}
    });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
  const res = await page.request.post(`${BASE}/api/auth/signup`, { data: { email, password: "Password123!", name: label } });
  if (!res.ok()) throw new Error(`Sign-up failed for ${label}: ${res.status()} ${await res.text()}`);
  return { context, page, email, errors };
}

const LEVELS = { "Student or graduate": "student", "Early career": "early", Experienced: "experienced", Senior: "senior" };
const TYPES = { ".pdf": "application/pdf", ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".doc": "application/msword" };

/**
 * Starts a CV with known answers, as an API call: the start screen asks nothing (cv-start.cjs tests that screen),
 * so the other suites set the name, the level and UK or US here. A file or pasted text is read as an upload and
 * the page opens on it, as after an upload on the start screen.
 */
async function setUp(page, { name = "Test CV", level = "Experienced", region = "UK", file, paste } = {}) {
  if (!/^https?:/.test(page.url()) || !page.url().startsWith(BASE)) await page.goto(`${BASE}/cv`);
  const setup = { name, level: LEVELS[level] ?? level, region: region.toLowerCase() };
  if (file || paste) {
    const bytes = file ? fs.readFileSync(path.join(FIXTURES, file)).toString("base64") : null;
    const made = await page.evaluate(
      async ({ setup, bytes, fileName, type, paste }) => {
        const form = new FormData();
        for (const [k, v] of Object.entries(setup)) form.set(k, v);
        if (bytes) form.set("file", new File([Uint8Array.from(atob(bytes), (c) => c.charCodeAt(0))], fileName, { type }));
        else form.set("text", paste);
        const r = await fetch("/api/cv/imports", { method: "POST", body: form });
        return { status: r.status, body: await r.json() };
      },
      { setup, bytes, fileName: file ?? "", type: file ? (TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream") : "", paste: paste ?? "" },
    );
    if (made.status !== 201) throw new Error(`setUp: upload refused (${made.status}): ${JSON.stringify(made.body)}`);
    await page.goto(`${BASE}/cv/import/${made.body.importId}`);
    return;
  }
  const made = await page.evaluate(async (setup) => {
    const r = await fetch("/api/cv/versions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(setup) });
    return { status: r.status, body: await r.json() };
  }, setup);
  if (made.status !== 201) throw new Error(`setUp: create refused (${made.status}): ${JSON.stringify(made.body)}`);
  await page.goto(`${BASE}/cv/v/${made.body.id}/edit/contact`);
}

/** Switches the page to the app's light surface (the same tokens the public pages use), or back to dark. */
async function theme(page, mode) {
  // As the Appearance switch does it: the class, the "dark" class and data-theme together.
  await page.evaluate((light) => {
    const h = document.documentElement;
    h.classList.toggle("mk", light);
    h.classList.toggle("dark", !light);
    h.dataset.theme = light ? "light" : "dark";
  }, mode === "light");
  await page.waitForTimeout(120);
}

/** Accessibility (axe, WCAG 2.1 AA, colour contrast included) on the CV screen that is showing. */
async function a11y(page, label) {
  if (!(await page.evaluate(() => typeof window.axe !== "undefined"))) await page.addScriptTag({ content: AXE });
  const found = await page.evaluate(async () => {
    // What a person sees: once a dialog has opened and a theme change has faded in, not part-way through.
    await Promise.race([Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))), new Promise((r) => setTimeout(r, 1500))]);
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
