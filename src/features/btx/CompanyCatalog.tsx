import {
  compactMoney,
  companyName,
  windowLabel,
  windowState,
  exchangePath,
} from "./market";
import { CompanyPitch, AngledPanel } from "./BtxUI";
import { ExchangeCard, FullCatalogCard, type CardProps } from "./CatalogCards";
import Link from "next/link";
import { type ComponentType, useEffect, useRef, useState } from "react";

import type { Company } from "./seedApi";

const filters = {
  ALL: "All",
  ACTIVE: "Seeding now",
  NOT_STARTED: "Not started",
  ENDED: "Ended",
  LIVE: "Live",
} as const;
const pill = "rounded-full border border-[#82C3FB]/35 px-3 py-1 text-xs";
type CatalogProps = {
  projects: Company[];
  focusSearch?: boolean;
  ownProject?: string;
  now: number;
  stage: CardProps["stage"];
};

function useCatalog(
  { projects, now, focusSearch, ownProject, stage }: CatalogProps,
  Card: ComponentType<CardProps>,
) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<keyof typeof filters>("ALL");
  const [previewId, setPreviewId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focusSearch) searchInput.current?.focus();
  }, [focusSearch]);
  const preview = projects.find((p) => p.projectId === previewId);
  const sharesSeeded =
    preview?.seedStatus === "LIVE"
      ? preview.seedSharesAtIpo
      : preview?.netShares;
  // Whole-share seed buys identify the investor count only at zero or one share.
  const seedInvestors =
    sharesSeeded === 0 || sharesSeeded === 1 ? sharesSeeded : "Unavailable";
  const query = search.trim().toLowerCase();
  const matches = projects.filter(
    (p) =>
      (filter === "ALL" || windowState(p, now) === filter) &&
      (companyName(p).toLowerCase().includes(query) ||
        (p.ticker && ("$" + p.ticker).toLowerCase().includes(query))),
  );

  function highlight(value: string) {
    const start = value.toLowerCase().indexOf(query);
    if (!query || start < 0) return value;
    return (
      <>
        {value.slice(0, start)}
        <mark className="bg-sky-300/20 text-sky-200">
          {value.slice(start, start + query.length)}
        </mark>
        {value.slice(start + query.length)}
      </>
    );
  }

  const searchField = projects.length > 0 && (
    <div className="relative">
      <span
        aria-hidden
        className="absolute left-4 top-1/2 size-5 -translate-y-1/2 bg-[#b9c8e3]"
        style={{
          mask: "url(/assets/btx/sidebar/search.svg) center / contain no-repeat",
        }}
      />
      <input
        ref={searchInput}
        type="search"
        aria-label="Search companies or tickers"
        placeholder="Search companies or tickers"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-[#82C3FB]/20 bg-[#091321] pl-12 pr-16 py-3 text-sm"
      />
      {query && (
        <button
          onClick={() => {
            setSearch("");
            searchInput.current?.focus();
          }}
          className={
            pill + " absolute right-2 top-1/2 -translate-y-1/2 bg-[#0a1429]"
          }
        >
          Clear
        </button>
      )}
    </div>
  );
  const cards = matches.length ? (
    matches.map((p) => (
      <button
        type="button"
        key={p.projectId}
        aria-label={"Preview " + companyName(p)}
        data-selected={selectedId === p.projectId}
        aria-haspopup="dialog"
        aria-expanded={previewId === p.projectId}
        onClick={() => {
          setSelectedId(p.projectId);
          setPreviewId(p.projectId);
          dialog.current?.showModal();
        }}
        className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#82C3FB]/20 bg-[#101b2d] text-left hover:border-sky-400 data-[selected=true]:border-sky-400 focus-visible:outline-sky-400"
      >
        <Card
          company={p}
          own={ownProject === p.projectId}
          now={now}
          highlight={highlight}
          stage={stage}
        />
      </button>
    ))
  ) : (
    <div className="col-span-full flex min-h-[287px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#82C3FB]/15 bg-black/20 px-5 text-center">
      <span
        aria-hidden
        className="grid size-14 place-items-center rounded-full border border-[#82C3FB]/40 bg-[#82C3FB]/10 text-2xl text-[#82C3FB]"
      >
        {query ? "?" : "0"}
      </span>
      <h3 className="text-[22px] font-medium">
        {query
          ? `No companies match “${search.trim()}”`
          : projects.length
            ? "No matching companies"
            : "No companies yet"}
      </h3>
      {query && (
        <p className="text-xs text-[#a8b5d6]">
          Check the spelling, or try a company name or a ticker.
        </p>
      )}
      {projects.length ? (
        <button
          className={pill}
          onClick={() => {
            if (query) setSearch("");
            else setFilter("ALL");
          }}
        >
          {query ? "Clear search" : "Clear filters"}
        </button>
      ) : (
        <p className="max-w-sm text-sm text-[#A8B5D6]">
          Teams appear here after they create a company and fill in its profile.
          Check back soon.
        </p>
      )}
    </div>
  );
  const drawer = (
    <dialog
      ref={dialog}
      aria-labelledby="catalog-preview-title"
      onClose={() => setPreviewId("")}
      onClick={(e) => {
        if (e.target === dialog.current) dialog.current.close();
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-[600px] border-l border-sky-300/25 bg-[#0a1429] p-0 text-[#E6EBF6] backdrop:bg-black/70"
    >
      {preview && (
        <div className="min-h-full space-y-5 p-5 sm:p-7">
          <header className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Preview</span>
            <button
              aria-label="Close preview"
              className={pill}
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
          </header>
          <h2 id="catalog-preview-title" className="text-3xl">
            {companyName(preview)}{" "}
            {preview.ticker && (
              <small className="rounded-full border border-sky-400/50 px-2 py-1 align-middle text-xs text-sky-300">
                ${preview.ticker}
              </small>
            )}
            <span className={pill + " ml-2 align-middle text-sky-200"}>
              {windowLabel(preview, now)}
            </span>
          </h2>
          <CompanyPitch company={preview} />
          <p>{preview.blurb || preview.description}</p>
          <dl className="flex flex-wrap justify-between gap-4 rounded-xl border border-white/15 p-4">
            <div>
              <dt className="text-xs text-slate-400">
                {preview.seedStatus === "LIVE" ? "Market cap" : "Seed funding"}
              </dt>
              <dd>{compactMoney(preview.marketCapCents)}</dd>
            </div>
            {sharesSeeded != null && (
              <div>
                <dt className="text-xs text-[#a8b5d6]">Shares seeded</dt>
                <dd>{sharesSeeded.toLocaleString()} / 5,000</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-[#a8b5d6]">Investors</dt>
              <dd>{seedInvestors}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Window</dt>
              <dd>{windowLabel(preview, now)}</dd>
            </div>
          </dl>
          {windowState(preview, now) === "ACTIVE" && (
            <p className="rounded-xl border border-sky-300/25 bg-sky-300/10 p-3 text-sm">
              Buy at a fixed {compactMoney(preview.currentPriceCents)} while the
              window is open. Selling opens at IPO. Trade from the full page.
            </p>
          )}
          <div className="flex gap-3">
            <Link
              className="flex-1 rounded-full bg-[#1fbef9] py-3 text-center font-medium text-[#0b1120]"
              href={
                exchangePath +
                "/company/" +
                encodeURIComponent(preview.projectId)
              }
            >
              View full page →
            </Link>
            <button className={pill} onClick={() => dialog.current?.close()}>
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
  return {
    searchField,
    cards,
    drawer,
    filter,
    setFilter,
    count:
      (query ? matches.length + " of " : "") +
      projects.length +
      (projects.length === 1 ? " Team" : " Teams"),
  };
}

export function ExchangeCatalog(props: CatalogProps) {
  const catalog = useCatalog(props, ExchangeCard);
  return (
    <>
      <AngledPanel className="space-y-3">
        <header className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-medium">Catalog</h2>
          <span className="mr-auto text-xs text-[#a8b5d6]">
            {catalog.count}
          </span>
          <Link className={pill} href={exchangePath + "/catalog"}>
            Full screen ↗
          </Link>
        </header>
        {catalog.searchField}
        <div className="grid grid-cols-2 gap-3">{catalog.cards}</div>
      </AngledPanel>
      {catalog.drawer}
    </>
  );
}

export function FullCatalog(props: CatalogProps) {
  const catalog = useCatalog(props, FullCatalogCard);
  return (
    <>
      <section className="space-y-5">
        <header className="flex flex-wrap items-center gap-2">
          <h1 className="mr-auto text-4xl font-medium">Catalog</h1>
          {(Object.keys(filters) as (keyof typeof filters)[])
            .filter((f) => f !== "LIVE" || props.stage === "live")
            .map((f) => (
              <button
                key={f}
                aria-pressed={catalog.filter === f}
                className={
                  pill + " aria-pressed:bg-sky-300 aria-pressed:text-slate-950"
                }
                onClick={() => catalog.setFilter(f)}
              >
                {filters[f]}
              </button>
            ))}
          <Link className={pill} href={exchangePath}>
            Exit full screen
          </Link>
        </header>
        {catalog.searchField}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.cards}
        </div>
      </section>
      {catalog.drawer}
    </>
  );
}
