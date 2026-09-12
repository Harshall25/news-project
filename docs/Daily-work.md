## YYYY-MM-DD

### Implemented
- Github workflow created for automated builds and testing on commit 
- Implemented OAuth using next-auth 

#### Time: 
- 50 min

## YYYY-MM-DD

### Implemented
- implemented caching
- for /api/articles endpoint : 90% response time reduced
- for /api/trending endpoint : 94.5% response time reduece

### Issues
- without redis fetching articles from the db takes 2.1s to 2000ms+ 
- impvoement can be made by using the redis
- faced multiple errors , because not try catch usesd in multiple code parts.

### Fixes
-

### Notes
-

## 2026-09-12

### Implemented
- Updated `docs/CI-CD-and-Deployment.md` to reference `integration-mainline` instead of `main`
- Created `.opencode/command/daily-work.md` workflow command

### Why Changed
- GitHub Actions workflows (`ci-cd.yml`, `deploy.yml`) target the `integration-mainline` branch, but the docs still said `main`
- Wanted an automated way to track daily work in `docs/Daily-work.md` so the doc gets created/updated after every session

### Issues
- None

### Fixes
- N/A

### Notes
- Docs now match the actual CI/CD branch configuration

## 2026-09-12

### Implemented
- Updated `docs/CI-CD-and-Deployment.md` to reference `integration-mainline` instead of `main`
- Created `.opencode/command/daily-work.md` workflow command
- Fixed middleware to exclude `/api/jobs` (was blocking cron jobs)
- Fixed TS error in `src/app/api/trending/route.ts` (implicit any)
- Removed unused `@ts-expect-error` in `src/jobs/fetch-news.ts`
- Regenerated `package-lock.json` via `npm install` (was out of sync, breaking CI)
- Created `docs/Docker-and-Deployment.md` with comprehensive Docker guide

### Why Changed
- CI/CD docs didn't match actual workflow branch (`integration-mainline` vs `main`)
- Middleware was blocking `/api/jobs` which breaks both Vercel Cron and Docker cron
- `package-lock.json` drift caused `npm ci` to fail in CI pipeline
- Type errors blocked production build
- Needed detailed Docker documentation matching CI/CD doc style

### Issues
- `@upstash/ratelimit` missing from node_modules (lockfile out of sync)
- TypeScript errors in trending route and fetch-news.ts
- Middleware protected cron endpoint unintentionally

### Fixes
- `npm install` synced lockfile and installed missing deps
- Added type annotation to trending route filter callback
- Removed obsolete `@ts-expect-error` directive
- Removed `/api/jobs` from middleware matcher

### Notes
- App now builds successfully
- Cron will work on Vercel and Docker deployments
- CI pipeline `npm ci` will work with updated lockfile

## 2026-09-12 (UI Improvements)

### Implemented
- Added Skeleton loading components (`components/ui/skeleton.tsx`, `components/ArticleCardSkeleton.tsx`)
- Added Toast notifications with sonner (`components/ui/toaster.tsx`, `hooks/use-toast.ts`)
- Updated `ArticleCard` with placeholder images, loading states, better UX
- Updated `HomePage` with skeleton loading, toast errors with status codes (15s auto-dismiss)
- Added secure logger (`lib/logger.ts`) with automatic PII redaction
- Added Toaster to root layout

### Why Changed
- UI lacked loading states, error handling, and placeholder images
- Need secure logging for production debugging without leaking sensitive data
- Follow shadcn patterns and design-taste guidelines for modern UI

### Issues
- No skeleton loading or toast notifications in UI
- Articles without images showed broken layout
- No structured logging for production debugging

### Fixes
- Added Skeleton components matching ArticleCard layout
- Integrated sonner for accessible toast notifications
- Added placeholder image fallback via picsum.photos
- Created logger with automatic sensitive field redaction
- Toast auto-dismisses after 15 seconds with status code

### Notes
- UI follows shadcn patterns and design-taste guidelines

## 2026-09-12 (UI Fixes - Performance & Colors)

### Implemented
- Fixed excessive API requests: used refs for `latestOrTrend`, `category`, `articles`, `page`, `totalPages` in `HomePage` to stabilize `useCallback` deps
- Fixed stale closure in logging (was logging `articles.length` as 0)
- Added emerald/teal accent color theme (oklch 162° hue) replacing neutral grey palette
- Fixed ArticleCard flickering: removed spinner overlay flash, used `placeholder="blur"` with blurDataURL, smooth opacity transition
- Removed unnecessary `isLoading` state on Summarize button
- Skeleton count reduced to 8, matching grid layout

### Why Changed
- `fetchArticles` useCallback recreated on every `latestOrTrend`/`category` change causing re-fetches
- Stale closure captured initial empty `articles` array in logInfo
- Color palette was pure neutral (chroma 0) - no visual hierarchy
- Image loading caused layout shift + spinner flash = flickering

### Issues
- Too many duplicate API requests on tab/category switch
- UI flickering on image load
- Grey-only color scheme
- Stale logging data

### Fixes
- Refs for stable values in callbacks, single `fetchArticles` creation
- Emerald primary (oklch 0.45 0.15 162) with semantic color tokens
- Next.js Image blur placeholder + CSS opacity transition (no spinner overlay)
- Removed button loading state (navigates instantly)

### Notes
- Build passes, colors now have personality, requests stable

## 2026-09-12 (Azure Deployment Setup)

### Implemented
- Fixed Dockerfile: removed `prisma migrate deploy` from CMD, added dumb-init via apk, non-root user (nextjs:1001), HEALTHCHECK, proper ENTRYPOINT
- Created `.github/workflows/ci.yml` — lint, typecheck, test (Node 20/22), build, security audit with weekly schedule
- Created `.github/workflows/deploy.yml` — Docker build/push to ACR, separate Prisma migrate step, deploy to Azure Container Apps via OIDC, health verification
- Removed Vercel-specific workflows (`ci-cd.yml`, `deploy.yml`)
- Added favicon.svg to public/ and configured in layout.tsx metadata

### Why Changed
- Previous deployment was Vercel-only, not Azure Container Apps
- `prisma migrate deploy` in container startup runs per-replica, not per-deployment
- No health checks, no non-root user, no signal handling in container
- CI workflow had schedule trigger at wrong YAML level

### Issues
- Docker CMD ran migrations on every container start
- Vercel action in deploy workflow
- No Azure credentials/secrets structure
- Missing health check in container

### Fixes
- Migrations now run as separate GH Actions job before deploy
- Azure login via OIDC (client-id, tenant-id, subscription-id)
- ACR push with Buildx + cache, deploy via `azure/container-apps-deploy-action`
- Container runs as non-root, has health check, uses dumb-init

### Notes
- Build passes, Azure-ready CI/CD pipeline complete