import Head from "next/head";
import { QueryProvider } from "@/lib/queryProvider";
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import ProductArenaPage from "@/features/product+/2026/pages/ProductArenaPage";
import { productHeadingFont } from "@/features/product+/2026/font";

export default function AudiencePage() {
  return (
    <QueryProvider>
      <ConfigureAmplifyClientSide />
      <Head>
        <title>Product Arena | Product+ 2026</title>
        <meta name="theme-color" content="#f7f4ff" />
      </Head>
      <main
        className={`${productHeadingFont.variable} font-product-body text-[14px] leading-5 [color-scheme:light] [:where(&)_h1]:text-inherit [:where(&)_h2]:text-inherit [:where(&)_p]:text-inherit`}
      >
        <ProductArenaPage embedded={false} />
      </main>
    </QueryProvider>
  );
}
