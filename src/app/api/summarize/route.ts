import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//you cache summary in the db to avoid more calls to the ai api
export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content required" },
        { status: 400 }
      );
    }
    //you may also cache summary in the db to avoid more calls to the ai api
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
    console.log(summary);
    return NextResponse.json({ summary });

  } catch (e: any) {
    console.log(e.message)
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}