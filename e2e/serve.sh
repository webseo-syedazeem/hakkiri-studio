#!/usr/bin/env bash
# Starts the built app for the browser tests on a fresh, throwaway data folder (test mode: no keys, no cost).
# Usage: e2e/serve.sh [port]   then: BASE=http://127.0.0.1:<port> node e2e/<script>.cjs
PORT="${1:-3179}"
DATA="$(mktemp -d)"
pkill -f "next-server" 2>/dev/null; pkill -f "next start" 2>/dev/null; sleep 1
HAKKIRI_DATA_DIR="$DATA" HAKKIRI_MOCK_AI=1 nohup npx next start -p "$PORT" -H 127.0.0.1 > "${TMPDIR:-/tmp}/hakkiri-e2e-server.log" 2>&1 &
for _ in $(seq 1 60); do curl -s -o /dev/null "http://127.0.0.1:$PORT/landing" && break; sleep 0.5; done
echo "serving on http://127.0.0.1:$PORT (data: $DATA)"
