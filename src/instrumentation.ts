/**
 * Server errors anywhere in the app (pages, API routes, the proxy) are
 * recorded and alerted on. See src/lib/alerts/store.ts.
 */
/** On server start: prune recordings past their retention, then every six hours. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { pruneRecordings } = await import("@/lib/answers/audio");
  const run = () => {
    try {
      pruneRecordings({ force: true });
    } catch (err) {
      console.warn("[retention]", err instanceof Error ? err.message : err);
    }
  };
  run();
  setInterval(run, 6 * 60 * 60 * 1000).unref();
}

export async function onRequestError(err: unknown, request: { path: string; method: string }, context: { routePath: string; routeType: string }) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { reportProblem } = await import("@/lib/alerts/store");
  const message = err instanceof Error ? err.message : String(err);
  const digest = typeof err === "object" && err !== null && "digest" in err ? ` (digest ${String((err as { digest: unknown }).digest)})` : "";
  await reportProblem({
    source: "server",
    where: `${request.method} ${context.routePath || request.path.split("?")[0]} [${context.routeType}]`,
    message: message + digest,
    stack: err instanceof Error ? err.stack : undefined,
  });
}
