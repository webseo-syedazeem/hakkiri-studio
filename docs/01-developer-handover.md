# Hakkiri developer handover

Oct 26, 2026 · Bilaal (owner) with Claude

## What Hakkiri is

Hakkiri is a web app for practising job interviews and presentations out loud. The person adds a job description and CV (or their slides); an AI interviewer asks questions aloud and follows up; the answers are transcribed and scored; the person gets a report, feedback on every answer, drills, a story bank and a prep sheet. Everything the user sees is finished and tested. What's missing is the plumbing to sell it: accounts, a database, payments and hosting.

| Part | What it is | Where |
| --- | --- | --- |
| Framework | Next.js 16.4 (App Router, Turbopack), React 19, TypeScript, Tailwind 4, zod 4 | `src/` |
| Speech to text | Deepgram Nova-3, fillers kept, word timings | `src/lib/ai/providers/deepgram.ts` |
| Scoring, questions, follow-ups | Claude Sonnet 5 (main) and Haiku 5.5 (fast). Every reply is checked against a zod schema and code rules, retried once, never shown unchecked | `src/lib/ai/` |
| Interviewer voice | ElevenLabs Flash, cached per line; browser voice as fallback | `src/app/api/voice`, `src/components/audio/speak.ts` |
| Storage (temporary) | JSON files and recordings in `.hakkiri-data/`, one shared user | `src/lib/storage/disk.ts` and each `store.ts` |
| Public site | White, Apple-style pages: `/landing` (interviews), `/present` (presenters), `/privacy`, `/terms` | `src/app/(public)/`, `src/components/marketing/` |
| Tests | 180 unit tests (Vitest), plus Playwright end-to-end scripts and a click audit | `*.test.ts`, scripts described below |

The app runs in two modes: normal (needs keys in `.env.local`) and test mode (`HAKKIRI_MOCK_AI=1`: the whole record, score and feedback flow works offline with sample results, no cost). A launch switch (`HAKKIRI_LAUNCH=1` and `NEXT_PUBLIC_HAKKIRI_LAUNCH=1`) hides the demo data and every developer-facing message. A beta switch (`HAKKIRI_BETA=1` and `NEXT_PUBLIC_HAKKIRI_BETA=1`, implies launch) runs the app as a closed free beta: 5 hours of practice per tester, a "free while we're in beta" pricing section, and a per-screen Feedback button whose notes go to the alerts channel (`src/lib/feedback/`, `src/components/shell/FeedbackButton.tsx`). See `05-beta-plan.md`.

## How to run and test it

The README in the project covers this in full; the short version:

1. `npm install`, copy `.env.example` to `.env.local`, add `DEEPGRAM_API_KEY`, `ANTHROPIC_API_KEY` and (optional) `ELEVENLABS_API_KEY`. Never commit `.env.local`.
2. `npm run dev` and open http://localhost:3000. On Windows, `start-hakkiri.bat` does all of this.
3. No keys, or no budget? `HAKKIRI_MOCK_AI=1` runs everything offline with sample results.
4. `npm test` runs the 180 unit tests (a few seconds). `npx tsc --noEmit` typechecks. `npm run build` must stay clean.
5. Before a release, run the Playwright scripts against a built server with fresh data (`HAKKIRI_DATA_DIR=/tmp/x HAKKIRI_MOCK_AI=1 npx next start`): the full interview flow, the presentation flow, story bank, question slots, pay practice, and the click audit (every page, every button). They live in `e2e/` and run with `npm run e2e` (first `npx playwright install chromium`); see `e2e/README.md`. The audit's last run: 146 pages, 269 clicks, no dead links, no page errors.
6. Settings, Usage shows what every AI call cost. With real keys, one 30-minute interview should come to about 27p; if it's far off, check `HAKKIRI_FAST_MODEL` is `claude-haiku-5-5`.

One thing to check on the first real-key run: the app sends no `temperature` to Claude 5 models (they reject it) and turns their thinking off. If Anthropic changes model names, `src/lib/ai/providers/claude.ts` `modelFields()` is the one place to update.

## What's done

Every screen works end to end and is covered by tests. Nothing below needs rework for accounts; each feature reads and writes through a `store.ts` that the database layer replaces.

