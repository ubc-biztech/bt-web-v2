"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

export function useRedirect() {
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        const session = await fetchAuthSession();
        const isAuthenticated =
          !!session.tokens?.accessToken && !!session.tokens?.idToken;

        if (!isAuthenticated && pathname === "/") {
          router.replace("/login");
        }

        if (isAuthenticated && pathname === "/become-a-member") {
          router.replace("/");
        }

        setLoading(false);
      } catch (err) {
        if (pathname === "/") {
          router.replace("/login");
        }
      }
    }

    checkAuthAndRedirect();
  }, [pathname, router]);

  return loading;
}
