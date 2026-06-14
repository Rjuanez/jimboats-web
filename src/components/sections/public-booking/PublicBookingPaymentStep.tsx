import type { FormEvent } from "react";

import {
  ArrowLeft,
  ChevronDown,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  PublicCheckboxField,
  PublicTextField,
} from "@/components/forms/PublicBookingFormControls";
import { Button } from "@/components/ui/Button";
import { getPublicDictionary } from "@/i18n/public";

import type {
  PublicBookingConsents,
  PublicBookingContent,
  PublicBookingCustomer,
} from "./PublicBookingTypes";
import { PublicBookingEmbeddedCheckout } from "./PublicBookingEmbeddedCheckout";

type PublicBookingPaymentStepProps = {
  checkoutClientSecret: string | null;
  checkoutSessionId: string | null;
  cancellationPolicySummary: string;
  consents: PublicBookingConsents;
  content: PublicBookingContent;
  couponAppliedCode: string | null;
  couponCode: string;
  couponError: string | null;
  couponLoading: boolean;
  customer: PublicBookingCustomer;
  depositAmount: number;
  error: string | null;
  formatPrice: (amount: number) => string;
  formId: string;
  guestCount: number;
  maxGuestCount: number;
  onBack: () => void;
  onApplyCoupon: () => Promise<void>;
  onChangeConsents: (consents: PublicBookingConsents) => void;
  onChangeCouponCode: (code: string) => void;
  onChangeCustomer: (customer: PublicBookingCustomer) => void;
  onChangeGuestCount: (guestCount: number) => void;
  onRemoveCoupon: () => void;
  onSubmit: () => Promise<void>;
  stripePublishableKey: string;
  submitting: boolean;
};

