# Hakkiri mobile app audit

Oct 27, 2026 · Bilaal (owner) with Claude

Repository: github.com/webseo-syedazeem/Hakiri-APP, 14 commits, last on 7 October 2026. Flutter (Dart), 11,100 lines, with a Supabase schema and product documents.

## Verdict

This is a polished visual prototype, not a working app. Every screen is built and looks finished, but nothing behind them is real: the app never records audio, never transcribes anything, and never evaluates what the user said. Every practice session ends with the same hard-coded sentence being "scored" by a few string checks, and the feedback (timestamps, highlighted phrase, intelligibility 94%) is invented. Sign-in and sign-up go straight to the home screen without checking anything. The paywall "subscribes" without taking payment. The analytics dashboard shows fixed numbers. It is not launch-ready and is not close; it is a design handed to code before the product was built. The design work and the database schema are good and worth keeping.

It is also a different product from the web app: short daily speaking drills with a 4-pillar score and a £69.99-a-year subscription, rather than interview and presentation practice built from a job and CV. Nothing in it shares code or data with the web app.

## What is real and what isn't

| Feature | On screen | Behind it |
| --- | --- | --- |
| Splash, landing, onboarding | Built, animated | Real |
| 7-step assessment and personalised plan | Built | Answers are kept in memory and the plan is picked by simple rules; saved to Supabase only if credentials are compiled in (they aren't) |
| Sign up and log in | Built, with email and password fields | Not connected. `_handleLogin` navigates straight to Home; no call to Supabase Auth; the password is never used. Every user is `usr_hakkiri_demo_user` |
| Recording a practice answer | Word-by-word prompt, 5-second countdown, dark recording screen with a moving waveform | No microphone. No recording package in `pubspec.yaml`, no permission in the Android manifest or iOS plist. The waveform is an animation. After the timer, a fixed sentence is submitted as the "transcript" |
| AI evaluation and the 4-pillar score | Scores, a strength, an improvement, a highlighted phrase with timestamps, a coached retry | `SpeechEvaluatorService` checks the transcript for 10 crutch phrases and counts words. Intelligibility is always 94%, action verbs always 70%, pauses are guessed from the timer, the highlighted phrase and its timestamps are literal strings. No speech model, no acoustic analysis |
| Analytics dashboard, streaks, calendar | Built | Fixed numbers (3.4, 3.8, 3.1, "Think First 3.7 Today") |
| Paywall, £69.99/yr or £9.99/mo, 7-day trial, restore purchase | Built | Sets a string in memory and navigates to Home. No store purchase, no RevenueCat (it's in `.env.example` only). "Restore purchase" does nothing |
| Settings | Built | Mostly static |
| Supabase schema (profiles, subscriptions, streaks, activities, prompts, practice sessions, a private recordings bucket) | n/a | Well designed, with row-level security on every table. Never exercised: the app runs in "local demo mode" unless URL and key are passed at build time, and the seed file is the only content |
| Tests | n/a | One: the app launches and shows the splash screen |
| Documents (PRD, assessment framework, scoring engine, curriculum, competitor analysis) | n/a | Thorough. They describe a product the code doesn't implement |

## Findings

**Blocking: the product doesn't exist yet**

1. No audio is ever recorded. `lib/screens/recording_screen.dart` runs timers and an animation; `_finishSession()` (line 141) submits a hard-coded transcript. No recording or permission package in `pubspec.yaml`; no `RECORD_AUDIO` permission in `android/app/src/main/AndroidManifest.xml`; no `NSMicrophoneUsageDescription` in `ios/Runner/Info.plist`.
2. No speech-to-text and no AI. `lib/core/services/speech_evaluator_service.dart` is a 100-line rule set with invented outputs (intelligibility 94, action verbs 70, timestamps "00:14 - 00:20"). The docs describe acoustic telemetry and a multimodal model; none is called.
3. Sign-in and sign-up are decorative. `lib/screens/login_screen.dart` line 28 `_handleLogin` goes to Home; `signup_screen.dart` the same. `userId` is the constant `usr_hakkiri_demo_user` (`app_state_provider.dart` line 13), so if Supabase were ever connected, every user would write to the same rows and the row-level security would reject them all (`auth.uid()` is null).
4. The paywall takes no money. `selectSubscription` (`app_state_provider.dart` line 387) sets a string and writes a subscription row dated a year ahead. Shipping this would be selling a subscription that isn't collected, and Apple and Google both reject apps whose purchases bypass their billing.
5. The dashboard is fake. `analytics_dashboard_screen.dart` lines 67 to 185 are literal scores and dates.

**High**

6. Supabase is never configured. Credentials come only from `--dart-define` at build time; nothing in the repo or README sets them, so every build runs in "local demo mode" and saves nothing. Even configured, `saveUserProfile` and `recordPracticeSession` swallow every error with a debug print, so failures would be silent.
7. No way to see history, delete data, sign out, or reset a password. "Forgot password?" is a label.
8. The repository is untidy for handover: 25 screenshot and scratch images, `doc_content.html`, `extract_doc.py` and `.idea/` committed at the root; the README's tree names an `ARCHITECTURE.md` and a `package.json` that don't exist.

**Medium**

9. One test, which only checks the splash screen appears. Nothing covers the assessment logic, the plan selection or the evaluator.
10. `.env.example` lists `API_BASE_URL=https://api.hakkiri.app/v1`, `AI_SPEECH_SERVICE_KEY` and `REVENUECAT_API_KEY`; nothing reads them. There is no API at that address.
11. The "restore purchase" link on the paywall (`paywall_screen.dart` line 384) has an empty handler.
12. Pricing (£69.99 a year, £9.99 a month, 7-day trial) is hard-coded in two places that could drift (`app_state_provider.dart` line 22 and 390; `paywall_screen.dart` lines 149 to 161) and doesn't match the web app's plans.

**Low**

13. Duplicate commits ("Initial UI" twice) and commit messages that describe matching screenshots rather than behaviour, which fits what the code is.
14. Bundle id is the placeholder `com.hakkiri.app.hakkiri_app`; display name "Hakkiri App".

Nothing dangerous: no secrets committed, no insecure network calls, the schema's row-level security is correct.

## What's good and worth keeping

- The screens. Onboarding, assessment, recording, feedback and paywall are well built, consistent, and match the design references closely. This is real work and shouldn't be thrown away.
- The Supabase schema (`supabase/migrations/20261005000000_hakkiri_schema.sql`): sensible tables, row-level security on every one, a private storage bucket for recordings. It's a better starting point than the web app currently has.
- The product documents in `docs/`: a clear PRD, a scoring framework that separates skill scores from streaks ("rewards for showing up, never part of your skill scores"), and a competitor analysis. The thinking is sound even though the code doesn't implement it yet.
- Clean Dart: small widgets, a single state provider, lints on, no secrets.

## What it would take, and a recommendation

To make this a working app rather than a demo, in order:

1. **Real recording**: add a recording package and the microphone permissions on both platforms, upload to the existing storage bucket.
2. **Real transcription and scoring**: the web app already has this (Deepgram for speech-to-text; Claude scoring with checks; delivery measured in code from word timings). The right move is for the mobile app to call the web app's API rather than build a second engine in Dart. That needs the web app's accounts and database first, which are already the next step there.
3. **Real sign-in**: Supabase Auth, with `userId` coming from the session, not a constant. Then the schema's security actually applies.
4. **Real payments**: in-app purchases through Apple and Google (RevenueCat is the usual way), not a flag in memory. Plans and prices should match the web app's.
5. **Real data on the dashboard**, history, delete-my-data, sign-out, password reset.
6. Tests for the assessment and plan logic, and a repository clean-up.

That is most of an app still to build: weeks of work, not days. The screens would survive; almost everything behind them is new.

**Recommendation.** Decide what the mobile app is for before spending on it. Two honest options:

- **Make it the mobile face of Hakkiri**: the same product as the web app (interviews and presentations from a job and CV), with the web app as the backend. The existing screens' daily-drill concept becomes a feature (drills on the phone), not a separate product and price list. This is the cheaper path and gives one product, one set of plans, one scoring engine.
- **Keep it as a separate "daily gym" product** with its own pricing. Then it needs its own engine and its own backend, and you'd be running two products before the first one has launched.

Either way, it shouldn't go anywhere near an app store yet, and the web app launch shouldn't wait for it.
