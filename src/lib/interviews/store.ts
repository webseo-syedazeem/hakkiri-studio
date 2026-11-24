import type { Interview, QuestionGroup } from "@/lib/types";
import { halden, staffNurse, hmrc } from "@/lib/mock-data";
import { adoptOwnerlessQuestions, customQuestions } from "@/lib/questions/store";
import { loadJson, loadJsonAsync, saveJson, saveJsonAsync } from "@/lib/storage/disk";
import { isMongoConfigured, saveToMongo, loadFromMongo, deleteFromMongo } from "@/lib/storage/mongodb";
import { daysBetween } from "@/lib/format";
import { isLaunch } from "@/lib/launch";

/**
 * Interviews (build plan: "Interviews" table): the Halden demo, plus every
 * interview you set up from a company, a job spec and your CV. Saved to the
 * local data folder until the database lands.
 */

export const DEMO_INTERVIEW_ID = halden.id;

const FILE = "interviews.json";

/** The demo interviews stay demos even after you practise on them (practice saves a copy). */
export function isDemoInterview(id: string): boolean {
  return id === DEMO_INTERVIEW_ID || id === staffNurse.id || id === hmrc.id;
}

/**
 * Where a record is kept. An interview someone set up is kept under its own
 * id. A demo interview has the same id for everybody, so each person's copy of
 * it (made when they practise on it or change it) is kept under their account
 * as well: one person's edits and practice never show up for another.
 */
const keyOf = (id: string, userId: string) => (isDemoInterview(id) ? `${id}::${userId}` : id);
/** Records as they were saved, by key. A demo copy with no owner is from before copies were per person: it belonged to everyone at once, so it is not loaded. */
const keyed = (list: Interview[]) => list.filter((i) => i && i.id && !(isDemoInterview(i.id) && !i.userId)).map((i) => [keyOf(i.id, i.userId ?? ""), i] as const);

const g = globalThis as unknown as { __hakkiriInterviews?: Map<string, Interview>; __hakkiriQuestionsAdopted?: boolean };
const store = (g.__hakkiriInterviews ??= new Map<string, Interview>(keyed(loadJson<Interview[]>(FILE, []))));
// Questions added before they carried an owner go to the owner of their interview (see questions/store).
if (!g.__hakkiriQuestionsAdopted) {
  g.__hakkiriQuestionsAdopted = true;
  adoptOwnerlessQuestions((interviewId) => (isDemoInterview(interviewId) ? undefined : store.get(interviewId)?.userId));
}

const persist = () => saveJson(FILE, [...store.values()]);

/** The Halden, Staff Nurse, and HMRC demos, while building. Hidden once launched: real people start with their own. */
const demoBase = (id: string) => {
  if (isLaunch()) return undefined;
  if (id === halden.id) return halden;
  if (id === staffNurse.id) return staffNurse;
  if (id === hmrc.id) return hmrc;
  return undefined;
};

/**
 * The saved record for one person, or nothing. This is the only place that
 * decides whose an interview is, and it fails closed: with no account named,
 * nothing is returned; an interview with no owner, or another person's, is
 * not returned. A demo is the person's own copy if they have one, else the
 * built-in one.
 */
