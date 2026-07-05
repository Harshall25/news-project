import { fetchNews } from "../../../jobs/fetch-news";
import client from "@/lib/redis";
import axios from "axios";
import { NextResponse } from "next/server";

export const GET = async () => {

  await fetchNews();
  const cacheKey = "trendingNews";

  try{
    const cached = await client.get(cacheKey);
    if(cached){
      return NextResponse.json(JSON.parse(cached));
    }
  }catch(cacheError:any){
    console.error("Redis write failed:", cacheError?.message || cacheError);
  }
  
  try {
    const url = "https://api.worldnewsapi.com/top-news";
    //format date
    const formatDateISO = (date: any) => {
      return date.toLocaleDateString('en-CA');
    };

    const currentDate = new Date(); // curr date
    const response = await axios.get(url, {
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
    const newsArr = top_news.flatMap((item: any) => item.news || []);

    //filter with positive sentiment
    const filteredNews = newsArr.filter((item: any) => item.sentiment > 0);
    const result = filteredNews.slice(0, 20); //limiting the response
    const count = result.length;

    const resul = {
      articles: result,
      count: result.length
    }

    //enter in the cache
    try {
      await client.setEx(cacheKey, 300, JSON.stringify(resul));
    } catch (cacheError: any) {
      console.error("Redis write failed:", cacheError?.message || cacheError);
    }

    return NextResponse.json(resul);
  } catch (e: any) {
    if (e.response) {
      return NextResponse.json({
        "error": e.response.data
      })
    } else if (e.request) {
      return NextResponse.json({
        "error": e.request.data
      })
    }
    return NextResponse.json({
      "error": e.data
    })
  }
} 
