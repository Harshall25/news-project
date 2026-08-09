import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/redis";
import { Prisma } from "@prisma/client";

//fetches news articles from the db

//currently using cloud redis (30mb) so latency is 10 to 100ms 
//for local latency is 2 to 5 ms, also local redis is not use ful  for deploying, 
//docker redis or the cloud redis is must
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '40');
  const sentiment = searchParams.get('sentiment');
  const category = searchParams.get('category');
  const search = searchParams.get('q');

  const where: Prisma.ArticleWhereInput = {};
  if (sentiment) where.sentiment = sentiment;
  if (category) where.category = category;
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }
 
  //Redis usage in endpoint
  //1) set cache key.
  const cacheKey = `articles:page:${page}:limit:${limit}:sentiment:${sentiment || ''}:category:${category || ''}:q:${search || ''}`;
  try {
    const cached = await client.get(cacheKey); //get val from key
    if (cached) {
      return NextResponse.json(typeof cached === 'string' ? JSON.parse(cached) : cached); //return get value
    }
  } catch (cacheError: unknown) {
    console.error("Redis read failed:", cacheError instanceof Error ? cacheError.message : String(cacheError));
  }

  try {
    //if not cached then query db 
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc"},
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where })
    ]);

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: "No articles fetched", articles: [] });
    }

    const result = {
      articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    //cache in the redis with ttl of 300 seconds,
    try {
      await client.setex(cacheKey, 300, result);
    } catch (cacheError: unknown) {
      console.error("Redis write failed:", cacheError instanceof Error ? cacheError.message : String(cacheError));
    }

    return NextResponse.json(result);

  } catch(error: unknown) {
    return NextResponse.json({
      articles: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}