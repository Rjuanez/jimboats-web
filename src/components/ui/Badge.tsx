import type { ReactNode } from "react";

import { cn } from "@/design/variants";

type BadgeTone = "amber" | "emerald" | "neutral" | "rose" | "sky";
type BadgeSize = "sm" | "md";

type BadgeProps = {
  "aria-label"?: string;
  children: ReactNode;
  className?: string;
  size?: BadgeSize;
  tone?: BadgeTone;
};

const toneClassName = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
} satisfies Record<BadgeTone, string>;

const sizeClassName = {
  md: "min-h-8 px-2.5 text-sm",
  sm: "min-h-7 px-2 text-xs",
} satisfies Record<BadgeSize, string>;

export function Badge({
  "aria-label": ariaLabel,
  children,
  className,
  size = "md",
  tone = "neutral",
}: BadgeProps) {
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-md border font-semibold leading-none",
        toneClassName[tone],
        sizeClassName[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
