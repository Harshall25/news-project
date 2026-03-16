
"use client"
import NewsGrid from "@/components/NewsGrid";
import axios from "axios";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const res = await axios.get(`${baseUrl}/api/articles?page=1&limit=20`);
      setArticles(res.data.articles);
    };
    fetchArticles();
  }, []);

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Latest News</h1>
      <NewsGrid articles={articles} />
    </main>
  );
}


