// A phone (390 wide). On each screen: the page doesn't scroll sideways, and no link, button or field
// lies off the side of the screen where it can't be reached. Walked as a new account with one interview.
const { chromium } = require("playwright");
const { BASE, OUT, signIn } = require("./helpers.cjs");

const results = [];
const check = (ok, what, detail = "") => {
  results.push({ ok: !!ok, what });
  console.log(`${ok ? "ok  " : "FAIL"} ${what}${ok || !detail ? "" : `  → ${String(detail).slice(0, 400)}`}`);
};

/** Controls that sit partly or wholly outside the viewport and can't be scrolled into view sideways. */
const offScreen = (page) =>
  page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("a, button, input, select, textarea, [role=button], [role=tab]")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (r.right <= vw + 4 && r.left >= -4) continue;
      let parent = el.parentElement;
      let reachable = false;
      while (parent && parent !== document.documentElement) {
        const o = getComputedStyle(parent).overflowX;
        if ((o === "auto" || o === "scroll") && parent.scrollWidth > parent.clientWidth + 2) {
          reachable = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (!reachable) out.push(`${(el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").slice(0, 30)} [${Math.round(r.left)}–${Math.round(r.right)}]`);
    }
    return { sideways: document.documentElement.scrollWidth > vw + 1, out };
  });

(async () => {
  const browser = await chromium.launch();
  try {
    const { page: p, context } = await signIn(browser, "phone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    context.setDefaultTimeout(30000);
    await p.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
    const built = await p.evaluate(async () => {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: { name: "Northwind Freight" },
          job: { title: "Operations Analyst", text: "Northwind Freight needs an Operations Analyst to track delivery performance, build weekly reports in SQL and Excel, and work with depot managers to cut late deliveries." },
          cv: { text: "Jo Bell\nOperations Coordinator, Parcel Line, 2020 to 2025\n- Built the weekly late-delivery report in Excel\n- Cut missed collections by 12%\nBA Geography, Hull", label: "CV.pdf" },
          format: "video",
          stages: [{ id: "st-1", name: "First interview", status: "next" }, { id: "st-2", name: "Assessment day", status: "upcoming" }],
        }),
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    });
    if (built.status !== 200) throw new Error(`The interview couldn't be built: ${built.status} ${JSON.stringify(built.body)}`);
    const id = built.body.id;

    const visit = async (name, path) => {
      await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      await p.waitForTimeout(700);
      // The "best on a bigger screen" notice is closed, as a person would.
      const cont = p.getByRole("button", { name: "Continue on Mobile" });
      if (await cont.isVisible().catch(() => false)) await cont.click();
      const r = await offScreen(p);
      await p.screenshot({ path: `${OUT}/phone-${name}.png` });
      check(!r.sideways, `${name}: the page doesn't scroll sideways`);
      check(r.out.length === 0, `${name}: every control is on the screen`, r.out.join(" ; "));
    };

    await visit("welcome", "/welcome");
    await visit("home", "/dashboard");
    await visit("interviews", "/interviews");
    await visit("workspace", `/interviews/${id}`);
    await visit("rebuild", `/interviews/${id}/rebuild?edit=1`);
    await visit("past-interviews", `/interviews/${id}/mocks`);

    // The "New interview" button on the list can be tapped.
    await p.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    const cont = p.getByRole("button", { name: "Continue on Mobile" });
    if (await cont.isVisible().catch(() => false)) await cont.click();
    const add = p.getByRole("link", { name: /New interview/ }).first();
    const tapped = await add.tap({ timeout: 6000 }).then(() => true, () => false);
    if (tapped) await p.waitForURL(/\/interviews\/new/, { timeout: 15000 }).catch(() => undefined);
    check(tapped && /\/interviews\/new/.test(p.url()), "Interviews: “New interview” can be tapped and opens set-up", p.url());
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
