// The clean-up of the old CV screens, checked as new users: no sample content or unsupported claims
// anywhere, the old addresses lead to the new section, and a new account's Evidence Bank is empty.
const { BASE, check, noForbidden, newUser, run } = require("./cv-helpers.cjs");

run("CV clean-up", async (browser) => {
  const a = await newUser(browser, "alice");

  // --- The old addresses lead to the new section ---
  await a.page.goto(`${BASE}/apply/cvs`);
  await a.page.waitForURL(/\/cv$/);
  await a.page.getByText("No CVs yet").waitFor({ timeout: 15000 });
  check(true, "/apply/cvs goes to /cv, and a new account sees no CVs");
  await noForbidden(a.page, "CV dashboard");
  check((await a.page.locator(".cv-pick").count()) === 0, "the dashboard shows no example rows");
  await a.page.goto(`${BASE}/apply/cvs/cv_master_base`);
  await a.page.getByText("CV not found").waitFor({ timeout: 15000 });
  check(true, "an old CV address that matches nothing says “CV not found” (and invents nothing)");
  await a.page.goto(`${BASE}/cv`);
  await a.page.getByText("No CVs yet").waitFor();
  check(true, "opening that address created no CV");

  // --- The public check makes no claims it can't support ---
  await a.page.goto(`${BASE}/cv-audit`);
  await a.page.getByText("Free CV check").waitFor();
  await noForbidden(a.page, "public CV check");
  await a.page.goto(`${BASE}/apply`);
  await a.page.waitForLoadState("networkidle");
  const hub = await a.page.locator("body").innerText();
  check(!/Ashby|Greenhouse|Workday/.test(hub), "Apply hub names no applicant-tracking systems");
  check(!/verified/i.test(hub), "Apply hub does not call facts 'verified'");
  check(/facts you (have )?confirmed/i.test(hub), "Apply hub says the facts are confirmed by you");
  await a.page.locator('a[href="/cv"]').first().click();
  await a.page.waitForURL(/\/cv$/);
  check(true, "the Apply hub's CV card opens the new section");

  // --- A new account's Evidence Bank is empty ---
  const bank = await a.page.evaluate(async () => (await fetch("/api/apply/evidence")).json());
  check(Array.isArray(bank) && bank.length === 0, "a new account's Evidence Bank is empty", JSON.stringify(bank).slice(0, 200));
  await a.page.goto(`${BASE}/apply/evidence`);
  await a.page.waitForLoadState("networkidle");
  const bankText = await a.page.locator("body").innerText();
  check(!/Spearheaded|Black Friday|Playwright/.test(bankText), "the Evidence Bank page shows no invented achievements");
  check(!/verified/i.test(bankText), "the Evidence Bank page does not call facts 'verified'");

  // --- The old CV API is gone ---
  const old = await a.page.evaluate(async () => (await fetch("/api/apply/cvs")).status);
  check(old === 404, "the old CV API no longer exists", `status ${old}`);

  check(a.errors.length === 0, "no page errors", a.errors.join("\n"));
});
