"use client"
import { signOut, signIn, SessionProvider, useSession } from "next-auth/react"

export default function RealHome() {
  return (
    <SessionProvider>
      <Home />
    </SessionProvider>
  )
}

function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div>Loading...</div>

  if (!session) {
    return (
      <div>
        Not logged in
        <button onClick={() => signIn()}>Signin</button>
      </div>
    )
  }

  return (
    <div>
      Logged in as {session.user?.email}
      <button onClick={() => signOut()}>Logout</button>
    </div>
  )
}