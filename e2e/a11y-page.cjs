// Accessibility (axe, WCAG 2.1 AA) on the main pages: the public ones as a visitor sees them, then the
// app's own pages as a signed-in user. Usage: BASE=... node e2e/a11y-page.cjs [/path ...]
// (paths given by hand are opened signed in).
const { chromium } = require("playwright");
const fs = require("fs");
const { BASE, signIn, setUpInterview } = require("./helpers.cjs");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const PUBLIC = ["/", "/present", "/about", "/blog", "/privacy", "/terms", "/login", "/signup"];
const SIGNED_IN = ["/dashboard", "/interviews", "/interviews/new", "/practice", "/presentations", "/presentations/new", "/cv", "/interview-examples", "/settings"];

let failed = 0;

async function scan(p, u) {
  await p.goto(BASE + u, { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  // A page that sends you somewhere else was never checked: say so rather than scan the wrong page.
  const landed = new URL(p.url()).pathname;
  if (landed !== u.split(/[?#]/)[0]) {
    console.log(u, `\n  not checked: it led to ${landed}`);
    failed++;
    return;
  }
  await p.addScriptTag({ content: AXE });
  const r = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] } })).violations.map((v) => v.id + ": " + v.nodes.map((n) => n.html.slice(0, 150) + " -> " + (n.any[0] || {}).message?.slice(0, 120)).join("\n   ")));
  console.log(u, r.length ? "\n  " + r.join("\n  ") : " clean");
  failed += r.length;
}

(async () => {
  const b = await chromium.launch();
  const given = process.argv.slice(2);

  if (!given.length) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    for (const u of PUBLIC) await scan(p, u);
    await ctx.close();
  }

  const { page } = await signIn(b, "a11y");
  if (given.length) {
    for (const u of given) await scan(page, u);
  } else {
    // A new account has no interview of its own, so one is set up to check its page.
    const id = await setUpInterview(page);
    for (const u of [...SIGNED_IN, `/interviews/${id}`]) await scan(page, u);
  }

  await b.close();
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
