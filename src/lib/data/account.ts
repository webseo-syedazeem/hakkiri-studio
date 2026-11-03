import "server-only";
import JSZip from "jszip";
import { allSavedInterviews, clearInterviews } from "@/lib/interviews/store";
import { allAnswers, clearAnswers } from "@/lib/answers/store";
import { allRecordings, clearRecordings, getRecording, recordingCount } from "@/lib/answers/audio";
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

export function dataCounts(): DataCounts {
  const pitch = allPitchData();
  return {
    interviews: allSavedInterviews().length,
    sessions: allMocks().length,
    answers: allAnswers().length,
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

/** A zip of everything: data.json, a README, and the recordings. */
export async function exportAll(): Promise<Uint8Array> {
  const zip = new JSZip();
  const pitch = allPitchData();
  const data = {
    exportedAt: new Date().toISOString(),
    interviews: allSavedInterviews(),
    questions: allCustomQuestions(),
    sessions: allMocks(),
    answers: allAnswers(),
    presentations: pitch.presentations,
    rehearsals: pitch.runs,
    audienceQa: pitch.qa,
    usage: allUsage(),
    settings: getSettings(),
  };
  zip.file("data.json", JSON.stringify(data, null, 2));
  zip.file("README.txt", README);
  for (const r of allRecordings()) {
    const rec = getRecording(r.answerId, r.turn);
    if (rec) zip.file(r.file, rec.data);
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
export function deleteAll() {
  clearDrafts();
  clearQaDrafts();
  clearRecordings();
  clearAnswers();
  clearMocks();
  clearQuestions();
  clearInterviews();
  clearPitch();
  removeDir("voice-cache");
  anonymiseUsage();
  clearFeedback();
}
