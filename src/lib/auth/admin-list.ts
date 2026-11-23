/**
 * The administrators of a deployment, read from its environment. Kept apart
 * from `admin.ts` so that the account store can use it without pulling in
 * anything that needs a request.
 */

const list = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Email addresses that are administrators once signed in: ADMIN_EMAILS. */
export const adminEmails = () => list(process.env.ADMIN_EMAILS);
/** Account ids that are administrators: ADMIN_USER_IDS. An id cannot be claimed by registering first, so prefer it. */
export const adminUserIds = () => list(process.env.ADMIN_USER_IDS);

/** True for an address that would make its account an administrator. Such an address cannot be registered with a password by whoever gets there first. */
export const isReservedAdminEmail = (email: string) => adminEmails().includes(email.trim().toLowerCase());

/**
 * The id of the old built-in admin account. That account had a password that
 * was written in the source code, so it is never signed in again and never
 * treated as an administrator, even if a record for it is still in a database.
 */
export const LEGACY_MASTER_ID = "usr_admin_master";
