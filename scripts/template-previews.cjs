// Renders a preview image of every CV template, for the template galleries: public/cv-templates/NN-id.webp (the
// template's own page) and NN-id-small.webp (the gallery cards). With "letter", the same for each template drawn as a
// cover letter (public/cover-letter-templates), using the example's own letter.
// Each is drawn by the app's own renderer, the same one that makes the PDF, with an example CV that suits it.
// Run against a running app in test mode:
//   BASE=http://127.0.0.1:3179 node scripts/template-previews.cjs [letter]
// ONLY=clearline,fieldwork renders just those templates.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
// sharp comes with Next.js, which uses it for images.
const sharp = require("sharp");

const BASE = process.env.BASE || "http://127.0.0.1:3179";
const LETTER = process.argv[2] === "letter";
const OUT = path.join(__dirname, "..", "public", LETTER ? "cover-letter-templates" : "cv-templates");
fs.mkdirSync(OUT, { recursive: true });
const src = fs.readFileSync(path.join(__dirname, "..", "src", "lib", "cv", "render", "templates.ts"), "utf8");
// id and number of every template, read from the catalogue itself.
const ONLY = (process.env.ONLY || "").split(",").filter(Boolean);
const all = [...src.matchAll(/\n  "?([a-z-]+)"?: \{\n    id: "([a-z-]+)",\n    no: (\d+),\n    name: "([^"]+)",\n    family: "([a-z-]+)"/g)].map((m) => ({ id: m[2], no: Number(m[3]), name: m[4], family: m[5] }));
/** The example each family is shown with. */
const EXAMPLE = { technical: "software-engineer", "early-career": "cs-graduate", executive: "customer-success", condensed: "project-manager", specialist: "business-analyst", expressive: "marketing-lead", contemporary: "marketing-lead", classic: "product-manager", minimal: "data-scientist" };
const OWN = { ward: "staff-nurse", scholar: "data-scientist", research: "data-scientist", index: "devops-engineer", kernel: "software-engineer" };

(async () => {
  // The first 45 and the five v3 designs (46, 47, 49, 51, 52).
  if (all.length !== 50) throw new Error(`Expected 50 templates, found ${all.length}`);
  const templates = ONLY.length ? all.filter((t) => ONLY.includes(t.id)) : all;
  const browser = await chromium.launch();
  // Tall enough that the whole first page is on screen: a clip outside the window comes out black.
  const context = await browser.newContext({ viewport: { width: 1440, height: 2400 }, deviceScaleFactor: 2, extraHTTPHeaders: { "x-forwarded-for": "10.9.7.7" } });
  await context.addInitScript(() => sessionStorage.setItem("dismiss_phone_notice", "1"));
  const page = await context.newPage();
  const res = await page.request.post(`${BASE}/api/auth/signup`, { data: { email: `previews-${Date.now()}@example.com`, password: "Password123!", name: "Previews" } });
  if (!res.ok()) throw new Error(`Sign-up failed: ${res.status()}`);
  const made = {};
  for (const t of templates.sort((a, b) => a.no - b.no)) {
    const example = OWN[t.id] ?? EXAMPLE[t.family];
    // The v3 designs (46 and up) are shown with the short common CV of TEMPLATES-v3: the two latest roles (five and
    // three bullets), education and skills, so that it fits on one page and a side column shows beside the main text.
    // A letter is one column in every design, and its sentences rest on the whole CV: letters use the full example.
    const short = t.no >= 46 && !LETTER;
    const key = short ? `${example}-short` : example;
    if (!made[key]) {
      made[key] = (await (await page.request.post(`${BASE}/api/cv/templates`, { data: { templateId: example, name: key, region: "uk", letter: LETTER } })).json()).id;
      if (short) {
        const cv = (await (await page.request.get(`${BASE}/api/cv/versions/${made[key]}`)).json()).cv;
        const sections = cv.sections.map((s) => {
          if (s.kind === "experience") return { ...s, entries: s.entries.slice(0, 2).map((e, i) => ({ ...e, bullets: e.bullets.slice(0, i === 0 ? 5 : 3) })) };
          if (["summary", "education", "skills", "languages"].includes(s.kind)) return s;
          return { ...s, visible: false };
        });
        const cut = await page.request.patch(`${BASE}/api/cv/versions/${made[key]}`, { data: { rev: cv.rev, saveId: `short${Date.now()}`, sections } });
        if (!cut.ok()) throw new Error(`Couldn't shorten ${key}: ${cut.status()}`);
      }
    }
    const id = made[key];
    const cv = (await (await page.request.get(`${BASE}/api/cv/versions/${id}`)).json()).cv;
    const saved = await page.request.patch(`${BASE}/api/cv/versions/${id}`, { data: { rev: cv.rev, saveId: `p${Date.now()}${t.id}`, design: { ...cv.design, template: t.id } } });
    if (!saved.ok()) throw new Error(`Couldn't set ${t.id}: ${saved.status()}`);
    await page.goto(`${BASE}/cv/v/${id}/${LETTER ? "letter" : "talk"}`);
    const paper = page.locator("svg.cv-paper").first();
    await paper.waitFor({ timeout: 20000 });
    // The paper alone: no rounded corners or shadow from the screen around it, and nothing hovered.
    await page.addStyleTag({ content: ".cv-paper{border-radius:0!important;box-shadow:none!important}.cv-lmark{display:none!important}" });
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
