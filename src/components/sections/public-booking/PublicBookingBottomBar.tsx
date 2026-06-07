import { LockKeyhole } from "lucide-react";

import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { cn } from "@/design/variants";
import { getPublicDictionary } from "@/i18n/public";

import type {
  PublicBookingCalendarDay,
  PublicBookingContent,
  PublicBookingExperience,
  PublicBookingStepId,
  PublicBookingTimeSlot,
} from "./PublicBookingTypes";

type PublicBookingBottomBarProps = {
  activeStep: PublicBookingStepId;
  canContinueExperience: boolean;
  content: PublicBookingContent;
  depositAmount: number;
  experience: PublicBookingExperience | null;
  formatPrice: (amount: number) => string;
  onContinueExperience: () => void;
  onContinueExtras: () => void;
  paymentCheckoutReady: boolean;
  paymentFormId: string;
  paymentSubmitting: boolean;
  selectedDate: PublicBookingCalendarDay | null;
  selectedTimeSlot: PublicBookingTimeSlot | null;
  totalAmount: number;
};

export function PublicBookingBottomBar({
  activeStep,
  canContinueExperience,
  content,
  depositAmount,
  experience,
  formatPrice,
  onContinueExperience,
  onContinueExtras,
  paymentCheckoutReady,
  paymentFormId,
  paymentSubmitting,
  selectedDate,
  selectedTimeSlot,
  totalAmount,
}: PublicBookingBottomBarProps) {
  if (activeStep === "confirmation" || paymentCheckoutReady) {
    return null;
  }

  const canContinueExtras = Boolean(
    experience && selectedDate && selectedTimeSlot,
  );
  const remainingAmount = Math.max(totalAmount - depositAmount, 0);
  const copy = getPublicDictionary(content.locale).booking.bottomBar;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-sand/30 bg-white px-4 py-4 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.12)] lg:hidden">
      {experience ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="size-10 shrink-0 overflow-hidden rounded-xl bg-sand/25">
              <MarketingImageFrame image={experience.image} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-tight text-text">
                {experience.title}
              </p>
              <p className="truncate text-xs text-text-muted">
                {[selectedDate?.dateLabel, selectedTimeSlot?.label]
                  .filter(Boolean)
                  .join(" · ") || copy.chooseDateAndTime}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-text-muted">
              {copy.total}
            </p>
            <p className="font-display text-2xl leading-none text-text">
              {formatPrice(totalAmount)}
            </p>
          </div>
        </div>
      ) : (
        <p className="py-1 text-center text-xs font-light text-text-muted">
          {copy.selectExperience}
        </p>
      )}

      {activeStep === "experience" && experience ? (
        <button
          className={cn(
            "min-h-14 w-full rounded-2xl bg-accent px-5 text-xs font-semibold uppercase tracking-widest text-text transition active:scale-[0.98]",
            !canContinueExperience &&
              "cursor-not-allowed bg-sand text-text-muted opacity-55",
          )}
          disabled={!canContinueExperience}
          onClick={onContinueExperience}
          type="button"
        >
          {copy.continue}
        </button>
      ) : null}

      {activeStep === "extras" ? (
        <button
          className={cn(
            "min-h-14 w-full rounded-2xl bg-accent px-5 text-xs font-semibold uppercase tracking-widest text-text transition active:scale-[0.98]",
            !canContinueExtras &&
              "cursor-not-allowed bg-sand text-text-muted opacity-55",
          )}
          disabled={!canContinueExtras}
          onClick={onContinueExtras}
          type="button"
        >
          {copy.continue}
        </button>
      ) : null}

      {activeStep === "payment" ? (
        <>
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">
              {copy.depositDueNow}
            </span>
            <span className="font-display text-2xl leading-none text-text">
              {formatPrice(depositAmount)}
            </span>
          </div>
          <button
            className={cn(
              "inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold uppercase tracking-widest text-text transition active:scale-[0.98]",
              paymentSubmitting &&
                "cursor-wait bg-sand text-text-muted opacity-70",
            )}
            disabled={paymentSubmitting}
            form={paymentFormId}
            type="submit"
          >
            <LockKeyhole aria-hidden="true" className="size-4" />
            {paymentSubmitting ? copy.openingPayment : copy.payDeposit}
          </button>
          <p className="mt-2 text-center text-[11px] text-text-muted">
            {copy.remainingOnboard(formatPrice(remainingAmount))}
          </p>
        </>
      ) : null}

      {activeStep === "experience" && !experience ? null : (
        <div className="h-[env(safe-area-inset-bottom)]" />
      )}
    </div>
  );
}
