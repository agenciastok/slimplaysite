import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  md: "min-h-12 px-6 py-3 text-[13px]",
  sm: "min-h-11 px-4 py-2.5 text-[12px]",
} as const;

const variants = {
  primary:
    "bg-accent text-white shadow-[0_10px_30px_rgba(229,9,20,0.35)] hover:bg-accent-bright",
  secondary:
    "border border-white/75 bg-transparent text-white hover:border-accent-bright hover:bg-white/[0.04]",
} as const;

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  showFrom?: "always" | "xl";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  showFrom = "always",
  className,
}: ButtonLinkProps) {
  const classes = cn(
    showFrom === "xl" ? "hidden xl:inline-flex" : "inline-flex",
    "items-center justify-center rounded-full text-center font-semibold uppercase tracking-[0.14em] transition-colors",
    sizes[size],
    variants[variant],
    className,
  );

  if (href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
