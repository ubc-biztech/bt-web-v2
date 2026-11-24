import { MobileNavigation } from "./MobileNavigation";
import { usePortfolio, type useBtxProfile } from "./accountQueries";
import { money, exchangePath } from "./market";
import { useRouter } from "next/router";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

const assets = "/assets/btx/sidebar";

const BTX_ROLES = {
  ADMIN: "Admin",
  TEAM_MEMBER: "Team member",
  INVESTOR: "Investor",
} as const;

type Item = { icon: string; label: string; href?: string };

export function BtxSidebar({
  isAdmin,
  userId,
  user,
  registration,
  variant = "desktop",
}: {
  userId: string;
  isAdmin: boolean;
  variant?: "desktop" | "mobile";
} & ReturnType<typeof useBtxProfile>) {
  const path = useRouter().asPath.split(/[?#]/)[0];
  const [expanded, setExpanded] = useState(false);
  const account = usePortfolio(
    "kickstart;2026",
    userId,
    !!user && !isAdmin && !!registration,
  );

  const role = isAdmin
    ? BTX_ROLES.ADMIN
    : registration
      ? registration.teamID
        ? BTX_ROLES.TEAM_MEMBER
        : BTX_ROLES.INVESTOR
      : undefined;

  const destinations: Item[] = [
    { icon: "search", label: "Search", href: exchangePath + "/search" },
    { icon: "exchange", label: "Exchange", href: exchangePath },
    { icon: "catalog", label: "Catalog", href: exchangePath + "/catalog" },
  ];

  if (role && role !== BTX_ROLES.ADMIN)
    destinations.push({
      icon: "portfolio",
      label: "Portfolio",
      href: exchangePath + "/portfolio",
    });

  destinations.push({
    icon: "leaderboard",
    label: "Leaderboard",
    href: exchangePath + "/leaderboard",
  });

  // Keep the entry discoverable for admins and guests too. The destination
  // checks verified sign-in and participant registration before allowing writes.
  destinations.push({
    icon: role === BTX_ROLES.TEAM_MEMBER ? "company" : "join",
    label:
      role === BTX_ROLES.ADMIN
        ? "Company team"
        : role === BTX_ROLES.TEAM_MEMBER
          ? "My Company"
          : "Join a company",
    href: exchangePath + "/my-company",
  });

  if (role === BTX_ROLES.ADMIN)
    destinations.push(
      {
        icon: "grant",
        label: "Grant funds",
        href: exchangePath + "/admin/grants",
      },
      {
        icon: "ipo",
        label: "Launch IPO",
        href: exchangePath + "/admin#launch-ipo",
      },
      { icon: "admin", label: BTX_ROLES.ADMIN, href: exchangePath + "/admin" },
    );

  const itemLayout = expanded
    ? "w-full justify-start gap-3 px-3"
    : "w-11 justify-center";
  const name =
    [user?.fname, user?.lname].filter(Boolean).join(" ") ||
    user?.email ||
    user?.id;
  const initials = (
    [user?.fname?.[0], user?.lname?.[0]].join("") || name?.[0]
  )?.toUpperCase();

  const identity = (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-600 text-[12px] font-semibold text-white">
        {initials}
      </span>
      {expanded && (
        <span className="min-w-0">
          <span className="block truncate">{name}</span>
          {role && <small className="block text-slate-400">{role}</small>}
          {!isAdmin && account.data && (
            <small className="block text-sky-300">
              {money(account.data.account.cashBalanceCents)}
            </small>
          )}
        </span>
      )}
    </>
  );

  if (variant === "mobile") {
    return <MobileNavigation path={path} admin={isAdmin} />;
  }

  return (
    <>
      <MobileNavigation path={path} admin={isAdmin} />
      <nav
        aria-label="BTX navigation"
        className={`sticky top-0 hidden h-screen md:flex shrink-0 flex-col items-center gap-1.5 overflow-y-auto border-r border-slate-800 bg-slate-950 py-6 text-slate-100 ${expanded ? "w-40 px-4 md:w-60" : "w-14 md:w-[72px]"}`}
      >
        <Link
          href={exchangePath}
          aria-label="BTX exchange"
          className={`flex h-[54px] items-start ${expanded ? "w-full pl-1" : "justify-center"}`}
        >
          <Image
            src={expanded ? `${assets}/wordmark.svg` : `${assets}/emblem.svg`}
            width={expanded ? 101 : 36}
            height={expanded ? 43 : 36}
            alt=""
            unoptimized
          />
        </Link>
        {destinations.map(({ icon: item, label, href }) => {
          const active =
            href === path ||
            (item === "portfolio" &&
              path.startsWith(exchangePath + "/portfolio/")) ||
            (href === exchangePath &&
              (path.startsWith(exchangePath + "/company/") ||
                path === "/companion/kickstart/2026"));
          const content = (
            <>
              <span
                aria-hidden
                className="size-5 shrink-0 bg-white"
                style={{
                  mask: `url(${assets}/${item}.svg) center / contain no-repeat`,
                }}
              />
              {expanded && label}
            </>
          );

          const classes = `flex h-11 shrink-0 items-center rounded-lg text-[14px] text-slate-400 ${itemLayout} ${active ? "bg-sky-950 ring-1 ring-inset ring-sky-400" : ""}`;

          const row = href ? (
            <Link
              href={href}
              aria-label={label}
              title={label}
              aria-current={active ? "page" : undefined}
              className={classes + " hover:bg-slate-800"}
            >
              {content}
            </Link>
          ) : (
            <button
              disabled
              title={label + " (coming soon)"}
              aria-label={label}
              className={classes}
            >
              {content}
            </button>
          );

          return (
            <div key={item} className={expanded ? "w-full" : "w-11"}>
              {item === "grant" && (
                <div className="mb-1.5 border-t border-slate-800" />
              )}
              {row}
              {item === "search" && (
                <div className="mt-1.5 border-t border-slate-800" />
              )}
            </div>
          );
        })}
        <div className="mt-auto" />
        {user && (
          <div
            title={[name, role].filter(Boolean).join(", ")}
            className={`flex items-center py-2 ${itemLayout} ${expanded ? "rounded-xl border border-slate-700 bg-slate-900" : ""}`}
          >
            {identity}
          </div>
        )}
        <button
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          onClick={() => setExpanded(!expanded)}
          className={`flex h-11 shrink-0 items-center text-slate-400 ${itemLayout}`}
        >
          <Image
            src={expanded ? `${assets}/collapse.svg` : `${assets}/expand.svg`}
            width={20}
            height={20}
            alt=""
            unoptimized
          />
          {expanded && "Collapse"}
        </button>
      </nav>
    </>
  );
}
