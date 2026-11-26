// Share and Download from the editor. Share: off until turned on; a read-only link to the CV as it was, showing only
// what is on the page; changes shared only when the person chooses; turned off, the link stops working. Download: each
// file is made, read back and compared before it is downloaded, in a dialog opened from the editor or the CV list.
const { BASE, PHONE, check, newUser, a11y, bothThemes, fitsWidth, run } = require("./cv-helpers.cjs");

const getCv = (page, id) => page.evaluate(async (cvId) => (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv, id);
const patch = (page, id, change) =>
  page.evaluate(
    async ({ cvId, change }) => {
      const cv = (await (await fetch(`/api/cv/versions/${cvId}`)).json()).cv;
      const body = new Function("cv", `return (${change})(cv)`)(cv);
      return (await fetch(`/api/cv/versions/${cvId}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ rev: cv.rev, saveId: `t${Date.now()}`, ...body }) })).status;
    },
    { cvId: id, change },
  );
const paperText = (page) => page.evaluate(() => [...document.querySelectorAll("svg.cv-paper")].map((s) => s.textContent || "").join(" "));

run("CV share and download", async (browser) => {
  const a = await newUser(browser, "sharer");
  const page = a.page;
  await page.goto(`${BASE}/cv`);
  const id = await page.evaluate(async () => (await (await fetch("/api/cv/templates", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ templateId: "marketing-lead", name: "Shared CV", region: "uk", letter: true }) })).json()).id);
  // One line switched off: it must not be shared.
  await patch(page, id, `(cv) => ({ sections: cv.sections.map((s) => (s.kind === "experience" ? { ...s, entries: s.entries.map((e, i) => (i === 0 ? { ...e, bullets: e.bullets.map((b, j) => (j === 0 ? { ...b, text: "A private line that is switched off", visible: false } : b)) } : e)) } : s)) })`);
  const cv = await getCv(page, id);
  const advertLine = cv.target.advert.split("\n").find((l) => l.trim().length > 40).trim();

  // Download from the editor.
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  await page.getByTestId("download-button").click();
  const dl = page.getByRole("dialog", { name: "Download" });
  await dl.waitFor();
  check(/read back and compared/.test(await dl.innerText()), "the Download dialog says each file is read back before it is downloaded");
  await bothThemes(page, "download-dialog");
  const [file] = await Promise.all([page.waitForEvent("download", { timeout: 60000 }), dl.getByRole("button", { name: "Download PDF", exact: true }).click()]);
  check(/\.pdf$/.test(file.suggestedFilename()), "Download PDF downloads the PDF", file.suggestedFilename());
  await dl.getByTestId("status-pdf").filter({ hasText: "Checked" }).waitFor({ timeout: 30000 });
  check(true, "the PDF's line says it was checked: it reads back the same as the CV");
  await dl.getByRole("button", { name: "Close" }).first().click();

  // The CV list's Download opens the same dialog.
  await page.goto(`${BASE}/cv`);
  await page.getByRole("link", { name: "Download Shared CV" }).click();
  await page.getByRole("dialog", { name: "Download" }).waitFor({ timeout: 20000 });
  check(true, "Download on the CV list opens the Download dialog");

  // Share: off by default.
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  await page.getByTestId("share-button").click();
  const dialog = page.getByRole("dialog", { name: "Share a link" });
  await dialog.getByText("Sharing is off").waitFor();
  check(!(await dialog.getByRole("switch", { name: "Share a read-only version" }).isChecked()), "sharing is off until it is turned on");
  await bothThemes(page, "share-off");
  await dialog.getByRole("switch", { name: "Share a read-only version" }).check();
  const linkBox = dialog.getByLabel("Read-only link");
  await linkBox.waitFor();
  const link = await linkBox.inputValue();
  check(/\/s\/[A-Za-z0-9_-]{32}$/.test(link) && !link.includes(id), "turning it on gives a link with a random token, not the CV's id", link);
  check(/as it is now/.test(await dialog.getByTestId("share-version").innerText()), "the dialog says which version is shared");
  await dialog.getByRole("button", { name: "Copy link" }).click();
  await dialog.getByText(/^(Link copied|Couldn’t copy the link\. Select and copy it\.)$/).waitFor();
  check(true, "Copy link says whether it copied");
  await bothThemes(page, "share-on");

  // The link, opened by someone who is not signed in.
  const viewer = await browser.newContext();
  const v = await viewer.newPage();
  const verrors = [];
  v.on("pageerror", (e) => verrors.push(String(e)));
  await v.goto(link);
  await v.getByTestId("shared-cv").waitFor();
  await v.locator("svg.cv-paper").first().waitFor({ timeout: 20000 });
  const shown = await paperText(v);
  check(shown.includes(cv.contact.fullName), "the link shows the CV's page, to someone who isn't signed in");
  check(!shown.includes("A private line that is switched off") && !(await v.content()).includes("A private line that is switched off"), "a line that is switched off is not shared");
  check(!(await v.content()).includes(advertLine), "the job advert is not shared");
  const viewed = await v.request.get(link);
  check((await v.locator('meta[name="robots"]').first().getAttribute("content")).includes("noindex") && /noindex/.test(viewed.headers()["x-robots-tag"] ?? ""), "the shared page is kept out of search results");
  await a11y(v, "shared CV");
  check((await v.getByRole("link", { name: /edit|builder|sign in|log in/i }).count()) === 0 && (await v.locator("input, textarea").count()) === 0, "the shared page has nothing to edit and no way into the account");
  check((await v.evaluate(() => fetch(`/api/cv/versions/${location.pathname.split("/").pop()}`).then((r) => r.status))) !== 200, "the token opens nothing in the API");

  // A change is shared only when the person chooses.
  await page.getByRole("dialog", { name: "Share a link" }).getByRole("button", { name: "Close" }).first().click();
  await patch(page, id, `(cv) => ({ contact: { ...cv.contact, fullName: "Chloe B. Bennett" } })`);
  await page.goto(`${BASE}/cv/v/${id}/edit/experience`);
  await page.locator("svg.cv-paper").first().waitFor({ timeout: 20000 });
  await page.getByTestId("share-button").click();
  const d2 = page.getByRole("dialog", { name: "Share a link" });
  await d2.getByTestId("share-version").waitFor();
  check(/as it was when you shared it/.test(await d2.getByTestId("share-version").innerText()), "after a change, the dialog says the link still shows the version that was shared");
  await v.reload();
  await v.locator("svg.cv-paper").first().waitFor({ timeout: 20000 });
  check(!(await paperText(v)).includes("Chloe B. Bennett"), "and the link does show that version, not the working draft");
  await d2.getByRole("button", { name: "Share the current version" }).click();
  await d2.getByTestId("share-version").filter({ hasText: "as it is now" }).waitFor();
  check((await d2.getByLabel("Read-only link").inputValue()) === link, "sharing the current version keeps the same link");
  await v.reload();
  await v.locator("svg.cv-paper").first().waitFor({ timeout: 20000 });
  check((await paperText(v)).includes("Chloe B. Bennett"), "and the link now shows the current version");

  // On a phone.
  const pv = await browser.newContext({ ...PHONE });
  const pp = await pv.newPage();
  await pp.goto(link);
  await pp.locator("svg.cv-paper").first().waitFor({ timeout: 20000 });
  await fitsWidth(pp, "shared CV on a phone");
  await pv.close();

  // Turned off, the link stops working.
  await d2.getByRole("switch", { name: "Share a read-only version" }).uncheck();
  await d2.getByText("Sharing is off").waitFor();
  await v.reload();
  check(await v.getByRole("heading", { name: "This link is no longer available." }).isVisible(), "turned off, the link says it is no longer available");
  await viewer.close();
  check(a.errors.length + verrors.length === 0, "no page errors", [...a.errors, ...verrors].join(" | "));
});
