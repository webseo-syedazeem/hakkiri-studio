// Shared by the older browser tests (stories, pitch, flow, slots, pay, audit and the accessibility scans): a signed-in test
// user, and setting up an interview the way a person does. The CV tests have their own helpers (cv-helpers.cjs).
const path = require("node:path");
const { newUser, BASE, OUT } = require("./cv-helpers.cjs");

/** Launch options for the screens that record: a fake microphone that is always allowed. */
const FAKE_MIC = ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"];

const FIXTURES = path.join(__dirname, "fixtures");

/**
 * A brand-new account, signed in, in its own browser context. Every page in these tests needs one:
 * without a session the app sends you to /login.
 *
 * The account is made by cv-helpers' newUser (POST /api/auth/signup). On top of that:
 *  - the microphone is allowed, and the first-visit welcome and mic check count as done, as they would
 *    be for someone who has used the app before;
 *  - the interviewer isn't read out by the browser's own voice, so a question ends as soon as it's asked;
 *  - every request comes from this account's own address. The test server trusts the forwarded address
 *    (HAKKIRI_TRUST_PROXY=1) and counts its per-minute limits by it, so one test can't use up another's.
 */
async function signIn(browser, label, opts = {}) {
  const user = await newUser(browser, label, { permissions: ["microphone"], ...opts });
  const { context } = user;
  const address = `10.${1 + Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${1 + Math.floor(Math.random() * 250)}`;
  await context.setExtraHTTPHeaders({ "x-forwarded-for": address });
  await context.addCookies([
    { name: "hk_welcomed", value: "1", url: BASE },
    { name: "hk_mic_ok", value: "1", url: BASE },
  ]);
  await context.addInitScript(() => {
    try {
      Object.defineProperty(window, "speechSynthesis", { value: undefined, configurable: true });
    } catch {}
  });
  return user;
}

const JOB_SPEC =
  "Acme Payroll runs payroll for 4,000 small businesses. As a Data Analyst you will own the SQL models behind our payroll accuracy dashboards, work with finance and operations stakeholders, and use Python to automate checks. You will present findings to leadership every month. We want someone who can explain data simply, spot errors early and care about getting pay right for every employee.";

/**
 * Sets up an interview through the four steps of /interviews/new (job details, stages, practice
 * set-up, review) as the signed-in user, and returns its id. A new account has no interviews of its
 * own, so each test that needs one makes it here.
 *   difficulty: "Easy" | "Medium" | "Hard"     minutes: 10 | 20 | 30 | 45
 *   onStep(name): called on each step before moving on, for screenshots and extra checks.
 */
async function setUpInterview(page, { company = "Acme Payroll", title = "Data Analyst", jobSpec = JOB_SPEC, cv = "sam-okafor-cv.pdf", difficulty, minutes, onStep } = {}) {
  const at = async (name) => onStep && (await onStep(name));
  await page.goto(`${BASE}/interviews/new`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("e.g. HMRC, Monzo, Google").fill(company);
  await page.getByPlaceholder("e.g. Associate Product Manager").fill(title);
  await page.getByRole("button", { name: "Paste Job Description" }).click();
  await page.getByPlaceholder(/^Paste the full job description/).fill(jobSpec);
  // The CV's file input is the first on the page (the job description is pasted, so it has none).
  await page.locator('input[type="file"]').first().setInputFiles(path.join(FIXTURES, cv));
  await page.getByText(cv, { exact: true }).first().waitFor({ timeout: 20000 });
  await at("job details");
  await page.getByRole("button", { name: /^Continue to stages/ }).click();
  await page.getByRole("heading", { name: "Set up your interview stages" }).waitFor();
  await at("stages");
  await page.getByRole("button", { name: /^Continue to practice setup/ }).click();
  await page.getByRole("heading", { name: "Practice setup", level: 1 }).waitFor();
  if (difficulty) await page.getByRole("button", { name: difficulty, exact: true }).click();
  if (minutes) await page.getByRole("button", { name: `${minutes} min`, exact: true }).click();
  await at("practice setup");
  await page.getByRole("button", { name: /^Continue to review/ }).click();
  await page.getByText("Ready to build?").waitFor();
  await at("review");
  // The set-up screen carries on to the list even when the build fails, so the answer is checked here.
  const built = page.waitForResponse((r) => r.url() === `${BASE}/api/interviews` && r.request().method() === "POST", { timeout: 90000 });
  await page.getByRole("button", { name: /^Build interview/ }).click();
  const res = await built;
  if (!res.ok()) throw new Error(`The interview couldn't be built: ${res.status()} ${await res.text()}`);
  const { id } = await res.json();
  await page.waitForURL(/\/interviews$/, { timeout: 30000 });
  await page.locator(`a[href="/interviews/${id}"]`).first().waitFor({ timeout: 15000 });
  await at("list");
  return id;
}

/**
 * After a full interview the report asks for feedback in a pop-up. Closes it if it comes up, as a
 * person would to read the report.
 */
async function closeSurvey(page) {
  const close = page.getByRole("button", { name: "Close survey" });
  if (await close.waitFor({ timeout: 4000 }).then(() => true, () => false)) await close.click();
}

module.exports = { BASE, OUT, FIXTURES, FAKE_MIC, JOB_SPEC, signIn, setUpInterview, closeSurvey };
