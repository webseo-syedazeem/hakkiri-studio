# Hakkiri beta plan

Oct 27, 2026 · Bilaal (owner) with Claude

## The shape of it

A closed beta: 10 to 15 invited people, 5 hours of practice each (about ten 30-minute interviews, or a mix of interviews, presentations and Q&A), free, for about three weeks. Nothing is for sale. The point is not "do people like it"; it is to find out whether the scores feel fair, whether the feedback is specific enough to act on, and where people get stuck. Three weeks is long enough for someone with a real interview coming up to use it properly and tell you whether it helped.

What the beta needs from the build, in order:

1. **Accounts** (sign-in by email link and Google). This is the one blocker: without it everyone shares one data set and one allowance. It's step 1 of the handover anyway.
2. **The beta switch on** (`HAKKIRI_BETA=1` and `NEXT_PUBLIC_HAKKIRI_BETA=1`). Already built: it gives each tester 5 hours in total with a 120-minute daily cap, swaps the pricing section for "free while we're in beta", changes the plan FAQ, and puts a Feedback button on every screen of the app. `HAKKIRI_BETA_MINUTES` changes the allowance.
3. **Alerts pointed at you** (`ALERT_WEBHOOK_URL` to a Slack or Discord channel, or Resend email). Every feedback note arrives there the moment it's sent, with the screen it was sent from.
4. **An invite list**, not an open sign-up: the sign-in page should accept only addresses on an allow-list during the beta. Keep the list in the database so you can add people without a deploy.

Payments, Stripe and the hours balance wait until after the beta.

## Who to invite

Twelve people is plenty if they're the right twelve. You want people with a real interview or presentation in the next month, because that's who the product is for and they're the only ones who can tell you whether a score was fair. Aim for a spread:

- 6 to 8 people job hunting now (mixed seniority; at least two changing field, at least two whose first language isn't English, because the "never judges accent" promise has to be tested by people it matters to)
- 3 to 4 people with a presentation or pitch coming up (an investor pitch, a conference talk, an interview presentation)
- 1 or 2 people who do hiring, to tell you whether the interviewer asks what a real one would

Leave out friends who'd be kind. Ask each one for a specific commitment: two full sessions in the first week, and 15 minutes on a call at the end.

## How to get feedback that isn't generic

"What did you think?" gets "it was good". The way round it is to ask about the specific thing on the screen, at the moment it's on the screen, and to compare against reality.

**In the app (built).** The Feedback button asks a different question on every screen, and the answer is Yes / Partly / No followed by two or three prompts. Some examples of what it asks:

| Screen | Lead question | What it asks for |
| --- | --- | --- |
| Feedback on an answer | Was this score fair? | Which line was wrong; would you actually say the stronger version; did the pace and filler numbers match how it felt |
| Report | Was the verdict (Ready / Nearly / Not yet) right? | Which of the top three fixes you'd act on; which score surprised you; what a real interviewer told you that this missed |
| Live interview | Did it feel like an interview? | Where the interviewer got it wrong: a follow-up that didn't follow, a cut-in at the wrong moment; anything that broke |
| Briefing | Did the questions fit the job? | A question that would never be asked for this role; an obvious one that's missing |
| Run report (presentations) | Did "where to cut" match what you'd cut? | A key point it got wrong; whether you'd use the rewritten opening |
| Audience Q&A | Were the questions ones a real audience would ask? | Which was off or too easy; which style felt least real |

The full list is in `src/lib/feedback/prompts.ts`; change the wording there. Each note lands in your alerts channel as, for example: "Answer feedback · /interviews/x/answers/y — Was this score fair? No. The stronger version uses numbers I never said."

**Three things to ask testers to do**, in the invite email:

1. Practise for a real interview, not a made-up one. Use the actual job description and your actual CV.
2. Whenever a score or a line of feedback feels wrong, press the flag and say which one. That is the single most useful thing you can do.
3. After the real interview, tell us what they asked and whether Hakkiri had prepared you for it. (This is the comparison that no other feedback gives you.)

**The exit call (15 minutes, same questions for everyone)**, so answers can be compared:

1. Show me a score you disagreed with. What should it have been, and why?
2. What did a real interviewer ask that Hakkiri didn't? What did Hakkiri ask that no one would?
3. Which of the top three fixes on your report did you actually work on? Did it change anything?
4. What did you do between sessions: drills, re-runs, story bank, prep sheet? Which were worth the time?
5. Was there a moment you nearly stopped using it? What happened?
6. If this cost £14.99 a month, when would you pay for it and when would you cancel?
7. Who do you know who should use this, and what would you tell them it's for?

Write the answers in the same table for everyone; patterns show up by the fourth call.

**Numbers to watch** (from Settings > Usage and the data files; per person once accounts exist):

- How many of the 5 hours each person used, and how fast. Someone who used 20 minutes and stopped is the most important person to call.
- Interviews started vs finished. A high drop-off mid-interview means something is wrong with the live screen, not the product idea.
- The Yes / Partly / No split on "Was this score fair?" If fewer than about 70% say Yes, the scoring prompts need work before launch.
- Which screens get feedback and which never do. Silence on the story bank means no one found it.
- Real cost per person from Settings > Usage, against the pricing doc's assumption of about 27p per 30-minute interview.

## What to do with it

Sort every note into one of four piles: scoring wrong, feedback unclear, something broke, missing feature. Fix the first three during the beta, in that order; the scoring ones are prompt changes in `src/lib/ai/`, each with a test. Put the fourth pile in a list and don't build any of it until at least three people asked for the same thing unprompted.

At the end: the exit-call table, the four piles, and the numbers above are the launch decision. Launch when "was this score fair" is mostly Yes, nothing in the "broke" pile is open, and at least a few testers say they'd pay.
