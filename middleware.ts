import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedFromRequest } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip authentication check for login page and API routes
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Check if user is authenticated for admin routes
  if (pathname.startsWith("/admin")) {
    const isAuthenticated = isAuthenticatedFromRequest(request);

    if (!isAuthenticated) {
      // Redirect to login page
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/admin/:path*",
  ],
};