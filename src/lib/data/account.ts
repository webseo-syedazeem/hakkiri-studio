import "server-only";
import JSZip from "jszip";
import { allSavedInterviews, clearInterviews } from "@/lib/interviews/store";
import { allAnswers, clearAnswers } from "@/lib/answers/store";
import { allRecordings, clearRecordings, deleteRecordings, getRecording, recordingCount } from "@/lib/answers/audio";
import { clearDrafts } from "@/lib/answers/drafts";
import { allMocks, clearMocks } from "@/lib/mocks/store";
import { allCustomQuestions, clearQuestions } from "@/lib/questions/store";
import { allPitchData, clearPitch, loadSlideImage } from "@/lib/pitch/store";
import { clearQaDrafts } from "@/lib/pitch/qa-drafts";
import { allUsage, anonymiseUsage } from "@/lib/usage/store";
import { getSettings } from "@/lib/settings/store";
import { removeDir } from "@/lib/storage/disk";
import { clearFeedback } from "@/lib/feedback/store";

/**
 * "Your data" in Settings: what Hakkiri holds about you, a copy of all of it,
 * and deleting all of it (UK GDPR rights of access and erasure). Until
 * accounts land this is everything in the app's data folder.
 */

export interface DataCounts {
  interviews: number;
  sessions: number;
  answers: number;
  recordings: number;
  presentations: number;
  rehearsals: number;
}

export function dataCounts(userId?: string): DataCounts {
  const pitch = allPitchData(userId);
  return {
    interviews: allSavedInterviews(userId).length,
    sessions: allMocks(userId).length,
    answers: allAnswers(userId).length,
    recordings: recordingCount(),
    presentations: pitch.presentations.length,
    rehearsals: pitch.runs.length + pitch.qa.length,
  };
}

export const hasData = (c: DataCounts) => Object.values(c).some((n) => n > 0);

const README = `Your Hakkiri data
=================

data.json holds everything Hakkiri keeps about you:
  interviews      each interview you set up: company, role, the job spec and
                  CV text you gave, what Hakkiri understood, and its questions
  questions       questions you added yourself
  sessions        each practice interview, re-run and drill, with its scores
  answers         each answer: the transcript, scores and feedback
  presentations   presentations, rehearsal runs and audience Q&A
  usage           when Hakkiri called an AI service for you, and roughly what it cost
  settings        your settings

recordings/ holds the audio of your answers that is still kept
(see "Keep recordings for" in Settings).
`;

/** A zip of everything: data.json, a README, and the recordings (scoped to user if userId provided). */
export async function exportAll(userId?: string): Promise<Uint8Array> {
  const zip = new JSZip();
  const pitch = allPitchData(userId);
  const userInterviews = allSavedInterviews(userId);
  const userQuestions = allCustomQuestions(userId);
  const userSessions = allMocks(userId);
  const userAnswers = allAnswers(userId);
  const data = {
    exportedAt: new Date().toISOString(),
    interviews: userInterviews,
    questions: userQuestions,
    sessions: userSessions,
    answers: userAnswers,
    presentations: pitch.presentations,
    rehearsals: pitch.runs,
    audienceQa: pitch.qa,
    usage: allUsage(userId),
    settings: getSettings(userId),
  };
  zip.file("data.json", JSON.stringify(data, null, 2));
  zip.file("README.txt", README);
  const allowedAnswerIds = new Set(userAnswers.map((a) => a.id));
  for (const r of allRecordings()) {
    if (!userId || allowedAnswerIds.has(r.answerId)) {
      const rec = getRecording(r.answerId, r.turn);
      if (rec) zip.file(r.file, rec.data);
    }
  }
  // Pictures of your slides, where a presentation had them.
  for (const p of pitch.presentations) {
    for (const s of p.slides) {
      const img = s.image?.file ? loadSlideImage(p.id, s.image.file) : null;
      if (img) zip.file(`slides/${p.id}/${s.image!.file}`, img);
    }
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

/**
 * Deletes everything you've given Hakkiri or made in it. Usage records stay,
 * unlinked from you, because they hold the spending limits in place.
 */
export function deleteAll(userId?: string) {
  if (userId) {
    const userAnswers = allAnswers(userId);
    const pitch = allPitchData(userId);
    const userRecordingIds = [
      ...userAnswers.map((a) => a.id),
      ...pitch.runs.map((r) => `run-${r.id}`),
      ...pitch.qa.flatMap((q) => q.answers.map((a) => a.id)),
    ];
    deleteRecordings(userRecordingIds);
    clearDrafts(userId);
    clearQaDrafts(userId);
    clearAnswers(userId);
    clearMocks(userId);
    clearQuestions(userId);
    clearInterviews(userId);
    clearPitch(userId);
  } else {
    clearDrafts();
    clearQaDrafts();
    clearAnswers();
    clearMocks();
    clearQuestions();
    clearInterviews();
    clearPitch();
    clearRecordings();
    removeDir("voice-cache");
    anonymiseUsage();
    clearFeedback();
  }
}
