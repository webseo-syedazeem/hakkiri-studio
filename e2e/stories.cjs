// The Experience Library (/interview-examples): your own bank of example answers. It replaced the story
// bank, and the old /story-bank address now leads here. As a new, signed-in user: add an example and see
// the form's checks, find it in the list, open it, favourite it, narrow the list by search and by tag,
// edit it, and delete it. A new account's library is empty, so everything checked is an example this test
// added itself.
const { chromium } = require("playwright");
const { BASE, OUT, signIn } = require("./helpers.cjs");

const QUESTION = "Tell me about a time you fixed a recurring error before a deadline.";
const ANSWER =
  "Situation: Our payroll report kept missing errors that clients found first. Task: I had to find out why before the next pay run. Action: I rebuilt the SQL checks and added a Python test for every rule. Result: Errors caught before pay day went from 3 in 10 to 9 in 10.";
// A card is headed by the first sentence of its answer, without the "Situation:" label.
const TITLE = "Our payroll report kept missing errors that clients found first";
const TAG = "Zebra payroll"; // a tag no other example has, so the tag filter can single this one out
const EDITED = `${ANSWER} Finance now runs the checks themselves every Monday.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const must = (ok, what) => {
  if (!ok) throw new Error(what);
};

(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const [w, h] of [[1440, 900], [1366, 768]]) {
    const { context, page: p, errors } = await signIn(b, `stories-${w}`, { viewport: { width: w, height: h } });
    const consoleErrors = [];
    p.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    const overflows = () => p.evaluate(() => document.documentElement.scrollWidth - innerWidth > 1);
    // Every example in the list has one favourite star, so the stars count the examples showing.
    const stars = p.getByRole("button", { name: /^[☆★]$/ });
    const heading = p.getByRole("heading", { name: TITLE, exact: true });
    const card = p.locator("div.cursor-pointer").filter({ has: heading });
    const total = async () => Number((await p.getByRole("button", { name: /^All examples \(\d+\)$/ }).innerText()).match(/\d+/)[0]);
    /** Waits for the list to show `n` examples. */
    const shows = async (n, what) => {
      for (let i = 0; i < 25 && (await stars.count()) !== n; i++) await sleep(200);
      must((await stars.count()) === n, `${what}: ${await stars.count()} showing, not ${n}`);
    };

    // The old address still works.
    await p.goto(`${BASE}/story-bank`, { waitUntil: "networkidle" });
    must(/\/interview-examples$/.test(p.url()), `/story-bank should lead to the Experience Library, not ${p.url()}`);
    await p.getByRole("heading", { level: 1, name: "Experience Library" }).waitFor();
    await p.screenshot({ path: `${OUT}/50-bank-${w}.png`, fullPage: true });
    out[`overflow${w}`] = await overflows();
    must(!out[`overflow${w}`], `The Experience Library scrolls sideways at ${w}px`);
    await p.goto(`${BASE}/interview-examples/new`, { waitUntil: "networkidle" });
    out[`overflowAdd${w}`] = await overflows();
    must(!out[`overflowAdd${w}`], `The add-example form scrolls sideways at ${w}px`);

    if (w === 1440) {
      await p.goto(`${BASE}/interview-examples`, { waitUntil: "networkidle" });
      out.header = (await p.locator("h1").innerText()).trim();
      const before = await total();
      must(!(await heading.count()), "A new account already has this test's example");
      // A new account's library is empty: nothing is put in it for the person, and the page says where it is kept.
      must(before === 0, `A new account's library should be empty, not hold ${before} examples`);
      await p.getByText("Your library is empty").waitFor();
      await p.getByText(/Kept in this browser only/).waitFor();

      // Add an example. Nothing is saved without a question and an answer.
      await p.getByRole("link", { name: "+ Add example" }).click();
      await p.waitForURL(/\/interview-examples\/new$/);
      await p.getByRole("heading", { level: 1, name: "Add interview question example" }).waitFor();
      const question = p.getByPlaceholder("e.g. Tell me about a time you led a project.");
      const answer = p.getByPlaceholder(/^Write a concise answer using STAR/);
      const save = p.getByRole("button", { name: "Save example" });
      await save.click();
      must(await question.evaluate((el) => el.validity.valueMissing), "An empty question should be asked for");
      must(/\/interview-examples\/new$/.test(p.url()), "An empty form shouldn't be saved");
      await question.fill("   ");
      await answer.fill(ANSWER);
      await save.click();
      await p.getByText("Please provide an interview question.").waitFor();
      await question.fill(QUESTION);
      await answer.fill("   ");
      await save.click();
      await p.getByText("Please provide your example answer.").waitFor();
      await answer.fill(ANSWER);
      must(!(await p.getByText("Please provide your example answer.").count()), "The message should go once the answer is typed");
      await p.getByText(`${ANSWER.length} / 1,000`).waitFor();

      await p.getByRole("button", { name: "Select competency" }).click();
      await p.getByRole("option", { name: "Problem-solving" }).click();
      await p.getByPlaceholder(/^e\.g\. Associate Product Manager/).fill("Data Analyst");
      await p.getByPlaceholder(/^e\.g\. Competency round/).fill("Hiring manager");
      await p.getByRole("button", { name: "Data-driven", exact: true }).click();
      await p.getByRole("button", { name: "+ Add tag" }).click();
      await p.getByPlaceholder("Tag name").fill(TAG);
      await p.getByRole("button", { name: "Add", exact: true }).click();
      await p.screenshot({ path: `${OUT}/51-bank-add.png`, fullPage: true });
      await save.click();
      await p.waitForURL(/\/interview-examples$/);

      // It's in the list, and still there after a reload.
      await heading.waitFor({ timeout: 15000 });
      must((await total()) === before + 1, `The count should go from ${before} to ${before + 1}, not ${await total()}`);
      await p.reload({ waitUntil: "networkidle" });
      await heading.waitFor();
      out.card = (await card.innerText()).replace(/\n+/g, " | ");
      for (const t of ["Data-driven", TAG]) must(out.card.includes(t), `The example should show the tag “${t}”: ${out.card}`);
      await p.screenshot({ path: `${OUT}/52-bank-added.png`, fullPage: true });

      // Open it: the question, the answer and what it was saved under.
      await heading.click();
      await card.getByText(QUESTION, { exact: true }).waitFor();
      await card.getByText(ANSWER, { exact: true }).waitFor();
      out.open = (await card.innerText()).replace(/\n+/g, " | ").slice(0, 700);
      for (const t of ["Role: Data Analyst", "Competency: Problem-solving", "Type: Hiring manager"]) must(out.open.includes(t), `The open example should say “${t}”: ${out.open}`);
      await heading.click();
      must(!(await card.getByText(QUESTION, { exact: true }).count()), "A second click should close the example");

      // Favourite it: the Favourites tab shows it; un-favourite it and the tab doesn't.
      await card.getByRole("button", { name: "☆" }).click();
      await card.getByRole("button", { name: "★" }).waitFor();
      await p.getByRole("button", { name: "Favourites" }).click();
      await heading.waitFor();
      out.favourites = await stars.count();
      must((await p.getByRole("button", { name: "☆" }).count()) === 0, "Favourites should list only starred examples");
      await card.getByRole("button", { name: "★" }).click();
      await heading.waitFor({ state: "detached" });
      await p.getByRole("button", { name: /^All examples/ }).click();
      await card.getByRole("button", { name: "☆" }).click();
      await card.getByRole("button", { name: "★" }).waitFor();

      // By competency and By role list the same examples today (they don't group them), so it stays in view.
      for (const tab of ["By competency", "By role"]) {
        await p.getByRole("button", { name: tab }).click();
        await heading.waitFor();
        out[tab] = await stars.count();
      }
      await p.getByRole("button", { name: /^All examples/ }).click();

      // Search narrows the list to it, by its answer, its question and its tag; nonsense finds nothing.
      const search = p.getByPlaceholder("Search examples...");
      for (const words of ["payroll report kept missing", "recurring error before a deadline", TAG.toLowerCase()]) {
        await search.fill(words);
        await shows(1, `Searching “${words}” should leave one example`);
        await heading.waitFor();
      }
      await p.screenshot({ path: `${OUT}/53-bank-search.png`, fullPage: true });
      await search.fill("zzqx no such example");
      await p.getByText("No examples match").waitFor();
      await shows(0, "A search that matches nothing should list nothing");
      await search.fill("");
      await shows(before + 1, "An empty search should bring the whole list back");

      // So does its tag.
      await p.getByRole("button", { name: "All tags" }).click();
      await p.getByRole("option", { name: TAG, exact: true }).click();
      await shows(1, `The tag “${TAG}” should leave one example`);
      await heading.waitFor();
      await p.getByRole("button", { name: TAG, exact: true }).click();
      await p.getByRole("option", { name: "All tags", exact: true }).click();
      await shows(before + 1, "All tags should bring the whole list back");

      // Edit the answer and the role. Cancel leaves it alone; Save keeps the change, after a reload too.
      await heading.click();
      await p.getByRole("button", { name: "Edit response" }).click();
      await card.locator("textarea").fill("Something else entirely.");
      await p.getByRole("button", { name: "Cancel" }).click();
      await card.getByText(ANSWER, { exact: true }).waitFor();
      await p.getByRole("button", { name: "Edit response" }).click();
      await card.locator("textarea").fill(EDITED);
      await card.getByPlaceholder("e.g. Associate Product Manager").fill("Senior Data Analyst");
      await p.screenshot({ path: `${OUT}/54-bank-edit.png`, fullPage: true });
      await p.getByRole("button", { name: "Save response" }).click();
      await p.getByText("Example updated.").first().waitFor();
      await card.getByText(EDITED, { exact: true }).waitFor();
      await p.reload({ waitUntil: "networkidle" });
      await card.getByRole("button", { name: "★" }).waitFor();
      await heading.click();
      await card.getByText(EDITED, { exact: true }).waitFor();
      out.edited = (await card.innerText()).replace(/\n+/g, " | ").slice(0, 700);
      must(out.edited.includes("Role: Senior Data Analyst"), `The edited role should show: ${out.edited}`);

      // "Import from CV" made no request and offered invented examples. It has been removed.
      must(!(await p.getByRole("button", { name: "Import from CV" }).count()), "The made-up “Import from CV” should be gone");

      // Delete it: gone from the list, and still gone after a reload.
      await p.getByRole("button", { name: "Delete" }).click();
      await p.getByText("Example removed.").first().waitFor();
      await heading.waitFor({ state: "detached" });
      must((await total()) === before, `Deleting should bring the count back to ${before}, not ${await total()}`);
      await p.reload({ waitUntil: "networkidle" });
      await p.getByRole("heading", { level: 1, name: "Experience Library" }).waitFor();
      must(!(await heading.count()), "A deleted example shouldn't come back after a reload");
      out.count = `${before} → ${before + 1} → ${await total()}`;

      // On to practice.
      await p.getByRole("link", { name: /Practice Hub/ }).last().click();
      await p.waitForURL(/\/practice$/);
      out.practise = (await p.locator("h1").innerText()).slice(0, 80);
    }
    out[`errors${w}`] = [...new Set([...errors, ...consoleErrors])];
    must(errors.length === 0, `A page crashed at ${w}px: ${errors.join(" ¦ ")}`);
    await context.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error("FAILED", e); process.exit(1); });
