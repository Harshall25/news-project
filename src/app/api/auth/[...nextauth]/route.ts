import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler =  NextAuth({
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

      async authorize(credentials) {
        if (!credentials) return null

        const { email, password } = credentials

        if (email === "admin@test.com" && password === "123456") {
          return {
            id: "1",
            name: "Admin",
            email: "admin@test.com"
          }
        }

        return null
      }
    })
  ]
})

export const GET = handler
export const POST = handler