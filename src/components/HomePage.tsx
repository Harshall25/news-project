"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ArticleCard from "@/components/ArticleCard"
import ArticleCardSkeleton from "@/components/ArticleCardSkeleton"
import { useToast } from "@/hooks/use-toast"
import { logError, logInfo } from "@/lib/logger"
import type { Article } from "@/src/types"
import axios, { type CancelTokenSource } from "axios"

const PAGE_SIZE = 20
const SKELETON_COUNT = 8

function toErrorMessage(value: unknown): string {
  if (!value) return "Failed to fetch articles"
  if (typeof value === "string") return value
  if (typeof value === "object") {
    const maybeMessage = (value as { message?: unknown }).message
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      return maybeMessage
    }
    try {
      return JSON.stringify(value)
    } catch {
      return "Failed to fetch articles"
    }
  }
  return String(value)
}

interface HomePageProps {
  latestOrTrend: boolean
  setLatestortrend: (value: boolean) => void
}

export default function HomePage({ latestOrTrend, setLatestortrend }: HomePageProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const searchParams = useSearchParams()
  const category = searchParams.get("category")

  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const latestOrTrendRef = useRef(latestOrTrend)
  const categoryRef = useRef(category)
  const articlesRef = useRef(articles)
  const pageRef = useRef(page)
  const totalPagesRef = useRef(totalPages)
  const cancelTokenRef = useRef<CancelTokenSource | null>(null)
  const isFetchingRef = useRef(false)

  latestOrTrendRef.current = latestOrTrend
  categoryRef.current = category
  articlesRef.current = articles
  pageRef.current = page
  totalPagesRef.current = totalPages

  const fetchArticles = useCallback(
    async (nextPage: number, append: boolean) => {
      if (isFetchingRef.current) return
      isFetchingRef.current = true

      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("New request superseded")
      }
      cancelTokenRef.current = axios.CancelToken.source()

      const isTrending = latestOrTrendRef.current
      const cat = categoryRef.current

      try {
        if (append) {
          setLoadingMore(true)
        } else {
          setLoading(true)
        }
        setError(null)

        let res

        if (!isTrending) {
          let latestUrl = `/api/articles?page=${nextPage}&limit=${PAGE_SIZE}`
          if (cat) {
            latestUrl += `&category=${encodeURIComponent(cat)}`
          }
          res = await axios.get(latestUrl, { cancelToken: cancelTokenRef.current.token })

          if (res.data?.error) {
            throw new Error(toErrorMessage(res.data.error))
          }

          const incoming = Array.isArray(res.data?.articles) ? res.data.articles : []

          setArticles((prev) => (append ? [...prev, ...incoming] : incoming))
          setPage(typeof res.data?.page === "number" ? res.data.page : nextPage)
          setTotalPages(typeof res.data?.totalPages === "number" ? res.data.totalPages : 1)
        } else {
          let trendingUrl = "/api/trending"
          if (cat) {
            trendingUrl += `?category=${encodeURIComponent(cat)}`
          }
          res = await axios.get(trendingUrl, { cancelToken: cancelTokenRef.current.token })

          if (res.data?.error) {
            throw new Error(toErrorMessage(res.data.error))
          }

          const incoming = Array.isArray(res.data?.articles) ? res.data.articles : []
          setArticles(incoming)
          setPage(1)
          setTotalPages(1)
        }

        logInfo("Articles fetched", {
          count: articlesRef.current.length + (append ? 0 : 0),
          page: nextPage,
          type: isTrending ? "trending" : "latest",
          category: cat || "all",
        })
      } catch (e: unknown) {
        if (axios.isCancel(e)) {
          return
        }

        if (!append) {
          setArticles([])
        }

        let errorMessage = "Failed to fetch articles"
        let statusCode = 0

        if (axios.isAxiosError(e)) {
          statusCode = e.response?.status ?? 0
          errorMessage = toErrorMessage(e.response?.data?.error ?? e.message)
          logError("API Error", {
            status: statusCode,
            url: e.config?.url,
            message: errorMessage,
            type: latestOrTrendRef.current ? "trending" : "latest",
          })
        } else {
          errorMessage = toErrorMessage(e instanceof Error ? e.message : String(e))
          logError("Fetch Error", {
            message: errorMessage,
            type: latestOrTrendRef.current ? "trending" : "latest",
          })
        }

        setError(errorMessage)

        showToast(`${statusCode ? `Error ${statusCode}: ` : ""}${errorMessage}`, {
          type: "error",
          duration: 15000,
        })
      } finally {
        isFetchingRef.current = false
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [showToast]
  )

  // Trigger fetch when category or latestOrTrend changes
  useEffect(() => {
    setPage(1)
    setTotalPages(1)
    fetchArticles(1, false)
  }, [fetchArticles, latestOrTrend, category])

  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore) return
    if (latestOrTrendRef.current) return
    if (pageRef.current >= totalPagesRef.current) return

    const nextPage = pageRef.current + 1
    await fetchArticles(nextPage, true)
  }, [loading, loadingMore, fetchArticles])

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  )

  const handleLatestClick = () => {
    setLatestortrend(false)
    router.push("/")
  }

  const handleTrendingClick = () => {
    setLatestortrend(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button variant={!latestOrTrend ? "default" : "outline"} onClick={handleLatestClick}>
          Latest News
        </Button>
        <Button variant={latestOrTrend ? "default" : "outline"} onClick={handleTrendingClick}>
          Trending News
        </Button>
      </div>

      <main>
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          {latestOrTrend ? "Top News" : "Latest News"}
        </h1>

        {loading ? (
          renderSkeletons()
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="text-destructive font-medium">{error}</div>
            <Button variant="outline" onClick={() => fetchArticles(1, false)}>
              Try Again
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <p className="text-muted-foreground max-w-md">
              {category
                ? `No articles found for "${category}". Try a different category.`
                : "No articles available right now. Please try again later."}
            </p>
            <Button variant="outline" onClick={() => fetchArticles(1, false)}>
              Refresh
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {!latestOrTrend && page < totalPages && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="min-w-[200px]"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}