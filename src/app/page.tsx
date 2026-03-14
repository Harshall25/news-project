"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/register")
    }
  }, [status, router])

  if (status === "loading") return <div>Loading...</div>

  if (!session) return null // Will redirect

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <h1>Welcome, {session.user?.email}</h1>
        <button onClick={() => signOut()}>Logout</button>
      </div>
    </div>
  )
}