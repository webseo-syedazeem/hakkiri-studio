/**
 * Admin authorization list for internal tools like the AI Robot Tester
 */

export const ADMIN_EMAILS = [
  "bilaal77@gmail.com",
  "saziaaktar21@gmail.com",
  "faizanrizwan327@gmail.com",
] as const;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const norm = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase() === norm);
}
