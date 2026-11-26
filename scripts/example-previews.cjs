// Draws the first page of every example CV, UK and US, in its own design: public/example-previews/{id}-{region}.webp,
// 550px wide, for the cards on "Find an example or template". Drawn by the app's own renderer.
// Run against a running app in test mode:
//   BASE=http://127.0.0.1:3179 node scripts/example-previews.cjs
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
// sharp comes with Next.js, which uses it for images.
const sharp = require("sharp");

const BASE = process.env.BASE || "http://127.0.0.1:3179";
const OUT = path.join(__dirname, "..", "public", "example-previews");
fs.mkdirSync(OUT, { recursive: true });
// Every example id, read from the example files themselves.
const dir = path.join(__dirname, "..", "src", "lib", "cv", "examples", "data");
const ids = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && f !== "letters.ts")
  .flatMap((f) => [...fs.readFileSync(path.join(dir, f), "utf8").matchAll(/\n {4}id: "([a-z0-9-]+)",\n {4}industry:/g)].map((m) => m[1]));

(async () => {
  if (ids.length < 33) throw new Error(`Expected at least 33 examples, found ${ids.length}`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2, extraHTTPHeaders: { "x-forwarded-for": "10.9.8.7" } });
  await context.addInitScript(() => sessionStorage.setItem("dismiss_phone_notice", "1"));
  const page = await context.newPage();
  const res = await page.request.post(`${BASE}/api/auth/signup`, { data: { email: `examples-${Date.now()}@example.com`, password: "Password123!", name: "Previews" } });
  if (!res.ok()) throw new Error(`Sign-up failed: ${res.status()}`);
  let made = 0;
  for (const id of ids) {
    for (const region of ["uk", "us"]) {
      // A fresh account every 15 copies, so the limit on CVs per account is never reached.
      if (made && made % 15 === 0) {
        await page.context().clearCookies();
        // Each from its own address: sign-ups are limited per address.
        await page.request.post(`${BASE}/api/auth/signup`, { data: { email: `examples-${Date.now()}-${made}@example.com`, password: "Password123!", name: "Previews" }, headers: { "x-forwarded-for": `10.9.${made % 250}.${1 + (made % 200)}` } });
      }
      const r = await (await page.request.post(`${BASE}/api/cv/templates`, { data: { templateId: id, name: id, region } })).json();
      if (!r.id) throw new Error(`Couldn't copy ${id} (${region}): ${JSON.stringify(r)}`);
      made++;
      await page.goto(`${BASE}/cv/v/${r.id}/talk`);
      const paper = page.locator("svg.cv-paper").first();
      await paper.waitFor({ timeout: 20000 });
      await page.addStyleTag({ content: ".cv-paper{border-radius:0!important;box-shadow:none!important}" });
      await page.mouse.move(0, 0);
      await page.waitForTimeout(600);
      const box = await paper.boundingBox();
      const clip = { x: Math.ceil(box.x), y: Math.ceil(box.y), width: Math.floor(box.width) - 1, height: Math.floor(box.height) - 1 };
      const png = await page.screenshot({ type: "png", clip });
      const file = path.join(OUT, `${id}-${region}.webp`);
      await sharp(png).resize({ width: 550 }).webp({ quality: 80, effort: 6 }).toFile(file);
      console.log(`${id} ${region} -> ${path.basename(file)}`);
    }
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
