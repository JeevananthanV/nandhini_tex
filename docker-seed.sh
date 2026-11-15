#!/usr/bin/env bash
# ============================================================================
# docker-seed.sh — Run database seeding inside the Docker container
# ============================================================================
# Usage:
#   ./docker-seed.sh          # seed base data (categories, coupons, FAQs)
#   ./docker-seed.sh full     # seed full 105-product catalog
#
# Prerequisites:
#   - The nandhini-tex container must be running (docker compose up -d)
# ============================================================================

set -euo pipefail

CONTAINER_NAME="${CONTAINER_NAME:-nandhini-tex}"
SEED_TYPE="${1:-base}"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "ERROR: Container '${CONTAINER_NAME}' is not running."
  echo "  Start it with: docker compose up -d"
  exit 1
fi

case "$SEED_TYPE" in
  base|full)
    ;;
  *)
    echo "Usage: $0 [base|full]"
    echo "  base  — categories, coupons, FAQs, testimonials (default)"
    echo "  full  — base + 105-product catalog"
    exit 1
    ;;
esac

echo "==> Pushing Prisma schema to the database..."
docker compose exec "$CONTAINER_NAME" node -e "
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  prisma.\$connect().then(() => {
    console.log('✓ Database connection verified');
    process.exit(0);
  }).catch((e) => {
    console.error('✗ Database connection failed:', e.message);
    process.exit(1);
  });
"

echo "==> Seeding ${SEED_TYPE} data..."
if [ "$SEED_TYPE" = "full" ]; then
  docker compose exec "$CONTAINER_NAME" bun run db:seed-full
else
  docker compose exec "$CONTAINER_NAME" bun run db:seed
fi

echo "==> Done! Seed data loaded."
echo "    View products at: http://localhost:3000/api/products?limit=5"
