import { CatalogPreview } from "./CatalogPreview";
import styles from "./btx.module.css";
import { companyName, exchangePath } from "./market";
import { catalogPill, MobilePageTitle, AngledPanel } from "./BtxUI";
import {
  ExchangeCard,
  FullCatalogCard,
  MobileCatalogCard,
  type CardProps,
} from "./CatalogCards";
import Link from "next/link";
import { type ComponentType, useEffect, useRef, useState } from "react";

import type { Company } from "./seedApi";

type CatalogProps = {
  projects: Company[];
  focusSearch?: boolean;
  initials?: string;
  ownProject?: string;
  stage: CardProps["stage"];
};

function useCatalog(
  { projects, focusSearch, ownProject, stage }: CatalogProps,
  Card: ComponentType<CardProps>,
) {
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focusSearch) searchInput.current?.focus();
  }, [focusSearch]);
  const preview = projects.find((p) => p.projectId === previewId);
  const query = search.trim().toLowerCase();
  const matches = projects.filter(
    (p) =>
      companyName(p).toLowerCase().includes(query) ||
      (p.ticker && ("$" + p.ticker).toLowerCase().includes(query)),
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

  function clearSearch() {
    setSearch("");
    searchInput.current?.focus();
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
        className="max-md:rounded-[14px] max-md:border-[#82c3fb]/30 max-md:bg-[#82c3fb]/[.06] max-md:py-[13px] max-md:leading-normal [&::-webkit-search-cancel-button]:appearance-none w-full rounded-xl border border-[#82C3FB]/20 bg-[#091321] pl-12 pr-16 py-3 text-[14px]"
      />
      {query && (
        <button
          onClick={clearSearch}
          className={
            styles.statusPill +
            " " +
            catalogPill +
            " absolute max-md:right-4 right-2 top-1/2 -translate-y-1/2 bg-[#0a1429]"
          }
        >
          Clear
        </button>
      )}
    </div>
  );
  const cards = matches.length ? (
    matches.map((p) => {
      const cardProps: CardProps = {
        company: p,
        own: ownProject === p.projectId,
        highlight,
        stage,
      };
      return (
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
          className="max-md:rounded-[20px] max-md:bg-[#82c3fb]/5 flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#82C3FB]/20 bg-[#101b2d] text-left hover:border-sky-400 data-[selected=true]:border-sky-400 focus-visible:outline-sky-400"
        >
          <MobileCatalogCard {...cardProps} />
          <span className="hidden md:contents">
            <Card {...cardProps} />
          </span>
        </button>
      );
    })
  ) : (
    <div className="max-md:min-h-0 max-md:gap-2.5 max-md:rounded-[20px] max-md:border-[#82c3fb]/[.22] max-md:bg-[#82c3fb]/5 max-md:p-7 col-span-full flex min-h-[287px] flex-col items-center justify-center gap-3 rounded-2xl border border-[#82C3FB]/15 bg-black/20 px-5 text-center">
      <span
        aria-hidden
        className="max-md:size-auto max-md:border-0 max-md:bg-transparent max-md:text-[32px] max-md:text-[#9eabcb] max-md:leading-[normal] grid size-14 place-items-center rounded-full border border-[#82C3FB]/40 bg-[#82C3FB]/10 text-[28px] text-[#82C3FB]"
      >
        {query ? "⌕" : "0"}
      </span>
      <h3
        className={`${styles.display} text-[22px] max-md:font-[family-name:var(--btx-font-space-grotesk)] max-md:text-[18px] max-md:leading-[normal] font-medium`}
      >
        {query ? `No companies match “${search.trim()}”` : "No companies yet"}
      </h3>
      {query && (
        <p className="text-[13px] leading-[normal] text-[#a8b5d6]">
          Check the spelling or try a company name or ticker.
        </p>
      )}
      {query ? (
        <button
          className={
            catalogPill +
            " max-md:h-[52px] max-md:w-full max-md:border-[#82c3fb]/40 max-md:bg-[#82c3fb]/[.08] max-md:px-5 max-md:text-[15px] max-md:font-medium"
          }
          onClick={clearSearch}
        >
          Clear search
        </button>
      ) : (
        <p className="max-w-sm text-[14px] text-[#A8B5D6]">
          Teams appear here after they create a company. Check back soon.
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
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90dvh] w-full max-w-none overscroll-contain rounded-t-[26px] border md:inset-y-0 md:left-auto md:right-0 md:h-dvh md:max-h-none md:max-w-[600px] md:rounded-none md:border-l border-sky-300/25 bg-[#0a1429] p-0 text-[#E6EBF6] backdrop:bg-black/70"
    >
      {preview && (
        <CatalogPreview
          company={preview}
          stage={stage}
          ownProject={ownProject}
          onClose={() => dialog.current?.close()}
        />
      )}
    </dialog>
  );
  return {
    searchField,
    query,
    cards,
    drawer,
    count:
      (query ? matches.length + " of " : "") +
      projects.length +
      (projects.length === 1 ? " Team" : " Teams"),
  };
}

export function ExchangeCatalog(props: CatalogProps & { cardsOnly?: boolean }) {
  const catalog = useCatalog(props, ExchangeCard);
  return (
    <>
      <AngledPanel className="space-y-3">
        <header
          className={`flex flex-wrap items-center gap-2 ${props.stage === "live" ? "max-md:hidden" : ""}`}
        >
          <h2
            className={`${styles.display} text-[20px] md:text-[26px] font-medium`}
          >
            Catalog
          </h2>
          <span className="mr-auto text-[12px] text-[#a8b5d6]">
            {catalog.count}
          </span>
          <Link
            className={
              catalogPill +
              " max-md:border-0 max-md:p-0 max-md:text-[13px] max-md:text-[#89dcff]"
            }
            href={exchangePath + "/catalog"}
          >
            <span className="md:hidden">See all →</span>
            <span className="hidden md:inline">Full screen ↗</span>
          </Link>
        </header>
        <div
          className={
            props.cardsOnly && !catalog.query
              ? "max-md:hidden md:contents"
              : "contents"
          }
        >
          {catalog.searchField}
        </div>
        <div
          className={`grid gap-3 md:grid-cols-2 ${catalog.query ? "" : "max-md:[&>button:nth-child(n+4)]:hidden"}`}
        >
          {catalog.cards}
        </div>
      </AngledPanel>
      {catalog.drawer}
    </>
  );
}

export function FullCatalog(props: CatalogProps) {
  const catalog = useCatalog(props, FullCatalogCard);
  return (
    <>
      <section className="space-y-4 md:space-y-5">
        <MobilePageTitle
          title="Catalog"
          detail={catalog.count.toLowerCase()}
          initials={props.initials}
        />
        <div className="flex flex-col gap-4">
          <header className="flex flex-wrap items-center gap-2 max-md:contents">
            <h1
              className={`${styles.display} hidden md:block mr-auto text-[28px] font-medium md:text-[48px]`}
            >
              Catalog
            </h1>
            <Link
              className={catalogPill + " hidden md:block"}
              href={exchangePath}
            >
              Exit full screen
            </Link>
          </header>
          {catalog.searchField}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {catalog.cards}
        </div>
      </section>
      {catalog.drawer}
    </>
  );
}
