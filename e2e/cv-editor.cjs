// The builder, walked as new users: an empty CV typed in by hand with the paper redrawn as it is typed,
// a click on the paper opening its field, switching items off, reordering (menu and drag), undo and redo,
// every template, fonts, colour, spacing, page fitting, the order on the page, and the downloads.
// Every PDF and Word file downloaded here is opened and its text read back and compared with the CV.
const fs = require("node:fs");
const path = require("node:path");
const { BASE, OUT, PHONE, check, noForbidden, newUser, setUp, bothThemes, a11y, fitsWidth, run } = require("./cv-helpers.cjs");
const { readPdf, readDocx, squash, compareWithCv } = require("./cv-files.cjs");

const FILES = path.join(OUT, "cv-downloads");
fs.rmSync(FILES, { recursive: true, force: true });
fs.mkdirSync(FILES, { recursive: true });

const idOf = (page) => /\/cv\/v\/(cv_[a-f0-9]+)/.exec(page.url())[1];
const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const saved = (page) => page.locator('[data-testid="save-state"]', { hasText: /^Saved$/ }).waitFor({ timeout: 15000 });
/** Opens a tab of the form and waits until it is the one showing. */
async function tab(page, name) {
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
  await page.locator('nav[aria-label="Sections"] a[aria-current="page"]', { hasText: new RegExp(`^${name}`) }).waitFor({ timeout: 15000 });
}
/** The words drawn on the page that is showing. */
const paperText = async (page) => (await page.locator("svg.cv-paper text").allTextContents()).join(" ");
const onPaper = (page, text) => page.locator("svg.cv-paper text", { hasText: text }).first();
const pagesShown = async (page) => Number(/of (\d+)/.exec(await page.getByTestId("page-count").innerText())[1]);
const paperReady = (page) => page.locator('.cv-paperscroll[data-state="ready"]').waitFor({ timeout: 20000 });

let n = 0;
async function download(page, button) {
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 45000 }), page.getByRole("button", { name: button, exact: true }).click()]);
  const name = dl.suggestedFilename();
  const file = path.join(FILES, `${String(++n).padStart(2, "0")}-${name}`);
  await dl.saveAs(file);
  return { file, name };
}

/** Downloads both files, opens each, and checks its text against the saved CV. Returns what was read. */
async function downloadAndReadBack(page, id, label) {
  const pdf = await download(page, "Download PDF");
  const docx = await download(page, "Download Word");
  const cv = await getCv(page, id);
  const p = await readPdf(pdf.file);
  const d = await readDocx(docx.file);
  const cp = compareWithCv(p.text, cv);
  const cd = compareWithCv(d.text, cv);
  check(cp.missing.length === 0 && cp.leaked.length === 0, `${label}: the PDF, opened and read back, says everything in the CV (${cp.pieces} pieces) and nothing that is switched off`, `missing: ${JSON.stringify(cp.missing).slice(0, 300)} leaked: ${JSON.stringify(cp.leaked).slice(0, 200)}`);
  check(cd.missing.length === 0 && cd.leaked.length === 0, `${label}: the Word file, opened and read back, says everything in the CV and nothing that is switched off`, `missing: ${JSON.stringify(cd.missing).slice(0, 300)} leaked: ${JSON.stringify(cd.leaked).slice(0, 200)}`);
  return { pdf: { ...pdf, ...p }, docx: { ...docx, ...d }, cv };
}

