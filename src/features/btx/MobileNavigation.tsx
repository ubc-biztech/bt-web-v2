import Link from "next/link";
import { exchangePath } from "./market";

export function MobileNavigation({
  path,
  admin = false,
}: {
  path: string;
  admin?: boolean;
}) {
  const mobileTabs = [
    { icon: "exchange", label: "Exchange", href: exchangePath },
    { icon: "catalog", label: "Catalog", href: exchangePath + "/catalog" },
    {
      icon: "portfolio",
      label: "Portfolio",
      href: admin ? undefined : exchangePath + "/portfolio",
    },
    {
      icon: "leaderboard",
      label: "Ranks",
      href: exchangePath + "/leaderboard",
    },
    admin
      ? { icon: "admin", label: "Admin", href: exchangePath + "/admin" }
      : {
          icon: "company",
          label: "Company",
          // The destination handles sign-in, eligibility, and membership.
          href: exchangePath + "/my-company",
        },
  ];

  if (path.startsWith(exchangePath + "/admin")) return null;

  return (
    <nav
      aria-label="BTX mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#324a68] bg-[#0a1429] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {mobileTabs.map((tab) => {
        const href = tab.href;
        const active =
          href === path ||
          (tab.icon === "portfolio" && !!href && path.startsWith(href + "/")) ||
          (tab.icon === "exchange" && path === "/companion/kickstart/2026") ||
          (tab.icon === "catalog" &&
            (path === exchangePath + "/search" ||
              path.startsWith(exchangePath + "/company/")));
        const contents = (
          <>
            <span
              aria-hidden="true"
              className="size-5 bg-current"
              style={{
                mask: `url(/assets/btx/sidebar/${tab.icon}.svg) center / contain no-repeat`,
              }}
            />
            {tab.label}
          </>
        );
        const classes =
          "flex h-[56px] min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium text-[#9eabcb] aria-[current=page]:font-bold aria-[current=page]:text-[#89dcff] disabled:opacity-60";
        return href ? (
          <Link
            key={tab.icon}
            href={href}
            aria-current={active ? "page" : undefined}
            className={classes}
          >
            {contents}
          </Link>
        ) : (
          <button key={tab.icon} disabled className={classes}>
            {contents}
          </button>
        );
      })}
    </nav>
  );
}
