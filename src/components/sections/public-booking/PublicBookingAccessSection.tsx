import {
  CalendarDays,
  CircleAlert,
  Euro,
  Mail,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";

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
};

export function PublicBookingAccessSection({
  content,
}: PublicBookingAccessSectionProps) {
  if (!content) {
    return <InvalidBookingAccessState />;
  }

  const cancellationSummary =
    content.cancellationPolicy?.summaries.en.trim() || null;

  return (
    <main className="min-h-screen bg-background py-10 text-text lg:py-16">
      <Container className="max-w-5xl">
        <div className="mb-6">
          <Button href="/en" shape="pill" size="md" variant="secondary">
            Back to JimBoats
          </Button>
        </div>

        <section className="overflow-hidden rounded-3xl border border-sand/35 bg-white shadow-soft lg:rounded-[2rem]">
          <div className="grid gap-8 bg-sky-light/45 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Booking {content.reference}
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-text lg:text-6xl">
                {content.experienceTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-base font-light leading-7 text-text-muted lg:text-lg">
                Your booking details, payment summary and cancellation policy are
                available here.
              </p>
            </div>
            <div className="rounded-3xl bg-white/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                Status
              </p>
              <p className="mt-3 font-display text-3xl leading-tight">
                {statusLabel(content.status)}
              </p>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                Buyer: {content.customer.fullName}
              </p>
            </div>
          </div>

          <div className="grid gap-px bg-sand/20 md:grid-cols-3">
            <AccessMetric
              icon={CalendarDays}
              label="Date and time"
              value={`${formatDate(content.selectedSlot.date)} · ${content.selectedSlot.startTime}-${content.selectedSlot.endTime}`}
            />
            <AccessMetric
              icon={Users}
              label="Guests"
              value={String(content.guestCount)}
            />
            <AccessMetric
              icon={Euro}
              label="Total"
              value={formatPrice(content.payment.totalAmount)}
            />
          </div>

          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_0.9fr] lg:px-10 lg:py-8">
            <div className="space-y-5">
              <InfoBlock title="Payment">
                <SummaryRow
                  label="Deposit paid"
                  value={formatPrice(content.payment.depositAmount)}
                />
                <SummaryRow
                  label="Remaining onboard"
                  value={formatPrice(content.payment.remainingAmount)}
                />
                <SummaryRow
                  label="Booking total"
                  value={formatPrice(content.payment.totalAmount)}
                />
              </InfoBlock>

              <InfoBlock title="Extras">
                {content.extras.length > 0 ? (
                  content.extras.map((extra) => (
                    <SummaryRow
                      key={extra.name}
                      label={`${extra.name} x${extra.quantity}`}
                      value={formatPrice(extra.totalAmount)}
                    />
                  ))
                ) : (
                  <p className="text-sm leading-6 text-text-muted">
                    No extras selected for this booking.
                  </p>
                )}
              </InfoBlock>
            </div>

            <div className="space-y-5">
              <InfoBlock icon={ShieldCheck} title="Cancellation policy">
                {content.cancellationPolicy ? (
                  <>
                    <p className="text-sm font-semibold text-text">
                      {content.cancellationPolicy.policyName} · version{" "}
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
                            {depositOutcomeLabel(tier.depositOutcome)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-text-muted">
                    No cancellation policy was attached to this booking.
                  </p>
                )}
              </InfoBlock>

              <InfoBlock icon={Mail} title="Contact">
                <p className="text-sm leading-6 text-text-muted">
                  We will use {content.customer.email} for booking updates.
                </p>
                <div className="mt-4">
                  <Button
                    href="mailto:info@jimboatscharter.com"
                    shape="pill"
                    size="md"
                    variant="secondary"
                  >
                    Contact support
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

function InvalidBookingAccessState() {
  return (
    <main className="min-h-screen bg-background py-16 text-text lg:py-24">
      <Container className="max-w-3xl">
        <section className="rounded-3xl border border-sand/35 bg-white p-8 shadow-soft lg:rounded-[2rem] lg:p-10">
          <CircleAlert aria-hidden="true" className="size-10 text-amber-700" />
          <h1 className="mt-5 font-display text-4xl leading-tight lg:text-6xl">
            Booking link not available
          </h1>
          <p className="mt-4 text-base font-light leading-7 text-text-muted lg:text-lg">
            This link is missing, expired or no longer matches an active booking
            access token.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/en" shape="pill" size="lg" variant="accent">
              Back to JimBoats
            </Button>
            <Button
              href="mailto:info@jimboatscharter.com"
              shape="pill"
              size="lg"
              variant="secondary"
            >
              Contact support
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
        {Icon ? <Icon aria-hidden="true" className="size-5 text-primary" /> : null}
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

function statusLabel(status: PublicBookingAccessContent["status"]) {
  const labels: Record<PublicBookingAccessContent["status"], string> = {
    CANCELLED: "Cancelled",
    CONFIRMED: "Confirmed",
    EXPIRED: "Expired",
    PAYMENT_FAILED: "Payment failed",
    PENDING_PAYMENT: "Pending payment",
  };

  return labels[status];
}

function depositOutcomeLabel(
  outcome: NonNullable<
    PublicBookingAccessContent["cancellationPolicy"]
  >["tiers"][number]["depositOutcome"],
) {
  const labels = {
    FULL_REFUND: "Deposit can be fully refunded.",
    MANUAL_REVIEW: "Cancellation requires manual review.",
    NO_REFUND: "Deposit is not refundable.",
    PARTIAL_REFUND: "Deposit can be partially refunded.",
  };

  return labels[outcome];
}

function formatDate(localDate: string) {
  const [year, month, day] = localDate.split("-");

  return `${day}/${month}/${year}`;
}

function formatPrice(amount: number) {
  return `€${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  })}`;
}
