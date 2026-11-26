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
      href: exchangePath + "/portfolio",
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
      {mobileTabs.map(({ icon, label, href }) => {
        const active =
          href === path ||
          (icon === "portfolio" && path.startsWith(href + "/")) ||
          (icon === "exchange" && path === "/companion/kickstart/2026") ||
          (icon === "catalog" &&
            (path === exchangePath + "/search" ||
              path.startsWith(exchangePath + "/company/")));
        return (
          <Link
            key={icon}
            href={href}
            aria-current={active ? "page" : undefined}
            className="flex h-[56px] min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-medium text-[#9eabcb] aria-[current=page]:font-bold aria-[current=page]:text-[#89dcff]"
          >
            <span
              aria-hidden="true"
              className="size-5 bg-current"
              style={{
                mask: `url(/assets/btx/sidebar/${icon}.svg) center / contain no-repeat`,
              }}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
