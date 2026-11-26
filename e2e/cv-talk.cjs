// The CV assistant ("Talk it through"), walked as a new user in test mode (no AI keys: edits are made by rule
// from the person's own words). A CV is built by conversation; each reply's edits show on the paper and are saved;
// nothing appears that the person didn't say; Undo takes a reply's edits back; the conversation survives a reload.
const { BASE, check, noForbidden, newUser, bothThemes, a11y, fitsWidth, run } = require("./cv-helpers.cjs");

const idOf = (page) => /\/cv\/v\/(cv_[a-f0-9]+)/.exec(page.url())[1];
const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const saved = (page) => page.locator('[data-testid="save-state"]', { hasText: /^Saved$/ }).waitFor({ timeout: 15000 });
const onPaper = (page, text) => page.locator("svg.cv-paper text", { hasText: text }).first();
const replies = (page) => page.getByTestId("msg-assistant");
const lastReply = async (page) => (await replies(page).last().innerText()).replace(/\s+/g, " ");
const digits = (s) => s.match(/\d+/g) || [];
const experience = (cv) => cv.sections.find((s) => s.kind === "experience");
/** Colours are checked once things have finished fading in: halfway through, any text is too faint. */
const settled = (page) => page.waitForTimeout(600);

/** Types a message and waits for the reply and for its edits to be saved. */
async function send(page, text) {
  const before = await replies(page).count();
  await page.getByLabel("Your answer").fill(text);
  await page.getByLabel("Your answer").press("Enter");
  await replies(page).nth(before).waitFor({ timeout: 30000 });
  await saved(page);
  return lastReply(page);
}

const SAID = [
  "I'm going for a Data Analyst role at Monzo",
  "My name is Sam Okafor. My email is sam.okafor@example.com and my phone is 07700 900123. I live in Leeds.",
  "I work as a data analyst at Acme Payroll since March 2021.",
  "I built the SQL checks that catch payroll errors before pay day. We cut payroll errors from about 40 a month to 5.",
];

