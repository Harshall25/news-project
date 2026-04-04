"use client"
import NewsGrid from "@/components/NewsGrid";
import axios from "axios";
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 20;

function toErrorMessage(value: unknown): string {
  if (!value) return "Failed to fetch articles";
  if (typeof value === "string") return value;

  if (typeof value === "object") {
    const maybeMessage = (value as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      return maybeMessage;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return "Failed to fetch articles";
    }
  }

  return String(value);
}

export default function HomePage({ latestOrTrend, setLatestortrend }: any) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const router = useRouter();

  const fetchArticles = async (nextPage: number, append: boolean) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");

      let res;

      if (latestOrTrend === false) {
        let latestUrl =
          "/api/articles?page=" +
          String(nextPage) +
          "&limit=" +
          String(PAGE_SIZE);

        if (category) {
          latestUrl += "&category=" + encodeURIComponent(category);
        }

        res = await axios.get(latestUrl);

        if (res.data?.error) {
          setError(toErrorMessage(res.data.error));
        }

        const incoming = Array.isArray(res.data?.articles) ? res.data.articles : [];

        setArticles((prev) => (append ? [...prev, ...incoming] : incoming));

        setPage(typeof res.data?.page === "number" ? res.data.page : nextPage);
        setTotalPages(typeof res.data?.totalPages === "number" ? res.data.totalPages : 1);
      } else {
        let trendingUrl = "/api/trending";
        if (category) {
          trendingUrl += "?category=" + encodeURIComponent(category);
        }

        res = await axios.get(trendingUrl);

        if (res.data?.error) {
          setError(toErrorMessage(res.data.error));
        }

        const incoming = Array.isArray(res.data?.articles) ? res.data.articles : [];
        setArticles(incoming);

        setPage(1);
        setTotalPages(1);
      }
    } catch (e: any) {
      if (!append) {
        setArticles([]);
      }
      setError(toErrorMessage(e?.response?.data?.error ?? e?.message ?? e));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  //when news type change reload
  useEffect(() => {
    setPage(1);
    setTotalPages(1);
    fetchArticles(1, false);
  }, [latestOrTrend, category]);

  
  const handleLoadMore = async () => {
    if (loading || loadingMore) return;
    if (latestOrTrend) return;
    if (page >= totalPages) return;

    const nextPage = page + 1;
    await fetchArticles(nextPage, true);
  };

  return (
    <div>
      <div>
        <Button variant="outline" onClick={() => { setLatestortrend(false); router.push("/"); }}>
          Latest News
        </Button>
        <Button variant="outline" onClick={() => setLatestortrend(true)}>
          Trending News
        </Button>

        <main className="container mx-auto py-8">
          {latestOrTrend ? (
            <h1 className="text-3xl font-bold mb-6">Top News</h1>
          ) : (
            <h1 className="text-3xl font-bold mb-6">Latest News</h1>
          )}

          {loading && <p>Loading news...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && articles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {category
                ? "No articles or news for this category (" + category + "). Try a different category."
                : "No articles or news available right now. Please try again later."}
            </p>
          )}

          {!loading && !error && articles.length > 0 && (
            <>
              <NewsGrid articles={articles} />

              {!latestOrTrend && page < totalPages && (
                <div className="mt-8 flex justify-center">
                  <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline">
                    {loadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}