/** A CV read from the sample upload and added without changes (the upload check itself is tested in cv-upload). */
async function uploadedCv(page, name = "Maya CV") {
  await setUp(page, { name, file: "maya-chen.writer.pdf" });
  const importId = page.url().split("/").pop();
  const made = await page.evaluate(async (imp) => (await fetch(`/api/cv/imports/${imp}/confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json(), importId);
  return made.versionId;
}

run("CV editor", async (browser) => {
  /* ---------------------------------------------- an empty CV, typed in by hand */
  const a = await newUser(browser, "fern");
  let page = a.page;
  await setUp(page, { name: "Fern CV", level: "Early career", region: "UK" });
  const fernId = idOf(page);
  await page.getByTestId("page-count").waitFor({ timeout: 20000 });
  check((await page.locator("svg.cv-paper text").count()) === 0, "a new CV's paper is blank: not one word is drawn on it");
  check(await page.getByText("Your CV will appear here as you fill it in.").isVisible(), "the blank paper says the CV will appear as it is filled in");
  check((await page.getByTestId("page-count").innerText()) === "Page 1 of 1", "the blank paper is one page");
  await noForbidden(page, "empty editor");
  check((await page.getByRole("button", { name: "Undo", exact: true }).isDisabled()) && (await page.getByRole("button", { name: "Redo", exact: true }).isDisabled()), "with nothing changed, Undo and Redo are off");
  await bothThemes(page, "builder-empty");

  await page.getByLabel("Name").pressSequentially("Fern ", { delay: 15 });
  await onPaper(page, "Fern").waitFor({ timeout: 5000 });
  check(true, "the paper shows the name as it is typed, before any save");
  // A pause after a space: the save that follows must not eat the space under the cursor.
  await saved(page);
  await page.getByLabel("Name").pressSequentially("Example", { delay: 15 });
  check((await page.getByLabel("Name").inputValue()) === "Fern Example", "pausing after a space and typing on keeps the space (a save never rewrites what is being typed)", await page.getByLabel("Name").inputValue());
  await onPaper(page, "Fern Example").waitFor({ timeout: 5000 });
  await page.getByLabel("Email").fill("fern@example.com");
  await page.getByLabel("Phone").fill("07700 900456");
  await page.getByLabel("Town or city").fill("York");
  await page.getByLabel("Link 1").fill("linkedin.com/in/fern-example");
  await saved(page);
  const contactLine = await paperText(page);
  check(["York", "fern@example.com", "07700 900456", "linkedin.com/in/fern-example"].every((t) => contactLine.includes(t)), "the contact line is drawn from the four contact fields", contactLine);
  check(!(await page.getByText("Your CV will appear here").isVisible()), "the blank-page message goes once there is content");

  await page.getByRole("button", { name: "Continue to Experience" }).click();
  await page.waitForURL(/\/edit\/experience/);
  check(await onPaper(page, "Fern Example").isVisible(), "moving to another tab keeps the paper as it was (nothing reloads)");
  await page.getByRole("button", { name: "+ Add role" }).click();
  await page.getByLabel("Job title").fill("Archive assistant");
  await page.getByLabel("Employer", { exact: true }).fill("Paper Kite Archive");
  await page.getByLabel("Employer context").fill("A public collection of 30,000 paper maps.");
  await page.getByLabel("Location").fill("York");
  await page.getByLabel("Start").fill("sept 2023");
  await page.getByText("I still do this").click();
  const bullets = ["Catalogued 3,200 maps in two years, recording the condition of each", "Wrote a handling guide for volunteers working with fragile maps – 40 pages, £0 budget", "Trained 40 volunteers to handle paper safely"];
  for (let i = 0; i < bullets.length; i++) {
    await page.getByRole("button", { name: "+ Add bullet" }).click();
    await page.getByRole("textbox", { name: `Bullet ${i + 1}` }).fill(bullets[i]);
  }
  await saved(page);
  let text = await paperText(page);
  check(text.includes("Archive assistant · Paper Kite Archive") && text.includes("Sep 2023 – Present · York") && text.includes("A public collection of 30,000 paper maps."), "the role's first line, its dates and place, and the line about the employer are on the paper", text.slice(0, 400));
  check(bullets.every((b) => squash(text).includes(squash(b))), "each bullet is on the paper word for word, punctuation and all");

  // The line being edited is marked on the paper, and only that line.
  await page.getByRole("textbox", { name: "Bullet 2" }).focus();
  let marked = await page.locator("svg.cv-paper g[data-marked]").allTextContents();
  check(marked.length === 1 && squash(marked[0]).includes(squash(bullets[1])), "the bullet being edited is marked on the paper, and only that bullet", JSON.stringify(marked));
  await page.getByLabel("Start").focus();
  marked = await page.locator("svg.cv-paper g[data-marked]").allTextContents();
  check(marked.length === 1 && marked[0].includes("Sep 2023"), "with the cursor in a date, the dates line is the one marked", JSON.stringify(marked));

  // A click on the paper opens the field it came from.
  await onPaper(page, "Trained 40 volunteers").click();
  await page.waitForFunction((want) => document.activeElement && document.activeElement.value === want, bullets[2], { timeout: 5000 });
  check(true, "clicking a bullet on the paper puts the cursor in that bullet");
  await onPaper(page, "fern@example.com").click();
  await page.waitForURL(/\/edit\/contact/);
  await page.waitForFunction(() => document.activeElement && document.activeElement.value === "fern@example.com", null, { timeout: 5000 });
  check(true, "clicking the email on the paper opens the Contact tab with the cursor in Email");
  await onPaper(page, "Archive assistant").click();
  await page.waitForURL(/\/edit\/experience/);
  await page.waitForFunction(() => document.activeElement && document.activeElement.value === "Archive assistant", null, { timeout: 5000 });
  check(true, "clicking the job title on the paper opens Experience with the cursor in Job title");

  // Education, skills and a profile, then the files.
  await tab(page, "Education");
  await page.getByRole("button", { name: "+ Add qualification" }).click();
  await page.getByLabel("Institution").fill("Example University");
  await page.getByLabel("Qualification").fill("BA (Hons)");
  await page.getByLabel("Subject").fill("History");
  await page.getByLabel("Start").fill("2018");
  await page.getByLabel("Finished").fill("2021");
  await page.getByLabel("Degree class or grade").fill("2:1");
  await tab(page, "Skills");
  await page.getByRole("button", { name: "+ Add skills" }).click();
  await page.getByLabel("Group name").fill("Collections");
  await page.getByLabel("Skills", { exact: true }).fill("Cataloguing, paper handling, condition reporting, volunteer induction");
  await tab(page, "Profile");
  const profile = "Archive assistant with two years’ experience caring for paper collections. Catalogued 3,200 maps and wrote the handling guide now used by 40 volunteers.";
  await page.getByRole("textbox", { name: "Profile" }).fill(profile);
  await saved(page);
  text = await paperText(page);
  check(text.includes("BA (Hons) History · Example University") && text.includes("2018 – 2021 · 2:1"), "education is drawn as “qualification subject · institution” with its years and grade", text.slice(0, 600));
  check(text.includes("Collections: ") && text.includes("Cataloguing, paper handling, condition reporting, volunteer induction"), "skills are drawn as one line per group");
  check(squash(text).includes(squash(profile)), "the profile is on the paper word for word");
  const headings = await page.locator('svg.cv-paper g[data-kind="heading"]').allTextContents();
  check(headings.join(",") === "Profile,Experience,Education,Skills", "the Standard template prints Profile, Experience, Education, Skills, in that order", headings.join(","));

  await tab(page, "Finish");
  await page.getByRole("heading", { name: "Files" }).waitFor();
  check((await page.getByTestId("status-pdf").innerText()) === "Unchecked" && (await page.getByTestId("status-docx").innerText()) === "Unchecked", "before anything is made, both files say “Unchecked”");
  const built = await downloadAndReadBack(page, fernId, "typed CV");
  check(built.pdf.name === "Fern Example - CV.pdf" && built.docx.name === "Fern Example - CV.docx", "the files are named “Fern Example - CV”", `${built.pdf.name} / ${built.docx.name}`);
  check(built.pdf.pages === 1 && Math.round(built.pdf.size[0]) === 595 && Math.round(built.pdf.size[1]) === 842, "the PDF is one A4 page", `${built.pdf.pages} ${built.pdf.size}`);
  check(built.pdf.title === "Fern Example – CV" && built.pdf.marked && !built.pdf.author, "the PDF is titled “Fern Example – CV”, is tagged for screen readers, and names no author", JSON.stringify([built.pdf.title, built.pdf.marked, built.pdf.author]));
  check(built.docx.tables === 0 && built.docx.paragraphs.some((p) => p.style === "Heading1" && p.text === "Fern Example") && built.docx.paragraphs.filter((p) => p.style === "Heading2").map((p) => p.text).join(",") === "Profile,Experience,Education,Skills", "the Word file uses real headings (name, then each section) and no tables", JSON.stringify(built.docx.paragraphs.slice(0, 4)));
  check(built.docx.paragraphs.filter((p) => p.style === "ListBullet").length === 3, "the Word file's bullets are a real list", String(built.docx.paragraphs.filter((p) => p.style === "ListBullet").length));
  check((await page.getByTestId("status-pdf").innerText()).startsWith("✓ Checked: reads back the same as your CV, one page"), "after the download the PDF says “Checked”, with its page count", await page.getByTestId("status-pdf").innerText());
  check((await pagesShown(page)) === built.pdf.pages, "the paper on screen and the PDF have the same number of pages");
  // The paper and the PDF break their lines in the same places: same words, same order.
  check(squash(await paperText(page)) === squash(built.pdf.text), "the paper on screen and the PDF carry exactly the same words in the same order");
  await bothThemes(page, "builder-finish");

  /* ------------------------------- switching off, reordering, undo and redo */
  const b = await newUser(browser, "maya");
  page = b.page;
  const mayaId = await uploadedCv(page);
  await page.goto(`${BASE}/cv/v/${mayaId}/edit/experience`);
  await page.getByTestId("page-count").waitFor({ timeout: 20000 });
  await onPaper(page, "Harbour Travel Group").waitFor();
  const roleOrder = async () => (await page.locator('svg.cv-paper g[data-kind="entry"]').allTextContents()).filter((t) => /Northlight|Harbour|Brightside/.test(t)).map((t) => t.split(" · ")[1]);
  check((await roleOrder()).join(",") === "Northlight Agency,Harbour Travel Group,Brightside Digital Ltd", "the three roles from the upload are on the paper in their order", (await roleOrder()).join(","));

  // Switch a role off: it leaves the paper at once and stays in the form.
  await page.getByRole("switch", { name: "Include Senior PPC Executive in this version" }).click();
  await page.waitForFunction(() => !document.querySelector("svg.cv-paper").textContent.includes("Harbour Travel Group"));
  check(true, "a role that is switched off leaves the paper at once");
  check(await page.locator('[data-entry][data-off]').getByText("Off in this version").isVisible(), "it stays in the form, marked “Off in this version”");
  check((await page.getByRole("heading", { name: "Senior PPC Executive" }).count()) === 1, "its title is still listed in the form");
  await saved(page);
  let cv = await getCv(page, mayaId);
  let exp = cv.sections.find((s) => s.kind === "experience");
  check(exp.entries.length === 3 && exp.entries[1].visible === false && exp.entries[1].bullets.length === 2, "nothing was deleted: the role and its bullets are saved, switched off");
  await page.getByRole("switch", { name: "Include Senior PPC Executive in this version" }).click();
  await onPaper(page, "Harbour Travel Group").waitFor();
  check(true, "switching it back on returns it to the paper");

  // One bullet off (the first role is the one open).
  const firstBullet = await page.getByRole("textbox", { name: "Bullet 2" }).inputValue();
  await page.getByRole("switch", { name: "Include bullet 2 in this version" }).click();
  await page.waitForFunction((t) => !document.querySelector("svg.cv-paper").textContent.replace(/\s+/g, "").includes(t), squash(firstBullet));
  check((await page.getByRole("textbox", { name: "Bullet 2" }).inputValue()) === firstBullet, "a bullet that is switched off leaves the paper and keeps its words in the form");

  // Move with the menu.
  await page.getByRole("button", { name: "Move PPC Executive", exact: true }).click();
  await page.getByRole("button", { name: "Move up", exact: true }).click();
  check((await roleOrder()).join(",") === "Northlight Agency,Brightside Digital Ltd,Harbour Travel Group", "Move up moves a role up one place, on the paper too", (await roleOrder()).join(","));
  await page.getByRole("button", { name: "Move PPC Executive", exact: true }).click();
  await page.getByLabel("Move to").selectOption("0");
  check((await roleOrder()).join(",") === "Brightside Digital Ltd,Northlight Agency,Harbour Travel Group", "Move to puts a role at the place chosen", (await roleOrder()).join(","));
  await page.getByRole("button", { name: "Move PPC Executive", exact: true }).click();
  check(await page.getByRole("button", { name: "Move up", exact: true }).isDisabled(), "the first item cannot be moved up");
  await page.keyboard.press("Escape");
  check(!(await page.getByRole("button", { name: "Move up", exact: true }).isVisible()), "Escape closes the Move menu");

  // Drag and drop (with the open role closed, so all three rows are on screen).
  await page.getByRole("button", { name: "Close Paid Media Manager" }).click();
  const grips = page.locator(".cv-entry > .cv-entryhead > .cv-grip");
  await grips.nth(0).dragTo(page.locator(".cv-entry").nth(2));
  await page.waitForFunction(() => [...document.querySelectorAll('svg.cv-paper g[data-kind="entry"]')].map((g) => g.textContent).filter((t) => /Northlight|Harbour|Brightside/.test(t))[2].includes("Brightside"), null, { timeout: 5000 });
  check((await roleOrder()).join(",") === "Northlight Agency,Harbour Travel Group,Brightside Digital Ltd", "dragging a role by its handle and dropping it on another moves it there", (await roleOrder()).join(","));

  // Undo and redo: each click is one step; typing is one step until a pause.
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  check((await roleOrder()).join(",") === "Brightside Digital Ltd,Northlight Agency,Harbour Travel Group", "Undo takes back the drag", (await roleOrder()).join(","));
  await page.keyboard.press("Control+z");
  check((await roleOrder()).join(",") === "Northlight Agency,Brightside Digital Ltd,Harbour Travel Group", "Ctrl+Z takes back the move before it", (await roleOrder()).join(","));
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  check((await roleOrder()).join(",") === "Brightside Digital Ltd,Northlight Agency,Harbour Travel Group", "Redo puts it back", (await roleOrder()).join(","));
  await page.keyboard.press("Control+Shift+z");
  check((await roleOrder()).join(",") === "Northlight Agency,Harbour Travel Group,Brightside Digital Ltd", "Ctrl+Shift+Z redoes the drag", (await roleOrder()).join(","));
  check(await page.getByRole("button", { name: "Redo", exact: true }).isDisabled(), "with nothing left to redo, Redo is off");

  await page.getByRole("button", { name: "Edit Paid Media Manager" }).click();
  const bulletBox = page.getByRole("textbox", { name: "Bullet 1" });
  const before = await bulletBox.inputValue();
  await bulletBox.click();
  await bulletBox.press("Control+End");
  await bulletBox.pressSequentially(" and cut reporting time by half", { delay: 12 });
  check((await bulletBox.inputValue()) === `${before} and cut reporting time by half`, "typing adds to the bullet");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  check((await bulletBox.inputValue()) === before, "one Undo takes back the whole of what was just typed, not a letter at a time", await bulletBox.inputValue());
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  check((await bulletBox.inputValue()) === `${before} and cut reporting time by half`, "Redo brings the typing back");
  await page.getByRole("button", { name: "Undo", exact: true }).click();

  // Remove, then undo from the line that appears.
  await page.getByRole("button", { name: "Remove bullet 3" }).click();
  check((await page.getByRole("textbox", { name: /^Bullet/ }).count()) === 2, "Remove takes the bullet out");
  await page.locator("p.cv-note", { hasText: "Removed." }).getByRole("button", { name: "Undo" }).click();
  check((await page.getByRole("textbox", { name: /^Bullet/ }).count()) === 3, "“Removed. Undo” puts it back");
  await saved(page);
  await page.reload();
  await page.getByTestId("page-count").waitFor({ timeout: 20000 });
  await onPaper(page, "Harbour Travel Group").waitFor();
  check((await roleOrder()).join(",") === "Northlight Agency,Harbour Travel Group,Brightside Digital Ltd", "after a reload the order is as it was left", (await roleOrder()).join(","));
  cv = await getCv(page, mayaId);
  exp = cv.sections.find((s) => s.kind === "experience");
  check(exp.entries[0].bullets[1].visible === false && exp.entries[0].bullets.length === 3, "and the switched-off bullet is still saved, still off");
  await bothThemes(page, "builder-experience");

  // Skills: one skill off.
  await tab(page, "Skills");
  await page.getByRole("button", { name: /^Excel/ }).click();
  await page.waitForFunction(() => !document.querySelector("svg.cv-paper").textContent.includes("Excel"));
  check((await page.getByRole("button", { name: /^Excel/ }).getAttribute("aria-pressed")) === "false", "a skill pressed off leaves the paper and shows as off");
  check((await page.getByLabel("Skills", { exact: true }).nth(1).inputValue()).includes("Excel"), "it stays in the list of skills");
  await saved(page);

  // A whole section off, from its own tab.
  await tab(page, "Certificates");
  await page.getByRole("switch", { name: "Include the Certificates section in this version" }).click();
  await page.waitForFunction(() => !document.querySelector("svg.cv-paper").textContent.includes("Google Ads Search Certification"));
  check(true, "a section that is switched off leaves the paper with everything in it");
  await saved(page);

  /* -------------------------------- Finish: every template, and their files */
  await tab(page, "Finish");
  await page.getByRole("heading", { name: "Files" }).waitFor();
  check((await page.getByRole("radio").count()) >= 8 && (await page.locator(".cv-template").count()) === 8, "eight templates are offered");
  const templates = ["Standard", "Graduate", "Compact", "Executive", "Portfolio", "Research", "Career Change", "Technical"];
  const sizes = new Set();
  for (const name of templates) {
    await page.locator(".cv-template", { hasText: name }).click();
    await paperReady(page);
    await saved(page);
    const shown = (await page.locator('svg.cv-paper g[data-kind="heading"]').allTextContents()).map((h) => h.toLowerCase());
    const pages = await pagesShown(page);
    const out = await downloadAndReadBack(page, mayaId, `${name} template`);
    const key = name.toLowerCase().replace(" ", "-");
    check(out.cv.design.template === key, `${name}: the choice is saved`, out.cv.design.template);
    const wordHeads = out.docx.paragraphs.filter((p) => p.style === "Heading2").map((p) => p.text.toLowerCase());
    check(wordHeads.join(",") === shown.join(","), `${name}: the Word file's sections are in the order shown on the paper (${shown.join(", ")})`, wordHeads.join(","));
    check(out.pdf.pages === pages, `${name}: the PDF has the same number of pages as the paper (${pages})`, `${out.pdf.pages}`);
    check(pages > 1 || squash(await paperText(page)) === squash(out.pdf.text), `${name}: the paper and the PDF carry the same words in the same order`);
    check(out.docx.tables === 0 && out.docx.paragraphs[0].style === "Heading1", `${name}: the Word file starts with the name as a real heading and has no tables`);
    sizes.add(fs.statSync(out.pdf.file).size);
  }
  check(sizes.size === templates.length, "the eight templates give eight different PDFs", [...sizes].join(","));

  // Fonts, colour, paper size, spacing.
  await page.locator(".cv-template", { hasText: "Standard" }).click();
  await paperReady(page);
  const fontOf = () => page.locator('svg.cv-paper g[data-kind="heading"] text').first().getAttribute("font-family");
  const fillOf = () => page.locator('svg.cv-paper g[data-kind="heading"] text').first().getAttribute("fill");
  check((await fontOf()).includes("inter") && (await fillOf()).toUpperCase() === "#3D4BD8", "Standard starts with Inter headings in indigo", `${await fontOf()} ${await fillOf()}`);
  await page.getByLabel("Fonts").selectOption({ label: "Lora headings, Inter text" });
  await page.waitForFunction(() => document.querySelector('svg.cv-paper g[data-kind="heading"] text').getAttribute("font-family").includes("lora"), null, { timeout: 15000 });
  check(true, "choosing another font pairing redraws the headings in it");
  await page.locator(".cv-swatch", { hasText: "Plum" }).click();
  await page.waitForFunction(() => document.querySelector('svg.cv-paper g[data-kind="heading"] text').getAttribute("fill").toUpperCase() === "#673E83");
  check(true, "choosing Plum redraws the headings in plum");
  const bodySizes = async () => [...new Set(await page.locator('svg.cv-paper g[data-kind="bullet"] text').evaluateAll((els) => els.map((e) => e.getAttribute("font-size"))))].join(",");
  check((await bodySizes()) === "10.5", "body text is 10.5 point", await bodySizes());
  const gapOf = () => page.evaluate(() => { const g = [...document.querySelectorAll('svg.cv-paper g[data-kind="heading"] text')]; return Number(g[1].getAttribute("y")) - Number(g[0].getAttribute("y")); });
  const normal = await gapOf();
  await page.locator(".cv-seg label", { hasText: "Tighter" }).click();
  await page.waitForFunction((was) => { const g = [...document.querySelectorAll('svg.cv-paper g[data-kind="heading"] text')]; return Number(g[1].getAttribute("y")) - Number(g[0].getAttribute("y")) < was - 0.5; }, normal);
  check((await bodySizes()) === "10.5", "Tighter spacing closes the gaps and leaves the type the same size", `${normal} → ${await gapOf()}, sizes ${await bodySizes()}`);
  await page.locator(".cv-seg label", { hasText: "Looser" }).click();
  await page.waitForFunction((was) => { const g = [...document.querySelectorAll('svg.cv-paper g[data-kind="heading"] text')]; return Number(g[1].getAttribute("y")) - Number(g[0].getAttribute("y")) > was + 0.5; }, normal);
  check((await bodySizes()) === "10.5", "Looser spacing opens them, type unchanged");
  await page.locator(".cv-seg label", { hasText: "US Letter" }).click();
  await page.waitForFunction(() => document.querySelector("svg.cv-paper").getAttribute("viewBox") === "0 0 612 792");
  await saved(page);
  const letter = await downloadAndReadBack(page, mayaId, "US Letter, Lora and plum");
  check(Math.round(letter.pdf.size[0]) === 612 && Math.round(letter.pdf.size[1]) === 792 && Math.round(letter.docx.size[0]) === 612, "on US Letter, the PDF and the Word file are both Letter size", `${letter.pdf.size} ${letter.docx.size}`);
  await page.locator(".cv-seg label", { hasText: "A4" }).click();
  await page.locator(".cv-seg label", { hasText: "Default" }).click();

  // The order on the page, separate from the form's tabs.
  const paperHeads = () => page.locator('svg.cv-paper g[data-kind="heading"]').allTextContents();
  check((await paperHeads()).join(",") === "Profile,Experience,Education,Skills,Languages", "Standard's own order, with Certificates off", (await paperHeads()).join(","));
  await page.getByRole("button", { name: "Move the Education section", exact: true }).click();
  await page.getByLabel("Move to").selectOption("0");
  await page.waitForFunction(() => document.querySelector('svg.cv-paper g[data-kind="heading"]').textContent === "Education");
  check((await paperHeads()).join(",") === "Education,Profile,Experience,Skills,Languages", "moving Education to the top of the page order moves it on the paper", (await paperHeads()).join(","));
  const tabsNow = await page.getByRole("navigation", { name: "Sections" }).getByRole("link").allInnerTexts();
  check(tabsNow.join(",").startsWith("Contact,Experience,Education,Skills"), "the form's tabs keep their own order", tabsNow.join(","));
  await saved(page);
  const reordered = await downloadAndReadBack(page, mayaId, "own page order");
  const eduAt = squash(reordered.pdf.text).indexOf("Education");
  check(eduAt >= 0 && eduAt < squash(reordered.pdf.text).indexOf("Profile"), "the PDF follows the new order: Education comes before Profile");
  check(reordered.docx.paragraphs.filter((p) => p.style === "Heading2").map((p) => p.text).join(",") === "Education,Profile,Experience,Skills,Languages", "the Word file's headings follow it too", reordered.docx.paragraphs.filter((p) => p.style === "Heading2").map((p) => p.text).join(","));
  await page.getByRole("button", { name: "Use Standard’s order" }).click();
  await page.waitForFunction(() => document.querySelector('svg.cv-paper g[data-kind="heading"]').textContent === "Profile");
  check(true, "“Use Standard’s order” puts the template's order back");

  // File name and check status.
  await page.getByLabel("File name").fill('Maya Chen: Paid Media / "CV"');
  await saved(page);
  check(/Out of date/.test(await page.getByTestId("status-pdf").innerText()), "after a change, the last check is marked “Out of date”", await page.getByTestId("status-pdf").innerText());
  await page.getByRole("button", { name: "Check both files" }).click();
  await page.locator('[data-testid="status-docx"]', { hasText: /Checked/ }).waitFor({ timeout: 30000 });
  check(/^✓ Checked/.test(await page.getByTestId("status-pdf").innerText()) && /^✓ Checked/.test(await page.getByTestId("status-docx").innerText()), "“Check both files” makes both, reads both back and marks both “Checked”");
  const named = await download(page, "Download PDF");
  check(named.name === "Maya Chen Paid Media CV.pdf", "the person's own file name is used, with characters a file name can't hold taken out", named.name);
  await page.getByLabel("File name").fill("");
  await saved(page);
  await a11y(page, "Finish, with files checked");

  // A character the fonts cannot draw: the file is withheld and the reason shown.
  await tab(page, "Contact");
  await page.getByLabel("Name", { exact: true }).fill("Maya 陈 Chen");
  await saved(page);
  await tab(page, "Finish");
  let got = false;
  page.once("download", () => (got = true));
  await page.getByRole("button", { name: "Download PDF", exact: true }).click();
  const loss = page.getByRole("dialog", { name: "The PDF file doesn’t match your CV" });
  await loss.waitFor({ timeout: 30000 });
  check((await loss.getByTestId("unsupported").innerText()) === "陈", "a character the fonts cannot draw is named, and the PDF is not sent");
  check(/panel=file-loss/.test(page.url()), "the explanation has its own address");
  await bothThemes(page, "builder-file-loss");
  await page.waitForTimeout(400);
  check(!got, "no PDF was downloaded");
  await loss.getByRole("button", { name: "Close" }).click();
  check(/Loss found/.test(await page.getByTestId("status-pdf").innerText()), "the PDF's line says “Loss found”", await page.getByTestId("status-pdf").innerText());
  await tab(page, "Contact");
  await page.getByLabel("Name", { exact: true }).fill("Maya Chen");
  await saved(page);

  /* ------------------------------------------------- too long for the target */
  const c = await newUser(browser, "long");
  page = c.page;
  await setUp(page, { name: "Long CV", level: "Experienced", region: "UK" });
  const longId = idOf(page);
  const hex = (i) => i.toString(16).padStart(16, "0");
  const role = (i, points) => ({ id: `e_${hex(i)}`, visible: true, title: `Operations manager ${i}`, org: `Example Works ${i}`, orgInfo: "", location: "Leeds", start: `20${10 + i}-01`, end: `20${11 + i}-01`, current: false, subject: "", grade: "", link: "", bullets: Array.from({ length: points }, (_, k) => ({ id: `b_${hex(i * 100 + k)}`, text: `Ran the weekly planning meeting for site ${i} and cut late orders by ${k + 3} percent over the year, working with four team leads`, visible: true, origin: "typed", sources: [] })) });
  const fill = async (roles, points) => {
    const status = await page.evaluate(
      async ({ id, entries }) => {
        const cv = (await (await fetch(`/api/cv/versions/${id}`)).json()).cv;
        const sections = cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries } : s));
        return (await fetch(`/api/cv/versions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: cv.rev, sections, contact: { ...cv.contact, fullName: "Lee Example", email: "lee@example.com" }, design: { ...cv.design, pageTarget: 1, density: "default" } }) })).status;
      },
      { id: longId, entries: Array.from({ length: roles }, (_, i) => role(i + 1, points)) },
    );
    await page.goto(`${BASE}/cv/v/${longId}/edit/finish`);
    await page.getByTestId("page-count").waitFor({ timeout: 20000 });
    await paperReady(page);
    return status;
  };

  // A little over one page: tighter spacing is enough. One-line bullets are added one at a time until a second page appears.
  const shortRoles = (count) => Array.from({ length: 5 }, (_, i) => ({ ...role(i + 1, 0), bullets: Array.from({ length: Math.floor(count / 5) + (i < count % 5 ? 1 : 0) }, (_, k) => ({ id: `b_${hex(i * 100 + k)}`, text: `Cut late orders at site ${i + 1} by ${k + 3} percent over the year`, visible: true, origin: "typed", sources: [] })) }));
  const put = (entries) =>
    page.evaluate(
      async ({ id, entries }) => {
        const cv = (await (await fetch(`/api/cv/versions/${id}`)).json()).cv;
        const sections = cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries } : s));
        await fetch(`/api/cv/versions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: cv.rev, sections, contact: { ...cv.contact, fullName: "Lee Example", email: "lee@example.com" }, design: { ...cv.design, pageTarget: 1, density: "default" } }) });
        return (await (await fetch(`/api/cv/versions/${id}/check`, { method: "POST" })).json()).pdf.pages;
      },
      { id: longId, entries },
    );
  let count = 20;
  while ((await put(shortRoles(count))) === 1 && count < 70) count++;
  await page.goto(`${BASE}/cv/v/${longId}/edit/finish`);
  await page.getByTestId("page-count").waitFor({ timeout: 20000 });
  await paperReady(page);
  check((await pagesShown(page)) === 2, `a CV of five roles and ${count} bullets runs just onto a second page`, String(await pagesShown(page)));
  check(await page.getByTestId("over-target").isVisible(), "the paper says it runs to 2 pages against a target of one");
  const sizesBefore = await page.locator("svg.cv-paper text").evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("font-size")))].sort().join(","));
  await page.getByRole("button", { name: "See what runs over" }).click();
  const overflow = page.getByRole("dialog", { name: "Fit to one page" });
  await overflow.waitFor();
  check(/panel=page-overflow/.test(page.url()), "the fitting dialog has its own address");
  const offer = overflow.getByRole("button", { name: "Use tighter spacing" });
  if (await offer.isVisible()) {
    await bothThemes(page, "builder-overflow-fits");
    await offer.click();
    await page.waitForFunction(() => /of 1$/.test(document.querySelector('[data-testid="page-count"]').textContent.trim()), null, { timeout: 8000 });
    const sizesAfter = await page.locator("svg.cv-paper text").evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("font-size")))].sort().join(","));
    check(sizesAfter === sizesBefore, "tighter spacing brings it onto one page with every type size unchanged", `${sizesBefore} → ${sizesAfter}`);
    check(!(await page.getByTestId("over-target").isVisible()), "the over-target note goes");
    await saved(page);
    check((await getCv(page, longId)).design.density === "tighter", "the spacing chosen is saved");
  } else {
    check(false, "a CV just over one page is offered tighter spacing");
  }

  // Far too long: nothing is cropped or shrunk; the lines that run over are listed.
  await fill(9, 6);
  const longPages = await pagesShown(page);
  check(longPages >= 3, "a CV of nine long roles runs to three pages or more", String(longPages));
  await page.getByRole("button", { name: "Fit to one page" }).click();
  await overflow.waitFor();
  check(await overflow.getByText(/It is never cropped and the type is never made smaller/).isVisible(), "when even the tightest spacing is not enough, it says so: nothing is cropped or shrunk");
  const overRows = overflow.locator(".cv-overlist li");
  check((await overRows.count()) > 3, "the lines past the target are listed");
  await bothThemes(page, "builder-overflow-list");
  const offBefore = (JSON.stringify(await getCv(page, longId)).match(/"visible":false/g) || []).length;
  await overRows.first().getByRole("button", { name: /^Switch off/ }).click();
  await saved(page);
  const after = await getCv(page, longId);
  const expAfter = after.sections.find((s) => s.kind === "experience");
  check(expAfter.entries.length === 9 && expAfter.entries.every((e) => e.bullets.length === 6), "“Switch off” deletes nothing: all nine roles and their bullets are still saved");
  check((JSON.stringify(after).match(/"visible":false/g) || []).length === offBefore + 1, "exactly one item was switched off, so it is left off the page");
  await overRows.nth(1).getByRole("button", { name: /^Shorten/ }).click();
  await page.waitForURL(/\/edit\/experience/);
  await page.waitForFunction(() => document.activeElement && /^(TEXTAREA|INPUT)$/.test(document.activeElement.tagName) && document.activeElement.value.length > 3, null, { timeout: 5000 });
  check(true, "“Shorten” opens the line's own field");
  await tab(page, "Finish");
  await page.getByRole("button", { name: "Fit to one page" }).click();
  await overflow.getByRole("button", { name: "Use two pages instead" }).click();
  await saved(page);
  check((await getCv(page, longId)).design.pageTarget === 2, "“Use two pages instead” changes the target");
  const long = await downloadAndReadBack(page, longId, "a three-page CV");
  check(long.pdf.pages === (await pagesShown(page)) && long.pdf.pages >= 3, "the long PDF has every page the paper shows: nothing was cut to fit", `${long.pdf.pages}`);
  await page.getByRole("button", { name: "Next page" }).click();
  check((await page.getByTestId("page-count").innerText()).startsWith("Page 2 of"), "Next page turns the paper to page 2");
  await page.getByRole("button", { name: "Zoom in" }).click();
  check(await page.getByRole("button", { name: "100%" }).isVisible(), "Zoom in shows the page at full size");
  await page.getByRole("button", { name: "Text view" }).click();
  check(await page.locator(".cv-textview").getByRole("button", { name: "Lee Example" }).isVisible(), "Text view shows the CV as plain readable text");
  await a11y(page, "Text view");
  await page.locator(".cv-textview").getByRole("button", { name: "lee@example.com" }).click();
  await page.waitForURL(/\/edit\/contact/);
  check(true, "a passage in Text view opens its field too");

  /* ----------------------------------------- the same CV changed in two tabs */
  page = a.page;
  const cvUrl = `${BASE}/cv/v/${fernId}/edit/contact`;
  const conflict = async (choose) => {
    const stale = await a.context.newPage();
    await stale.goto(cvUrl);
    await stale.getByLabel("Name").waitFor();
    await page.goto(cvUrl);
    await page.getByLabel("Phone").fill(`07700 9${String(Date.now()).slice(-5)}`);
    await saved(page);
    const fresh = await page.getByLabel("Phone").inputValue();
    await stale.getByLabel("Town or city").fill("Leeds");
    await stale.getByRole("button", { name: "Compare and choose" }).click({ timeout: 15000 });
    const dialog = stale.getByRole("dialog", { name: "Two copies of this CV" });
    await dialog.waitFor();
    return { stale, dialog, fresh, done: () => stale.close() };
  };
  let k = await conflict();
  check(await k.stale.getByText("Changed somewhere else").first().isVisible(), "a save from an out-of-date tab is refused, and the tab says the CV was changed somewhere else");
  const both = await k.dialog.locator(".cv-compare").first().innerText();
  check(both.includes("Leeds") && both.includes(k.fresh) && /This copy/i.test(both) && /The other copy/i.test(both), "the two copies are shown side by side, with what differs", both.replace(/\n/g, " | "));
  let server = await getCv(page, fernId);
  check(server.contact.phone === k.fresh && server.contact.location === "York", "nothing has been overwritten while the choice is open");
  await bothThemes(k.stale, "builder-two-copies");
  await k.dialog.getByRole("button", { name: "Save this copy as a separate version" }).click();
  await k.stale.waitForURL((u) => /\/cv\/v\/cv_/.test(u.pathname) && !u.pathname.includes(fernId), { timeout: 15000 });
  const copyId = idOf(k.stale);
  const copy = await getCv(page, copyId);
  server = await getCv(page, fernId);
  check(copy.name === "Copy of Fern CV" && copy.contact.location === "Leeds" && server.contact.location === "York" && server.contact.phone === k.fresh, "“Save as a separate version” keeps both: the copy has this tab's change, the original has the other's", JSON.stringify([copy.name, copy.contact.location, server.contact.location]));
  await k.done();

  k = await conflict();
  await k.dialog.getByRole("button", { name: "Use the other copy" }).click();
  check((await k.stale.getByLabel("Town or city").inputValue()) === "York" && (await k.stale.getByLabel("Phone").inputValue()) === k.fresh, "“Use the other copy” shows the other copy here and drops this tab's change");
  await saved(k.stale);
  await k.done();

  k = await conflict();
  await k.dialog.getByRole("button", { name: "Keep this copy" }).click();
  await saved(k.stale);
  server = await getCv(page, fernId);
  check(server.contact.location === "Leeds", "“Keep this copy” saves this tab's change, by choice and not by accident", JSON.stringify(server.contact));
  await k.done();

  /* --------------------------------------------- the list: rename, copy, delete */
  await page.goto(`${BASE}/cv`);
  await page.getByRole("button", { name: "Rename Fern CV" }).click();
  let dialog = page.getByRole("dialog", { name: "Rename" });
  await dialog.waitFor();
  check(/panel=rename&item=cv_/.test(page.url()), "the rename dialog has its own address");
  await page.goBack();
  await dialog.waitFor({ state: "detached" });
  check(true, "Back closes it");
  await page.getByRole("button", { name: "Rename Fern CV" }).click();
  await dialog.getByLabel("CV name").fill("");
  await dialog.getByRole("button", { name: "Save name" }).click();
  check(await dialog.getByText("Give your CV a name.").isVisible(), "a CV cannot be renamed to nothing");
  await dialog.getByLabel("CV name").fill("Fern – archives");
  await bothThemes(page, "list-rename");
  await dialog.getByRole("button", { name: "Save name" }).click();
  await page.getByRole("link", { name: "Fern – archives" }).waitFor();
  check((await getCv(page, fernId)).name === "Fern – archives", "the new name is saved");

  await page.getByRole("button", { name: "Duplicate Fern – archives" }).click();
  await page.getByRole("dialog", { name: "Duplicate" }).getByRole("button", { name: "Duplicate" }).click();
  await page.getByRole("link", { name: "Copy of Fern – archives", exact: true }).waitFor();
  check(true, "Duplicate makes “Copy of Fern – archives”");
  const rows = await page.locator(".cv-pick").count();
  await page.getByRole("button", { name: "Delete Copy of Fern – archives" }).click();
  dialog = page.getByRole("dialog", { name: "Delete" });
  await dialog.waitFor();
  check(await dialog.getByText("This can’t be undone.").isVisible(), "deleting asks first, and says it can’t be undone");
  await bothThemes(page, "list-delete");
  await dialog.getByRole("button", { name: "Cancel" }).click();
  check((await page.locator(".cv-pick").count()) === rows, "Cancel deletes nothing");
  await page.getByRole("button", { name: "Delete Copy of Fern – archives" }).click();
  await dialog.getByRole("button", { name: "Delete CV" }).click();
  await page.getByRole("link", { name: "Copy of Fern – archives", exact: true }).waitFor({ state: "detached" });
  check((await page.locator(".cv-pick").count()) === rows - 1 && (await page.getByRole("link", { name: "Fern – archives", exact: true }).isVisible()), "Delete removes that CV and only that one");
  await bothThemes(page, "list");

  // Someone else cannot download, check or copy it.
  const other = await b.page.evaluate(
    async (id) => [(await fetch(`/api/cv/versions/${id}/export?format=pdf`)).status, (await fetch(`/api/cv/versions/${id}/check`, { method: "POST" })).status, (await fetch(`/api/cv/versions/${id}/duplicate`, { method: "POST" })).status],
    fernId,
  );
  check(other.join(",") === "404,404,404", "another account cannot download, check or copy this CV", other.join(","));

  /* ----------------------------------------------------- tablet and phone */
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto(`${BASE}/cv/v/${fernId}/edit/experience`);
  await page.getByTestId("page-count").waitFor({ state: "attached", timeout: 20000 });
  const seg = page.getByRole("group", { name: "Show" });
  check((await seg.isVisible()) && !(await page.locator("svg.cv-paper").isVisible()), "at tablet width there is one pane, with an Edit / Paper switch");
  await seg.getByRole("button", { name: "Paper" }).click();
  check((await page.locator("svg.cv-paper").isVisible()) && !(await page.getByRole("button", { name: "+ Add role" }).isVisible()), "Paper shows the page in place of the form");
  await onPaper(page, "Archive assistant · Paper Kite Archive").click();
  await page.waitForFunction(() => document.activeElement && document.activeElement.value === "Archive assistant", null, { timeout: 5000 });
  check(await page.getByRole("button", { name: "+ Add role" }).isVisible(), "tapping a passage switches back to Edit with the cursor in its field");
  await fitsWidth(page, "tablet editor");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/cv/v/${fernId}/edit/experience`);
  await page.getByTestId("page-count").waitFor({ timeout: 20000 });
  check((await page.locator("svg.cv-paper").isVisible()) && (await page.getByRole("button", { name: "+ Add role" }).isVisible()) && !(await seg.isVisible()), "at desktop width the form and the paper sit side by side");
  const box = await page.locator(".cv-layout").evaluate((el) => [...el.children].map((c) => Math.round(c.getBoundingClientRect().width)));
  check(Math.abs(box[0] - 552) <= 2 && Math.abs(box[1] - 616) <= 2, "at 1440 the form is 552px and the paper pane 616px, as designed", box.join(" / "));
  await tab(page, "Finish");
  await page.getByRole("heading", { name: "Files" }).waitFor();
  const fbox = await page.locator(".cv-layout").evaluate((el) => [...el.children].map((c) => Math.round(c.getBoundingClientRect().width)));
  check(Math.abs(fbox[0] - 352) <= 2 && Math.abs(fbox[1] - 816) <= 2, "on Finish the settings are 352px and the paper 816px", fbox.join(" / "));

  const ph = await newUser(browser, "phone", PHONE);
  page = ph.page;
  await setUp(page, { name: "Phone CV", level: "Experienced", region: "US" });
  const phoneId = idOf(page);
  await page.getByLabel("Name").waitFor();
  check(!(await page.getByRole("navigation", { name: "Sections" }).isVisible()) && (await page.getByLabel("Section", { exact: true }).isVisible()), "on a phone the tabs become a section picker");
  await page.getByLabel("Name").fill("Sam Example");
  await page.getByLabel("Email").fill("sam@example.com");
  await page.getByLabel("Section", { exact: true }).selectOption({ label: "Experience" });
  await page.waitForURL(/\/edit\/experience/);
  await page.getByRole("button", { name: "+ Add role" }).click();
  await page.getByLabel("Job title").fill("Store manager");
  await page.getByLabel("Employer", { exact: true }).fill("Example Outfitters");
  await page.getByRole("button", { name: "+ Add bullet" }).click();
  await page.getByRole("textbox", { name: "Bullet 1" }).fill("Opened two new stores and hired 30 staff");
  await page.getByRole("button", { name: "+ Add bullet" }).click();
  await page.getByRole("textbox", { name: "Bullet 2" }).fill("Cut stock loss by 12% in a year");
  await saved(page);
  await fitsWidth(page, "phone editor");
  const small = await page.locator(".cv-switch, .cv-controls .cv-btn, .cv-seg button, .cv-bar .cv-btn").evaluateAll((els) => els.filter((e) => e.offsetParent).map((e) => `${e.getAttribute("aria-label") || e.textContent}: ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`).filter((t) => Number(/x(\d+)$/.exec(t)[1]) < 44 || Number(/: (\d+)x/.exec(t)[1]) < 44));
  check(small.length === 0, "on a phone every switch and button in the builder is at least 44px each way", small.join(" ¦ "));
  check(!(await page.locator(".cv-grip").first().isVisible()), "on a touch screen the drag handles are hidden: the Move menu does the job");
  await page.getByRole("button", { name: "Move bullet 2", exact: true }).click();
  await page.getByRole("button", { name: "Move up", exact: true }).click();
  check((await page.getByRole("textbox", { name: "Bullet 1" }).inputValue()) === "Cut stock loss by 12% in a year", "Move up reorders a bullet on a phone");
  await bothThemes(page, "builder-phone");
  await page.getByRole("group", { name: "Show" }).getByRole("button", { name: "Paper" }).click();
  await onPaper(page, "Sam Example").waitFor();
  const sheet = await page.locator("svg.cv-paper").evaluate((e) => [e.getBoundingClientRect().width, window.innerWidth]);
  check(sheet[0] <= sheet[1] && sheet[0] > sheet[1] * 0.8, "on a phone the paper opens fitted to the width of the screen", sheet.join(" / "));
  check((await page.locator("svg.cv-paper").getAttribute("viewBox")) === "0 0 612 792", "a US resume is drawn on Letter paper");
  await fitsWidth(page, "phone paper");
  await page.getByRole("button", { name: "Text view" }).click();
  await page.locator(".cv-textview").getByRole("button", { name: "Opened two new stores and hired 30 staff" }).click();
  await page.waitForFunction(() => document.activeElement && document.activeElement.value === "Opened two new stores and hired 30 staff", null, { timeout: 5000 });
  check(true, "on a phone, tapping a line in Text view opens Edit with the cursor in that line");
  await page.getByLabel("Section", { exact: true }).selectOption({ label: "Finish" });
  await page.getByRole("heading", { name: "Files" }).waitFor();
  await saved(page);
  const us = await downloadAndReadBack(page, phoneId, "US resume, on a phone");
  check(us.pdf.name === "Sam Example - Resume.pdf" && us.pdf.title === "Sam Example – Resume" && Math.round(us.pdf.size[0]) === 612, "a US version downloads as “Sam Example - Resume.pdf”, on Letter", `${us.pdf.name} ${us.pdf.title} ${us.pdf.size}`);
  check(squash(us.pdf.text).indexOf("Cutstockloss") < squash(us.pdf.text).indexOf("Openedtwonewstores"), "the bullets are in the file in the order they were moved to");
  await fitsWidth(page, "phone Finish");
  await bothThemes(page, "builder-phone-finish");

  // The export address from the design's screen map leads to the files on the Finish tab.
  await a.page.goto(`${BASE}/cv/v/${fernId}/export`);
  await a.page.waitForURL(/\/edit\/finish/);
  await a.page.getByRole("heading", { name: "Files" }).waitFor();
  check(true, "/cv/v/[id]/export opens the Finish tab, where the files are");

  for (const u of [a, b, c, ph]) check(u.errors.length === 0, "no page errors", u.errors.join("\n"));
});
