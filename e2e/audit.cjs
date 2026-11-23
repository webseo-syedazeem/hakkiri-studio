// Full check: every page, every link, every button. Mock mode, fake mic.
// Twice over: the public pages as a visitor who isn't signed in, then the app as a signed-in user
// (a new account with one interview of its own; without a session every app page is just the login page).
// For each page: load it, list every enabled button/switch/radio, then for each one
// reload the page and click it, recording what happened (navigated / opened / changed /
// file chooser / nothing), plus console errors and failed requests. Also: dead links,
// pages with no way out, and the destination of every navigation.
// PAGES_ONLY=1 finds and loads the pages but skips the clicking. EXTRA=/a,/b adds pages for the signed-in user to start from.
const { chromium } = require("playwright");
const { BASE, OUT, FIXTURES, FAKE_MIC, signIn, setUpInterview, closeSurvey } = require("./helpers.cjs");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Done once each, at the end: deleting (on a throwaway presentation) and signing out, which would end the session mid-check.
const SKIP_CLICK = /^(Yes, delete|Sign Out)$/;
// How many tabs click at once.
const TABS = Number(process.env.TABS || 4);
// The pages anyone can open. A visitor who is asked to sign in on one of these has found a fault.
const PUBLIC = ["/", "/present", "/about", "/blog", "/privacy", "/terms", "/login", "/signup"];
// Not the app's fault: Vercel's analytics script only exists when the app runs on Vercel.
const NOISE = /_vercel\/insights/;
// Copy and share buttons write to the clipboard, which a browser only allows when asked.
const PERMISSIONS = ["microphone", "clipboard-read", "clipboard-write"];
// A full interview's report opens a feedback survey over itself a second after it loads.
const isReport = (path) => /\/interviews\/[^/]+\/mocks\/[^/?]+/.test(path);

/** What every page in the check gets: no browser voice, and "print" recorded instead of opening a dialog. */
async function prepare(ctx) {
  await ctx.addInitScript(() => {
    try {
      Object.defineProperty(window, "speechSynthesis", { value: undefined, configurable: true });
    } catch {}
    window.print = () => document.documentElement.setAttribute("data-printed", "1");
  });
  return ctx;
}

const norm = (u) => u.replace(BASE, "");

async function state(page) {
  return page.evaluate(() => {
    const main = document.querySelector("main")?.innerText ?? document.body.innerText;
    const flags = [...document.querySelectorAll("[aria-expanded],[aria-checked],[aria-pressed],[aria-current]")].map((e) => `${e.getAttribute("aria-expanded")}${e.getAttribute("aria-checked")}${e.getAttribute("aria-pressed")}${e.getAttribute("aria-current")}`).join("");
    const radios = [...document.querySelectorAll("input[type=radio]")].map((e) => (e.checked ? 1 : 0)).join("");
    const dialogs = document.querySelectorAll('[role="dialog"],[role="menu"],[role="alert"],[role="status"]').length;
    return { text: main.length + ":" + main.slice(0, 4000), flags, radios, dialogs, printed: document.documentElement.getAttribute("data-printed") };
  });
}

async function clickables(page) {
  return page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none";
    };
    const out = [];
    for (const el of document.querySelectorAll('button, [role="switch"], [role="radio"], label:has(> input[type="radio"])')) {
      if (el.matches('label') ? false : el.closest('label:has(> input[type="radio"])')) continue;
      const target = el.matches("label") ? el : el;
      if (!vis(target)) continue;
      if (el.disabled || el.getAttribute("aria-disabled") === "true") continue;
      const name = (el.getAttribute("aria-label") || el.innerText || "").trim().replace(/\s+/g, " ").slice(0, 60);
      out.push({ name, tag: el.tagName.toLowerCase(), role: el.getAttribute("role") || (el.matches("label") ? "radio-label" : "button") });
    }
    return out;
  });
}

/**
 * One kind of page: ids and the values in the address are left out, so that one interview, one report,
 * one blog post and so on stands for the rest when it comes to clicking.
 */
