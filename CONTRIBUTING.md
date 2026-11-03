# Working on Hakkiri

Start with the handover doc (ask the owner for the link), then the README.

## Before your first change

1. `npm install`, copy `.env.example` to `.env.local`, add your own keys (the owner issues them; never commit them, never paste them in chat).
2. `npm run dev`, open http://localhost:3000, and run one full interview and one presentation so you know what finished looks like. `HAKKIRI_MOCK_AI=1` runs everything without keys.
3. `npx playwright install chromium`, then `npm run build && npm run e2e`.

## Before every merge

- `npm run typecheck`, `npm test`, `npm run build` all clean.
- `npm run e2e` passes (about 20 minutes). Add an end-to-end check for any new screen.
- A new error message for users goes through `devOr()` in `src/lib/launch.ts`, so developer wording never reaches a user at launch.
- Prices change in `src/lib/pricing.ts` only.
- Nothing, anywhere, scores accent, voice or tone. The app measures delivery in code from word timings; the model judges content and structure. This is the product promise on every page.

## What's next, in order

Accounts and a database, then practice hours per user, then payments. The handover doc has the plan and the list of known gaps; its "Things not to change" section is short and worth reading twice.
