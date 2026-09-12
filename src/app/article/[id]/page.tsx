"use client"
import { useEffect, useState } from "react"
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
// @ts-ignore
import { Article } from "@/src/types";

function ArticleSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-pulse">
      <div className="aspect-video w-full rounded-xl bg-muted animate-shimmer" />
      <div className="space-y-3">
        <div className="h-8 w-4/5 rounded bg-muted animate-shimmer" />
        <div className="h-8 w-2/3 rounded bg-muted animate-shimmer" />
      </div>
      <div className="h-4 w-1/3 rounded bg-muted animate-shimmer" />
      <div className="space-y-2 pt-4">
        <div className="h-4 w-full rounded bg-muted animate-shimmer" />
        <div className="h-4 w-11/12 rounded bg-muted animate-shimmer" />
        <div className="h-4 w-full rounded bg-muted animate-shimmer" />
        <div className="h-4 w-4/5 rounded bg-muted animate-shimmer" />
      </div>
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    const getArticle = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/articles/${id}`);
        setArticle(res.data);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      getArticle();
      checkCachedSummary();
    }
  }, [id])

  const checkCachedSummary = async () => {
    try {
      const res = await axios.get(`/api/summarize?id=${id}`);
      if (res.data.summary) {
        setSummary(res.data.summary);
      }
    } catch {
      // Ignore errors when checking cache
    }
  };

  const getSummary = async () => {
    if (!article?.content) return;
    try {
      setSummaryLoading(true);
      setError('');
      const res = await axios.post("/api/summarize", {
        content: article.content,
        articleId: id,
      });
      setSummary(res.data.summary);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        setError("You must be logged in to generate AI summaries.");
      } else {
        setError("Failed to generate summary. Please try again later.");
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (loading) return <ArticleSkeleton />;

  if (error && !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-4 text-center">
        <p className="text-destructive text-sm font-medium">{error}</p>
        <Button variant="outline" size="sm" onClick={() => router.replace("/")}>
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Floating back button — bottom-left on mobile, follows safe area */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="shadow-lg bg-background/90 backdrop-blur-sm border-border gap-2"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-24">

        {/* Hero image */}
        {article?.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-8">
            <Image
              src={article.imageUrl}
              width={900}
              height={506}
              className="w-full h-full object-cover"
              alt={article.title || "News article image"}
              priority
            />
          </div>
        )}

        {/* Headline — editorial serif */}
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight tracking-tight text-balance mb-3">
          {article?.title}
        </h1>

        {/* Byline */}
        <p className="text-sm text-muted-foreground mb-8">
          {article?.source}
          {article?.publishedAt && (
            <>
              {" "}·{" "}
              {new Date(article.publishedAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </>
          )}
        </p>

        {/* AI Summary panel */}
        <div className="rounded-xl border border-border bg-muted/40 p-5 mb-8">
          <h2 className="font-display text-base font-semibold mb-3 text-foreground">
            AI Summary
          </h2>

          {summaryLoading ? (
            <div className="space-y-2">
              <div className="h-4 w-full rounded animate-shimmer" />
              <div className="h-4 w-11/12 rounded animate-shimmer" />
              <div className="h-4 w-4/5 rounded animate-shimmer" />
            </div>
          ) : summary ? (
            <p className="text-sm text-foreground leading-relaxed font-serif-body whitespace-pre-line text-pretty">
              {summary}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Generate an AI-powered summary of this article.
              </p>
              <Button
                onClick={getSummary}
                size="sm"
                className="self-start"
              >
                Generate summary
              </Button>
            </div>
          )}

          {error && (
            <p className="mt-3 text-xs text-destructive">{error}</p>
          )}
        </div>

        {/* Article content — prose plugin handles all typography */}
        {article?.content && (
          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none font-serif-body">
            <p className="text-pretty">{article.content}</p>
          </div>
        )}

        {/* Read original */}
        {article?.url && (
          <div className="mt-8 pt-6 border-t border-border">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline underline-offset-4 transition-colors"
            >
              Read the full article at {article.source} →
            </a>
          </div>
        )}
      </article>
    </>
  );
}