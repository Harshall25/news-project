"use client"

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
import { useState } from "react"
import { ExternalLink } from "lucide-react"

const PLACEHOLDER_IMAGE =
  "https://picsum.photos/seed/news-placeholder/800/450.jpg"

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  // Start visible — Next.js Image's built-in blurDataURL handles the loading
  // state. The old `mounted` pattern caused every image to flash invisible
  // on mount, which was the primary flickering source.
  const [isLoading, setIsLoading] = useState(true)

  const handleImageLoad = () => setIsLoading(false)
  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  const imageSrc = article.imageUrl && !imageError
    ? article.imageUrl
    : PLACEHOLDER_IMAGE

  return (
    <Card className="group relative mx-auto w-full max-w-sm pt-0 overflow-hidden transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={imageSrc}
          alt={article.title || "News article image"}
          width={400}
          height={225}
          className={`
            relative z-10 aspect-video w-full object-cover
            transition-all duration-500 ease-out
            group-hover:scale-[1.03]
            ${!isLoading ? "opacity-100" : "opacity-0"}
            ${imageError ? "grayscale" : ""}
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
        {isLoading && (
          <div className="absolute inset-0 animate-shimmer z-20" />
        )}
        {article.category && (
          <div className="absolute top-3 left-3 z-30">
            <Badge variant="default" className="text-xs px-2 py-0.5 shadow-sm capitalize">
              {article.category}
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="font-display line-clamp-2 min-h-12 text-lg leading-snug tracking-tight group-hover:text-primary transition-colors duration-200">
          {article.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {article.publishedAt
            ? new Date(article.publishedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : ""}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button
          className="flex-1 gap-2"
          onClick={() => router.push(`/article/${article.id}`)}
        >
          Summarize
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          asChild
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-4" data-icon="inline-start" />
            Original
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}