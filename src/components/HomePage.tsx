
"use client"
import NewsGrid from "@/components/NewsGrid";
import axios from "axios";
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

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
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const router = useRouter();
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError("");

        let res;

        if (latestOrTrend === false) {
          res = await axios.get(`/api/articles?page=1&limit=20${category ? `&category=${category}` : ''}`);        
        } 
        else {
          res = await axios.get(`/api/trending${category ? `?category=${category}` : ''}`);
        }

        if (res.data?.error) {
          setError(toErrorMessage(res.data.error));
        }

        setArticles(Array.isArray(res.data?.articles) ? res.data.articles : []);
      } catch (e: any) {
        setArticles([]);
        setError(toErrorMessage(e?.response?.data?.error ?? e?.message ?? e));
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [latestOrTrend, category]);

  return (
    <div>
      <div>
        <Button variant="outline" onClick={() => { setLatestortrend(false); router.push('/'); }}>Latest News</Button>
        <Button variant="outline" onClick={() => setLatestortrend(true)}>Trending News</Button>
        <main className="container mx-auto py-8">
          {latestOrTrend ? <h1 className="text-3xl font-bold mb-6">Top News</h1>
            : <h1 className="text-3xl font-bold mb-6">Latest News</h1>}
          {loading && <p>Loading news...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && articles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {category
                ? `No articles or news for this category (${category}). Try a different category.`
                : "No articles or news available right now. Please try again later."}
            </p>
          )}
          {!loading && !error && articles.length > 0 && (
            <NewsGrid articles={articles} />
          )}
        </main>
      </div>
    </div>

  );
}


