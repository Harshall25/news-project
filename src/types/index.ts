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

export interface Article {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string | Date;
  content: string;
  sentiment: string;
  category: string | null;
  createdAt: string | Date;
  imageUrl: string | null;
}
