import ArticleCard from "./ArticleCard";

import { Article } from "@/src/types";

interface NewsGridProps{
    articles: Article[]
}

//maps each card with its own article data
export default function NewsGrid({articles}:NewsGridProps){
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {articles.map((article)=>(
                <ArticleCard key={article.id} article={article} />
            ))}
        </div>
    )
}