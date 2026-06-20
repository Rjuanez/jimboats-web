import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = cva(
  [
    "inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold",
    "transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-800 disabled:shadow-none",
    "aria-disabled:pointer-events-none aria-disabled:border-slate-300 aria-disabled:bg-slate-300 aria-disabled:text-slate-800 aria-disabled:shadow-none",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-sky-700 text-white hover:bg-sky-800 focus-visible:outline-sky-700",
        secondary:
          "border border-slate-300 bg-white text-slate-950 hover:bg-slate-100 focus-visible:outline-slate-500",
        accent:
          "bg-accent text-text shadow-floating hover:bg-accent-strong focus-visible:outline-accent",
        dark: "bg-text text-white hover:bg-primary-dark focus-visible:outline-text",
        glass:
          "border border-white/35 bg-white/10 text-white shadow-soft backdrop-blur-md hover:bg-white/20 focus-visible:outline-white",
      },
      size: {
        sm: "min-h-9 px-3",
        md: "min-h-10 px-4",
        lg: "min-h-12 px-5 text-base",
        xl: "min-h-14 px-8 text-sm uppercase sm:px-12 sm:text-base",
      },
      shape: {
        md: "rounded-md",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      shape: "md",
      size: "md",
      variant: "primary",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
