import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials, req) {
        if (!credentials) return null

        const ip = getClientIp(req?.headers ?? {})
        const { success } = await checkRateLimit("login", ip)
        if (!success) return null

        const { email, password } = credentials

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    })
  ],
})

export const GET = handler
export const POST = handler