import type { ReactNode } from "react";

import { cn } from "@/design/variants";

type SurfaceProps = {
  action?: ReactNode;
  ariaLabel?: string;
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
};

export function Surface({
  action,
  ariaLabel,
  bodyClassName,
  children,
  className,
  description,
  title,
}: SurfaceProps) {
  const hasHeader = Boolean(title || description || action);

  return (
    <section
      aria-label={ariaLabel ?? title}
      className={cn(
        "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
        className,
      )}
    >
      {hasHeader ? (
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-base font-semibold text-slate-950">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={cn("px-4 py-4 sm:px-5", bodyClassName)}>{children}</div>
    </section>
  );
}
