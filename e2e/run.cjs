// Runs every end-to-end check against a built app with fresh data, then prints one line per check.
// Usage: npm run build && npm run e2e        (needs: npx playwright install chromium, once)
// Each script also runs on its own: BASE=http://127.0.0.1:3100 node e2e/flow.cjs
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = process.env.PORT || "3179";
const BASE = `http://127.0.0.1:${PORT}`;
const root = path.join(__dirname, "..");
const data = fs.mkdtempSync(path.join(os.tmpdir(), "hakkiri-e2e-"));
const out = path.join(__dirname, "out");
fs.mkdirSync(out, { recursive: true });

const server = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "start", "-p", PORT, "-H", "127.0.0.1"], {
  cwd: root,
  env: { ...process.env, HAKKIRI_DATA_DIR: data, HAKKIRI_MOCK_AI: "1", HAKKIRI_SAVE: undefined },
  stdio: ["ignore", "ignore", "inherit"],
});

async function waitForServer() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`${BASE}/landing`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`The app didn't start on ${BASE}. Run npm run build first.`);
}

function run(script, extraEnv = {}) {
  const log = path.join(out, `${script}.log`);
  const r = spawnSync(process.execPath, [path.join(__dirname, `${script}.cjs`)], { env: { ...process.env, BASE, ...extraEnv }, encoding: "utf8", timeout: 25 * 60 * 1000 });
  fs.writeFileSync(log, (r.stdout || "") + "\n" + (r.stderr || ""));
  const ok = r.status === 0;
  console.log(`${ok ? "pass" : "FAIL"}  ${script}${ok ? "" : `  (see e2e/out/${script}.log)`}`);
  return ok;
}

(async () => {
  let ok = true;
  try {
    await waitForServer();
    // Order matters: stories and pitch expect only the demo data; flow adds an interview; audit clicks everything.
    for (const s of ["stories", "pitch", "flow", "slots", "pay"]) ok = run(s) && ok;
    ok = run("audit", { EXTRA: "/settings,/landing,/present,/privacy,/terms,/story-bank" }) && ok;
    ok = run("a11y-page", {}) && ok;
  } finally {
    server.kill();
    fs.rmSync(data, { recursive: true, force: true });
  }
  console.log(ok ? "\nAll end-to-end checks passed." : "\nSome checks failed.");
  process.exit(ok ? 0 : 1);
})();
