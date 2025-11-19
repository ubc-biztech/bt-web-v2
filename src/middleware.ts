import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { fetchBackendFromServer } from "./lib/db";
import { User } from "./types";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Always allow these paths
  const allowedPrefixes = [
    "/companion",
    "/events",
    "/become-a-member",
    "/membership",
    "/login",
    "/profile",
    "/register",
    "/forgot-password",
    "/verify",
    "/investments",
    "/assets",
    "/favicon",
    "/_next",
    "/static",
    "/fonts",
    "/videos",
  ];

  if (
    allowedPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.match(/\.(woff|woff2|ttf|otf)$/)
  ) {
    return NextResponse.next();
  }

  try {
    const userProfile: User = await fetchBackendFromServer({
      endpoint: `/users/self`,
      method: "GET",
      nextServerContext: { request: request as any, response: response as any },
    });

    if (pathname.startsWith("/event")) {
      return NextResponse.next();
    }

    if (!userProfile.isMember) {
      return NextResponse.redirect(new URL("/membership", request.url));
    }

    if (pathname.startsWith("/admin") && !userProfile.admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error: any) {
    if (error.status === 404 && pathname.startsWith("/event")) {
      return NextResponse.next();
    }

    if (error.status === 404) {
      return NextResponse.redirect(new URL("/membership", request.url));
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: "/:path*",
};
