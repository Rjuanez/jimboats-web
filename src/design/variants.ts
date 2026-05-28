import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const buttonVariants = cva(
  [
    "inline-flex min-h-10 items-center justify-center rounded-md px-4 text-sm font-semibold",
    "transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-sky-700 text-white hover:bg-sky-800 focus-visible:outline-sky-700",
        secondary:
          "border border-slate-300 bg-white text-slate-950 hover:bg-slate-100 focus-visible:outline-slate-500",
      },
      size: {
        sm: "min-h-9 px-3",
        md: "min-h-10 px-4",
        lg: "min-h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
