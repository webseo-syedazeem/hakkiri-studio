// Builds the sample CV files the upload tests read. Run from the repo root:
//   node e2e/fixtures/cv/src/build.cjs
// Needs Chromium (Playwright), LibreOffice (soffice) and python-docx. The built files are
// committed, so the tests themselves need none of these.
// Every person, employer and detail here is made up for testing and appears nowhere in the app.
const { chromium } = require("playwright");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const OUT = path.join(__dirname, "..");
const page = (css, body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@page{size:A4;margin:16mm 15mm}body{font:10.5pt/1.4 Arial,Helvetica,sans-serif;color:#111;margin:0}
h1{font-size:22pt;margin:0}h2{font-size:12pt;margin:14pt 0 5pt}p{margin:0 0 3pt}ul{margin:3pt 0 8pt;padding-left:16pt}li{margin:1.5pt 0}
${css}</style></head><body>${body}</body></html>`;

/* 1. One column, UK, dates on the right of the title line, list bullets. */
const maya = page(
  `.row{display:flex;justify-content:space-between}.row b{font-weight:bold}h2{text-transform:uppercase;border-bottom:1px solid #999}`,
  `<h1>Maya Chen</h1>
<p>Leeds, UK | maya.chen@example.com | 07700 900456 | linkedin.com/in/maya-chen-ppc</p>
<h2>Profile</h2>
<p>Paid media manager with six years’ experience running Google and Meta campaigns for retail and travel brands. Comfortable owning budgets of up to £1.2m a year and reporting to client directors.</p>
<h2>Experience</h2>
<div class="row"><b>Paid Media Manager, Northlight Agency, Leeds</b><span>Mar 2021 – Present</span></div>
<ul><li>Run Google Ads and Meta campaigns for six retail clients with a combined budget of £1.2m a year, reporting results to each client’s marketing director every month</li>
<li>Cut average cost per lead by 18% in six months by rebuilding account structure</li>
<li>Manage two junior executives and review their weekly reports</li></ul>
<div class="row"><b>Senior PPC Executive, Harbour Travel Group, Manchester</b><span>Jun 2018 – Feb 2021</span></div>
<ul><li>Managed search campaigns across 12 European markets</li>
<li>Introduced weekly budget pacing that stopped overspend in peak season</li></ul>
<div class="row"><b>PPC Executive, Brightside Digital Ltd</b><span>2016 – 2018</span></div>
<ul><li>Built and optimised campaigns for 20 small business accounts</li><li>Wrote monthly performance reports for clients</li></ul>
<h2>Education</h2>
<div class="row"><span>BA (Hons) Marketing, 2:1 – University of Leeds</span><span>2013 – 2016</span></div>
<p>A-Levels: Business (A), English (B), Psychology (B) – Notre Dame Sixth Form College, 2013</p>
<h2>Skills</h2>
<p>Platforms: Google Ads, Meta Ads Manager, Microsoft Advertising, Google Analytics 4</p>
<p>Tools: Looker Studio, Excel, Supermetrics</p>
<h2>Certifications</h2>
<p>Google Ads Search Certification – Google (2023)</p>
<p>Meta Certified Media Buying Professional, Meta, 2022</p>
<h2>Languages</h2>
<p>English (native), Mandarin (conversational)</p>`,
);

/* 2. Two columns: a narrow side column on the left, the main column on the right. */
const daniel = page(
  `body{display:grid;grid-template-columns:150pt 1fr;gap:22pt}aside{background:#f1f1f1;padding:10pt;font-size:9.5pt}aside h2{font-size:10.5pt}main h2{color:#1d3f8a}.d{color:#444;font-style:italic}`,
  `<aside><h2>Contact</h2><p>daniel.okoye@example.com</p><p>+44 7700 900812</p><p>Bristol</p><p>github.com/dokoye</p>
<h2>Skills</h2><p>TypeScript</p><p>React</p><p>Node.js</p><p>PostgreSQL</p><p>AWS</p><p>Leadership</p>
<h2>Languages</h2><p>English – native</p><p>Igbo – fluent</p><p>French – B1</p></aside>
<main><h1>Daniel Okoye</h1><p>Senior Software Engineer</p>
<h2>Profile</h2><p>Software engineer with nine years’ experience building web products for logistics and retail companies. Leads small teams and still writes code most days.</p>
<h2>Work Experience</h2>
<p><b>Parcelwise Ltd</b></p><p><b>Senior Software Engineer</b></p><p class="d">January 2020 – Present · Bristol</p>
<ul><li>Lead a team of five engineers building the driver routing service used by 4,000 couriers</li><li>Cut route calculation time from 40 seconds to 6 by moving the solver to a queue</li></ul>
<p><b>Software Engineer</b></p><p class="d">March 2017 – December 2019 · Bristol</p>
<ul><li>Built the customer tracking page, now the most visited page on the site</li></ul>
<p><b>Greenbox Retail</b></p><p><b>Junior Developer</b></p><p class="d">September 2015 – February 2017 · Bath</p>
<ul><li>Maintained the stock management system for 60 shops</li><li>Wrote the first automated tests for the checkout</li></ul>
<h2>Education</h2><p><b>University of Bristol</b></p><p>BSc Computer Science, First Class Honours</p><p class="d">2012 – 2015</p></main>`,
);

/* 5. LinkedIn's own "Save to PDF" layout, rebuilt by hand: a grey side column, then the profile. */
const linkedin = page(
  `@page{margin:0}body{display:grid;grid-template-columns:170pt 1fr;min-height:296mm}aside{background:#293e49;color:#fff;padding:26pt 14pt;font-size:9.5pt}aside h2{font-size:12pt;margin-top:16pt}main{padding:26pt 22pt}main h1{font-size:24pt}main h2{font-size:15pt;color:#555;font-weight:normal;margin-top:18pt}.c{font-size:12pt}.t{font-size:11pt}.m{color:#888}footer{position:fixed;bottom:10pt;right:22pt;color:#888;font-size:9pt}`,
  `<aside><h2>Contact</h2><p>amara.lindqvist@example.com</p><p>www.linkedin.com/in/amara-lindqvist-78b21 (LinkedIn)</p>
<h2>Top Skills</h2><p>Supply Chain Management</p><p>Demand Planning</p><p>SAP</p>
<h2>Languages</h2><p>Swedish (Native or Bilingual)</p><p>English (Full Professional)</p>
<h2>Certifications</h2><p>CIPS Level 4 Diploma</p></aside>
<main><h1>Amara Lindqvist</h1><p class="t">Supply Chain Manager at Fjord Outdoor</p><p class="m">Manchester, England, United Kingdom</p>
<h2>Summary</h2><p>I plan and run supply chains for outdoor clothing brands. Over eight years I have moved from analyst to manager, and I enjoy the point where forecasting meets the warehouse floor.</p>
<h2>Experience</h2>
<p class="c">Fjord Outdoor</p><p class="t">Supply Chain Manager</p><p class="m">April 2021 - Present (3 years 8 months)</p><p class="m">Manchester, England, United Kingdom</p>
<p>Responsible for demand planning across 14 countries. Reduced stock-outs on core lines from 9% to 3% in two seasons.</p>
<p class="c">Kestrel Sportswear</p><p class="m">5 years 2 months</p><p class="t">Senior Supply Chain Analyst</p><p class="m">June 2018 - March 2021 (2 years 10 months)</p>
<p>Built the weekly forecast used by the buying team.</p>
<p class="t">Supply Chain Analyst</p><p class="m">February 2016 - May 2018 (2 years 4 months)</p>
<h2>Education</h2><p class="c">Lund University</p><p class="m">Master of Science - MS, Logistics · (2013 - 2015)</p>
<p class="c">Uppsala University</p><p class="m">Bachelor of Science - BS, Business Studies · (2010 - 2013)</p></main>
<footer>Page 1 of 1</footer>`,
);

/* 6. A "scan": the CV as a picture, with no text in the file. */
const scanned = (png) => `<!doctype html><html><head><style>@page{size:A4;margin:0}body{margin:0}img{width:210mm}</style></head><body><img src="data:image/png;base64,${png}"></body></html>`;

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cvfix-"));
  const browser = await chromium.launch();
  const p = await browser.newPage();
  const pdf = async (html, name) => {
    await p.setContent(html, { waitUntil: "load" });
    await p.pdf({ path: path.join(OUT, name), format: "A4", printBackground: true });
  };
  await pdf(maya, "maya-chen.chrome.pdf");
  await pdf(daniel, "daniel-okoye.two-column.pdf");
  await pdf(linkedin, "amara-lindqvist.linkedin.pdf");
  await p.setContent(maya, { waitUntil: "load" });
  await p.setViewportSize({ width: 794, height: 1123 });
  const shot = await p.screenshot({ type: "png" });
  await pdf(scanned(shot.toString("base64")), "scanned.pdf");
  await browser.close();

  // Word files written by LibreOffice from the same page, and a PDF made from that Word file:
  // a different producer, with typed bullet marks and tab stops.
  fs.writeFileSync(path.join(tmp, "maya-chen.html"), maya.replace(/<div class="row"><b>(.*?)<\/b><span>(.*?)<\/span><\/div>/g, "<p><b>$1</b>&#9;$2</p>").replace(/<div class="row"><span>(.*?)<\/span><span>(.*?)<\/span><\/div>/g, "<p>$1&#9;$2</p>"));
  const soffice = (args) => execFileSync("soffice", ["--headless", "--norestore", ...args], { cwd: tmp, stdio: "ignore", env: { ...process.env, HOME: tmp } });
  soffice(["--convert-to", "docx:MS Word 2007 XML", "maya-chen.html"]);
  fs.copyFileSync(path.join(tmp, "maya-chen.docx"), path.join(OUT, "maya-chen.writer.docx"));
  soffice(["--convert-to", "pdf", "maya-chen.docx"]);
  fs.copyFileSync(path.join(tmp, "maya-chen.pdf"), path.join(OUT, "maya-chen.writer.pdf"));
  soffice(["--convert-to", "doc:MS Word 97", "maya-chen.docx"]);
  fs.copyFileSync(path.join(tmp, "maya-chen.doc"), path.join(OUT, "old-word.doc"));
  soffice(["--convert-to", 'pdf:writer_pdf_Export:{"EncryptFile":{"type":"boolean","value":"true"},"DocumentOpenPassword":{"type":"string","value":"open-sesame"}}', "--outdir", path.join(tmp, "locked"), "maya-chen.docx"]);
  fs.copyFileSync(path.join(tmp, "locked", "maya-chen.pdf"), path.join(OUT, "password.pdf"));

  // Word files written by python-docx: heading styles, list styles, a table layout, a page header.
  execFileSync("python3", [path.join(__dirname, "build_docx.py"), OUT], { stdio: "inherit" });
  // A PDF of the US resume, to read the same table layout through a PDF.
  fs.copyFileSync(path.join(OUT, "priya-nair.table.docx"), path.join(tmp, "priya-nair.docx"));
  soffice(["--convert-to", "pdf", "priya-nair.docx"]);
  fs.copyFileSync(path.join(tmp, "priya-nair.pdf"), path.join(OUT, "priya-nair.table.pdf"));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(fs.readdirSync(OUT).filter((f) => /\.(pdf|docx|doc)$/.test(f)).join("\n"));
})();
