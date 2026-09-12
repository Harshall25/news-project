# Docker and Deployment Guide

This project uses a multi-stage Dockerfile for production deployments. This document explains the Docker setup, how it works, and how to deploy using Docker on various platforms.

## File Overview

The Docker deployment files live here:
- `Dockerfile` — Multi-stage build (deps → builder → runner)
- `.dockerignore` — Files excluded from the build context
- `vercel.json` — Vercel Cron configuration (for managed deployments)
- `cron.mjs` — Standalone cron script for self-hosted deployments

---

## Dockerfile Architecture

The Dockerfile uses a **three-stage multi-stage build** to produce a minimal production image (~150MB):

### Stage 1: `deps` — Install Dependencies
```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
```
- Uses Alpine Linux for minimal size
- Copies only package files first (Docker layer caching)
- Runs `npm ci` for reproducible installs

### Stage 2: `builder` — Build the Application
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
```
- Reuses `node_modules` from `deps` stage
- Generates Prisma Client (required for DB access)
- Runs `npm run build` which produces `.next/standalone` (see `next.config.ts:26`)

### Stage 3: `runner` — Production Runtime
```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
```
- Copies only production artifacts (standalone server + static assets + prisma)
- Runs migrations on startup (`prisma migrate deploy`)
- Starts the Next.js standalone server

---

## Key Configuration Files

### `next.config.ts` — Standalone Output
```ts
output: "standalone",
images: { unoptimized: true }
```
The `output: "standalone"` option tells Next.js to create a self-contained `.next/standalone` folder with only the files needed to run the server. This is what gets copied to the final runner image.

### `.dockerignore`
```
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git
```
Excludes development files and build outputs from the Docker context, speeding up builds.

### `cron.mjs` — Background Job Runner
For self-hosted deployments (VPS, Azure, Docker Compose), run this alongside the web server:
```bash
npm run cron
```
It hits `/api/jobs` every 4 hours with the `CRON_SECRET` bearer token.

### `vercel.json` — Vercel Cron
```json
{
  "crons": [{
    "path": "/api/jobs",
    "schedule": "0 */4 * * *",
    "headers": { "Authorization": "Bearer $CRON_SECRET" }
  }]
}
```
On Vercel, this automatically triggers the news fetch job every 4 hours.

---

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Base URL (e.g., `https://your-domain.com`) | ✅ |
| `NEXTAUTH_SECRET` | Secret for NextAuth sessions | ✅ |
| `GOOGLE_ID` | Google OAuth Client ID | ✅ |
| `GOOGLE_SECRET` | Google OAuth Client Secret | ✅ |
| `GOOGLE_GEMINI_API` | Gemini API key for summaries | ✅ |
| `NEWS_API` | World News API key | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | ✅ |
| `CRON_SECRET` | Secret for cron job authentication | ✅ |
| `PORT` | Port to listen on (default: 3000) | ❌ |

---

## Build and Run Locally

### 1. Build the Image
```bash
docker build -t ai-news-app .
```

### 2. Run the Container
```bash
docker run -d \
  --name ai-news-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e GOOGLE_ID="..." \
  -e GOOGLE_SECRET="..." \
  -e GOOGLE_GEMINI_API="..." \
  -e NEWS_API="..." \
  -e UPSTASH_REDIS_REST_URL="https://..." \
  -e UPSTASH_REDIS_REST_TOKEN="..." \
  -e CRON_SECRET="your-cron-secret" \
  ai-news-app
```

### 3. Run Cron Separately (Self-Hosted)
In a separate terminal/process:
```bash
docker run -d \
  --name ai-news-cron \
  --network host \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e CRON_SECRET="your-cron-secret" \
  ai-news-app npm run cron
```
Or use Docker Compose (see below).

---

