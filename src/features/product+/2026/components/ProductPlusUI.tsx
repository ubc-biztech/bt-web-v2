import type { HTMLAttributes, ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "relative min-w-0 rounded-[24px] border border-white/70 bg-white/60 p-6 shadow-[0_8px_28px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] backdrop-blur-[14px] min-[641px]:rounded-[32px] min-[641px]:p-8",
        className,
      )}
      {...props}
    />
  );
}

export function PageHeading({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-12 flex items-start justify-between gap-6 max-[640px]:mb-7 max-[640px]:flex-col max-[640px]:gap-4",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-product-heading text-[32px] font-normal leading-10 tracking-[-0.8px] text-product-ink max-[640px]:text-[28px] max-[640px]:leading-9">
          {title}
        </h1>
        {description ? (
          <p className="text-[14px] leading-5 text-product-muted">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </header>
  );
}

export function ProductButton({
  variant = "primary",
  className,
  ...props
}: Omit<ButtonProps, "variant"> & { variant?: "primary" | "secondary" }) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto min-h-12 rounded-[100px] border border-white/70 px-6 py-3 text-[14px] font-semibold leading-5 transition-[background,box-shadow] duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-product-primary focus-visible:ring-0 motion-reduce:transition-none",
        variant === "primary"
          ? "bg-product-primary text-white shadow-[0_4px_12px_rgba(97,80,184,0.16),inset_0_1px_2px_rgba(255,255,255,0.38)] hover:bg-[#5140a4] hover:text-white disabled:bg-[#ddd7ee] disabled:text-product-muted disabled:opacity-100 disabled:shadow-[0_4px_12px_rgba(97,80,184,0.08)]"
          : "bg-white/60 text-product-primary shadow-[0_8px_28px_rgba(97,80,184,0.08),inset_0_1px_2px_rgba(255,255,255,0.65)] hover:bg-white hover:text-product-primary disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

export function Pill({
  tone = "purple",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "purple" | "neutral" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center justify-center gap-1.5 rounded-[100px] bg-product-lavender px-3 py-1 text-[14px] font-semibold leading-5 text-product-primary",
        tone === "neutral" && "bg-[#dfe9f3] text-product-muted",
        tone === "success" && "bg-[#e5f5ed] text-[#246953]",
        className,
      )}
      {...props}
    />
  );
}

export function PreviewNotice({ children }: { children?: ReactNode }) {
  return (
    <p className="text-[12px] leading-[18px] text-product-muted">
      {children ?? "Preview only. These sample details are not saved."}
    </p>
  );
}
