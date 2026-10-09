import type { ComponentType, ReactNode, SVGProps } from "react";
import Link from "next/link";
import { useUserAttributes } from "@/queries/user";
import { cn } from "@/lib/utils";
import PortalLogo from "@/assets/2026/product+/product-portal-logo.svg";
import PortalIcon from "@/assets/2026/product+/portal-icon.svg";
import PortalInactiveIcon from "@/assets/2026/product+/portal-icon-inactive.svg";
import TeamIcon from "@/assets/2026/product+/team-icon.svg";
import TeamActiveIcon from "@/assets/2026/product+/team-icon-active.svg";
import SubmissionIcon from "@/assets/2026/product+/submission-icon.svg";
import SubmissionActiveIcon from "@/assets/2026/product+/submission-icon-active.svg";
import ArenaIcon from "@/assets/2026/product+/arena-icon.svg";
import AdminIcon from "@/assets/2026/product+/admin-icon.svg";
import MobilePortalIcon from "@/assets/2026/product+/mobile-portal-icon.svg";
import MobileTeamIcon from "@/assets/2026/product+/mobile-team-icon.svg";
import MobileSubmissionIcon from "@/assets/2026/product+/mobile-submission-icon.svg";
import MobileArenaIcon from "@/assets/2026/product+/mobile-arena-icon.svg";
import PinkBackground from "@/assets/2026/product+/background-pink.svg";
import BlueBackground from "@/assets/2026/product+/background-blue.svg";
import { isProductPlusAdmin, type ProductPlusPage } from "../access";
import { productHeadingFont } from "../font";

type Svg = ComponentType<SVGProps<SVGSVGElement>>;
const Logo = PortalLogo as unknown as Svg;
const Pink = PinkBackground as unknown as Svg;
const Blue = BlueBackground as unknown as Svg;
const navigation: {
  page: ProductPlusPage;
  label: string;
  icon: string;
  activeIcon?: string;
  mobileIcon?: string;
  mobileLabel?: string;
}[] = [
  {
    page: "portal",
    label: "Portal",
    icon: PortalInactiveIcon,
    activeIcon: PortalIcon,
    mobileIcon: MobilePortalIcon,
  },
  {
    page: "myteam",
    label: "My Team",
    icon: TeamIcon,
    activeIcon: TeamActiveIcon,
    mobileIcon: MobileTeamIcon,
    mobileLabel: "My team",
  },
  {
    page: "submission",
    label: "Submission",
    icon: SubmissionIcon,
    activeIcon: SubmissionActiveIcon,
    mobileIcon: MobileSubmissionIcon,
  },
  {
    page: "productarena",
    label: "Product Arena",
    mobileLabel: "Arena",
    icon: ArenaIcon,
    mobileIcon: MobileArenaIcon,
  },
  { page: "admin", label: "Admin", icon: AdminIcon },
];

function NavigationItems({
  page,
  mobile = false,
  showAdmin = false,
}: {
  page: ProductPlusPage;
  mobile?: boolean;
  showAdmin?: boolean;
}) {
  return navigation
    .filter((item) => !mobile || item.page !== "admin" || showAdmin)
    .map((item) => {
      const active = page === item.page;
      const asset =
        mobile && item.mobileIcon && (item.page === "portal" ? active : !active)
          ? item.mobileIcon
          : active
            ? item.activeIcon || item.icon
            : item.icon;
      const Icon = asset as unknown as Svg;
      const scaleIcon = mobile && asset !== item.mobileIcon;
      return (
        <Link
          key={item.page}
          href={`/companion/product+/2026/${item.page}`}
          aria-current={active ? "page" : undefined}
          className={cn(
            mobile
              ? "flex h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[26px] text-[11px] leading-[normal] min-[481px]:max-w-[100px] max-[359px]:basis-auto max-[359px]:text-[10px]"
              : "flex h-12 items-center gap-3 rounded-xl px-4 text-[14px] leading-5 max-[960px]:px-3",
            "text-product-muted transition-colors duration-150 hover:bg-product-lavender/55 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-product-primary motion-reduce:transition-none",
            active &&
              (mobile
                ? "bg-product-primary/[0.12] font-semibold text-product-primary"
                : "bg-[#ede9f9] font-semibold text-product-primary"),
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "block shrink-0",
              mobile ? "h-[22px] w-[22px]" : "h-6 w-6",
            )}
          >
            <span
              className={cn(
                "block",
                scaleIcon && "origin-top-left scale-[0.916666667]",
              )}
            >
              <Icon />
            </span>
          </span>
          <span className="whitespace-nowrap">
            {mobile ? item.mobileLabel || item.label : item.label}
          </span>
        </Link>
      );
    });
}

