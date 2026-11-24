# End-to-end checks

Browser tests with Playwright against a built app running in test mode (no keys, no cost), plus a click audit and an accessibility scan.

Once: `npx playwright install chromium`

Then: `npm run build && npm run e2e`

That starts the app on port 3179 with a fresh, throwaway data folder, runs every check in order, and prints one line per check. Screenshots and logs land in `e2e/out/` (ignored by git).

| Script | What it checks |
| --- | --- |
| `stories.cjs` | Experience Library (it replaced the story bank; `/story-bank` leads to it): adding an example and the form's checks, the list, favourites, search and tags, editing, deleting |
| `pitch.cjs` | Presentations: set up from a PDF and a PowerPoint, the timing plan, rehearse, run report, audience Q&A, a run of one slide, pasted notes |
| `flow.cjs` | The whole interview: the four set-up steps from a CV and job, overview, live interview with follow-ups and a skip, report, an answer, run it again, focused practice on a topic, story, prep sheet, report an issue and rebuild, three skips, editing the understanding |
| `accounts.cjs` | Two accounts: one can't see, change or write into the other's interview, story, question, session or demo copy, by page or by API, and its data download holds none of it. One shared browser: what the app keeps on the device for one account is not shown to the next. The admin area as an ordinary account and as a visitor |
| `honest.cjs` | Nothing on screen is made up: a new account's home screen is empty (zeros, no sample week, empty tracker and archive); with one interview and a dated stage it shows that and nothing else; "Mark successful" is saved; the report and the answer feedback after a practice interview show that session's own scores, measurements and transcript, and none of the old fixed text; a refused save is not reported as saved; axe on the home screen, report and feedback |
| `data.cjs` | "Download my data" (unzipped and read), "Delete all my data" and "Delete my account" for a person with data, with the empty states afterwards |
| `honest-screens.cjs` | A new account sees none of the old fixed content on the Practice Hub, Experience Library, set-up form (also after a build that fails), a new interview's prep sheet, and the Apply pages |
| `phone.cjs` | A phone (390 wide): welcome, home, interviews list, workspace, rebuild and past interviews don't scroll sideways and have no control off the side of the screen; "New interview" can be tapped |
| `slots.cjs` | Skipping the opening and the closing question: one tap, no replacement, neither in the report |
| `pay.cjs` | Talking about pay: the four questions with feedback after each, the report and its checks, doing it again |
| `cv-cleanup.cjs` | The old CV screens are gone: no sample content or unsupported claims, old addresses lead to `/cv`, a new account's Evidence Bank is empty |
| `cv-start.cjs` | Starting a CV as a new user: set-up form and its checks, an empty start, typing saved as you go, dates, two tabs, a lost connection, a second account kept out; each screen in dark and light with an accessibility pass, and on a phone |
| `cv-upload.cjs` | Uploading a CV: PDF and Word files read into sections, each checked against the file, uncertain fields confirmed, corrected or left blank, leftover text placed, then opened in the builder; scans, locked PDFs and old Word files each get their way forward; another account kept out; phone layout |
| `cv-editor.cjs` | The builder as new users: an empty CV typed in with the paper redrawn as it is typed, a click on the paper opening its field, switching off, reordering (menu and drag), undo and redo, all eight templates, fonts, colour, spacing, page fitting, order on the page, the two-copies choice, rename/duplicate/delete, tablet and phone. **Every PDF and Word file it downloads is opened and its text compared with the saved CV** (`cv-files.cjs`); the files are kept in `e2e/out/cv-downloads/` |
| `audit.cjs` | Every page, every button and link, as a visitor and then signed in. Lists dead links, dead ends, page errors and buttons that do nothing in `e2e/out/audit.json`, and fails if a public page asks a visitor to sign in or an app page still asks a signed-in user to (ends by deleting a throwaway presentation and signing out) |
| `a11y-page.cjs` | axe (WCAG 2.1 AA) on the main pages: the public ones as a visitor, the app's own signed in; `a11y.cjs` crawls everything, signed in, and writes a report |

Every script signs up its own brand-new account first: without a session each app page is just the login page. `helpers.cjs` does that for the scripts above the CV ones (`signIn`, on top of `newUser` from `cv-helpers.cjs`) and sets up an interview through the app where one is needed (`setUpInterview`), because a new account has none. Nothing depends on the built-in demo interviews or presentation, and no script depends on another.

Each script also runs on its own against any server: `BASE=http://127.0.0.1:3000 node e2e/flow.cjs`. The fixtures in `fixtures/` are a sample CV and two sample slide decks, and `fixtures/cv/` holds sample CVs in several layouts for the upload tests (made-up people; rebuilt with `node e2e/fixtures/cv/src/build.cjs`); `speechlike.wav` is fed to the fake microphone.

The interview flow takes about four minutes and the audit about eight; everything together is about twenty.

To run one script by hand: `npm run build && e2e/serve.sh 3179`, then `BASE=http://127.0.0.1:3179 node e2e/cv-upload.cjs`. The test server runs with `HAKKIRI_TRUST_PROXY=1` so each test account can sign up, and make its requests, from its own address without hitting the limits another test has used up.
