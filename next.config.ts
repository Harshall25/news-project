import type { NextConfig } from "next";

const requiredEnvs = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_ID",
  "GOOGLE_SECRET",
  "GOOGLE_GEMINI_API",
  "NEWS_API",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

if (missingEnvs.length > 0) {
  throw new Error(
    `\n❌ Invalid/Missing Environment Variables: ${missingEnvs.join(", ")}\nPlease check your .env file.\n`
  );
}

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
        {
          protocol: "http",
          hostname: "**",
        }
      ]
    }
  /* config options here */
};

export default nextConfig;
