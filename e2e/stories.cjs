const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:3100";
const S = __dirname, OUT = `${__dirname}/out`; require("fs").mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const out = {};
  for (const [w, h] of [[1440, 900], [1366, 768]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, permissions: ["microphone"] });
    await ctx.addCookies([{ name: "hk_welcomed", value: "1", url: BASE }, { name: "hk_mic_ok", value: "1", url: BASE }]);
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", (e) => errors.push(String(e)));
    p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await p.goto(`${BASE}/story-bank`, { waitUntil: "networkidle" });
    await sleep(800);
    await p.screenshot({ path: `${OUT}/50-bank-${w}.png`, fullPage: true });
    out[`overflow${w}`] = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (w === 1440) {
      out.header = (await p.locator("header").innerText()).replace(/\n+/g, " | ");
      // Fill in the gaps on "Moving from design into product".
      const card = p.locator('section[aria-label="Moving from design into product"]');
      await card.getByRole("button", { name: "Fill in the gaps" }).click();
      await card.locator("textarea").first().fill("I asked to own the checkout numbers and ran the first experiments myself.");
      await card.locator("textarea").nth(1).fill("Checkout conversion grew 17% in a year, and I moved into product full time.");
      await p.screenshot({ path: `${OUT}/51-bank-fill.png`, fullPage: true });
      await card.getByRole("button", { name: "Save story" }).click();
      await card.getByRole("button", { name: "Improve it" }).waitFor({ timeout: 15000 });
      out.afterFill = (await card.innerText()).replace(/\n+/g, " | ").slice(0, 400);
      // Build one for an uncovered kind of question.
      const cover = p.locator('section[aria-label="What your stories cover"]');
      out.coverBefore = (await cover.innerText()).replace(/\n+/g, " | ");
      await cover.getByRole("link", { name: "Build one" }).first().click();
      await p.waitForURL(/\/story\?/);
      out.storyPage = (await p.locator("header").innerText()).replace(/\n+/g, " | ");
      await p.fill("#story-situation", "Our biggest client's renewal was due in a week and their payments kept failing.");
      await p.fill("#story-task", "I had to fix the failures before the renewal meeting.");
      await p.fill("#story-action", "I set up a daily call with their finance team, found the bad card rule and shipped a fix in three days.");
      await p.fill("#story-result", "They renewed for two years and failed payments dropped to almost zero.");
      await p.getByRole("button", { name: "Draft my story" }).click();
      await p.getByText("Saved to your stories and your prep sheet").waitFor({ timeout: 20000 });
      await p.getByRole("link", { name: "Later" }).click();
      await p.waitForURL(/\/story-bank$/);
      await sleep(600);
      out.coverAfter = (await p.locator('section[aria-label="What your stories cover"]').innerText()).replace(/\n+/g, " | ");
      out.count = (await p.locator("header").innerText()).replace(/\n+/g, " | ");
      // Practise a story.
      await p.locator('section[aria-label="Pausing onboarding to fix payments"]').getByRole("link", { name: "Practise it" }).click();
      await p.waitForURL(/\/mock\//);
      out.practise = (await p.locator("h1").innerText()).slice(0, 80);
    }
    out[`errors${w}`] = errors;
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
