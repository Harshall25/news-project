# Product Requirements Document (PRD) AI-Powered News App – MVP (Final)

## 1. Overview
A modern news aggregation web app that delivers a personalized, ad‑free experience. Articles are fetched daily from a news API and stored in a PostgreSQL database. Users can sign up, verify their email, and interact with the news feed by upvoting articles, filtering by sentiment (positive only), viewing trending content, and generating AI summaries on demand. The app is built with Next.js, TypeScript, React, and Tailwind CSS, and uses Redis for caching, session management, and rate limiting.

## 2. User Stories
- As a user, I want to sign up/login using email/password or Google so I can access personalized features.
- As a new user, I want to verify my email address to secure my account.
- As a user, I want to browse a grid of news articles showing title, source, and sentiment badge.
- As a user, I want to click a "Summarize" button on a news card to generate and view an AI‑generated summary of that article.
- As a user, I want to click a "Details" button to expand a card and see the original article description.
- As a user, I want to click a "Link" button to go to the original article source.
- As a user, I want to upvote articles I like.
- As a user, I want to filter news to see only positive sentiment articles.
- As a user, I want to see a "Trending" section that highlights articles with the most upvotes.
- As a user, I want pagination to browse through articles.

## 3. Functional Requirements
### 3.1 Authentication & User Management
**Sign Up / Login:**

- Email/password with NextAuth.js (Credentials provider).
- Google OAuth (Google provider).

**Email Verification:**

- Upon signup, send verification email using Resend.
- Users cannot access feed until email is verified.
- Verification tokens stored in database (or Redis) with expiration.

**Session Management:**

- Persistent sessions via NextAuth with Redis as the session store for fast lookups and scalability.
- Redis adapter for NextAuth.

### 3.2 News Data Pipeline
**Daily Scheduled Fetch:**

- Cron job (e.g., Vercel Cron) runs daily at a scheduled time to fetch latest articles from NewsAPI.ai (free tier).
- Fetched articles include: title, source, URL, published date, full content, and sentiment (positive/negative/neutral).

**Storage:**

- Store raw article data in PostgreSQL: title, source, URL, publishedAt, content (full), sentiment.
- Duplicate prevention based on URL (unique constraint).
- No AI enrichment in pipeline – summaries are generated on demand.

### 3.3 User Interaction (Frontend)
**News Grid:**

- Display articles in a responsive grid.
- Each card shows: title, source, sentiment badge, upvote count, and action buttons.

**Buttons per card:**

- Summarize: Calls an API route (POST /api/summarize) that generates a one‑line AI summary using OpenAI (gpt‑3.5‑turbo) and displays it on the card. Summary is not stored in DB; cached in component state for the session.
- Details: Expands card to show the original article description (from fetched content).
- Link: Opens original article URL in new tab.

**Upvoting:**

- Logged-in users can upvote an article once.
- Upvote count updates in real-time (optimistic UI).
- Prevent duplicate upvotes per user per article via database constraint.

**Filtering:**

- Toggle to show only positive sentiment articles (negative/neutral hidden).
- Default: show all articles.

**Trending Section:**

- Separate section (e.g., sidebar or top row) displaying top 5 articles with highest upvote count (all‑time or last 24h).
- Data fetched from GET /api/trending and cached in Redis.

**Pagination:**

- Load more button or numbered pages (infinite scroll optional).

### 3.4 Backend API (Next.js API Routes)
**GET /api/articles:**

- Returns paginated list of articles with optional sentiment filter and sorting by date.
- Response cached in Redis with TTL (e.g., 5 minutes). Cache invalidated when new articles are added or upvotes change (eventual consistency acceptable).

**POST /api/upvote:**

- Handles upvoting (checks auth, updates count). Uses database unique constraint to prevent duplicates.
- After successful upvote, optionally invalidate relevant Redis caches (articles list and trending).

**GET /api/trending:**

- Returns top upvoted articles (e.g., top 5). Cached in Redis with short TTL (1‑2 minutes) or updated via sorted sets for real‑time accuracy.

**GET /api/user:** Returns current user data.

**POST /api/summarize:**

- Accepts article content, calls OpenAI (or other LLM), returns one‑line summary.
- Rate limiting enforced via Redis (e.g., per user: 10 requests/day, per IP: 20 requests/day) to control costs.

**GET /api/auth/verify:** Endpoint to handle email verification tokens (mark user as verified).

### 3.5 Database Schema (Prisma)
```prisma
model User {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String?
  emailVerified  DateTime?
  image          String?
  accounts       Account[]
  upvotes        Upvote[]
  createdAt      DateTime  @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Article {
  id          String    @id @default(cuid())
  title       String
  source      String
  url         String    @unique
  publishedAt DateTime
  content     String    // full article text
  sentiment   String    // positive, negative, neutral
  upvotes     Upvote[]
  createdAt   DateTime  @default(now())
}

model Upvote {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  article   Article  @relation(fields: [articleId], references: [id])
  articleId String
  createdAt DateTime @default(now())

  @@unique([userId, articleId])
}

// Optional: Verification tokens table if not using Redis
model VerificationToken {
  id         String   @id @default(cuid())
  identifier String
  token      String   @unique
  expires    DateTime
  createdAt  DateTime @default(now())

  @@unique([identifier, token])
}
```

### 3.6 Redis Usage
**Session Store:** NextAuth sessions stored in Redis for fast access.

**Cache:**

- Article lists (paginated, filtered) – key: articles:page:{page}:filter:{sentiment}
- Trending articles – key: trending
- TTL: 5 minutes for articles, 1‑2 minutes for trending.

**Rate Limiting:** Counters for /api/summarize – key: rate:summarize:{userId or IP} with expiry.

## 4. Technical Stack
- Framework: Next.js 14 (App Router), TypeScript
- UI: React, Tailwind CSS, shadcn/ui (optional)
- Authentication: NextAuth.js (Credentials + Google) with Redis session store
- Database: PostgreSQL (Neon or Supabase) with Prisma ORM
- Caching & Session Store: Redis (Upstash or Redis Cloud)
- AI: OpenAI API (gpt-3.5-turbo) for on‑demand summary generation
- Email: Resend for verification emails
- Cron: Vercel Cron Jobs or GitHub Actions for daily fetch
- Deployment: Vercel

## 5. Data Flow Diagram
![alt text](SysDesign_OF_aiNEwsAPP.png)

## 6. MVP Feature Checklist
- Authentication (email/password + Google) with email verification
- Redis session store for NextAuth
- Daily scheduled news fetch from NewsAPI.ai
- PostgreSQL storage of articles, users, upvotes
- Redis caching for article lists and trending
- News grid with title, source, sentiment badge, upvote count
- On‑demand AI summary generation via "Summarize" button
- Rate limiting on /api/summarize using Redis
- Expandable details showing original description
- Link to original article
- Upvoting system with duplicate prevention
- Filter to show only positive sentiment articles
- Trending section based on upvotes (cached)
- Pagination

## 7. Future Enhancements (Post-MVP)
- Personalization based on upvote history
- Negative sentiment toggle (show/hide)
- Comments section
- Push notifications for trending topics
- Weekly email digest with AI‑generated insights
- Pre‑generate summaries for popular articles using background jobs (Bull + Redis)
- Use Redis sorted sets for real‑time trending leaderboards
- Add more AI providers (Groq, Gemini) for fallback
- Implement WebSockets for live upvote updates