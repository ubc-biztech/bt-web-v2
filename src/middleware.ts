import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "./util/amplify-utils";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Always allow these paths
  if (
    pathname.startsWith('/companion') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(woff|woff2|ttf|otf)$/)
  ) {
    return NextResponse.next();
  }

  // Check for admin routes
  if (pathname.startsWith('/admin')) {
    const isAdmin = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: async (contextSpec) => {
        try {
          const { signInDetails } = await getCurrentUser(contextSpec);
          const email = signInDetails?.loginId;
          return email && email.substring(email.indexOf("@") + 1, email.length) === "ubcbiztech.com";
        } catch (error) {
          console.log(error);
          return false;
        }
      }
    });

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    return response;
  }

  // Handle production redirect to /companion
  if (process.env.NEXT_PUBLIC_REACT_APP_STAGE === 'production') {
    url.pathname = '/companion';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*'
};
