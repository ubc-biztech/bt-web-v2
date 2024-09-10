import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./layout";
import Head from "next/head";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const noLayoutPaths = [
    "/login",
    "/signup",
    "/account-creation",
    "/membership",
    "/register",
    "/verify",
    "/forgot-password"
  ];

  const isNoLayoutPage = noLayoutPaths.includes(router.pathname);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {isNoLayoutPage ? (
        // Render the component without the Layout
        <Component {...pageProps} />
      ) : (
        // Render the component with the Layout
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}
