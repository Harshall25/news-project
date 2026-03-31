"use client"
import { useEffect, useState } from "react"
import axios from "axios";
import { useParams } from "next/navigation";
export default  function Page() {
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(()=>{
    const getArticle = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`/api/articles/${id}`);
        setArticle(res.data);
      }catch(error:any){
        setError(error.message);
      }
      finally {
        setLoading(false);
      }
    };
        if (id) getArticle();
  },[id])

  //summerize endpoint call

  if(loading) {
    return <div>
        Loading article please wait
    </div>
  }

  if(error) {
    return <div>
        Error: {error}
    </div>
  }

  return <div className="flex justify-center items-center">
    <div className="flex flex-col">
        <div>
            <img src={article?.imageUrl} alt="" />
        </div>
        <div>
            {article?.title}
        </div>
        <div>
            {article?.content}
        </div>
    </div>
  </div>
}