const kind = (p) => {
  const [path, query = ""] = p.split("?");
  const keys = new Set(query.split("&").filter(Boolean).map((kv) => kv.split("=")[0]));
  const has = (...ks) => ks.some((k) => keys.has(k));
  // What changes the screen: a planned session, one question or a topic on the live screen; edit or fix on rebuild; a run of some slides.
  const mode = path.startsWith("/mock/")
    ? has("session") ? "?session" : has("q", "practice", "next", "duration") ? "?question" : has("topic") ? "?topic" : ""
    : has("edit") ? "?edit" : has("from") ? "?from" : "";
  return (
    path
      .replace(/^\/(interviews|presentations)\/(?!new(\/|$))[^/]+/, "/$1/:id")
      .replace(/^\/(mock|rehearse|qa|blog|audit)\/[^/]+/, "/$1/:id")
      .replace(/^\/cv\/(v|import)\/[^/]+/, "/cv/$1/:id")
      .replace(/\/(answers|mocks|runs|qa)\/[^/]+$/, "/$1/:id") + mode
  );
};

/** Opens `path` in a tab of its own, clicks the i-th of `items` (the buttons found on it) and says what happened. */
async function clickOne(ctx, { path, items, i }) {
  const it = items[i];
  const p = await ctx.newPage();
  const errs = [];
  const bad = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  p.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && !NOISE.test(m.text()) && errs.push(m.text().slice(0, 160)));
  p.on("response", (r) => r.url().startsWith(BASE) && r.status() >= 400 && !NOISE.test(r.url()) && bad.push(`${r.status()} ${norm(r.url())}`));
  try {
    await p.goto(BASE + path, { waitUntil: "networkidle" });
    await sleep(300);
    if (isReport(path)) await closeSurvey(p);
    const now = await clickables(p);
    // Same button by name and position among buttons with that name.
    const sameName = items.slice(0, i).filter((x) => x.name === it.name && x.role === it.role).length;
    const matches = now.map((x, k) => ({ ...x, k })).filter((x) => x.name === it.name && x.role === it.role);
    const target = matches[sameName];
    if (!target) return { path, name: it.name, result: "not found on reload" };
    const handle = (await p.$$('button, [role="switch"], [role="radio"], label:has(> input[type="radio"])')).filter(Boolean);
    // Re-resolve the visible, enabled list the same way clickables() does.
    const visible = [];
    for (const h of handle) {
      const ok = await h.evaluate((el) => {
        if (!el.matches("label") && el.closest('label:has(> input[type="radio"])')) return false;
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.display !== "none" && !el.disabled && el.getAttribute("aria-disabled") !== "true";
      });
      if (ok) visible.push(h);
    }
    const el = visible[target.k];
    const before = await state(p);
    const urlBefore = p.url();
    const chooser = p.waitForEvent("filechooser", { timeout: 2500 }).then(() => "file chooser", () => null);
    await el.click({ timeout: 3000 });
    let result = null;
    for (let t = 0; t < 12 && !result; t++) {
      await sleep(250);
      if (p.url() !== urlBefore) result = "navigated";
      else {
        const now = await state(p).catch(() => before);
        if (now.printed) result = "print dialog";
        else if (now.dialogs > before.dialogs) result = "opened";
        else if (now.text !== before.text || now.flags !== before.flags || now.radios !== before.radios) result = "changed";
      }
    }
    // A button that's busy ("Starting…", "Rebuilding…") is about to go somewhere: wait for it.
    if (result === "changed" || result === "opened") {
      const busy = await p.evaluate(() => [...document.querySelectorAll("button")].some((b) => b.disabled && /…$/.test(b.innerText.trim()))).catch(() => false);
      if (busy) {
        for (let t = 0; t < 60 && p.url() === urlBefore; t++) await sleep(250);
        if (p.url() !== urlBefore) result = "navigated";
        else result = "STUCK BUSY";
      }
    }
    const fc = await Promise.race([chooser, sleep(50).then(() => null)]);
    if (fc && (!result || result === "NOTHING")) result = fc;
    if (!result) result = (await chooser) ?? "NOTHING";
    let dest = null;
    if (result === "navigated") {
      await p.waitForLoadState("networkidle").catch(() => {});
      dest = { url: norm(p.url()), h1: (await p.locator("h1").first().innerText().catch(() => "")).slice(0, 50) };
      if (/doesn(’|')t exist|could(n’|n')t be found|not found/i.test(dest.h1)) result = "NAVIGATED TO NOT FOUND";
    }
    return { path, name: it.name, role: it.role, result, dest, errors: errs.length ? errs : undefined, failed: bad.length ? bad : undefined };
  } catch (e) {
    return { path, name: it.name, result: "CLICK FAILED", error: String(e).slice(0, 200) };
  } finally {
    await p.close();
  }
}