| Feature | What it does | Code |
| --- | --- | --- |
| Set up an interview | Company, job (link, text or file), CV, cover letter. Claude reads the company site and job spec, writes questions, a fast check drops any that don't fit. Difficulty, length, question mix | `src/lib/interviews/build.ts`, `links.ts`, `src/components/interview/` |
| Live interview | Questions asked aloud, countdown, follow-ups on what was said, Skip with reason, Something's wrong (rebuilds), Hard cut-in | `src/components/live/LiveInterview.tsx`, `src/lib/sessions/`, `src/lib/ai/brain.ts` |
| Scoring | One Claude call per answer (follow-ups included), job and CV cached between answers. Delivery (pace, fillers, point timing) measured in code from word timings | `src/lib/ai/score*.ts`, `src/lib/scoring/` |
| Report and feedback | Ready / Nearly / Not yet, category scores, top three fixes, every answer marked up with a stronger version from the person's own CV | `src/lib/mocks/report.ts`, `src/app/(studio)/interviews/[id]/` |
| Training | Drills (fix an answer, category, habit, follow-up pressure, build a story), re-run, new questions, talking about pay | `src/lib/sessions/drills.ts`, `pay.ts` |
| Story bank and prep sheet | STAR stories from the CV, which questions each covers; one printable page for the morning | `src/lib/stories/`, `src/lib/interviews/prep.ts` |
| Presentations | PowerPoint, PDF or notes; a time and key point per slide; rehearsal with timers and clicker; run report with where to cut; readiness; audience Q&A in four styles | `src/lib/pitch/`, `src/components/pitch/` |
| Voice | ElevenLabs per difficulty, cached, browser fallback within 8 seconds | `src/app/api/voice`, `speak.ts` |
| Settings | Mic, voice, usage and cost, retention (30/90/365 days or until deleted), download all (zip), delete all | `src/app/(studio)/settings/`, `src/lib/data/account.ts` |
| Limits and alerts | Daily minutes, daily and monthly spend, per-minute rate limits; errors grouped and sent to a webhook or email | `src/lib/usage/limits.ts`, `src/lib/alerts/` |
| Security | CSRF guard on every API route, anti-framing headers, SSRF-safe link reader, path-safe file routes, typed confirmation for delete-all | `src/proxy.ts`, `next.config.ts`, `src/lib/interviews/links.ts` |
| Public site | Interview-led landing page, a page for presenters, pricing (free; Job search £34.99 for 3 months, 30 hours; Monthly £14.99, 10 hours; extra hours 5 for £7.99), privacy and terms drafts | `src/app/(public)/`, `src/lib/pricing.ts` |
| Browsers | Chrome, Edge, Firefox, Safari (per-browser recording format, Safari audio unlock) | `src/components/audio/browser-audio.ts` |

## What's left, in order

The order matters: nothing can be sold until data is per user. The first milestone is the closed beta (`05-beta-plan.md`), which needs step 1 and hosting only; steps 2 and 3 follow the beta.

1. **Accounts and a database.** Recommended: Supabase in the London region (Postgres, sign-in by email magic link and Google, file storage for recordings and slides). The domain types in `src/lib/types.ts` were written with tables in mind. Each `store.ts` (interviews, questions, mocks, answers, answers/audio, pitch, stories, usage, settings, alerts) becomes a database module with the same exported functions, so screens don't change. Add `user_id` to every row with row-level security. Move recordings and slide images to file storage; keep the retention sweep as a scheduled job. Every API route and page then reads the signed-in user. The free 10-minute interview requires an account.
2. **Practice hours per user.** The plans are capped in hours, not interviews. Add a balance per user: seconds in sessions (interviews, drills, rehearsals, Q&A) count down; reading reports doesn't. The existing `guard()` in `src/lib/usage/limits.ts` is where to refuse when the balance is empty. Keep a per-user daily ceiling (120 minutes) as a safety net.
3. **Payments (Stripe).** One-off products for Job search (£34.99, 30 hours, 3 months, never renews) and extra hours (£7.99, 5 hours); a subscription for Monthly (£14.99, 10 hours a month, resets monthly). Webhooks add hours to the balance. Self-serve cancel for Monthly. The landing pages promise "no card needed for the free interview"; keep that true.
4. **Hosting.** A Node host (Vercel, Railway or similar) with the environment variables from `.env.example`, `HAKKIRI_TRUST_PROXY=1` behind the host's proxy, and the two launch flags on. A test site first. Point `ALERT_WEBHOOK_URL` or Resend at the team.
5. **Legal.** Fill the \[brackets\] in `/privacy` and `/terms`, name the hosting provider in the privacy page's sharing table, have a solicitor read both, set `DRAFT = false` in each page, pay the ICO fee.
6. **Beta**, then launch. Collect real quotes; the landing pages have no testimonials because none existed.

Estimate for 1 to 3: the largest piece of work in the project so far, likely several weeks for one developer. Recommended order within it: provider and tables, then sign-in, then scoping every route, then the hours balance, then tests.

## Known gaps and shortcuts

These are deliberate for a single-user prototype. None affects a user today; all matter once the app is hosted for many people, and most disappear naturally with the database.

