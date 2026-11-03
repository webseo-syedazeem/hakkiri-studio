// Full check: every page, every link, every button. Mock mode, fake mic.
// For each page: load it, list every enabled button/switch/radio, then for each one
// reload the page and click it, recording what happened (navigated / opened / changed /
// file chooser / nothing), plus console errors and failed requests. Also: dead links,
// pages with no way out, and the destination of every navigation.
const { chromium } = require("playwright");
const S = __dirname, OUT = `${__dirname}/out`; require("fs").mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE || "http://127.0.0.1:3100";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SKIP_CLICK = /^(Yes, delete)$/; // done once, on a throwaway interview, at the end

async function setup(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ["microphone"] });
  await ctx.addCookies([{ name: "hk_welcomed", value: "1", url: BASE }, { name: "hk_mic_ok", value: "1", url: BASE }]);
  await ctx.addInitScript(() => {
    try {
      Object.defineProperty(window, "speechSynthesis", { value: undefined });
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

(async () => {
  const browser = await chromium.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const ctx = await setup(browser);
  const page = await ctx.newPage();
  const report = { pages: [], deadLinks: [], noWayOut: [], clicks: [], problems: [] };

  /* 1. Discover pages by following every internal link. */
  const seeds = ["/", "/welcome", "/interviews/new", "/presentations/new", "/mic-check", "/does-not-exist", ...(process.env.EXTRA || "").split(",").filter(Boolean)];
  const queue = [...seeds];
  const seen = new Set();
  const pageErrors = {};
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    const errs = [];
    const onErr = (e) => errs.push(String(e).slice(0, 160));
    const onCon = (m) => m.type() === "error" && !/404 \(Not Found\)/.test(m.text()) && errs.push(m.text().slice(0, 160));
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

  /* 2. Choose pages to click through: one of each kind (all report kinds kept). */
  const kind = (p) =>
    p
      .replace(/\/answers\/[^?]+(\?.*)?$/, "/answers/:id$1".replace("$1", ""))
      .replace(/\/runs\/[^/?]+/, "/runs/:id")
      .replace(/\?from=\d+&to=\d+/, "?from=n")
      .replace(/\/mocks\/[0-9a-f-]{36}/, (m) => m) // every session report is checked
      .replace(/^\/welcome\/start\?.*/, "/welcome/start");
  const chosen = new Map();
  for (const pg of report.pages) {
    if ((pg.status ?? 0) >= 400 || pg.path.startsWith("/welcome/start")) continue;
    const k = kind(pg.path);
    if (!chosen.has(k)) chosen.set(k, pg.path);
  }
  const toClick = [...chosen.values()];
  console.error("pages found", report.pages.length, "clicking through", toClick.length);

  /* 3. Click every button on each page, from a fresh load each time. */
  for (const path of toClick) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await sleep(300);
    const items = (await clickables(page)).slice(0, 30);
    console.error("page", path, items.length, "buttons");
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (SKIP_CLICK.test(it.name)) continue;
      const p = await ctx.newPage();
      const errs = [];
      const bad = [];
      p.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
      p.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errs.push(m.text().slice(0, 160)));
      p.on("response", (r) => r.url().startsWith(BASE) && r.status() >= 400 && bad.push(`${r.status()} ${norm(r.url())}`));
      try {
        await p.goto(BASE + path, { waitUntil: "networkidle" });
        await sleep(300);
        const now = await clickables(p);
        // Same button by name and position among buttons with that name.
        const sameName = items.slice(0, i).filter((x) => x.name === it.name && x.role === it.role).length;
        const matches = now.map((x, k) => ({ ...x, k })).filter((x) => x.name === it.name && x.role === it.role);
        const target = matches[sameName];
        if (!target) {
          report.clicks.push({ path, name: it.name, result: "not found on reload" });
          await p.close();
          continue;
        }
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
          if (/could(n’|n')t be found|not found/i.test(dest.h1)) result = "NAVIGATED TO NOT FOUND";
        }
        report.clicks.push({ path, name: it.name, role: it.role, result, dest, errors: errs.length ? errs : undefined, failed: bad.length ? bad : undefined });
      } catch (e) {
        report.clicks.push({ path, name: it.name, result: "CLICK FAILED", error: String(e).slice(0, 200) });
      }
      await p.close();
    }
  }

  /* 4. Delete, on a throwaway interview made through set-up. */
  const d = await ctx.newPage();
  await d.goto(BASE + "/interviews/new", { waitUntil: "networkidle" });
  await d.fill("#company", "Throwaway Ltd");
  await d.fill("#job-title", "Account Executive");
  await d.fill('input[aria-label="Job spec: a link or the job description"]', "Sell our software to small firms. Own your pipeline, run demos, handle objections and close deals. Report weekly numbers to the sales lead. Experience in B2B sales and a CRM is a plus. We value honesty, energy and great notes.");
  await d.setInputFiles("#cv", `${S}/fixtures/sam-okafor-cv.pdf`);
  await d.getByText("sam-okafor-cv.pdf", { exact: true }).waitFor({ timeout: 20000 });
  await d.getByRole("button", { name: "Build my interview" }).click();
  await d.waitForURL(/\?new=1/, { timeout: 60000 });
  const throwaway = norm(d.url()).split("?")[0];
  report.salesUnderstanding = (await d.locator('section[aria-label="What Hakkiri understood"]').innerText()).slice(0, 700);
  await d.getByRole("button", { name: "Delete interview" }).click();
  await d.getByRole("button", { name: "Yes, delete" }).click();
  await d.waitForURL(/\/interviews$/, { timeout: 15000 }).catch(() => {});
  const gone = await d.goto(BASE + throwaway);
  report.delete = { throwaway, landedOn: "/interviews", afterStatus: gone.status() };

  /* Summary */
  report.summary = {
    pages: report.pages.length,
    pagesClicked: toClick.length,
    clicks: report.clicks.length,
    byResult: report.clicks.reduce((m, c) => ((m[c.result] = (m[c.result] || 0) + 1), m), {}),
    flagged: report.clicks.filter((c) => !["navigated", "opened", "changed", "file chooser", "print dialog"].includes(c.result) || c.errors || c.failed),
  };
  require("fs").writeFileSync(`${OUT}/audit.json`, JSON.stringify(report, null, 1));
  console.log(JSON.stringify({ summary: report.summary, deadLinks: report.deadLinks, noWayOut: report.noWayOut, badStatus: report.badStatus, pageErrors: report.pageErrors, delete: report.delete }, null, 1));
  await browser.close();
})().catch((e) => {
  console.error("FAILED", e);
  process.exit(1);
});
