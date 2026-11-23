import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Fragment } from "react";
import { usePortfolio } from "./accountQueries";
import { StatusBanner } from "./BtxUI";
import type { MarketPageProps } from "./Kickstart2026";
import { exchangePath, money } from "./market";
import {
  getLeaderboard,
  type BtxRequestError,
  type LeaderboardEntry,
} from "./seedApi";

const panel = "rounded-2xl border border-[#263b56] bg-[#10192c]/90";
const medals = [
  "border-[#ffe48b]/35 bg-[#ffe48b]/10 text-[#ffddad]",
  "border-[#c8d9f0]/35 bg-[#c8d9f0]/10 text-[#e1ebf8]",
  "border-[#d9a77c]/35 bg-[#d9a77c]/10 text-[#f4c8a5]",
];

function Profit({ cents }: { cents: number }) {
  const color =
    cents > 0 ? "text-[#38d3a2]" : cents < 0 ? "text-[#ff5c7a]" : "";
  return (
    <span className={color + " tabular-nums"}>
      {cents > 0 ? "+" : ""}
      {money(cents)}
    </span>
  );
}

function Rank({ number, medal = false }: { number: number; medal?: boolean }) {
  const color = medal
    ? medals[number - 1]
    : "border-[#426181] bg-[#20324d] text-[#b5c1da]";
  return (
    <span
      className={`inline-grid size-7 place-items-center rounded-full border text-xs ${color}`}
    >
      {number}
    </span>
  );
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
      {isYou && (
        <span className="ml-2 rounded-full bg-[#89dcff] px-2 py-0.5 text-xs text-[#081221]">
          You
        </span>
      )}
    </>
  );
}

export function LeaderboardPage({
  market,
  userId,
  email = "",
  isAdmin,
}: MarketPageProps) {
  const live = market.phase === "LIVE";
  const result = useQuery({
    queryKey: ["btx", market.eventId, "leaderboard", userId, email],
    queryFn: () => getLeaderboard(email),
    enabled: !!email && live,
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
  const lastPodiumIndex = podium.at(-1)?.index ?? -1;
  const entries = [...top.slice(3), ...(board?.bottom ?? [])];
  if (own) entries.push(own);
  const byIndex = new Map(entries.map((entry) => [entry.index, entry]));
  const rows = Array.from(byIndex.values())
    .filter(({ index }) => index > lastPodiumIndex)
    .sort((a, b) => a.index - b.index);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Leaderboard</h1>
          <p className="mt-1 text-sm text-[#a8b5d6]">
            Ranked by total profit / loss.
            {rankingsOpen && " Updates about once a minute."}
          </p>
        </div>
        {rankingsOpen && own && (
          <span className="rounded-full border border-[#426181] px-3 py-1.5 text-xs">
            Your rank · #{own.index + 1} of {board?.traders}
          </span>
        )}
      </header>
      {isAdmin === undefined ? (
        <StatusBanner tone="info" title="Checking sign-in…" />
      ) : !email ? (
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
            description="During seeding, profit and loss primarily reflect trading fees. Check back when live trading opens."
          />
          <div
            className={
              panel + " grid place-items-center gap-3 py-14 px-5 text-center"
            }
          >
            <span
              aria-hidden
              className="grid size-12 place-items-center rounded-full border border-[#426181] bg-[#20324d] text-xl text-[#89dcff]"
            >
              #
            </span>
            <h2 className="text-xl font-medium">
              The leaderboard opens at IPO
            </h2>
            {isAdmin === false && portfolio.data && (
              <p className="text-sm text-[#a8b5d6]">
                Your profit / loss right now is{" "}
                <Profit cents={portfolio.data.totalPnlCents} />.
              </p>
            )}
          </div>
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
          <div className="grid gap-3 sm:grid-cols-3">
            {podium.map((entry) => (
              <article
                key={entry.index}
                className={`rounded-2xl border p-5 ${medals[entry.index]}`}
              >
                <h2 className="flex items-center gap-2 text-sm">
                  <Rank number={entry.index + 1} medal />
                  <InvestorName
                    entry={entry}
                    isYou={entry.index === own?.index}
                  />
                </h2>
                <p className="mb-1 mt-3 text-xs text-[#a8b5d6]">
                  Total profit / loss
                </p>
                <p className="text-2xl font-medium">
                  <Profit cents={entry.totalPnlCents} />
                </p>
              </article>
            ))}
          </div>
          <div className={panel + " overflow-hidden"}>
            {!!rows.length && (
              <div className="overflow-x-auto">
                <table
                  aria-label="Investor rankings"
                  className="w-full whitespace-nowrap text-sm"
                >
                  <thead className="bg-[#172339] text-left text-xs text-[#a8b5d6]">
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
                      <Fragment key={entry.index}>
                        {entry.index >
                          (rows[index - 1]?.index ?? lastPodiumIndex) + 1 && (
                          <tr className="border-t border-[#263b56]/60">
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
                          className={`border-t border-[#263b56]/60 ${entry.index === own?.index ? "bg-[#1b2e45]" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <Rank number={entry.index + 1} />
                          </td>
                          <td className="px-4 py-3">
                            <InvestorName
                              entry={entry}
                              isYou={entry.index === own?.index}
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
            <p className="border-t border-[#263b56]/60 px-4 py-3 text-xs text-[#a8b5d6]">
              Profit / loss is cash plus holdings value minus total allocated
              funds. Grants increase your allocation and don’t count as profit.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
