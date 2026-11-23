import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Instrument_Sans, Space_Grotesk } from "next/font/google";
import type { DynamicPageProps } from "@/constants/companion-events";

import "@/components/ConfigureAmplify";
import { useUserAttributes } from "@/queries/user";
import { QueryProvider } from "@/lib/queryProvider";
import { AdminGrants, AdminOverview } from "./AdminPage";
import { CompanyPage } from "./CompanyPage";
import { ExchangeCatalog, FullCatalog } from "./CompanyCatalog";
import { marketStage } from "./market";
import {
  ExchangeLoading,
  ExchangeOverview,
  ExchangeRecovery,
} from "./ExchangeOverview";
import { useBtxProfile } from "./accountQueries";
import { market, type BtxRequestError, type Market } from "./seedApi";
import { BtxSidebar } from "./BtxSidebar";
import { applyLivePrices, useMarketFeed } from "./useMarketFeed";

import { MobilePageTitle, StatusBanner } from "./BtxUI";
import styles from "./btx.module.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--btx-font-instrument-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--btx-font-space-grotesk",
});

export type MarketPageProps = {
  market: Market;
  now: number;
  userId: string;
  quoteVersion?: number | null;
  projectId?: string;
  ownProject?: string;
  initials?: string;
};
type Screen = ComponentType<MarketPageProps>;

function MarketLayout({
  Page,
  adminOnly,
  projectId,
}: {
  Page: Screen;
  adminOnly: boolean;
  projectId?: string;
}) {
  const auth = useUserAttributes();
  const user = auth.data;
  const isAdmin = !!user?.isAdmin;
  const userId = user?.sub ?? "";
  const profile = useBtxProfile(userId, isAdmin);
  const snapshot = useQuery<Market, BtxRequestError>({
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

  const person = profile.user;
  const initials = (
    [person?.fname?.[0], person?.lname?.[0]].join("") ||
    person?.email?.[0] ||
    person?.id?.[0]
  )?.toUpperCase();
  // A retry can set the query back to pending before it has any data.
  const lastFailureAt =
    snapshot.errorUpdatedAt > snapshot.dataUpdatedAt
      ? snapshot.errorUpdatedAt
      : null;
  const retrySnapshot = () => void snapshot.refetch({ cancelRefetch: false });
  const feed = useMarketFeed(adminOnly ? undefined : snapshot.data?.eventId);
  const marketData = useMemo(
    () => snapshot.data && applyLivePrices(snapshot.data, feed.prices),
    [snapshot.data, feed.prices],
  );
  const lastUpdate =
    marketData &&
    Math.max(
      marketData.serverTime,
      ...Object.values(feed.prices).map((point) => point.ts),
    );
  const background = adminOnly
    ? "bg-gradient-to-b from-[#15293b] to-[#0b1120] lg:pt-10"
    : "bg-[url(/assets/btx/market-background.webp)] max-md:bg-none lg:pt-[92px]";
  return (
    <div
      className={`${styles.btx} ${instrumentSans.variable} ${spaceGrotesk.variable} flex min-h-screen bg-[#0b1120]`}
    >
      <BtxSidebar isAdmin={isAdmin} userId={userId} {...profile} />
      <main
        className={`min-w-0 flex-1 bg-[length:100%_auto] bg-top bg-no-repeat px-4 pb-[calc(76px+env(safe-area-inset-bottom))] pt-[max(8px,env(safe-area-inset-top))] text-[#e6ebf6] sm:px-6 md:pb-10 md:pt-8 lg:px-12 ${background}`}
      >
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:gap-6">
          {!marketData && (
            <MobilePageTitle title="Exchange" initials={initials} />
          )}
          {marketData && feed.connection === "reconnecting" && (
            <StatusBanner
              tone="info"
              title="Reconnecting…"
              description="Live prices may be out of date. Quotes will refresh when the connection returns."
            />
          )}
          {marketData && feed.connection === "offline" && (
            <StatusBanner
              tone="warning"
              title="You’re offline"
              description={`Showing prices from ${new Date(lastUpdate ?? marketData.serverTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}. Trading is paused until you’re back online.`}
              onRetry={feed.retry}
            />
          )}
          {feed.backOnline && (
            <div className="fixed bottom-5 right-5 z-30">
              <StatusBanner
                tone="success"
                title="Back online"
                description="Prices updated just now."
              />
            </div>
          )}
          {adminOnly && !isAdmin ? (
            <StatusBanner
              tone="info"
              title={
                auth.isPending ? "Checking access…" : "Admin access required"
              }
            />
          ) : marketData && marketData.eventEndsAt != null ? (
            <>
              {snapshot.isRefetchError && (
                <StatusBanner
                  tone="warning"
                  title="Market data may be out of date"
                  description="Showing the last available market data."
                  onRetry={retrySnapshot}
                  retrying={snapshot.isFetching}
                />
              )}
              <Page
                key={JSON.stringify([userId, marketData.eventId, projectId])}
                market={marketData}
                quoteVersion={feed.quoteVersion}
                initials={initials}
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
            </>
          ) : lastFailureAt !== null ? (
            <ExchangeRecovery
              lastTriedAt={lastFailureAt}
              retrying={snapshot.isFetching}
              onRetry={retrySnapshot}
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

function marketPage(Page: Screen, adminOnly = false) {
  return function BtxRoute({ params }: Partial<DynamicPageProps>) {
    return (
      <QueryProvider>
        <MarketLayout
          Page={Page}
          adminOnly={adminOnly}
          projectId={params?.projectId}
        />
      </QueryProvider>
    );
  };
}

function ExchangePage({
  market,
  now,
  ownProject,
  initials,
  focusSearch = false,
}: MarketPageProps & { focusSearch?: boolean }) {
  const stage = marketStage(market, now);
  return (
    <>
      <MobilePageTitle title="Exchange" initials={initials} />
      {!market.projects.length && (
        <section className="rounded-[20px] border border-[#82c3fb]/[.22] bg-[#82c3fb]/5 p-4 md:hidden">
          <h2 className={`text-[18px] font-medium`}>No companies yet</h2>
          <p className="mt-2 text-[#a8b5d6]">
            Teams will appear here as they register for KickStart.
          </p>
        </section>
      )}
      <div
        className={`grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,804fr)_minmax(0,522fr)] ${market.projects.length ? "" : "max-md:hidden"}`}
      >
        <ExchangeOverview market={market} now={now} stage={stage} />
        <ExchangeCatalog
          projects={market.projects}
          stage={stage}
          now={now}
          ownProject={ownProject}
          focusSearch={focusSearch}
        />
      </div>
    </>
  );
}

function CatalogPage({ market, now, ownProject, initials }: MarketPageProps) {
  return (
    <FullCatalog
      initials={initials}
      projects={market.projects}
      now={now}
      ownProject={ownProject}
      stage={marketStage(market, now)}
    />
  );
}
export const CatalogRoute = marketPage(CatalogPage);
export const SearchRoute = marketPage((props) => (
  <ExchangePage {...props} focusSearch />
));
export const AdminRoute = marketPage(AdminOverview, true);
export const GrantRoute = marketPage(AdminGrants, true);
export const CompanyRoute = marketPage(CompanyPage);
export default marketPage(ExchangePage);
