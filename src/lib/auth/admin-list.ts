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
/**
 * Who may create an account (HAKKIRI_SIGNUP_ALLOW). Empty: anyone. Otherwise
 * a comma-separated list of addresses and "@domain" entries; only a listed
 * address, or one at a listed domain, may sign up. It decides who can join,
 * not who is an administrator, and people who already have an account are
 * never affected by it.
 */
export function signUpAllowed(email: string): boolean {
  const list = (process.env.HAKKIRI_SIGNUP_ALLOW ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return true;
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf("@");
  if (at < 1) return false;
  return list.includes(address) || list.includes(address.slice(at));
}

/** Told to someone whose address isn't on the list. It doesn't say whether the address has an account. */
export const BY_INVITATION = "Sign-up is by invitation at the moment. If you’ve been invited, use the email address your invitation was sent to.";

export const LEGACY_MASTER_ID = "usr_admin_master";
