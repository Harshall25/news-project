"use client"
import { useEffect, useState } from "react"
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
// @ts-ignore
import { Article } from "@/src/types";
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
      }
      finally {
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
    } catch (e) {
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
        console.log(e instanceof Error ? e.message : String(e));
        setError("Failed to generate summary. Please try again later.");
      }
    } finally {
      setSummaryLoading(false);
    }
  };


  if (loading) {
    return <div>
      Loading article please wait
    </div>
  }

  if (error) {
    return <div>
      Error: {error}
    </div>
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/");
    }
  };



  return (
    <div>

      <Button onClick={handleBack} variant="outline" className=" fixed bottom-5 left-25 ml-3 px-5 py-4 bg-black text-white rounded-lg shadow-lg">
        <ArrowLeftIcon />
        Back
      </ Button>

      <div className="max-w-3xl mx-auto p-5 space-y-6">

        {article?.imageUrl && (
          <Image
            src={article.imageUrl}
            width={800}
            height={400}
            className="w-full h-105 object-cover rounded-lg"
            alt={article.title || "News Article Image"}
          />
        )}

        <h1 className="text-2xl font-bold">
          {article?.title}
        </h1>


        <p className="text-sm text-gray-500">
          {article?.source} •{" "}
          {article?.publishedAt ? new Date(article.publishedAt).toDateString() : ""}
        </p>


        <div className="bg-gray-100 p-4 rounded-lg mt-6">
          <h2 className="font-semibold mb-2">AI Summary</h2>

          {summaryLoading ? (
            <p>Generating summary...</p>
          ) : summary ? (
            <p className="whitespace-pre-line">{summary}</p>
          ) : (
            <Button onClick={getSummary} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
              Generate AI Summary
            </Button>
          )}
        </div>



        <div className="mt-6">
          <a
            href={article?.url}
            target="_blank"
            className="text-blue-600 underline cursor-pointer"
          >
            Read full article
          </a>
        </div>

      </div>
    </div>
  );
}