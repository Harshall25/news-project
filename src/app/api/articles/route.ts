import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
//fetches news articles from the db
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sentiment = searchParams.get('sentiment');
  const category = searchParams.get('category');
  const search = searchParams.get('q');

  const where: any = {};
  if (sentiment) where.sentiment = sentiment;
  if (category) where.category = category;
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  try {
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { upvotes: true } }
        }
      }),
      prisma.article.count({ where })
    ]);

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: "No articles fetched", articles: [] });
    }

    return NextResponse.json({
      articles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}