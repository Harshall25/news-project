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
        "source-country": "IN",
        language: "en",
        number: 100,
        offset: 0,
      },
    });

    //Correct response path
    const articles = res.data.news;

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: "No articles fetched" });
    }

    //filter articles with positive sentiment only
    const filteredArticles = articles.filter((item:any) => item.sentiment>0);

    // Format data
    const formatted = filteredArticles.map((a: any) => ({
      title: a.title,
      source: new URL(a.url).hostname,
      url: a.url,
      publishedAt: new Date(a.publish_date),
      content: a.text,
      sentiment:
        a.sentiment > 0 ? "positive" : a.sentiment < 0 ? "negative" : "neutral",
      category: a.categories?.[0] || "general",
      imageUrl:a.image || null,
    }));

    //Insert into database
    await prisma.article.createMany({
      data: formatted,
      skipDuplicates: true,
    });

    return NextResponse.json({ success: true,message :"successfull fetched"});
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