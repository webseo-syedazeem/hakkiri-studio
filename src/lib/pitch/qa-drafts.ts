import type { Answer } from "@/lib/types";
import type { Turn } from "@/lib/ai/types";
import type { Recording } from "@/lib/answers/audio";
import type { QaQuestion, QaStyle } from "./types";
import { isMongoConfigured, getMongoDb } from "@/lib/storage/mongodb";

/**
 * A Q&A session in progress: the questions, the answers so far (transcribed,
 * with any press and its reply), and each question's scoring as it runs in
 * the background. Persisted to MongoDB Atlas with in-memory caching to survive
 * serverless restarts. Expires after two hours.
 */
export interface QaDraft {
  id: string;
  presentationId: string;
  style: QaStyle;
  persona: { name: string; title: string };
  questions: QaQuestion[];
  /** turns[k]: the answer to question k, then the press and its reply, if any. */
  turns: Turn[][];
  audio: (Recording | null)[][];
  /** The press waiting for a reply, per question. */
  pending: ({ kind: "challenge" | "clarify"; question: string } | null)[];
  scoring: (Promise<Answer | null> | null)[];
  startedAt: string;
  createdAt: number;
}

const TTL_MS = 2 * 60 * 60 * 1000;
const g = globalThis as unknown as { __hakkiriQaDrafts?: Map<string, QaDraft> };
const drafts = (g.__hakkiriQaDrafts ??= new Map<string, QaDraft>());

function serializeQaDraft(d: QaDraft) {
  return {
    _id: d.id,
    id: d.id,
    presentationId: d.presentationId,
    style: d.style,
    persona: d.persona,
    questions: d.questions,
    turns: d.turns,
    audio: d.audio.map((questionTurns) =>
      questionTurns.map((a) =>
        a
          ? {
              dataBase64: Buffer.from(a.data).toString("base64"),
              type: a.type,
            }
          : null,
      ),
    ),
    pending: d.pending,
    startedAt: d.startedAt,
    createdAt: d.createdAt,
    updatedAt: new Date(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deserializeQaDraft(doc: any): QaDraft {
  return {
    id: doc._id || doc.id,
    presentationId: doc.presentationId,
    style: doc.style,
    persona: doc.persona,
    questions: doc.questions || [],
    turns: doc.turns || [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audio: (doc.audio || []).map((questionTurns: any[]) =>
      (questionTurns || []).map((a: any) => {
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
    ),
    pending: doc.pending || [],
    scoring: [],
    startedAt: doc.startedAt || new Date().toISOString(),
    createdAt: doc.createdAt || Date.now(),
  };
}

export function saveQaDraft(d: QaDraft) {
  const now = Date.now();
  for (const [id, old] of drafts) if (now - old.createdAt > TTL_MS) drafts.delete(id);
  drafts.set(d.id, d);
  if (isMongoConfigured()) {
    void saveQaDraftAsync(d).catch((err) => console.warn("[qa-drafts] mongo save error:", err));
  }
}

export async function saveQaDraftAsync(d: QaDraft): Promise<void> {
  drafts.set(d.id, d);
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.collection("qa_drafts").replaceOne({ _id: d.id as any }, serializeQaDraft(d) as any, { upsert: true });
      }
    } catch (err) {
      console.warn("[qa-drafts] saveQaDraftAsync failed:", err);
    }
  }
}

export function getQaDraft(id: string): QaDraft | undefined {
  const d = drafts.get(id);
  if (d && Date.now() - d.createdAt > TTL_MS) {
    drafts.delete(id);
    return undefined;
  }
  return d;
}

export async function getQaDraftAsync(id: string): Promise<QaDraft | undefined> {
  const mem = getQaDraft(id);
  if (mem) return mem;

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const doc = await db.collection("qa_drafts").findOne({ _id: id as any });
        if (doc) {
          const d = deserializeQaDraft(doc);
          if (Date.now() - d.createdAt <= TTL_MS) {
            drafts.set(d.id, d);
            return d;
          }
        }
      }
    } catch (err) {
      console.warn("[qa-drafts] getQaDraftAsync failed:", err);
    }
  }
  return undefined;
}

export function deleteQaDraft(id: string) {
  drafts.delete(id);
  if (isMongoConfigured()) {
    void deleteQaDraftAsync(id).catch(() => {});
  }
}

export async function deleteQaDraftAsync(id: string): Promise<void> {
  drafts.delete(id);
  if (isMongoConfigured()) {
    try {
      const db = await getMongoDb();
      if (db) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.collection("qa_drafts").deleteOne({ _id: id as any });
      }
    } catch (err) {
      console.warn("[qa-drafts] deleteQaDraftAsync failed:", err);
    }
  }
}

/** "Delete all my data": answers still being scored. */
export function clearQaDrafts() {
  drafts.clear();
}
