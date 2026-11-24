// Writing help, walked as new users in test mode (no AI keys: drafts are made by rule from the person's own words).
// Starting a role from notes, the helper on a bullet (rewrite, add the number, practise, save), the profile
// chooser, skills suggestions, and the achievements screen. Throughout: nothing is written that the person did not say.
const path = require("node:path");
const { chromium } = require("playwright");
const { BASE, PHONE, check, noForbidden, newUser, setUp, bothThemes, a11y, fitsWidth, run } = require("./cv-helpers.cjs");

const idOf = (page) => /\/cv\/v\/(cv_[a-f0-9]+)/.exec(page.url())[1];
const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const getBank = (page) => page.evaluate(async () => (await (await fetch("/api/cv/bank")).json()).achievements);
const saved = (page) => page.locator('[data-testid="save-state"]', { hasText: /^Saved$/ }).waitFor({ timeout: 15000 });
const onPaper = (page, text) => page.locator("svg.cv-paper text", { hasText: text }).first();
async function tab(page, name) {
  await page.getByRole("navigation", { name: "Sections" }).getByRole("link", { name, exact: true }).click();
  await page.locator('nav[aria-label="Sections"] a[aria-current="page"]', { hasText: new RegExp(`^${name}`) }).waitFor({ timeout: 15000 });
}
const digits = (s) => (s.match(/\d+/g) || []).join(",");

const DID = "I ran the weekly planning meeting for the Leeds site. I also trained new starters on the order system.";
const CHANGED = "We cut late orders over the year.";
const NUMBER = "about 12 new starters";

