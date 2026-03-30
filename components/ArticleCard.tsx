import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { redirect } from "next/dist/server/api-utils";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    source: string;
    url :string,
    publishedAt: string;
    category: string;
    imageUrl: string,
    image?: string,
    _count: { upvotes: number };
  }
}
//article card component
export default function ArticleCard({ article }: ArticleCardProps) {
  return <>
    <Card className="relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src={article.imageUrl || article.image}
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover "
      />
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{article.category}</Badge>
        </CardAction>
        <CardTitle className="line-clamp-3 min-h-17.5">{article.title}</CardTitle>
        <CardDescription>{new Date(article.publishedAt).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex w-full flex-2">
          <Button className="w-1/2">Summerized article</Button>
          <Button className="w-1/2"><a href={article?.url} target="_blank" rel="noopener noreferrer">
            Original Article
          </a></Button>
        </div>
      </CardFooter>
    </Card>
  </>
}



