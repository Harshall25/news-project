"use client"

import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/")
    }
  }, [status, router])

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    })

    if (!result?.ok) {
      setError("Invalid credentials")
      return
    }

    router.replace("/")
    router.refresh()
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" className="w-full">
            Login with Credentials
          </Button>
        </form>
        <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
          Login with Google
        </Button>
      </div>
    </div>
  )
}