/** The whole check for one person: `who` is "visitor" or "signed in", `seeds` are the pages they start from. */
async function audit(ctx, who, seeds) {
  const page = await ctx.newPage();
  const report = { who, pages: [], deadLinks: [], noWayOut: [], clicks: [] };

  /* 1. Discover pages by following every internal link. */
  const queue = [...seeds];
  const seen = new Set();
  const pageErrors = {};
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    const errs = [];
    const onErr = (e) => errs.push(String(e).slice(0, 160));
    const onCon = (m) => m.type() === "error" && !/404 \(Not Found\)/.test(m.text()) && !NOISE.test(m.text()) && errs.push(m.text().slice(0, 160));
    page.on("pageerror", onErr);
    page.on("console", onCon);
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => null);
    await sleep(400);
    const info = await page.evaluate(() => ({
      links: [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.getAttribute("href"), text: (a.innerText || a.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 50) })),
      h1: document.querySelector("h1")?.innerText ?? "",
      ids: [...document.querySelectorAll("[id]")].map((e) => e.id),
    }));
    page.off("pageerror", onErr);
    page.off("console", onCon);
    const status = res?.status();
    report.pages.push({ path, finalUrl: norm(page.url()), status, h1: info.h1.slice(0, 60), links: info.links.length });
    if (errs.length) pageErrors[path] = errs;
    for (const l of info.links) {
      if (!l.href || l.href === "#") report.deadLinks.push({ on: path, text: l.text, href: l.href });
      else if (l.href.startsWith("#") && !info.ids.includes(l.href.slice(1))) report.deadLinks.push({ on: path, text: l.text, href: l.href, why: "anchor missing" });
      else if (l.href.startsWith("/") && !l.href.startsWith("/api/")) {
        const p = l.href.split("#")[0];
        if (p && !seen.has(p)) queue.push(p);
      }
    }
    // A way out: some link, or a button that leaves (live screens have Back / End).
    if (info.links.filter((l) => l.href && l.href !== "#").length === 0) report.noWayOut.push({ path, h1: info.h1 });
  }
  report.pageErrors = pageErrors;
  report.badStatus = report.pages.filter((p) => (p.status ?? 0) >= 400 && p.path !== "/does-not-exist");
  // Pages that ask you to sign in. A visitor is sent there from every app page; a signed-in user never should be.
  report.sentToLogin = report.pages.filter((p) => p.finalUrl.split("?")[0] === "/login" && p.path !== "/login").map((p) => p.path);

  /* 2. Choose pages to click through: one of each kind, and only pages that opened as themselves. */
  const chosen = new Map();
  for (const pg of report.pages) {
    if ((pg.status ?? 0) >= 400 || pg.path.startsWith("/welcome/start")) continue;
    if (report.sentToLogin.includes(pg.path)) continue;
    // By where it ended up, so an address that only forwards (/landing, /mock/{id}) isn't clicked through twice.
    const k = kind(pg.finalUrl);
    if (!chosen.has(k)) chosen.set(k, pg.path);
  }
  const toClick = [...chosen.values()];
  console.error(who, "pages found", report.pages.length, "clicking through", toClick.length);

  /* 3. Click every button on each page, from a fresh load each time: a few tabs at a time. */
  const jobs = [];
  for (const path of process.env.PAGES_ONLY ? [] : toClick) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await sleep(300);
    if (isReport(path)) await closeSurvey(page);
    const items = (await clickables(page)).slice(0, 30);
    console.error("page", path, items.length, "buttons");
    items.forEach((it, i) => SKIP_CLICK.test(it.name) || jobs.push({ path, items, i, order: jobs.length }));
  }
  const todo = [...jobs];
  await Promise.all(
    Array.from({ length: TABS }, async () => {
      for (let job; (job = todo.shift()); ) report.clicks[job.order] = await clickOne(ctx, job);
    }),
  );
  await page.close();
  report.summary = {
    pages: report.pages.length,
    pagesClicked: toClick.length,
    clicks: report.clicks.length,
    byResult: report.clicks.reduce((m, c) => ((m[c.result] = (m[c.result] || 0) + 1), m), {}),
    flagged: report.clicks.filter((c) => !["navigated", "opened", "changed", "file chooser", "print dialog"].includes(c.result) || c.errors || c.failed),
  };
  return report;
}

