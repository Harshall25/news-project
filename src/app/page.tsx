"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import HomePage from "../components/HomePage"
import NavBar from "../components/NavBar"

export default function Home() {
  const [latestOrTrend, setLatestortrend] = useState(false);
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
      <NavBar />
      <div><HomePage latestOrTrend={latestOrTrend}
        setLatestortrend={setLatestortrend} /></div>
    </div>
  )
}

