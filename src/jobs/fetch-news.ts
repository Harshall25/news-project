import axios from "axios";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const url = "https://api.worldnewsapi.com/search-news";

export async function fetchNews() {
  const res = await axios.get(url, {
    params: {
      "api-key": process.env.NEWS_API,
      "source-country": "US",
      language: "en",
      number: 100,
      offset: 0,
      categories:
        "sports,business,technology,entertainment,science,travel,culture,education,environment,health,politics",
    },
  });

  const articles = res.data.news;

  if (!articles || articles.length === 0) {
    return [];
  }

  const normalizedCategory = (article: any) => {
    const rawCategory =
      article.category ??
      (Array.isArray(article.categories) ? article.categories[0] : article.categories);
    if (typeof rawCategory !== "string" || rawCategory.trim().length === 0) {
      return "general";
    }
    return rawCategory.trim().toLowerCase();
  };

  const filteredArticles = articles.filter((item: any) => item.sentiment > 0);

  const formatted: Array<{
    title: string;
    source: string;
    url: string;
    publishedAt: Date;
    content: string;
    sentiment: string;
    category: string;
    imageUrl: string | null;
  }> = filteredArticles.map((a: any) => ({
    title: a.title,
    source: new URL(a.url).hostname,
    url: a.url,
    publishedAt: new Date(a.publish_date),
    content: a.text,
    sentiment:
      a.sentiment > 0 ? "positive" : a.sentiment < 0 ? "negative" : "neutral",
    category: normalizedCategory(a),
    imageUrl: a.image || null,
  }));

  await Promise.all(
    formatted.map((article) =>
      prisma.article.upsert({
        where: { url: article.url },
        update: {
          title: article.title,
          source: article.source,
          publishedAt: article.publishedAt,
          content: article.content,
          sentiment: article.sentiment,
          category: article.category,
          imageUrl: article.imageUrl,
        },
        create: article,
      })
    )
  );

  return formatted;
}

export async function handleFetchNewsRequest() {
  try {
    const formatted = await fetchNews();

    if (formatted.length === 0) {
      return NextResponse.json({ message: "No articles fetched" });
    }

    return NextResponse.json({ success: true, formatted });
  } catch (error: any) {
    console.error("Cron job failed:", error);

    if (error.response) {
      return NextResponse.json(
        { error: error.response.data },
        { status: error.response.status }
      );
    }

    if (error.request) {
      return NextResponse.json(
        { error: "No response from World News API" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}