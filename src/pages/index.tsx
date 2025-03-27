import { useEffect } from "react";
import { useRouter } from "next/router";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const router = useRouter();

  // useEffect(() => {
  //   const checkUserAuthentication = async () => {
  //     try {
  //       const currentUser = await fetchUserAttributes();
  //       if (!currentUser) {
  //         // If no user is authenticated, redirect to the login page
  //         router.push("/login");
  //       }
  //     } catch (error) {
  //       console.error("Error checking user authentication:", error);
  //       router.push("/login");
  //     }
  //   };

  //   checkUserAuthentication();
  // }, [router]);

  return (
    <main className="bg-primary-color min-h-screen">
      {/* <h1>amazing biztech app</h1> */}
    </main>
  );
}
