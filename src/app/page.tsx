"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import HomePage from "../components/HomePage"

function PageSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Toggle skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-9 w-28 rounded-md animate-shimmer" />
        <div className="h-9 w-32 rounded-md animate-shimmer" />
      </div>
      {/* Heading skeleton */}
      <div className="h-8 w-40 rounded-md animate-shimmer mb-6" />
      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-border">
            <div className="aspect-video w-full animate-shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded animate-shimmer" />
              <div className="h-4 w-1/2 rounded animate-shimmer" />
              <div className="flex gap-2 pt-1">
                <div className="h-9 flex-1 rounded animate-shimmer" />
                <div className="h-9 flex-1 rounded animate-shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default function Home() {
  const [latestOrTrend, setLatestOrTrend] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register")
    }
  }, [status, router])

  // Show the full-layout skeleton while session resolves — prevents CLS
  if (status === "loading") return <PageSkeleton />

  // Will redirect — render nothing to avoid flash
  if (!session) return null

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <HomePage latestOrTrend={latestOrTrend} setLatestortrend={setLatestOrTrend} />
    </main>
  )
}
