import { prisma } from "@/lib/prisma";
import axios from "axios";
import { NextResponse } from "next/server";
//fetchs news from the api and inserts in the db

const url = "https://api.worldnewsapi.com/search-news";

export async function GET() {
  try {
    const res = await axios.get(url, {
      params: {
        "api-key": process.env.NEWS_API,
        "source-country": "US",
        language: "en",
        number: 100,
        offset: 5,
        categories: "sports,business,technology,entertainment,science,travel,culture,education,environment,health,politics"
      },
    });

    //Correct response path
    const articles = res.data.news;

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: "No articles fetched" });
    }

    const normalizedCategory = (article: any) => {
      const rawCategory = article.category ?? (Array.isArray(article.categories) ? article.categories[0] : article.categories);
      if (typeof rawCategory !== "string" || rawCategory.trim().length === 0) {
        return "general";
      }
      return rawCategory.trim().toLowerCase();
    };

    // filter articles with positive sentiment and exclude politics
    const filteredArticles = articles.filter((item: any) =>
      item.sentiment > 0
    );
    // Format data
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

    // Upsert by url so existing rows get refreshed category/content values.
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

    return NextResponse.json({ success: true, formatted});
  } catch (error: any) {
    console.error("Cron job failed:", error);

    if (error.response) {
      // API returned an error (e.g., 401, 429)
      return NextResponse.json(
        { error: error.response.data },
        { status: error.response.status }
      );
    } else if (error.request) {
      // Network error, no response
      return NextResponse.json(
        { error: "No response from World News API" },
        { status: 503 }
      );
    } else {
      // Other error
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }
}