# AI News App

AI News App is a Next.js project that fetches news articles, stores them in PostgreSQL with Prisma, shows them in a feed, supports Google login, Redis caching, and AI article summaries.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and add these values:

```env
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_ID=
GOOGLE_SECRET=
GOOGLE_GEMINI_API=
NEWS_API=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

3. Run the app locally:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## What the env values mean

- `DATABASE_URL`: PostgreSQL connection string.
- `NEXTAUTH_URL`: Base URL of your app, such as `http://localhost:3000`.
- `NEXTAUTH_SECRET`: A secret string used by NextAuth.
- `GOOGLE_ID` and `GOOGLE_SECRET`: OAuth client ID and secret from Google Cloud.
- `GOOGLE_GEMINI_API`: API key from Google AI Studio.
- `NEWS_API`: API key from World News API.
- `UPSTASH_REDIS_REST_URL`: The REST URL provided by Upstash Redis.
- `UPSTASH_REDIS_REST_TOKEN`: The REST token provided by Upstash Redis.

## How to generate a secret key

Use this command to create a strong secret for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Copy the output into your `.env` file.

## Notes

- The app uses World News API for fetching news.
- Google login needs an OAuth client created in Google Cloud Console.
- Gemini summaries need a key from Google AI Studio.
- AI generated summaries are securely cached in Redis to drastically reduce API costs and improve response times (from ~8.2s down to ~72ms).

## Deployment & Cron Jobs

This app uses a scheduled background job to fetch news 6 times a day (every 4 hours).

- **Vercel Deployments**: Set `CRON_SECRET` in your project environment variables so scheduled calls can authenticate to `/api/jobs`.
- **Azure / VPS / Docker**: You must run the cron script alongside your web server. In your environment, start the background worker process using: `npm run cron`. Make sure both `NEXTAUTH_URL` (e.g., `NEXTAUTH_URL=https://your-production-domain.com`) and `CRON_SECRET` are set so the cron script can call the protected endpoint.

## Health Check

A simple health check endpoint is available for CI/CD pipelines, Docker deployments, or uptime monitors.

To verify the app is running, run:
```bash
curl http://localhost:3000/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-09T12:00:00.000Z"
}
```
