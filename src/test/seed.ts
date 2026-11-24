/**
 * Puts something in every place the app keeps a person's data, each marked
 * with a word of the person's own, so a test can ask "is anything of Alice's
 * still anywhere?" and "is everything of Bob's still exactly as it was?".
 */
import { saveAnswerAsync } from "@/lib/answers/store";
import { saveRecordings } from "@/lib/answers/audio";
import { saveDraftAsync } from "@/lib/answers/drafts";
import { DEMO_INTERVIEW_ID, getInterview, saveInterviewAsync, updateInterviewAsync } from "@/lib/interviews/store";
import { saveMockAsync } from "@/lib/mocks/store";
import { addQuestion } from "@/lib/questions/store";
import { savePresentationAsync, saveQaAsync, saveRunAsync, saveSlideImage } from "@/lib/pitch/store";
import { saveQaDraftAsync } from "@/lib/pitch/qa-drafts";
import { demoPresentation, demoQaSession, demoRuns } from "@/lib/pitch/demo";
import { roadmapAnswer } from "@/lib/mock-data";
import { saveSettings } from "@/lib/settings/store";
import { recordUsage } from "@/lib/usage/store";
import { addFeedback } from "@/lib/feedback/store";
import { addSurveySubmission } from "@/lib/feedback/survey-store";
import { APPLY_COLLECTIONS, saveApplication, saveApplySettings, saveAudit, saveDoc, saveEvidence, saveJob, saveLead, saveMatch, saveOutput, saveProfile, saveSendLog, saveVoice } from "@/lib/apply/db";
import { saveCv } from "@/lib/cv/store";
import { newCv } from "@/lib/cv/access";

export const audio = (mark: string) => ({ data: new TextEncoder().encode(`audio of ${mark}`).buffer as ArrayBuffer, type: "audio/webm" });
const NOW = "2026-11-23T10:00:00.000Z";

export interface Seeded {
  interviewId: string;
  sessionId: string;
  answerId: string;
  /** The ids recordings were saved under: an answer, a rehearsal run and a Q&A answer. */
  recordingIds: string[];
}

