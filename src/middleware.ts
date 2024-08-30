import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "./util/amplify-utils";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const isAdmin = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const { signInDetails } = await getCurrentUser(contextSpec);
        const email = signInDetails?.loginId;
        // return (
        //   email &&
        //   email.substring(email.indexOf("@") + 1, email.length) ===
        //     "ubcbiztech.com"
        // );
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  });

  if (isAdmin) {
    return response;
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: "/admin/:path*",
};
