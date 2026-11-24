// Your data and your account, as a new person. Sign up through the form (and see the password rule and
// where you land), set up an interview, download your data and read the zip, delete your data and see
// the empty state and an empty download, then delete the account itself and find that the sign-in is
// gone. Also: what an ordinary account is and isn't shown on Settings.
const { chromium } = require("playwright");
const JSZip = require("jszip");
const { BASE, OUT, setUpInterview } = require("./helpers.cjs");

const PASSWORD = "a long and unusual phrase 41";
const results = [];
const check = (ok, what, detail = "") => {
  results.push({ ok: !!ok, what });
  console.log(`${ok ? "ok  " : "FAIL"} ${what}${ok || !detail ? "" : `  → ${detail}`}`);
};

/** The signed-in person's download, unpacked: file names, and the text of the JSON and text files. */
async function download(page) {
  const b64 = await page.evaluate(async () => {
    const res = await fetch("/api/data/export");
    if (!res.ok) return `!${res.status}`;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  });
  if (b64.startsWith("!")) throw new Error(`The data download failed: ${b64.slice(1)}`);
  const zip = await JSZip.loadAsync(Buffer.from(b64, "base64"));
  const files = {};
  for (const name of Object.keys(zip.files)) if (!zip.files[name].dir && /\.(json|txt)$/.test(name)) files[name] = await zip.files[name].async("string");
  return { names: Object.keys(zip.files).filter((n) => !zip.files[n].dir).sort(), files, data: JSON.parse(files["data.json"]) };
}
/** The form's own error box (Next's route announcer is an "alert" too, and is empty). */
const alertOf = (page) => page.getByRole("alert").filter({ hasText: /\w/ }).first();
const count = (page, label) => page.locator("dl > div", { has: page.locator("dt", { hasText: new RegExp(`^${label}$`) }) }).locator("dd").innerText();

