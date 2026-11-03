// Accessibility (axe, WCAG 2.1 AA) on the main pages. Usage: BASE=... node e2e/a11y-page.cjs [/path ...]
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.env.BASE || "http://127.0.0.1:3100";
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{ name: "hk_welcomed", value: "1", url: BASE }, { name: "hk_mic_ok", value: "1", url: BASE }]);
  const p = await ctx.newPage();
  const PAGES = process.argv.length > 2 ? process.argv.slice(2) : ["/", "/interviews", "/interviews/new", "/presentations", "/presentations/new", "/story-bank", "/settings", "/landing", "/present", "/privacy", "/terms"];
  let failed = 0;
  for (const u of PAGES) {
    await p.goto(BASE + u, { waitUntil: "networkidle" });
    await p.waitForTimeout(900);
    await p.addScriptTag({ content: AXE });
    const r = await p.evaluate(async () => (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "best-practice"] } })).violations.map((v) => v.id + ": " + v.nodes.map((n) => n.html.slice(0, 150) + " -> " + (n.any[0] || {}).message?.slice(0, 120)).join("\n   ")));
    console.log(u, r.length ? "\n  " + r.join("\n  ") : " clean");
    failed += r.length;
  }
  await b.close();
  process.exit(failed ? 1 : 0);
})();
