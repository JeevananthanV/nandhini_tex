# ============================================================================
# Dockerfile — Nandhini Tex production image
# ============================================================================
# Multi-stage build: deps → builder → runner
# Final image is ~180MB (node:20-slim + standalone output + public assets + prisma engine)
#
# Build:
#   docker build -t nandhini-tex .
#
# Run (SQLite, single-instance):
#   docker run -d -p 3000:3000 \
#     -e ADMIN_PASSWORD="strong-password-min-12-chars" \
#     -e ADMIN_SESSION_SECRET="$(openssl rand -base64 32)" \
#     -e DATABASE_URL="file:/app/db/custom.db" \
#     -v $(pwd)/db:/app/db \
#     --name nandhini-tex \
#     nandhini-tex
#
# Run (PostgreSQL — recommended for multi-instance / serverless):
#   docker run -d -p 3000:3000 \
#     -e ADMIN_PASSWORD="..." \
#     -e ADMIN_SESSION_SECRET="..." \
#     -e DATABASE_URL="postgresql://user:pass@db-host:5432/nandhini_tex" \
#     --name nandhini-tex \
#     nandhini-tex
# ============================================================================

# ---- deps: install all dependencies (including devDeps for build) ----
# Uses bun:1.1 (debian-based) so the Prisma engine binary matches the runner stage
FROM oven/bun:1.1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
# Install with --frozen-lockfile for reproducible builds
RUN bun install --frozen-lockfile

# ---- builder: compile the standalone output ----
FROM oven/bun:1.1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for the Prisma binary engine target.
# The runner uses node:20-slim (Debian bookworm). Prisma needs to know this
# at generate-time so it fetches the correct libquery_engine binary.
# See https://www.prisma.io/docs/orm/overview/databases/database-drivers
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=library \
    PRISMA_CLIENT_ENGINE_TYPE=library \
    # Tell Prisma to fetch the binary for debian-openssl-3.0.x (matches node:20-slim)
    BINARY_TARGET=debian-openssl-3.0.x

# Generate Prisma client (needed at build time for type-checks + runtime queries)
RUN bun run db:generate

# Build the standalone server (next build + copies static/public/prisma/db)
# The build script in package.json already strips .env files from the output.
RUN bun run build

# Verify critical files exist in the standalone output
RUN ls -la .next/standalone/server.js && \
    ls -la .next/standalone/.next/static && \
    ls -la .next/standalone/public && \
    ls -la .next/standalone/prisma/schema.prisma && \
    ls -la .next/standalone/db/custom.db

# Verify the Prisma binary engine was bundled by Next.js standalone tracing.
# This file is platform-specific — must match the runner image (debian-openssl-3.0.x).
RUN ls .next/standalone/node_modules/.prisma/client/libquery_engine-*.so.node

# ---- runner: minimal production image ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Install openssl (needed by Prisma + Node crypto operations) and curl (healthchecks)
# Use --no-install-recommends to keep the image small.
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates curl tini \
  && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security (drop privileges at runtime)
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy standalone output (includes server.js + minimal node_modules + prisma engine)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static assets (Next.js requires these outside the standalone bundle)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public folder (manifest, robots, sitemap, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Copy Prisma schema + migrations (for runtime `prisma db push` if needed)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create the db directory (SQLite volume mount point) owned by the non-root user
# so the container can write to it. In production with Postgres, this is unused.
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app

# Drop privileges — run as non-root from here on
USER nextjs

# Expose the app port
EXPOSE 3000

# Healthcheck — liveness probe (no DB hit, just checks the process responds)
# Uses ?check=liveness to skip the DB query so the healthcheck is fast and
# doesn't fail if the DB is briefly unavailable.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS "http://localhost:3000/api/health?check=liveness" || exit 1

# Use tini as PID 1 for proper signal handling (graceful shutdown on SIGTERM)
# This is critical for `docker stop` to not hang for 10s before SIGKILL.
ENTRYPOINT ["/usr/bin/tini", "--"]

# Start the standalone server
CMD ["node", "server.js"]
