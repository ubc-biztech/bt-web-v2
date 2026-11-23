import { compactMoney, companyName, windowState, timeLeft } from "./market";
import { CompanyPhoto } from "./BtxUI";

import type { Company } from "./seedApi";

export function TopFunded({
  projects,
  now,
  live,
  final,
}: {
  projects: Company[];
  now: number;
  live: boolean;
  final: boolean;
}) {
  // Before IPO, market cap is the seed price times the number of shares bought.
  const leaders = projects
    .slice()
    .sort(
      (a, b) =>
        (live
          ? b.currentPriceCents - a.currentPriceCents
          : b.marketCapCents - a.marketCapCents) ||
        a.projectId.localeCompare(b.projectId),
    )
    .slice(0, 3);

  return (
    <section aria-labelledby="top-funded-title" className="space-y-3">
      <header className="flex items-baseline justify-between gap-3">
        <h2
          id="top-funded-title"
          className="text-lg font-medium text-[#E6EBF6]"
        >
          {live ? "Top movers" : "Top funded"}
        </h2>
        <span className="text-xs text-[#A8B5D6]">
          {live
            ? "Since seeding"
            : final
              ? "Final seed totals"
              : leaders.some((p) => p.marketCapCents > 0)
                ? "Live seed totals"
                : "No seed funding yet"}
        </span>
      </header>

      {leaders.length === 0 ? (
        <p className="rounded-2xl border border-[#82C3FB]/15 bg-[#0A1429]/60 px-4 py-5 text-sm text-[#A8B5D6]">
          No seed funding yet. Totals appear after the first purchase.
        </p>
      ) : (
        <ol className="grid gap-2 sm:grid-cols-3">
          {leaders.map((company) => {
            const windowLabel =
              windowState(company, now) === "ACTIVE" && company.seedEndsAt
                ? timeLeft(company, now)
                : "Ended";
            return (
              <li
                key={company.projectId}
                className="flex min-w-0 items-center gap-2 rounded-2xl border border-[#82C3FB]/15 bg-[#0A1429]/60 p-3 md:min-h-[80px]"
              >
                <span className="relative grid size-11 shrink-0 overflow-hidden place-items-center rounded-lg bg-[#182443]">
                  <CompanyPhoto logo={company.logo} emblemSize={20} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1 text-sm text-[#E6EBF6]">
                    <span className="break-words">{companyName(company)}</span>
                    {company.ticker && (
                      <span className="rounded-full border border-[#1FBEF9]/50 bg-[#1FBEF9]/10 px-2 py-0.5 text-xs text-[#1FBEF9]">
                        ${company.ticker}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#A8B5D6]">
                    <span>
                      {live
                        ? compactMoney(company.currentPriceCents)
                        : company.marketCapCents
                          ? compactMoney(company.marketCapCents) + " seeded"
                          : company.seedStatus === "NOT_STARTED"
                            ? "Opens after kickoff"
                            : "No seed funding"}
                    </span>
                    {(live || company.seedStatus !== "NOT_STARTED") && (
                      <span
                        className={
                          (
                            live
                              ? company.currentPriceCents < 10000
                              : windowLabel === "Ended"
                          )
                            ? "text-[#FFDDAD]"
                            : "text-[#38D3A2]"
                        }
                      >
                        {!live && windowLabel !== "Ended" && (
                          <span aria-hidden="true">● </span>
                        )}
                        {live
                          ? ((company.currentPriceCents - 10000) / 100).toFixed(
                              1,
                            ) + "%"
                          : windowLabel}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
