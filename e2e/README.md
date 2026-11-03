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
| `audit.cjs` | Every page, every button and link: no dead links, no dead ends, no page errors (ends by deleting a throwaway interview) |
| `a11y-page.cjs` | axe (WCAG 2.1 AA) on the main pages; `a11y.cjs` crawls everything |

Each script also runs on its own against any server: `BASE=http://127.0.0.1:3000 node e2e/flow.cjs`. The fixtures in `fixtures/` are a sample CV and two sample slide decks; `speechlike.wav` is fed to the fake microphone.

The interview flow takes about ten minutes because it waits for the (fake) interviewer to speak and for follow-ups.
