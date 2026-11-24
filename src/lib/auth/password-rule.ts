/**
 * The password rule, in one place: the sign-up form states it and the server
 * enforces it. Long beats complicated, so there is a minimum length and a
 * refusal of the passwords everyone tries first, and no "one capital, one
 * symbol" rule.
 */
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/** Shown under the password field when creating an account. */
export const PASSWORD_RULE = `At least ${PASSWORD_MIN} characters. Not a common password, and not your email address.`;

/** The ones an attacker tries first (eight characters or more: shorter ones already fail). */
const COMMON = new Set([
  "password", "password1", "password12", "password123", "password1234", "passw0rd", "p@ssw0rd", "p@ssword",
  "12345678", "123456789", "1234567890", "87654321", "11111111", "00000000", "12341234", "11223344",
  "qwertyui", "qwertyuiop", "qwerty123", "qwerty1234", "asdfghjk", "asdfghjkl", "1q2w3e4r", "1q2w3e4r5t", "1qaz2wsx", "zaq12wsx", "qazwsxedc",
  "iloveyou", "sunshine", "princess", "football", "baseball", "superman", "starwars", "computer", "whatever", "trustno1",
  "abc12345", "abcd1234", "abcdefgh", "letmein1", "letmein123", "welcome1", "welcome123", "admin123", "admin1234", "administrator",
  "changeme", "changeme123", "test1234", "testtest", "hello123", "monkey123", "dragon123", "master123", "michael1",
  "hakkiri1", "hakkiri123", "interview", "interview1", "interview123",
]);

/** What is wrong with a password, in words for the person, or null when it will do. */
export function passwordProblem(password: unknown, email = ""): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN) return `Use a password of at least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX) return `Use a password of at most ${PASSWORD_MAX} characters.`;
  const lower = password.toLowerCase();
  if (!password.trim() || new Set(lower).size < 3) return "That password is too easy to guess. Choose a different one.";
  if (COMMON.has(lower)) return "That is one of the most common passwords, so it is the first one anyone would try. Choose a different one.";
  const address = email.trim().toLowerCase();
  if (address && (lower === address || lower === address.split("@")[0])) return "Don’t use your email address as your password.";
  return null;
}
