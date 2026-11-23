import { useEffect, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DynamicPageProps } from "@/constants/companion-events";

import "@/components/ConfigureAmplify";
import { useUserAttributes } from "@/queries/user";
import { QueryProvider } from "@/lib/queryProvider";
import { CompanyPage } from "./CompanyPage";
import { ExchangeCatalog, FullCatalog } from "./CompanyCatalog";
import { marketStage } from "./market";
import { ExchangeOverview, ExchangeLoading } from "./ExchangeOverview";
import { useBtxProfile } from "./accountQueries";
import { market, type Market } from "./seedApi";
import { BtxSidebar } from "./BtxSidebar";

import { StatusBanner } from "./BtxUI";

export type MarketPageProps = {
  market: Market;
  now: number;
  userId: string;
  projectId?: string;
  ownProject?: string;
};
type Screen = ComponentType<MarketPageProps>;

function MarketLayout({
  Page,
  projectId,
}: {
  Page: Screen;
  projectId?: string;
}) {
  const { data: user } = useUserAttributes();
  const userId = user?.sub ?? "";
  const profile = useBtxProfile(userId);
  const snapshot = useQuery({
    queryKey: ["btx", "snapshot"],
    queryFn: market,
    refetchInterval: 15000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const [clock, setClock] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);

  const marketData = snapshot.data;
  return (
    <div className="flex min-h-screen bg-[#0b1120]">
      <BtxSidebar userId={userId} {...profile} />
      <main className="min-w-0 flex-1 bg-[url(/assets/btx/market-background.webp)] bg-[length:100%_auto] bg-top bg-no-repeat px-4 pb-10 pt-8 text-[#e6ebf6] sm:px-6 lg:px-12 lg:pt-[92px]">
        <div className="mx-auto max-w-[1600px] space-y-6">
          {marketData && marketData.eventEndsAt != null ? (
            <Page
              key={JSON.stringify([userId, marketData.eventId, projectId])}
              market={marketData}
              userId={userId}
              projectId={projectId}
              now={
                marketData.serverTime +
                Math.max(0, clock - snapshot.dataUpdatedAt)
              }
              ownProject={
                profile.registration?.teamID &&
                marketData.eventId + ":" + profile.registration.teamID
              }
            />
          ) : snapshot.isError ? (
            <StatusBanner
              tone="error"
              title="Exchange unavailable"
              description="The market data could not be loaded."
              onRetry={() => snapshot.refetch()}
            />
          ) : marketData ? (
            <StatusBanner
              tone="warning"
              title="The KickStart 2026 market is unavailable."
            />
          ) : (
            <ExchangeLoading />
          )}
        </div>
      </main>
    </div>
  );
}

function marketPage(Page: Screen) {
  return function BtxRoute({ params }: Partial<DynamicPageProps>) {
    return (
      <QueryProvider>
        <MarketLayout Page={Page} projectId={params?.projectId} />
      </QueryProvider>
    );
  };
}

function ExchangePage({
  market,
  now,
  ownProject,
  focusSearch = false,
}: MarketPageProps & { focusSearch?: boolean }) {
  const stage = marketStage(market, now);
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,804fr)_minmax(0,522fr)]">
      <ExchangeOverview market={market} now={now} stage={stage} />
      <ExchangeCatalog
        projects={market.projects}
        stage={stage}
        now={now}
        ownProject={ownProject}
        focusSearch={focusSearch}
      />
    </div>
  );
}

export const CatalogRoute = marketPage(({ market, now, ownProject }) => (
  <FullCatalog
    projects={market.projects}
    now={now}
    ownProject={ownProject}
    stage={marketStage(market, now)}
  />
));
export const SearchRoute = marketPage((props) => (
  <ExchangePage {...props} focusSearch />
));
export const CompanyRoute = marketPage(CompanyPage);
export default marketPage(ExchangePage);