(async () => {
  const browser = await chromium.launch();
  try {
    const from = `10.${1 + Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${1 + Math.floor(Math.random() * 250)}`;
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, extraHTTPHeaders: { "x-forwarded-for": from } });
    await context.addInitScript(() => sessionStorage.setItem("dismiss_phone_notice", "1"));
    await context.addCookies([{ name: "hk_welcomed", value: "1", url: BASE }, { name: "hk_mic_ok", value: "1", url: BASE }]);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    const email = `data-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;

    // ── Sign up through the form ────────────────────────────────────────────────────────────────
    // Asked for a private page while signed out: sent to sign in, and brought back afterwards.
    await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    check(new URL(page.url()).pathname === "/login" && new URL(page.url()).searchParams.get("next") === "/settings", "Asking for Settings while signed out leads to sign-in, remembering where you were going", page.url());
    await page.getByRole("button", { name: "Create Account" }).click();
    check(await page.getByText("At least 8 characters. Not a common password, and not your email address.").count(), "The sign-up form states the password rule");
    check(!(await page.getByText(/Guest/i).count()), "The form doesn't offer “Continue as Guest” (there is no guest access)");
    await page.getByLabel("Full name").fill("Dana Tester");
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create free account" }).click();
    await alertOf(page).waitFor({ timeout: 10000 });
    check(/most common passwords/.test(await alertOf(page).innerText()), "A common password is refused, and the form says why", await alertOf(page).innerText());
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Create free account" }).click();
    await page.waitForURL((u) => u.pathname === "/settings", { timeout: 20000 });
    check(true, "After signing up you land on the page you asked for (Settings), not the public home page");
    await page.screenshot({ path: `${OUT}/data-01-settings-new.png`, fullPage: true });

    // ── Settings for an ordinary account ────────────────────────────────────────────────────────
    const settings = await page.locator("main").innerText();
    for (const label of ["Interviews", "Practice sessions", "Answers", "Recordings", "Presentations", "Rehearsals"]) check((await count(page, label)) === "0", `A new account's ${label.toLowerCase()} count is 0`);
    check(!/\$\s?\d/.test(settings) && !/HAKKIRI_|\.env|API_KEY/.test(settings), "An ordinary account's Settings shows no costs and no environment detail", (settings.match(/\$\s?\d[^\n]*|HAKKIRI_\w+|\.env\S*|\w*API_KEY/) || [""])[0]);
    check(!(await page.locator("#problems").count()) && !/Problems and alerts|Candidate interviews/.test(settings), "…and none of the administrator's sections");
    check((await page.getByTestId("voice-status").innerText()) === "Browser voice" && !/Studio Active|High-fidelity/.test(settings), "The voice panel says the browser's voice is used here (it used to claim a natural voice was active)");
    check(/You sign in with your email address and password\./.test(settings), "The account line says how you sign in");
    check(/kept only in this browser/.test(settings), "“Your data” says what is kept only in the browser");
    // The counts are not everything that can be held (settings, notes, CVs, this browser's own entries), so deleting is always offered.
    check(await page.getByRole("button", { name: "Delete all my data" }).isEnabled(), "“Delete all my data” is offered even when every count is 0");

    // ── An interview, then the download ─────────────────────────────────────────────────────────
    const interviewId = await setUpInterview(page, { company: "Marlowe Freight Data", title: "Data Analyst" });
    await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    check((await count(page, "Interviews")) === "1", "After setting up an interview, Settings counts 1 interview");
    const before = await download(page);
    check(before.names.includes("README.txt") && before.names.includes("data.json") && before.names.includes("cvs.json"), "The download holds data.json, cvs.json and a README", before.names.join(", "));
    check(before.data.account.email === email && before.data.account.name === "Dana Tester" && before.data.account.hasPassword === true, "data.json holds the account: address, name and how you sign in");
    check(!/passwordHash|[0-9a-f]{32}:[0-9a-f]{128}/.test(before.files["data.json"]) && !before.files["data.json"].includes(PASSWORD), "…and never the password or its hash");
    check(before.data.interviews.length === 1 && before.data.interviews[0].id === interviewId && before.data.interviews[0].company === "Marlowe Freight Data", "…and the interview that was set up, with its company");
    check(before.files["data.json"].includes("Acme Payroll runs payroll"), "…including the job spec text that was pasted");
    check(/Experience Library/.test(before.files["README.txt"]) && /kept only in the browser/.test(before.files["README.txt"]), "The README says what is not in the download and why");
    check(Array.isArray(before.data.usage) && before.data.usage.every((u) => u.userId === before.data.account.id), "Usage rows in the download are this account's own");

    // ── Delete all my data ──────────────────────────────────────────────────────────────────────
    await page.getByRole("button", { name: "Delete all my data" }).click();
    const panel = await page.locator("main").innerText();
    check(/Your account stays/.test(panel) && /a count of the practice time/i.test(panel), "Before deleting, the screen says what goes and what is kept with the account");
    const deleteButton = page.getByRole("button", { name: "Delete everything" });
    check(await deleteButton.isDisabled(), "“Delete everything” is off until the word is typed");
    await page.getByLabel(/Type delete to confirm/).fill("delete");
    const done = page.waitForResponse((r) => r.url().endsWith("/api/data/delete"), { timeout: 30000 });
    await deleteButton.click();
    check((await done).ok(), "“Delete all my data” succeeds");
    await page.getByText("All your data is deleted.").waitFor({ timeout: 15000 });
    await page.waitForFunction(() => [...document.querySelectorAll("dl > div dd")].every((d) => d.textContent.trim() === "0"), null, { timeout: 15000 }).catch(() => undefined);
    for (const label of ["Interviews", "Practice sessions", "Answers", "Recordings"]) check((await count(page, label)) === "0", `After deleting, the ${label.toLowerCase()} count is 0`);
    await page.screenshot({ path: `${OUT}/data-02-after-delete.png`, fullPage: true });
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    check(!(await page.locator(`a[href="/interviews/${interviewId}"]`).count()) && !(await page.locator("body").innerText()).includes("Marlowe Freight Data"), "The interviews list no longer shows the deleted interview");
    const gone = await page.goto(`${BASE}/interviews/${interviewId}`, { waitUntil: "networkidle" });
    check(gone.status() === 404, `Opening the deleted interview gives “not found” (${gone.status()})`);
    await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    const after = await download(page);
    const empty = ["interviews", "questions", "sessions", "answers", "inProgress", "presentations", "rehearsals", "audienceQa", "feedback", "survey"].filter((k) => after.data[k].length);
    check(empty.length === 0 && after.data.settings === null, "The download after deleting is empty of everything but the account", empty.join(", "));
    check(!after.files["data.json"].includes("Marlowe") && !after.files["data.json"].includes("Acme Payroll") && JSON.parse(after.files["cvs.json"]).cvs.length === 0, "…with no trace of the interview, the job spec or a CV");
    check(after.data.account.email === email, "…and the account is still there: you are still signed in");
    check(after.data.usage.every((u) => !u.interviewId && !u.sessionId && !u.presentationId), "Usage rows that remain say nothing about what was practised");

    // ── Sign out, and sign in again through the form ────────────────────────────────────────────
    await page.getByRole("button", { name: "Sign Out" }).first().click();
    await page.waitForURL((u) => u.pathname !== "/settings", { timeout: 15000 });
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill("not my password 12");
    await page.getByRole("button", { name: "Sign in to Studio" }).click();
    await alertOf(page).waitFor({ timeout: 10000 });
    const wrong = await alertOf(page).innerText();
    check(/Email or password is incorrect/.test(wrong), "A wrong password gets one message that doesn't say whether the address has an account", wrong);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in to Studio" }).click();
    await page.waitForURL((u) => u.pathname === "/dashboard", { timeout: 20000 });
    check(true, "Signing in lands in the app (the dashboard), not on the public home page");

    // ── Delete my account ───────────────────────────────────────────────────────────────────────
    await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "I want to delete my account" }).click();
    const box = page.getByTestId("delete-account");
    const confirm = box.getByRole("button", { name: "Delete my account" });
    await box.getByLabel(/to confirm/).fill("delete");
    await box.getByLabel("Your password").fill(PASSWORD);
    check(await confirm.isDisabled(), "The word that deletes data doesn't enable “Delete my account”: it has its own phrase");
    await box.getByLabel(/to confirm/).fill("delete my account");
    await box.getByLabel("Your password").fill("not my password 12");
    const refused = page.waitForResponse((r) => r.url().endsWith("/api/account/delete"), { timeout: 20000 });
    await confirm.click();
    check((await refused).status() === 403, "A wrong password is refused");
    await box.getByText(/That isn’t your password\. Nothing has been deleted\./).waitFor({ timeout: 10000 });
    check(true, "…and the screen says nothing has been deleted");
    await page.screenshot({ path: `${OUT}/data-03-delete-account.png`, fullPage: true });
    await box.getByLabel("Your password").fill(PASSWORD);
    const removed = page.waitForResponse((r) => r.url().endsWith("/api/account/delete"), { timeout: 30000 });
    await confirm.click();
    check((await removed).ok(), "With the phrase and the right password the account is deleted");
    await page.waitForURL((u) => u.pathname === "/", { timeout: 20000 });
    check(true, "…and you are taken to the public home page");
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    check(new URL(page.url()).pathname === "/login", "…signed out: the app's pages lead to sign-in", page.url());
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in to Studio" }).click();
    await alertOf(page).waitFor({ timeout: 10000 });
    check(/Email or password is incorrect/.test(await alertOf(page).innerText()), "The deleted account can no longer sign in");
    check((await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("hk_") && k !== "hk_vis_id"))).length === 0, "Nothing of that person's is left in the browser's storage");
    check(errors.length === 0, "No page errors along the way", errors.join(" | "));
    await context.close();
  } finally {
    await browser.close();
  }
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