run("CV writing help", async (browser) => {
  /* ------------------------------------------------ a role started from notes */
  const a = await newUser(browser, "notes");
  let page = a.page;
  await page.goto(`${BASE}/cv/new`);
  await page.getByLabel("CV name").fill("Lee CV");
  await page.getByText("Experienced", { exact: true }).click();
  await page.getByText("UK", { exact: true }).click();
  await page.getByText("Speak or type", { exact: true }).click();
  await page.getByRole("button", { name: "Start with notes" }).click();
  await page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/capture\/new/, { timeout: 30000 });
  const leeId = idOf(page);
  await page.getByRole("heading", { name: "Tell me what you did" }).waitFor();
  for (const q of ["What were you responsible for?", "What changed because of your work?", "Is there a number you can stand behind?"]) check(await page.getByLabel(q).isVisible(), `the screen asks “${q}”`);
  check(await page.getByText("Nothing appears until you have answered.").isVisible(), "before any answer, no bullets are proposed");
  await noForbidden(page, "capture");

  // Nothing is written from a job title alone.
  await page.getByLabel("Job title").fill("Operations coordinator");
  await page.getByLabel("Employer", { exact: true }).fill("Example Works");
  await page.getByRole("button", { name: "Draft bullets" }).click();
  check(await page.getByText("Answer at least one of the first two questions. There is nothing to write from yet.").isVisible(), "with a job title and no answers, nothing is drafted: it asks for the person's own words");
  check((await page.getByTestId("proposed").count()) === 0, "no bullet was made from the job title");
  await bothThemes(page, "writing-capture-empty");

  await page.getByLabel("What were you responsible for?").fill(DID);
  await page.getByLabel("What changed because of your work?").fill(CHANGED);
  await page.getByLabel("Is there a number you can stand behind?").fill(NUMBER);
  await page.reload();
  await page.getByLabel("What were you responsible for?").waitFor();
  check((await page.getByLabel("What were you responsible for?").inputValue()) === DID && (await page.getByLabel("Job title").inputValue()) === "Operations coordinator", "the answers are kept on this device: a reload loses nothing");

  // Speaking: with no microphone the person is sent to typing, and no words are made up for them.
  await page.getByRole("group", { name: "How to answer" }).getByRole("button", { name: "Speak" }).click();
  await page.getByRole("button", { name: /^Record your answer: What were you responsible for/ }).click();
  await page.getByTestId("voice-note").waitFor();
  check(/microphone isn’t available, so type your answer instead/.test(await page.getByTestId("voice-note").innerText()), "with no microphone, it says so and switches to typing");
  check((await page.getByLabel("What were you responsible for?").inputValue()) === DID, "nothing was added to the answer");

  await page.getByRole("button", { name: "Draft bullets" }).click();
  await page.getByTestId("proposed").first().waitFor({ timeout: 20000 });
  const proposed = await page.getByRole("textbox", { name: /^Proposed bullet/ }).evaluateAll((els) => els.map((e) => e.value));
  check(JSON.stringify(proposed) === JSON.stringify(["Ran the weekly planning meeting for the Leeds site", "Trained about 12 new starters on the order system", "Cut late orders over the year"]), "three bullets are proposed, each made of the person's own sentences", JSON.stringify(proposed));
  check(proposed[1].includes("about 12"), "the number went into the bullet it was about, and “about” was kept");
  const notes = [DID, CHANGED, NUMBER].join("\n");
  const marks = await page.locator("mark.cv-mark").allInnerTexts();
  check(marks.length === 4 && marks.every((m) => notes.includes(m)), "each bullet is shown beside the exact words it came from", JSON.stringify(marks));
  const invented = digits(proposed.join(" ")).split(",").filter((d) => d && !notes.includes(d));
  check(invented.length === 0, "no figure appears that is not in the answers", invented.join(","));
  await bothThemes(page, "writing-capture");

  await page.getByRole("checkbox", { name: "Use bullet 3" }).uncheck();
  await page.getByRole("button", { name: "Use the 2 selected bullets" }).click();
  await page.waitForURL(/\/edit\/experience/, { timeout: 20000 });
  await page.getByLabel("Job title").waitFor();
  check((await page.getByLabel("Job title").inputValue()) === "Operations coordinator" && (await page.getByLabel("Employer", { exact: true }).inputValue()) === "Example Works", "the builder opens on the new role");
  check((await page.getByRole("textbox", { name: /^Bullet/ }).count()) === 2, "the two bullets chosen are in it, and the one left out is not");
  await onPaper(page, "Trained about 12 new starters").waitFor();
  check(true, "they are on the paper");
  await saved(page);
  let cv = await getCv(page, leeId);
  let role = cv.sections.find((s) => s.kind === "experience").entries[0];
  check(role.bullets.every((b) => b.sources.length >= 1 && b.sources.every((s) => notes.includes(s.text)) && /^ach_/.test(b.bankId)), "each bullet keeps the person's own words as its source, and is saved to their achievements", JSON.stringify(role.bullets.map((b) => b.sources)));
  check(role.bullets[1].sources.length === 2, "the bullet with the number has both passages as sources");
  check((await getBank(page)).length === 2, "the achievements hold the two bullets that were kept");

  /* ----------------------------------------------------- help with one bullet */
  await page.getByRole("button", { name: "Help with bullet 2" }).click();
  const help = page.getByTestId("bullet-help");
  await help.waitFor();
  check(!(await page.locator("svg.cv-paper").isVisible()), "Help opens in place of the paper");
  check((await help.getByTestId("help-bullet").innerText()) === "Trained about 12 new starters on the order system", "it shows the bullet");
  check((await help.getByText("You typed this.").isVisible()) && (await help.getByRole("list", { name: "Your own words this bullet was made from" }).innerText()).includes("I also trained new starters on the order system."), "and the person's own words it was made from");
  check(await help.getByRole("link", { name: "In your achievements" }).isVisible(), "it says the bullet is already in the achievements");
  await bothThemes(page, "writing-help");

  // Rewrite: a tight bullet is left alone.
  await help.getByRole("button", { name: "Rewrite" }).click();
  await help.getByTestId("help-status").waitFor();
  check(/already tight/.test(await help.getByTestId("help-status").innerText()), "asked to rewrite a tight bullet, it says there is nothing to change");
  await help.getByRole("button", { name: "Back to paper" }).click();
  check(await page.locator("svg.cv-paper").isVisible(), "“Back to paper” brings the page back");

  // Rewrite: a wordy bullet is offered a tighter wording beside the original.
  await page.getByRole("button", { name: "+ Add bullet" }).click();
  const wordy = "I successfully managed the stock room on a daily basis for 2 years";
  await page.getByRole("textbox", { name: "Bullet 3" }).fill(wordy);
  await saved(page);
  await page.getByRole("button", { name: "Help with bullet 3" }).click();
  await help.getByRole("button", { name: "Rewrite" }).click();
  let dialog = page.getByRole("dialog", { name: "Review the new wording" });
  await dialog.waitFor();
  check(/panel=review-draft/.test(page.url()), "the review has its own address");
  check((await dialog.getByTestId("draft-original").innerText()) === wordy && (await dialog.getByTestId("draft-proposed").innerText()) === "Managed the stock room daily for 2 years", "the original and the proposed wording are shown side by side", await dialog.getByTestId("draft-proposed").innerText());
  await bothThemes(page, "writing-review");
  await dialog.getByRole("button", { name: "Keep original" }).click();
  await dialog.waitFor({ state: "detached" });
  await help.getByRole("button", { name: "Back to paper" }).click();
  check((await page.getByRole("textbox", { name: "Bullet 3" }).inputValue()) === wordy, "“Keep original” changes nothing");
  await page.getByRole("button", { name: "Help with bullet 3" }).click();
  await help.getByRole("button", { name: "Rewrite" }).click();
  await dialog.getByRole("button", { name: "Use this wording" }).click();
  await help.getByTestId("help-status").waitFor();
  check((await help.getByTestId("help-bullet").innerText()) === "Managed the stock room daily for 2 years", "“Use this wording” puts the new wording in");
  await saved(page);
  cv = await getCv(page, leeId);
  role = cv.sections.find((s) => s.kind === "experience").entries[0];
  check(role.bullets[2].text === "Managed the stock room daily for 2 years" && role.bullets[2].sources[0].text === wordy, "the wording as it was is kept with the bullet as its source");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  check((await help.getByTestId("help-bullet").innerText()) === wordy, "Undo puts the old wording back");
  await page.getByRole("button", { name: "Redo", exact: true }).click();

  // A rewrite that changed the claim is refused, and the bullet stays as it was. (The check itself is tested in code; here the screen.)
  const refusal = "This rewrite changed your claim. It dropped “2”. Your original bullet is still in place.";
  await page.route("**/write/rewrite", (r) => r.fulfill({ json: { status: "refused", message: refusal, problems: [] } }));
  await help.getByRole("button", { name: "Rewrite" }).click();
  await help.getByTestId("refusal").waitFor();
  check((await help.getByTestId("refusal").innerText()) === refusal, "a refused rewrite says exactly what it changed");
  check((await help.getByTestId("help-bullet").innerText()) === "Managed the stock room daily for 2 years", "the bullet is still in place");
  check((await page.getByRole("dialog").count()) === 0, "the refused wording is not shown or offered");
  await bothThemes(page, "writing-refused");
  await help.getByRole("button", { name: "Clarify my notes" }).click();
  await page.waitForFunction(() => document.activeElement && document.activeElement.value === "Managed the stock room daily for 2 years", null, { timeout: 5000 });
  check(true, "“Clarify my notes” puts the cursor in the bullet");
  await page.unroute("**/write/rewrite");
  await page.route("**/write/rewrite", (r) => r.fulfill({ json: { status: "unavailable", message: "Rewriting needs the AI service, which isn’t available right now. Your bullet is unchanged, and you can still edit it yourself." } }));
  await page.getByRole("button", { name: "Help with bullet 3" }).click();
  await help.getByRole("button", { name: "Rewrite" }).click();
  await help.getByTestId("help-status").waitFor();
  check(/isn’t available right now\. Your bullet is unchanged/.test(await help.getByTestId("help-status").innerText()), "when the AI service is unavailable it says so, and the bullet is unchanged");
  await page.unroute("**/write/rewrite");

  // Add the number: it asks; it never supplies.
  await help.getByRole("button", { name: "Back to paper" }).click();
  await page.getByRole("button", { name: "Help with bullet 1" }).click();
  await help.getByRole("button", { name: "Add the number" }).click();
  dialog = page.getByRole("dialog", { name: "Add the number" });
  await dialog.waitFor();
  check((await dialog.getByLabel("Roughly how many? How much? How long?").inputValue()) === "", "“Add the number” asks “Roughly how many? How much? How long?” with an empty box");
  check(await dialog.getByText("We never suggest a number. Only you know it.").isVisible(), "and says it never suggests one");
  await bothThemes(page, "writing-number");
  await dialog.getByRole("button", { name: "Use this detail" }).click();
  check(await dialog.getByText("Type the detail, or choose “I don’t know”.").isVisible(), "with nothing typed, nothing is added");
  await dialog.getByRole("button", { name: "I don’t know" }).click();
  await help.getByTestId("help-status").waitFor();
  check((await help.getByTestId("help-bullet").innerText()) === "Ran the weekly planning meeting for the Leeds site", "“I don’t know” leaves the bullet as it is, with no number in it");
  await help.getByRole("button", { name: "Add the number" }).click();
  await dialog.getByLabel("Roughly how many? How much? How long?").fill("Roughly 40 meetings a year");
  await dialog.getByRole("button", { name: "Use this detail" }).click();
  dialog = page.getByRole("dialog", { name: "Review the new wording" });
  await dialog.waitFor();
  const merged = await dialog.getByTestId("draft-proposed").innerText();
  check(merged === "Ran the weekly planning meeting for the Leeds site, roughly 40 meetings a year", "the person's detail is set into their bullet, word for word, and stays an estimate", merged);
  await dialog.getByLabel("Wording to use").fill("Ran roughly 40 weekly planning meetings a year for the Leeds site");
  await dialog.getByRole("button", { name: "Use this wording" }).click();
  await help.getByTestId("help-status").waitFor();
  check((await help.getByTestId("help-bullet").innerText()) === "Ran roughly 40 weekly planning meetings a year for the Leeds site", "the person can reword the draft before using it");
  await saved(page);
  role = (await getCv(page, leeId)).sections.find((s) => s.kind === "experience").entries[0];
  check(role.bullets[0].sources.some((s) => s.text === "Roughly 40 meetings a year"), "the detail they gave is kept as a source");

  // Practise this claim.
  await help.getByRole("button", { name: "Practise this claim" }).click();
  dialog = page.getByRole("dialog", { name: "Practise this claim" });
  await dialog.waitFor();
  await page.waitForFunction(() => /\?/.test(document.querySelector('[data-testid="practice-question"]')?.textContent ?? ""), null, { timeout: 10000 });
  const question = await dialog.getByTestId("practice-question").innerText();
  check(question === "How did you arrive at roughly 40, and what did you do to get there?", "“Practise this claim” gives a question an interviewer may ask about that line", question);
  check((await dialog.getByRole("link", { name: "Open the Practice Hub" }).getAttribute("href")) === "/practice", "with a way into practice");
  await a11y(page, "practise dialog");
  await dialog.getByRole("button", { name: "Close" }).click();

  // Save to achievements, from Help.
  await help.getByRole("button", { name: "Back to paper" }).click();
  await page.getByRole("button", { name: "Help with bullet 3" }).click();
  await help.getByRole("button", { name: "Save to achievements" }).click();
  await help.getByRole("link", { name: "In your achievements" }).waitFor();
  check((await getBank(page)).length === 3, "“Save to achievements” saves the bullet");
  await help.getByRole("button", { name: "Back to paper" }).click();
  await saved(page);

  /* ------------------------------------------------------------- the profile */
  await tab(page, "Skills");
  await page.getByRole("button", { name: "+ Add skills" }).click();
  await page.getByLabel("Skills", { exact: true }).fill("Planning, stock control, staff training");
  await tab(page, "Profile");
  await page.getByRole("button", { name: "Draft my profile from my CV" }).click();
  const chooser = page.getByTestId("profile-chooser");
  await chooser.waitFor();
  check(/panel=choose-profile/.test(page.url()), "the profile chooser has its own address");
  await chooser.getByRole("button", { name: "Planning", exact: true }).click();
  await chooser.getByRole("button", { name: "stock control", exact: true }).click();
  await chooser.getByRole("button", { name: "Draft two versions" }).click();
  await chooser.getByRole("radio").first().waitFor({ timeout: 20000 });
  const versions = await chooser.locator("label.cv-choice span > span").allInnerTexts();
  check(versions.length === 2 && versions[0] !== versions[1], "two versions are offered, and they differ", JSON.stringify(versions));
  check(versions[0].startsWith("Operations coordinator at Example Works.") && versions[0].includes("Skilled in Planning and stock control."), "one opens with the role and the skills chosen", versions[0]);
  check(/^(Ran|Trained|Managed)/.test(versions[1]) && versions[1].includes("Operations coordinator at Example Works"), "the other opens with what the person did", versions[1]);
  const cvText = JSON.stringify(await getCv(page, leeId));
  const strange = digits(versions.join(" ")).split(",").filter((d) => d && !cvText.includes(d));
  check(strange.length === 0, "neither version contains a figure that is not in the CV", strange.join(","));
  await chooser.getByRole("radio").nth(1).check();
  await page.getByTestId("profile-preview").waitFor();
  await onPaper(page, "Profile").waitFor();
  await onPaper(page, "Operations coordinator at Example Works").waitFor();
  check((await page.locator('svg.cv-paper g[data-kind="heading"]').first().textContent()) === "Profile", "choosing a version shows it on the paper as a preview");
  check((await getCv(page, leeId)).sections.find((s) => s.kind === "summary").text === "", "the preview is not in the CV: nothing has been saved");
  await bothThemes(page, "writing-profile");
  await chooser.getByRole("button", { name: "Use this profile" }).click();
  await saved(page);
  check((await page.getByRole("textbox", { name: "Profile" }).inputValue()) === versions[1] && (await getCv(page, leeId)).sections.find((s) => s.kind === "summary").text === versions[1], "“Use this profile” puts the chosen version in the CV");
  await page.getByRole("button", { name: "Draft my profile from my CV" }).click();
  await chooser.getByRole("button", { name: "Draft two versions" }).click();
  await chooser.getByRole("radio").first().check();
  await chooser.getByRole("button", { name: "Keep what I have" }).click();
  check((await page.getByRole("textbox", { name: "Profile" }).inputValue()) === versions[1] && !(await page.getByTestId("profile-preview").isVisible()), "“Keep what I have” leaves the profile as it was and takes the preview away");

  /* ---------------------------------------------- a new CV: nothing to draft */
  const e = await newUser(browser, "empty");
  await setUp(e.page, { name: "Empty CV" });
  await tab(e.page, "Profile");
  await e.page.getByRole("button", { name: "Draft my profile from my CV" }).click();
  await e.page.getByTestId("profile-chooser").waitFor();
  check(await e.page.getByText("Add a role to Experience first. A profile is written last, from what is in your CV, and never from a job title alone.").isVisible(), "with an empty CV, no profile is drafted: it asks for a role first");
  check((await e.page.getByRole("button", { name: "Draft two versions" }).count()) === 0, "there is no button to draft from nothing");
  await tab(e.page, "Skills");
  check((await e.page.getByTestId("skill-suggestions").count()) === 0, "an empty CV with no advert gets no skill suggestions");
  const refused = await e.page.evaluate(async (id) => Promise.all(["bullets", "rewrite", "number", "profile"].map(async (t) => (await fetch(`/api/cv/versions/${id}/write/${t}`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status)), leeId);
  check(refused.join(",") === "404,404,404,404", "another account cannot use the writing help on someone else's CV", refused.join(","));

  /* ----------------------------------------------------------- skills to add */
  const b = await newUser(browser, "maya");
  page = b.page;
  await setUp(page, { name: "Maya CV", file: "maya-chen.writer.pdf" });
  const importId = page.url().split("/").pop();
  const mayaId = (await page.evaluate(async (imp) => (await fetch(`/api/cv/imports/${imp}/confirm`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).json(), importId)).versionId;
  const advert = "We need experience with Google Ads, Tableau and budget pacing. Knowledge of SQL is desirable.";
  await page.evaluate(async ({ id, advert }) => { const cv = (await (await fetch(`/api/cv/versions/${id}`)).json()).cv; await fetch(`/api/cv/versions/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: cv.rev, target: { title: "Paid media lead", employer: "Example Travel", advert } }) }); }, { id: mayaId, advert });
  await page.goto(`${BASE}/cv/v/${mayaId}/edit/skills`);
  const suggestions = page.getByTestId("skill-suggestions");
  await suggestions.waitFor({ timeout: 20000 });
  const names = await suggestions.locator("li b").allInnerTexts();
  check(names.includes("Tableau") && names.includes("SQL") && names.includes("budget pacing"), "skills the advert asks for are suggested", names.join(", "));
  check(!names.includes("Google Ads"), "a skill already in the Skills section is not suggested again", names.join(", "));
  const pacing = suggestions.locator('li[data-skill="budget pacing"]');
  check(/Shown by:\s*“Introduced weekly budget pacing that stopped overspend in peak season”/.test(await pacing.innerText()), "a skill the CV already shows comes with the line that shows it", await pacing.innerText());
  check(/Do you have this\?/.test(await suggestions.locator('li[data-skill="SQL"]').innerText()), "a skill found only in the advert starts unconfirmed: “Do you have this?”");
  await bothThemes(page, "writing-skills");
  await pacing.getByRole("button", { name: "Add skill budget pacing" }).click();
  check((await page.getByLabel("Skills", { exact: true }).first().inputValue()).includes("budget pacing"), "“Add skill” adds the evidenced skill");
  await suggestions.getByRole("button", { name: "No, I don’t have Tableau" }).click();
  check((await suggestions.locator('li[data-skill="Tableau"]').count()) === 0, "“No” takes the suggestion away, and adds nothing");
  await suggestions.getByRole("button", { name: "Yes, I have SQL" }).click();
  dialog = page.getByRole("dialog", { name: "Where have you used SQL?" });
  await dialog.waitFor();
  await dialog.getByRole("button", { name: "Add skill" }).click();
  check(await dialog.getByText("Say where you used it, in one line.").isVisible(), "“Yes” alone is not enough: it asks where the skill was used");
  check(!(await page.getByLabel("Skills", { exact: true }).first().inputValue()).includes("SQL"), "the skill is not added without that line");
  await a11y(page, "confirm skill dialog");
  const sqlLine = "Wrote SQL queries to pull weekly spend by campaign";
  await dialog.getByLabel("One line, in your own words").fill(sqlLine);
  await dialog.getByLabel("Add this line to a role").selectOption({ label: "Paid Media Manager · Northlight Agency" });
  await dialog.getByRole("button", { name: "Add skill" }).click();
  await dialog.waitFor({ state: "detached" });
  await saved(page);
  cv = await getCv(page, mayaId);
  const skillNames = cv.sections.find((s) => s.kind === "skills").groups.flatMap((g) => g.skills.map((k) => k.name));
  const firstRole = cv.sections.find((s) => s.kind === "experience").entries[0];
  check(skillNames.includes("SQL") && firstRole.bullets.some((x) => x.text === sqlLine), "with the line given, the skill is added and the line goes into the role chosen");
  check((await getBank(page)).some((x) => x.text === sqlLine && x.skills.includes("SQL")), "and the line is kept in the achievements as its evidence");
  await page.reload();
  await page.getByLabel("Skills", { exact: true }).first().waitFor();
  await page.waitForTimeout(1200);
  check((await page.locator('li[data-skill="Tableau"]').count()) === 0, "the skill declined stays declined after a reload");

  /* --------------------------------------- achievements: the list and reuse */
  await page.goto(`${BASE}/cv`);
  await page.getByRole("link", { name: "Achievements" }).click();
  await page.waitForURL(/\/cv\/bank/);
  await page.getByRole("heading", { name: "Achievements", level: 1 }).waitFor();
  await page.getByTestId("achievement-detail").waitFor();
  check((await page.locator(".cv-pick").count()) === 1 && /Used in 1 CV/.test(await page.locator(".cv-pick").first().innerText()), "the achievements list shows the saved line and that one CV uses it");
  await noForbidden(page, "achievements");
  await page.getByRole("button", { name: "Add achievement" }).click();
  dialog = page.getByRole("dialog", { name: "Add achievement" });
  await dialog.getByRole("button", { name: "Save achievement" }).click();
  check(await dialog.getByText("Write what you did.").first().isVisible(), "an empty achievement cannot be saved");
  const fresh = "Trained three new account executives on bid strategy";
  await dialog.getByLabel("What you did").fill(fresh);
  await dialog.getByLabel("Role").fill("Paid Media Manager");
  await dialog.getByLabel("Employer").fill("Northlight Agency");
  await bothThemes(page, "writing-bank-add");
  await dialog.getByRole("button", { name: "Save achievement" }).click();
  await page.getByRole("link", { name: fresh }).waitFor();
  check((await page.locator(".cv-pick").count()) === 2, "a typed achievement is added to the list");
  await page.getByRole("link", { name: fresh }).click();
  await page.waitForURL(/item=ach_/);
  const detail = page.getByTestId("achievement-detail");
  await detail.getByLabel("Wording").fill(`${fresh} in their first month`);
  await detail.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("link", { name: `${fresh} in their first month` }).waitFor();
  check(true, "its wording can be changed and saved");
  await bothThemes(page, "writing-bank");

  // Use it in the CV.
  await page.goto(`${BASE}/cv/v/${mayaId}/edit/experience`);
  await page.getByRole("button", { name: "Use a saved achievement" }).click();
  dialog = page.getByRole("dialog", { name: "Use a saved achievement" });
  await dialog.waitFor();
  await dialog.getByRole("button", { name: /^Use: Trained three/ }).waitFor();
  check(await dialog.getByText("Already in this entry").isVisible(), "a saved achievement already in the entry is marked, not offered twice");
  await a11y(page, "choose achievement dialog");
  await dialog.getByRole("button", { name: /^Use: Trained three new account executives/ }).click();
  await onPaper(page, "Trained three new account executives").waitFor();
  check(true, "“Use” adds it to the role as a bullet, in the saved wording");
  await saved(page);
  check((await getBank(page)).find((x) => x.text.startsWith(fresh)).usedIn.length === 1, "the achievement now shows the CV that uses it");

  // Private achievements are not offered; deleting one leaves the CV's line alone.
  await page.goto(`${BASE}/cv/bank`);
  await page.getByRole("link", { name: `${fresh} in their first month` }).click();
  await detail.getByRole("switch", { name: "Keep this achievement private" }).click();
  await detail.getByRole("button", { name: "Save changes" }).click();
  await page.locator(".cv-pick", { hasText: "Private" }).waitFor();
  await page.goto(`${BASE}/cv/v/${mayaId}/edit/experience`);
  await page.getByRole("button", { name: "Edit Senior PPC Executive" }).click();
  await page.getByRole("button", { name: "Use a saved achievement" }).click();
  await dialog.waitFor();
  check((await dialog.getByText("1 private achievement is not offered here.").isVisible()) && (await dialog.getByRole("button", { name: /^Use: Trained three/ }).count()) === 0, "a private achievement is not offered when building a CV");
  await dialog.getByRole("button", { name: "Close" }).click();
  await page.goto(`${BASE}/cv/bank`);
  await page.getByRole("link", { name: `${fresh} in their first month` }).click();
  await detail.getByRole("button", { name: "Delete" }).click();
  dialog = page.getByRole("dialog", { name: "Delete achievement" });
  await dialog.waitFor();
  check(await dialog.getByText("The line stays in the CV that uses it.").isVisible(), "deleting says the line stays in the CV that uses it");
  await dialog.getByRole("button", { name: "Delete achievement" }).click();
  await page.getByRole("link", { name: `${fresh} in their first month` }).waitFor({ state: "detached" });
  cv = await getCv(page, mayaId);
  check(cv.sections.find((s) => s.kind === "experience").entries[0].bullets.some((x) => x.text.startsWith(fresh)), "and it does");
  const theirs = await e.page.evaluate(async () => (await (await fetch("/api/cv/bank")).json()).achievements.length);
  check(theirs === 0, "another account sees none of these achievements");
  await e.page.goto(`${BASE}/cv/bank`);
  await e.page.getByText("You have no saved achievements yet").waitFor();
  check((await e.page.locator(".cv-pick").count()) === 0, "a new account's achievements are empty: no examples");
  await bothThemes(e.page, "writing-bank-empty");

  /* ----------------------------------- speaking, with a microphone, in test mode */
  const voice = await chromium.launch({ args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"] });
  try {
    const v = await newUser(voice, "voice", { permissions: ["microphone"] });
    await setUp(v.page, { name: "Voice CV" });
    const voiceId = idOf(v.page);
    await v.page.goto(`${BASE}/cv/v/${voiceId}/capture/new`);
    await v.page.getByRole("group", { name: "How to answer" }).getByRole("button", { name: "Speak" }).click();
    await v.page.getByRole("button", { name: /^Record your answer: What were you responsible for/ }).click();
    await v.page.getByRole("button", { name: /^Stop recording/ }).click({ timeout: 10000 });
    await v.page.getByTestId("voice-note").waitFor({ timeout: 15000 });
    check((await v.page.getByTestId("voice-note").innerText()) === "Speech-to-text isn’t switched on here. Type your answer instead.", "with speech-to-text off (test mode), a recording gets a plain message", await v.page.getByTestId("voice-note").innerText());
    check((await v.page.getByLabel("What were you responsible for?").inputValue()) === "", "and no stand-in words are put in the person's answer");
    check((await v.page.getByRole("group", { name: "How to answer" }).getByRole("button", { name: "Type" }).getAttribute("aria-pressed")) === "true", "it switches back to typing");
    check(v.errors.length === 0, "no page errors", v.errors.join("\n"));
  } finally {
    await voice.close();
  }

  /* ------------------------------------------------------------------ phone */
  const ph = await newUser(browser, "phone", PHONE);
  page = ph.page;
  await setUp(page, { name: "Phone CV" });
  const phoneId = idOf(page);
  await page.goto(`${BASE}/cv/v/${phoneId}/capture/new`);
  await page.getByLabel("Job title").fill("Shop assistant");
  await page.getByLabel("What were you responsible for?").fill("I ran the till and restocked the shelves each morning.");
  await page.getByRole("button", { name: "Draft bullets" }).click();
  await page.getByTestId("proposed").first().waitFor({ timeout: 20000 });
  await fitsWidth(page, "capture on a phone");
  await bothThemes(page, "writing-capture-phone");
  await page.getByRole("button", { name: "Use the selected bullet" }).click();
  await page.waitForURL(/\/edit\/experience/, { timeout: 20000 });
  await page.getByRole("button", { name: "Help with bullet 1" }).click();
  await page.getByTestId("bullet-help").waitFor();
  check(await page.getByTestId("bullet-help").isVisible(), "on a phone, Help opens in the paper view");
  await fitsWidth(page, "help on a phone");
  await page.getByTestId("bullet-help").getByRole("button", { name: "Add the number" }).click();
  await page.getByRole("dialog", { name: "Add the number" }).waitFor();
  await fitsWidth(page, "add the number on a phone");
  await a11y(page, "add the number on a phone");
  await page.goto(`${BASE}/cv/bank`);
  await page.locator(".cv-pick").first().waitFor();
  await fitsWidth(page, "achievements on a phone");

  for (const u of [a, b, e, ph]) check(u.errors.length === 0, "no page errors", u.errors.join("\n"));
});
