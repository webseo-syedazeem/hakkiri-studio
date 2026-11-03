// Accessibility pass: crawl the app's pages and run axe-core (WCAG 2.1 A/AA) on each.
// Usage: BASE=http://127.0.0.1:3100 node a11y.cjs > report.json
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BASE || "http://127.0.0.1:3100";
const MAX = Number(process.env.MAX || 60);
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const START = ["/", "/interviews", "/interviews/new", "/presentations", "/presentations/new", "/story-bank", "/settings", "/mic-check", "/welcome", "/landing", "/privacy", "/terms", ...(process.env.EXTRA || "").split(",").filter(Boolean)];

const pattern = (p) => p.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/g, ":id").replace(/\?.*$/, "");

(async () => {
  const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["microphone"] });
  await ctx.addCookies([{ name: "hk_welcomed", value: "1", url: BASE }, { name: "hk_mic_ok", value: "1", url: BASE }]);
  await ctx.addInitScript(() => {
    try {
      Object.defineProperty(window, "speechSynthesis", { value: undefined });
    } catch {}
  });
  const page = await ctx.newPage();
  const queue = [...START];
  const seen = new Set();
  const results = [];
  while (queue.length && results.length < MAX) {
    const url = queue.shift();
    const key = pattern(url);
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 30000 });
    } catch (e) {
      results.push({ url, error: String(e).slice(0, 200) });
      continue;
    }
    await page.waitForTimeout(900); // let rise animations settle (they change colours mid-way)
    if (!/^\/(mock|rehearse|qa)\//.test(url)) {
      const links = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")));
      for (const l of links) if (!l.startsWith("/api/") && !seen.has(pattern(l.split("#")[0]))) queue.push(l.split("#")[0]);
    }
    await page.addScriptTag({ content: AXE });
    const r = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const res = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] }, resultTypes: ["violations"] });
      return res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => ({ target: n.target.join(" "), html: n.html.slice(0, 160), why: (n.any[0] || n.all[0] || n.none[0] || {}).message })) }));
    });
    results.push({ url, violations: r });
    process.stderr.write(`${url}: ${r.length} rules\n`);
  }
  await browser.close();
  // Summary by rule.
  const byRule = {};
  for (const p of results) for (const v of p.violations || []) {
    const e = (byRule[v.id] ??= { id: v.id, impact: v.impact, help: v.help, pages: [], count: 0, samples: [] });
    e.pages.push(p.url);
    e.count += v.nodes.length;
    for (const n of v.nodes) if (e.samples.length < 6 && !e.samples.some((s) => s.html === n.html)) e.samples.push({ page: p.url, ...n });
  }
  console.log(JSON.stringify({ pages: results.length, byRule: Object.values(byRule).sort((a, b) => b.count - a.count), errors: results.filter((r) => r.error) }, null, 2));
})();