export default function ProductPlusLayout({
  page,
  children,
}: {
  page: ProductPlusPage;
  children: ReactNode;
}) {
  const { data: user } = useUserAttributes();
  const name = user?.given_name
    ? [user.given_name, user.family_name].filter(Boolean).join(" ")
    : user?.name || user?.email || "Guest";
  const initials =
    name === "Guest"
      ? "P+"
      : name
          .split(/[\s@]+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();
  const isExec = user?.email?.toLowerCase().endsWith("@ubcbiztech.com");
  const accountHref = user?.email
    ? "/profile"
    : `/login?redirect=${encodeURIComponent("/companion/product+/2026/portal")}`;

  return (
    <div
      className={cn(
        productHeadingFont.variable,
        "grid min-h-screen grid-cols-[280px_minmax(0,1fr)] gap-2 bg-[linear-gradient(180deg,#f7f4ff,#ebe8f3)] p-2 font-product-body text-[14px] leading-5 text-product-ink [color-scheme:light] max-[1200px]:grid-cols-[240px_minmax(0,1fr)] max-[960px]:grid-cols-[210px_minmax(0,1fr)] max-[640px]:block max-[640px]:p-0",
        "[:where(&)_h1]:font-product-heading [:where(&)_h1]:text-[32px] [:where(&)_h1]:font-normal [:where(&)_h1]:leading-10 [:where(&)_h1]:tracking-[-0.8px] [:where(&)_h1]:text-inherit max-[640px]:[:where(&)_h1]:text-[28px] max-[640px]:[:where(&)_h1]:leading-9",
        "[:where(&)_h2]:font-product-heading [:where(&)_h2]:text-[24px] [:where(&)_h2]:font-normal [:where(&)_h2]:leading-8 [:where(&)_h2]:tracking-[-0.5px] [:where(&)_h2]:text-inherit [:where(&)_h3]:text-[14px] [:where(&)_h3]:font-normal [:where(&)_h3]:leading-5 [:where(&)_h3]:text-inherit [:where(&)_p]:text-[length:inherit] [:where(&)_p]:leading-[inherit] [:where(&)_p]:text-inherit [:where(&)_strong]:font-semibold motion-reduce:[&_*]:transition-none motion-reduce:[&_*]:animate-none",
        page === "productarena" && "max-[640px]:min-h-[100dvh]",
      )}
    >
      <aside className="sticky top-2 flex h-[calc(100vh-16px)] min-h-[540px] flex-col gap-8 rounded-[32px] bg-white/60 px-6 py-8 shadow-[0_8px_28px_rgba(97,80,184,0.07),inset_0_1px_2px_rgba(255,255,255,0.75)] backdrop-blur-[20px] max-[1200px]:px-4 max-[1200px]:py-7 max-[960px]:px-3 max-[960px]:py-6 max-[640px]:hidden">
        <Link
          href="/companion/product+/2026/portal"
          className="block h-[47px] w-[159.4px] shrink-0 focus-visible:outline focus-visible:outline-product-primary focus-visible:outline-offset-[3px]"
          aria-label="Product+ Event Portal"
        >
          <Logo aria-hidden="true" />
        </Link>
        <nav className="flex flex-col gap-2" aria-label="Product+ navigation">
          <NavigationItems page={page} />
        </nav>
        <Link
          href={accountHref}
          className="mt-auto flex items-center gap-3 rounded-2xl bg-white/60 p-3 focus-visible:outline focus-visible:outline-product-primary focus-visible:outline-offset-[3px]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-product-lavender text-[14px] font-semibold text-product-ink">
            {initials}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <strong className="truncate font-semibold">{name}</strong>
            <span className="text-[13px] leading-[18px] text-product-muted">
              {user?.email
                ? isExec
                  ? "Exec"
                  : "Competitor"
                : "Log in to your account"}
            </span>
          </span>
        </Link>
      </aside>
      <main
        id="product-plus-content"
        className={cn(
          "relative min-w-0 overflow-hidden rounded-[32px] border border-white/70 bg-white/60 p-12 shadow-[0_8px_28px_rgba(97,80,184,0.07),inset_0_1px_2px_rgba(255,255,255,0.75)] max-[1200px]:p-8 max-[960px]:p-7 max-[640px]:min-h-screen max-[640px]:rounded-none max-[640px]:px-5 max-[640px]:pt-14 max-[640px]:pb-[calc(120px+env(safe-area-inset-bottom))]",
          page === "productarena" &&
            "bg-[#f7f4ff] p-0 max-[1200px]:p-0 max-[960px]:p-0 max-[640px]:min-h-[100dvh] max-[640px]:border-0 max-[640px]:px-0 max-[640px]:pt-0 max-[640px]:pb-0",
        )}
      >
        {page !== "productarena" ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -left-[300px] -top-[362px] flex h-[840.738px] w-[971.032px] items-center justify-center">
              <div className="relative h-[626.314px] w-[705.786px] shrink-0 [transform:rotate(-55.35deg)_skewX(10.11deg)_scaleY(-0.98)]">
                <div className="absolute inset-x-[-38.74%] inset-y-[-43.65%]">
                  <Pink />
                </div>
              </div>
            </div>
            <div className="absolute left-[228.39px] -top-[191.85px] flex h-[533.624px] w-[713.606px] items-center justify-center">
              <div className="relative h-[420.133px] w-[524.471px] shrink-0 [transform:rotate(19.52deg)_skewX(-11.94deg)_scaleY(-0.98)]">
                <div className="absolute inset-x-[-36.69%] inset-y-[-45.8%]">
                  <Blue />
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="relative z-[1]">{children}</div>
      </main>
      <nav
        aria-label="Product+ mobile navigation"
        className="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] left-5 right-5 z-40 hidden h-[68px] items-center justify-between gap-0.5 overflow-hidden rounded-[34px] border border-white/70 bg-white/60 px-2 shadow-[0_4px_20px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14.5px] max-[640px]:flex max-[359px]:left-3 max-[359px]:right-3"
      >
        <NavigationItems
          page={page}
          mobile
          showAdmin={isProductPlusAdmin(user) || page === "admin"}
        />
      </nav>
    </div>
  );
}
