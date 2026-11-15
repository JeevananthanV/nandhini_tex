# Docker — Nandhini Tex

Complete guide for running the Nandhini Tex e-commerce platform in Docker.

## Quickstart

### Production (recommended)

```bash
# 1. Copy the env template and fill in real secrets
cp .env.docker.example .env
# Edit .env — set ADMIN_PASSWORD (min 12 chars) and ADMIN_SESSION_SECRET
# Generate a strong secret: openssl rand -base64 32

# 2. Build + start the container
docker compose up -d --build

# 3. Verify it's healthy
docker compose ps
curl http://localhost:3000/api/health

# 4. (Optional) Seed the database with the full 105-product catalog
./docker-seed.sh full

# 5. View logs
docker compose logs -f
```

### Development with hot reload

```bash
docker compose -f docker-compose.dev.yml up
# App available at http://localhost:3000
# Changes to src/ files reflect instantly via HMR
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Host machine                     │
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │     Docker container (nandhini-tex)   │   │
│  │                                       │   │
│  │  ┌─────────────────────────────┐     │   │
│  │  │  node:20-slim (non-root)    │     │   │
│  │  │                              │     │   │
│  │  │  server.js (Next.js standalone)│   │   │
│  │  │  ┌──────────────────────┐   │     │   │
│  │  │  │  Prisma Client +     │   │     │   │
│  │  │  │  libquery_engine.so  │   │     │   │
│  │  │  └──────────┬───────────┘   │     │   │
│  │  └─────────────┼───────────────┘     │   │
│  │                │                      │   │
│  │  ┌─────────────▼───────────────┐     │   │
│  │  │   ./db/custom.db (volume)  │     │   │
│  │  └─────────────────────────────┘     │   │
│  └───────────────────────────────────────┘   │
│                                               │
│  Host ./db/ ←─ volume mount ─→ /app/db/      │
└─────────────────────────────────────────────┘
```

### Multi-stage build

| Stage | Base image | Purpose |
|---|---|---|
| `deps` | `oven/bun:1.1` | Install all dependencies (frozen lockfile) |
| `builder` | `oven/bun:1.1` | Generate Prisma client + build Next.js standalone |
| `runner` | `node:20-slim` | Minimal production runtime (~180MB final image) |

### Why `oven/bun` for build but `node:20-slim` for runtime?

- **Bun** is faster for installing + building (Turbopack integration)
- **Node.js** is more battle-tested for long-running production servers
- The standalone output (`server.js`) is pure JavaScript — runs on either runtime
- `node:20-slim` is smaller than `bun:1.1` and has better official Docker support

---

## Configuration

### Environment variables

All runtime configuration is via environment variables (no config files baked into the image):

| Variable | Required | Default | Description |
|---|---|---|---|
| `ADMIN_PASSWORD` | **Yes** (prod) | `admin123` (dev) | Admin login password (min 12 chars in prod) |
| `ADMIN_SESSION_SECRET` | Recommended | derived from `ADMIN_PASSWORD` | HMAC signing secret (generate with `openssl rand -base64 32`) |
| `DATABASE_URL` | **Yes** | `file:/app/db/custom.db` | SQLite path or PostgreSQL connection string |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Public canonical URL for SEO |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | No | `917604811838` | WhatsApp business number |
| `ZAI_API_KEY` | No | `""` | z-ai-web-dev-sdk key (backend AI features) |

**Generate strong secrets:**
```bash
openssl rand -base64 32  # for ADMIN_SESSION_SECRET
openssl rand -base64 18  # for ADMIN_PASSWORD
```

### Volumes

| Host path | Container path | Purpose |
|---|---|---|
| `./db` | `/app/db` | SQLite database (persisted across restarts) |

For PostgreSQL, remove the volume mount and add a `db` service (see commented section in `docker-compose.yml`).

---

## Production deployment

### Single-instance (SQLite)

```bash
# Build + run
docker compose up -d --build

# Check health
docker compose ps
# NAME             STATUS                   PORTS
# nandhini-tex     Up (healthy)             0.0.0.0:3000->3000/tcp

# Tail logs
docker compose logs -f web
```

### Multi-instance (PostgreSQL)

For horizontal scaling or serverless deploys, switch to PostgreSQL:

1. **Uncomment the `db` service** in `docker-compose.yml`:

   ```yaml
   db:
     image: postgres:16-alpine
     environment:
       POSTGRES_USER: nandhini
       POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
       POSTGRES_DB: nandhini_tex
     volumes:
       - pgdata:/var/lib/postgresql/data
   ```

2. **Update `.env`:**

   ```env
   DATABASE_URL="postgresql://nandhini:strong-password@db:5432/nandhini_tex?schema=public"
   POSTGRES_PASSWORD="strong-password-here"
   ```

