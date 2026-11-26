// Renders a preview image of every CV template, for the template gallery: public/cv-templates/NN-id.webp (the
// template's own page) and NN-id-small.webp (the gallery cards).
// Each is drawn by the app's own renderer, the same one that makes the PDF, with an example CV that suits it.
// Run against a running app in test mode:
//   BASE=http://127.0.0.1:3179 node scripts/template-previews.cjs
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
// sharp comes with Next.js, which uses it for images.
const sharp = require("sharp");

const BASE = process.env.BASE || "http://127.0.0.1:3179";
const OUT = path.join(__dirname, "..", "public", "cv-templates");
const src = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "cv", "render", "templates.ts"), "utf8");
// id and number of every template, read from the catalogue itself.
const templates = [...src.matchAll(/\n  "?([a-z-]+)"?: \{\n    id: "([a-z-]+)",\n    no: (\d+),\n    name: "([^"]+)",\n    family: "([a-z-]+)"/g)].map((m) => ({ id: m[2], no: Number(m[3]), name: m[4], family: m[5] }));
/** The example each family is shown with. */
const EXAMPLE = { technical: "software-engineer", "early-career": "cs-graduate", executive: "customer-success", condensed: "project-manager", specialist: "business-analyst", expressive: "marketing-lead", contemporary: "marketing-lead", classic: "product-manager", minimal: "data-scientist" };
const OWN = { ward: "staff-nurse", scholar: "data-scientist", research: "data-scientist", index: "devops-engineer", kernel: "software-engineer" };

(async () => {
  if (templates.length !== 45) throw new Error(`Expected 45 templates, found ${templates.length}`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2, extraHTTPHeaders: { "x-forwarded-for": "10.9.7.7" } });
  await context.addInitScript(() => sessionStorage.setItem("dismiss_phone_notice", "1"));
  const page = await context.newPage();
  const res = await page.request.post(`${BASE}/api/auth/signup`, { data: { email: `previews-${Date.now()}@example.com`, password: "Password123!", name: "Previews" } });
  if (!res.ok()) throw new Error(`Sign-up failed: ${res.status()}`);
  const made = {};
  for (const t of templates.sort((a, b) => a.no - b.no)) {
    const example = OWN[t.id] ?? EXAMPLE[t.family];
    made[example] ??= (await (await page.request.post(`${BASE}/api/cv/templates`, { data: { templateId: example, name: example, region: "uk" } })).json()).id;
    const id = made[example];
    const cv = (await (await page.request.get(`${BASE}/api/cv/versions/${id}`)).json()).cv;
    const saved = await page.request.patch(`${BASE}/api/cv/versions/${id}`, { data: { rev: cv.rev, saveId: `p${Date.now()}${t.id}`, design: { ...cv.design, template: t.id } } });
    if (!saved.ok()) throw new Error(`Couldn't set ${t.id}: ${saved.status()}`);
    await page.goto(`${BASE}/cv/v/${id}/talk`);
    const paper = page.locator("svg.cv-paper").first();
    await paper.waitFor({ timeout: 20000 });
    // The paper alone: no rounded corners or shadow from the screen around it, and nothing hovered.
    await page.addStyleTag({ content: ".cv-paper{border-radius:0!important;box-shadow:none!important}" });
    await page.mouse.move(0, 0);
    await page.waitForTimeout(600);
    const box = await paper.boundingBox();
    const file = path.join(OUT, `${String(t.no).padStart(2, "0")}-${t.id}.webp`);
    // Whole pixels inside the paper's edge, so no sliver of the dark screen behind it shows.
    const clip = { x: Math.ceil(box.x), y: Math.ceil(box.y), width: Math.floor(box.width) - 1, height: Math.floor(box.height) - 1 };
    const png = await page.screenshot({ type: "png", clip });
    await sharp(png).webp({ quality: 70, effort: 6 }).toFile(file);
    await sharp(png).resize({ width: 550 }).webp({ quality: 80, effort: 6 }).toFile(file.replace(/\.webp$/, "-small.webp"));
    console.log(`No. ${String(t.no).padStart(2, "0")} ${t.name} (${example}) -> ${path.basename(file)}`);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
