//1. fetched news from the api 
//2. remaining to insert in db
import axios from "axios"
import { NextResponse } from "next/server"

const url = "https://api.worldnewsapi.com/top-news?source-country=in"

export async function GET() {
  try {
    const res = await axios.get(url, {
      headers: {
        "x-api-key": process.env.NEWS_API as string
      },
      params: {
        language: "en",
        number: 20,
        offset: 0
      }
    })

    const articles = res.data;

    return NextResponse.json({ articles })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || "API error" },
      { status: 500 }
    )
  }
}