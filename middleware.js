import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host");

  // If host is www.boxfox.in, redirect to boxfox.in permanently (301)
  if (host === "www.boxfox.in") {
    url.host = "boxfox.in";
    url.port = ""; // Ensure no port is appended
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
