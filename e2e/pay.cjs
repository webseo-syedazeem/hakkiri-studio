// The pay drill: from the interview page, four answers with checks after each, the report, the prep sheet.
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
  await p.goto(`${BASE}/interviews/halden`, { waitUntil: "networkidle" });
  const training = p.locator('section[aria-label="Your training"]');
  out.payItem = (await training.innerText()).split("\n").filter((l) => /pay|salary/i.test(l));
  await training.locator("div", { hasText: /^Talking about pay/ }).last().locator("xpath=ancestor::div[contains(@class,'grid')][1]").getByRole("button").click();
  await p.waitForURL(/session=/, { timeout: 30000 });
  await sleep(500);
  await p.screenshot({ path: `${OUT}/40-pay-ready.png` });
  out.ready = (await p.locator("main").innerText()).replace(/\n+/g, " | ");
  await p.getByRole("button", { name: "Start drill" }).click();
  for (let n = 0; n < 60 && !/\/mocks\//.test(p.url()); n++) {
    const next = p.getByRole("button", { name: /^(Next question|See your summary)$/ });
    if (await next.isVisible().catch(() => false)) {
      out.seen.push("feedback: " + (await p.locator("main").innerText()).replace(/\n+/g, " | ").slice(0, 260));
      if (out.seen.length === 2) await p.screenshot({ path: `${OUT}/41-pay-feedback.png` });
      await next.click();
      continue;
    }
    const sa = p.getByRole("button", { name: "Start answering" });
    if (!(await sa.waitFor({ timeout: 1500 }).then(() => true, () => false))) continue;
    out.seen.push("q: " + (await p.locator("h1").innerText()) + " — " + (await p.locator("main p").first().innerText()).slice(0, 60));
    await sa.click({ timeout: 2500 }).catch(() => {});
    const fin = p.getByRole("button", { name: "Finish answer" });
    await fin.waitFor({ timeout: 20000 });
    await sleep(3600);
    await fin.click();
  }
  await p.waitForURL(/\/mocks\//, { timeout: 60000 });
  await sleep(1000);
  await p.screenshot({ path: `${OUT}/42-pay-report.png`, fullPage: true });
  out.report = (await p.locator("main").innerText()).slice(0, 1500);
  await p.goto(`${BASE}/interviews/halden/prep`, { waitUntil: "networkidle" });
  out.prepPay = (await p.locator('article[aria-label="Prep sheet"]').innerText()).split("IF PAY COMES UP")[1]?.slice(0, 300);
  await p.pdf({ path: `${OUT}/prep-pay.pdf`, format: "A4", printBackground: true });
  await p.goto(`${BASE}/interviews/halden`, { waitUntil: "networkidle" });
  out.again = await p.locator('section[aria-label="Your training"]').getByRole("button", { name: "Again" }).count();
  out.errors = errors;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
