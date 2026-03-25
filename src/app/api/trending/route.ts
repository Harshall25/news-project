// get trending
import axios from "axios"
import { Key } from "lucide-react";
import { NextResponse } from "next/server";
export const GET = async () => {

  try {
    const url = "https://api.worldnewsapi.com/top-news";
    //format date
    const formatDateISO = (date:any) => {
      return date.toLocaleDateString('en-CA');  
    };
    const currentDate = new Date(); // curr date
    const response = await axios.get(url, {
      params: {
        'source-country': 'IN',
        'api-key': process.env.NEWS_API,
        'language': 'en',
        'date': formatDateISO(currentDate), //use fns
        'limit' : 50
      }
    })

    const data = response.data;
    
    return NextResponse.json({
      status:true,
      data : data
    })
  } catch (e: any) {
    if(e.response){
      return NextResponse.json({
        "error" : e.response.data
      })
    }else{
      return NextResponse.json({
        "error" : e.request.data
      })
    }
  }
}