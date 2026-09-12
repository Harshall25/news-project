"use client"
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

const CATEGORIES = [
  { label: "General", value: "general" },
  { label: "Technology", value: "technology" },
  { label: "Business", value: "business" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Sports", value: "sports" },
  { label: "Travel", value: "travel" },
  { label: "Education", value: "education" },
  { label: "Politics", value: "politics" },
];

function NavContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300 supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="shrink-0 font-display text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            Open<span className="text-primary">News</span>
          </button>

          {/* Category tabs — only shown when authenticated.
              During session load, render an invisible spacer so the nav
              doesn't reflow when the status resolves. */}
          {status === "loading" ? (
            <div className="flex-1" />
          ) : status === "authenticated" ? (
            <nav
              className="flex-1 flex items-center overflow-x-auto hide-scrollbar"
              aria-label="News categories"
            >
              <div className="flex items-center gap-1 min-w-max px-1">
                <button
                  onClick={() => router.push("/")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap ${
                    !activeCategory
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => router.push(`/?category=${cat.value}`)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap ${
                      activeCategory === cat.value
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </nav>
          ) : (
            <p className="hidden md:block text-sm text-muted-foreground text-pretty flex-1">
              Curated news with AI summaries and sentiment analysis.
            </p>
          )}

          {/* Right — user controls.
              A fixed-width wrapper is always rendered so the nav never
              reflowswhen the session resolves (eliminates the layout jump). */}
          <div className="shrink-0 flex items-center gap-3 min-w-[120px] justify-end">
            {status === "loading" ? (
              /* Skeleton placeholder — same footprint as avatar + button */
              <>
                <div className="size-8 rounded-full animate-shimmer" />
                <div className="h-8 w-20 rounded-md animate-shimmer" />
              </>
            ) : status === "authenticated" && session?.user ? (
              <>
                {/* Avatar bubble */}
                <div
                  className="size-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0"
                  title={session.user.name ?? "User"}
                >
                  <span className="text-xs font-semibold text-primary leading-none">
                    {initials ?? "?"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-sm"
                >
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => router.push("/login")}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function NavBar() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-40 w-full h-16 border-b border-border bg-background/80 backdrop-blur-md" />
    }>
      <NavContent />
    </Suspense>
  );
}