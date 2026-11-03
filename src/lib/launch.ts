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
 * browser) runs the launched app as a closed, free beta: each invited tester
 * gets BETA.hoursPerTester of practice in total, nothing is for sale, and a
 * Feedback button on every screen asks questions about the screen they're on
 * and sends the answers to the alerts webhook or email. Beta implies launch
 * (demos and developer messages hidden). Until accounts land the allowance
 * is per server, so run the beta on the hosted build with sign-in in place.
 */
export function isBeta(): boolean {
  return (
    process.env.HAKKIRI_BETA === "1" ||
    process.env.NEXT_PUBLIC_HAKKIRI_BETA === "1"
  );
}

export const BETA = {
  /** Free practice per invited tester, in total, for the whole beta. */
  hoursPerTester: 5,
  /** A safety net per day so one long session can't burn the lot by accident. */
  minutesPerDay: 120,
};

/** A developer message in the prototype, a plain one at launch. */
export function devOr(dev: string, user: string): string {
  return isLaunch() ? user : dev;
}

export const SERVICE_PROBLEM =
  "Something went wrong on our side. Try again in a minute, and if it keeps happening, let us know.";
