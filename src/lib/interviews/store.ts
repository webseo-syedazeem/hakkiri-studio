import type { Interview, QuestionGroup } from "@/lib/types";
import { halden } from "@/lib/mock-data";
import { customQuestions } from "@/lib/questions/store";
import { loadJson, loadJsonAsync, saveJson, saveJsonAsync } from "@/lib/storage/disk";
import { isMongoConfigured } from "@/lib/storage/mongodb";
import { daysBetween } from "@/lib/format";
import { isLaunch } from "@/lib/launch";

/**
 * Interviews (build plan: "Interviews" table): the Halden demo, plus every
 * interview you set up from a company, a job spec and your CV. Saved to the
 * local data folder until the database lands.
 */

export const DEMO_INTERVIEW_ID = halden.id;

const FILE = "interviews.json";
const g = globalThis as unknown as { __hakkiriInterviews?: Map<string, Interview> };
const store = (g.__hakkiriInterviews ??= new Map<string, Interview>(loadJson<Interview[]>(FILE, []).map((i) => [i.id, i])));

const persist = () => saveJson(FILE, [...store.values()]);

/** The Halden demo, while building. Hidden once launched: real people start with their own. */
const demoBase = (id: string) => (id === halden.id && !isLaunch() ? halden : undefined);

/** The Halden demo stays the demo even after you practise on it (practice saves a copy). */
export function isDemoInterview(id: string): boolean {
  return id === DEMO_INTERVIEW_ID;
}

/** Merges built-in Halden difficulty pools (`easy`/`medium`/`hard`) if an older stored Halden copy lacks them. */
function withDemoPool(base: Interview): Interview {
  if (base.id !== halden.id) return base;
  const builtInById = new Map(halden.questions.map((q) => [q.id, q]));
  const existingIds = new Set(base.questions.map((q) => q.id));
  const merged = base.questions.map((q) => {
    const ref = builtInById.get(q.id);
    return ref?.difficulty && !q.difficulty ? { ...q, difficulty: ref.difficulty } : q;
  });
  for (const q of halden.questions) {
    if (!existingIds.has(q.id)) merged.push(q);
  }
  return merged.length === base.questions.length && merged.every((q, idx) => q === base.questions[idx])
    ? base
    : { ...base, questions: merged };
}

/** An interview with its plan, including any questions you've added yourself. */
export function getInterview(id: string, userId?: string): Interview | undefined {
  const raw = store.get(id) ?? demoBase(id);
  if (!raw) return undefined;
  if (isDemoInterview(raw.id)) {
    // Demo interview is public to all authenticated users
  } else if (userId && raw.userId !== userId) {
    // Strictly require ownership when userId is provided
    return undefined;
  }
  const base = withDemoPool(raw);
  const extra = customQuestions(id);
  if (!extra.length) return base;
  const questions = [...base.questions, ...extra];
  const groupCounts: Record<QuestionGroup, number> = { motivation: 0, competency: 0, technical: 0, cv: 0, curveball: 0 };
  for (const q of questions) if (!q.slot && !q.retired && !q.pay) groupCounts[q.group] += 1;
  return { ...base, questions, groupCounts };
}

export async function getInterviewAsync(id: string, userId?: string): Promise<Interview | undefined> {
  const cached = getInterview(id, userId);
  if (cached && !isDemoInterview(cached.id)) return cached;

  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<Interview[]>(FILE, []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          store.set(item.id, item);
        }
        const found = getInterview(id, userId);
        if (found) return found;
      }
    } catch (err) {
      console.warn("[interviews/store] MongoDB load interviews failed:", err);
    }
  }

  return getInterview(id, userId);
}

/**
 * Your interviews first, then the demo. Ones with an upcoming date come
 * first (soonest first), then ones without a date (newest first), then past ones.
 */
export function listInterviews(today: string, userId?: string): Interview[] {
  const mine = [...store.values()]
    .filter((i) => !isDemoInterview(i.id) && (!userId || i.userId === userId))
    .map((i) => getInterview(i.id, userId)!)
    .filter(Boolean);
  const rank = (i: Interview) => (!i.date ? 1 : daysBetween(today, i.date) >= 0 ? 0 : 2);
  const sorted = mine.sort((a, b) => rank(a) - rank(b) || (rank(a) === 1 ? (b.createdAt ?? "").localeCompare(a.createdAt ?? "") : (a.date ?? "").localeCompare(b.date ?? "")));
  const demo = getInterview(halden.id);
  return demo ? [...sorted, demo] : sorted;
}

export async function listInterviewsAsync(today: string, userId?: string): Promise<Interview[]> {
  if (isMongoConfigured()) {
    try {
      const fromDb = await loadJsonAsync<Interview[]>(FILE, []);
      if (Array.isArray(fromDb)) {
        for (const item of fromDb) {
          store.set(item.id, item);
        }
      }
    } catch (err) {
      console.warn("[interviews/store] MongoDB load list failed:", err);
    }
  }
  return listInterviews(today, userId);
}

/** The interview Home leads with: your soonest upcoming one, or the demo until you add your own. */
export function featuredInterview(today: string, userId?: string): Interview | undefined {
  return listInterviews(today, userId)[0];
}

export function saveInterview(i: Interview, userId?: string) {
  // Questions you add yourself live in their own store.
  const toSave = {
    ...i,
    userId: userId || i.userId,
    questions: i.questions.filter((q) => !q.custom),
  };
  store.set(i.id, toSave);
  persist();
}

export async function saveInterviewAsync(i: Interview, userId?: string) {
  const toSave = {
    ...i,
    userId: userId || i.userId,
    questions: i.questions.filter((q) => !q.custom),
  };
  store.set(i.id, toSave);
  await saveJsonAsync(FILE, [...store.values()]);
}

/** Changes a saved interview (or the demo) and returns it as getInterview would. */
export function updateInterview(id: string, change: (i: Interview) => Interview, userId?: string): Interview | undefined {
  const raw = store.get(id) ?? demoBase(id);
  if (!raw) return undefined;
  if (!isDemoInterview(raw.id) && (userId && raw.userId !== userId)) return undefined;
  saveInterview(change(withDemoPool(raw)), userId || raw.userId);
  return getInterview(id, userId);
}

/** Every interview you've set up or practised on (with the demo's saved copy if you practised it). */
export function allSavedInterviews(userId?: string): Interview[] {
  return userId ? [...store.values()].filter((i) => i.userId === userId) : [...store.values()];
}

/** "Delete all my data". */
export function clearInterviews(userId?: string) {
  if (userId) {
    for (const [id, i] of store.entries()) {
      if (i.userId === userId) store.delete(id);
    }
  } else {
    store.clear();
  }
  persist();
}

export function deleteInterview(id: string, userId?: string): boolean {
  const existing = store.get(id);
  if (!existing) return false;
  if (userId && existing.userId !== userId) return false;
  const had = store.delete(id);
  if (had) persist();
  return had;
}