export function PublicBookingPaymentStep({
  checkoutClientSecret,
  checkoutSessionId,
  cancellationPolicySummary,
  consents,
  content,
  couponAppliedCode,
  couponCode,
  couponError,
  couponLoading,
  customer,
  depositAmount,
  error,
  formatPrice,
  formId,
  guestCount,
  maxGuestCount,
  onBack,
  onApplyCoupon,
  onChangeConsents,
  onChangeCouponCode,
  onChangeCustomer,
  onChangeGuestCount,
  onRemoveCoupon,
  onSubmit,
  stripePublishableKey,
  submitting,
}: PublicBookingPaymentStepProps) {
  const labels = getPublicDictionary(content.locale).booking.labels;
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkoutClientSecret) {
      return;
    }

    await onSubmit();
  };
  const guestOptions = Array.from({ length: maxGuestCount }, (_, index) => {
    const value = index + 1;

    return (
      <option key={value} value={value}>
        {value}
      </option>
    );
  });
  const cardClassName =
    "overflow-hidden rounded-3xl border border-sand/30 bg-white shadow-soft lg:rounded-[2rem]";

  if (checkoutClientSecret) {
    return (
      <div className="space-y-6 lg:space-y-10">
        <header className="px-1 lg:px-0">
          <h1 className="font-display text-4xl leading-tight text-text lg:text-6xl">
            {content.payment.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-light leading-6 text-text-muted lg:mt-4 lg:text-lg lg:leading-8">
            {content.payment.subtitle}
          </p>
        </header>

        <div className={cardClassName} id={formId}>
          <PublicBookingEmbeddedCheckout
            checkoutClientSecret={checkoutClientSecret}
            checkoutSessionId={checkoutSessionId}
            returnPath={`${content.bookHref}/success`}
            securePaymentLabel={labels.securePayment}
            stripePublishableKey={stripePublishableKey}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10">
      <header className="px-1 lg:px-0">
        <h1 className="font-display text-4xl leading-tight text-text lg:text-6xl">
          {content.payment.title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm font-light leading-6 text-text-muted lg:mt-4 lg:text-lg lg:leading-8">
          {content.payment.subtitle}
        </p>
      </header>

      <form
        className={cardClassName}
        id={formId}
        onSubmit={handleSubmit}
      >
        <section
          aria-labelledby="public-booking-details-title"
          className="border-b border-sand/20 px-5 py-6 lg:px-8 lg:py-8"
        >
          <h2
            className="font-display text-2xl leading-none text-text lg:text-3xl"
            id="public-booking-details-title"
          >
            {labels.yourDetails}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <PublicTextField
              autoComplete="name"
              className="rounded-2xl"
              disabled={submitting}
              label={labels.fullName}
              name="fullName"
              onChange={(event) =>
                onChangeCustomer({
                  ...customer,
                  fullName: event.currentTarget.value,
                })
              }
              placeholder="John Smith"
              required
              value={customer.fullName}
            />
            <PublicTextField
              autoComplete="email"
              className="rounded-2xl"
              disabled={submitting}
              label={labels.emailAddress}
              name="email"
              onChange={(event) =>
                onChangeCustomer({
                  ...customer,
                  email: event.currentTarget.value,
                })
              }
              placeholder="john@example.com"
              required
              type="email"
              value={customer.email}
            />
            <PublicTextField
              autoComplete="tel"
              className="rounded-2xl"
              description={labels.phoneDescription}
              disabled={submitting}
              label={labels.phone}
              name="phone"
              onChange={(event) =>
                onChangeCustomer({
                  ...customer,
                  phone: event.currentTarget.value,
                })
              }
              placeholder="+34 600 000 000"
              type="tel"
              value={customer.phone}
            />
            <label className="block min-w-0" htmlFor="guestCount">
              <span className="block text-sm font-semibold text-text">
                {labels.guests}
              </span>
              <span className="relative mt-2 block">
                <select
                  className="min-h-12 w-full appearance-none rounded-2xl border border-sand/60 bg-background px-4 py-3 pr-12 text-base leading-6 text-text shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text disabled:bg-sand/20 disabled:text-text-muted"
                  disabled={submitting}
                  id="guestCount"
                  name="guestCount"
                  onChange={(event) =>
                    onChangeGuestCount(Number(event.currentTarget.value))
                  }
                  value={guestCount}
                >
                  {guestOptions}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-text-muted"
                />
              </span>
              <span className="mt-2 block text-sm leading-6 text-text-muted">
                {labels.capacity(maxGuestCount)}
              </span>
            </label>
          </div>
        </section>

        <section
          aria-labelledby="public-booking-coupon-title"
          className="border-b border-sand/20 px-5 py-6 lg:px-8 lg:py-8"
        >
          <h2
            className="font-display text-2xl leading-none text-text lg:text-3xl"
            id="public-booking-coupon-title"
          >
            {labels.coupon}
          </h2>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <PublicTextField
              autoComplete="off"
              className="rounded-2xl sm:flex-1"
              disabled={submitting || couponLoading || Boolean(couponAppliedCode)}
              label={labels.coupon}
              name="couponCode"
              onChange={(event) => onChangeCouponCode(event.currentTarget.value)}
              placeholder={labels.couponPlaceholder}
              value={couponCode}
            />
            <Button
              className="sm:self-end"
              disabled={submitting || couponLoading || !couponCode.trim()}
              loading={couponLoading}
              onClick={couponAppliedCode ? onRemoveCoupon : onApplyCoupon}
              shape="pill"
              size="lg"
              type="button"
              variant={couponAppliedCode ? "secondary" : "accent"}
            >
              {couponAppliedCode ? labels.couponRemove : labels.couponApply}
            </Button>
          </div>
          {couponAppliedCode ? (
            <p className="mt-3 text-sm font-semibold text-primary" role="status">
              {labels.couponApplied(couponAppliedCode)}
            </p>
          ) : null}
          {couponError ? (
            <p
              className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
              role="alert"
            >
              {couponError}
            </p>
          ) : null}
        </section>

        <section
          aria-labelledby="public-booking-consents-title"
          className="border-b border-sand/20 px-5 py-6 lg:px-8 lg:py-8"
        >
          <h2
            className="font-display text-2xl leading-none text-text lg:text-3xl"
            id="public-booking-consents-title"
          >
            {labels.bookingPass}
          </h2>
          <div className="mt-5 grid gap-3">
            <PublicCheckboxField
              checked={consents.ticketEmail}
              className="rounded-2xl"
              description={labels.emailPassDescription}
              disabled={submitting}
              label={labels.emailPass}
              name="ticketEmail"
              onChange={(event) =>
                onChangeConsents({
                  ...consents,
                  ticketEmail: event.currentTarget.checked,
                })
              }
            />
            <PublicCheckboxField
              checked={consents.ticketWhatsapp}
              className="rounded-2xl"
              description={labels.whatsappPassDescription}
              disabled={submitting}
              label={labels.whatsappPass}
              name="ticketWhatsapp"
              onChange={(event) =>
                onChangeConsents({
                  ...consents,
                  ticketWhatsapp: event.currentTarget.checked,
                })
              }
            />
            <PublicCheckboxField
              checked={consents.marketing}
              className="rounded-2xl"
              description={labels.promotionsDescription}
              disabled={submitting}
              label={labels.promotions}
              name="marketing"
              onChange={(event) =>
                onChangeConsents({
                  ...consents,
                  marketing: event.currentTarget.checked,
                })
              }
            />
          </div>
        </section>

        <section
          aria-label={labels.securePayment}
          className="px-5 py-6 lg:px-8 lg:py-8"
        >
          {error ? (
            <p
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="rounded-2xl border border-sand/40 bg-background px-4 py-4">
            <div className="flex items-start gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-primary"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text">
                  {labels.cancellationPolicy}
                </p>
                <p className="mt-1 text-sm font-light leading-6 text-text-muted">
                  {cancellationPolicySummary}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-text-muted">
            {labels.termsAgreement}
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 lg:flex-row lg:justify-between">
            <Button
              className="hidden lg:inline-flex"
              disabled={submitting}
              onClick={onBack}
              shape="pill"
              size="lg"
              variant="secondary"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              {labels.back}
            </Button>
            <Button
              disabled={submitting}
              loading={submitting}
              shape="pill"
              size="xl"
              type="submit"
              variant="accent"
            >
              <LockKeyhole aria-hidden="true" className="size-5" />
              {submitting
                ? labels.preparingPayment
                : `${labels.securePayment} ${formatPrice(depositAmount)}`}
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}
