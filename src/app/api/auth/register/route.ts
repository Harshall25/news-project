import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const POST = async (req: NextRequest) => {
  try {
    const ip = getClientIp(req.headers)
    const { success } = await checkRateLimit("register", ip)
    if (!success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }

    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    let existingUser = null

    try {
      existingUser = await prisma.user.findUnique({
      where: { email }
    })
    } catch (error: unknown) {
      console.error("Error checking existing user:", error)
      return NextResponse.json(
        { error: "Database unavailable", details: error instanceof Error ? error.message : String(error) },
        { status: 503 }
      )
    }

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    return NextResponse.json({ message: "User created", user: { id: user.id, email: user.email } })
  } catch (error:unknown) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}