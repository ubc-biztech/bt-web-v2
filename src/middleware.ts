import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchUserAttributes } from "@aws-amplify/auth";

export async function middleware(request: NextRequest) {
  try {
    const { email } = await fetchUserAttributes();
    if (
      !email ||
      email.substring(email.indexOf("@") + 1, email.length) !== "ubcbiztech.com"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (e) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: "/admin/:path*",
};
