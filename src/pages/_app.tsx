import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "./layout";
import Head from "next/head";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isCompanionPath = router.pathname.startsWith('/companion');

  const content = (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </>
  );

  if (isCompanionPath) {
    return content;
  }

  return <Layout>{content}</Layout>;
}