3. **Rebuild + start:**

   ```bash
   docker compose up -d --build
   docker compose exec web bun run db:push
   docker compose exec web bun run db:seed-full
   ```

### Behind a reverse proxy (Caddy / Nginx)

For HTTPS + custom domain, put Caddy in front:

```caddyfile
yourdomain.com {
  reverse_proxy localhost:3000 {
    header_up X-Forwarded-Proto {scheme}
    header_up X-Real-IP {remote_host}
  }
}
```

Or use the included `Caddyfile` (configure your domain in it).

---

## Operations

### View logs

```bash
# Tail logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail 100

# Filter for errors
docker compose logs | grep -i error
```

### Restart

```bash
docker compose restart web
```

### Update to a new version

```bash
git pull
docker compose up -d --build
```

### Database operations

```bash
# Push schema changes
docker compose exec web bun run db:push

# Seed base data
./docker-seed.sh base

# Seed full catalog
./docker-seed.sh full

# Open Prisma Studio (GUI for browsing the database)
docker compose exec web bunx prisma studio
# Then visit http://localhost:5555
```

### Backup the database

```bash
# SQLite
docker compose exec web cat /app/db/custom.db > backup-$(date +%Y%m%d).db

# Or copy from the volume
docker cp nandhini-tex:/app/db/custom.db ./backup-$(date +%Y%m%d).db
```

### Restore

```bash
docker cp ./backup-20260115.db nandhini-tex:/app/db/custom.db
docker compose restart web
```

---

## Security

### Non-root user

The container runs as user `nextjs` (UID 1001), not root. This means:
- The process can't write to system directories
- If compromised, the attacker has limited filesystem access
- Only `/app/db/` and `/tmp/` are writable

### Secrets handling

- **`.env` is NOT baked into the image** (`.dockerignore` excludes it)
- **Secrets are provided at runtime** via `env_file` in `docker-compose.yml`
- **The Prisma binary engine is platform-specific** but contains no secrets

### Resource limits

Uncomment the `deploy.resources` section in `docker-compose.yml` to cap CPU/memory:

```yaml
deploy:
  resources:
    limits:
      cpus: "1.0"
      memory: 512M
    reservations:
      memory: 128M
```

### Read-only filesystem (hardening)

For maximum security, make the root filesystem read-only:

```yaml
read_only: true
tmpfs:
  - /tmp:size=64m
  - /app/.next/cache:size=64m
```

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs web

# Common issues:
# - "ADMIN_PASSWORD must be set" → fill in .env
# - "Database file not found" → run ./docker-seed.sh or docker compose exec web bun run db:push
# - "Port 3000 already in use" → change the port mapping in docker-compose.yml
```

### Healthcheck failing

```bash
# Manually run the healthcheck
docker compose exec web curl -f http://localhost:3000/api/health?check=liveness

# Check if the DB is reachable
docker compose exec web node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.\$queryRaw\`SELECT 1\`.then(() => { console.log('DB OK'); process.exit(0); }).catch((e) => { console.error('DB FAIL:', e.message); process.exit(1); });
"
```

### Permission denied on db volume

If you see `EACCES: permission denied` when writing to `/app/db/custom.db`:

```bash
# Fix ownership on the host
sudo chown -R 1001:1001 ./db

# Or recreate the volume
docker compose down
rm -rf ./db/*
docker compose up -d
docker compose exec web bun run db:push
./docker-seed.sh full
```

### Image too large

The image is ~250MB (148MB node_modules + 17MB Prisma engine + 80MB node:20-slim base). To reduce:

- Switch to PostgreSQL (removes the 17MB engine + SQLite file)
- Use a `.dockerignore` to exclude more files
- Consider `node:20-alpine` (smaller base, but may have musl libc issues with Prisma)

---

## Image sizes

| Component | Size |
|---|---|
| `node:20-slim` base | ~80MB |
| Standalone `node_modules` (incl. Prisma engine) | ~148MB |
| `.next/static` (compiled CSS/JS) | ~2.4MB |
| `public/` (assets) | ~32KB |
| `prisma/` (schema + seeds) | ~100KB |
| **Total image** | **~250MB** |

---

## Files

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage production build |
| `docker-compose.yml` | Production deployment (SQLite + volume) |
| `docker-compose.dev.yml` | Development with HMR |
| `.dockerignore` | Excludes secrets + dev artifacts from build context |
| `.env.docker.example` | Runtime env template (copy to `.env`) |
| `docker-seed.sh` | Helper to seed the database in a running container |
| `Caddyfile` | Reverse proxy config for HTTPS + custom domain |
