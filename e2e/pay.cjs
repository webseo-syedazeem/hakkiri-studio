// Talking about pay: four answers with checks after each, the report, and doing it again.
// No screen has a button for this practice at the moment (it used to be under "Your training" on the
// interview page), so it is started the way that button started it: by asking the app to plan it.
const { chromium } = require("playwright");
const { BASE, OUT, FAKE_MIC, signIn, setUpInterview } = require("./helpers.cjs");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: FAKE_MIC });
  const { page: p } = await signIn(b, "pay");
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const out = { seen: [] };
  // A new account has no interviews, so this one is set up first.
  const id = await setUpInterview(p);
  await p.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
  const planned = await p.evaluate(async (interviewId) => {
    const res = await fetch(`/api/interviews/${interviewId}/sessions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "drill", drill: { kind: "pay" } }) });
    return { status: res.status, ...(await res.json().catch(() => ({}))) };
  }, id);
  if (planned.status !== 200 || !planned.href) throw new Error(`The pay practice couldn't be planned: ${JSON.stringify(planned)}`);
  await p.goto(BASE + planned.href, { waitUntil: "networkidle" });
  await p.waitForURL(/session=/, { timeout: 30000 });
  await sleep(500);
  await p.screenshot({ path: `${OUT}/40-pay-ready.png` });
  out.ready = (await p.locator("main").innerText()).replace(/\n+/g, " | ");
  if (!/Talking about pay/.test(out.ready)) throw new Error("The ready screen isn't for Talking about pay.");
  await p.getByRole("button", { name: "Start practice" }).click();
  for (let n = 0; n < 60 && !/\/mocks\//.test(p.url()); n++) {
    const next = p.getByRole("button", { name: /^(Next question|See your summary)/ });
    if (await next.isVisible().catch(() => false)) {
      out.seen.push("feedback: " + (await p.locator("main").innerText()).replace(/\n+/g, " | ").slice(0, 260));
      if (out.seen.length === 2) await p.screenshot({ path: `${OUT}/41-pay-feedback.png` });
      await next.click();
      continue;
    }
    const sa = p.getByRole("button", { name: "Start answering" });
    if (!(await sa.waitFor({ timeout: 1500 }).then(() => true, () => false))) continue;
    out.seen.push("q: " + (await p.locator("h1").innerText()));
    await sa.click({ timeout: 2500 }).catch(() => {});
    const fin = p.getByRole("button", { name: "Finish answer" });
    await fin.waitFor({ timeout: 20000 });
    await sleep(3600);
    await fin.click();
  }
  await p.waitForURL(/\/mocks\//, { timeout: 60000 });
  const asked = out.seen.filter((s) => s.startsWith("q: "));
  const feedback = out.seen.filter((s) => s.startsWith("feedback: "));
  if (asked.length !== 4 || !/salary expectations/.test(asked[0])) throw new Error(`Expected the four pay questions, got: ${asked.join(" / ")}`);
  if (feedback.length !== 4) throw new Error(`Expected feedback after each of the four answers, got ${feedback.length}.`);

  // The report: each answer with its checks, and when to raise pay in this kind of interview.
  await p.getByRole("heading", { level: 1, name: "Focused practice: Talking about pay" }).waitFor();
  await sleep(1000);
  await p.screenshot({ path: `${OUT}/42-pay-report.png`, fullPage: true });
  out.report = (await p.locator("main").innerText()).slice(0, 1500);
  out.checks = await p.locator('section[aria-label="Each answer"] li').allInnerTexts();
  if (!out.checks.length) throw new Error("The report shows no checks on the pay answers.");
  out.when = (await p.locator('section[aria-label="When to raise pay"]').innerText()).replace(/\n+/g, " | ").slice(0, 300);

  // Do it again: the same practice, planned afresh.
  await p.getByRole("button", { name: "Do it again" }).click();
  await p.waitForURL(/\/mock\/.*session=/, { timeout: 30000 });
  await p.getByRole("button", { name: "Start practice" }).waitFor();
  out.again = /Talking about pay/.test(await p.locator("main").innerText());
  if (!out.again) throw new Error("Do it again didn't open Talking about pay.");
  out.errors = errors;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
