/**
 * Errors in the browser (a screen that crashed, a promise nobody caught) are
 * sent to /api/client-error so they reach the alerts. At most 5 a page, and
 * only the message, where, and the first lines of the stack.
 */
let sent = 0;
function send(message: string, stack?: string) {
  if (sent >= 5 || !message) return;
  sent += 1;
  const body = JSON.stringify({ message: message.slice(0, 400), stack: stack?.slice(0, 1500), path: location.pathname, agent: navigator.userAgent.slice(0, 160) });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/client-error", new Blob([body], { type: "application/json" }));
    else void fetch("/api/client-error", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
  } catch {
    // reporting must never break the page
  }
}

window.addEventListener("error", (e) => {
  // Ignore failed images and scripts from browser extensions.
  if (!e.error && !e.message) return;
  if (e.filename && !e.filename.startsWith(location.origin)) return;
  send(e.message || String(e.error), e.error instanceof Error ? e.error.stack : undefined);
});
window.addEventListener("unhandledrejection", (e) => {
  const r = e.reason;
  if (r instanceof DOMException && r.name === "AbortError") return; // a cancelled request, on purpose
  send(r instanceof Error ? r.message : String(r), r instanceof Error ? r.stack : undefined);
});
