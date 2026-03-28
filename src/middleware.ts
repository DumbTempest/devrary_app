import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (!token) {
      const callbackUrl = encodeURIComponent(req.nextUrl.href);

      return NextResponse.redirect(
        new URL(`/api/auth/signin/google?callbackUrl=${callbackUrl}`, req.url)
      );
    }
    if (
      req.nextUrl.pathname.startsWith("/books/approve-books") &&
      token.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/books/create",
    "/books/bookmarks",
    "/profile",
    "/settings",
    "/books/approve-books",
  ],
};