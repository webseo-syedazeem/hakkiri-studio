# CV and cover letter section

Built step by step on `feature/cv-section` from the design spec ("CV section design spec") and the
48 requirements. This file says where things are. It grows with each step.

## The rules everything here follows

1. **Nothing is invented.** Every word on a CV was typed, spoken or uploaded by its owner. Code may sort
   text into boxes; it never writes text of its own.
2. **A new CV starts empty.** No sample content, anywhere, for anyone.
3. **One person's CV is theirs alone.** Every read and write goes through `store.ts`, which takes the
   person's id. Someone else's CV and a CV that does not exist give the same "not found".
4. **Nothing is lost.** Text the upload reader cannot place is handed back as "unassigned text".

## What is built so far (step 1: set-up and upload)

| Where | What |
| --- | --- |
| `schema.ts` | The CV document (`CvDoc`): contact, an ordered list of sections, design settings, a revision number. One record per version (a base CV, or a tailored version of it). |
| `sections.ts` | What each section is called (UK and US), its fields, and the rule shown beside it. Forms, the reader and (later) the paper and score all read from here. |
| `store.ts` | Where CVs and uploads are kept (`cv_versions`, `cv_imports`), always by owner. Also `exportCvData` and `deleteCvData` for Settings. |
| `access.ts` | Route helpers: the signed-in person's id, the set-up form's checks, a new empty CV. |
| `import/` | The upload reader. See below. |
| `src/app/api/cv/` | `versions` (list, create, read, save, delete) and `imports` (upload, check, replace file, open in builder, discard). |
| `src/components/cv/` | The screens: dashboard, set-up, upload check, builder. `cv.css` holds the design tokens from the mock-ups. |
| `src/app/(studio)/cv/` | The routes: `/cv`, `/cv/new`, `/cv/import/[importId]`, `/cv/import/[importId]/review/[section]`, `/cv/v/[versionId]/edit/[section]`. `/apply/cvs` redirects here. |

### The upload reader (`import/`)

A file becomes lines, and lines become a CV:

1. `pdf.ts` and `docx.ts` turn a file into `DocLine`s: text plus what is known about how it looked (bold,
   size, bullet, heading style, wide gaps, which column). `lines.ts` does the same for pasted text.
   The file is read in memory and never stored.
2. `parse.ts` finds the headings (`headings.ts`), then reads each block: `contact.ts`, `entries.ts`
   (roles, education, projects, certificates…), and skills and lists in `parse.ts` itself. `dates.ts` reads
   dates; `lexicon.ts` holds the word lists that tell a job title from an employer from a place.
3. Where the reader is unsure it adds a **flag** on that exact field, with the reason. Every field also
   records **which lines of the file it came from** (`where`), so the check screen can show the source
   beside the field and each uploaded bullet keeps a pointer to its line.
4. `unplacedLines` then compares the file with the result. Anything that did not make it across is
   returned as **unassigned text**. Lines left out on purpose (date of birth, street address,
   "references on request") are listed with the reason.
5. `record.ts` is the upload record (`CvImport`): the file's text, the draft CV, the flags and what the
   person has decided. Nothing reaches the CV until "Open in builder" (`applyImport`).
6. `errors.ts`: a file that cannot be read (a scan, a locked PDF, an old `.doc`) gives a reason and the
   way forward for that reason: another file, or pasting the text.

Saving uses the revision number: a save from an out-of-date copy gets `409` and nothing is overwritten;
the same save sent twice is applied once (`saveId`).

## Step 2: the builder, templates and files

