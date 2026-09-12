import { Card, CardHeader, CardFooter } from "@/components/ui/card"

export default function ArticleCardSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-sm pt-0 overflow-hidden">
      {/* Image placeholder with shimmer */}
      <div className="aspect-video w-full animate-shimmer" />
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="h-5 w-full rounded animate-shimmer" />
        <div className="h-5 w-3/4 rounded animate-shimmer" />
        <div className="h-4 w-1/3 rounded animate-shimmer mt-1" />
      </CardHeader>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <div className="h-9 flex-1 rounded-md animate-shimmer" />
        <div className="h-9 flex-1 rounded-md animate-shimmer" />
      </CardFooter>
    </Card>
  )
}