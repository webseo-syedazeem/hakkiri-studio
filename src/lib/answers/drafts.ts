import type { FollowUpKind, InterviewerStyle } from "@/lib/types";
import type { Turn } from "@/lib/ai/types";
import type { Recording } from "./audio";
import { isMongoConfigured, getMongoDb } from "@/lib/storage/mongodb";

/**
 * An answer in progress: the main answer plus any follow-ups so far,
 * transcribed but not yet scored. Scoring happens once the interviewer
 * moves on, so the feedback covers the whole exchange.
 * Persisted to MongoDB Atlas with in-memory caching to survive serverless restarts.
 * Drafts expire after two hours.
 */
export interface Draft {
  id: string;
  userId?: string;
  interviewId: string;
  questionId: string;
  questionNumber: number;
  questionsInMock: number;
  followUpsOn: boolean;
  followUpLimit?: number;
  sessionId?: string;
  style: InterviewerStyle;
  turns: Turn[];
  audio: (Recording | null)[];
  pending: { kind: FollowUpKind; question: string } | null;
  createdAt: number;
}

const TTL_MS = 2 * 60 * 60 * 1000;
const g = globalThis as unknown as { __hakkiriDrafts?: Map<string, Draft> };
const drafts = (g.__hakkiriDrafts ??= new Map<string, Draft>());

function serializeDraft(d: Draft) {
  return {
    _id: d.id,
    id: d.id,
    userId: d.userId,
    interviewId: d.interviewId,
    questionId: d.questionId,
    questionNumber: d.questionNumber,
    questionsInMock: d.questionsInMock,
    followUpsOn: d.followUpsOn,
    followUpLimit: d.followUpLimit,
    sessionId: d.sessionId,
    style: d.style,
    turns: d.turns,
    audio: d.audio.map((a) =>
      a
        ? {
            dataBase64: Buffer.from(a.data).toString("base64"),
            type: a.type,
          }
        : null,
    ),
    pending: d.pending,
    createdAt: d.createdAt,
    updatedAt: new Date(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializeDraft(doc: any): Draft {
  return {
    id: doc._id || doc.id,
    userId: doc.userId,
    interviewId: doc.interviewId,
    questionId: doc.questionId,
    questionNumber: doc.questionNumber,
    questionsInMock: doc.questionsInMock,
    followUpsOn: Boolean(doc.followUpsOn),
    followUpLimit: doc.followUpLimit,
    sessionId: doc.sessionId,
    style: doc.style,
    turns: doc.turns || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audio: (doc.audio || []).map((a: any) => {
      if (!a) return null;
      if (a.data) return { data: a.data, type: a.type };
      if (a.dataBase64) {
        const buf = Buffer.from(a.dataBase64, "base64");
        return {
          data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
          type: a.type || "audio/webm",
        };
      }
      return null;
    }),
    pending: doc.pending || null,
    createdAt: doc.createdAt || Date.now(),
  };
}

export function saveDraft(d: Draft) {
  const now = Date.now();
  for (const [id, old] of drafts) if (now - old.createdAt > TTL_MS) drafts.delete(id);
  drafts.set(d.id, d);
  if (isMongoConfigured()) {
    void saveDraftAsync(d).catch((err) => console.warn("[drafts] mongo save error:", err));
  }
}

export async function saveDraftAsync(d: Draft): Promise<void> {
  drafts.set(d.id, d);
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.collection("drafts").replaceOne({ _id: d.id as any }, serializeDraft(d) as any, { upsert: true });
      }
    } catch (err) {
      console.warn("[drafts] saveDraftAsync failed:", err);
    }
  }
}

export function getDraft(id: string): Draft | undefined {
  const d = drafts.get(id);
  if (d && Date.now() - d.createdAt > TTL_MS) {
    drafts.delete(id);
    return undefined;
  }
  return d;
}

export async function getDraftAsync(id: string): Promise<Draft | undefined> {
  const mem = getDraft(id);
  if (mem) return mem;

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = await db.collection("drafts").findOne({ _id: id as any });
        if (doc) {
          const d = deserializeDraft(doc);
          if (Date.now() - d.createdAt <= TTL_MS) {
            drafts.set(d.id, d);
            return d;
          }
        }
      }
    } catch (err) {
      console.warn("[drafts] getDraftAsync failed:", err);
    }
  }
  return undefined;
}

export function deleteDraft(id: string) {
  drafts.delete(id);
  if (isMongoConfigured()) {
    void deleteDraftAsync(id).catch(() => {});
  }
}

export async function deleteDraftAsync(id: string): Promise<void> {
  drafts.delete(id);
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.collection("drafts").deleteOne({ _id: id as any });
      }
    } catch (err) {
      console.warn("[drafts] deleteDraftAsync failed:", err);
    }
  }
}

/** "Delete all my data": answers still being scored. */
export function clearDrafts(userId?: string) {
  if (userId) {
    for (const [id, d] of drafts) {
      if (d.userId === userId) drafts.delete(id);
    }
  } else {
    drafts.clear();
  }
}
