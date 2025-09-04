import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route patterns
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/invite",
];
// const publicRoutes = ['/', '/about', '/contact', '/privacy', '/terms']
const protectedRoutes = ["/dashboard", "/profile", "/settings", "/admin"];

// Helper function to check if user is authenticated via secure cookie
function isAuthenticated(request: NextRequest): boolean {
  // Check for auth cookie from backend (adjust cookie name as needed)
  const authCookie = request.cookies.get("sessiontoken")?.value;

  return !!authCookie;
}

// Helper function to check route type
function getRouteType(pathname: string): "auth" | "protected" | "public" {
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return "auth";
  }
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    return "protected";
  }
  return "public";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = isAuthenticated(request);
  const routeType = getRouteType(pathname);

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Handle different route types
  switch (routeType) {
    case "auth":
      // If user is authenticated and tries to access auth pages, redirect to dashboard
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      break;

    case "protected":
      // If user is not authenticated and tries to access protected pages, redirect to login
      if (!isAuth) {
        // Store the intended destination for after login
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }
      break;

    case "public":
      // Public routes are always accessible
      break;
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
