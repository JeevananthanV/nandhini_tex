# Deployment Guide — Nandhini Tex

This document covers every supported deployment target for the Nandhini Tex e-commerce platform. Pick the one that fits your hosting needs.

| Target | Best for | Difficulty |
|---|---|---|
| [Vercel](#1-vercel-recommended) | Fastest path to production | Easy |
| [Self-hosted (Node + Caddy)](#2-self-hosted--node--caddy) | VPS / on-prem / current sandbox | Medium |
| [Docker](#3-docker) | Containerized, reproducible | Medium |
| [Fly.io / Railway](#4-flyio--railway) | PaaS with Postgres + persistent volumes | Easy |
| [Static export (limited)](#5-static-export-not-recommended) | CDN-only hosting | Not recommended |

---

## Pre-deployment checklist

Run through this list **before** any deployment.

- [ ] `.env` populated with production `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXTAUTH_SECRET` generated with `openssl rand -base64 32` (do not reuse dev secrets)
- [ ] Database seeded: `bun run db:push && bun run db:seed-full`
- [ ] Lint passes: `bun run lint` returns 0 errors
- [ ] Build succeeds: `bun run build` completes without errors
- [ ] Production server starts: `bun run start` responds on `/api/health` with `status: healthy`
- [ ] Visit `/` — home renders, products load, PDP works, cart drawer opens, admin panel accessible
- [ ] `robots.txt` and `sitemap.xml` reachable at the production domain
- [ ] `/api/health` returns DB latency < 100ms
- [ ] HTTPS enforced (Vercel does this automatically; Caddy/Nginx needs manual config)

---

## 1. Vercel (Recommended)

Vercel is the platform Next.js is built for — zero-config deploys, global CDN, automatic HTTPS, and edge functions.

### Steps

1. **Push to GitHub / GitLab / Bitbucket** (if not already)

   ```bash
   git init
   git add .
   git commit -m "Initial commit — Nandhini Tex"
   git branch -M main
   git remote add origin https://github.com/<you>/nandhini-tex.git
   git push -u origin main
   ```

2. **Import the project on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repo → Vercel auto-detects Next.js

3. **Configure environment variables** (Project Settings → Environment Variables)

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | `file:./db/custom.db` (SQLite) **or** `postgresql://...` (recommended for Vercel) |
   | `NEXTAUTH_SECRET` | Output of `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://<your-domain>.vercel.app` |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>.vercel.app` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `917604811838` |
   | `ZAI_API_KEY` | (optional) your z-ai-web-dev-sdk key |

4. **Deploy**

   Vercel runs `bun run build` automatically. The first deploy takes ~2 minutes.

5. **Initialize the database**

   For SQLite: the file persists across warm serverless invocations but is **not shared between regions**. For production, switch to Postgres — see [Switching databases](#switching-databases) below.

   Run the seed once (use `vercel env pull` + a local script):

   ```bash
   vercel env pull .env.local
   bun run db:push
   bun run db:seed-full
   ```

6. **Set up a custom domain** (optional)
   - Project Settings → Domains → Add your domain
   - Vercel provisions the SSL certificate automatically

### Vercel notes

- The app uses `output: "standalone"` — Vercel handles this natively, no special config needed
- API routes run as Node.js serverless functions (not edge) — required because Prisma needs Node
- For better cold-start performance, consider [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) instead of SQLite

---

## 2. Self-hosted + Node + Caddy

This is the **current sandbox configuration**. Suitable for any VPS (DigitalOcean, Hetzner, AWS EC2, Linode, etc.).

### Architecture

```
                ┌──────────────┐
   Internet ───►│   Caddy :81   │───► localhost:3000 (Next.js standalone)
                │  (TLS + GW)  │
                └──────────────┘
                       │
                       ▼ (when ?XTransformPort=N)
                   localhost:N  (mini-services — websocket, etc.)
```

### Steps

1. **Provision a VPS**
   - Ubuntu 22.04+ recommended
   - 1 vCPU / 1 GB RAM minimum (2 GB recommended for production with seeded catalog)
   - Open ports 80 + 443 for HTTP/HTTPS

2. **Install runtime**

   ```bash
   # Node.js 20 LTS
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Bun (for faster installs)
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc

   # Caddy (reverse proxy + automatic HTTPS)
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install -y caddy
   ```

3. **Clone + build**

   ```bash
   git clone https://github.com/<you>/nandhini-tex.git /var/www/nandhini-tex
   cd /var/www/nandhini-tex
   bun install --production
   cp .env.example .env
   # Edit .env with production values
   bun run db:push
   bun run db:seed-full
   bun run build
   ```

4. **Run with systemd**

   Create `/etc/systemd/system/nandhini-tex.service`:

   ```ini
   [Unit]
   Description=Nandhini Tex — Next.js standalone server
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/nandhini-tex
   EnvironmentFile=/var/www/nandhini-tex/.env
   ExecStart=/usr/bin/node /var/www/nandhini-tex/.next/standalone/server.js
   Restart=on-failure
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

   Enable + start:

   ```bash
   sudo chown -R www-data:www-data /var/www/nandhini-tex
   sudo systemctl daemon-reload
   sudo systemctl enable --now nandhini-tex
   sudo systemctl status nandhini-tex
   ```

5. **Configure Caddy**

   Replace `/etc/caddy/Caddyfile` with:

   ```caddyfile
   yourdomain.com {
     reverse_proxy localhost:3000 {
       header_up Host {host}
       header_up X-Forwarded-For {remote_host}
       header_up X-Forwarded-Proto {scheme}
       header_up X-Real-IP {remote_host}
     }
   }
   ```

   Reload Caddy: `sudo systemctl reload caddy`

   Caddy automatically provisions and renews Let's Encrypt TLS certificates.

6. **Verify**

   ```bash
   curl https://yourdomain.com/api/health
   # {"status":"healthy","uptime":...,"services":{"database":{"status":"up"}}}
   ```

### Sandbox gateway (current setup)

The sandbox uses port `:81` with a `?XTransformPort=N` query mechanism to forward to mini-services. For your own deployment you typically don't need this — replace the Caddyfile with the simple domain-based config above.

---

## 3. Docker

### Dockerfile

Create a `Dockerfile` at the project root:

```dockerfile
# ---- deps ----
FROM oven/bun:1.1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---- builder ----
FROM oven/bun:1.1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ---- runner ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/db ./db

# Ensure db directory is writable (SQLite)
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
```

### .dockerignore

```
node_modules
.next
dev.log
screenshots
tool-results
tests
.env
.env.local
```

### Build + run

```bash
# Build
docker build -t nandhini-tex .

# Run (SQLite persists to ./db volume)
docker run -d \
  --name nandhini-tex \
  -p 3000:3000 \
  -v $(pwd)/db:/app/db \
  -e DATABASE_URL="file:/app/db/custom.db" \
  -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  -e NEXT_PUBLIC_SITE_URL="https://yourdomain.com" \
  -e NEXT_PUBLIC_WHATSAPP_NUMBER="917604811838" \
  nandhini-tex

# Seed (run once)
docker exec -it nandhini-tex node -e "require('./prisma/seed-full-catalog.ts')"
# Or use prisma directly:
docker exec -it nandhini-tex npx prisma db push
```

### docker-compose.yml

```yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./db:/app/db
    environment:
      DATABASE_URL: "file:/app/db/custom.db"
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}"
      NEXT_PUBLIC_SITE_URL: "${NEXT_PUBLIC_SITE_URL}"
      NEXT_PUBLIC_WHATSAPP_NUMBER: "917604811838"
    restart: unless-stopped
```

Start with: `docker compose up -d`

---

## 4. Fly.io / Railway

Both platforms support Node.js apps with persistent volumes and managed Postgres.

### Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Launch**: `fly launch` — Fly auto-detects Next.js and generates a `Dockerfile` and `fly.toml`
3. **Create a persistent volume** for SQLite (or attach managed Postgres):

   ```bash
   fly volumes create nandhini_data --size 1
   ```

4. **Configure `fly.toml`** to mount the volume:

   ```toml
   [mounts]
     source = "nandhini_data"
     destination = "/app/db"
   ```

5. **Set secrets**:

   ```bash
   fly secrets set DATABASE_URL="file:/app/db/custom.db"
   fly secrets set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
   fly secrets set NEXT_PUBLIC_SITE_URL="https://nandhini-tex.fly.dev"
   fly secrets set NEXT_PUBLIC_WHATSAPP_NUMBER="917604811838"
   ```

6. **Deploy**: `fly deploy`
7. **Seed**: `fly ssh console -C "bun run db:push && bun run db:seed-full"`

### Railway

1. Go to [railway.app/new](https://railway.app/new) → select your GitHub repo
2. Railway auto-detects Next.js
3. Add a **PostgreSQL** plugin (recommended over SQLite)
4. Set `DATABASE_URL` to the Postgres connection string Railway provides
5. Add all other env vars in the Railway dashboard
6. Deploy — Railway runs `bun run build` automatically
7. Run the seed via Railway's shell: `bun run db:push && bun run db:seed-full`

---

## 5. Static export (not recommended)

This app **cannot be statically exported** because it relies on:

- Prisma database queries at request time (server components + API routes)
- Dynamic routes (`/api/products/[slug]`)
- Server-rendered JSON-LD schemas
- Websocket support (via mini-services)

If you need CDN-only hosting, you'd have to:
1. Replace Prisma with a headless CMS (Sanity, Contentful)
2. Move all API routes to serverless functions
3. Pre-render product pages at build time

**Not recommended for this project.** Use Vercel or self-hosted instead.

---

## Switching databases

The default SQLite setup is great for development and small catalogs. For production with multiple regions or serverless deploys, switch to **PostgreSQL**.

### Steps

1. **Update `prisma/schema.prisma`**:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update `.env`**:

   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/nandhini_tex?schema=public"
   ```

3. **Push schema + seed**:

   ```bash
   bun run db:push
   bun run db:seed-full
   ```

4. **For Vercel**: use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or [Neon](https://neon.tech) (serverless Postgres with branching)

### JSON column migration notes

The schema stores arrays (e.g. `Product.images`, `Order.items`) as JSON-encoded `String` columns in SQLite. When you move to Postgres, you can either:

- **Keep as `String`** (works as-is, just less queryable)
- **Migrate to `Json`** (better, allows nested queries) — change the type in `schema.prisma` and use `prisma migrate` to transform

---

## Production health verification

After deploying, verify the deployment is healthy:

### 1. Hit the health endpoint

```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 1234,
  "responseMs": 12,
  "services": {
    "database": { "status": "up", "latencyMs": 5 }
  }
}
```

### 2. Smoke-test the storefront

```bash
curl -s https://yourdomain.com/ | grep -o "Nandhini Tex"
curl -s https://yourdomain.com/api/products?limit=1 | jq '.products[0].title'
curl -s https://yourdomain.com/api/categories | jq '.categories | length'
```

### 3. Test the admin panel

1. Open `https://yourdomain.com/` in a browser
2. Click **Admin** in the header
3. Verify the dashboard loads with revenue chart + system health widget
4. Navigate to Products → confirm 105 products are listed
5. Navigate to Orders → confirm the table renders

### 4. Test mobile

Use your browser's device emulator (Chrome DevTools → Toggle device toolbar):
- iPhone SE (375×667)
- iPhone 14 Pro (393×852)
- iPad Mini (768×1024)

Verify:
- No horizontal overflow
- Sticky add-to-cart bar appears on PDP
- Mobile bottom nav visible
- Touch targets ≥ 36px

### 5. Verify SEO endpoints

```bash
curl https://yourdomain.com/sitemap.xml
curl https://yourdomain.com/robots.txt
curl https://yourdomain.com/manifest.json
```

---

## Troubleshooting

### Build fails with Prisma error

```bash
# Regenerate the client
bun run db:generate
# Then rebuild
bun run build
```

### Database locked (SQLite)

SQLite doesn't handle concurrent writes well. If you see "database is locked" errors:
- Switch to PostgreSQL (see [Switching databases](#switching-databases))
- Or use WAL mode: add `?connection_limit=1` to `DATABASE_URL`

### Admin panel not loading

The admin panel renders only when `mode === "admin"` in the Zustand store. To reset:

```js
// In the browser console:
localStorage.removeItem("nandhini-tex-store");
location.reload();
```

### Images not loading

The Next.js image optimizer allows these remote hosts (configured in `next.config.ts`):
- `z-cdn.chatglm.cn`
- `images.unsplash.com`

To add more, edit `next.config.ts` → `images.remotePatterns`.

### Port 3000 already in use

```bash
lsof -i :3000
kill -9 <PID>
```

---

## Rollback

### Vercel
- Project → Deployments → find previous deployment → **Promote to Production**

### Self-hosted (systemd)
- Keep the previous `.next/standalone/` directory as `.next/standalone.bak/`
- To rollback: stop service, swap directories, restart service

```bash
sudo systemctl stop nandhini-tex
mv .next/standalone .next/standalone.failed
mv .next/standalone.bak .next/standalone
sudo systemctl start nandhini-tex
```

### Docker
- Keep the previous image tag: `docker tag nandhini-tex:current nandhini-tex:previous`
- Rollback: `docker run -d --name nandhini-tex ... nandhini-tex:previous`

---

## Production checklist (final)

- [ ] HTTPS enforced (automatic on Vercel, manual via Caddy/Nginx elsewhere)
- [ ] `NEXTAUTH_SECRET` set to a strong random value
- [ ] Database seeded with production catalog
- [ ] `/api/health` returns `status: "healthy"`
- [ ] `/sitemap.xml` returns 200 with product URLs
- [ ] `/robots.txt` returns 200
- [ ] Lighthouse mobile score ≥ 90 on Performance, Accessibility, Best Practices, SEO
- [ ] Backup strategy for the SQLite file (or Postgres DB)
- [ ] Error monitoring (Sentry / Vercel Analytics) configured (optional)
- [ ] CDN for static assets (automatic on Vercel; configure Cloudflare in front of self-hosted)
