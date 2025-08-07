import Link from "next/link";

export default function ConditionalLink({ href, disabled, className, children }: { href: string; disabled?: boolean; className?: string; children: React.ReactNode }) {
  if (disabled) {
    return <span className={className}>{children}</span>;
  }

  return <Link className={className} href={href}>{children}</Link>;
}