function rawFor(id: string, userId: string): Interview | undefined {
  if (!userId) return undefined;
  if (isDemoInterview(id)) return store.get(keyOf(id, userId)) ?? demoBase(id);
  const raw = store.get(id);
  return raw && raw.userId === userId ? raw : undefined;
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

/** One person's interview with its plan, including any questions they added themselves. */
export function getInterview(id: string, userId: string): Interview | undefined {
  const raw = rawFor(id, userId);
  if (!raw) return undefined;
  const base = withDemoPool(raw);
  const extra = customQuestions(id, userId);
  if (!extra.length) return base;
  const questions = [...base.questions, ...extra];
  const groupCounts: Record<QuestionGroup, number> = { motivation: 0, competency: 0, technical: 0, cv: 0, curveball: 0 };
  for (const q of questions) if (!q.slot && !q.retired && !q.pay) groupCounts[q.group] += 1;
  return { ...base, questions, groupCounts };
}

/** Puts records read from the database into memory, each under its own key. */
function remember(list: unknown) {
  if (Array.isArray(list)) for (const [key, item] of keyed(list as Interview[])) store.set(key, item);
}

export async function getInterviewAsync(id: string, userId: string): Promise<Interview | undefined> {
  if (!userId) return undefined;
  const cached = getInterview(id, userId);
  if (cached && !isDemoInterview(cached.id)) return cached;

  if (isMongoConfigured()) {
    try {
      // 1. Direct document lookup in "interviews" collection
      const direct = await loadFromMongo<Interview>("interviews", keyOf(id, userId));
      if (direct && direct.id) {
        remember([direct]);
        const res = getInterview(id, userId);
        if (res) return res;
      }

      // 2. Fallback to FILE array in storage collection
      remember(await loadJsonAsync<Interview[]>(FILE, []));
      const found = getInterview(id, userId);
      if (found) return found;
    } catch (err) {
      console.warn("[interviews/store] MongoDB load interviews failed:", err);
    }
  }

  return getInterview(id, userId);
}

/**
 * Your interviews first, then the demos. Ones with an upcoming date come
 * first (soonest first), then ones without a date (newest first), then past ones.
 */
export function listInterviews(today: string, userId: string): Interview[] {
  if (!userId) return [];
  const mine = [...store.values()]
    .filter((i) => !isDemoInterview(i.id) && i.userId === userId)
    .map((i) => getInterview(i.id, userId)!)
    .filter(Boolean);
  const rank = (i: Interview) => (!i.date ? 1 : daysBetween(today, i.date) >= 0 ? 0 : 2);
  const sorted = mine.sort((a, b) => rank(a) - rank(b) || (rank(a) === 1 ? (b.createdAt ?? "").localeCompare(a.createdAt ?? "") : (a.date ?? "").localeCompare(b.date ?? "")));
  const demos = [getInterview(staffNurse.id, userId), getInterview(hmrc.id, userId), getInterview(halden.id, userId)].filter((i): i is Interview => Boolean(i));
  return [...sorted, ...demos];
}

export async function listInterviewsAsync(today: string, userId: string): Promise<Interview[]> {
  if (!userId) return [];
  if (isMongoConfigured()) {
    try {
      remember(await loadJsonAsync<Interview[]>(FILE, []));
      for (const demoId of [hmrc.id, staffNurse.id, halden.id]) {
        if (!store.has(keyOf(demoId, userId))) {
          const direct = await loadFromMongo<Interview>("interviews", keyOf(demoId, userId));
          if (direct && direct.id) remember([direct]);
        }
      }
    } catch (err) {
      console.warn("[interviews/store] MongoDB load list failed:", err);
    }
  }
  return listInterviews(today, userId);
}

/**
 * Every interview anyone has set up, as saved, without the demos: for the
 * administrators' list and export only. Callers must have checked for an
 * administrator first (lib/auth/admin).
 */
export async function listEveryInterviewForAdmin(): Promise<Interview[]> {
  if (isMongoConfigured()) {
    try {
      remember(await loadJsonAsync<Interview[]>(FILE, []));
    } catch (err) {
      console.warn("[interviews/store] MongoDB load list failed:", err);
    }
  }
  return [...store.values()].filter((i) => !isDemoInterview(i.id)).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

/** The interview Home leads with: your soonest upcoming one, or the demo until you add your own. */
export function featuredInterview(today: string, userId: string): Interview | undefined {
  return listInterviews(today, userId)[0];
}

/** What is stored: the owner is always set, and questions a person added themselves live in their own store. */
const forSaving = (i: Interview, userId: string): Interview => ({ ...i, userId, questions: i.questions.filter((q) => !q.custom) });

export function saveInterview(i: Interview, userId: string) {
  if (!userId) return;
  store.set(keyOf(i.id, userId), forSaving(i, userId));
  persist();
}

export async function saveInterviewAsync(i: Interview, userId: string) {
  if (!userId) return;
  const toSave = forSaving(i, userId);
  const key = keyOf(i.id, userId);
  store.set(key, toSave);
  if (isMongoConfigured()) {
    try {
      // 1. Direct document persistence in "interviews" collection
      await saveToMongo("interviews", key, toSave);

      // 2. Safe merge into "storage" collection interviews.json
      const merged = new Map<string, Interview>(keyed((await loadJsonAsync<Interview[]>(FILE, [])) ?? []));
      for (const [k, v] of store.entries()) merged.set(k, v);
      merged.set(key, toSave);
      for (const [k, v] of merged.entries()) store.set(k, v);
      await saveJsonAsync(FILE, [...merged.values()]);
      return;
    } catch (err) {
      console.warn("[interviews/store] saveInterviewAsync mongo failed:", err);
    }
  }
  await saveJsonAsync(FILE, [...store.values()]);
}

/** Changes one person's interview (or their copy of a demo) and returns it as getInterview would. */
export function updateInterview(id: string, change: (i: Interview) => Interview, userId: string): Interview | undefined {
  const raw = rawFor(id, userId);
  if (!raw) return undefined;
  const changed = change(withDemoPool(raw));
  saveInterview(changed, userId);
  if (isMongoConfigured()) {
    void saveInterviewAsync(changed, userId);
  }
  return getInterview(id, userId);
}

export async function updateInterviewAsync(
  id: string,
  change: (i: Interview) => Interview,
  userId: string,
): Promise<Interview | undefined> {
  const raw = rawFor(id, userId) ?? (await getInterviewAsync(id, userId));
  if (!raw) return undefined;
  const changed = change(withDemoPool({ ...raw, questions: raw.questions.filter((q) => !q.custom) }));
  await saveInterviewAsync(changed, userId);
  return getInterview(id, userId);
}

/** Every interview one person has set up or practised on (with their copy of a demo if they practised it). With no account named: everything, for the tests and the admin backup only. */
export function allSavedInterviews(userId?: string): Interview[] {
  return userId ? [...store.values()].filter((i) => i.userId === userId) : [...store.values()];
}

/** "Delete all my data". */
export function clearInterviews(userId?: string) {
  const gone: string[] = [];
  if (userId) {
    for (const [key, i] of store.entries()) {
      if (i.userId === userId) {
        store.delete(key);
        gone.push(key);
      }
    }
  } else {
    gone.push(...store.keys());
    store.clear();
  }
  persist();
  // The database keeps each interview as its own document too: those go as well.
  if (isMongoConfigured()) for (const key of gone) void deleteFromMongo("interviews", key);
}

export function deleteInterview(id: string, userId: string): boolean {
  if (!userId) return false;
  const key = keyOf(id, userId);
  const existing = store.get(key);
  if (!existing || existing.userId !== userId) return false;
  store.delete(key);
  persist();
  if (isMongoConfigured()) {
    void deleteFromMongo("interviews", key);
  }
  return true;
}
