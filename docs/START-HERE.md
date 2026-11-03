# Hakkiri: start here

For the developer taking this on. Ten minutes of reading, then you can run it.

## What you've been given

Hakkiri is a web app for practising job interviews and presentations out loud. The person adds a job and CV (or slides), an AI interviewer asks questions aloud and follows up, the answers are transcribed and scored, and they get a report, feedback on every answer, drills, a story bank and a prep sheet.

Everything the user sees is finished and tested (180 unit tests, a Playwright end-to-end suite, a full click audit, accessibility scans). What's missing is the plumbing to sell it: **accounts, a database, payments and hosting**. That is your job, in that order.

The docs in this folder:

| Read | For |
| --- | --- |
| `01-developer-handover.md` | The whole picture: what each part is, where it lives, what's done, what's left in order, known gaps, the audit, and the things not to change. **Read this first.** |
| `02-pricing-and-cost-per-user.md` | What an interview costs in AI services (about 27p for 30 minutes), the plans, the margins, and how to keep costs down. Needed when you build the hours balance and Stripe. |
| `03-launch-checklist.md` | The blockers before anyone else uses it, launch-day settings, and the open decisions that are the owner's to make. |
| `05-beta-plan.md` | **The first milestone.** A closed beta for 10 to 15 invited testers with 5 free hours each, and how feedback is collected (a per-screen Feedback button, already built). |
| `04-mobile-app-audit.md` | A review of the separate Flutter mobile app repo. It's a visual prototype; it's being handled separately and the web launch doesn't wait for it. |
| `../README.md` and `../CONTRIBUTING.md` | Running, testing, conventions, and how the code is laid out. |

## Run it in five minutes

```
npm install
cp .env.example .env.local      # then put your own API keys in it
npm run dev                     # http://localhost:3000
```

No keys yet? Put `HAKKIRI_MOCK_AI=1` in `.env.local` and the whole record → score → feedback flow runs offline with sample results, at no cost. On Windows, `start-hakkiri.bat` does all of the above.

Keys you'll need for real runs: `ANTHROPIC_API_KEY` (questions and scoring), `DEEPGRAM_API_KEY` (speech to text), `ELEVENLABS_API_KEY` (interviewer voice; optional, falls back to the browser's voice). Ask the owner for the budget, then make your own keys in each provider's dashboard. The owner's previous keys were exposed and must be treated as rotated; don't reuse any key you're sent in a chat message.

## Check it's healthy

```
npm test                        # 180 unit tests, a few seconds
npx tsc --noEmit                # typecheck
npm run build                   # must stay clean
npx playwright install chromium # once
npm run e2e                     # the end-to-end suite and click audit, against a built server with fresh data
```

The last run before handover: all 180 tests green, 7/7 end-to-end scripts passing, 146 pages and 269 clicks with no errors, axe clean on the public pages.

## What to build, in order

The first goal is the closed beta (`05-beta-plan.md`), not launch. That needs step 1 only, plus hosting; the beta switch (`HAKKIRI_BETA=1`) does the rest. Steps 2 and 3 come after the beta.

1. **Accounts and a database.** Recommended: Supabase (London region): Postgres, email magic link + Google sign-in, file storage for recordings and slides. Each `store.ts` becomes a database module with the same exported functions, so screens don't change. `user_id` on every row with row-level security. Recordings and slide images move to file storage. Every API route and page then reads the signed-in user.
2. **Practice hours per user.** Plans are capped in hours, not interviews. A balance per user; session seconds count down; `guard()` in `src/lib/usage/limits.ts` refuses when it's empty.
3. **Payments (Stripe).** One-off products for Job search (£34.99, 30 hours, 3 months) and extra hours (£7.99, 5 hours); a subscription for Monthly (£14.99, 10 hours a month). Webhooks add hours. Prices live only in `src/lib/pricing.ts`.
4. **Hosting.** A Node host with the variables from `.env.example`, `HAKKIRI_TRUST_PROXY=1` behind the host's proxy, and `HAKKIRI_BETA=1` + `NEXT_PUBLIC_HAKKIRI_BETA=1` on for the beta (later `HAKKIRI_LAUNCH=1` + `NEXT_PUBLIC_HAKKIRI_LAUNCH=1`). Long requests (up to 120 s) must be allowed. Hosting comes before steps 2 and 3 because the beta needs it.
5. **Legal.** Fill the brackets in `/privacy` and `/terms`, set `DRAFT = false`.
6. **Beta**, then launch.

The handover doc has the detail and estimates for each.

## Rules that matter

- Never commit `.env.local`. Never paste keys into chat or tickets.
- Never show an unchecked AI result. Every Claude reply goes through a zod schema and code checks; keep that.
- Delivery (pace, fillers, pauses) is measured in code from word timings. Never ask the model to judge accent, voice or tone; it's a promise on every public page.
- Prices change in `src/lib/pricing.ts` only.
- Use `devOr()` for any new error text so developer messages are hidden at launch.
- Add tests; don't delete them to make a change pass.

## Where to ask

The owner: Bilaal (the email address on the GitHub repo). The private repo `bilaal77/hakkiri-studio` is the home for the code once it's pushed; until then this zip is the source of truth.
