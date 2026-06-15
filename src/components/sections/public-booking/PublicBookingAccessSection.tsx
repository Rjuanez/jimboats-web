"use client";

import {
  CalendarDays,
  CircleAlert,
  Euro,
  Mail,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

import { useClientAnalytics } from "@/components/analytics/ClientAnalytics";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import {
  createLocalizedPath,
  localeToIntlLocale,
  type PublicLocale,
} from "@/i18n/locales";
import type { PublicDictionary } from "@/i18n/public";

export type PublicBookingAccessContent = {
  cancellationPolicy: {
    policyName: string;
    summaries: Record<"ca" | "en" | "es", string>;
    tiers: Array<{
      depositOutcome:
        | "FULL_REFUND"
        | "MANUAL_REVIEW"
        | "NO_REFUND"
        | "PARTIAL_REFUND";
      fromMinutesBeforeDeparture: number | null;
      id: string;
      label: string;
      refundAmount: {
        amountMinor: number;
        currency: string;
      } | null;
      toMinutesBeforeDeparture: number | null;
    }>;
    version: number;
  } | null;
  customer: {
    email: string;
    fullName: string;
    phone: string | null;
  };
  experienceTitle: string;
  extras: Array<{
    name: string;
    quantity: number;
    totalAmount: number;
  }>;
  guestCount: number;
  payment: {
    depositAmount: number;
    remainingAmount: number;
    totalAmount: number;
  };
  reference: string;
  selectedSlot: {
    date: string;
    endTime: string;
    startTime: string;
    timeZone: string;
  };
  status:
    | "CANCELLED"
    | "CONFIRMED"
    | "EXPIRED"
    | "PAYMENT_FAILED"
    | "PENDING_PAYMENT";
};

type PublicBookingAccessSectionProps = {
  content: PublicBookingAccessContent | null;
  dictionary: PublicDictionary;
  locale: PublicLocale;
};

export function PublicBookingAccessSection({
  content,
  dictionary,
  locale,
}: PublicBookingAccessSectionProps) {
  const analytics = useClientAnalytics();
  const trackedAccessRef = useRef(false);

  useEffect(() => {
    if (trackedAccessRef.current) {
      return;
    }

    trackedAccessRef.current = true;

    if (!content) {
      analytics.track("booking_access_failed", {
        locale,
        status: "MISSING_OR_INVALID",
      });
      return;
    }

    analytics.track("booking_access_viewed", {
      amount_minor: Math.round(content.payment.totalAmount * 100),
      deposit_amount_minor: Math.round(content.payment.depositAmount * 100),
      extras_count: content.extras.length,
      guest_count: content.guestCount,
      locale,
      remaining_amount_minor: Math.round(content.payment.remainingAmount * 100),
      status: content.status,
    });
  }, [analytics, content, locale]);

  if (!content) {
    return (
      <InvalidBookingAccessState dictionary={dictionary} locale={locale} />
    );
  }

  const cancellationSummary =
    content.cancellationPolicy?.summaries[locale].trim() || null;
  const copy = dictionary.access;

  return (
    <main className="min-h-screen bg-background py-10 text-text lg:py-16">
      <Container className="max-w-5xl">
        <div className="mb-6">
          <Button
            data-analytics-event="booking_access_home_clicked"
            href={createLocalizedPath(locale)}
            shape="pill"
            size="md"
            variant="secondary"
          >
            {dictionary.common.backToJimBoats}
          </Button>
        </div>

        <section className="overflow-hidden rounded-3xl border border-sand/35 bg-white shadow-soft lg:rounded-[2rem]">
          <div className="grid gap-8 bg-sky-light/45 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {copy.bookingPrefix} {content.reference}
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-text lg:text-6xl">
                {content.experienceTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-light leading-7 text-text-muted lg:text-lg">
                {copy.detailsDescription}
              </p>
            </div>
            <div className="rounded-3xl bg-white/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                {copy.status}
              </p>
              <p className="mt-3 font-display text-3xl leading-tight">
                {copy.statusLabels[content.status]}
              </p>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                {copy.buyerPrefix} {content.customer.fullName}
              </p>
            </div>
          </div>

          <div className="grid gap-px bg-sand/20 md:grid-cols-3">
            <AccessMetric
              icon={CalendarDays}
              label={copy.dateAndTime}
              value={`${formatDate(content.selectedSlot.date, locale)} · ${content.selectedSlot.startTime}-${content.selectedSlot.endTime}`}
            />
            <AccessMetric
              icon={Users}
              label={copy.guests}
              value={String(content.guestCount)}
            />
            <AccessMetric
              icon={Euro}
              label={copy.total}
              value={formatPrice(content.payment.totalAmount, locale)}
            />
          </div>

          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:py-8">
            <div className="space-y-5">
              <InfoBlock title={copy.payment}>
                <SummaryRow
                  label={copy.depositPaid}
                  value={formatPrice(content.payment.depositAmount, locale)}
                />
                <SummaryRow
                  label={copy.remainingOnboard}
                  value={formatPrice(content.payment.remainingAmount, locale)}
                />
                <SummaryRow
                  label={copy.total}
                  value={formatPrice(content.payment.totalAmount, locale)}
                />
              </InfoBlock>

              <InfoBlock title={copy.extras}>
                {content.extras.length > 0 ? (
                  content.extras.map((extra) => (
                    <SummaryRow
                      key={extra.name}
                      label={`${extra.name} x${extra.quantity}`}
                      value={formatPrice(extra.totalAmount, locale)}
                    />
                  ))
                ) : (
                  <p className="text-sm leading-6 text-text-muted">
                    {copy.noExtras}
                  </p>
                )}
              </InfoBlock>
            </div>

            <div className="space-y-5">
              <InfoBlock
                icon={ShieldCheck}
                title={copy.cancellationPolicyTitle}
              >
                {content.cancellationPolicy ? (
                  <>
                    <p className="text-sm font-semibold text-text">
                      {content.cancellationPolicy.policyName} · {copy.version}{" "}
                      {content.cancellationPolicy.version}
                    </p>
                    {cancellationSummary ? (
                      <p className="mt-2 text-sm leading-6 text-text-muted">
                        {cancellationSummary}
                      </p>
                    ) : null}
                    <div className="mt-4 space-y-3">
                      {content.cancellationPolicy.tiers.map((tier) => (
                        <div
                          className="rounded-2xl border border-sand/35 p-4"
                          key={tier.id}
                        >
                          <p className="text-sm font-semibold text-text">
                            {tier.label}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-text-muted">
                            {copy.depositOutcome[tier.depositOutcome]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-text-muted">
                    {copy.cancellationFallback}
                  </p>
                )}
              </InfoBlock>

              <InfoBlock icon={Mail} title="Contact">
                <p className="text-sm leading-6 text-text-muted">
                  {copy.contactBody(content.customer.email)}
                </p>
                <div className="mt-4">
                  <Button
                    data-analytics-contact-method="email"
                    data-analytics-event="booking_access_support_clicked"
                    href="mailto:info@jimboatscharter.com"
                    shape="pill"
                    size="md"
                    variant="secondary"
                  >
                    {copy.contactSupport}
                  </Button>
                </div>
              </InfoBlock>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

function InvalidBookingAccessState({
  dictionary,
  locale,
}: {
  dictionary: PublicDictionary;
  locale: PublicLocale;
}) {
  return (
    <main className="min-h-screen bg-background py-16 text-text lg:py-24">
      <Container className="max-w-3xl">
        <section className="rounded-3xl border border-sand/35 bg-white p-8 shadow-soft lg:rounded-[2rem] lg:p-10">
          <CircleAlert aria-hidden="true" className="size-10 text-amber-700" />
          <h1 className="mt-5 font-display text-4xl leading-tight lg:text-6xl">
            {dictionary.access.invalidTitle}
          </h1>
          <p className="mt-4 text-base font-light leading-7 text-text-muted lg:text-lg">
            {dictionary.access.invalidDescription}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              data-analytics-event="booking_access_home_clicked"
              href={createLocalizedPath(locale)}
              shape="pill"
              size="lg"
              variant="accent"
            >
              {dictionary.common.backToJimBoats}
            </Button>
            <Button
              data-analytics-contact-method="email"
              data-analytics-event="booking_access_support_clicked"
              href="mailto:info@jimboatscharter.com"
              shape="pill"
              size="lg"
              variant="secondary"
            >
              {dictionary.access.contactSupport}
            </Button>
          </div>
        </section>
      </Container>
    </main>
  );
}

function AccessMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white px-6 py-5 lg:px-10">
      <Icon aria-hidden="true" className="size-5 text-primary" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl leading-tight text-text">
        {value}
      </p>
    </div>
  );
}

function InfoBlock({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  title: string;
}) {
  return (
    <section className="rounded-3xl border border-sand/35 bg-white p-5">
      <div className="flex items-center gap-3">
        {Icon ? (
          <Icon aria-hidden="true" className="size-5 text-primary" />
        ) : null}
        <h2 className="font-display text-2xl leading-tight">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-sand/25 py-3 last:border-b-0">
      <p className="text-sm leading-6 text-text-muted">{label}</p>
      <p className="text-right text-sm font-semibold leading-6 text-text">
        {value}
      </p>
    </div>
  );
}

function formatDate(localDate: string, locale: PublicLocale) {
  return new Intl.DateTimeFormat(localeToIntlLocale(locale), {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${localDate}T00:00:00.000Z`));
}

function formatPrice(amount: number, locale: PublicLocale) {
  return `€${amount.toLocaleString(localeToIntlLocale(locale), {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  })}`;
}
