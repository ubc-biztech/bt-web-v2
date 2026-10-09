import dynamic from "next/dynamic";
import Head from "next/head";
import { QueryProvider } from "@/lib/queryProvider";
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import ProductPlusAccess from "./ProductPlusAccess";
import type { ProductPlusPage } from "./access";
import ProductPlusLayout from "./components/ProductPlusLayout";
import PortalPage from "./pages/PortalPage";

const MyTeamPage = dynamic(() => import("./pages/MyTeamPage"));
const SubmissionPage = dynamic(() => import("./pages/SubmissionPage"));
const ProductArenaPage = dynamic(() => import("./pages/ProductArenaPage"));
const AdminPage = dynamic(() => import("./pages/AdminPage"));

const pages = {
  portal: PortalPage,
  myteam: MyTeamPage,
  submission: SubmissionPage,
  productarena: ProductArenaPage,
  admin: AdminPage,
};
const titles = {
  portal: "Portal",
  myteam: "My Team",
  submission: "Submission",
  productarena: "Product Arena",
  admin: "Admin",
};

export default function ProductPlus2026({
  page = "portal",
}: {
  page?: ProductPlusPage;
}) {
  const Page = pages[page];
  return (
    <QueryProvider>
      <ConfigureAmplifyClientSide />
      <Head>
        <title>{titles[page]} | Product+ 2026</title>
        <meta name="theme-color" content="#f7f4ff" />
      </Head>
      <ProductPlusLayout page={page}>
        <ProductPlusAccess page={page}>
          <Page />
        </ProductPlusAccess>
      </ProductPlusLayout>
    </QueryProvider>
  );
}
