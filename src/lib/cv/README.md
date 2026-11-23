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

## Tests

- `npx vitest run src/lib/cv`: every reading rule (`dates`, `lines`, `reader`), every sample file
  (`files.test.ts`, including "nothing invented" and "nothing lost" checks on each), and the API
  (`api.test.ts`: ownership, saving, uploads, unreadable files, Settings data).
- Sample files are in `e2e/fixtures/cv/` and are rebuilt with `node e2e/fixtures/cv/src/build.cjs`
  (needs Chromium, LibreOffice and python-docx; the built files are committed). They come from three
  different programs so the reader is not only tested against one writer's habits. The LinkedIn sample
  is a hand-built copy of LinkedIn's "Save to PDF" layout, not a real export.
- Browser tests: `e2e/cv-cleanup.cjs`, `e2e/cv-start.cjs`, `e2e/cv-upload.cjs` (see `e2e/README.md`).

## Left for the developer (so far)

- **Database.** Records are saved through the generic `saveDoc`/`getDoc` in `src/lib/apply/db.ts`
  (MongoDB when configured, a local file otherwise). Add an index on `userId` for `cv_versions` and
  `cv_imports`. The old `apply_cvs` collection is no longer read.
- **Limits.** Uploads use the existing `guard(req, "read")` rate limit only. Per-plan limits (how many
  CVs, how many uploads) are not set.
- **Scanned PDFs** cannot be read (no OCR). The person is told so and can paste the text.
- **Old code.** `CvSchema`, `getCv`, `saveCv` and `listCvs` in `src/lib/apply/` are no longer used by
  this section and can be removed once nothing else needs them.
