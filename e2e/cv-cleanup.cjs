// Step 0 of the CV section, walked as new users: an empty start, real saves, no sample
// content or unsupported claims, and one account unable to open or take over another's CV.
const path = require("node:path");
const { BASE, OUT, check, noForbidden, newUser, run } = require("./cv-helpers.cjs");

run("CV clean-up", async (browser) => {
  // --- A new user starts with nothing ---
  const a = await newUser(browser, "alice");
  await a.page.goto(`${BASE}/apply/cvs`);
  await a.page.getByText("No CVs yet").waitFor({ timeout: 15000 });
  check(true, "a new account sees an empty list");
  await noForbidden(a.page, "CV list");

  await a.page.getByRole("button", { name: "New CV" }).click();
  await a.page.waitForURL(/\/apply\/cvs\/cv_/);
  await a.page.getByLabel("CV name").waitFor();
  const cvUrl = a.page.url();
  check((await a.page.getByLabel("Profile").inputValue()) === "", "a new CV's profile is empty");
  check(await a.page.getByText("No bullets yet").isVisible(), "a new CV has no bullets");
  await noForbidden(a.page, "new CV");

  // --- Her own words are saved and survive a reload ---
  await a.page.getByLabel("Profile").fill("Paid media manager running Google and Meta ads for retail clients.");
  await a.page.getByLabel("New bullet").click(); // blur saves the profile
  await a.page.getByText("Saved").waitFor();
  await a.page.getByLabel("New bullet").fill("Ran the Google and Meta ads for six retail clients");
  await a.page.getByRole("button", { name: "Add" }).click();
  await a.page.getByText("Saved").waitFor();
  await a.page.reload();
  await a.page.getByLabel("CV name").waitFor();
  check((await a.page.getByLabel("Profile").inputValue()).startsWith("Paid media manager"), "profile survives a reload");
  check((await a.page.getByLabel("Bullet text").first().inputValue()) === "Ran the Google and Meta ads for six retail clients", "bullet is saved word for word");
  await a.page.screenshot({ path: path.join(OUT, "cv-cleanup-editor.png") });

  // --- A second account cannot open or save over her CV ---
  const b = await newUser(browser, "bob");
  await b.page.goto(cvUrl);
  await b.page.getByText("CV not found").waitFor({ timeout: 15000 });
  check(true, "another account opening the CV address sees 'CV not found'");
  check(!(await b.page.getByText("Paid media manager").count()), "none of her content is shown to him");
  const id = cvUrl.split("/").pop();
  const status = await b.page.evaluate(async (cvId) => {
    const r = await fetch(`/api/apply/cvs/${cvId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Taken over" }) });
    return r.status;
  }, id);
  check(status === 404, "his save to her CV is refused", `status ${status}`);
  await b.page.goto(`${BASE}/apply/cvs`);
  await b.page.getByText("No CVs yet").waitFor();
  check(true, "her CV is not in his list");

  await a.page.goto(`${BASE}/apply/cvs`);
  await a.page.getByRole("link", { name: "My CV" }).waitFor();
  check(true, "her CV is still in her list, under her name for it");

  // --- The public check makes no claims it can't support ---
  await a.page.goto(`${BASE}/cv-audit`);
  await a.page.getByText("Free CV check").waitFor();
  await noForbidden(a.page, "public CV check");
  await a.page.goto(`${BASE}/apply`);
  await a.page.waitForLoadState("networkidle");
  const hub = await a.page.locator("body").innerText();
  check(!/Ashby|Greenhouse|Workday/.test(hub), "Apply hub names no applicant-tracking systems");

  check(a.errors.length === 0 && b.errors.length === 0, "no page errors", [...a.errors, ...b.errors].join("\n"));
});
