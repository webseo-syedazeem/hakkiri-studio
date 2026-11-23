// Shared helpers for the CV browser tests: fresh accounts, checks and a plain pass/fail log.
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.env.BASE || "http://127.0.0.1:3179";
const OUT = path.join(__dirname, "out");
fs.mkdirSync(OUT, { recursive: true });

let failures = 0;
function check(ok, label, detail = "") {
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${label}${!ok && detail ? `\n        ${detail}` : ""}`);
  if (!ok) failures++;
}

/** Words that must never appear in the CV section: a competitor's name, the old sample person, invented or unsupported claims. */
const FORBIDDEN = [/rezi/i, /bloomberg/i, /spearheaded/i, /tested parsers/i, /workday/i, /greenhouse/i, /\bverified\b/i, /100% ats/i];
async function noForbidden(page, where) {
  const text = await page.locator("body").innerText();
  const hits = FORBIDDEN.filter((re) => re.test(text)).map(String);
  check(hits.length === 0, `${where}: no sample names or unsupported claims`, hits.join(", "));
}

/** A brand-new account, signed in, in its own browser context (so cookies never mix). */
async function newUser(browser, label) {
  const context = await browser.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const email = `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
  const res = await page.request.post(`${BASE}/api/auth/signup`, { data: { email, password: "Password123!", name: label } });
  if (!res.ok()) throw new Error(`Sign-up failed for ${label}: ${res.status()} ${await res.text()}`);
  return { context, page, email, errors };
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

module.exports = { BASE, OUT, check, noForbidden, newUser, run };
