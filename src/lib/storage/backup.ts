/**
 * What an admin backup file may hold. The file is downloaded through a
 * browser and kept wherever the administrator puts it, so it never carries
 * anything that would let its holder sign in as somebody: no sign-in sessions,
 * and no password hashes.
 */

/** Collections that are never written to a backup file. */
export const NOT_BACKED_UP = new Set(["sessions"]);

/** One collection's records as they go into the file, or null when the collection is left out altogether. */
export function forBackup(collection: string, docs: Record<string, unknown>[]): Record<string, unknown>[] | null {
  if (NOT_BACKED_UP.has(collection)) return null;
  return docs.map((doc) => {
    const cleaned: Record<string, unknown> = { ...doc };
    if (cleaned._id && typeof cleaned._id !== "string") cleaned._id = String(cleaned._id);
    if ("passwordHash" in cleaned) cleaned.passwordHash = "[not exported]";
    return cleaned;
  });
}
