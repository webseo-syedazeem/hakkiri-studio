import "server-only";
import JSZip from "jszip";
import { allSavedInterviews, clearInterviews } from "@/lib/interviews/store";
import { allAnswers, clearAnswers } from "@/lib/answers/store";
import { allRecordings, clearRecordings, deleteRecordings, getRecordingAsync, pruneRecordings, recordingCount } from "@/lib/answers/audio";
import { clearDrafts, clearDraftsAsync, draftsOf } from "@/lib/answers/drafts";
import { allMocks, clearMocks } from "@/lib/mocks/store";
import { allCustomQuestions, clearQuestions } from "@/lib/questions/store";
import { allPitchData, clearPitch, loadSlideImageAsync } from "@/lib/pitch/store";
import { clearQaDrafts } from "@/lib/pitch/qa-drafts";
import { allUsage, anonymiseUsage, disownUsage } from "@/lib/usage/store";
import { clearSettings, getSettings, savedSettings } from "@/lib/settings/store";
import { flushStorage, removeDir } from "@/lib/storage/disk";
import { deleteManyFromMongo } from "@/lib/storage/mongodb";
import { clearFeedback, feedbackOf } from "@/lib/feedback/store";
import { clearSurveys, surveysOf } from "@/lib/feedback/survey-store";
import { deleteApplyData, exportApplyData } from "@/lib/apply/db";
import { deleteCvData, exportCvData } from "@/lib/cv/store";
import { accountOf, deleteUser } from "@/lib/auth/user-db";

/**
 * "Your data" in Settings: what Hakkiri holds about you, a copy of all of it,
 * deleting all of it, and deleting the account itself (UK GDPR rights of
 * access and erasure). Everything here is for one named account: one person's
 * download never holds another's rows, and one person's delete never touches
 * another's.
 */

export interface DataCounts {
  interviews: number;
  sessions: number;
  answers: number;
  recordings: number;
  presentations: number;
  rehearsals: number;
}

/**
 * The ids a person's recordings are kept under: each of their answers, each
 * rehearsal run ("run-…") and each answer in an audience Q&A.
 */
function recordingIdsOf(userId: string): Set<string> {
  const pitch = allPitchData(userId);
  return new Set([...allAnswers(userId).map((a) => a.id), ...pitch.runs.map((r) => `run-${r.id}`), ...pitch.qa.flatMap((q) => q.answers.map((a) => a.id))]);
}

/** Whether a recording (by the id it is kept under) is this person's own. */
export function ownsRecording(userId: string, recordingId: string): boolean {
  return !!userId && recordingIdsOf(userId).has(recordingId);
}

/** Whose each recording is, across every account: for applying each person's own "keep recordings for" choice. */
function recordingOwners(): Map<string, string> {
  const owners = new Map<string, string>();
  for (const a of allAnswers()) if (a.userId) owners.set(a.id, a.userId);
  const pitch = allPitchData();
  for (const r of pitch.runs) if (r.userId) owners.set(`run-${r.id}`, r.userId);
  for (const q of pitch.qa) if (q.userId) for (const a of q.answers) owners.set(a.id, q.userId);
  return owners;
}

/** What one person has in the app. Recordings are counted from their own answers, not everyone's. */
export function dataCounts(userId?: string): DataCounts {
  const pitch = allPitchData(userId);
  return {
    interviews: allSavedInterviews(userId).length,
    sessions: allMocks(userId).length,
    answers: allAnswers(userId).length,
    recordings: userId ? recordingCount(recordingIdsOf(userId)) : recordingCount(),
    presentations: pitch.presentations.length,
    rehearsals: pitch.runs.length + pitch.qa.length,
  };
}

export const hasData = (c: DataCounts) => Object.values(c).some((n) => n > 0);

/**
 * Deletes recordings older than their owner chose to keep them (Settings,
 * "Keep recordings for"): each person's own choice, applied to their own
 * recordings. A recording that can't be tied to an account is kept for the
 * default 90 days. With `userId`, only that person's are looked at (straight
 * after they change the setting). Runs at most hourly unless forced.
 */
export function pruneOldRecordings(opts: { force?: boolean; now?: number; userId?: string } = {}): number {
  const owners = recordingOwners();
  return pruneRecordings({
    force: opts.force,
    now: opts.now,
    daysFor: (answerId, saidOwner) => {
      const owner = saidOwner ?? owners.get(answerId);
      if (opts.userId && owner !== opts.userId) return 0;
      return getSettings(owner).retentionDays;
    },
  });
}

const README = `Your Hakkiri data
=================

data.json holds what Hakkiri keeps about you on its servers:
  account         your email address, name, when you joined and how you sign in
                  (never your password: only a scrambled form of it is kept,
                  and that is not included here)
  interviews      each interview you set up: company, role, the job spec and
                  CV text you gave, what Hakkiri understood, and its questions
  questions       questions you added yourself
  sessions        each practice interview, re-run and drill, with its scores
  answers         each answer: the transcript, scores and feedback
  inProgress      answers you had started and not finished when you downloaded
  presentations   presentations, rehearsal runs and audience Q&A
  usage           when Hakkiri called an AI service for you, and roughly what it cost
  settings        the settings you have changed (empty if you changed none)
  feedback        notes you sent with the Feedback button while signed in
  survey          your answers to the beta survey, and the address you gave for the voucher

apply.json holds what the "Apply" pages keep: your profile, writing voice,
evidence, saved jobs, applications, drafts and settings, and any free CV
check you unlocked with your email address. It is only here if there is any.

cvs.json holds your CVs and, for each CV you uploaded, the text that was
read from the file (the file itself is never kept).

recordings/ holds the audio of your answers that is still kept
(see "Keep recordings for" in Settings).

slides/ holds the pictures of your slides, where a presentation had them.

Not in this download, because Hakkiri's servers don't hold it: the examples
in your Experience Library, your archived interviews and any set-up draft
are kept only in the browser you made them in.
`;

