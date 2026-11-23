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
- Browser tests: `e2e/cv-cleanup.cjs`, `e2e/cv-start.cjs`, `e2e/cv-upload.cjs`, `e2e/cv-editor.cjs`
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
- **Export records** (a saved snapshot of exactly what was sent) and the "ATS-ready" label come with
  step 4; today a file is "Checked" or it is not sent.
- **Word page count.** The Word file names its fonts and falls back to Arial or Georgia where they are
  not installed, so its page breaks can differ from the PDF's. The PDF embeds its fonts.
- **Scanned PDFs** cannot be read (no OCR). The person is told so and can paste the text.
- **Old code.** `CvSchema`, `getCv`, `saveCv` and `listCvs` in `src/lib/apply/` are no longer used by
  this section and can be removed once nothing else needs them.
