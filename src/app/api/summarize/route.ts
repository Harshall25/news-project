import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import client from "@/lib/redis";
import { getServerSession } from "next-auth";

const geminiKey = process.env.GOOGLE_GEMINI_API;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    const cached = await client.get(`summary:${id}`);
    return NextResponse.json({ summary: cached || null });
  } catch (error) {
    return NextResponse.json({ summary: null });
  }
}

//you cache summary in the db to avoid more calls to the ai api
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!genAI) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const { content, articleId } = await req.json();

    if (!content || !articleId) {
      return NextResponse.json(
        { error: "Content and articleId required" },
        { status: 400 }
      );
    }

    const cacheKey = `summary:${articleId}`;
    try {
      const cached = await client.get(cacheKey);
      if (cached) {
        // Upstash returns the raw string here, no need to JSON.parse it!
        return NextResponse.json({ summary: cached });
      }
    } catch (cacheError: unknown) {
      console.error("Redis read failed:", cacheError instanceof Error ? cacheError.message : String(cacheError));
    }

    const trimmed = content.slice(0, 8000);

    const prompt = `
      Write a factual news summary in English.

      Rules:
      - Max 300 words (strict limit)
      - 2–3 short paragraphs
      - Include key events, entities, and outcomes
      - No repetition, no opinions

      Article:
      ${trimmed}
    `;

    

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    //cache in the redis with ttl of 300 seconds,
    try {
      await client.setex(cacheKey, 600, summary);
    } catch (cacheError: unknown) {
      console.error("Redis write failed:", cacheError instanceof Error ? cacheError.message : String(cacheError));
    }

    return NextResponse.json({ summary });

  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.log(errorMsg)
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}