| Where | What |
| --- | --- |
| `edit.ts` | The rules of editing that do not depend on the screen: the form's tabs, moving an item, switching a passage off, what one step of Undo is, which field a passage on the paper opens, how two copies of a CV differ. |
| `render/flow.ts` | The CV as it will be printed, in reading order, with only what is switched on. **Everything below starts from this one list**, so the paper, the PDF, the Word file and the check cannot disagree about what the CV says. |
| `render/templates.ts` | The eight templates and what a person may change (font pairing, accent, spacing, order). All are one column of real text. Body text is 10.5pt and never changes. |
| `render/layout.ts` | Lays the flow out on pages from the font files' own measurements. Used by the browser for the paper and by the server for the PDF, so both break lines and pages in the same places. `fitToPages` changes spacing only; it never crops or shrinks, and returns the lines that ran over when a CV is too long. |
| `render/ttf.ts`, `render/fonts/` | A small TrueType reader and subsetter, and the four font families (all SIL Open Font Licence; licence texts are beside the files). |
| `render/pdf.ts` | The PDF writer: embedded subset fonts with Unicode maps, a tag tree (H1 name, H2 sections, H3 entries, lists, links), title and language set, no author. Drawn rules are marked as decoration. |
| `render/docx.ts` | The Word writer: real headings, a real bulleted list, hyperlinks, no tables. Fonts are named with fallbacks, not embedded. |
| `render/readback.ts` | Reads a finished file back **with the upload reader** (`import/pdf.ts`, `import/docx.ts`), which shares no code with the writers, and compares it word for word with the flow. |
| `render/server.ts` | `exportCv`: make the file, read it back, return the bytes that were checked. |
| `src/app/api/cv/versions/[id]/export` | The download. A file is sent only if it read back the same as the CV; otherwise `409` with the differences. If the reader itself fails, `503`, and the file is sent only when asked for as `unchecked=1`. |
| `src/app/api/cv/versions/[id]/check` | Makes both files and reports each one's read-back, with the revision checked. |
| `src/app/api/cv/versions/[id]/duplicate` | A separate copy ("Copy of …"); can carry unsaved changes, for "save as a separate version". |
| `src/app/api/cv/fonts/[file]` | Serves the listed font files to the paper preview. |
| `src/components/cv/Workspace.tsx` | One loaded CV shared by all its screens (in `cv/v/[versionId]/layout.tsx`): save state, undo history, the paper, the field in focus. Moving between tabs reloads nothing. |
| `src/components/cv/useCv.ts` | Autosave (800ms idle, on leaving a field, on leaving the page), "Saved on this device" when offline, Undo and Redo, and the three choices when the CV was changed somewhere else. What is on screen is never replaced by the server's tidied copy while typing. |
| `src/components/cv/Paper.tsx`, `usePaper.ts` | The paper: an SVG drawn from the layout with the same font files the PDF embeds. Clicking a passage opens its field; the line being edited is marked. Text view is the same content as plain text. |
| `src/components/cv/Arrange.tsx` | The inclusion switch, the drag handle and the Move menu (Move up, Move down, Move to). |
| `src/components/cv/Editor.tsx`, `Finish.tsx` | The builder (form 552 / paper 616) and the Finish tab (settings 352 / paper 816): template, fonts, colour, paper size, page target, spacing, order on the page, file name, checks and downloads. |

Things worth knowing:

- **Switched off is not deleted.** Sections, entries, bullets, skill groups, single skills and list items
  each have `visible`. Off means "left off the page in this version"; it stays in the form and in the data.
- **The order on the page is separate from the form's tabs.** `design.order` holds section ids when the
  person has set their own order; otherwise the template's order is used.
- **A file is "Checked" only for the revision it was made from.** Any later save makes it "Out of date".
- **Fonts in production.** `next.config.ts` lists the font files under `outputFileTracingIncludes` so
  they travel with the `/api/cv/**` routes. They are read from `src/lib/cv/render/fonts` at run time.
- **A character none of the fonts can draw** (Chinese, say) would print as an empty box. The PDF is
  withheld and the character is named. The fonts cover Latin, Latin Extended, Greek and Cyrillic.
- Dialogs are in the address (`?panel=add-section`, `page-overflow`, `save-conflict`, `file-loss`,
  `rename`, `duplicate`, `delete-version`), so Back closes them.

