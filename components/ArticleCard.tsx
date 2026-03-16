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

interface ArticleCardProps{
    article:{
        id:string;
        title:string;
        source:string;
        publishedAt:string;
        category:string;
        imageUrl :string;
        _count : { upvotes: number };
    }
}
//article card component
export default function ArticleCard({article}:ArticleCardProps){
    return <>
      <Card className="relative mx-auto w-full max-w-sm pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src={article.imageUrl}
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover "
      />
      <CardHeader>
        <CardAction>
          <Badge variant="secondary">{article.category}</Badge>
        </CardAction>
        <CardTitle>{article.title}</CardTitle>
        <CardDescription>{new Date(article.publishedAt).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardFooter>
        <div className="flex w-full">
          <Button className="w-4/4">See article</Button>
          
        </div>
      </CardFooter>
    </Card>
    </>
}



