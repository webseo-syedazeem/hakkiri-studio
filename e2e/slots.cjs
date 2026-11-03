// Skipping the opening and the closing: one tap, no reason menu, no replacement; the report says so.
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:3100";
const S = __dirname, OUT = `${__dirname}/out`; require("fs").mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["microphone"] });
  await ctx.addCookies([{ name: "hk_welcomed", value: "1", url: BASE }, { name: "hk_mic_ok", value: "1", url: BASE }]);
  await ctx.addInitScript(() => { try { Object.defineProperty(window, "speechSynthesis", { value: undefined }); } catch {} });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const out = { seen: [] };
  await p.goto(`${BASE}/interviews/halden#new-questions`, { waitUntil: "networkidle" });
  await p.locator("#new-questions").getByRole("button", { name: "Customise" }).click();
  await p.locator("#new-questions").getByRole("radio", { name: "Easy" }).check({ force: true });
  await p.locator("#new-questions").getByRole("radio", { name: "20 min" }).check({ force: true });
  await p.getByRole("button", { name: "Start with new questions" }).click();
  await p.waitForURL(/session=/, { timeout: 60000 });
  await p.getByRole("button", { name: "Start interview" }).click();
  for (let n = 0; n < 80 && !/\/mocks\//.test(p.url()); n++) {
    const sa = p.getByRole("button", { name: "Start answering" });
    if (!(await sa.waitFor({ timeout: 1500 }).then(() => true, () => false))) continue;
    const h1 = await p.locator("h1").innerText();
    const isFollowUp = await p.getByText(/^Follow-up \d of \d$/).isVisible();
    out.seen.push(`${isFollowUp ? "f" : "q"}: ${h1.slice(0, 60)}`);
    if (!isFollowUp && (/^Tell me about yourself/.test(h1) || /questions do you have for us/.test(h1))) {
      await p.getByRole("button", { name: "Skip" }).click();
      await sleep(300);
      out.seen.push(`  skipped; menu shown: ${await p.getByRole("menu").isVisible().catch(() => false)}`);
      continue;
    }
    await sa.click({ timeout: 2500 }).catch(() => {});
    const fin = p.getByRole("button", { name: "Finish answer" });
    await fin.waitFor({ timeout: 20000 });
    await sleep(3600);
    await fin.click();
  }
  await p.waitForURL(/\/mocks\//, { timeout: 60000 });
  await sleep(1000);
  await p.screenshot({ path: `${OUT}/30-slots-report.png`, fullPage: true });
  const main = await p.locator("main").innerText();
  out.skipLine = main.split("\n").filter((l) => /You skipped|replaced|It’s still in your next/.test(l));
  out.firstRow = main.split("Question by question")[1]?.slice(0, 200);
  out.errors = errors;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
