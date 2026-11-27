// Starting a CV as a new user: upload first with nothing asked, an empty start, typing that is saved as you go,
// and one account unable to open or change another's CV. Each screen is checked in both themes and on a phone.
const { BASE, PHONE, check, noForbidden, newUser, setUp, bothThemes, fitsWidth, a11y, run } = require("./cv-helpers.cjs");

run("CV start", async (browser) => {
  const a = await newUser(browser, "alice");
  const { page } = a;

  // --- The dashboard of a new account ---
  await page.goto(`${BASE}/cv`);
  await page.getByText("No CVs yet").waitFor({ timeout: 15000 });
  const paths = await page.locator("[data-testid^=path-]").allInnerTexts();
  check(paths.length === 4 && /Check my CV or cover letter/.test(paths[0]) && /Check against a job/.test(paths[1]) && /Build with the assistant/.test(paths[2]) && /Find an example or template/.test(paths[3]), "the CV home starts with the four ways in", paths.join(" | "));
  check((await page.getByTestId("path-check").getAttribute("href")) === "/cv/check" && (await page.getByTestId("path-job").getAttribute("href")) === "/cv/check?job=1", "“Check my CV or cover letter” and “Check against a job” lead to the check in the app");
  await bothThemes(page, "dashboard-empty");
  check(await page.getByRole("link", { name: "CVs and letters" }).first().isVisible(), "the rail has “CVs and letters”");

  // --- Start your CV: upload first, nothing asked before it (DESIGN-SPEC-v3 §01) ---
  await page.getByRole("link", { name: "New CV" }).first().click();
  await page.waitForURL(/\/cv\/new/);
  await page.getByRole("heading", { name: "Start your CV" }).waitFor();
  check((await page.getByLabel("CV name").count()) === 0 && (await page.locator("input[type=radio]").count()) === 0, "nothing is asked before the upload: no CV name, level or UK/US questions");
  const steps = await page.getByRole("list", { name: "Starting your CV" }).locator("li").allInnerTexts();
  check(steps.length === 3 && /Upload/.test(steps[0]) && /Check/.test(steps[1]) && /Edit/.test(steps[2]) && (await page.locator('.cv-steps3 li[aria-current="step"]').innerText()).includes("Upload"), "three steps, Upload first and current", steps.join(" | "));
  const dropText = await page.getByTestId("drop-area").innerText();
  check(/Upload your CV/.test(dropText) && /PDF, DOCX · Up to 5 MB/.test(dropText) && /Choose file/.test(dropText) && /Or drag and drop your file here/.test(dropText), "the drop area: Upload your CV, PDF, DOCX · Up to 5 MB, Choose file, or drag and drop", dropText.replace(/\n/g, " / "));
  const ways = await page.locator(".cv-start3-way b").allInnerTexts();
  check(ways.join("|") === "Paste text|LinkedIn|Start from an example|Start with a blank page|Answer three questions|Talk it through", "the six other ways to start are below the upload", ways.join("|"));
  await bothThemes(page, "start");

  // Dragging a file over: the area says where to drop it.
  await page.getByTestId("drop-area").dispatchEvent("dragenter", { dataTransfer: await page.evaluateHandle(() => new DataTransfer()) });
  await page.getByRole("heading", { name: "Drop the file here" }).waitFor();
  check((await page.getByTestId("drop-area").getAttribute("data-state")) === "over", "dragging a file over the area: “Drop the file here”, with the selected fill");
  await bothThemes(page, "start-drag");
  // A file of the wrong type, dropped.
  const dropped = await page.evaluateHandle(() => {
    const dt = new DataTransfer();
    dt.items.add(new File(["plain words"], "my-cv.txt", { type: "text/plain" }));
    return dt;
  });
  await page.getByTestId("drop-area").dispatchEvent("drop", { dataTransfer: dropped });
  await page.getByRole("heading", { name: "That file type is not supported." }).waitFor();
  check(/Choose a PDF or Word file up to 5 MB\./.test(await page.getByTestId("drop-problem").innerText()) && (await page.getByRole("button", { name: "Try again" }).isVisible()) && (await page.getByRole("button", { name: "Paste text instead" }).isVisible()), "a dropped file of the wrong type: said at once, with Try again and Paste text instead");
  await bothThemes(page, "start-wrong-type");
  // Too big.
  await page.getByLabel("CV file").setInputFiles({ name: "big-cv.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(5 * 1024 * 1024 + 10, 32) });
  await page.getByRole("heading", { name: "This file is over 5 MB." }).waitFor();
  check(true, "a file over 5 MB: “This file is over 5 MB.”");
  // A scan: read on the server, nothing kept.
  await page.getByLabel("CV file").setInputFiles(require("node:path").join(require("./cv-helpers.cjs").FIXTURES, "scanned.pdf"));
  await page.getByRole("heading", { name: "We couldn’t read any text from this PDF." }).waitFor({ timeout: 45000 });
  check(/It may be a scanned image\. Upload a text-based file or paste the text instead\./.test(await page.getByTestId("drop-problem").innerText()), "a scanned PDF says so, with what to do instead");
  await bothThemes(page, "start-scanned");
  const none = await page.evaluate(async () => (await (await fetch("/api/cv/versions")).json()).cvs.length);
  check(none === 0, "a file that couldn’t be read leaves no CV behind", String(none));
  // Paste text instead opens the paste box.
  await page.getByRole("button", { name: "Paste text instead" }).click();
  await page.getByLabel("The text of your CV").waitFor();
  check((await page.locator(".cv-start3-way", { hasText: "Paste text" }).getAttribute("aria-pressed")) === "true", "Paste text instead opens the paste box");

  // --- A blank page: made at once, called My CV, with UK or US and the level not known yet ---
  await page.getByRole("button", { name: /^Start with a blank page Fill it in/ }).click();
  await bothThemes(page, "start-blank");
  await page.getByRole("button", { name: "Start with a blank page", exact: true }).click();
  await page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/edit\/contact/);
  const cvUrl = page.url();
  const id = cvUrl.match(/cv_[a-f0-9]+/)[0];
  check((await page.locator(".cv-edhead-name").innerText()) === "My CV", "the CV starts as “My CV”");
  const regionChoice = page.getByRole("combobox", { name: "UK or US" });
  check((await regionChoice.inputValue()) === "" && /not known yet/.test(await regionChoice.locator("option:checked").innerText()), "UK or US shows “not known yet”: nothing is chosen for you");
  check((await page.getByRole("combobox", { name: "Level" }).inputValue()) === "" && /not known yet/.test(await page.getByRole("combobox", { name: "Level" }).locator("option:checked").innerText()), "the level shows “not known yet”");
  await bothThemes(page, "editor-not-known");
  await regionChoice.selectOption("uk");
  await page.getByRole("combobox", { name: "Level" }).selectOption("early");
  await page.getByTestId("spelling-toggle").waitFor();
  check((await page.getByTestId("spelling-toggle").innerText()).includes("UK · A4"), "once chosen, the chip says UK · A4");
  await page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor();
  let stored = await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
  check(stored.level === "early" && stored.region === "uk" && stored.design.pageSize === "a4" && stored.inferred.unknown.length === 0, "what she chose is kept (UK means A4), and nothing is marked unknown any more", JSON.stringify(stored.inferred));
  // The name and the target job are set as she would in the editor; here directly, so the rest of the test can follow.
  await page.evaluate(async ({ cvId, rev }) => fetch(`/api/cv/versions/${cvId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev, name: "Fern Example – Collections Officer", target: { title: "Collections officer", employer: "Lantern Atlas", advert: "We are looking for a collections officer.\nYou will catalogue paper collections and write handling guidance for volunteers." } }) }), { cvId: id, rev: stored.rev });
  await page.reload();

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
  stored = await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
  check(stored.target && stored.target.title === "Collections officer" && stored.target.advert.includes("handling guidance"), "the target job is kept word for word");

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
  await page.getByRole("textbox", { name: "Level" }).fill("B2");
  await page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor();
  const after = await page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
  const skills = after.sections.find((s) => s.kind === "skills").groups[0].skills.map((k) => k.name);
  check(skills.join("|") === "Cataloguing|paper handling|volunteer induction", "skills typed with commas are saved as three skills", skills.join("|"));
  check(after.sections.map((s) => s.kind).join(",") === "summary,experience,education,skills,languages".split(",").sort((x, y) => after.sections.findIndex((s) => s.kind === x) - after.sections.findIndex((s) => s.kind === y)).join(",") && after.sections.some((s) => s.kind === "languages" && s.items[0].name === "French" && s.items[0].level === "B2"), "an added Languages section is saved with its level");

  // --- The dashboard now lists it, with the target job ---
  await page.goto(`${BASE}/cv`);
  await page.getByRole("link", { name: "Fern Example – Collections Officer", exact: true }).waitFor();
  const row = await page.locator(".cv-pick").first().innerText();
  check(/Collections officer · Lantern Atlas/.test(row) && /Base CV/.test(row), "the dashboard row shows it is the base CV, with the target role and employer", row.replace(/\n/g, " / "));
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
  await b.page.getByText("No CVs yet").waitFor();
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
  const sizes = await p.page.locator(".cv .cv-input").evaluateAll((els) => els.filter((e) => e.offsetParent).map((e) => [parseFloat(getComputedStyle(e).fontSize), e.offsetHeight]));
  // offsetHeight: the field's own height, not as drawn mid-way through the panel's opening animation.
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

  // --- Import from LinkedIn: nothing is fetched from LinkedIn and nothing is filled in ---
  const li = a.page;
  await li.goto(`${BASE}/cv/new`);
  await li.getByRole("button", { name: /^LinkedIn Upload the PDF/ }).click();
  check(await li.getByText("Hakkiri never reads LinkedIn pages itself.").isVisible(), "LinkedIn: it says Hakkiri never reads LinkedIn pages itself");
  await li.getByLabel("Profile link (optional)").fill("linkedin.com/in/sam-example");
  await li.getByRole("button", { name: "Read my profile", exact: true }).click();
  check(await li.getByText(/Paste your profile’s About, Experience and Education, or upload the PDF LinkedIn makes for you\./).first().isVisible(), "a LinkedIn link alone is not read: it asks for LinkedIn's PDF or the profile text, and fills nothing in");
  check(await li.getByRole("button", { name: "Upload LinkedIn’s PDF" }).isVisible(), "with a way to upload LinkedIn's own PDF");
  await bothThemes(li, "start-linkedin");
  await li.getByLabel("Or paste your profile").fill("About\nI look after collections at a small archive.\n\nExperience\nArchive assistant\nPaper Kite Archive\nSep 2023 – Present\n• Catalogued 1,200 maps in a year");
  await li.getByRole("button", { name: "Read my profile", exact: true }).click();
  await li.waitForURL(/\/cv\/import\/imp_/, { timeout: 45000 });
  const read = await li.locator("main").innerText();
  check(!/Professional Role|Led key projects|University Degree|Strategic Planning/.test(read), "only the pasted profile is read: no stand-in roles, degrees or skills", read.slice(0, 200));

  // --- An upload: the name, UK or US and the level come from the file, each with why ---
  await li.goto(`${BASE}/cv/new`);
  await li.getByLabel("CV file").setInputFiles(require("node:path").join(require("./cv-helpers.cjs").FIXTURES, "daniel-okoye.two-column.pdf"));
  await li.waitForURL(/\/cv\/import\/imp_/, { timeout: 45000 });
  await li.getByTestId("found-from-file").waitFor();
  const found = await li.getByTestId("found-from-file").innerText();
  check(/Daniel Okoye – /.test(found) && /UK · A4/.test(found) && /From your file: UK phone number/.test(found), "after the upload: the CV is named after him and his latest role, and UK · A4 comes from the phone number", found.replace(/\n/g, " / "));
  check((await li.locator('.cv-steps3 li[aria-current="step"]').innerText()).includes("Check"), "the steps show Check as the current step");
  const title = await li.locator("h1").first().innerText();
  check(title === "Check what we read" && (await li.getByRole("link", { name: /^Check flagged details \(\d+\)$/ }).isVisible()), "with details it couldn’t place: “Check what we read”, and only the flagged details to check", title);
  await bothThemes(li, "start-flagged");
  await li.goto(`${BASE}/cv/new`);
  await li.getByLabel("CV file").setInputFiles(require("node:path").join(require("./cv-helpers.cjs").FIXTURES, "maya-chen.writer.docx"));
  await li.waitForURL(/\/cv\/import\/imp_/, { timeout: 45000 });
  await li.getByTestId("found-from-file").waitFor();
  const title2 = await li.locator("h1").first().innerText();
  if (title2 === "Nothing flagged") {
    check(/Everything we read is ready to edit\. No extra review step is needed\./.test(await li.locator("main").innerText()), "with nothing flagged: “Nothing flagged”, and no extra review step");
    await bothThemes(li, "start-nothing-flagged");
    await li.getByTestId("open-editor").click();
    await li.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/edit\/contact/);
    check(true, "Open editor goes straight to the editor");
  } else check(title2 === "Check what we read", "the second file has details to check", title2);

  check(a.errors.length + b.errors.length + p.errors.length === 0, "no page errors", [...a.errors, ...b.errors, ...p.errors].join("\n"));
});
