
"use client"
import NewsGrid from "@/components/NewsGrid";
import axios from "axios";
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";

export default function HomePage({ latestOrTrend, setLatestortrend }: any) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError("");

      let res;

      if (latestOrTrend === false) {
        res = await axios.get(`/api/articles?page=1&limit=20`);
      } else {
        res = await axios.get(`/api/trending`);
      }

      if (res.data?.error) {
        setError(res.data.error);
      }

      setArticles(Array.isArray(res.data?.articles) ? res.data.articles : []);
    } catch (e: any) {
      setArticles([]);
      setError(e?.message || "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };
  
  fetchArticles();
}, [latestOrTrend]);

  return (
    <div>
      <div>
      <Button variant="outline" onClick={()=>setLatestortrend(false)}>Latest News</Button> 
      <Button variant="outline" onClick={()=>setLatestortrend(true)}>Trending News</Button>
    <main className="container mx-auto py-8">
      {latestOrTrend ? <h1 className="text-3xl font-bold mb-6">Top News</h1>
                      : <h1 className="text-3xl font-bold mb-6">Latest News</h1>}
      {loading && <p>Loading news...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <NewsGrid articles={articles} />
    </main>
    </div>
    </div>

  );
}


