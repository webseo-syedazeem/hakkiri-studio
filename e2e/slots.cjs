// Skipping the opening and the closing: one tap, no reason menu, no replacement, and neither is in the report.
const { chromium } = require("playwright");
const { BASE, OUT, FAKE_MIC, signIn, setUpInterview, closeSurvey } = require("./helpers.cjs");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: FAKE_MIC });
  const { page: p } = await signIn(b, "slots");
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const out = { seen: [] };
  // A new account has no interviews, so this one is set up first.
  const id = await setUpInterview(p);
  await p.goto(`${BASE}/interviews/${id}`, { waitUntil: "networkidle" });
  // Practice settings on the interview page: Easy, 20 min.
  await p.getByRole("radiogroup", { name: "Difficulty" }).getByText("Easy", { exact: true }).click();
  await p.getByRole("radiogroup", { name: "Interview length" }).getByText("20 min", { exact: true }).click();
  await p.getByRole("button", { name: "Start practising" }).click();
  await p.waitForURL(/session=/, { timeout: 60000 });
  await p.getByRole("button", { name: "Start interview" }).click();
  const progress = () => p.locator('[aria-label^="Question "]').first().getAttribute("aria-label", { timeout: 1000 }).catch(() => "");
  let afterOpening = null;
  for (let n = 0; n < 80 && !/\/mocks\//.test(p.url()); n++) {
    const sa = p.getByRole("button", { name: "Start answering" });
    if (!(await sa.waitFor({ timeout: 1500 }).then(() => true, () => false))) continue;
    const h1 = await p.locator("h1").innerText();
    const isFollowUp = await p.getByText(/^Follow-up \d of \d$/).first().isVisible();
    const at = await progress();
    out.seen.push(`${at} ${isFollowUp ? "f" : "q"}: ${h1.slice(0, 60)}`);
    if (afterOpening === "pending" && !isFollowUp) afterOpening = at;
    if (!isFollowUp && (/^Tell me about yourself/.test(h1) || /questions do you have for us/.test(h1))) {
      // On these two "Skip" is one tap. (On any other question it opens a menu asking why.)
      await p.getByRole("button", { name: "Skip", exact: true }).click();
      await sleep(300);
      const menu = await p.getByRole("menu").isVisible().catch(() => false);
      out.seen.push(`  skipped; menu shown: ${menu}`);
      if (menu) throw new Error(`Skipping "${h1}" asked for a reason.`);
      if (/^Tell me about yourself/.test(h1)) afterOpening = "pending";
      continue;
    }
    await sa.click({ timeout: 2500 }).catch(() => {});
    const fin = p.getByRole("button", { name: "Finish answer" });
    await fin.waitFor({ timeout: 20000 });
    await sleep(3600);
    await fin.click();
  }
  await p.waitForURL(/\/mocks\//, { timeout: 60000 });
  await closeSurvey(p);
  await p.getByRole("heading", { level: 1, name: "Interview report" }).waitFor();
  await sleep(1000);
  await p.screenshot({ path: `${OUT}/30-slots-report.png`, fullPage: true });

  const skips = out.seen.filter((s) => s.startsWith("  skipped")).length;
  if (skips !== 2) throw new Error(`Expected to skip the opening and the closing, skipped ${skips}.`);
  // No replacement: after the opening the interview is on its second question, not another first one.
  out.afterOpening = afterOpening;
  if (!/^Question 2 of /.test(afterOpening ?? "")) throw new Error(`After skipping the opening the interview was at "${afterOpening}", not question 2.`);

  // The report covers the questions that were answered: every one but the two that were skipped.
  const planned = Number((out.seen[0].match(/^Question 1 of (\d+)/) ?? [])[1]);
  const view = p.getByRole("button", { name: /^View all \d+ questions/ });
  if (await view.isVisible().catch(() => false)) await view.click();
  const main = await p.locator("main").innerText();
  out.reviewed = main.split("\n").filter((l) => /^\d+\t/.test(l)).map((l) => l.split("\t").slice(0, 2).join(" "));
  out.firstRow = out.reviewed[0];
  if (out.reviewed.length !== planned - 2) throw new Error(`The report reviews ${out.reviewed.length} questions; ${planned} were planned and 2 skipped.`);
  if (out.reviewed.some((r) => /Tell me about yourself|questions do you have for us/.test(r))) throw new Error("The report reviews a question that was skipped.");
  out.errors = errors;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