## Step 3: writing help from the person's own words

The rule: a draft may only say what the person said. That is enforced in code, not left to a prompt.

| Where | What |
| --- | --- |
| `write/facts.ts` | Reads the facts out of a piece of text: figures (however written: "£1.2m", "six", "18 percent"), whether each is an estimate, a minimum or a maximum, the words that say whose work it was ("helped", "led"), and the words that carry content. |
| `write/check.ts` | The checks. `checkGrounded`: a draft adds nothing to its sources. `checkRewrite`: a rewrite also loses nothing (every figure, the outcome, the share of the work, every estimate). `checkMerge`: a detail the person gave is in, as given. `checkProfile`: a profile says only what the CV says. Each failure names the exact difference. |
| `write/draft.ts` | The same jobs done by rule from the person's own sentences. Used in test mode and when the AI service does not answer. |
| `write/assist.ts` | The tools. Each asks the model (through the app's `ask()` helper) and puts the reply through the checks. A draft that fails twice never reaches the person: a rewrite is refused with the reason; bullets and profiles fall back to the rule version. `writingMode()` is `ai` (keys present), `rules` (`HAKKIRI_MOCK_AI=1`) or `off`. |
| `write/skills.ts` | Skills worth adding, found by rule from the CV's own bullets and the target advert. Each has the CV line that shows it, or is asked as "Do you have this?". No AI call. |
| `src/app/api/cv/versions/[id]/write/[tool]` | `bullets`, `rewrite`, `number`, `profile`, `question` (POST) and `skills`, `status` (GET). Owner only, `guard(req, "ai", { userId })`, usage recorded as "cv writing". None of them saves anything: accepting a draft is an ordinary save from the builder. |
| `src/app/api/cv/transcribe` | Speech to text for "Tell me what you did" (Deepgram). Answers 501 in test mode or without a key; it never returns stand-in words. |
| `src/app/api/cv/bank` | Saved achievements (`cv_achievements`): list with the CVs that use each, add, change, delete. |
| `src/components/cv/Capture.tsx` | "Tell me what you did" (`/cv/v/[id]/capture/[entryId or new]`): three questions, typed or spoken, proposed bullets beside the exact words each came from. |
| `src/components/cv/Assist.tsx` | Help with one bullet, in place of the paper: its sources, Add the number, Rewrite, Practise this claim, Save to achievements. |
| `src/components/cv/Writing.tsx` | The profile chooser (two versions, previewed on the paper before use), skills suggestions, and "Use a saved achievement". |
| `src/components/cv/Bank.tsx` | The achievements screen (`/cv/bank`). |

Things worth knowing:

- **Nothing is written from a job title.** With no answers, `bullets` returns 400 and no model is called.
- **"Add the number" never supplies one.** The detail is the person's; it is placed by rule if the model's wording fails the check.
- **Sources stay with the bullet.** `bullet.sources` holds the person's own words (and a rewrite keeps the wording as it was); `bullet.bankId` links a line to its saved achievement.
- **Private achievements** are not offered when building a CV.
- The prompts are in `write/assist.ts`. They ask for the right thing; the checks are what guarantee it.

## Step 4: the CV score, findings, the Software view and download records

| Where | What |
| --- | --- |
| `score/detect.ts` | The patterns the score looks for in a line (a weak verb, filler, a likely passive, the other region's spelling, an unexplained acronym, a big claim, an outcome, scale). Each returns the exact phrase it found. No AI call. |
| `score/score.ts` | `scoreCv`: 35 checks in four groups (Evidence 45, Clarity 20, Structure 20, Readable by software 15) and the unscored gap prompt (`gapsIn`). The weights are the `RULES` table. Every finding carries a pointer to its line (`at`), the span of the phrase, the reason, the action and what fixing it is worth. |
| `score/audit.ts` | The free public check (`/cv-audit`, `POST /api/audit`) on the same engine: pasted text is read by the upload reader and scored by the same checks. What pasted text cannot show is left pending. This replaces the old rubric, which had floors. |
| `render/software.ts` | The Software view: the real file is made and read back, then compared two ways: every word in order, and the fields a parser sorts them into (name, headings, each role's title, employer, dates and bullets). `atsReady` is true only when all of that holds; otherwise `why` lists the reasons. |
| `src/app/api/cv/versions/[id]/software` | `GET ?format=pdf|docx`: the Software view for the saved CV. |
| `src/app/api/cv/versions/[id]/exports`, `src/app/api/cv/exports/[exportId]` (+ `/file`) | Download records (`cv_exports`). Each download saves the CV exactly as it was. `/file` makes the file again from that copy at the same time stamp, which gives the same bytes. The newest 30 per CV are kept. |
| `src/components/cv/Workspace.tsx` | Works the score out 400ms after the last change (`score`), and remembers findings seen in this visit that are no longer found (`cleared`). |
| `src/components/cv/Findings.tsx` | The score screen (`/cv/v/[id]/findings`, 320 / 848): the number, the four groups, findings by severity, Fixed, Excluded from this version, "How this is scored", the gap prompt, and "good enough" at 85. |
| `src/components/cv/Editor.tsx` | The score in the bar; under the field being edited, its most important finding with "View more", "Add the number" and "Accept". |
| `src/components/cv/Software.tsx` | The Software view screen (`/cv/v/[id]/software/[format]`), the "what you sent" screen (`/cv/v/[id]/exports/[exportId]`) and the downloads list on Finish. |

How the points work, as built:

- A per-item check earns its weight in proportion to the visible items that pass ("5 of 7 bullets").
- A check that does not apply (no phone given, no links, no acronyms) hands its weight to the rest of its group, so each group is always worth its full points.
- A missing essential field earns nothing. With no bullets, the evidence checks earn nothing.
- File checks that have not run for the CV as it is now are pending: shown as "x points confirmed · y pending".
- There is no floor, and nothing here blocks a download. 85 is "good enough to apply".
- `cv.accepted` holds words the person told the checks to leave alone (a name spelt the other region's way, an acronym).
- A finding on a line that is then switched off is "Excluded from this version", not "Fixed" (`edit.ts: stateAt`).

## Step 5: tailoring to a job, and job fit

| Where | What |
| --- | --- |
| `tailor/requirements.ts` | Reads what an advert asks for, by rule, in the advert's own words (`quote`). Headings decide required or preferred; duties under "The role" are kept at the lighter weight; benefits, "about us" and how to apply are left out. |
| `tailor/fit.ts` | `assess` gives each requirement Met, Partly met or Missing from the CV as it is now, with the lines that show it and the words not covered. `jobFit`: required weighs 2, preferred or unstated 1; met earns the weight, partly met half, missing nothing; the score is earned over total. No requirements, no score. No floor. `keywords`: the advert's own terms, on the CV or not. |
| `tailor/propose.ts` | Assembling before rewording: move lines that show a requirement to the top of their role, offer (not select) switching off lines that show none, offer saved achievements that show something missing. `applyProposals` records each change with its reason; `effectOf` says what a set of changes does to fit and flags any requirement left worse off. |
| `src/app/api/cv/versions/[id]/tailor` | Makes a tailored version: a copy linked to its base (`kind: "tailored"`, `parentId`, `parentRev`) with the advert kept word for word and its requirements read. The base is never changed by the copy. |
| `src/components/cv/Tailor.tsx` | The tailoring screen (`/cv/v/[id]/tailor`, 720 / 448): job fit with its arithmetic, one row per requirement, "Do you have this?", Link evidence, the advert with the chosen requirement marked, the advert's terms marked on the paper. |
| `src/components/cv/Changes.tsx` | Proposed changes (`/cv/v/[id]/changes/proposed`) and the report of what changed and why (`/changes/report`). |

Things worth knowing:

- **Nothing about fit is stored.** `cv.requirements` holds the advert's words, the person's reading, priority, the lines they linked and any gap they recorded. Whether each is met is worked out from the CV every time, so it cannot go stale: switch off the only line that showed something and the fit drops at once.
- **Met needs one line that shows the whole of it.** Words scattered across lines are Partly met. A skill listed on its own is Partly met ("no line shows where you used it").
- **"Do you have this?"** Yes asks for one line on what was done and where, previews it, and adds it under a role the person picks (one is suggested). A bare "Yes" adds nothing. No records a gap, which stays in the total.
- **Evidence in other words** is the person's to link ("Link evidence"), as all of it or part of it; part of it must name what is not covered.
- **Highlights are screen overlays.** Terms marked on the paper never reach a file, and nothing from the advert is put into the CV.
- `cv.changes` is the report: each change made while tailoring, with before, after, the reason and the requirement it was for.
- The list of CVs shows each CV's score and, where it has an advert, its job fit (`store.listCvSummaries`).

## Step 6: the cover letter

| Where | What |
| --- | --- |
| `schema.ts` (`LetterSchema`) | The letter is part of its version (`cv.letter`): what it is written from (the reason, one or two chosen CV lines, a passage for tone, the recipient, the date, the sign-off, the person's notes) and the paragraphs, each a list of sentences. Every sentence keeps the lines it was last checked against. |
| `letter/sources.ts` | What a letter may rest on, in two kinds kept apart: the person's own (every CV line that is switched on, their reason, their notes) and the employer's (the advert, clause by clause, and the job's title and employer). `sourceState` says whether a noted source still reads the same. |
| `letter/check.ts` | `checkSentence`: the review every sentence goes through, drafted or typed. `reviewLetter`: every sentence as Sourced, No source needed, Needs a source or Review source. `recordSources`, `acceptSources`, and `reflow` (editing a paragraph keeps the sentences that were not touched). |
| `letter/draft.ts` | The letter assembled by rule from the person's own words (`letterByRule`), `voiceOf` (contractions, their word for the job), a CV line as a first-person sentence (`lineSentence`), `insertEvidence`, and `shortenings` (ways to shorten a paragraph that keep its sources). |
| `letter/flow.ts` | The letter in reading order as the same kind of flow the CV is printed from, `joinFlows` (letter, then the CV on a new page), `layoutLetter` and `letterFit` (one page, and which paragraph crosses the boundary). |
| `letter/assist.ts` | The AI path: a draft, and a shorter wording of one paragraph, each put through `checkSentence` before it is returned. A draft that fails is replaced by the rule-assembled letter. |
| `src/app/api/cv/versions/[id]/letter/[tool]` | `POST draft`, `POST shorten`, `POST check`, `GET export?format=pdf|docx[&with=cv]`. |
| `src/components/cv/Letter.tsx` | The letter screen (`/cv/v/[id]/letter`, 552 / 616): inputs or paragraph editor on the left, the letter on its page on the right. Dialogs: `edit-job`, `choose-evidence`, `review-letter-claim`, `page-overflow`. |

Things worth knowing:

- **The rule.** What a sentence says about the person (experience, results, motivation) must be in their CV, their reason or a note. What it says about the employer must be in the advert. A word from the advert does not become the person's experience by being said in the first person: "I have experience with Spectrum" is refused when Spectrum is only in the advert, while "I would welcome the chance to catalogue new acquisitions" (a wish, in the advert's words) passes.
- **A figure must come from a line about the same thing.** "Six pupils" on the CV does not back "six new starters" in the letter.
- **Words that carry no claim** (`LETTER_GLUE`: apply, role, thank, welcome…) need no source. Praise and character words are not in it: "passionate" passes only if the person wrote it.
- **The same review for typed text.** Editing a paragraph re-checks the sentences that changed. Nothing is exempt for having been typed by hand.
- **A letter with an open sentence cannot be downloaded.** The export route refuses (409 `unsourced`, naming each sentence), and the buttons are off. The three ways out are the spec's: remove it, rewrite it from a CV line, or back it with a note in the person's own words. A note cannot back a claim about the employer.
- **Review source.** Each sentence keeps the wording of the lines it passed against. If one of those lines is later changed, switched off or removed, that sentence alone is marked; "It still holds" re-reads the line as it is now and is refused when the sentence no longer matches.
- **In their voice** means their words: the opening is their reason word for word, each evidence sentence is their CV line in the first person, and the few joining sentences follow whether they write "I'm" or "I am" and whether they say role, position or job. The passage for tone is never used as a fact.
- **Same paper as the CV.** The letter uses the version's template, fonts, accent colour, paper size and margins, and the same writers and read-back check. One page is the target; a longer letter is reported, never shrunk. With the CV in the same file, the CV starts on a new page.
- **Download records** keep the letter, the CV and the advert as they were, with the date the letter was sent with, so "Download this file again" gives the same bytes.
- **A letter belongs to one job.** A duplicate keeps it; a version tailored to another job starts without one.

## Tests

- `npx vitest run src/lib/cv`: every reading rule (`dates`, `lines`, `reader`), every sample file
  (`files.test.ts`, including "nothing invented" and "nothing lost" checks on each), and the API
  (`api.test.ts`: ownership, saving, uploads, unreadable files, Settings data).
- Sample files are in `e2e/fixtures/cv/` and are rebuilt with `node e2e/fixtures/cv/src/build.cjs`
  (needs Chromium, LibreOffice and python-docx; the built files are committed). They come from three
  different programs so the reader is not only tested against one writer's habits. The LinkedIn sample
  is a hand-built copy of LinkedIn's "Save to PDF" layout, not a real export.
- `edit.test.ts`: tabs, moving, switching off, undo and redo, paper-to-field, comparing two copies.
- `render/*.test.ts`: the font reader, the layout rules (keeping headings with their entries, fitting,
  never shrinking type), and every template exported to PDF and Word and read back three ways:
  pdf.js, poppler (`pdftotext`, `pdffonts`, `pdfinfo`) and LibreOffice. The poppler and LibreOffice
  checks are skipped on a machine that does not have them.
- `write/*.test.ts`: every writing rule (figures, estimates, "helped" against "led", nothing added, nothing
  lost), the rule drafters, skills suggestions, and the routes with the AI service replaced by a
  stand-in that replies with good drafts, bad drafts and nothing at all.
- `score/*.test.ts`: every check, the sums (weights, hand-on, pending, no floor), gaps in work, and the
  public check. The Software view, the ATS-ready label and download records are in `api.test.ts`.
- `tailor/*.test.ts`: reading an advert, each status, the fit arithmetic (including the worked example
  from the design: 5 of 8, shown as 63), no floor, proposals and their records, side effects.
- `letter/*.test.ts`: the source rules sentence by sentence (the person's against the employer's, borrowed
  figures, wishes against experience), Review source, the rule-assembled letter, the letter on its page,
  every template exported to PDF and Word on its own and with the CV and read back, and the routes with
  the AI service replaced by a stand-in that replies with good drafts and with invented ones.
- Browser tests: `e2e/cv-cleanup.cjs`, `e2e/cv-start.cjs`, `e2e/cv-upload.cjs`, `e2e/cv-editor.cjs`, `e2e/cv-writing.cjs`, `e2e/cv-score.cjs`, `e2e/cv-tailor.cjs`, `e2e/cv-letter.cjs`
  (see `e2e/README.md`). `cv-editor.cjs` downloads every file it makes into `e2e/out/cv-downloads/`,
  opens each one and compares its text with the saved CV (`e2e/cv-files.cjs`).

## Left for the developer (so far)

- **Database.** Records are saved through the generic `saveDoc`/`getDoc` in `src/lib/apply/db.ts`
  (MongoDB when configured, a local file otherwise). Add an index on `userId` for `cv_versions` and
  `cv_imports`. The old `apply_cvs` collection is no longer read.
- **Limits.** Uploads use the existing `guard(req, "read")` rate limit only. Per-plan limits (how many
  CVs, how many uploads) are not set.
- **Downloads** use the same `guard(req, "read")` limit (30 a minute per address). There is no per-plan
  limit on downloads, and no decision yet on what is free (requirement 47).
- **Download records** add a collection, `cv_exports`; add an index on `userId`. They are in "Download
  my data" and "Delete all my data". Each holds a full copy of the CV, so 30 per CV is the limit.
- **The public check's page** (`/cv-audit`) is the existing one; only its engine changed. Its stored
  audits now carry the new finding ids. The old `auditCvText` rubric in `src/lib/apply/checks/` is no
  longer used by it (the robot tester still imports that file).
- **Reading the advert is by rule.** It works from headings and phrases ("experience with", "you must
  have"). An unusual advert will need the person to add or correct requirements, which the screen
  allows. A model could read adverts better; if added, keep the rule that every requirement is a
  passage of the advert word for word.
- **Matching is by the words used.** A CV line in different words from the advert's is not matched
  automatically; the person links it. Rewording a line to fit the advert is left to the writing help.
- **Deleting a base CV** leaves its tailored versions, which are then listed on their own.
- **Spelling.** The score checks UK against US spellings from a word list, with "Accept". A full
  dictionary check is left to the browser's own spell-check in the fields.
- **Judgement checks are patterns.** "Likely passive", "weak verb" and "big claim" are word patterns,
  shown as suggestions with the phrase that triggered them. They will sometimes be wrong; that is why
  they are suggestions and why each can be seen and ignored.
- **Word page count.** The Word file names its fonts and falls back to Arial or Georgia where they are
  not installed, so its page breaks can differ from the PDF's. The PDF embeds its fonts.
- **Real model output has not been run.** There are no keys here, so the model path was tested with a
  stand-in for the service. Before launch, run each tool with real keys and read the drafts: the checks
  guarantee nothing is invented, but only a real run shows how good the wording is and how often a
  draft is refused.
- **Practice hand-off.** "Practise this claim" shows a question and links to the Practice Hub. Starting
  a spoken practice on that exact question, and bringing an answer back ("Use an interview answer"),
  need the practice side to accept a question that is not from an interview's set.
- **Two banks.** `/cv/bank` (`cv_achievements`) is separate from the older Evidence Bank at
  `/apply/evidence`. They should probably become one; that is a product decision.
- **The letter's review is by rule.** It reads words, figures and who a clause is about. It will sometimes
  ask for a source for something harmless; the person can reword it or add a note. It is strict on
  purpose: a sentence it passes is one whose claims can each be pointed to.
- **The letter's AI draft has not been run with real keys** (see "Real model output" above). Until it has,
  expect the rule-assembled letter to be what people get whenever the model's draft fails a check.
- **The older letter writer on `/apply`** (`/api/apply/applications/[id]/letter`) is separate and belongs
  to the application tracker. Its invented sentences ("over 6 years of commercial experience…", two
  made-up achievements) have been taken out; it now uses only the person's reason and their own saved
  evidence. Decide whether to retire it in favour of this letter. `/cover-letter-audit` is an alias of
  the CV check page and checks nothing about a letter.
- **Private achievements** (`privacy.ts`). A CV line taken from an achievement marked private is not
  offered as letter evidence, and a CV or letter that already uses one is not made into a file: the
  download and the file check answer 409 `private`, naming the line. Practice from a CV does not yet
  leave private lines out; that is on the practice side.
- **Scanned PDFs** cannot be read (no OCR). The person is told so and can paste the text.
- **Old code.** `CvSchema`, `getCv`, `saveCv` and `listCvs` in `src/lib/apply/` are no longer used by
  this section and can be removed once nothing else needs them.
