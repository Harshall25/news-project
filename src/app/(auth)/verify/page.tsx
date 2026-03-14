"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Verify() {
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    // Call verify API
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
    if (res.ok) {
      setMessage("Email verified!")
    } else {
      setMessage("Invalid code")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Verify Email</h1>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Verify
          </Button>
        </form>
        {message && <p className="text-center">{message}</p>}
      </div>
    </div>
  )
}