run("CV assistant", async (browser) => {
  const a = await newUser(browser, "talk");
  const page = a.page;

  /* ------------------------------------------------------- starting by talking */
  await page.goto(`${BASE}/cv/new`);
  await page.getByLabel("CV name").fill("Sam CV");
  await page.getByText("Experienced", { exact: true }).click();
  await page.getByText("UK", { exact: true }).click();
  await page.getByText("Talk it through with the CV assistant", { exact: true }).click();
  await page.getByRole("button", { name: "Start talking" }).click();
  await page.waitForURL(/\/cv\/v\/cv_[a-f0-9]+\/talk$/, { timeout: 30000 });
  const id = idOf(page);
  await replies(page).first().waitFor();
  check(/What job are you going for\?/.test(await lastReply(page)), "the assistant opens by asking what job the CV is for");
  check(/I ask for a number rather than guess one/.test(await lastReply(page)), "it says up front that it asks rather than guesses");
  check(await page.getByLabel("Your answer").isVisible() && (await page.getByTestId("talk-mic").isVisible()), "the message box and the microphone are on screen from the start");
  await page.getByText(/Test mode: lines are made from your own sentences/).waitFor();
  check(true, "in test mode it says the lines are made by rule from the person's own sentences");
  await noForbidden(page, "talk (start)");
  await settled(page);
  await bothThemes(page, "talk-start");

  /* --------------------------------------------------- a CV, one reply at a time */
  let said = await send(page, SAID[0]);
  check(said.includes("1 change made") && said.includes("Target job Data Analyst at Monzo"), "the target job is set from what was said, and the reply lists the change", said);
  said = await send(page, SAID[1]);
  check(said.includes("4 changes made") && said.includes("Contact · Name Sam Okafor") && said.includes("Contact · Email sam.okafor@example.com") && said.includes("Contact · Phone 07700 900123") && said.includes("Contact · Location Leeds"), "name, email, phone and town are set from one message, each listed", said);
  await onPaper(page, "Sam Okafor").waitFor({ timeout: 15000 });
  check(true, "the name is on the paper as soon as it is said");
  said = await send(page, SAID[2]);
  check(said.includes("Added · Experience Data Analyst at Acme Payroll"), "the job is added from a sentence about it", said);
  check(/What did you do as Data Analyst at Acme Payroll\?/.test(said), "and the next question is about that job", said);
  said = await send(page, SAID[3]);
  await onPaper(page, "Built the SQL checks").waitFor({ timeout: 15000 });
  check(said.includes("Added · Data Analyst, Acme Payroll Built the SQL checks that catch payroll errors before pay day"), "each sentence about the job becomes a line under it, listed in the reply", said);
  // A change in the list shows where it is on the page.
  await replies(page).last().getByRole("button", { name: /Built the SQL checks/ }).click();
  check((await replies(page).last().getByRole("button", { name: /Built the SQL checks/ }).getAttribute("aria-current")) === "true", "choosing a change marks it as the one shown on the page");

  let cv = await getCv(page, id);
  const role = experience(cv).entries[0];
  check(role.title === "Data Analyst" && role.org === "Acme Payroll" && role.start === "2021-03" && role.current === true, "the saved job has the title, employer and start date that were said", JSON.stringify(role));
  const lines = role.bullets.map((b) => b.text);
  check(JSON.stringify(lines) === JSON.stringify(["Built the SQL checks that catch payroll errors before pay day", "Cut payroll errors from about 40 a month to 5, as part of the team"]), "the lines are the person's sentences: “I” gone, “we” kept as “as part of the team”", JSON.stringify(lines));
  check(role.bullets.every((b) => b.sources.length === 1 && SAID[3].includes(b.sources[0].text)), "every line keeps the exact words it was made from");
  const allDigits = new Set(SAID.flatMap(digits));
  check(lines.flatMap(digits).every((d) => allDigits.has(d)), "no number on the CV that the person didn't give");
  check(cv.contact.fullName === "Sam Okafor" && cv.contact.email === "sam.okafor@example.com" && cv.contact.location === "Leeds", "the contact details were saved");

  /* ----------------------------------------------------------------- undo */
  await page.getByRole("button", { name: "Undo these changes" }).click();
  await saved(page);
  cv = await getCv(page, id);
  check(experience(cv).entries[0].bullets.length === 0, "Undo takes back the last reply's lines, and the CV is saved without them");
  check(await replies(page).last().getByText("Undone.").isVisible(), "the reply says its changes were undone");
  said = await send(page, SAID[3]);
  cv = await getCv(page, id);
  check(experience(cv).entries[0].bullets.length === 2, "saying it again puts the lines back");

  /* ------------------------------------------------- the plain-word tip */
  said = await send(page, "I leveraged Python to automate the payroll checks.");
  check(said.includes("Plain-word tip") && said.includes("You said “Leveraged”"), "a word that reads as AI-written, said by the person, gets a tip", said);
  cv = await getCv(page, id);
  check(experience(cv).entries[0].bullets.some((b) => b.text === "Leveraged Python to automate the payroll checks"), "and their own word stays until they choose");
  await replies(page).last().getByRole("button", { name: "Use “used”" }).click();
  await page.getByTestId("msg-you").filter({ hasText: "Use “used” instead of “Leveraged”" }).waitFor();
  await page.getByText("Reworded · Data Analyst, Acme Payroll").waitFor({ timeout: 30000 });
  await saved(page);
  cv = await getCv(page, id);
  check(experience(cv).entries[0].bullets.some((b) => b.text === "Used Python to automate the payroll checks"), "“Use” swaps the word, as a message the person can see, and it is saved", JSON.stringify(experience(cv).entries[0].bullets.map((b) => b.text)));

  /* ------------------------------------------------- passing on a question */
  said = await send(page, "no more jobs");
  check(!/Is there another job/.test(said.split("Fine")[1] || said), "after “no more jobs” it moves on rather than asking again", said);

  /* ------------------------------------------------------------- reload */
  const count = await page.getByTestId("talk-log").locator("li").count();
  await page.reload();
  await replies(page).first().waitFor();
  check((await page.getByTestId("talk-log").locator("li").count()) === count, "the conversation is kept on this device across a reload");

  /* -------------------------------------------------------- hands-free voice */
  // No microphone in this browser: it says so, and nothing is sent for the person.
  const before = await page.getByTestId("talk-log").locator("li").count();
  await page.getByTestId("talk-mic").click();
  await page.getByText(/microphone isn’t available, so type instead|can’t record/).waitFor({ timeout: 10000 });
  check((await page.getByTestId("talk-log").locator("li").count()) === before, "with no microphone, nothing is sent and it says to type instead");

  await settled(page);
  await a11y(page, "talk (after a conversation)");
  await bothThemes(page, "talk-conversation");

  /* ------------------------------------------------------------ the builder */
  await page.goto(`${BASE}/cv/v/${id}/edit/contact`);
  await page.getByTestId("talk-button").waitFor();
  check(await page.getByTestId("talk-button").isVisible(), "the builder has a way into the assistant");

  /* --------------------------------------------------------------- phone */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/cv/v/${id}/talk`);
  await replies(page).first().waitFor();
  await fitsWidth(page, "talk on a phone");
  check(await page.getByLabel("Your answer").isVisible(), "on a phone the message box is on screen without scrolling");
  await page.getByRole("tablist", { name: "Show" }).getByRole("tab", { name: /Paper/ }).click();
  await onPaper(page, "Sam Okafor").waitFor({ timeout: 15000 });
  check(true, "on a phone the paper is one tap away");
  await page.getByRole("tablist", { name: "Show" }).getByRole("tab", { name: /Chat/ }).click();
  await settled(page);
  await a11y(page, "talk on a phone");

  check(a.errors.length === 0, "no errors in the page", a.errors.join("\n"));
});
