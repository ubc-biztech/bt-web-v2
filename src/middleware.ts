import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { fetchBackendFromServer } from "./lib/db";
import { User } from "./types";
import { needsOnboarding } from "./lib/user";
import { getSafeRedirect } from "./util/url";

function redirectTo(path: string, request: NextRequest, returnTo?: string) {
  const url = new URL(path, request.url);
  if (returnTo) url.searchParams.set("redirect", returnTo);
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const returnTo = `${pathname}${url.search}`;

  // Always allow these paths
  const allowedPrefixes = [
    "/admin/live-wall",
    "/companion",
    "/companions",
    "/btx",
    "/events",
    "/event",
    "/become-a-member",
    "/membership",
    "/login",
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

  const isOnboarding = request.nextUrl.pathname === "/onboarding";
  const onboardingDestination = getSafeRedirect(
    url.searchParams.get("redirect") ?? undefined,
  );

  try {
    const userProfile: User = await fetchBackendFromServer({
      endpoint: `/users/self`,
      method: "GET",
      nextServerContext: { request: request as any, response: response as any },
    });
    const requiresOnboarding = needsOnboarding(userProfile);

    if (isOnboarding) {
      return requiresOnboarding
        ? NextResponse.next()
        : redirectTo(onboardingDestination, request);
    }

    if (requiresOnboarding) {
      return redirectTo("/onboarding", request, returnTo);
    }

    if (pathname.startsWith("/admin") && !userProfile.admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error: any) {
    if (isOnboarding) {
      if (error.status === 404) return NextResponse.next();
      return redirectTo(
        "/login",
        request,
        onboardingDestination === "/" ? undefined : onboardingDestination,
      );
    }

    if (error.status === 404) {
      return redirectTo("/onboarding", request, returnTo);
    }

    return redirectTo("/login", request, returnTo);
  }
}

export const config = {
  matcher: "/:path*",
};
