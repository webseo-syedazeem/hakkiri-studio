# Hakkiri launch checklist

Oct 26, 2026 · Bilaal (owner) with Claude

## Where things stand

Hakkiri works end to end on your laptop in test mode, but it can't go to other people yet. There are no accounts, everything lives in one local folder, and the real AI services have never been called.

| Area | State |
| --- | --- |
| Interview flow: set-up, live interview, Skip, Something's wrong, reports, drills, Run it again, prep sheet | Built; checked in test mode |
| Story bank, pay drill, presentations and audience Q&A | Built; checked in test mode |
| Usage and cost tracking, spending and practice limits, rate limits | Built 26 Oct; unit-tested |
| Settings: microphone, interviewer voice, usage, recording retention, download and delete your data | Built 26 Oct |
| Natural interviewer voice (ElevenLabs), falling back to the browser voice | Built 26 Oct; not yet heard with a real key |
| Accessibility (axe, WCAG 2.1 AA) | First pass 26 Oct: contrast, labels, keyboard and dialog focus fixed |
| Launch switch (HAKKIRI\_LAUNCH=1) | Built 26 Oct: hides the demos, test mode, developer messages and costs |
| Privacy policy, terms, landing page | Drafts at /privacy, /terms and /landing |
| Real Claude, Deepgram and ElevenLabs calls | Never run: the build sandbox has no internet |
| Accounts, database, file storage, hosting, payments | Not built |

Security fixes on 26 Oct: other websites can no longer post to Hakkiri's API (which could have wiped your data) or show its pages in a frame, and the link reader refuses addresses on your own network, including through redirects.

## First: the closed beta

Before launch there is a closed beta of 10 to 15 testers, each given a login by the team and 10 free hours a month (`05-beta-plan.md`). It needs logins, per-user data, hosting, alerts pointed at the team, and `HAKKIRI_BETA=1` + `NEXT_PUBLIC_HAKKIRI_BETA=1`. Payments wait until after it.

## Must do before anyone else uses it

Nine blockers stand between the laptop build and real users; accounts and the database come first because everything else is per person.

| Item | Owner | Status | Notes |
| --- | --- | --- | --- |
| Accounts and sign-in (email link and Google) | Claude builds; you pick the provider | Not started | Today everyone would share one set of data, and Delete all my data would delete everyone's. Limits become per person once this lands. |
| Database and file storage | Claude builds; you open the accounts | Not started | Replaces the local .hakkiri-data folder: a database for records, object storage for recordings and slide pictures. The screens don't change. |
| Hosting | You | Not started | Scoring and building questions run for 60 to 120 seconds, so the host must allow long requests. |
| Rotate the API keys pasted into chat earlier | You | Not started | Make new keys, put them only in .env.local, delete the old ones. |
| Real-key test run | You, with Claude | Not started | One interview, a re-run, a drill, a presentation and its Q&A with real keys. Compare Settings > Usage with each provider's dashboard. |
| Spending caps at each provider | You | Not started | Hard monthly caps in the Anthropic, Deepgram and ElevenLabs dashboards, on top of Hakkiri's own limits. |
| Company details, ICO fee, solicitor review | You and a solicitor | Ready for review | Fill the \[brackets\] in /privacy and /terms, sign data processing terms with each provider, then set DRAFT to false on both pages. |
| Payments and pricing | You decide; Claude builds with Stripe | Not started | Proposed launch prices: a free 10-minute interview; Job search, £34.99 for 3 months (30 hours, paid once); Monthly, £14.99 for 10 hours a month; extra hours, 5 for £7.99 (see the pricing doc). Stripe needs a one-off product for Job search and extra hours, and a subscription for Monthly. The Plans section of the terms waits on this. |
| Safari and Firefox | Claude | Not started | Item 5 from the last list. Safari records MP4, not WebM; recording and playback need checking on both. |

## Should do before launch

These won't stop the app working, but each one is cheaper to do before real users arrive than after.

- [ ] Error tracking and uptime alerts, so a failed scoring call reaches you and not only the user
- [ ] Keyboard-only and screen reader run of a full interview (VoiceOver or NVDA); the automated check can't judge these
- [ ] Landing page: real screenshots, pricing, a short FAQ, and where it lives (domain root, with the app on a subdomain)
- [ ] Email sending for sign-in links, and a support address
- [ ] ElevenLabs: confirm your plan allows commercial use of the three voices; zero retention needs an enterprise plan (ELEVENLABS\_ZERO\_RETENTION=1)
- [ ] Deepgram: check whether opting out of their model-improvement programme (now on for every recording) changes the price
- [ ] Backups, with deleted data leaving them within 30 days, as the privacy policy says
- [ ] Rate limits key on the visitor's IP from x-forwarded-for; on the host, make sure only its proxy can set that header
- [ ] If you add analytics, use a cookieless one and update the cookie table in the privacy policy

## Launch day

Launch is mostly settings in .env.local on the host, then five checks. The limits apply to the whole app until accounts land, so one busy person could use up everyone's day.

| Setting | Launch value | What it does |
| --- | --- | --- |
| HAKKIRI\_LAUNCH and NEXT\_PUBLIC\_HAKKIRI\_LAUNCH | 1 | Hides the demos, test mode, developer messages and costs |
| HAKKIRI\_MOCK\_AI | Not set | Test mode; ignored once launched |
| ANTHROPIC\_API\_KEY, DEEPGRAM\_API\_KEY, ELEVENLABS\_API\_KEY | The new keys | Real questions, transcripts and voice |
| HAKKIRI\_DAILY\_MINUTES | 120 (default) | Minutes of speaking a day |
| HAKKIRI\_DAILY\_SPEND\_USD | 5 (default) | Estimated dollars a day across all services |
| HAKKIRI\_MONTHLY\_SPEND\_USD | 60 (default) | Estimated dollars a month |
| ELEVENLABS\_VOICE\_EASY, \_MEDIUM, \_HARD | Sarah, George, Daniel (defaults) | Swap in other ElevenLabs voice IDs |
| HAKKIRI\_PRICE\_\* | Defaults | Only if your provider rates differ |

1. Open Hakkiri as a first-time visitor: you should see empty states, not the Halden or Q1 roadmap demos.
2. Do one short interview, then check Settings > Your practice shows the minutes.
3. Hear all three voices in Settings > Interviewer voice.
4. Download my data, open the zip, then Delete all my data on a test copy.
5. Check /privacy and /terms show no draft notice.

## Soon after launch

The first month is about checking that real answers get fair scores and that each interview costs what the price assumes.

- Read 20 real reports and tune the scoring prompts where the feedback feels off
- After the first 50 interviews, compare the real cost per interview with the plan price
- Usage and limits per person in Settings, once accounts exist
- A phone-friendly way in: today the studio asks phone users to switch to a laptop

## Open decisions

Six choices are yours; the drafts carry a placeholder for each until you decide.

- [ ] Sign-in and database providers (you chose "decide later"; sign-in will be email link and Google)
- [ ] Pricing: trial minutes, plans, an interview pass
- [ ] Minimum age: 16 or 18
- [ ] Where data is hosted: UK or EU
- [ ] How long an unused account is kept before deletion (draft says 24 months)
- [ ] Domain, and whether the landing page sits at its root
