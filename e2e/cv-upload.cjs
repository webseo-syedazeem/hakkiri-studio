// Uploading a CV as a new user: a PDF and Word files are read into sections, each section is checked
// against the file, uncertain fields are confirmed, corrected or left blank, leftover text is placed,
// and only then does anything reach the CV. Files that can't be read each get their own way forward.
const path = require("node:path");
const { BASE, OUT, FIXTURES, PHONE, check, noForbidden, newUser, setUp, bothThemes, fitsWidth, a11y, run } = require("./cv-helpers.cjs");

const cvOf = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const importOf = (page, id) => page.evaluate(async (impId) => (await (await fetch(`/api/cv/imports/${impId}`)).json()).import, id);
const saved = (page) => page.locator("header.cv-bar").getByText("Saved", { exact: true }).waitFor();
const next = (page) => page.getByRole("button", { name: "Confirm and continue" }).first().click();
const markedText = (page) => page.locator('.cv-source-line[data-marked="true"]').allInnerTexts();

run("CV upload", async (browser) => {
  const a = await newUser(browser, "alice");
  const { page } = a;

  /* ---------------------------------------------------------------- a two-column PDF, start to finish */
  await setUp(page, { name: "Daniel Okoye – Senior Engineer", file: "daniel-okoye.two-column.pdf" });
  const importId = page.url().match(/imp_[a-f0-9]+/)[0];
  await page.getByText("Sections to confirm").waitFor();
  const imp0 = await importOf(page, importId);
  const cvId = imp0.versionId;
  check((await page.locator("ol .cv-pick").count()) === 7, "the upload lists its sections to confirm, ending with unassigned text");
  check(await page.getByText("2 things to check").isVisible(), "it says how many things need checking");
  check((await cvOf(page, cvId)).contact.fullName === "", "nothing has been added to the CV yet");
  await bothThemes(page, "import-home");

  await page.getByRole("link", { name: /^Review (all sections|section by section)$/ }).click();
  await page.waitForURL(/review\/contact/);
  check((await page.getByLabel("Name").inputValue()) === "Daniel Okoye", "contact: the name was read from the file");
  check((await page.getByLabel("Email").inputValue()) === "daniel.okoye@example.com" && (await page.getByLabel("Phone").inputValue()) === "+44 7700 900812" && (await page.getByLabel("Town or city").inputValue()) === "Bristol", "contact: email, phone and town were read from the side column");
  check((await page.getByLabel("Link 1").inputValue()) === "github.com/dokoye", "contact: the link was read");
  await page.getByLabel("Email").focus();
  check((await markedText(page)).join("|") === "daniel.okoye@example.com", "focusing a field marks the line of the file it came from", (await markedText(page)).join("|"));
  await bothThemes(page, "review-contact");
  await next(page);
  await page.waitForURL(/review\/summary/);
  check((await page.getByLabel("Profile").inputValue()).startsWith("Software engineer with nine years"), "profile: read from the file");
  await next(page);
  await page.waitForURL(/review\/experience/);

  // An uncertain field: confirmed, corrected or left blank; never passed over silently.
  await page.getByText("Check this").first().waitFor();
  const note = await page.locator(".cv-note").first().innerText();
  check(/assumed this role was also at Parcelwise Ltd/.test(note) && /We found “Software Engineer”/.test(note), "an uncertain field says why, quoting the file", note.replace(/\n/g, " "));
  check((await page.locator(".cv-input.cv-uncertain").count()) === 1, "the uncertain field itself is marked");
  await bothThemes(page, "review-experience");
  await next(page);
  await page.getByText("Before you continue").waitFor();
  check(page.url().includes("review/experience"), "the check can’t move on while a marked field is unanswered");
  await page.getByRole("button", { name: "This is right" }).click();
  await page.locator(".cv-fixed", { hasText: "Confirmed" }).waitFor();
  check((await page.locator(".cv-input.cv-uncertain").count()) === 0, "confirming it clears the mark and shows a tick");
  // A correction made here is what reaches the CV.
  const firstBullet = page.getByRole("textbox", { name: "Bullet 1" }).first();
  check((await firstBullet.inputValue()) === "Lead a team of five engineers building the driver routing service used by 4,000 couriers", "a bullet that wrapped across two lines in the file is one bullet");
  await firstBullet.fill("Lead a team of five engineers building the driver routing service used by 4,000 couriers a day");
  await saved(page);
  await next(page);
  await page.waitForURL(/review\/education/);
  check((await page.getByLabel("Qualification").inputValue()) === "BSc" && (await page.getByLabel("Subject").inputValue()) === "Computer Science" && (await page.getByLabel("Degree class or grade").inputValue()) === "First Class Honours", "education: qualification, subject and degree class each in their own box");
  check((await page.getByLabel("Finished").inputValue()) === "2015", "education: a year stays a year (no month is made up)");
  await next(page);
  await page.waitForURL(/review\/skills/);
  check((await page.getByLabel("Skills", { exact: true }).inputValue()) === "TypeScript, React, Node.js, PostgreSQL, AWS, Leadership", "skills: one per line in the side column, read as six skills");
  await next(page);
  await page.waitForURL(/review\/languages/);
  await next(page);
  await page.waitForURL(/review\/unassigned/);

  // Leftover text is shown, and must be placed or dismissed.
  await page.getByText("“Senior Software Engineer”").waitFor();
  check(true, "the last step shows the text that could not be placed");
  await bothThemes(page, "review-unassigned");
  await page.getByRole("button", { name: "Open in builder" }).first().click();
  await page.getByText("Before you continue").waitFor();
  check(page.url().includes("review/unassigned"), "it can’t be opened in the builder while leftover text is undecided");
  await page.getByRole("button", { name: "Add to my CV" }).click();
  await page.waitForURL(/panel=assign-text/);
  const dialog = page.getByRole("dialog", { name: "Add this text to your CV" });
  await dialog.waitFor();
  await a11y(page, "assign-text dialog");
  await dialog.getByLabel("Where it goes").selectOption({ label: "Profile: added to the end" });
  await dialog.getByRole("button", { name: "Add to my CV" }).click();
  await page.getByText("✓ Added").waitFor();
  await page.waitForURL((u) => !u.search.includes("panel="), { timeout: 5000 }).catch(() => {});
  check(!page.url().includes("panel="), "the dialog closes and the address goes back to the step");
  await page.getByRole("button", { name: "Open in builder" }).first().click();
  await page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/edit\/contact/);

  // Now, and only now, the CV has the content.
  const cv = await cvOf(page, cvId);
  const exp = cv.sections.find((s) => s.kind === "experience");
  check(cv.contact.fullName === "Daniel Okoye" && exp.entries.length === 3, "after “Open in builder” the CV holds what was checked");
  check(exp.entries[0].bullets[0].text.endsWith("4,000 couriers a day"), "the correction made during the check is in the CV");
  check(exp.entries[1].org === "Parcelwise Ltd" && exp.entries[1].title === "Software Engineer", "the second role kept the employer that was confirmed");
  const src = exp.entries[0].bullets[1].sources[0];
  check(src && src.kind === "upload" && src.ref === importId && src.text.startsWith("Cut route calculation time"), "each uploaded bullet keeps a pointer to its line in the file", JSON.stringify(src));
  check(cv.sections.find((s) => s.kind === "summary").text.endsWith("Senior Software Engineer"), "the leftover text went where she put it");
  check((await page.getByLabel("Name").inputValue()) === "Daniel Okoye", "the builder opens with the CV filled in");
  await noForbidden(page, "builder after upload");
  await page.goto(`${BASE}/cv/import/${importId}`);
  await page.getByText("This upload is in your CV").waitFor();
  check(true, "the upload's own page now says it is in the CV");

  /* --------------------------------------- a Word file: left-out lines, leave blank, stop and come back */
  await setUp(page, { name: "Tom Reilly graduate CV", level: "Student or graduate", file: "tom-reilly.graduate.docx" });
  const tomImport = page.url().match(/imp_[a-f0-9]+/)[0];
  await page.getByText("Sections to confirm").waitFor();
  const stepNames = await page.locator("ol .cv-pick a").allInnerTexts();
  check(stepNames.join(" | ") === "1. Contact | 2. Profile | 3. Education | 4. Experience | 5. Positions of Responsibility | 6. Skills | 7. Interests | 8. Unassigned text", "a Word file with heading styles reads into its sections, in the file's own order", stepNames.join(" | "));
  await page.getByRole("link", { name: /^Review (all sections|section by section)$/ }).click();
  await page.waitForURL(/review\/contact/);
  check((await page.getByLabel("Name").inputValue()) === "Tom Reilly", "the name in the Word page header was read");
  check((await page.getByLabel("Town or city").inputValue()) === "Nottingham", "a full address was cut to the town");
  const addressNote = await page.locator(".cv-note").first().innerText();
  check(/kept just the town/.test(addressNote), "and the person is told so", addressNote.replace(/\n/g, " "));
  await page.getByRole("button", { name: "Leave blank" }).click();
  await page.locator(".cv-fixed", { hasText: "Left blank" }).waitFor();
  check((await page.getByLabel("Town or city").inputValue()) === "", "“Leave blank” empties the field");
  await page.getByLabel("Town or city").fill("Nottingham");
  await saved(page);
  await next(page);
  await page.waitForURL(/review\/summary/);

  // Stop here and come back from the dashboard.
  await page.goto(`${BASE}/cv`);
  const tomRow = page.locator(".cv-pick", { hasText: "Tom Reilly graduate CV" });
  await tomRow.getByText("Upload to check").waitFor();
  check(true, "the dashboard shows the CV has an upload still to check");
  await tomRow.getByRole("link", { name: "Check upload" }).click();
  await page.getByRole("link", { name: "Carry on checking" }).waitFor();
  check(await page.locator("ol .cv-pick").first().getByText("✓ Confirmed").isVisible(), "the step already confirmed is ticked");
  await page.getByRole("link", { name: "Carry on checking" }).click();
  await page.waitForURL(/review\/summary/);
  check(true, "“Carry on checking” resumes at the next step");
  await page.goto(`${BASE}/cv/import/${tomImport}/review/education`);
  await page.getByLabel("Qualification").first().waitFor();
  check((await page.getByLabel("Degree class or grade").first().inputValue()) === "predicted 2:1" && (await page.getByLabel("Finished").first().inputValue()) === "Jun 2025", "“Expected June 2025” and “(predicted 2:1)” are read as written", `${await page.getByLabel("Degree class or grade").first().inputValue()} / ${await page.getByLabel("Finished").first().inputValue()}`);
  await page.goto(`${BASE}/cv/import/${tomImport}/review/experience`);
  await page.getByText("This was a paragraph in your file").waitFor();
  check((await page.getByRole("textbox", { name: "Bullet 1" }).first().inputValue()) === "I work weekends on the shop floor and the till.", "a paragraph of description is split into bullets, and flagged for checking");
  await page.goto(`${BASE}/cv/import/${tomImport}/review/unassigned`);
  await page.getByText("Left out on purpose").waitFor();
  const left = await page.locator("section", { hasText: "Left out on purpose" }).last().innerText();
  check(/Date of birth: 3 May 2004/.test(left) && /References available on request/.test(left) && /14 Canal Street/.test(left), "date of birth, references and the street address are listed as left out, each with its reason");
  check(await page.getByText("Every line of your file was placed in a section.").isVisible(), "with nothing left over, the unassigned step says so");
  await bothThemes(page, "review-unassigned-empty");

  /* ------------------------------------------------------------- files that cannot be read, and the way on */
  await setUp(page, { name: "Scanned CV", file: "scanned.pdf" });
  await page.getByText("We couldn’t read that file").waitFor();
  check(await page.getByText(/scan or a picture of a CV/).isVisible(), "a scan says it is a scan");
  const scanButtons = await page.locator(".cv-panel .cv-row .cv-btn").allInnerTexts();
  check(scanButtons[0] === "Paste the text", "for a scan, pasting the text is offered first", scanButtons.join(", "));
  await bothThemes(page, "import-failed");
  await page.getByRole("button", { name: "Paste the text" }).click();
  await page.waitForURL(/panel=replace-file/);
  const paste = page.getByRole("dialog");
  await paste.getByLabel("The text of your CV").fill("Maya Chen\nmaya.chen@example.com | Leeds\n\nEXPERIENCE\nPaid Media Manager, Northlight Agency\tMar 2021 – Present\n• Run Google Ads and Meta campaigns for six retail clients\n\nSKILLS\nGoogle Ads, Excel");
  await a11y(page, "paste-text dialog");
  await paste.getByRole("button", { name: "Read this text" }).click();
  await page.getByText("Sections to confirm").waitFor({ timeout: 30000 });
  check(await page.getByText("Pasted text · Pasted text").isVisible(), "pasted text is read into the same check");
  await page.goBack();
  await page.goForward();

  await setUp(page, { name: "Locked CV", file: "password.pdf" });
  await page.getByText(/password-protected/).waitFor();
  check(true, "a password-protected PDF says so");
  await page.getByRole("button", { name: "Choose another file" }).click();
  await page.getByRole("dialog").getByLabel("CV file").setInputFiles(path.join(FIXTURES, "maya-chen.writer.docx"));
  await page.getByText("Sections to confirm").waitFor({ timeout: 30000 });
  check(await page.getByText(/maya-chen\.writer\.docx · Word file/).isVisible(), "another file can replace it");

  await setUp(page, { name: "Old Word CV", file: "old-word.doc" });
  await page.getByText(/Save it as a PDF or a Word \(\.docx\) file/).waitFor();
  check(true, "an old .doc file says how to save it");
  const oldId = (await importOf(page, page.url().match(/imp_[a-f0-9]+/)[0])).versionId;
  await page.getByRole("button", { name: "Start empty instead" }).click();
  await page.waitForURL(/\/edit\/contact/);
  await page.getByText("Your CV is empty").waitFor();
  check((await cvOf(page, oldId)).name === "Old Word CV", "“Start empty instead” keeps the set-up answers and opens the empty CV");

  // Upload from inside an empty CV.
  await page.getByLabel("CV file").setInputFiles(path.join(FIXTURES, "amara-lindqvist.linkedin.pdf"));
  await page.waitForURL(/\/cv\/import\/imp_/, { timeout: 45000 });
  await page.getByText(/LinkedIn PDF/).waitFor();
  check(true, "LinkedIn’s “Save to PDF” layout is recognised");
  const liImport = page.url().match(/imp_[a-f0-9]+/)[0];
  check((await importOf(page, liImport)).versionId === oldId, "an upload from inside an empty CV goes into that CV");
  await page.goto(`${BASE}/cv/import/${liImport}/review/experience`);
  await page.getByLabel("Job title").first().waitFor();
  const titles = await page.getByLabel("Job title").evaluateAll((els) => els.map((e) => e.value));
  const orgs = await page.getByLabel("Employer", { exact: true }).evaluateAll((els) => els.map((e) => e.value));
  check(titles.join("|") === "Supply Chain Manager|Senior Supply Chain Analyst|Supply Chain Analyst" && orgs.join("|") === "Fjord Outdoor|Kestrel Sportswear|Kestrel Sportswear", "LinkedIn roles: the employer line comes first, and two roles share one employer", `${titles.join("|")} / ${orgs.join("|")}`);

  // Replace the file from the check itself, then discard an upload.
  await page.getByRole("button", { name: "Replace file" }).click();
  await page.getByRole("dialog").getByLabel("CV file").setInputFiles(path.join(FIXTURES, "priya-nair.table.docx"));
  await page.getByText("Sections to confirm").waitFor({ timeout: 30000 });
  check((await importOf(page, liImport)).draft.contact.fullName === "Priya Nair", "replacing the file replaces what was read");
  await page.getByRole("button", { name: "Discard upload" }).click();
  const discard = page.getByRole("dialog", { name: "Discard this upload?" });
  await discard.waitFor();
  await a11y(page, "discard dialog");
  await page.keyboard.press("Escape");
  await discard.waitFor({ state: "detached" });
  check(page.url().endsWith(`/cv/import/${liImport}`), "Escape closes the dialog without discarding");
  await page.getByRole("button", { name: "Discard upload" }).click();
  await discard.getByRole("button", { name: "Discard upload" }).click();
  await page.waitForURL(/\/edit\/contact/);
  await page.getByText("Your CV is empty").waitFor();
  check((await page.evaluate(async (id) => (await fetch(`/api/cv/imports/${id}`)).status, liImport)) === 404, "a discarded upload is deleted, and the CV is left empty");

  /* ------------------------------------------------------------------------- another account, and a phone */
  const b = await newUser(browser, "bob");
  await b.page.goto(`${BASE}/cv/import/${tomImport}`);
  await b.page.getByText("Upload not found").waitFor({ timeout: 15000 });
  await b.page.goto(`${BASE}/cv/import/${tomImport}/review/contact`);
  await b.page.getByText("Upload not found").waitFor({ timeout: 15000 });
  check(!(await b.page.getByText("Tom Reilly").count()), "another account cannot open her upload, and sees none of it");
  const refused = await b.page.evaluate(async (id) => {
    const out = [];
    out.push((await fetch(`/api/cv/imports/${id}`)).status);
    out.push((await fetch(`/api/cv/imports/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewed: ["contact"] }) })).status);
    out.push((await fetch(`/api/cv/imports/${id}/confirm`, { method: "POST" })).status);
    out.push((await fetch(`/api/cv/imports/${id}`, { method: "DELETE" })).status);
    return out.join(",");
  }, tomImport);
  check(refused === "404,404,404,404", "his attempts to read, change, open and discard it are all refused", refused);

  const p = await newUser(browser, "phone", PHONE);
  await setUp(p.page, { name: "Phone upload", file: "daniel-okoye.two-column.pdf" });
  await p.page.getByText("Sections to confirm").waitFor();
  await fitsWidth(p.page, "upload page on a phone");
  const phoneImport = p.page.url().match(/imp_[a-f0-9]+/)[0];
  await p.page.goto(`${BASE}/cv/import/${phoneImport}/review/experience`);
  await p.page.getByText("Check this").first().waitFor();
  check(!(await p.page.locator(".cv-source").isVisible()), "on a phone the fields show first, with the file a tap away");
  await fitsWidth(p.page, "check screen on a phone");
  await p.page.getByRole("button", { name: "See it in your file" }).click();
  await p.page.locator(".cv-source").waitFor();
  const phoneMarked = await markedText(p.page);
  check(phoneMarked.includes("Software Engineer"), "“See it in your file” opens the original with the passage marked", phoneMarked.join("|"));
  await p.page.screenshot({ path: path.join(OUT, "cv-review-phone-original.png"), fullPage: true });
  await p.page.getByRole("button", { name: "Back to the fields" }).click();
  await p.page.getByText("Check this").first().waitFor();
  check(true, "and one tap goes back to the field");
  await p.page.screenshot({ path: path.join(OUT, "cv-review-phone-fields.png"), fullPage: true });
  await a11y(p.page, "check screen on a phone");
  await p.page.getByRole("tab", { name: "Original" }).click();
  check(await p.page.locator(".cv-source").isVisible(), "the Fields / Original switch works too");

  check(a.errors.length + b.errors.length + p.errors.length === 0, "no page errors", [...a.errors, ...b.errors, ...p.errors].join("\n"));
});
