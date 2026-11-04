const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function generatePDF() {
  const htmlPath = path.resolve(__dirname, "handover-report.html");
  const outputPdfPath = path.resolve(__dirname, "Hakkiri_Studio_Desktop_App_Status_Report.pdf");
  const rootPdfPath = path.resolve(__dirname, "..", "..", "Hakkiri_Studio_Desktop_App_Status_Report.pdf");
  const artifactDir = "C:\\Users\\ZESTRO\\.gemini\\antigravity\\brain\\82519eb1-b1d5-4abd-9cd8-bd322a987833";
  const artifactPdfPath = path.join(artifactDir, "Hakkiri_Studio_Desktop_App_Status_Report.pdf");

  console.log("Loading HTML from:", htmlPath);

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
  });

  const page = await browser.newPage();
  await page.goto("file:///" + htmlPath.replace(/\\/g, "/"), { waitUntil: "networkidle" });

  await page.pdf({
    path: outputPdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "12mm",
      bottom: "12mm",
      left: "12mm",
      right: "12mm",
    },
  });

  console.log("PDF generated at:", outputPdfPath);

  // Copy to root workspace and brain directory
  fs.copyFileSync(outputPdfPath, rootPdfPath);
  console.log("Copied PDF to root workspace:", rootPdfPath);

  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(outputPdfPath, artifactPdfPath);
    console.log("Copied PDF to artifact directory:", artifactPdfPath);
  }

  await browser.close();
  console.log("Completed successfully!");
}

generatePDF().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
