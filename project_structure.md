ai-news-app/
├── .env.local                          # Environment variables
├── prisma/
│   └── schema.prisma                   # Database models (User, Article, Upvote, etc.)
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                      # Homepage (news feed)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # NextAuth
│   │   │   ├── articles/route.ts              # GET articles (paginated)
│   │   │   ├── trending/route.ts              # GET trending
│   │   │   ├── upvote/route.ts                 # POST upvote
│   │   │   ├── summarize/route.ts              # POST summarize
│   │   │   └── user/route.ts                    # GET user data
│   │   └── (auth)/
│   │       ├── login/page.tsx
│   │       ├── register/page.tsx
│   │       └── verify/page.tsx
│   ├── components/
│   │   ├── NewsCard.tsx                 # Single article card (title, summary, buttons)
│   │   ├── NewsGrid.tsx                  # Grid of cards
│   │   ├── TrendingSection.tsx           # Trending list
│   │   └── SentimentBadge.tsx            # Positive/negative badge
│   ├── lib/
│   │   ├── prisma.ts                      # Prisma client
│   │   ├── redis.ts                       # Redis client
│   │   ├── auth.ts                         # NextAuth config
│   │   ├── ai.ts                            # OpenAI helper
│   │   ├── email.ts                         # Resend helper
│   │   └── rate-limit.ts                    # Rate limiting with Redis
│   ├── types/
│   │   └── index.ts                        # Shared TypeScript types
│   └── middleware.ts                        # Auth middleware (protect routes)
├── jobs/
│   └── fetch-news.ts                       # Daily cron script
├── package.json
└── tsconfig.json


##### What each part does
- prisma/ – Database schema and migrations.
- src/app/ – Next.js App Router: pages and API endpoints.
- src/components/ – Reusable UI pieces (cards, sections, badges).
- src/lib/ – Shared utilities: database clients, auth, AI, email, rate limiting.
- src/types/ – Global TypeScript interfaces (e.g., Article, User, API responses).
- src/middleware.ts – Protects API routes that require authentication.
- jobs/ – Standalone script for the daily news fetch (runs via cron).
Start with this, then add features incrementally. It’s clean, maintainable, and easy to expand.