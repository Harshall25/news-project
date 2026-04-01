"use client"
import { useEffect, useState } from "react"
import axios from "axios";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [article, setArticle] = useState<any>(null);
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
      } catch (error: any) {
        setError(error.message);
      }
      finally {
        setLoading(false);
      }
    };
    if (id) getArticle();
  }, [id])

  //summerize endpoint call
  useEffect(() => {
    if (!article?.content) return;

    const getSummary = async () => {
      try {
        setSummaryLoading(true);

        const res = await axios.post("/api/summarize", {
          content: article.content,
        });

        setSummary(res.data.summary);

      } catch (e: any) {
        console.log(e.message);
      } finally {
        setSummaryLoading(false);
      }
    };

    getSummary();

  }, [article?.content]);


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



  return (
    <div>

      <Button onClick={()=> router.push("/")} variant="outline" className=" fixed bottom-5 left-25 ml-3 px-5 py-4 bg-black text-white rounded-lg shadow-lg">
        <ArrowLeftIcon />
        Back
      </ Button>

      <div className="max-w-3xl mx-auto p-5 space-y-6">

        <img
          src={article?.imageUrl}
          className="w-full h-105 object-cover rounded-lg"
          alt=""
        />

        <h1 className="text-2xl font-bold">
          {article?.title}
        </h1>


        <p className="text-sm text-gray-500">
          {article?.source} •{" "}
          {new Date(article?.publishedAt).toDateString()}
        </p>


        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Summary</h2>

          {summaryLoading ? (
            <p>Generating summary...</p>
          ) : (
            <p className="whitespace-pre-line">{summary}</p>
          )}
        </div>

        <a
          href={article?.url}
          target="_blank"
          className="text-blue-600 underline cursor-pointer"
        >
          Read full article
        </a>

      </div>
    </div>
  );
}