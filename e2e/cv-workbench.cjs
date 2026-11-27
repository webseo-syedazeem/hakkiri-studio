// The editor's workbench: the format bar above the page (acting on the real page), the score beside it with the one
// thing to fix next, and the job keywords one at a time, where "Yes, I've done this" adds a line only once the person
// has approved their own words. On a phone: the score as one line and the format bar in a Design dialog.
const { BASE, PHONE, check, newUser, bothThemes, fitsWidth, run } = require("./cv-helpers.cjs");

const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const saved = (page) => page.locator('[data-testid="save-state"]', { hasText: /^Saved$/ }).waitFor({ timeout: 15000 });
const paperText = (page) => page.evaluate(() => [...document.querySelectorAll("svg.cv-paper")].map((svg) => svg.textContent || "").join(" "));
const bulletSize = (page) => page.locator('svg.cv-paper g[data-kind="bullet"] text').first().getAttribute("font-size");

run("CV workbench", async (browser) => {
  const a = await newUser(browser, "bench");
  const page = a.page;
  await page.goto(`${BASE}/cv`);
  // The marketing example, with its letter and the job it is aimed at.
  const id = await page.evaluate(async () => (await (await fetch("/api/cv/templates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateId: "marketing-lead", name: "Bench", region: "uk", letter: true }) })).json()).id);
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  // The bar above the page (the Design dialog has a full one of its own).
  const bar = page.getByRole("complementary", { name: "Paper" }).getByTestId("format-bar");
  await bar.waitFor();
  await page.locator("svg.cv-paper").first().waitFor({ timeout: 20000 });

  // Format bar: every control acts on the real page.
  check(await bar.getByRole("link", { name: /^No\. \d\d · / }).isVisible(), "the format bar names the template, and links to the template picker");
  const before = await bulletSize(page);
  await bar.getByLabel("Text size").selectOption("11");
  await page.waitForFunction((was) => document.querySelector('svg.cv-paper g[data-kind="bullet"] text').getAttribute("font-size") !== was, before);
  await saved(page);
  check(Number(await bulletSize(page)) > Number(before), "Larger text makes the page's text larger", `${before} → ${await bulletSize(page)}`);
  check(!(await bar.getByLabel("Page size").count()), "the bar above the page is one slim row: page size and the rest are under More design options");
  await bar.getByRole("button", { name: "More design options" }).click();
  const more = page.getByRole("dialog", { name: "Design" });
  await more.getByLabel("Page size").selectOption("letter");
  await page.waitForFunction(() => document.querySelector("svg.cv-paper").getAttribute("viewBox") === "0 0 612 792");
  check(true, "Page size changes the page to US Letter");
  await more.getByRole("button", { name: "Off" }).click();
  await more.getByRole("button", { name: "Close" }).first().click();
  await more.waitFor({ state: "hidden" });
  await bar.getByLabel("Colour").selectOption({ label: "Plum" });
  await page.waitForFunction(() => document.querySelector('svg.cv-paper g[data-kind="heading"] text').getAttribute("fill").toUpperCase() === "#673E83");
  check(true, "Colour redraws the headings");
  await saved(page);
  let cv = await getCv(page, id);
  check(cv.design.dividerStyle === "none" && cv.design.pageSize === "letter" && cv.design.accent === "plum" && cv.design.fontSize === 11, "the choices are saved with the CV", JSON.stringify({ d: cv.design.dividerStyle, p: cv.design.pageSize, a: cv.design.accent, f: cv.design.fontSize }));
  check(/Fits on (1|2) page|lines? over/.test(await page.getByTestId("fit-status").innerText()), "the fit status says how the page fits", await page.getByTestId("fit-status").innerText());
  await page.getByRole("button", { name: /^Fit to (one|two) pages?$/ }).click();
  check(/Fits on|over/.test(await page.getByTestId("fit-status").innerText()), "Fit to one page says what it did, and never removes text", await page.getByTestId("fit-status").innerText());
  check((await paperText(page)).includes("Grew qualified leads by 52%"), "the page still has all of its text");

  // v3: the header has three actions, and the fields fold away to give the page the room.
  const head = page.locator("header.cv-edhead");
  check((await head.getByRole("button", { name: "Download" }).isVisible()) && (await head.getByRole("button", { name: "Share" }).isVisible()) && (await head.getByRole("button", { name: "More" }).isVisible()) && !(await head.getByRole("link", { name: "Talk it through" }).count()), "the header has Download, Share and More; Talk it through, Tailor and Cover letter sit with the tabs");
  const pageWidth = async () => Math.round(await page.locator(".cv-workbench > aside.cv-sticky").evaluate((el) => el.getBoundingClientRect().width));
  const wide = await pageWidth();
  await page.getByTestId("fields-toggle").click();
  check((await page.getByTestId("fields-toggle").innerText()) === "Show editing fields" && (await pageWidth()) > wide + 200, "Hide editing fields gives the page the room", `${wide} → ${await pageWidth()}`);
  await page.getByTestId("fields-toggle").click();
  check((await pageWidth()) === wide, "and Show editing fields brings them back");
  await page.getByRole("button", { name: "Actions for bullet 1", exact: true }).click();
  const menu = page.getByRole("group", { name: "Actions for bullet 1" });
  check((await menu.getByRole("button", { name: "Move down" }).isVisible()) && (await menu.getByRole("button", { name: "Remove bullet 1" }).isVisible()), "each bullet's ⋯ menu holds Move and Remove");
  await page.keyboard.press("Escape");

  // The score beside the page.
  const score = page.getByTestId("score-panel");
  await score.waitFor();
  const scoreText = await score.innerText();
  check(/\d+\s*\/ 100/.test(scoreText) && /Poor|Average|Good|Strong/.test(scoreText) && /Evidence/.test(scoreText) && /Readable by software/.test(scoreText), "the score is beside the page, with a plain label and its four parts", scoreText.slice(0, 160));
  // Make something to fix, and the score says so.
  await page.evaluate(async (cvId) => {
    const cv = (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv;
    const sections = cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries: s.entries.map((e, i) => (i === 0 ? { ...e, bullets: e.bullets.map((b, j) => (j === 0 ? { ...b, text: "Responsible for things" } : b)) } : e)) } : s));
    await fetch(`/api/cv/versions/${cvId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: cv.rev, saveId: `t${Date.now()}`, sections }) });
  }, id);
  await page.reload();
  await page.getByTestId("fix-next").waitFor({ timeout: 20000 });
  await page.getByTestId("fix-next").getByRole("button", { name: "Show me" }).click();
  // The field the finding is about has the cursor: whichever line the score lists first.
  await page.waitForFunction(() => document.activeElement && document.activeElement.hasAttribute("data-cvf"), null, { timeout: 10000 }).then(
    () => check(true, "Show me goes straight to the line to fix"),
    async () => check(false, "Show me goes straight to the line to fix", await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 120))),
  );

  // Job keywords, one at a time.
  const job = page.getByTestId("job-panel");
  check(/Aimed at: Head of Growth Marketing, Fernbrook Outdoor/.test(await job.innerText()) && /\d+ of \d+ things the advert asks for are on your CV/.test(await job.innerText()), "the job keywords say what the CV is aimed at and how much of the advert it shows", (await job.innerText()).slice(0, 200));
  await bothThemes(page, "workbench");
  const next = job.getByTestId("keyword-next");
  const reviewCount = async () => Number(/(\d+) to review/.exec(await next.innerText())?.[1] ?? 0);
  const first = await reviewCount();
  await next.getByRole("button", { name: "I don’t have this" }).click();
  await saved(page);
  cv = await getCv(page, id);
  check(cv.requirements.some((r) => r.gap) && (await reviewCount()) === first - 1, "I don't have this records the gap and moves on to the next");
  await next.getByRole("button", { name: "Not relevant" }).click();
  await saved(page);
  cv = await getCv(page, id);
  check(cv.requirements.some((r) => r.dismissed) && (await reviewCount()) === first - 2, "Not relevant puts it aside");
  const linesBefore = cv.sections.find((s) => s.kind === "experience").entries.reduce((n, e) => n + e.bullets.length, 0);
  await next.getByRole("button", { name: "Yes, I’ve done this" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Review suggested line" }).click();
  await dialog.getByText("Describe your own experience first.").waitFor();
  check(true, "an empty answer adds nothing and says why");
  await dialog.getByLabel("Where and how? One or two sentences in your own words").fill("planned and ran a 6-week email campaign for a new walking boot range");
  await dialog.getByRole("button", { name: "Review suggested line" }).click();
  check((await dialog.getByTestId("approve-line").innerText()) === "Planned and ran a 6-week email campaign for a new walking boot range", "the line to approve is the person's own words, tidied");
  cv = await getCv(page, id);
  check(cv.sections.find((s) => s.kind === "experience").entries.reduce((n, e) => n + e.bullets.length, 0) === linesBefore, "nothing is added before it is approved");
  await dialog.getByRole("button", { name: "Approve and add" }).click();
  await saved(page);
  cv = await getCv(page, id);
  const added = cv.sections.find((s) => s.kind === "experience").entries.flatMap((e) => e.bullets).find((b) => b.text === "Planned and ran a 6-week email campaign for a new walking boot range");
  check(!!added && added.sources[0]?.kind === "typed", "approving adds the line, recorded as the person's own words");
  // "Show me" above moved the editor to another section: the page shown is the one with that section on it.
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  await page.locator("svg.cv-paper").first().waitFor({ timeout: 20000 });
  await page.waitForFunction(() => [...document.querySelectorAll("svg.cv-paper")].some((svg) => (svg.textContent || "").includes("6-week email")), null, { timeout: 10000 }).then(
    () => check(true, "and it is on the page"),
    async () => check(false, "and it is on the page", (await paperText(page)).slice(0, 400)),
  );

  // Questions your CV will get: from the score panel, five lines of the CV with a question each.
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  await page.getByTestId("practise-card").getByRole("link", { name: "Questions your CV will get" }).click();
  await page.waitForURL(/\/questions$/);
  const qs = page.getByTestId("cv-question");
  await qs.first().waitFor({ timeout: 15000 });
  const cvNow = await getCv(page, id);
  const lines = cvNow.sections.flatMap((x) => (x.entries ?? []).flatMap((e) => e.bullets.map((b) => b.text)));
  const quoted = await page.locator('[data-testid="cv-question"] q').allInnerTexts();
  check((await qs.count()) === 5 && quoted.every((q) => lines.includes(q)), "five lines of the CV, each quoted exactly as written", quoted.join(" | "));
  const asks = await page.locator(".cv-q-ask").allInnerTexts();
  check(asks.length === 5 && asks.every((a) => a.endsWith("?")) && asks.some((a) => /\d/.test(a)), "each has a question about what the line says", asks.join(" | "));
  const practise = new URL(await qs.first().getByRole("link", { name: "Practise question 1" }).getAttribute("href"), BASE);
  check(practise.pathname === "/practice" && practise.searchParams.get("claim") === quoted[0] && practise.searchParams.get("returnTo") === `/cv/v/${id}/questions`, "Practise takes the line and its question to the Practice Hub, and comes back here", practise.search);
  check(/type=experience/.test(await page.getByTestId("practise-all").getAttribute("href")), "Practise all opens practice on experience questions");
  await bothThemes(page, "cv-questions");
  await qs.first().getByRole("button", { name: "Show on my CV" }).click();
  await page.waitForURL(/\/edit\//);
  check(true, "Show on my CV goes back to the line in the editor");
  await page.getByRole("button", { name: "Actions for bullet 1", exact: true }).click();
  await page.getByRole("button", { name: "Practise bullet 1" }).click();
  await page.waitForURL(/\/practice\?claim=/);
  check(true, "a bullet's ⋯ menu has Practise this, which opens the Practice Hub with that line");

  // On a phone.
  const p = await newUser(browser, "bench-phone", PHONE);
  await p.page.goto(`${BASE}/cv`);
  const pid = await p.page.evaluate(async () => (await (await fetch("/api/cv/templates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateId: "staff-nurse", name: "Phone", region: "uk", letter: true }) })).json()).id);
  await p.page.goto(`${BASE}/cv/v/${pid}/edit/experience`);
  await p.page.locator('[data-testid="score-button"]', { hasText: /CV score \d+/ }).waitFor({ timeout: 20000 });
  check(true, "on a phone the score shows at the top, with the CV's name");
  await p.page.getByTestId("design-button").click();
  await p.page.getByRole("dialog", { name: "Design" }).getByTestId("format-bar").waitFor();
  check(true, "on a phone the format bar is in a Design dialog");
  await fitsWidth(p.page, "workbench design dialog on a phone");
  await p.page.getByRole("dialog", { name: "Design" }).getByRole("button", { name: "Close" }).first().click();
  await fitsWidth(p.page, "workbench on a phone");
  check(a.errors.length + p.errors.length === 0, "no page errors", [...a.errors, ...p.errors].join(" | "));
});
