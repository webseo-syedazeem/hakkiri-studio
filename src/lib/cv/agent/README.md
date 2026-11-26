# The CV assistant ("Talk it through")

The person talks or types about their work; the assistant edits their CV beside them as they go and asks
for the next thing it needs. Screen: `/cv/v/[versionId]/talk`. Same rules as the rest of the CV section
(see `../README.md`): nothing is invented, nothing is lost, the CV is the owner's alone.

## How one turn works

```
person says or types ─► POST /api/cv/versions/[id]/talk ─► runTurn (turn.ts)
                                                              │
     ┌────────────────────────────────────────────────────────┤
     │ AI on:  one call through lib/ai/ask (Gemini or Claude, │ AI off / test mode / service down:
     │ whichever key is set) returns {say, ask, ops}           │ rules.ts reads the message by rule
     └───────────────┬────────────────────────────────────────┘
                     ▼
     validate.ts: every op checked against the person's own words (write/check.ts) and the plain-words
     rules (style.ts). A failing op is sent back to the model once with the reason; after that it is left
     out and the person is told what was left out and why.
                     ▼
     plan.ts: the next question, worked out in code from what the CV still lacks
                     ▼
browser (Talk.tsx) applies the ops with applyOps (ops.ts) ─► one save, one step of Undo
```

The server never saves the CV during a turn. The browser applies the edits through the same `useCv`
save path as typing in the form, so revision checks, conflict handling, autosave and Undo all apply.

## Files

| File | What |
| --- | --- |
| `ops.ts` | The edits the assistant can make, as data (`OpSchema`), and `applyOps`, which makes them. Pure: runs on the server (to check) and in the browser (to apply). Lines are switched off, never deleted. New lines keep the exact words they came from in `bullet.sources`. |
| `validate.ts` | `checkOp` / `checkOps`: an edit passes only if it says what the person said. Numbers, employers, tools, skills, dates, email and phone must appear in their words. Uses `checkGrounded`, `checkRewrite` and `checkProfile` from `../write/check.ts`. |
| `style.ts` | Writing for screening software and recruiters: AI-sounding words and buzzwords (`aiTells`), one point per line, no dashes between clauses. A word the person used themselves is never refused; a plainer one is offered (`plainerWords`). |
| `plan.ts` | `nextStep`: target job, name, contact, each job (what you did, what changed, a number), more jobs, education, skills, what the advert asks for that the CV doesn't show, profile. `outline`: the CV as the model sees it, every line with its id. |
| `rules.ts` | The assistant without a model: contact details, job title and employer, dates, study, skills, languages, "write my profile", "remove the last line", and every other sentence about a job as a line under it. Used in test mode and when the AI service doesn't answer. `looksLikeAdvert` spots a pasted job advert. |
| `turn.ts` | `runTurn`: one turn end to end, and the prompt. Server only. |
| `agent.test.ts`, `api.test.ts` | Unit and route tests (`npx vitest run src/lib/cv/agent`). |
| `src/app/api/cv/versions/[id]/talk/route.ts` | The route: signed in, owner only, counted against the AI limit (`guard(req, "ai")`). |
| `src/components/cv/Talk.tsx` | The screen, from the design handoff made with ChatGPT: conversation and page side by side (tabs below 1100px), each scrolling on its own, the message box and microphone always at the bottom; each reply's changes as rows (type, where, exact words) that mark the passage on the page; "Left out" and plain-word tips (Use / Keep mine: a word is never swapped unasked); Undo per reply; a "Next question" card; the step indicator (`stagesFor` / `stageOf` in `plan.ts`). Styles: the "Talk it through" block in `cv.css`. |
| `src/components/cv/useHandsFree.ts` | Hands-free speech: the microphone stays on, each phrase is cut on a pause and sent to `/api/cv/transcribe` (Deepgram) while the person keeps talking. |
| `e2e/cv-talk.cjs` | Browser test: builds a CV by conversation in test mode. |

## Privacy

- Lines taken from achievements marked private are shown to the model as "(private line, not shown)".
- The conversation is kept in the browser only (`localStorage`, key `hakkiri.cv.talk.<cvId>`). The CV keeps
  what matters from it: each line it added carries the words it was made from.
- Audio is read in memory by `/api/cv/transcribe` and not kept (unchanged).

## Settings

No new keys or variables. The model is `HAKKIRI_MAIN_MODEL` (as for the other writing help); speech uses the
existing `DEEPGRAM_API_KEY`; spoken replies use `/api/voice` (ElevenLabs or Deepgram) and fall back to the
browser's own voice. In test mode (`HAKKIRI_MOCK_AI=1`) the rules stand in for the model and speech-to-text
answers 501, so the screen asks the person to type.

## Not done yet

- Speech is cut into phrases on pauses (about 1.3 seconds) and transcribed per phrase. Live word-by-word
  captions would need Deepgram's streaming API over a websocket.
- The conversation isn't stored on the server, so it doesn't follow the person to another device.
- Cover letters: the same approach would work for `letter/`, which has its own sentence checks.
