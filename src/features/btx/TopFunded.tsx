import styles from "./btx.module.css";
import { compactMoney, companyName, windowState, timeLeft } from "./market";
import { CompanyPhoto } from "./BtxUI";

import type { Company } from "./seedApi";

export function TopFunded({
  projects,
  now,
  live,
  final,
  launching,
}: {
  projects: Company[];
  now: number;
  live: boolean;
  final: boolean;
  launching: boolean;
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
    <section
      aria-labelledby="top-funded-title"
      className="space-y-3 max-md:rounded-[20px] max-md:border max-md:border-[#82c3fb]/[.22] max-md:bg-[#82c3fb]/5 max-md:p-4"
    >
      <header className="flex max-md:flex-col md:items-baseline md:justify-between md:gap-3">
        <h2
          id="top-funded-title"
          className={`${styles.display} max-md:font-[family-name:var(--btx-font-space-grotesk)] max-md:text-[18px] text-[20px] font-medium text-[#E6EBF6]`}
        >
          {live ? "Top movers" : "Top funded"}
        </h2>
        <span className="text-[11px] text-[#A8B5D6]">
          {live
            ? "Since seeding"
            : launching
              ? "Seed totals locked"
              : final
                ? "Final seed totals"
                : leaders.some((p) => p.marketCapCents > 0)
                  ? "Live seed totals"
                  : "No seed funding yet"}
        </span>
      </header>

      {leaders.length === 0 ? (
        <p className="rounded-2xl border border-[#82C3FB]/15 bg-[#0A1429]/60 px-4 py-5 text-[14px] text-[#A8B5D6]">
          No seed funding yet. Totals appear after the first purchase.
        </p>
      ) : (
        <ol className="grid gap-2 md:grid-cols-3">
          {leaders.map((company) => {
            const windowLabel =
              windowState(company, now) === "ACTIVE" && company.seedEndsAt
                ? timeLeft(company, now)
                : "Ended";
            return (
              <li
                key={company.projectId}
                className="max-md:border-0 max-md:bg-transparent max-md:p-0 flex min-w-0 items-center gap-2 rounded-2xl border border-[#82C3FB]/15 bg-[#0A1429]/60 p-3 md:min-h-[80px]"
              >
                <span className="relative hidden md:grid size-11 shrink-0 overflow-hidden place-items-center rounded-lg bg-[#182443]">
                  <CompanyPhoto logo={company.logo} emblemSize={20} />
                </span>
                <div className="relative min-w-0 flex-1 max-md:pr-16">
                  <div className="flex flex-wrap items-center gap-1 text-[14px] text-[#E6EBF6]">
                    <span
                      className={`${styles.display} break-words text-[16px] max-md:text-[15px] max-md:font-[family-name:var(--btx-font-space-grotesk)] font-medium`}
                    >
                      {companyName(company)}
                    </span>
                    {company.ticker && (
                      <span className="max-md:border-0 max-md:bg-transparent max-md:p-0 max-md:text-[12px] rounded-full border border-[#1FBEF9]/50 bg-[#1FBEF9]/10 px-2 py-0.5 text-[11px] font-medium text-[#1FBEF9]">
                        ${company.ticker}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#A8B5D6]">
                    <span>
                      {live
                        ? compactMoney(company.currentPriceCents)
                        : company.marketCapCents
                          ? compactMoney(company.marketCapCents) + " seeded"
                          : company.seedStatus === "NOT_STARTED"
                            ? "Opens after kickoff"
                            : "No seed funding"}
                    </span>
                    {!live && company.seedStatus === "NOT_STARTED" && (
                      <span
                        className={
                          styles.statusPill +
                          " absolute right-0 top-1/2 -translate-y-1/2 md:hidden"
                        }
                      >
                        Not started
                      </span>
                    )}
                    {(live || company.seedStatus !== "NOT_STARTED") && (
                      <span
                        data-tone={
                          live
                            ? company.currentPriceCents < 10000
                              ? "ended"
                              : "active"
                            : windowLabel === "Ended"
                              ? "ended"
                              : "active"
                        }
                        className={
                          styles.statusPill +
                          " " +
                          "max-md:absolute max-md:right-0 max-md:top-1/2 max-md:-translate-y-1/2 max-md:rounded-full max-md:bg-[#82c3fb]/10 max-md:px-2 " +
                          ((
                            live
                              ? company.currentPriceCents < 10000
                              : windowLabel === "Ended"
                          )
                            ? "text-[#FFDDAD]"
                            : "text-[#38D3A2]")
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
