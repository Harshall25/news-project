import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Article } from "@/src/types"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ArticleCardProps {
  article: Article;
}
//article card component
export default function ArticleCard({ article }: ArticleCardProps) {
  const router = useRouter();
  return <>
    <Card className="relative mx-auto w-full max-w-sm pt-0 transition-transform duration-500 ease-in-out hover:scale-102">
      <div className="absolute inset-0 z-30 aspect-video " />
      {article.imageUrl && (
        <Image
          src={article.imageUrl}
          alt={article.title || "News article image"}
          width={400}
          height={225}
          className="relative z-20 aspect-video w-full object-cover "
        />
      )}
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{article.category}</Badge>
        </CardAction>
        <CardTitle className="line-clamp-3 min-h-17.5">{article.title}</CardTitle>
        <CardDescription>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ""}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex w-full flex-2">
          <Button
            className="w-1/2 cursor-pointer"
            onClick={()=>router.push(`/article/${article.id}`)}
          >Summerized article</Button>
          <Button className="w-1/2"><a href={article?.url} target="_blank" rel="noopener noreferrer">
            Original Article
          </a></Button>
        </div>
      </CardFooter>
    </Card>
  </>
}



