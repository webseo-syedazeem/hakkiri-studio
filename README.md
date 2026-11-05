# Hakkiri Studio

The desktop web app for practising interviews and presentations, with feedback that never judges your accent.

**New to the project? Read `docs/START-HERE.md` first.** It links the developer handover, the beta plan, the pricing and cost model, the launch checklist and the mobile app audit.

The screens ship with demo data (Priya preparing for a Halden interview) that vanishes at launch; they're real React screens, and the live mock interview really records from your microphone.

## Run it

You need Node.js 20 or newer.

```bash
npm install
cp .env.example .env.local   # then paste your keys into .env.local
npm run dev                  # http://localhost:3000
npm test                     # 180 tests: scoring, follow-ups, reports, question mix, drills, re-runs, interview set-up, presentations, usage and limits, voice, your data, guardrails
npm run typecheck
```

**Keys** go in `.env.local` only, never in code, chats or GitHub:

- `DEEPGRAM_API_KEY`: [Deepgram Console](https://console.deepgram.com), Settings → API Keys
- `ANTHROPIC_API_KEY`: [Claude Console](https://platform.claude.com/settings/keys)
- `ANTHROPIC_WORKSPACE_ID`: only if the Claude API says your key "is not scoped to a workspace"
- `ELEVENLABS_API_KEY`: [ElevenLabs](https://elevenlabs.io/app/settings/api-keys), for the natural interviewer voice (optional: without it the browser's voice is used)

`.env.example` lists every other setting: the voice per difficulty, the spending and practice limits, price overrides and the launch switch.

No keys? The app still runs; finished answers open the demo feedback with a note. Set `HAKKIRI_MOCK_AI=1` to run the whole record → score → feedback flow offline with sample results.

## Try it

**Set up an interview** at http://localhost:3000/interviews/new. Add the company's name and website, the job title and spec (paste a link or the description, or choose a file), your CV and, if you have one, your cover letter (PDF, Word or text, or paste the text). Then choose how the interview runs:

- **Difficulty:** Easy, Medium or Hard. Hard means probing questions, pushback and an interviewer who cuts in on long answers.
- **Length:** 10, 20, 30, 45 or 60 minutes (about one question every four minutes, follow-ups included).
- **Question mix:** a preset (Balanced, Skills-heavy, Technical-heavy, Screening call, Final round) or your own: switch each category on or off and set its share in steps of 10%. The five categories are Experience, Skills, Technical (called Role knowledge for jobs that aren't technical), Motivation and Situational. Every interview opens with "Tell me about yourself" and, from 20 minutes, closes with "What questions do you have for us?".

**Build my interview** reads the company's site and the job spec, and Claude works out what each category means for this job (for a sales job, Role knowledge is product, pricing, pipeline and objections) and writes the questions. A quick check by the fast model (Claude Haiku 5.5 by default, `HAKKIRI_FAST_MODEL`) drops any question that doesn't fit the job before you hear it. Without an Anthropic key you get a standard set of questions with the company's name in them.

**The interview:** the overview shows what Hakkiri understood (edit it if it's wrong) and your settings. Press **Start interview**: the questions stay hidden until Sam asks them, the clock counts down your length, Sam follows up on what you said, and with little time left he goes to the closing question. Feedback comes at the end.

- **Skip** a question that doesn't fit (not relevant, not true about me, already asked, wrong level): Sam moves on to a spare from the same category, so your mix and time hold, and that question never comes back. Saying "I've never worked there" does the same. "Tell me about yourself" and your questions for them skip in one tap, with no replacement.
- **Something's wrong** pauses the interview. Say what's off; Hakkiri rereads your documents with your feedback, shows what it changed, rebuilds the questions with your feedback as rules, and starts a fresh interview with your full time. Three skips open it by themselves. If a second rebuild is still wrong, it asks you to check your documents, or use the standard questions for now.

**The report:** Ready, Nearly or Not yet for this job's level; a score for each category you chose; the three changes that would raise your score most; every answer with its one fix (open one for the marked-up transcript and a stronger version built from your own CV). Then:

- **Your training:** up to three drills, biggest gain first, with feedback after every answer: fix an answer (once more with one change, then a new question on the same skill), a category drill (three new questions, harder as you do well), a habit drill (five quick questions scored on one habit: start with the result, say "I", end with a number, keep to time, fewer fillers), follow-up pressure (one question, three follow-ups), or build a story for a skill none of yours covers.
- **Run it again** (once per interview): the same questions with your top fixes, then every answer before and after. It shows progress but doesn't change your verdict.
- **New questions:** a fresh interview, never a question you've had, leaning towards your weakest category. Only these count towards your verdict.
- **Talking about pay** (always on the interview page): "What are your salary expectations?", what you earn now, a push-back, then asking about the package. It's written for your round (a recruiter screen, a hiring-manager interview, or a final round or offer), and each answer is checked in code: a range, based on the market, room for the package, no apologising. The report gives good questions to ask and what to avoid at that stage, and your best answer goes on the prep sheet.

**The prep sheet** appears after your first interview and improves each time you practise: the company and job, your best answers, which story for which question, what they'll probe on your CV and how to handle it, questions to ask them, and three things to remember. **Print or save as PDF** gives one A4 page.

Home shows your interviews and presentations, each with its scores and a **Continue** button that goes to the most useful next step. The Halden demo stays under Interviews to look around. Delete an interview to delete its CV text, answers and recordings.

**One question on its own:** open http://localhost:3000/mock/halden?q=c1, press **Start interview**, answer, and press **Finish answer** (or Space). Your recording goes to `/api/answers` (Deepgram transcribes it with fillers kept), Sam may follow up, and Claude scores everything. Add `?followups=off` to practise without follow-ups.

**Presentations:** open http://localhost:3000/presentations. The Q1 roadmap demo has three runs and a Q&A round so you can see every screen straight away.

1. **New presentation** (screen 11): drop in a PowerPoint (.pptx) or PDF, or paste your notes. Slides are read in your browser. Hakkiri suggests a time for each slide (adding up to your limit exactly) and the point each slide needs to land; pick a slide to change either. Set the audience, your ask, the time limit and date, and who asks questions afterwards.
2. **Rehearse** (screen 12): press **Start run** and give the talk. Change slides with the arrow keys or a clicker; every change is timed. Total and slide timers turn red when you run over. **Finish run** sends the recording and the slide timings to be scored. Modes: full run, one slide (`?from=4&to=4`), or the opening only (`?mode=opening`, stops after a minute).
3. **Run report** (screen 13): time on each slide against the plan, flags like "1:40 over, cut here", "Key point missed" and "Ask rushed", scores for opening, message and ask, structure, slide coverage, timing, audience fit and delivery, your one fix, where to cut, and your opening rewritten from your own words. Open a slide to see what you said on it and hear it back.
4. **Audience Q&A** (screen 14): pick curious, sceptical, time-pressed or technical. Four questions come from your slides and your last run; dodge one and they ask again. A time-pressed exec cuts in after a minute. The Q&A report scores each answer and gives a stronger version of your weakest.

Pitch readiness comes from your runs: "Ready" means two full runs in a row at 4 or more, inside the time limit. Home's Continue goes to the next useful rehearsal.

**Settings** (the gear, bottom left):

- **Interviewer voice:** a natural voice from ElevenLabs (Sarah for Easy, George for Medium, Daniel for Hard) or the browser's own. Hear each one. Every line is made once and kept, so a repeated question costs nothing. If ElevenLabs fails, the browser voice takes over mid-interview.
- **Usage:** minutes of speaking today, estimated spend today and this month against the limits, cost per day for the last 14 days, and this month by service and by feature. Each report also shows what that session cost. In test mode these are samples and don't count.
- **Your data:** what Hakkiri holds, how long recordings are kept (30 days, 90 days, a year, or until you delete them; transcripts and scores stay), **Download my data** (a zip with everything and your recordings) and **Delete all my data**.

**Cost of scoring:** each answer and its follow-up replies are scored in one call to Claude, and the instructions, job and CV go first in that call and are cached for 5 minutes, so the later answers in an interview pay a tenth for them. A 30-minute interview comes to about 27p in AI services (31p before). Settings, Usage shows the real figure once you use your own keys.

**Deleting:** an interview (with its CV text, answers, recordings and sessions) or a presentation (with its slides, runs, Q&A rounds and recordings) can be deleted from its own page; the demos can't. **Delete all my data** in Settings removes everything.

**Limits:** every route that calls Claude, Deepgram or ElevenLabs checks the daily minutes, the daily and monthly spend, and a per-minute request limit. Something already under way (an interview you started) may finish up to 25% over. Set the limits in `.env.local`; 0 turns one off. Behind a proxy you control, set `HAKKIRI_TRUST_PROXY=1` so the per-minute limits count callers by their forwarded address; otherwise every caller counts as one.

**Error alerts:** every server error, browser crash and failed AI call is recorded (grouped, with a count) under Settings, Problems and alerts. Set `ALERT_WEBHOOK_URL` (Slack, Discord or Teams) and/or `RESEND_API_KEY` with `ALERT_EMAIL_TO` and the first of each problem is sent to you, then at most every 30 minutes. You also get a warning at 80% of the daily or monthly spending limit. **Send a test alert** checks it works.

**Browsers:** Chrome, Edge, Firefox and Safari. Each records in its own format (WebM, Ogg or MP4), and Deepgram reads them all. PDFs are read with pdf.js's polyfilled build so older Safari and Firefox work too.

**Public pages:** `/landing`, `/privacy` and `/terms` work on phones too. The landing page leads with interviews (real screenshots of the live interview, report, feedback, story bank and prep sheet) and has a section for presentations and pitches (rehearsal, run report and audience Q&A). The screenshots are in `public/landing/`. It also shows how it works and the plans and prices from `src/lib/pricing.ts`: a free 10-minute interview; Job search, £34.99 for 3 months with 30 hours of practice, paid once (the highlighted plan); Monthly, £14.99 for 10 hours a month; and extra hours, 5 for £7.99, on any paid plan. Every minute in an interview, drill, rehearsal or Q&A counts towards the hours. `/present` is the same offer for presenters: it leads with presentations and pitches (readiness, slide plan, rehearsal, run report, Q&A), with Monthly as the highlighted plan. Send ads for presenters there. Until launch both carry a draft banner, because payments aren't built yet. The building blocks of both pages are in `src/components/marketing/parts.tsx`. The public pages are white, with the app's screens shown in their own dark colours in a device frame; their colours are the `mk-` tokens in `globals.css`, and the `.mk` class re-maps the app's own tokens so the privacy policy and terms read on white too. On phones a "Start" button stays at the bottom once the top of the page has scrolled away. The privacy policy and terms are drafts for a solicitor: fill the [brackets], then set `DRAFT = false` in each page.

**Launch switch:** `HAKKIRI_LAUNCH=1` and `NEXT_PUBLIC_HAKKIRI_LAUNCH=1` hide the Halden and Q1 roadmap demos (new people see empty states), turn test mode off, replace developer messages (".env.local", key names) with plain ones, and hide costs. Don't launch before accounts and a database: until then everyone shares one set of data.

**Beta switch:** `HAKKIRI_BETA=1` and `NEXT_PUBLIC_HAKKIRI_BETA=1` (implies the launch switch) run a closed free beta: each tester gets a login from the team and 10 hours of practice a month, reset on the 1st (`HAKKIRI_BETA_MINUTES` overrides), no daily cap, whole-app spend limits raised to $25 a day and $200 a month, the public pricing section says "free while we're in beta", and a Feedback button in the rail asks a question about the screen the tester is on and sends the answer to the alerts channel. Notes are kept in `feedback.json`. See `docs/05-beta-plan.md`.

On Windows, double-click `start-hakkiri.bat`: it installs Node.js if needed, installs packages the first time, starts the app and opens it. After an update, double-click it again: it closes the old copy first.

## What works today

| Screen | Route | Status |
| --- | --- | --- |
| First visit and mic check | `/welcome`, `/mic-check` | New visitors start at Welcome; set-up leads to a mic check (live level, 5-second test, playback) before the first session |
| Home | `/` | Your interviews and presentations with their scores and a Continue button to the next useful step |
| Interviews list | `/interviews` | Your interviews, soonest first, then the Halden demo |
| New interview set-up | `/interviews/new` | Company, job spec, CV and cover letter (links and files read as you add them); difficulty, length and question mix |
| Interview overview | `/interviews/<id>` | What Hakkiri understood (editable), your settings and Start; then where you stand by category, your training, Run it again and new questions |
| Live interview, re-run or drill | `/mock/<id>?session=<id>` | Session clock, questions read aloud, follow-ups, Skip with a reason, Something's wrong, Hard cut-in; drills give feedback after every answer |
| Rebuild | `/interviews/<id>/rebuild` | After Something's wrong (or "Not right? Edit it"): what changed, rules from your feedback, rebuild and start |
| Report | `/interviews/<id>/mocks/<id>` | Interview: verdict, categories, top fixes, training, every answer. Re-run: before and after. Drill: how each answer did. Demo: `/interviews/halden/mocks/demo-full` |
| Past interviews | `/interviews/<id>/mocks` | Interviews, re-runs and drills, newest first |
| Prep sheet | `/interviews/<id>/prep` | One printable page from your own practice |
| Story builder | `/interviews/<id>/story` | Four quick prompts, a story in your words, then say it once |
| Answer feedback | `/interviews/halden/answers/<id>` | Your scored answer: waveform marks, marked-up transcript, coach notes, stronger version, overall score, and a Follow-up tab with each reply scored |
| Presentations list and workspace | `/presentations`, `/presentations/<id>` | Every presentation with its readiness; the plan, rehearsal modes, runs (score, time, fillers) and Q&A rounds |
| New presentation (screen 11) | `/presentations/new`, `/presentations/<id>/edit` | Reads .pptx (text, notes, first picture) and PDF (each page as a picture, plus its text), or pasted notes. Suggested timing and points per slide, editable |
| Rehearsal (screen 12) | `/rehearse/<id>` | Full run, one slide, or opening only; slide changes timed; total and slide timers; time-per-slide bar |
| Run report (screen 13) | `/presentations/<id>/runs/<runId>` | Demo: `/presentations/q1-roadmap/runs/demo-run-3` |
| Audience Q&A (screen 14) | `/qa/<id>` | Four audience styles, questions from your slides and last run, asks again if you dodge |
| Q&A report | `/presentations/<id>/qa/<sessionId>` | Each answer scored and marked up; a stronger version of your weakest. Demo: `/presentations/q1-roadmap/qa/demo-qa` |
| Settings | `/settings` | Microphone, interviewer voice (with previews), usage against the limits, recording retention, download and delete your data |
| Landing, presenters, privacy, terms | `/landing`, `/present`, `/privacy`, `/terms` | Landing page (interviews first) and the page for presenters, with screenshots, features and pricing; privacy and terms are drafts; readable on any screen |
| Story bank | `/story-bank` | Every story from your interviews in one place: which parts are missing (fill in the gaps), which kinds of question they cover (build one for the rest), and which stories you lean on |

**Saving:** answers, recordings, interviews and their reports, your own questions, stories, presentations (with slide pictures), runs and Q&A rounds are saved in a `.hakkiri-data` folder inside the project, so they survive a restart. Delete that folder to start fresh. It's a stand-in for the database and file storage, and it isn't shared or uploaded anywhere.

**Limits for now:** pace, fillers and whether each slide's point was made are worked out after a run, not live (live checks need streaming speech-to-text, planned with the ElevenLabs and Deepgram Flux work). Keynote and old .ppt files need saving as .pptx or PDF first. Some job sites (LinkedIn, Workday) block apps from reading them: paste the job description instead. A scanned PDF CV has no text to read: paste it instead. Studio is for laptops and desktops; phones get a message saying so.

## How the code is laid out

```
src/
  app/
    (studio)/          screens with the left rail
    (live)/mock/[id]/  full-screen live practice
    (public)/          landing, present, privacy and terms (no rail, work on phones)
    globals.css        design tokens (Direction B "Booth" colours, animations)
  components/
    ui/                buttons, panels, chips, meters, icons, segmented control
    shell/             left rail, placeholders, phone notice, legal page layout
    settings/          voice choice, retention and data buttons, usage chart
    brand/Mark.tsx     the Hakkiri logo
    marketing/parts.tsx  the sections of the public pages (hero, features, steps, pricing, FAQ)
    audio/             useMicrophone (recording + levels), TargetRail, MiniWave, speak()
    interview/ live/ feedback/
  lib/
    types.ts           domain types, matching the planned database tables
    mock-data.ts       demo data, shaped like real records
    scoring/
      profiles.ts      context profiles from the spec (target length, shape, weights)
      delivery.ts      pace, fillers, pauses, point timing, delivery score: all in code
      combine.ts       overall score, labels, readiness
    followups.ts       follow-up limits by interviewer style, kind labels
    ai/
      types.ts         provider-neutral interfaces: SpeechToText, InterviewerBrain, Voice
      config.ts        keys and model names from .env.local (server only)
      providers/       deepgram.ts (speech-to-text), claude.ts (Messages API), elevenlabs.ts (interviewer voice)
      score-answer.ts  the scoring prompt (cached part first; follow-up replies included), the JSON schema, and the guardrail checks
      follow-up.ts     the follow-up prompt, its checks, and the offline rules
      brain.ts         InterviewerBrain on the fast model: 8-second limit, any failure = move on
      score-follow-ups.ts  the rules, schema and checks for follow-up replies
      quotes.ts        matching quotes to what was said (ignores "um")
      score.ts         one call per answer, validates, retries once, never shows an unchecked score
      mock.ts          offline stand-ins (HAKKIRI_MOCK_AI=1)
    usage/
      prices.ts        estimated prices per model, minute and character
      store.ts         every AI call with its use and cost, linked to the interview or session
      limits.ts        daily minutes, daily and monthly spend, request limits; guard() for routes
    launch.ts          the launch and beta switches (HAKKIRI_LAUNCH, HAKKIRI_BETA) and plain messages for users
    settings/store.ts  recording retention
    data/account.ts    your data: counts, download (zip), delete all
    mocks/
      report.ts        the report, worked out in code: score, verdict, category scores, top fixes
      store.ts         sessions: interviews, re-runs and drills (planned, done or stopped)
    sessions/
      pick.ts          choosing an interview's questions from the mix, with spares for skips
      drills.ts        the drills, habit checks and which drills to suggest
      pay.ts           talking about pay: questions by round, checks, tips
      compare.ts       before and after for Run it again
      rules.ts         rules from skipped questions
      server.ts        where you stand, planning sessions, topping up questions, stopping and rebuilding
    answers/
      view.ts          an answer with delivery measured, shared by feedback and report
      build-answer.ts  transcript + model result → the feedback screen's data
      drafts.ts        an answer in progress: main answer + follow-ups, not yet scored
      pipeline.ts      shared steps: speech-to-text, follow-up decision, error messages
      store.ts         in-memory answer store (until the database)
  app/api/answers/     POST the main answer → draft id + follow-up (or null)
    [draftId]/turns/   POST a follow-up reply → the next follow-up (or null)
    [draftId]/score/   POST when the interviewer moves on → scored answer id
  app/api/mocks/       POST the scored answers of a session → its report
  app/api/sessions/    stop a session ("Something's wrong")
  lib/interviews/      interviews for any company
    store.ts           the demo plus your interviews; the one Home is about
    links.ts           reading a company site or job link (job-posting data first), safely
    settings.ts        difficulty, length, presets and the question mix (always adds up to 100)
    plan.ts            questions with ids (m1, c1, t1…), the standard questions without a key
    build.ts           set-up, more questions later, the relevance check, rethinking after feedback
    prep.ts            the prep sheet, from your own answers
    stories.ts         the story builder
  lib/ai/interview/    prompts, schemas and checks: set-up, new questions, relevance, rethinking, stories
  components/interview/  set-up, the settings picker, start buttons, rebuild, story builder, tabs, delete
  app/api/interviews/  POST build an interview; read-link; DELETE one; sessions, rethink, rebuild, stories
  lib/stories/         the story bank: themes, matching stories to answers, filling in gaps
  lib/pitch/           presentations
    types.ts           presentations, slides, runs, Q&A sessions
    timing.ts          suggested timing that adds up to your limit, the ask slide, warnings
    measure.ts         time per slide, words per slide, read-out check, timing/coverage/delivery scores, the one fix
    run.ts             a run put together from the words, slide changes and the model's judgement
    plan.ts            pitch readiness and the next thing to rehearse
    demo.ts            the Q1 roadmap demo deck, runs and Q&A, built with the same functions
    server.ts          planning, scoring a run, and Q&A sessions (used by the API routes)
  lib/ai/pitch/        prompts, schemas and checks for planning, run scoring, audience questions and asking again
  components/pitch/    SlideView, slide reading (PDF/PowerPoint/notes), set-up, rehearsal, run report rows, audience Q&A
  app/api/presentations/  plan, create, update, slide pictures, runs
  app/api/qa/          start a Q&A, answers, scoring, finish
```

## Rules the code already follows

- **Delivery is measured, not guessed.** `computeDelivery()` works from word timings only, so the same answer always gets the same delivery numbers.
- **Minimum speech.** Pace needs 20 seconds; a filler *rate* needs 2 minutes (below that, the count is shown); "point first" is only checked on answers over 30 seconds.
- **"Not applicable" is removed, not scored low.** `overallScore()` drops null or zero-weight parts and rescales.
- **Model output is checked before it's shown.** `checkScoreResult()` rejects quotes that aren't in the transcript and numbers in the stronger version that the speaker never said.
- **No accent, tone or emotion judging**: written into the scoring and follow-up prompts.
- **Talk timing is arithmetic, not a guess.** The model suggests how much each slide deserves; code fits the times to your limit in whole steps. Time per slide, the read-out check, timing and delivery are measured in code; the model judges only the opening, the message and ask, the flow, audience fit and whether each point was made, and every quote it returns is checked against the transcript.
- **A run is never lost.** If the model can't score a run, it's still saved with the measured parts and a note.
- **Questions are checked before you hear them.** Each one must fit the job and level and follow every rule from your feedback; questions you've had never come back; the stronger version of an answer may only use facts from what you said or your CV.
- **Follow-ups are checked before Sam says them.** At most two per question (one for a friendly interviewer); any quote must be the candidate's own words; one question, under 25 words, never a repeat. If the fast model is slow, fails or breaks a rule, Sam simply moves on.

## Next steps

1. **Try it with your keys** and record a few real answers. Tell us where the feedback feels off; that's the start of the calibration set.
2. **Database and sign-in:** Postgres tables from `types.ts`, email link and Google sign-in, recordings in object storage. Limits become per person.
3. **Hosting, payments and the legal drafts:** see the launch checklist.
4. **Safari and Firefox:** check recording and playback.
