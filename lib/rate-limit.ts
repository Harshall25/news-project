import { Ratelimit } from "@upstash/ratelimit"
import client from "@/lib/redis"

type HeaderMap = Headers | Record<string, string | string[] | undefined>
type RateLimitScope = "register" | "login" | "trending"

const limiters: Record<RateLimitScope, Ratelimit> = {
  register: new Ratelimit({
    redis: client,
    limiter: Ratelimit.fixedWindow(5, "60 m"),
    prefix: "ratelimit:register"
  }),
  login: new Ratelimit({
    redis: client,
    limiter: Ratelimit.fixedWindow(10, "15 m"),
    prefix: "ratelimit:login"
  }),
  trending: new Ratelimit({
    redis: client,
    limiter: Ratelimit.fixedWindow(60, "1 m"),
    prefix: "ratelimit:trending"
  })
}

export const getClientIp = (headers: HeaderMap) => {
  const getHeader = (name: string) => {
    if (headers instanceof Headers) return headers.get(name) ?? undefined
    const value = headers[name] ?? headers[name.toLowerCase()]
    return Array.isArray(value) ? value[0] : value
  }

  const forwardedFor = getHeader("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()

  const realIp = getHeader("x-real-ip")
  if (realIp) return realIp.trim()

  return "unknown"
}

export const checkRateLimit = async (scope: RateLimitScope, identifier: string) => {
  return limiters[scope].limit(identifier)
}
