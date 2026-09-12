# ============================================================
# STAGE 1: INSTALL DEPENDENCIES
# ============================================================
#
# This stage exists only to install node_modules.
#
# Keeping dependency installation in a separate stage allows
# Docker to cache this layer.
#
# If application source code changes but package.json and
# package-lock.json do not change, Docker can reuse this layer
# instead of running npm ci again.
# ============================================================

FROM node:22-alpine AS deps

# All following commands operate inside /app.
WORKDIR /app


# Copy only dependency manifests first.
#
# This is intentional.
#
# Docker layer caching works better when package files are
# copied before the rest of the application source.
COPY package.json package-lock.json ./


# Install exact dependency versions from package-lock.json.
#
# `npm ci` is preferred for production/CI builds because it
# installs exactly what package-lock.json specifies.
RUN npm ci


# ============================================================
# STAGE 2: BUILD NEXT.JS
# ============================================================
#
# This stage:
#
#   1. Reuses node_modules from deps.
#   2. Copies the application source.
#   3. Generates Prisma Client.
#   4. Builds Next.js.
#
# The resulting `.next` directory will contain the compiled
# production application.
# ============================================================

FROM node:22-alpine AS builder

WORKDIR /app


# Copy installed dependencies from Stage 1.
COPY --from=deps /app/node_modules ./node_modules


# Copy the complete application source.
COPY . .


# ------------------------------------------------------------
# Generate Prisma Client
# ------------------------------------------------------------
#
# This generates the Prisma Client required by the application.
#
# IMPORTANT:
# `prisma generate` does NOT run migrations and does NOT need
# the production database connection.
# ------------------------------------------------------------

RUN npx prisma generate


# ------------------------------------------------------------
# Build Next.js
# ------------------------------------------------------------
#
# Your next.config.ts should contain:
#
#   output: "standalone"
#
# This causes Next.js to create:
#
#   .next/standalone
#
# containing the files necessary to run the production server.
# ------------------------------------------------------------

RUN npm run build


# ============================================================
# STAGE 3: PRODUCTION RUNNER
# ============================================================
#
# This is the final image.
#
# It intentionally starts from a fresh node:22-alpine image
# instead of carrying the entire build environment into
# production.
#
# This keeps the final image smaller and removes unnecessary
# development dependencies from the runtime image.
# ============================================================

FROM node:22-alpine AS runner

WORKDIR /app


# ------------------------------------------------------------
# Production environment variables
# ------------------------------------------------------------
#
# NODE_ENV:
#   Tells Node.js/Next.js the application is running in
#   production mode.
#
# PORT:
#   Next.js listens on port 3000.
#
# HOSTNAME:
#   Explicitly bind the server to all interfaces.
#
# NEXT_TELEMETRY_DISABLED:
#   Prevents Next.js telemetry from being sent.
# ------------------------------------------------------------

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1


# ------------------------------------------------------------
# Install dumb-init
# ------------------------------------------------------------
#
# Containers have special signal-handling behavior.
#
# dumb-init acts as PID 1 and correctly forwards signals such
# as SIGTERM to the Node.js process.
#
# This helps Azure shut down/restart the container cleanly.
# ------------------------------------------------------------

RUN apk add --no-cache dumb-init


# ============================================================
# CREATE NON-ROOT USER
# ============================================================
#
# Running a web application as root is unnecessary.
#
# We create:
#
#   group: nodejs
#   user:  nextjs
#
# and run the application using that user.
# ============================================================

RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001


# ============================================================
# COPY PRODUCTION FILES
# ============================================================
#
# Because Next.js uses:
#
#   output: "standalone"
#
# the following files are sufficient for the runtime.
# ============================================================


# ------------------------------------------------------------
# Public/static files
# ------------------------------------------------------------

COPY --from=builder /app/public ./public


# ------------------------------------------------------------
# Prisma schema and migrations
# ------------------------------------------------------------
#
# The Prisma directory is kept in the image in case application
# runtime code requires access to the Prisma schema/migration
# files.
#
# IMPORTANT:
# We are NOT running `prisma migrate deploy` from CMD.
# Migrations happen separately in GitHub Actions.
# ------------------------------------------------------------

COPY --from=builder /app/prisma ./prisma


# ------------------------------------------------------------
# Next.js standalone server
# ------------------------------------------------------------

COPY --from=builder /app/.next/standalone ./


# ------------------------------------------------------------
# Next.js static assets
# ------------------------------------------------------------

COPY --from=builder /app/.next/static ./.next/static


# ============================================================
# FILE OWNERSHIP
# ============================================================
#
# The final image will run as user `nextjs`.
#
# Therefore /app needs to be accessible by that user.
# ============================================================

RUN chown -R nextjs:nodejs /app


# ============================================================
# SWITCH AWAY FROM ROOT
# ============================================================

USER nextjs


# ============================================================
# CONTAINER PORT
# ============================================================
#
# This documents that the application listens on 3000.
#
# Azure Container Apps should also be configured with:
#
#   targetPort = 3000
# ============================================================

EXPOSE 3000


# ============================================================
# DOCKER HEALTH CHECK
# ============================================================
#
# Every 30 seconds Docker checks:
#
#   http://localhost:3000/api/health
#
# The endpoint must return HTTP 200.
#
# This is useful for container-level health information.
#
# Azure Container Apps can additionally have its own HTTP
# liveness/readiness probes configured separately.
# ============================================================

HEALTHCHECK \
  --interval=30s \
  --timeout=10s \
  --start-period=40s \
  --retries=3 \
  CMD wget \
    -qO- \
    http://127.0.0.1:3000/api/health \
    || exit 1


# ============================================================
# STARTUP
# ============================================================
#
# dumb-init becomes PID 1.
#
# It then starts:
#
#   node server.js
#
# IMPORTANT:
#
# DO NOT run:
#
#   prisma migrate deploy
#
# here.
#
# Database migrations are handled once by the GitHub Actions
# `migrate` job before the new Azure revision is deployed.
# ============================================================

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]