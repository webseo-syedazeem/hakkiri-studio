import "server-only";
import { APPLY_COLLECTIONS, deleteDoc, getDoc, queryDocs, queryDocsByUser, saveDoc } from "@/lib/apply/db";
import type { Audit } from "@/lib/apply/schema";
import { type PublicAudit, auditText } from "./audit";

/**
 * Where the free public check is kept. A check is made by someone with no
 * account, so everything about it is held to rules written here: what its id
 * looks like, how long it is kept, exactly which fields are stored and which
 * are ever sent back.
 */

/** An id made here: "aud_" and letters, digits, "-" or "_". Anything else ("__proto__", "constructor") is not looked up at all. */
export const CHECK_ID = /^aud_[A-Za-z0-9_-]{8,40}$/;
export const isCheckId = (id: unknown): id is string => typeof id === "string" && CHECK_ID.test(id);

/** How long a check is kept. After this it is removed, and is treated as gone from the moment it passes. */
export const CHECK_DAYS = 30;
export const MAX_CHECK_TEXT = 25_000;
export const MAX_JOB_TEXT = 5_000;
/** Unlock requests one address may make in a minute. A person makes one. */
export const UNLOCKS_A_MINUTE = 10;
/** The most a request to the check may hold: the text, the advert and the JSON around them. */
export const MAX_CHECK_BYTES = 250_000;

const expired = (a: Pick<Audit, "expiresAt">, now: Date) => !a.expiresAt || Number.isNaN(Date.parse(a.expiresAt)) || Date.parse(a.expiresAt) <= now.getTime();

/** A stored check. Null when the id is not one of ours, there is no such check, or it has passed its date (it is then removed). */
export async function getCheck(id: string, now = new Date()): Promise<Audit | null> {
  if (!isCheckId(id)) return null;
  const audit = await getDoc<Audit>(APPLY_COLLECTIONS.AUDITS, id);
  // Only a record that says it is this check: never something else that happened to be reachable by the name.
  if (!audit || audit.id !== id || !Array.isArray(audit.findings)) return null;
  if (expired(audit, now)) {
    await deleteDoc(APPLY_COLLECTIONS.AUDITS, id);
    return null;
  }
  return audit;
}

/** Exactly what is stored for a check: these fields, each within its limit, and nothing else that was sent. */
export function checkRecord(input: { id: string; text: string; jobText?: string; region: "uk" | "us"; docType: Audit["docType"]; textHash: string; userId?: string }, result: PublicAudit, now: Date): Audit {
  return {
    id: input.id,
    docType: input.docType,
    textHash: input.textHash,
    text: input.text.slice(0, MAX_CHECK_TEXT),
    jobText: input.jobText ? input.jobText.slice(0, MAX_JOB_TEXT) : undefined,
    score: result.score,
    subscores: result.subscores,
    findings: result.findings,
    teaser: result.teaser,
    interviewerQuestions: result.interviewerQuestions,
    userId: input.userId,
    region: input.region,
    expiresAt: new Date(now.getTime() + CHECK_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    modelVersion: "cv-score",
    rubricVersion: "2026.3",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export const saveCheck = (audit: Audit) => saveDoc<Audit>(APPLY_COLLECTIONS.AUDITS, audit.id, audit);

const swept = globalThis as unknown as { __hakkiriCheckSweep?: number };

/**
 * Removes every check that has passed its date. Run when a new check is made,
 * at most once an hour, so old text does not sit in the store waiting to be
 * asked for. Returns how many were removed.
 */
export async function purgeExpiredChecks(now = new Date(), force = false): Promise<number> {
  if (!force && swept.__hakkiriCheckSweep && now.getTime() - swept.__hakkiriCheckSweep < 60 * 60 * 1000) return 0;
  swept.__hakkiriCheckSweep = now.getTime();
  const old = await queryDocs<Audit>(APPLY_COLLECTIONS.AUDITS, (a) => expired(a, now));
  for (const a of old) if (a.id) await deleteDoc(APPLY_COLLECTIONS.AUDITS, a.id);
  return old.length;
}

/** The checks a signed-in person made or opened: for "Download my data" and "Delete all my data". */
export async function listOwnChecks(userId: string): Promise<Audit[]> {
  if (!userId) return [];
  return (await queryDocsByUser<Audit>(APPLY_COLLECTIONS.AUDITS, userId)).filter((a) => a.userId === userId && isCheckId(a.id));
}

export async function deleteOwnChecks(userId: string): Promise<number> {
  const mine = await listOwnChecks(userId);
  for (const a of mine) await deleteDoc(APPLY_COLLECTIONS.AUDITS, a.id);
  return mine.length;
}

const GROUP_WORDS: Record<string, string> = { evidence: "evidence", clarity: "clarity", structure: "structure", software: "how software reads it" };

/**
 * One or two sentences about this check, made from its own results: how much
 * there was to judge, how many things were found, and which part scored
 * lowest. Nothing here is a stock line: each figure is counted from the check.
 */
export function summaryOf(result: Pick<PublicAudit, "findings" | "isGoodEnough" | "subscores" | "detail">, word = "CV"): string {
  const { detail } = result;
  if (detail.thin) {
    const have = detail.thin.have === 0 ? "no lines" : detail.thin.have === 1 ? "1 line" : `${detail.thin.have} lines`;
    return `There is not much here to score yet: ${have} saying what you did, where a ${word} needs at least ${detail.thin.need}. Add what you did in each role and check it again.`;
  }
  const high = result.findings.filter((f) => f.severity === "high").length;
  const rest = result.findings.length - high;
  const count = [high ? `${high} ${high === 1 ? "issue" : "issues"}` : "", rest ? `${rest} ${rest === 1 ? "suggestion" : "suggestions"}` : ""].filter(Boolean).join(" and ");
  if (result.isGoodEnough) return `This ${word} is good enough to apply with.${count ? ` The check still found ${count}, none of which need hold you up.` : ""}`;
  const lowest = (Object.entries(result.subscores) as [string, number][]).filter(([k]) => k in GROUP_WORDS).sort((a, b) => a[1] - b[1])[0];
  const missing = detail.missing.length ? ` It still needs ${detail.missing.join("; ")}.` : "";
  return `${count ? `The check found ${count}.` : "The check found nothing to fix in the text."}${lowest ? ` The part that scored lowest is ${GROUP_WORDS[lowest[0]]}, at ${lowest[1]}%.` : ""}${missing}`;
}

/**
 * What is sent back for a check that has been unlocked. The pasted text, its
 * hash and who unlocked it are not part of it: a link to a report is not a
 * link to someone's CV.
 */
export function unlockedView(audit: Audit, now = new Date()) {
  // The words about the score are worked out again from the text, by the same code, so they always match the numbers.
  let live: PublicAudit | null = null;
  try {
    live = auditText(audit.text, audit.region === "us" ? "us" : "uk", now);
  } catch {
    live = null;
  }
  return {
    id: audit.id,
    score: audit.score,
    subscores: audit.subscores,
    findings: audit.findings,
    teaser: audit.teaser,
    interviewerQuestions: audit.interviewerQuestions,
    region: audit.region,
    createdAt: audit.createdAt,
    expiresAt: audit.expiresAt,
    isUnlocked: true as const,
    isGoodEnough: live ? live.isGoodEnough && live.score === audit.score : false,
    summary: live ? summaryOf(live, audit.region === "us" ? "resume" : "CV") : "",
  };
}