## Docker Compose (Recommended for Self-Hosted)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - GOOGLE_ID=${GOOGLE_ID}
      - GOOGLE_SECRET=${GOOGLE_SECRET}
      - GOOGLE_GEMINI_API=${GOOGLE_GEMINI_API}
      - NEWS_API=${NEWS_API}
      - UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
      - UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}
      - CRON_SECRET=${CRON_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  cron:
    build: .
    command: npm run cron
    environment:
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - CRON_SECRET=${CRON_SECRET}
    depends_on:
      - app
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=news_project
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

Run with:
```bash
docker compose up -d
```

---

## Platform-Specific Notes

### Vercel (Managed)
- Push to `integration-mainline` → GitHub Actions runs CI → Deploys to Vercel
- `vercel.json` cron triggers `/api/jobs` every 4 hours
- Set all env vars in Vercel Project Settings
- No need to run `cron.mjs` manually

### Azure Container Apps / App Service
- Build image via GitHub Actions or Azure DevOps
- Push to Azure Container Registry (ACR)
- Deploy container from ACR
- Set env vars in Container App configuration
- Run cron as a separate Container App Job or sidecar

### VPS / Bare Metal (Docker)
- Use `docker compose up -d` as shown above
- Set up reverse proxy (Nginx/Caddy) for SSL termination
- Configure firewall to allow only port 80/443 externally

### Kubernetes
- Build and push image to registry
- Create Deployment, Service, ConfigMap, Secret
- Use CronJob for the scheduled fetch:
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: ai-news-fetch
spec:
  schedule: "0 */4 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: fetch
            image: your-registry/ai-news-app:latest
            command: ["node", "cron.mjs"]
            env:
            - name: NEXTAUTH_URL
              value: "https://your-domain.com"
            - name: CRON_SECRET
              valueFrom:
                secretKeyRef:
                  name: ai-news-secrets
                  key: CRON_SECRET
          restartPolicy: OnFailure
```

---

## Health Check

The app exposes a health endpoint for load balancers / orchestrators:
```bash
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"2026-09-12T12:00:00.000Z"}
```

Docker HEALTHCHECK (optional, add to runner stage):
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

---

## Troubleshooting

### Build Fails: "Module not found"
Run `npm install` locally to sync `package-lock.json`, then rebuild.

### Cron Doesn't Run on Vercel
- Check `CRON_SECRET` is set in Vercel env vars
- Verify `vercel.json` is in repo root
- Check Vercel Function Logs for `/api/jobs` invocations

### Cron Doesn't Run in Docker
- Ensure `cron.mjs` process is running separately from web server
- Verify `NEXTAUTH_URL` and `CRON_SECRET` are set in cron container
- Check container logs: `docker logs ai-news-cron`

### Database Migration Fails on Startup
- Ensure `DATABASE_URL` points to a reachable PostgreSQL instance
- Run migrations manually: `docker exec <container> npx prisma migrate deploy`
- Check database user has CREATE/MIGRATE permissions

### "Middleware deprecated" Warning
Next.js 16 warns about file-based middleware. The current middleware works but consider migrating to `next.config.ts` rewrites or Edge Middleware in future.

---

## Image Size Optimization

Current optimizations:
- Alpine base images (~5MB each)
- Multi-stage build (dev deps excluded from runner)
- `output: "standalone"` strips unnecessary Next.js files
- `.dockerignore` prevents context bloat

Expected final image: **~150-200MB**

---

## Security Considerations

- Never bake secrets into the image (use env vars / secrets managers)
- Run as non-root user (add `USER node` in runner stage if needed)
- Keep base images updated (`docker pull node:22-alpine` before build)
- Scan image: `docker scout cves ai-news-app:latest`
- Use `npm audit --audit-level=high` in CI (already in `.github/workflows/ci-cd.yml`)

---

## Summary: Build → Deploy Flow

```
Code Push
  → GitHub Actions CI (lint, test, build)
  → Docker Build (multi-stage)
  → Push to Registry (GHCR / ACR / Docker Hub)
  → Deploy to Target (Vercel / Azure / K8s / VPS)
  → Health Check (/api/health)
  → Cron Running (Vercel Cron / Docker Compose / K8s CronJob)
```

For production deployments, the CI/CD pipeline in `.github/workflows/` handles the build and deploy automatically after merging to `integration-mainline`.