import { Article as PrismaArticle } from "@prisma/client";

export interface WorldNewsArticle {
  title: string;
  source?: string;
  url: string;
  publish_date?: string;
  text?: string;
  sentiment: number;
  category?: string;
  categories?: string | string[];
  image?: string;
  news?: WorldNewsArticle[];
}

export interface WorldNewsResponse {
  top_news: {
    news: WorldNewsArticle[];
  }[];
}

export type Article = PrismaArticle;
