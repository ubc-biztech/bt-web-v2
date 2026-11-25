import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Fragment } from "react";
import { usePortfolio } from "./accountQueries";
import styles from "./Leaderboard.module.css";
import { MobilePageTitle, StatusBanner } from "./BtxUI";
import type { MarketPageProps } from "./Kickstart2026";
import { exchangePath, money } from "./market";
import {
  getLeaderboard,
  type BtxRequestError,
  type LeaderboardEntry,
} from "./seedApi";

const panel = "rounded-[20px] border border-[#82c3fb]/[.22] bg-[#17213f]/30";
const subtitle = "Ranked by total profit / loss.";
const updateNote = " Updates about once a minute.";

function Profit({ cents }: { cents: number }) {
  const color =
    cents > 0 ? "text-[#38d3a2]" : cents < 0 ? "text-[#ff5c7a]" : "";
  return (
    <span className={color + " whitespace-nowrap tabular-nums"}>
      {cents > 0 ? "+" : ""}
      {money(cents)}
    </span>
  );
}

function Rank({ number }: { number: number }) {
  return <span className={styles.rank}>{number}</span>;
}

function InvestorName({
  entry,
  isYou,
}: {
  entry: LeaderboardEntry;
  isYou: boolean;
}) {
  return (
    <>
      {entry.displayName}
      {isYou && <span className={styles.you}>You</span>}
    </>
  );
}

export function LeaderboardPage({
  market,
  userId,
  isAdmin,
  initials,
}: MarketPageProps) {
  const live = market.phase === "LIVE";
  const result = useQuery({
    queryKey: ["btx", market.eventId, "leaderboard", userId],
    queryFn: getLeaderboard,
    enabled: !!userId && live,
    refetchInterval: 60000,
    staleTime: 60000,
  });
  const board = result.data;
  const rankingsOpen = live && board?.live !== false;
  const portfolio = usePortfolio(
    market.eventId,
    userId,
    isAdmin === false && !rankingsOpen,
    15000,
  );
  const own = board?.own;
  const top = board?.top ?? [];
  const podium = top.slice(0, 3);
  const lastPodiumRank = podium.at(-1)?.rank ?? 0;
  const entries = [...top.slice(3), ...(board?.bottom ?? [])];
  if (own) entries.push(own);
  const byRank = new Map(entries.map((entry) => [entry.rank, entry]));
  const rows = Array.from(byRank.values())
    .filter(({ rank }) => rank > lastPodiumRank)
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <MobilePageTitle
          title="Leaderboard"
          detail={subtitle + updateNote}
          initials={initials}
        />
        <div className="hidden md:block">
          <h1 className={styles.title}>Leaderboard</h1>
          <p className="mt-1 text-[14px] text-[#a8b5d6]">
            {subtitle}
            {rankingsOpen && updateNote}
          </p>
        </div>
        {rankingsOpen && own && (
          <div className={styles.ownRank}>
            <span>Your rank</span>
            <div>
              <strong>#{own.rank}</strong> of {board?.traders}
            </div>
          </div>
        )}
      </header>
      {isAdmin === undefined ? (
        <StatusBanner tone="info" title="Checking sign-in…" />
      ) : !userId ? (
        <div
          className={
            panel + " grid place-items-center gap-3 px-5 py-14 text-center"
          }
        >
          <h2 className="text-xl font-medium">
            Sign in to view the leaderboard
          </h2>
          <Link
            className="rounded-full bg-[#1fbef9] px-4 py-2 text-sm font-medium text-[#081221]"
            href={{
              pathname: "/login",
              query: { redirect: exchangePath + "/leaderboard" },
            }}
          >
            Sign in
          </Link>
        </div>
      ) : !rankingsOpen ? (
        <>
          <StatusBanner
            tone="info"
            title="Rankings go live at IPO"
            description="Until then, the leaderboard shows no P&L. Check back once trading opens."
          />
          <section className={styles.empty}>
            <span aria-hidden className={styles.emptyIcon}>
              #
            </span>
            <h2>
              <span className="md:hidden">No rankings yet</span>
              <span className="hidden md:inline">
                The leaderboard opens at IPO
              </span>
            </h2>
            <p className="md:hidden">
              You’ll see where you stand as soon as live trading opens.
            </p>
            {isAdmin === false && portfolio.data && (
              <p className="hidden md:block">
                Your profit / loss right now is{" "}
                <Profit cents={portfolio.data.totalPnlCents} /> (fees only).
                Check back after IPO to see where you rank.
              </p>
            )}
          </section>
        </>
      ) : !board ? (
        result.isError ? (
          <StatusBanner
            tone="error"
            title="Couldn’t load the leaderboard"
            description={(result.error as BtxRequestError).message}
            onRetry={() => result.refetch()}
          />
        ) : (
          <StatusBanner tone="info" title="Loading leaderboard…" />
        )
      ) : !top.length ? (
        <div className={panel + " px-5 py-14 text-center"}>
          <h2 className="text-xl font-medium">No ranked investors yet</h2>
        </div>
      ) : (
        <>
          <div className={styles.podium}>
            {podium.map((entry) => (
              <article key={entry.rank} data-rank={entry.rank}>
                <Rank number={entry.rank} />
                <h2>
                  <InvestorName
                    entry={entry}
                    isYou={entry.rank === own?.rank}
                  />
                </h2>
                <small>Total profit / loss</small>
                <p>
                  <Profit cents={entry.totalPnlCents} />
                </p>
              </article>
            ))}
          </div>
          <div className={styles.results}>
            {!!rows.length && (
              <div className="md:overflow-x-auto">
                <table
                  aria-label="Investor rankings"
                  className="w-full text-[14px]"
                >
                  <thead className="bg-[#172339] text-left text-[12px] text-[#a8b5d6]">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Rank
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Investor
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Total profit / loss
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((entry, index) => (
                      <Fragment key={entry.rank}>
                        {entry.rank >
                          (rows[index - 1]?.rank ?? lastPodiumRank) + 1 && (
                          <tr className={styles.gap}>
                            <td
                              colSpan={3}
                              className="py-2 text-center text-[#a8b5d6]"
                            >
                              <span aria-hidden="true">…</span>
                              <span className="sr-only">Ranks omitted</span>
                            </td>
                          </tr>
                        )}
                        <tr
                          className={styles.row}
                          data-own={entry.rank === own?.rank}
                        >
                          <td className="px-4 py-3">
                            <Rank number={entry.rank} />
                          </td>
                          <td className="px-4 py-3">
                            <InvestorName
                              entry={entry}
                              isYou={entry.rank === own?.rank}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Profit cents={entry.totalPnlCents} />
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className={styles.note}>
              Rank = cash + holdings − money allocated to you. Admin grants
              don’t count as profit. Only rank, display name and profit / loss
              are public.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
