import styles from "./btx.module.css";
import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import { companyName } from "./market";
import type { Company } from "./seedApi";

export const catalogPill =
  "rounded-full border border-[#82C3FB]/35 px-3 py-1 text-[12px]";
export const tradeButton =
  "max-md:h-[52px] max-md:border max-md:border-[#82c3fb]/40 max-md:order-last max-md:w-full max-md:text-center rounded-full bg-[#1fbef9] px-5 py-3 text-[15px] font-medium text-[#061323] lg:text-[14px] disabled:bg-[#1e2a40] disabled:text-[#a8b5d6]";

const corners =
  "polygon(30px 0,100% 0,100% calc(100% - 30px),calc(100% - 30px) 100%,0 100%,0 30px)";

export function AngledPanel({
  children,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      {...props}
      className={`relative isolate min-w-0 md:p-[23px] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden md:block bg-gradient-to-r from-[#1fbef9] to-[#e6ebf6]"
        style={{ clipPath: corners }}
      >
        <span
          className="absolute inset-[1.5px] bg-[linear-gradient(165deg,#122235,#0a1221_76%)]"
          style={{ clipPath: corners }}
        />
      </span>
      {children}
    </section>
  );
}

export function CompanyPhoto({
  logo,
  emblemSize,
}: {
  logo?: string;
  emblemSize: number;
}) {
  if (logo) {
    return (
      <Image src={logo} alt="" fill unoptimized className="object-cover" />
    );
  }

  return (
    <Image
      src="/assets/btx/company-emblem.svg"
      className="opacity-[.35]"
      width={emblemSize}
      height={emblemSize}
      alt=""
    />
  );
}

function pitchEmbed(value?: string) {
  if (!value) return;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^(www\.|m\.)/, "");
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : host === "youtube.com"
          ? url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
          : undefined;
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id))
      return "https://www.youtube-nocookie.com/embed/" + id;
  } catch {
    return;
  }
}

export function CompanyPitch({ company }: { company: Company }) {
  const pitch = pitchEmbed(company.youtubeURL);
  return pitch ? (
    <iframe
      className="aspect-video w-full rounded-2xl"
      src={pitch}
      title={companyName(company) + " pitch"}
      allowFullScreen
    />
  ) : (
    <div className="relative grid aspect-video overflow-hidden place-items-center rounded-2xl bg-gradient-to-br from-[#1d2a50] to-[#101829]">
      <CompanyPhoto logo={company.logo} emblemSize={64} />
    </div>
  );
}

const colors = {
  info: "#82C3FB",
  success: "#38D3A2",
  warning: "#FFDDAD",
  error: "#FF5C7A",
};

export type Notice = {
  tone: keyof typeof colors;
  title: string;
  description?: string;
};

export function StatusBanner({
  tone,
  title,
  description,
  onRetry,
  retrying = false,
}: Notice & { onRetry?: () => void; retrying?: boolean }) {
  const color = colors[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className="flex items-start gap-3 rounded-[14px] border px-4 py-3 text-[14px] text-[#E6EBF6]"
      style={{ backgroundColor: color + "1F", borderColor: color + "73" }}
    >
      <Image
        src={`/assets/btx/status/${tone}.svg`}
        width={22}
        height={22}
        alt=""
      />
      <div>
        <p className="text-[14px] font-medium">{title}</p>
        {description && (
          <p className="text-[12px] text-[#B5C1DA]">{description}</p>
        )}
        {onRetry && (
          <button
            type="button"
            className="mt-1 text-[14px] underline disabled:opacity-60"
            onClick={onRetry}
            disabled={retrying}
          >
            {retrying ? "Retrying…" : "Retry"}
          </button>
        )}
      </div>
    </div>
  );
}

export function MobilePageTitle({
  title,
  initials,
  detail,
}: {
  title: string;
  initials?: string;
  detail?: string;
}) {
  return (
    <header className="flex items-center justify-between md:hidden">
      <div>
        <h1
          className={`${styles.display} text-[30px] font-medium leading-tight`}
        >
          {title}
        </h1>
        {detail && <p className="text-[13px] text-[#9eabcb]">{detail}</p>}
      </div>
      {initials && (
        <span
          aria-label="Your profile"
          className="grid size-9 text-xs font-bold place-items-center rounded-full border border-[#89dcff]/50 bg-[#89dcff]/[.16] text-[#89dcff]"
        >
          {initials}
        </span>
      )}
    </header>
  );
}
