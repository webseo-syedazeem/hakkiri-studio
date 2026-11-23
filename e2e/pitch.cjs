// Presentations, as a signed-in user with nothing but what this test adds: set-up from a PDF (slide plan
// and timing), a full rehearsal through every slide, its report, audience Q&A and its report; then a
// PowerPoint and a run of one slide; then pasted notes instead of slides; then the workspace and the list.
const { chromium } = require('playwright');
const { BASE, OUT, FIXTURES, FAKE_MIC, signIn } = require('./helpers.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Stops the test with a plain reason when something a person would notice is wrong. */
function must(ok, what) {
  if (!ok) throw new Error(what);
}

(async () => {
  const b = await chromium.launch({ args: [...FAKE_MIC, '--autoplay-policy=no-user-gesture-required'] });
  const { page: p } = await signIn(b, 'pitch');
  const errs = [];
  const note = (e) => errs.includes(e) || errs.push(e);
  p.on('pageerror', (e) => note('pageerror: ' + e.message));
  // A failed request is listed with its address, which says more than the console's "Failed to load resource".
  p.on('console', (m) => { if (m.type() === 'error' && !/^Failed to load resource/.test(m.text())) note('console: ' + m.text()); });
  p.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(BASE)) note(`${r.status()} ${r.request().method()} ${r.url().replace(BASE, '')}`); });
  const shot = (n) => p.screenshot({ path: `${OUT}/e2e-${n}.png`, fullPage: true });
  const out = {};
  const step = (s) => { out.step = s; console.error('step', s); };
  const main = () => p.locator('main').innerText();
  const planRows = () => p.locator('table tbody tr').evaluateAll((trs) => trs.map((tr) => [...tr.cells].map((c) => c.innerText.trim()).join(' | ')));
  const keyMessage = p.getByPlaceholder('e.g. A proposal for the Q1 product roadmap');
  const ask = p.getByPlaceholder('e.g. Approve the roadmap and required resources');

  /** Chooses a slides file on the set-up screen and waits for it to be read and its timing suggested. */
  async function chooseSlides(file, slides) {
    await p.goto(BASE + '/presentations/new', { waitUntil: 'networkidle' });
    const planned = p.waitForResponse((r) => r.url().endsWith('/api/presentations/plan'), { timeout: 60000 });
    await p.setInputFiles('#slides-file-input', `${FIXTURES}/${file}`);
    await p.getByRole('button', { name: 'Replace file' }).waitFor({ timeout: 30000 });
    must((await planned).ok(), `${file}: the timing for the slides couldn't be suggested`);
    await p.getByText(`1 of ${slides}`, { exact: true }).waitFor({ timeout: 15000 });
    const rows = await planRows();
    must(rows.length === slides, `${file}: expected ${slides} slides in the plan, found ${rows.length}`);
    return rows;
  }

  /** Saves the set-up and lands on the rehearsal screen; returns the new presentation's id. */
  async function startRehearsal() {
    await p.getByRole('button', { name: /^Start rehearsal/ }).click();
    await p.waitForURL(/\/rehearse\//, { timeout: 20000 });
    return p.url().split('/rehearse/')[1].split('?')[0];
  }

  /** Ends the run that is recording and waits for its report. */
  async function endRehearsal() {
    await p.getByRole('button', { name: 'End rehearsal' }).click();
    await p.waitForURL(/\/runs\//, { timeout: 60000 });
    await p.getByRole('heading', { level: 1, name: /Rehearsal report$/ }).waitFor({ timeout: 15000 });
    await sleep(800);
  }

  step('new pdf');
  out.pdfTimes = await chooseSlides('hiring-plan.pdf', 5);
  out.pdfTitle = await p.inputValue('#p-name');
  must(out.pdfTitle === 'Hiring plan 2027', `the name should come from the slides, got "${out.pdfTitle}"`);
  await keyMessage.fill('Three changes will get engineering hiring back on track');
  await ask.fill('Approve the new salary bands by Friday');
  // Timing: give slide 4 another minute, see the total go over the 10:00 limit, then put it back.
  const total = () => p.getByText(/^Total: /).innerText();
  must(/^Total: 10:00 \/ 10:00$/.test(await total()), `the suggested timing should fill the 10 minutes, got "${await total()}"`);
  await p.getByRole('button', { name: 'Edit timing' }).click();
  const slide4 = p.locator('input[type="number"]').nth(3);
  const planned4 = Number(await slide4.inputValue());
  await slide4.fill(String(planned4 + 60));
  out.totalOver = await total();
  must(/^Total: 11:00 \/ 10:00$/.test(out.totalOver), `a minute more on slide 4 should show in the total, got "${out.totalOver}"`);
  await slide4.fill(String(planned4));
  out.totalFits = await total();
  await p.getByRole('button', { name: 'Edit timing' }).click();
  await shot('1-new-pdf');
  out.plan = await planRows();
  const pdfId = await startRehearsal();
  out.pdfId = pdfId;
  await sleep(800);
  await shot('2-rehearse-ready');

  step('full run');
  await p.getByRole('button', { name: 'Start', exact: true }).click();
  await p.getByText('Recording', { exact: true }).waitFor({ timeout: 10000 });
  for (let i = 0; i < 4; i++) {
    await sleep(2500);
    await p.keyboard.press('ArrowRight');
  }
  await sleep(1500);
  out.lastSlide = (await main()).match(/CURRENT SLIDE\s+(\d+)\s+of (\d+)/i)?.slice(1).join(' of ');
  must(out.lastSlide === '5 of 5', `four presses of the right arrow should reach slide 5 of 5, got "${out.lastSlide}"`);
  await shot('3-rehearse-running');
  await endRehearsal();
  await shot('4-run-report');
  out.report = (await main()).slice(0, 1400);
  must(/Slides reached\s+5 \/ 5/.test(await main()), 'the run report should say all 5 slides were reached');
  // Open another slide in the slide-by-slide list.
  await p.getByRole('button', { name: /4\. Three changes/ }).click();
  await sleep(500);
  out.slideOpen = await p.getByRole('heading', { name: 'Slide 4: Three changes' }).isVisible();
  must(out.slideOpen, 'choosing slide 4 in the run report should open its coaching');
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
  await p.getByText('Question by question').waitFor({ timeout: 15000 });
  await sleep(800);
  await shot('8-qa-report');
  out.qaReport = (await main()).slice(0, 900);
  must(turns >= 4, `the audience should ask at least four questions, answered ${turns}`);
  // The sceptical audience quotes what you want from them, so the ask typed at set-up has to reach here.
  must(/approve the new salary bands by Friday/i.test(await main()), 'the audience’s questions should use the ask typed at set-up');

  step('pptx');
  out.pptxSlides = await chooseSlides('seed-round.pptx', 5);
  out.pptxTitle = await p.inputValue('#p-name');
  await p.getByRole('button', { name: 'Investors', exact: true }).click();
  await keyMessage.fill('The pilot numbers justify a seed round now');
  await ask.fill('Join the seed round');
  await shot('9-new-pptx');
  const pptxId = await startRehearsal();
  await p.goto(BASE + `/rehearse/${pptxId}?from=4&to=4`, { waitUntil: 'networkidle' });
  out.sectionLabel = (await p.locator('header').innerText()).replace(/\n+/g, ' | ');
  // Only slide 4 is in this run: it is the one slide in the strip, with nothing after it.
  out.sectionSlide = (await main()).match(/CURRENT SLIDE\s+(\d+)/i)?.[1];
  must(out.sectionSlide === '4', `a run of slide 4 should open on slide 4, got "${out.sectionSlide}"`);
  must(await p.getByRole('button', { name: 'Next slide', exact: true }).isDisabled(), 'a run of one slide should have no next slide');
  await p.getByRole('button', { name: 'Start', exact: true }).click();
  await p.getByText('Recording', { exact: true }).waitFor({ timeout: 10000 });
  await sleep(7000);
  await shot('10-section-running');
  await endRehearsal();
  await shot('11-section-report');
  out.sectionReport = (await main()).slice(0, 700);

  step('notes');
  await p.goto(BASE + '/presentations/new', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Paste notes' }).click();
  await p.fill('textarea[aria-label="Your notes"]', 'Why we are here\nThe team missed two deadlines this quarter\n\nWhat changes\nWeekly demos\nSmaller releases\n\nWhat I need\nYour support for a two week freeze');
  await p.getByRole('button', { name: 'Use these notes' }).click();
  await p.getByText('1 of 3', { exact: true }).waitFor({ timeout: 10000 });
  out.notesSlides = await planRows();
  must(out.notesSlides.length === 3 && /Why we are here/.test(out.notesSlides[0]), `three paragraphs of notes should make three slides, got ${JSON.stringify(out.notesSlides)}`);
  await shot('12-new-notes');

  step('workspace');
  await p.goto(BASE + `/presentations/${pdfId}`, { waitUntil: 'networkidle' });
  must((await p.locator('h1').innerText()) === out.pdfTitle, 'the presentation’s own page should open under its name');
  must(/5 slides, 10:00/.test(await main()), 'the presentation’s page should show its slide plan: 5 slides, 10:00');
  await shot('13-workspace-new');
  await p.goto(BASE + '/presentations', { waitUntil: 'networkidle' });
  for (const id of [pdfId, pptxId]) must((await p.locator(`a[href="/presentations/${id}"]`).count()) > 0, `the list should show presentation ${id}`);
  await shot('14-list');
  out.errors = errs;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error('FAILED', e); process.exit(1); });
