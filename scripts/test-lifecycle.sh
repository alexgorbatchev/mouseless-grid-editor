#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
just --justfile ./justfile setup
just --justfile ./justfile setup
set -m
mkdir -p .tmp
port=$((49152 + RANDOM % 16000))
log=$(mktemp .tmp/lifecycle.XXXXXX)
pid=""
cleanup() {
    if [[ -n "$pid" ]]; then kill -- "-$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; fi
    rm -f "$log"
}
trap cleanup EXIT
if curl --silent --max-time 1 "http://127.0.0.1:$port/" >/dev/null; then echo "Port $port is occupied" >&2; exit 1; fi
PORT="$port" just --justfile ./justfile run >"$log" 2>&1 &
pid=$!
for attempt in {1..100}; do
    if curl --fail --silent --max-time 1 "http://127.0.0.1:$port/" >/dev/null; then exit 0; fi
    if ! kill -0 "$pid" 2>/dev/null; then cat "$log" >&2; exit 1; fi
    sleep 0.2
done
cat "$log" >&2
exit 1
