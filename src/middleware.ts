import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login", // only used for pages, not APIs
    },
  }
);

export const config = {
  matcher: [
    "/api/trending/:path*",
    "/api/articles/:path*",
    "/api/article/:path*",
  ],
};