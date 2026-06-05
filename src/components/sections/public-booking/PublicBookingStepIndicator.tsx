import { Check } from "lucide-react";

import { cn } from "@/design/variants";

import type {
  PublicBookingStep,
  PublicBookingStepId,
} from "./PublicBookingTypes";

type PublicBookingStepIndicatorProps = {
  currentStepId: PublicBookingStepId;
  steps: readonly PublicBookingStep[];
  variant?: "compact" | "default";
};

export function PublicBookingStepIndicator({
  currentStepId,
  steps,
  variant = "default",
}: PublicBookingStepIndicatorProps) {
  const visibleSteps = steps.filter((step) => step.id !== "confirmation");
  const currentIndex =
    currentStepId === "confirmation"
      ? visibleSteps.length
      : visibleSteps.findIndex((step) => step.id === currentStepId);
  const fillPercent =
    visibleSteps.length <= 1
      ? 0
      : Math.min(
          100,
          Math.max(0, (currentIndex / (visibleSteps.length - 1)) * 100),
        );

  return (
    <nav aria-label="Booking progress">
      <ol
        className={cn(
          "relative flex items-start justify-between",
          variant === "default" && "mx-auto max-w-2xl",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 right-0 z-0 bg-sand",
            variant === "compact" ? "top-3.5 h-px" : "top-6 h-0.5",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 z-0 bg-primary",
            variant === "compact" ? "top-3.5 h-px" : "top-6 h-0.5",
          )}
          style={{ width: `${fillPercent}%` }}
        />
        {visibleSteps.map((step, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;

          return (
            <li className="relative z-10 min-w-0" key={step.id}>
              <div
                className={cn(
                  "flex flex-col items-center text-center",
                  variant === "compact" ? "gap-1" : "gap-2",
                )}
              >
                <span
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border text-xs font-semibold transition",
                    variant === "compact" ? "size-7" : "size-12",
                    completed && "border-primary bg-primary text-white",
                    current && "border-primary bg-primary text-white shadow-floating",
                    !completed && !current && "border-sand bg-sand text-text-muted",
                  )}
                >
                  {completed ? (
                    <Check aria-hidden="true" className="size-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "truncate font-semibold uppercase tracking-widest",
                    variant === "compact" ? "text-[9px]" : "text-xs",
                    completed || current ? "text-primary" : "text-text-muted",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
