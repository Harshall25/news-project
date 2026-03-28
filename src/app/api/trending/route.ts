// get trending
import axios from "axios"
import { Key } from "lucide-react";
import { NextResponse } from "next/server";
export const GET = async () => {

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

    return NextResponse.json({
      articles: result,   // ✅ same key
      count: result.length
    });
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
