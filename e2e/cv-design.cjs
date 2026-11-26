// The design panel on the Finish tab: the template's own look, every option a person can change (fonts, bullets,
// separators, indents, name size, capitals, a colour band), "Reset to the template", and saved styles used again on
// another CV. Walked as a new user in test mode.
const { BASE, check, newUser, bothThemes, fitsWidth, run } = require("./cv-helpers.cjs");

const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const saved = (page) => page.locator('[data-testid="save-state"]', { hasText: /^Saved$/ }).waitFor({ timeout: 15000 });
const paperText = (page) => page.locator("svg.cv-paper").first().evaluate((svg) => svg.textContent || "");

async function newExample(page, region = "uk") {
  return page.evaluate(async (r) => (await (await fetch("/api/cv/templates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateId: "marketing-lead", name: "Design test", region: r }) })).json()).id, region);
}

run("CV design panel", async (browser) => {
  const a = await newUser(browser, "design");
  const page = a.page;
  await page.goto(`${BASE}/cv`);
  const id = await newExample(page);
  await page.goto(`${BASE}/cv/v/${id}/edit/finish`);
  await page.getByTestId("design-base").waitFor();
  check(/Based on No\. \d\d · /.test(await page.getByTestId("design-base").innerText()), "the panel says which numbered template the CV is based on");

  // The template list is numbered, in order.
  const labels = await page.locator(".cv-templates .cv-template b").allInnerTexts();
  check(labels.length === 45 && /No\. 01 · Clean Sans/.test(labels[0]) && /No\. 45 · Bold Band/.test(labels[44]), "all 45 templates are listed by number", labels.slice(0, 2).join(", "));

  // Bullet marks and the colour band reach the paper, and are saved.
  await page.getByText("– Dash", { exact: true }).click();
  await saved(page);
  await page.waitForTimeout(500);
  check((await paperText(page)).includes("–"), "choosing dash bullets redraws the paper with dashes");
  await page.getByText("Colour band", { exact: true }).click();
  await page.getByText("| Bar", { exact: true }).click();
  // This template sets its headings in capitals; the person turns that off.
  await page.getByLabel("Section headings in capitals").uncheck();
  await saved(page);
  let cv = await getCv(page, id);
  check(cv.design.bullet === "dash" && cv.design.header === "band" && cv.design.contactSeparator === "bar" && cv.design.headingCaps === false, "the choices are saved with the CV", JSON.stringify(cv.design));
  check(/with 4 changes of your own/.test(await page.getByTestId("design-base").innerText()), "the panel counts the changes made to the template");

  // Both files are still checked word for word with every option on.
  const res = await page.evaluate(async (cvId) => { const r = await fetch(`/api/cv/versions/${cvId}/check`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }); return r.json(); }, id);
  check(res.pdf?.status === "checked" && res.docx?.status === "checked", "the PDF and Word files read back the same as the CV", JSON.stringify({ pdf: res.pdf?.status, docx: res.docx?.status }));

  await bothThemes(page, "design-panel");

  // A saved style can be used on another CV.
  await page.getByLabel("Style name").fill("Band and dashes");
  await page.getByRole("button", { name: "Save this style" }).click();
  await page.getByRole("list", { name: "Saved styles" }).getByText("Band and dashes").waitFor();
  check(true, "a style is saved under its name");
  const other = await newExample(page, "us");
  await page.goto(`${BASE}/cv/v/${other}/edit/finish`);
  await page.getByRole("list", { name: "Saved styles" }).getByRole("button", { name: "Use" }).click();
  await saved(page);
  const otherCv = await getCv(page, other);
  check(otherCv.design.bullet === "dash" && otherCv.design.header === "band" && otherCv.design.pageSize === "letter", "using it on another CV brings the look and keeps that CV's own page size", JSON.stringify(otherCv.design));

  // Reset puts the template's own look back.
  await page.getByRole("button", { name: /^Reset to No\./ }).click();
  await saved(page);
  cv = await getCv(page, other);
  check(cv.design.bullet === undefined && cv.design.header === undefined && /as designed/.test(await page.getByTestId("design-base").innerText()), "reset puts the template's own look back", JSON.stringify(cv.design));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByTestId("design-base").waitFor();
  await fitsWidth(page, "design panel on a phone");
  check(a.errors.length === 0, "no errors in the page", a.errors.join("\n"));
});
