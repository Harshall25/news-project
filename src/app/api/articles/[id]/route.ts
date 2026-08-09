import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Invalid id" },
        { status: 400 }
      );
    }

    const article = await prisma.article.findUnique({
      where: {
        id: id,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "No article found" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);

  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}