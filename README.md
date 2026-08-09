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
- The app uses Redis for caching and session-related features.
- Google login needs an OAuth client created in Google Cloud Console.
- Gemini summaries need a key from Google AI Studio.
