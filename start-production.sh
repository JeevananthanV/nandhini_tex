#!/usr/bin/env bash
# ============================================================================
# start-production.sh — Boot the Nandhini Tex standalone production server
# ============================================================================
# Usage:
#   ./start-production.sh          # foreground (blocks)
#   ./start-production.sh --bg     # background (nohup + disown)
#
# Prerequisites:
#   1. .env file exists with ADMIN_PASSWORD + ADMIN_SESSION_SECRET set
#   2. Database seeded: bun run db:push && bun run db:seed-full
#   3. Build completed: bun run build
#
# The standalone server is emitted to .next/standalone/ by `bun run build`.
# It includes everything needed to run — no node_modules required at runtime.
# ============================================================================
set -euo pipefail

PROJECT_DIR="/home/z/my-project"
cd "$PROJECT_DIR"

# ---- Pre-flight checks ----
if [ ! -f ".env" ]; then
  echo "ERROR: .env file not found. Copy .env.production to .env and fill in real values."
  exit 1
fi

# Source env vars
set -a
source .env
set +a

# Verify required secrets are set (not placeholders)
if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "ERROR: ADMIN_PASSWORD must be set in .env"
  exit 1
fi
if [ "${#ADMIN_PASSWORD}" -lt 12 ]; then
  echo "ERROR: ADMIN_PASSWORD must be at least 12 characters (current: ${#ADMIN_PASSWORD})"
  exit 1
fi
if [ -z "${ADMIN_SESSION_SECRET:-}" ] || [ "${ADMIN_SESSION_SECRET}" = "REPLACE_WITH_32_BYTE_BASE64_SECRET" ]; then
  echo "ERROR: ADMIN_SESSION_SECRET must be set to a strong random value"
  echo "  Generate with: openssl rand -base64 32"
  exit 1
fi
if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL must be set in .env"
  exit 1
fi

# Verify build output exists
if [ ! -f ".next/standalone/server.js" ]; then
  echo "ERROR: .next/standalone/server.js not found."
  echo "  Run 'bun run build' first to create the standalone server."
  exit 1
fi

# Verify database file exists (SQLite only — skip for Postgres)
if [[ "$DATABASE_URL" == file:* ]]; then
  DB_PATH="${DATABASE_URL#file:}"
  if [ ! -f "$DB_PATH" ]; then
    echo "ERROR: Database file not found at $DB_PATH"
    echo "  Run: bun run db:push && bun run db:seed-full"
    exit 1
  fi
fi

export NODE_ENV="production"
export PORT="${PORT:-3000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

echo "=========================================="
echo "  Nandhini Tex — Production Server"
echo "=========================================="
echo "  Port:     $PORT"
echo "  Host:     $HOSTNAME"
echo "  Database: $DATABASE_URL"
echo "  Mode:     production"
echo "=========================================="
echo ""

# ---- Start the server ----
if [ "${1:-}" = "--bg" ]; then
  echo "Starting in background..."
  nohup node .next/standalone/server.js > /tmp/nandhini-prod.log 2>&1 &
  SERVER_PID=$!
  echo "Server PID: $SERVER_PID"
  echo "Log: /tmp/nandhini-prod.log"
  # Wait for the server to be ready
  for i in $(seq 1 30); do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/api/health?check=liveness" 2>/dev/null | grep -q "200"; then
      echo "Server is ready at http://localhost:$PORT"
      exit 0
    fi
    sleep 1
  done
  echo "WARNING: Server didn't respond to health check within 30s"
  echo "Check log: tail -50 /tmp/nandhini-prod.log"
  exit 1
else
  echo "Starting in foreground (Ctrl+C to stop)..."
  exec node .next/standalone/server.js
fi
