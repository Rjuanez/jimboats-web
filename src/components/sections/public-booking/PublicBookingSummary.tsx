import { CalendarDays, Clock, MapPin, Wallet } from "lucide-react";

import { MarketingImageFrame } from "@/components/marketing/MarketingImageFrame";
import { Button } from "@/components/ui/Button";
import { cn } from "@/design/variants";
import { getPublicDictionary } from "@/i18n/public";

import type {
  PublicBookingCalendarDay,
  PublicBookingConsents,
  PublicBookingContent,
  PublicBookingExperience,
  PublicBookingExtra,
  PublicBookingTimeSlot,
} from "./PublicBookingTypes";

type PublicBookingSummaryProps = {
  action?: {
    disabled?: boolean;
    label: string;
    onClick: () => void;
  };
  className?: string;
  consents?: PublicBookingConsents;
  content: PublicBookingContent;
  depositAmount: number;
  discountAmount?: number;
  extras: readonly PublicBookingExtra[];
  experience: PublicBookingExperience | null;
  formatPrice: (amount: number) => string;
  selectedDate: PublicBookingCalendarDay | null;
  selectedTimeSlot: PublicBookingTimeSlot | null;
  totalAmount: number;
};

export function PublicBookingSummary({
  action,
  className,
  consents,
  content,
  depositAmount,
  discountAmount = 0,
  experience,
  extras,
  formatPrice,
  selectedDate,
  selectedTimeSlot,
  totalAmount,
}: PublicBookingSummaryProps) {
  const extrasAmount = extras.reduce((sum, extra) => sum + extra.price, 0);
  const remainingAmount = Math.max(totalAmount - depositAmount, 0);
  const dictionary = getPublicDictionary(content.locale);
  const labels = dictionary.booking.labels;

  return (
    <aside
      aria-label={labels.bookingSummary}
      className={cn(
        "overflow-hidden rounded-[2rem] border border-sand/20 bg-white shadow-soft",
        className,
      )}
    >
      <div className="px-8 pt-8">
        <h2 className="font-display text-3xl leading-none text-text">
          {labels.bookingSummary}
        </h2>
      </div>

      <div className="space-y-6 px-8 py-6">
        {experience ? (
          <>
            <div className="border-b border-sand/30 pb-6">
              <div className="flex items-start gap-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-sand/30">
                  <MarketingImageFrame image={experience.image} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-2xl leading-tight text-text">
                    {experience.title}
                  </p>
                  <p className="mt-1 text-sm font-light leading-6 text-text-muted">
                    {experience.description}
                  </p>
                </div>
              </div>
            </div>

            <dl className="space-y-4 text-sm">
              {selectedDate ? (
                <SummaryRow
                  icon={<CalendarDays aria-hidden="true" className="size-4" />}
                  label={labels.date}
                  value={selectedDate.dateLabel}
                />
              ) : null}
              {selectedTimeSlot ? (
                <SummaryRow
                  icon={<Clock aria-hidden="true" className="size-4" />}
                  label={labels.time}
                  value={selectedTimeSlot.label}
                />
              ) : null}
              <SummaryRow
                icon={<MapPin aria-hidden="true" className="size-4" />}
                label={labels.meetingPoint}
                value={content.policies.meetingPoint}
              />
            </dl>

            <div className="border-t border-sand/30 pt-4">
              <p className="text-sm font-semibold text-text">
                {labels.selectedExtras}
              </p>
              {extras.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {extras.map((extra) => (
                    <li className="flex justify-between gap-4" key={extra.id}>
                      <span className="text-text-muted">{extra.title}</span>
                      <span className="font-semibold text-text">
                        {formatPrice(extra.price)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm font-light text-text-muted">
                  {labels.noExtrasSelected}
                </p>
              )}
            </div>

            <div className="border-t border-sand/30 pt-5 text-sm">
              <PriceRow
                label={labels.experience}
                value={formatPrice(experience.price)}
              />
              {extrasAmount > 0 ? (
                <PriceRow label={labels.extras} value={formatPrice(extrasAmount)} />
              ) : null}
              {discountAmount > 0 ? (
                <PriceRow
                  label={labels.couponDiscount}
                  value={`-${formatPrice(discountAmount)}`}
                />
              ) : null}
              <PriceRow
                emphasis
                label={labels.total}
                value={formatPrice(totalAmount)}
              />
            </div>

            <div className="rounded-2xl border border-sand/35 bg-background px-4 py-3">
              <div className="flex items-start gap-3">
                <Wallet
                  aria-hidden="true"
                  className="mt-0.5 size-4 text-primary"
                />
                <div className="min-w-0 text-sm leading-6">
                  <p className="font-semibold text-text">
                    {labels.depositDueNow(formatPrice(depositAmount))}
                  </p>
                  <p className="font-light text-text-muted">
                    {labels.remainingBalance(formatPrice(remainingAmount))}
                  </p>
                </div>
              </div>
            </div>

            {consents ? (
              <div className="border-t border-sand/30 pt-4 text-sm">
                <p className="font-semibold text-text">
                  {labels.deliveryPreferences}
                </p>
                <ul className="mt-2 space-y-1 text-text-muted">
                  <li>
                    {labels.emailPass}:{" "}
                    {consents.ticketEmail ? labels.enabled : labels.disabled}
                  </li>
                  <li>
                    {labels.whatsappPass}:{" "}
                    {consents.ticketWhatsapp ? labels.enabled : labels.disabled}
                  </li>
                  <li>
                    {labels.promotions}:{" "}
                    {consents.marketing ? labels.accepted : labels.notAccepted}
                  </li>
                </ul>
              </div>
            ) : null}

            {action ? (
              <Button
                className="w-full"
                disabled={action.disabled}
                onClick={action.onClick}
                shape="pill"
                size="xl"
                variant={action.disabled ? "secondary" : "accent"}
              >
                {action.label}
              </Button>
            ) : null}
          </>
        ) : (
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-sand/20">
              <CalendarDays
                aria-hidden="true"
                className="size-8 text-text-muted"
              />
            </div>
            <p className="font-light text-text-muted">
              {dictionary.booking.bottomBar.selectExperience}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="flex items-center gap-2 font-light text-text-muted">
        {icon}
        {label}
      </dt>
      <dd className="text-right font-semibold text-text">{value}</dd>
    </div>
  );
}

function PriceRow({
  emphasis = false,
  label,
  value,
}: {
  emphasis?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-1",
        emphasis && "mt-3 border-t-2 border-sand/50 pt-4",
      )}
    >
      <span
        className={cn(
          "text-text-muted",
          emphasis && "text-xs font-semibold uppercase tracking-widest",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "font-semibold text-text",
          emphasis && "font-display text-4xl leading-none",
        )}
      >
        {value}
      </span>
    </div>
  );
}