export async function seedEverything(user: { id: string; email: string }, mark: string): Promise<Seeded> {
  const u = user.id;
  const demo = getInterview(DEMO_INTERVIEW_ID, u)!;
  const interviewId = `iv-${mark}`;
  await saveInterviewAsync({ ...demo, id: interviewId, company: `${mark} Ltd`, stories: [{ id: "s1", title: `${mark} story`, source: "Built in Hakkiri", parts: { situation: true, task: true, action: true, result: true }, fits: 1 }] }, u);
  // Their own copy of the built-in demo.
  await updateInterviewAsync(DEMO_INTERVIEW_ID, (i) => ({ ...i, stages: [{ name: `${mark} stage` }] }) as never, u);
  addQuestion(interviewId, `Why did ${mark} leave?`, "motivation", u);

  const answerId = `ans-${mark}`;
  await saveAnswerAsync({ ...roadmapAnswer, id: answerId, interviewId, strength: `${mark} strength` }, u);
  saveRecordings(answerId, [audio(mark)], u);
  const sessionId = `mock-${mark}`;
  await saveMockAsync({ id: sessionId, interviewId, kind: "interview", status: "done", settings: { difficulty: "medium", minutes: 20, preset: "balanced", mix: { motivation: 20, competency: 20, technical: 20, cv: 20, curveball: 20 } }, questionIds: [], startedAt: NOW, finishedAt: NOW, answerIds: [answerId, `${answerId}-2`], planned: 2 } as never, u);
  await saveDraftAsync({ id: `draft-${mark}`, userId: u, interviewId, questionId: "q1", questionNumber: 1, questionsInMock: 2, followUpsOn: false, style: "realistic", turns: [{ asked: `A question for ${mark}`, kind: "main", words: [] }], audio: [audio(mark)], pending: null, createdAt: Date.now() });

  const presentationId = `p-${mark}`;
  await savePresentationAsync({ ...demoPresentation, id: presentationId, title: `${mark} deck`, slides: demoPresentation.slides.map((s, i) => (i === 0 ? { ...s, image: { file: "slide-1.png" } } : s)) } as never, u);
  saveSlideImage(presentationId, "slide-1.png", audio(`${mark} slide`).data);
  await saveRunAsync({ ...demoRuns[0], id: `r-${mark}`, presentationId }, u);
  saveRecordings(`run-r-${mark}`, [audio(mark)]); // saved without naming the owner, as the rehearsal code does
  await saveQaAsync({ ...demoQaSession, id: `qa-${mark}`, presentationId, answers: demoQaSession.answers.map((a, i) => ({ ...a, id: `qa-${mark}-a${i}` })) }, u);
  saveRecordings(`qa-${mark}-a0`, [audio(mark)]);
  await saveQaDraftAsync({ id: `qad-${mark}`, userId: u, presentationId, style: "sceptical", persona: { name: "Dana", title: `${mark} director` }, questions: [], turns: [], audio: [], pending: [], scoring: [], startedAt: NOW, createdAt: Date.now() } as never);

  saveSettings({ retentionDays: 365 }, u);
  recordUsage({ userId: u, interviewId, sessionId, presentationId, service: "deepgram", label: "speech-to-text", seconds: 120, feature: "interview" });
  await addFeedback({ page: "/dashboard", mood: "good", text: `${mark} says the report was useful`, userId: u });
  await addSurveySubmission({ userId: u, email: user.email, mockId: sessionId, interviewId, q1_realism: `${mark} found it realistic`, q2_questions: "Good", q3_feedback: "Fair", q4_issues: "None", q5_likes_dislikes: "", q6_changes: "", q7_recommend: "Yes" });

  // The Apply area and the free CV check.
  const row = { userId: u, createdAt: NOW, updatedAt: NOW };
  await saveProfile({ ...row, contact: { name: `${mark} Person`, email: user.email }, headline: `${mark} headline` } as never);
  await saveVoice({ ...row, samples: [{ id: "smp1", text: `${mark} writes like this`, kind: "email", addedAt: NOW }] } as never);
  await saveEvidence({ ...row, id: `ev-${mark}`, text: `${mark} catalogued 4,000 maps`, numbers: ["4,000"], skillTags: [], sourceKind: "typed-note", confirmed: true } as never);
  await saveJob({ ...row, id: `job-${mark}`, title: `${mark} job`, employer: "Lantern Atlas", text: "An advert", dedupeKey: `k-${mark}` } as never);
  // A job saved before jobs carried an owner: it is the person's through their application for it.
  await saveDoc(APPLY_COLLECTIONS.JOBS, `job-old-${mark}`, { id: `job-old-${mark}`, title: `${mark} old job`, employer: "Old Co", text: "An older advert", dedupeKey: `ko-${mark}`, createdAt: NOW } as never);
  await saveApplication({ ...row, id: `app-${mark}`, jobId: `job-${mark}`, status: "draft", notes: `${mark} notes` } as never);
  await saveApplication({ ...row, id: `app-old-${mark}`, jobId: `job-old-${mark}`, status: "draft", notes: "" } as never);
  await saveOutput({ ...row, id: `out-${mark}`, applicationId: `app-${mark}`, kind: "letter", currentVersionId: "v1", versions: [{ id: "v1", text: `${mark} letter` }] } as never);
  await saveMatch({ ...row, id: `match-${mark}`, jobId: `job-${mark}`, fit: 60, reasons: [`${mark} reason`], missing: [], state: "new" } as never);
  await saveSendLog({ ...row, id: `send-${mark}`, applicationId: `app-${mark}`, adapter: "manual", startedAt: NOW, fields: [{ label: "Name", value: `${mark} Person`, source: "profile", filled: true }] } as never);
  await saveApplySettings({ ...row, titles: [`${mark} title`], locations: [], remote: true, salaryMin: 1, excludeEmployers: [], minFit: 75, dailyCap: 3, perEmployerCap: 2, handsOff: false } as never);
  await saveLead({ id: `lead-${mark}`, email: user.email, firstAuditId: `aud-${mark}`, consent: { marketing: false, at: NOW, wording: "Agreed", version: "1" }, source: "audit", createdAt: NOW, updatedAt: NOW } as never);
  await saveAudit({ id: `aud-${mark}`, docType: "cv", textHash: "h", text: `${mark} CV text pasted into the free check`, score: 50, subscores: {}, findings: [], unlockedBy: `lead-${mark}`, region: "uk", expiresAt: NOW, createdAt: NOW, updatedAt: NOW } as never);

  await saveCv(newCv(u, { name: `${mark} CV`, level: "early", region: "uk" } as never, NOW));
  return { interviewId, sessionId, answerId, recordingIds: [answerId, `run-r-${mark}`, `qa-${mark}-a0`] };
}
