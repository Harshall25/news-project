
"use client"
import NewsGrid from "@/components/NewsGrid";
import axios from "axios";
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";

export default function HomePage({ latestOrTrend, setLatestortrend }: any) {
  const [articles, setArticles] = useState([]);
  
  useEffect(() => {
  const fetchArticles = async () => {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    let res;

    if (latestOrTrend === "latest") {
      res = await axios.get(`${baseUrl}/api/articles?page=1&limit=20`);
      setArticles(res.data.articles);
    } else {
      res = await axios.get(`${baseUrl}/api/trending`);
      setArticles(res.data.articles)
    }
    
  };

  fetchArticles();
}, [latestOrTrend]);

  return (
    <div>
      <div>
      <Button variant="outline" onClick={()=>setLatestortrend("latest")}>Latest News</Button> 
      <Button variant="outline" onClick={()=>setLatestortrend("top")}>Top News</Button>
    <main className="container mx-auto py-8">
      {latestOrTrend ? <h1 className="text-3xl font-bold mb-6">Top News</h1>
                      : <h1 className="text-3xl font-bold mb-6">Latest News</h1>}
      <NewsGrid articles={articles} />
    </main>
    </div>
    </div>

  );
}