| Gap | Why it's fine now | What to do with accounts |
| --- | --- | --- |
| One shared user and one shared spending limit | There are no accounts | Everything becomes per user (step 1 and 2 above) |
| Answers in progress (drafts) hold their recordings in memory for up to 2 hours; swept on the next save, not on a timer | One person, a dozen drafts at most | Store drafts (and their audio) in the database or file storage |
| Rate limits key on the caller's address only with `HAKKIRI_TRUST_PROXY=1`; otherwise every caller counts as one | Single user | Key on the user id instead |
| The SSRF guard checks the address before fetching; a DNS name that changes answer between the check and the fetch could slip through, and any port is allowed | Low risk on a single-user box | Pin the resolved address with a custom lookup, allow only ports 80 and 443 |
| `usage.json` is rewritten whole and keeps a year; `voice-cache/` is never pruned (it holds only interviewer lines, not user data) | Small files | Usage moves to a table; cap or expire the voice cache |
| Replaced slide images aren't removed when a presentation is edited | Few bytes | Delete the old files on save |
| A lost network connection during an answer upload discards that recording ("Answer again") | Rare | Keep the blob and retry, as the rehearsal screen already does |
| Two rapid replies to the same follow-up could both be accepted | The UI's thinking state prevents it | A database transaction, or a version on the draft |
| The `/api/mocks` route still accepts a `kind` (full, group, first) without a session id; the UI never sends it | Dead code | Remove when adding user scoping |
| Error alerts sent to the webhook or email include the route, message and browser type (never user content) | Documented in the privacy draft | Nothing |

Things that look odd but are right:

- `src/proxy.ts` is Next 16's name for middleware. It only does the CSRF check and buffers bodies up to 60 MB (`next.config.ts`).
- `/*turbopackIgnore: true*/` comments on `fs` calls stop Turbopack tracing the data folder.
- The demo interview (Halden) and presentation (Q1 roadmap) come from `src/lib/mock-data.ts` and `src/lib/pitch/demo.ts`; they vanish at launch and can't be deleted.
- `devOr(devText, userText)` in `src/lib/launch.ts` is how every developer-facing message is swapped at launch. Use it for any new error text.

## The handover audit (26 October 2026)

A reviewer who had not seen the code read all of it, and every API route was probed by hand. Nineteen findings; the ones a user could hit were fixed the same day, the rest are the gaps table above.

Fixed:

- A recording too short to score mid-interview sent the user to the demo report, which is a 404 at launch. Now: "We didn't catch an answer there", answer again.
- Writing new questions in the background (up to 90 seconds) saved a stale copy of the interview afterwards: an interview deleted meanwhile came back, and rules or settings changed meanwhile were overwritten. Now only the questions are merged, and nothing is saved if the interview is gone.
- Every recording and slide image was kept in server memory for good. Now they're read from disk on demand.
- The background question top-up ignored the spending limits. Now it stops when a limit is reached.
- The answer-feedback page crashed (500) if the question had been removed, or if an answer id was opened under the wrong interview. Now 404.
- Presentations couldn't be deleted individually, although the privacy policy said they could. Added `DELETE /api/presentations/{id}` and a Delete button; it removes slides, runs, Q&A rounds and recordings. The data export now includes slide pictures.
- A non-form body to the answer routes crashed with a 500. Now 400.
- No timeout on scoring or speech-to-text; a stalled provider could pin a request open. Now 90 and 120 seconds, with a plain message.
- Rate limits trusted the `X-Forwarded-For` header from anyone; now only behind a declared proxy, and stale keys are swept.
- Retention only ran when something else happened; now it also runs on server start and every six hours.
- One developer-facing message ("check your keys") showed at launch; copy drift between the marketing page, privacy policy and terms (retention options, plan prices, who receives error alerts); four environment variables missing from `.env.example`.

Checked and clean: path traversal on every file route; bad JSON to every POST route; a 70 MB upload; missing ids on every page and route; the demo at launch (404 everywhere); CSRF from another origin (403); browser console on all 27 screens (no errors); every link on the public pages; accessibility scans; 180 unit tests; the five Playwright flows and the click audit.

## Things not to change

These were chosen deliberately and the reviewer singled them out as sound.

- **AI output is never trusted.** Every Claude reply goes through a zod schema, then code checks (quotes must appear in the transcript, the stronger version may not invent numbers), one retry with the problems listed, then `null` or an error. Never show an unchecked score.
- **Delivery is measured in code**, from word timings only: pace, fillers, pauses, where the point arrived. Never ask the model to judge accent, voice or tone. This is a product promise on every page.
- **The launch switch.** `devOr()`, `isLaunch()`, and `mockAiEnabled()` ignoring test mode at launch. Costs and the Problems section stay hidden from users.
- **Security basics**: the CSRF check in `src/proxy.ts`, the frame-blocking headers, the link reader's per-hop private-address check and 2 MB cap, file routes that never build a path from user input, the typed confirmation for delete-all.
- **Storage habits**: write-to-temp-then-rename in `saveJson`; stores pinned on `globalThis` so they survive hot reloads; the per-interview lock when writing questions. Keep the same patterns in the database layer.
- **A run is never lost**: if the model fails, the rehearsal is still saved and scored later.
- **Prices live in one file**, `src/lib/pricing.ts`, and the pages read from it. Change prices there only; the terms draft and the pricing doc quote the same numbers.
- **Tests on the risky logic**: scoring, question picking, drills, pay, the report, timing, limits and the link reader. Add to them; don't delete them to make a change pass.
