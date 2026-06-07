import {
  Anchor,
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageCircle,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { getPublicDictionary } from "@/i18n/public";

import type {
  PublicBookingCalendarDay,
  PublicBookingConsents,
  PublicBookingContent,
  PublicBookingCustomer,
  PublicBookingExperience,
  PublicBookingExtra,
  PublicBookingTimeSlot,
} from "./PublicBookingTypes";

type PublicBookingConfirmationStepProps = {
  consents: PublicBookingConsents;
  content: PublicBookingContent;
  customer: PublicBookingCustomer;
  depositAmount: number;
  extras: readonly PublicBookingExtra[];
  experience: PublicBookingExperience;
  formatPrice: (amount: number) => string;
  onStartOver: () => void;
  selectedDate: PublicBookingCalendarDay;
  selectedTimeSlot: PublicBookingTimeSlot;
  totalAmount: number;
};

export function PublicBookingConfirmationStep({
  consents,
  content,
  customer,
  depositAmount,
  extras,
  experience,
  formatPrice,
  onStartOver,
  selectedDate,
  selectedTimeSlot,
  totalAmount,
}: PublicBookingConfirmationStepProps) {
  const remainingAmount = Math.max(totalAmount - depositAmount, 0);
  const dictionary = getPublicDictionary(content.locale);
  const labels = dictionary.booking.labels;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center shadow-soft lg:rounded-[2rem] lg:px-8 lg:py-10">
        <CheckCircle2
          aria-hidden="true"
          className="mx-auto size-12 text-emerald-700"
        />
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-emerald-800">
          {content.confirmation.bookingReference}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-text lg:text-6xl">
          {content.confirmation.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-light leading-6 text-text-muted lg:text-base lg:leading-7">
          {content.confirmation.subtitle}
        </p>
      </header>

      <section
        aria-labelledby="confirmed-details-title"
        className="overflow-hidden rounded-3xl border border-sand/30 bg-white shadow-soft lg:rounded-[2rem]"
      >
        <div className="border-b border-sand/20 px-5 py-5 lg:px-8">
          <h2
            className="font-display text-2xl leading-none text-text lg:text-3xl"
            id="confirmed-details-title"
          >
            {labels.bookingSummary}
          </h2>
        </div>
        <div className="grid gap-5 px-5 py-5 lg:grid-cols-2 lg:px-8">
          <ConfirmationItem
            icon={<Anchor aria-hidden="true" className="size-5" />}
            label={labels.experience}
            value={experience.title}
          />
          <ConfirmationItem
            icon={<CalendarDays aria-hidden="true" className="size-5" />}
            label={`${labels.date} / ${labels.time}`}
            value={`${selectedDate.dateLabel} · ${selectedTimeSlot.label}`}
          />
          <ConfirmationItem
            icon={<Wallet aria-hidden="true" className="size-5" />}
            label={dictionary.returnPage.depositPaid}
            value={formatPrice(depositAmount)}
          />
          <ConfirmationItem
            icon={<Wallet aria-hidden="true" className="size-5" />}
            label={dictionary.returnPage.remainingOnboard}
            value={formatPrice(remainingAmount)}
          />
        </div>
        <div className="border-t border-sand/20 px-5 py-5 lg:px-8">
          <p className="text-sm font-semibold text-text">{labels.extras}</p>
          {extras.length > 0 ? (
            <ul className="mt-3 grid gap-2 text-sm text-text-muted lg:grid-cols-2">
              {extras.map((extra) => (
                <li key={extra.id}>
                  {extra.title} · {formatPrice(extra.price)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-text-muted">
              {labels.noExtrasSelected}
            </p>
          )}
        </div>
      </section>

      <section
        aria-labelledby="delivery-title"
        className="rounded-3xl border border-sand/30 bg-white px-5 py-5 shadow-soft lg:rounded-[2rem] lg:px-8"
      >
        <h2
          className="font-display text-2xl leading-none text-text lg:text-3xl"
          id="delivery-title"
        >
          {labels.deliveryPreferences}
        </h2>
        <div className="mt-5 grid gap-3">
          <DeliveryLine
            disabledLabel={labels.disabled}
            enabled={consents.ticketEmail}
            enabledLabel={labels.enabled}
            icon={<Mail aria-hidden="true" className="size-5" />}
            label={`${labels.emailPass}: ${customer.email}`}
          />
          <DeliveryLine
            disabledLabel={labels.disabled}
            enabled={consents.ticketWhatsapp}
            enabledLabel={labels.enabled}
            icon={<MessageCircle aria-hidden="true" className="size-5" />}
            label={
              customer.phone
                ? `${labels.whatsappPass}: ${customer.phone}`
                : labels.whatsappPass
            }
          />
          <p className="text-sm leading-6 text-text-muted">
            {labels.promotions}:{" "}
            {consents.marketing ? labels.accepted : labels.notAccepted}.
          </p>
        </div>
      </section>

      <div className="flex justify-center">
        <Button onClick={onStartOver} shape="pill" size="xl" variant="accent">
          {dictionary.returnPage.bookAnother}
        </Button>
      </div>
    </div>
  );
}

function ConfirmationItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          {label}
        </p>
        <p className="mt-1 font-semibold text-text">{value}</p>
      </div>
    </div>
  );
}

function DeliveryLine({
  disabledLabel,
  enabled,
  enabledLabel,
  icon,
  label,
}: {
  disabledLabel: string;
  enabled: boolean;
  enabledLabel: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-sand/45 bg-background px-4 py-3 text-sm">
      <span className="flex min-w-0 items-center gap-3 text-text">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      <span className="shrink-0 font-semibold text-text-muted">
        {enabled ? enabledLabel : disabledLabel}
      </span>
    </div>
  );
}
