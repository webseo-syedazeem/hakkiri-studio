// Starting a CV as a new user: the set-up form, an empty start, typing that is saved as you go,
// and one account unable to open or change another's CV. Each screen is checked in both themes and on a phone.
const { BASE, PHONE, check, noForbidden, newUser, setUp, bothThemes, fitsWidth, a11y, run } = require("./cv-helpers.cjs");

run("CV start", async (browser) => {
  const a = await newUser(browser, "alice");
  const { page } = a;

  // --- The dashboard of a new account ---
  await page.goto(`${BASE}/cv`);
  await page.getByText("You have no CVs yet").waitFor({ timeout: 15000 });
  check(await page.getByRole("link", { name: "Free CV audit" }).isVisible(), "an empty dashboard offers New CV and the free CV audit");
  await bothThemes(page, "dashboard-empty");
  check(await page.getByRole("link", { name: "CVs and letters" }).first().isVisible(), "the rail has “CVs and letters”");

  // --- Set-up asks its questions and says what is missing ---
  await page.getByRole("link", { name: "New CV" }).first().click();
  await page.waitForURL(/\/cv\/new/);
  check((await page.getByLabel("CV name").inputValue()) === "", "the CV name starts blank");
  check((await page.locator("input[type=radio][name=level]:checked, input[type=radio][name=region]:checked").count()) === 0, "level and region are not chosen for you");
  await page.getByRole("button", { name: "Create CV" }).click();
  await page.getByText("Give your CV a name.").waitFor();
  check(await page.getByText("Choose the level that fits you best.").isVisible(), "set-up says the level is missing");
  check(await page.getByText("Choose UK or US.").isVisible(), "set-up says UK or US is missing");
  check(await page.getByLabel("CV name").evaluate((el) => el === document.activeElement), "focus moves to the first field with a problem");
  check(page.url().endsWith("/cv/new"), "nothing is created while answers are missing");
  await bothThemes(page, "setup-errors");

  await page.getByLabel("CV name").fill("Fern Example – Collections Officer");
  await page.getByText("Early career", { exact: true }).click();
  await page.getByText("UK", { exact: true }).click();
  await page.getByRole("button", { name: "+ Add a target job (optional)" }).click();
  await page.getByLabel("Job title").fill("Collections officer");
  await page.getByLabel("Employer").fill("Lantern Atlas");
  await page.getByLabel("Job advert").fill("We are looking for a collections officer.\nYou will catalogue paper collections and write handling guidance for volunteers.");
  await bothThemes(page, "setup");
  await page.getByRole("button", { name: "Create CV" }).click();
  await page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/edit\/contact/);
  const cvUrl = page.url();
  const id = cvUrl.match(/cv_[a-f0-9]+/)[0];

  // --- A new CV is empty ---
  await page.getByText("Your CV is empty").waitFor();
  check(await page.getByText("Start with your contact details. You can add work, education or projects in any order.").isVisible(), "an empty CV says so, with where to start");
  const filled = await page.locator(".cv input:not([type=file]):not([type=radio]):not([type=checkbox]), .cv textarea").evaluateAll((els) => els.filter((e) => e.value !== "").length);
  check(filled === 0, "every contact field starts blank", `${filled} field(s) had a value`);
  for (const tab of ["Experience", "Education", "Skills", "Profile"]) {
    await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: tab, exact: true }).click();
    await page.waitForURL(new RegExp(`/edit/${tab.toLowerCase()}`));
    const any = await page.locator(".cv input:not([type=file]):not([type=radio]):not([type=checkbox]), .cv textarea").evaluateAll((els) => els.filter((e) => e.value !== "").length);
    check(any === 0, `${tab} starts with nothing in it`, `${any} field(s) had a value`);
  }
  await noForbidden(page, "new CV");
  const stored = await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
  check(stored.target && stored.target.title === "Collections officer" && stored.target.advert.includes("handling guidance"), "the target job from set-up is kept word for word");
  check(stored.level === "early" && stored.region === "uk" && stored.design.pageSize === "a4", "the level and region from set-up are kept (UK means A4)");

  // --- What she types is saved as she goes, and survives a reload ---
  await page.goto(cvUrl);
  await page.getByLabel("Name").fill("Fern Example");
  await page.getByLabel("Email").fill("fern@example.com");
  await page.getByLabel("Town or city").fill("York");
  await page.getByLabel("Link 1").fill("linkedin.com/in/fern-example");
  await page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor();
  check(!(await page.getByText("Your CV is empty").isVisible()), "the “empty” message goes once there is content");
  await bothThemes(page, "editor-contact");
  await page.getByRole("button", { name: "Continue to Experience" }).first().click();
  await page.waitForURL(/\/edit\/experience/);
  await page.getByRole("button", { name: "+ Add role" }).click();
  await page.getByLabel("Job title").fill("Archive assistant");
  await page.getByLabel("Employer", { exact: true }).fill("Paper Kite Archive");
  await page.getByLabel("Start").fill("sept 2023");
  await page.getByLabel("Start").blur();
  check((await page.getByLabel("Start").inputValue()) === "Sep 2023", "a date typed as “sept 2023” is read as Sep 2023");
  await page.getByText("I still do this").click();
  check((await page.getByLabel("End").inputValue()) === "Present", "“I still do this” sets the end to Present");
  await page.getByRole("button", { name: "+ Add bullet" }).click();
  const bullet = "Wrote a handling guide for volunteers working with fragile maps – 40 pages, £0 budget";
  await page.getByRole("textbox", { name: "Bullet 1" }).fill(bullet);
  await page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor();
  await bothThemes(page, "editor-experience");
  await page.reload();
  await page.getByLabel("Job title").waitFor();
  check((await page.getByRole("textbox", { name: "Bullet 1" }).inputValue()) === bullet, "a bullet is saved word for word, punctuation and all");
  check((await page.getByLabel("Start").inputValue()) === "Sep 2023" && (await page.getByLabel("End").inputValue()) === "Present", "the dates survive a reload");
  await page.getByLabel("Start").fill("next tuesday");
  await page.getByLabel("Start").blur();
  check(await page.getByText("Use a month and year, like Mar 2021.").isVisible(), "a date that can’t be read is refused with an example");
  await page.reload();
  await page.getByLabel("Job title").waitFor();
  check((await page.getByLabel("Start").inputValue()) === "Sep 2023", "the refused date did not replace the saved one");

  // Skills, and an optional section.
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name: "Skills", exact: true }).click();
  await page.getByRole("button", { name: "+ Add skills" }).click();
  await page.getByLabel("Skills", { exact: true }).fill("Cataloguing, paper handling, volunteer induction");
  await page.getByRole("button", { name: "+ Add section" }).click();
  await page.getByRole("button", { name: "Languages", exact: true }).click();
  await page.waitForURL(/\/edit\/languages/);
  await page.getByRole("button", { name: "+ Add language" }).click();
  await page.getByLabel("Language", { exact: true }).fill("French");
  await page.getByLabel("Level").fill("B2");
  await page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor();
  const after = await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
  const skills = after.sections.find((s) => s.kind === "skills").groups[0].skills.map((k) => k.name);
  check(skills.join("|") === "Cataloguing|paper handling|volunteer induction", "skills typed with commas are saved as three skills", skills.join("|"));
  check(after.sections.map((s) => s.kind).join(",") === "summary,experience,education,skills,languages".split(",").sort((x, y) => after.sections.findIndex((s) => s.kind === x) - after.sections.findIndex((s) => s.kind === y)).join(",") && after.sections.some((s) => s.kind === "languages" && s.items[0].name === "French" && s.items[0].level === "B2"), "an added Languages section is saved with its level");

  // --- The dashboard now lists it, with the target job ---
  await page.goto(`${BASE}/cv`);
  await page.getByRole("link", { name: "Fern Example – Collections Officer", exact: true }).waitFor();
  const row = await page.locator(".cv-pick").first().innerText();
  check(/Collections officer · Lantern Atlas/.test(row) && /Early career/.test(row), "the dashboard row shows the level and the target role and employer", row.replace(/\n/g, " / "));
  check((await page.locator(".cv-pick").count()) === 1, "the dashboard lists her one CV and nothing else");
  await bothThemes(page, "dashboard");

  // --- A second account cannot open or change it ---
  const b = await newUser(browser, "bob");
  await b.page.goto(cvUrl);
  await b.page.getByText("CV not found").waitFor({ timeout: 15000 });
  check(!(await b.page.getByText("Fern Example").count()), "another account sees “CV not found” and none of her content");
  const statuses = await b.page.evaluate(async (cvId) => {
    const patch = await fetch(`/api/cv/versions/${cvId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rev: 1, name: "Taken over" }) });
    const del = await fetch(`/api/cv/versions/${cvId}`, { method: "DELETE" });
    const get = await fetch(`/api/cv/versions/${cvId}`);
    return [patch.status, del.status, get.status];
  }, id);
  check(statuses.join(",") === "404,404,404", "his attempts to read, change and delete it are all refused", statuses.join(","));
  await b.page.goto(`${BASE}/cv`);
  await b.page.getByText("You have no CVs yet").waitFor();
  check(true, "her CV is not in his list");
  const still = await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv.name, id);
  check(still === "Fern Example – Collections Officer", "her CV is unchanged");

  // --- Two tabs: neither silently overwrites the other ---
  const tab2 = await a.context.newPage();
  await tab2.goto(cvUrl);
  await tab2.getByLabel("Name").waitFor();
  await page.goto(cvUrl);
  await page.getByLabel("Name").fill("Fern A. Example");
  await page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor();
  await tab2.getByLabel("Town or city").fill("Leeds");
  await tab2.getByText("Changed somewhere else").first().waitFor({ timeout: 10000 });
  const kept = await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv.contact, id);
  check(kept.fullName === "Fern A. Example" && kept.location === "York", "a second tab's out-of-date save is refused and nothing is overwritten", JSON.stringify(kept));
  await tab2.close();

  // --- A lost connection: the change is kept on this device and saved when the connection is back ---
  await page.goto(cvUrl);
  await page.getByLabel("Phone").waitFor();
  await a.context.setOffline(true);
  await page.getByLabel("Phone").fill("07700 900123");
  await page.getByText("Saved on this device").first().waitFor({ timeout: 10000 });
  check(true, "offline, the status says “Saved on this device”, not “Saved”");
  await a.context.setOffline(false);
  await page.reload();
  await page.getByLabel("Phone").waitFor();
  await page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor({ timeout: 10000 });
  const phone = await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv.contact.phone, id);
  check(phone === "07700 900123", "back online, the unsaved change is put back and saved", phone);

  // --- On a phone ---
  const p = await newUser(browser, "phone", PHONE);
  await setUp(p.page, { name: "Phone CV", level: "Student or graduate", region: "US" });
  await p.page.getByText("Your resume is empty").waitFor();
  check(true, "a US CV is called a resume");
  await fitsWidth(p.page, "editor on a phone");
  const sizes = await p.page.locator(".cv .cv-input").evaluateAll((els) => els.map((e) => [parseFloat(getComputedStyle(e).fontSize), e.getBoundingClientRect().height]));
  check(sizes.every(([font, height]) => font >= 16 && height >= 44), "on a phone, inputs are at least 16px text and 44px tall", JSON.stringify(sizes.slice(0, 4)));
  // On a phone the tabs are a picker.
  const order = await p.page.getByLabel("Section", { exact: true }).locator("option").allInnerTexts();
  check(order.join(",") === "Contact,Experience,Education,Skills,Summary,Finish", "a US resume calls the profile “Summary”", order.join(","));
  await p.page.getByLabel("Name").fill("Sam Student");
  await p.page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor();
  await p.page.screenshot({ path: require("node:path").join(require("./cv-helpers.cjs").OUT, "cv-editor-phone.png"), fullPage: true });
  await a11y(p.page, "editor on a phone");
  await p.page.goto(`${BASE}/cv/new`);
  await fitsWidth(p.page, "set-up on a phone");
  await p.page.goto(`${BASE}/cv`);
  await p.page.getByRole("link", { name: "Phone CV", exact: true }).waitFor();
  await fitsWidth(p.page, "dashboard on a phone");

  check(a.errors.length + b.errors.length + p.errors.length === 0, "no page errors", [...a.errors, ...b.errors, ...p.errors].join("\n"));
});