(async () => {
  const browser = await chromium.launch({ args: FAKE_MIC });
  const extra = (process.env.EXTRA || "").split(",").filter(Boolean);
  const report = {};
  // Written after each part, so what was found is kept even when a later part stops the check.
  const save = () => require("fs").writeFileSync(`${OUT}/audit.json`, JSON.stringify(report, null, 1));

  /* A visitor: the public pages, and where the app's own pages send someone who isn't signed in. */
  const outside = await prepare(await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: PERMISSIONS }));
  report.visitor = await audit(outside, "visitor", [...PUBLIC, "/does-not-exist"]);
  await outside.close();
  save();
  const shut = report.visitor.sentToLogin.filter((p) => PUBLIC.includes(p));
  if (shut.length) throw new Error(`These public pages ask a visitor to sign in: ${shut.join(", ")}`);

  /* A signed-in user, with an interview of their own so its pages are part of the check. */
  const { context: ctx, page: first } = await signIn(browser, "audit", { permissions: PERMISSIONS });
  await prepare(ctx);
  const interview = await setUpInterview(first);
  await first.close();
  report.signedIn = await audit(ctx, "signed in", [`/interviews/${interview}`, "/dashboard", "/welcome", "/interviews/new", "/presentations/new", "/mic-check", "/does-not-exist", ...extra]);
  save();
  if (report.signedIn.sentToLogin.length) throw new Error(`Signed in, these pages still asked to sign in, so they weren't checked: ${report.signedIn.sentToLogin.join(", ")}`);

  /* Delete, on a throwaway presentation made through set-up (interviews have no delete button at the moment). */
  const d = await ctx.newPage();
  await d.goto(BASE + "/presentations/new", { waitUntil: "networkidle" });
  const planned = d.waitForResponse((r) => r.url().endsWith("/api/presentations/plan"), { timeout: 60000 });
  await d.setInputFiles("#slides-file-input", `${FIXTURES}/hiring-plan.pdf`);
  await d.getByRole("button", { name: "Replace file" }).waitFor({ timeout: 30000 });
  await planned;
  await d.fill("#p-name", "Throwaway deck");
  await d.getByPlaceholder("e.g. A proposal for the Q1 product roadmap").fill("A deck made only to be deleted");
  await d.getByPlaceholder("e.g. Approve the roadmap and required resources").fill("Nothing: this one is deleted straight away");
  await d.getByRole("button", { name: /^Start rehearsal/ }).click();
  await d.waitForURL(/\/rehearse\//, { timeout: 20000 });
  const throwaway = `/presentations/${d.url().split("/rehearse/")[1].split("?")[0]}`;
  await d.goto(BASE + throwaway, { waitUntil: "networkidle" });
  await d.getByRole("button", { name: "Delete presentation" }).click();
  await d.getByRole("button", { name: "Yes, delete" }).click();
  await d.waitForURL(/\/presentations$/, { timeout: 15000 });
  const gone = await d.goto(BASE + throwaway);
  report.delete = { throwaway, landedOn: "/presentations", afterStatus: gone.status() };
  if (gone.status() !== 404) throw new Error(`The deleted presentation still opens (${gone.status()}).`);

  /* Sign out, from Settings: back on the public home page, and the app asks to sign in again. */
  await d.goto(BASE + "/settings", { waitUntil: "networkidle" });
  await d.getByRole("button", { name: "Sign Out" }).last().click();
  await d.waitForURL((u) => u.pathname === "/", { timeout: 15000 });
  await d.goto(BASE + "/dashboard", { waitUntil: "networkidle" });
  report.signOut = { landedOn: "/", thenDashboard: norm(d.url()) };
  if (new URL(d.url()).pathname !== "/login") throw new Error(`After signing out, /dashboard opened ${d.url()} instead of the login page.`);

  /* Summary */
  save();
  const brief = ({ summary, deadLinks, noWayOut, badStatus, pageErrors, sentToLogin }) => ({ summary, deadLinks, noWayOut, badStatus, pageErrors, sentToLogin });
  console.log(JSON.stringify({ visitor: brief(report.visitor), signedIn: brief(report.signedIn), delete: report.delete, signOut: report.signOut }, null, 1));
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
