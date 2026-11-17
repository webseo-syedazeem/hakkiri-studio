/**
 * The launch switch. HAKKIRI_LAUNCH=1 in the environment turns the prototype
 * into the version you'd put in front of people:
 *   - the Halden and Q1 roadmap demos are hidden,
 *   - test mode (HAKKIRI_MOCK_AI) is ignored,
 *   - messages written for you as the developer ("add a key to .env.local")
 *     become messages for the person using it,
 *   - costs aren't shown on reports (they're still on the usage page).
 * Safe to import anywhere; the browser gets it through NEXT_PUBLIC_HAKKIRI_LAUNCH.
 */
export function isLaunch(): boolean {
  return (
    process.env.HAKKIRI_LAUNCH === "1" ||
    process.env.NEXT_PUBLIC_HAKKIRI_LAUNCH === "1" ||
    isBeta()
  );
}

/**
 * The beta switch. HAKKIRI_BETA=1 (and NEXT_PUBLIC_HAKKIRI_BETA=1 for the
 * browser) runs the launched app as an open, free beta: anyone can sign up
 * and use it free for BETA.hoursPerTester of practice a month.
 */
export function isBeta(): boolean {
  return (
    process.env.HAKKIRI_BETA === "1" ||
    process.env.NEXT_PUBLIC_HAKKIRI_BETA === "1"
  );
}

export const BETA = {
  /** Free practice per tester per calendar month: full use of the app (10 hours). */
  hoursPerTester: 10,
  /** No daily cap in the default beta config: monthly hours are the primary cap (0 = off). */
  minutesPerDay: 0,
  /** Whole-app spending ceilings while the beta runs. */
  dailyUsd: 25,
  monthlyUsd: 200,
};

/** A developer message in the prototype, a plain one at launch or in production. */
export function devOr(dev: string, user: string): string {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL || isLaunch()) {
    return user;
  }
  return dev;
}

export const SERVICE_PROBLEM =
  "Something went wrong on our side. Try again in a minute, and if it keeps happening, let us know.";
