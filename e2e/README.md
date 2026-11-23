# End-to-end checks

Browser tests with Playwright against a built app running in test mode (no keys, no cost), plus a click audit and an accessibility scan.

Once: `npx playwright install chromium`

Then: `npm run build && npm run e2e`

That starts the app on port 3179 with a fresh, throwaway data folder, runs every check in order, and prints one line per check. Screenshots and logs land in `e2e/out/` (ignored by git).

| Script | What it checks |
| --- | --- |
| `stories.cjs` | Story bank: the demo's stories, gaps, and building a missing one |
| `pitch.cjs` | Presentations: set up from a PDF and a PowerPoint, rehearse, run report, audience Q&A |
| `flow.cjs` | The whole interview: set up from a CV and job, understanding, live interview with follow-ups and a skip, report, feedback, drills, re-run, prep sheet |
| `slots.cjs` | Opening and closing questions always in the right place |
| `pay.cjs` | Talking about pay: the drill, its checks and the prep sheet |
| `cv-cleanup.cjs` | The old CV screens are gone: no sample content or unsupported claims, old addresses lead to `/cv`, a new account's Evidence Bank is empty |
| `cv-start.cjs` | Starting a CV as a new user: set-up form and its checks, an empty start, typing saved as you go, dates, two tabs, a lost connection, a second account kept out; each screen in dark and light with an accessibility pass, and on a phone |
| `cv-upload.cjs` | Uploading a CV: PDF and Word files read into sections, each checked against the file, uncertain fields confirmed, corrected or left blank, leftover text placed, then opened in the builder; scans, locked PDFs and old Word files each get their way forward; another account kept out; phone layout |
| `cv-editor.cjs` | The builder as new users: an empty CV typed in with the paper redrawn as it is typed, a click on the paper opening its field, switching off, reordering (menu and drag), undo and redo, all eight templates, fonts, colour, spacing, page fitting, order on the page, the two-copies choice, rename/duplicate/delete, tablet and phone. **Every PDF and Word file it downloads is opened and its text compared with the saved CV** (`cv-files.cjs`); the files are kept in `e2e/out/cv-downloads/` |
| `audit.cjs` | Every page, every button and link: no dead links, no dead ends, no page errors (ends by deleting a throwaway interview) |
| `a11y-page.cjs` | axe (WCAG 2.1 AA) on the main pages; `a11y.cjs` crawls everything |

Each script also runs on its own against any server: `BASE=http://127.0.0.1:3000 node e2e/flow.cjs`. The fixtures in `fixtures/` are a sample CV and two sample slide decks, and `fixtures/cv/` holds sample CVs in several layouts for the upload tests (made-up people; rebuilt with `node e2e/fixtures/cv/src/build.cjs`); `speechlike.wav` is fed to the fake microphone.

The interview flow takes about ten minutes because it waits for the (fake) interviewer to speak and for follow-ups.

To run one CV script by hand: `npm run build && e2e/serve.sh 3179`, then `BASE=http://127.0.0.1:3179 node e2e/cv-upload.cjs`. The test server runs with `HAKKIRI_TRUST_PROXY=1` and each test account sends its own forwarded address, so sign-up and request limits are counted per account, as they are for real people.
