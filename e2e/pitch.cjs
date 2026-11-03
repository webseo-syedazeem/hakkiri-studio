const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:3100';
const S = __dirname, OUT = `${__dirname}/out`; require('fs').mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['microphone'] });
  await ctx.addCookies([{ name: 'hk_welcomed', value: '1', url: BASE }, { name: 'hk_mic_ok', value: '1', url: BASE }]);
  await ctx.addInitScript(() => { Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true }); });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const shot = (n) => p.screenshot({ path: `${OUT}/e2e-${n}.png`, fullPage: true });
  const out = {};
  const step = (s) => { out.step = s; console.error('step', s); };

  step('new pdf');
  await p.goto(BASE + '/presentations/new', { waitUntil: 'networkidle' });
  await p.setInputFiles('#slides-file', `${S}/fixtures/hiring-plan.pdf`);
  await p.getByText('5 slides', { exact: true }).waitFor({ timeout: 30000 });
  await p.getByRole('button', { name: 'Suggest again' }).waitFor({ timeout: 30000 });
  out.pdfTitle = await p.inputValue('#title');
  out.pdfTimes = await p.locator('button[aria-label^="Slide "]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  await p.fill('#ask', 'Approve the new salary bands by Friday');
  await p.locator('#ask').blur();
  await sleep(1500);
  await p.getByRole('button', { name: /^Slide 4,/ }).click();
  await p.getByRole('button', { name: 'More time' }).click();
  out.overWarning = await p.getByText(/over your 10:00/).count();
  await shot('1-new-pdf');
  await p.getByRole('button', { name: /Fit to 10:00/ }).click();
  out.panel = await p.locator('section[aria-label="Suggested timing"]').innerText();
  await p.getByRole('button', { name: 'Start first run' }).click();
  await p.waitForURL(/\/rehearse\//, { timeout: 15000 });
  const pdfId = p.url().split('/rehearse/')[1];
  out.pdfId = pdfId;
  await sleep(800);
  await shot('2-rehearse-ready');

  step('full run');
  await p.getByRole('button', { name: 'Start run' }).click();
  await p.getByText('Recording', { exact: true }).waitFor({ timeout: 10000 });
  for (let i = 0; i < 4; i++) {
    await sleep(2500);
    await p.keyboard.press('ArrowRight');
  }
  await sleep(1500);
  await shot('3-rehearse-running');
  await p.getByRole('button', { name: 'Finish run' }).click();
  await p.waitForURL(/\/runs\//, { timeout: 60000 });
  await sleep(1000);
  await shot('4-run-report');
  out.report = (await p.locator('main').innerText()).slice(0, 1400);
  await p.locator('button[aria-expanded]').nth(1).click();
  await sleep(500);
  out.slideOpen = (await p.getByText('What you said').count()) > 0;
  await shot('5-run-report-open');

  step('qa');
  await p.goto(BASE + `/qa/${pdfId}`, { waitUntil: 'networkidle' });
  await p.getByText(/questions ready/).waitFor({ timeout: 30000 });
  await shot('6-qa-ready');
  await p.getByRole('button', { name: 'Start Q&A' }).click();
  let turns = 0;
  for (let i = 0; i < 12; i++) {
    const fin = p.getByRole('button', { name: 'Finish answer' });
    try {
      await fin.waitFor({ timeout: 25000 });
    } catch {
      break;
    }
    await sleep(3000);
    if (i === 1) await shot('7-qa-answering');
    out['qa' + i] = await p.locator('h1').innerText();
    await fin.click();
    turns++;
    await sleep(1500);
    if (/\/presentations\/.+\/qa\//.test(p.url())) break;
  }
  out.qaTurns = turns;
  await p.waitForURL(/\/presentations\/.+\/qa\//, { timeout: 60000 });
  await sleep(800);
  await shot('8-qa-report');
  out.qaReport = (await p.locator('main').innerText()).slice(0, 900);

  step('pptx');
  await p.goto(BASE + '/presentations/new', { waitUntil: 'networkidle' });
  await p.setInputFiles('#slides-file', `${S}/fixtures/seed-round.pptx`);
  await p.getByText('5 slides', { exact: true }).waitFor({ timeout: 30000 });
  await p.getByRole('button', { name: 'Suggest again' }).waitFor({ timeout: 30000 });
  out.pptxTitle = await p.inputValue('#title');
  out.pptxSlides = await p.locator('button[aria-label^="Slide "]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  await p.getByText('Investors', { exact: true }).click();
  await shot('9-new-pptx');
  await p.getByRole('button', { name: 'Start first run' }).click();
  await p.waitForURL(/\/rehearse\//, { timeout: 15000 });
  const pptxId = p.url().split('/rehearse/')[1];
  await p.goto(BASE + `/rehearse/${pptxId}?from=4&to=4`, { waitUntil: 'networkidle' });
  out.sectionLabel = await p.locator('header').innerText();
  await p.getByRole('button', { name: 'Start run' }).click();
  await sleep(7000);
  await shot('10-section-running');
  await p.getByRole('button', { name: 'Finish run' }).click();
  await p.waitForURL(/\/runs\//, { timeout: 60000 });
  await sleep(800);
  await shot('11-section-report');
  out.sectionReport = (await p.locator('main').innerText()).slice(0, 700);

  step('notes');
  await p.goto(BASE + '/presentations/new', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Paste your notes instead' }).click();
  await p.fill('textarea[aria-label="Your notes"]', 'Why we are here\nThe team missed two deadlines this quarter\n\nWhat changes\nWeekly demos\nSmaller releases\n\nWhat I need\nYour support for a two week freeze');
  await p.getByRole('button', { name: 'Use these notes' }).click();
  await p.getByText('3 sections').waitFor({ timeout: 10000 });
  await p.getByRole('button', { name: 'Suggest again' }).waitFor({ timeout: 30000 });
  await shot('12-new-notes');

  step('workspace');
  await p.goto(BASE + `/presentations/${pdfId}`, { waitUntil: 'networkidle' });
  await shot('13-workspace-new');
  await p.goto(BASE + '/presentations', { waitUntil: 'networkidle' });
  await shot('14-list');
  out.errors = errs;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