/** A zip of everything held for one person: data.json, a README, their CVs, their Apply data and their recordings. */
export async function exportAll(userId?: string): Promise<Uint8Array> {
  const zip = new JSZip();
  const pitch = allPitchData(userId);
  const account = userId ? await accountOf(userId) : null;
  const sessions = allMocks(userId);
  const data = {
    exportedAt: new Date().toISOString(),
    ...(userId ? { account } : {}),
    interviews: allSavedInterviews(userId),
    questions: allCustomQuestions(userId),
    sessions,
    answers: allAnswers(userId),
    inProgress: userId ? draftsOf(userId) : [],
    presentations: pitch.presentations,
    rehearsals: pitch.runs,
    audienceQa: pitch.qa,
    usage: allUsage(userId),
    settings: userId ? savedSettings(userId) : getSettings(),
    feedback: userId ? feedbackOf(userId) : [],
    survey: userId ? surveysOf({ userId, email: account?.email, sessionIds: sessions.map((s) => s.id) }) : [],
  };
  zip.file("data.json", JSON.stringify(data, null, 2));
  zip.file("README.txt", README);
  if (userId) {
    // CVs and the text of uploaded CVs (the CV section keeps its records in its own store).
    zip.file("cvs.json", JSON.stringify(await exportCvData(userId), null, 2));
    const apply = await exportApplyData(userId, account?.email);
    if (Object.values(apply).some((rows) => rows.length)) zip.file("apply.json", JSON.stringify(apply, null, 2));
  }
  // The audio of the person's own answers, rehearsals and Q&A: nobody else's.
  for (const r of allRecordings(userId ? recordingIdsOf(userId) : undefined)) {
    const rec = await getRecordingAsync(r.answerId, r.turn);
    if (rec) zip.file(r.file, rec.data);
  }
  // Pictures of your slides, where a presentation had them.
  for (const p of pitch.presentations) {
    for (const s of p.slides) {
      const img = s.image?.file ? await loadSlideImageAsync(p.id, s.image.file) : null;
      if (img) zip.file(`slides/${p.id}/${s.image!.file}`, img);
    }
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

/**
 * Deletes what the stores in this process hold for one person: interviews,
 * answers and their recordings, sessions, added questions, answers in
 * progress, presentations, their settings and the notes they sent. Their
 * usage rows lose every link to what they practised (see anonymiseUsage).
 *
 * This is the part that can be done at once. "Delete all my data" calls
 * `deleteEverything`, which does this and then the rest: the Apply area, CVs,
 * the survey, and the database's own copies.
 *
 * With no account named it empties every store (the tests use it to start clean).
 */
export function deleteAll(userId?: string) {
  if (userId) {
    deleteRecordings(recordingIdsOf(userId));
    clearDrafts(userId);
    clearQaDrafts(userId);
    clearAnswers(userId);
    clearMocks(userId);
    clearQuestions(userId);
    clearInterviews(userId);
    clearPitch(userId);
    clearSettings(userId);
    clearFeedback(userId);
    anonymiseUsage(userId);
  } else {
    clearDrafts();
    clearQaDrafts();
    clearAnswers();
    clearMocks();
    clearQuestions();
    clearInterviews();
    clearPitch();
    clearRecordings();
    clearSettings();
    removeDir("voice-cache");
    anonymiseUsage();
    clearFeedback();
    void clearSurveys();
  }
}

export interface Deleted {
  /** Rows removed from the Apply area and the free CV check. */
  apply: number;
  /** CVs and uploads removed. */
  cvs: number;
  /** Survey answers removed. */
  surveys: number;
  /** Documents removed from the database's own collections (0 without a database). */
  database: number;
}

/**
 * "Delete all my data": everything held for the person, in this process, on
 * disk and in the database, and nothing of anyone else's. It returns only
 * when the database has been written, so a reload straight afterwards cannot
 * bring anything back. The account stays, so they can carry on.
 *
 * What is deliberately left: their usage rows, as bare counts (see
 * anonymiseUsage), and the note on their account that it has claimed the
 * survey voucher. Both are told to the person on the Settings screen.
 */
export async function deleteEverything(userId: string): Promise<Deleted> {
  if (!userId) return { apply: 0, cvs: 0, surveys: 0, database: 0 };
  const account = await accountOf(userId);
  const sessionIds = allMocks(userId).map((s) => s.id);

  deleteAll(userId);
  const surveys = await clearSurveys({ userId, email: account?.email, sessionIds });
  const apply = await deleteApplyData(userId, account?.email);
  const cvs = await deleteCvData(userId);

  // The database also keeps these as documents of their own (and an answer in progress holds its audio):
  // they go by owner, whatever this process happened to have in memory.
  let database = await clearDraftsAsync(userId);
  database += await deleteManyFromMongo("qa_drafts", { userId });
  for (const collection of ["interviews", "answers", "mocks"]) database += await deleteManyFromMongo(collection, { "data.userId": userId });

  await flushStorage();
  return { apply, cvs, surveys, database };
}

/**
 * "Delete my account": everything above, then the account record and every
 * session of it. Afterwards nothing on the servers says this person was here:
 * the usage counts that the bill is worked out from stay, but no longer say
 * whose they were.
 */
export async function deleteAccount(userId: string): Promise<Deleted & { account: boolean }> {
  const deleted = await deleteEverything(userId);
  disownUsage(userId);
  const account = await deleteUser(userId);
  await flushStorage();
  return { ...deleted, account };
}
