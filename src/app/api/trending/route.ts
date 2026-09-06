import client from "@/lib/redis";
import axios from "axios";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const GET = async (req: Request) => {
  const ip = getClientIp(req.headers);
  const { success } = await checkRateLimit("trending", ip);
  if (!success) {
    return NextResponse.json({
      error: "Too many requests. Please try again later."
    }, { status: 429 });
  }

  const cacheKey = "trendingNews";

  try{
    const cached = await client.get(cacheKey);
    if(cached){
      return NextResponse.json(typeof cached === 'string' ? JSON.parse(cached) : cached);
    }
  }catch(cacheError: unknown){
    console.error("Redis write failed:", cacheError instanceof Error ? cacheError.message : String(cacheError));
  }

  try {
    const url = "https://api.worldnewsapi.com/top-news";
    //format date
    const formatDateISO = (date: Date) => {
      return date.toLocaleDateString('en-CA');
    };

    const currentDate = new Date(); // curr date
    const response = await axios.get(url, {
      timeout: 10000,
      params: {
        'source-country': 'US',
        'api-key': process.env.NEWS_API,
        language: 'en',
        date: formatDateISO(currentDate), //use fns
        number: 20
      }
    })

    const data = response.data;
    const top_news = data.top_news;
    const newsArr = top_news.flatMap((item: { news?: Array<{ sentiment?: number }> }) => item.news || []);

    //filter with positive sentiment
    const filteredNews = newsArr.filter((item) => (item.sentiment ?? 0) > 0);
    const resultArticles = filteredNews.slice(0, 20); //limiting the response

    const result = {
      articles: resultArticles,
      count: resultArticles.length
    }

    //enter in the cache
    try {
      await client.setex(cacheKey, 300, result);
    } catch (cacheError: unknown) {
      console.error("Redis write failed:", cacheError instanceof Error ? cacheError.message : String(cacheError));
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response) {
      return NextResponse.json({
        "error": e.response.data
      }, { status: e.response.status || 500 })
    } else if (axios.isAxiosError(e) && e.request) {
      return NextResponse.json({
        "error": "Network error"
      }, { status: 503 })
    }
    return NextResponse.json({
      "error": e instanceof Error ? e.message : String(e)
    }, { status: 500 })
  }
}
