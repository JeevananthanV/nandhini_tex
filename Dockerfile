# ============================================================================
# Dockerfile — Nandhini Tex production image
# ============================================================================
# Multi-stage build: deps → build → runtime
# Final image is ~150MB (node:20-slim + standalone output + public assets)
# ============================================================================

# ---- deps: install all dependencies (including devDeps for build) ----
FROM oven/bun:1.1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- builder: compile the standalone output ----
FROM oven/bun:1.1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client (needed at build time for type-checks)
RUN bun run db:generate
# Build the standalone server
RUN bun run build

# ---- runner: minimal production image ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install openssl (needed by Node for crypto operations) + curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy standalone output (includes server.js + minimal node_modules)
COPY --from=builder /app/.next/standalone ./
# Copy static assets + public folder (not bundled in standalone)
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Copy Prisma schema + migrations (for runtime db push if needed)
COPY --from=builder /app/prisma ./prisma
# Copy the SQLite db directory (for dev/single-instance; use a volume in prod)
COPY --from=builder /app/db ./db

# Ensure db directory is writable by the non-root user
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app

# Drop privileges
USER nextjs

# Expose the app port
EXPOSE 3000

# Healthcheck — liveness probe (no DB hit, just checks the process responds)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f "http://localhost:3000/api/health?check=liveness" || exit 1

# Start the standalone server
CMD ["node", "server.js"]
