"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import HomePage from "../components/HomePage"

export default function Home() {
    const [latestortrend , setLatestortrend] = useState(String);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register")
    }
  }, [status, router])

  if (status === "loading") return <div>Loading...</div>

  if (!session) return null // Will redirect



  return (
    <div className="">
      <div>
        <h1>Welcome, {session.user?.email}</h1>
        <Button variant="destructive" onClick={() => signOut()}>Logout</Button>
      </div>

    <div>
      <Button variant="outline" onClick={()=>setLatestortrend("latest")}>Latest News</Button> 
      <Button variant="outline" onClick={()=>setLatestortrend("top")}>Top News</Button>

    </div>
      
      {latestortrend == "top" ? 
        (<div>this is trending seciton</div>): 
        (<div><HomePage /></div>)
        
      }
    </div>
  )
}

