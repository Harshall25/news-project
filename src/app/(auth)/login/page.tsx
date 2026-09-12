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
  const [loading, setLoading] = useState(false)
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
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    })

    setLoading(false)

    if (!result?.ok) {
      setError("Invalid email or password. Please try again.")
      return
    }

    router.replace("/")
    router.refresh()
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Wordmark */}
        <div className="text-center space-y-1">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Open<span className="text-primary">News</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your personalized feed
          </p>
        </div>

        {/* Credentials form */}
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-pretty" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full"
        >
          Continue with Google
        </Button>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  )
}
