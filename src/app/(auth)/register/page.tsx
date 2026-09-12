"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    if (res.ok) {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      setLoading(false)
      if (result?.ok) {
        router.push("/")
      } else {
        setError("Account created but sign-in failed. Please try logging in.")
      }
    } else {
      setLoading(false)
      const data = await res.json()
      setError(data.error || "Registration failed. Please try again.")
    }
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
            Create an account to get started
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              autoComplete="name"
              placeholder="Jane Smith"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              autoComplete="new-password"
              placeholder="Choose a strong password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-pretty" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
