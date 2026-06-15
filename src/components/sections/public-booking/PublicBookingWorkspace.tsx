"use client";

import { LifeBuoy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  useClientAnalytics,
  type ClientAnalyticsEventName,
  type ClientAnalyticsMetadata,
} from "@/components/analytics/ClientAnalytics";
import { Container } from "@/components/layout/Container";
import { cn } from "@/design/variants";
import { getPublicDictionary } from "@/i18n/public";

import { PublicBookingBottomBar } from "./PublicBookingBottomBar";
import { PublicBookingConfirmationStep } from "./PublicBookingConfirmationStep";
import { PublicBookingExperienceStep } from "./PublicBookingExperienceStep";
import { PublicBookingExtrasStep } from "./PublicBookingExtrasStep";
import { PublicBookingHeader } from "./PublicBookingHeader";
import { PublicBookingMobileSummary } from "./PublicBookingMobileSummary";
import { PublicBookingPaymentStep } from "./PublicBookingPaymentStep";
import { PublicBookingStepIndicator } from "./PublicBookingStepIndicator";
import { PublicBookingSummary } from "./PublicBookingSummary";
import type {
  PublicBookingActions,
  PublicBookingConsents,
  PublicBookingContent,
  PublicBookingCouponPreview,
  PublicBookingCustomer,
  PublicBookingExperienceAvailability,
  PublicBookingStepId,
} from "./PublicBookingTypes";

type PublicBookingWorkspaceProps = {
  actions: PublicBookingActions;
  content: PublicBookingContent;
  initialExperienceId?: string;
  stripePublishableKey: string;
};

const initialCustomer = {
  email: "",
  fullName: "",
  phone: "",
} satisfies PublicBookingCustomer;

const initialConsents = {
  marketing: false,
  ticketEmail: true,
  ticketWhatsapp: false,
} satisfies PublicBookingConsents;

const paymentFormId = "public-booking-payment-form";
const dateSelectionId = "public-booking-date-selection";
const timeSelectionId = "public-booking-time-selection";
const continueAnchorId = "public-booking-continue-anchor";

export function PublicBookingWorkspace({
  actions,
  content,
  initialExperienceId,
  stripePublishableKey,
}: PublicBookingWorkspaceProps) {
  const resolvedInitialExperienceId =
    content.experiences.find(
      (experience) => experience.id === initialExperienceId,
    )?.id ?? null;
  const [activeStep, setActiveStep] =
    useState<PublicBookingStepId>("experience");
  const [selectedExperienceId, setSelectedExperienceId] = useState<
    string | null
  >(resolvedInitialExperienceId);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(
    null,
  );
  const [availabilityByExperienceId, setAvailabilityByExperienceId] = useState(
    content.availabilityByExperienceId,
  );
  const [loadingAvailabilityExperienceId, setLoadingAvailabilityExperienceId] =
    useState<string | null>(() =>
      resolvedInitialExperienceId &&
      !content.availabilityByExperienceId[resolvedInitialExperienceId]
        ? resolvedInitialExperienceId
        : null,
    );
  const [availabilityErrorExperienceId, setAvailabilityErrorExperienceId] =
    useState<string | null>(null);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(1);
  const [customer, setCustomer] =
    useState<PublicBookingCustomer>(initialCustomer);
  const [consents, setConsents] =
    useState<PublicBookingConsents>(initialConsents);
  const [formError, setFormError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] =
    useState<PublicBookingCouponPreview | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<
    string | null
  >(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(
    null,
  );
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const didMountRef = useRef(false);
  const trackedStepRef = useRef<PublicBookingStepId | null>(null);
  const analytics = useClientAnalytics();
  const dictionary = getPublicDictionary(content.locale);

  const selectedExperience =
    content.experiences.find(
      (experience) => experience.id === selectedExperienceId,
    ) ?? null;
  const selectedExperienceAvailability = selectedExperienceId
    ? availabilityByExperienceId[selectedExperienceId]
    : null;
  const emptyCalendar = useMemo(
    () => ({
      ...content.calendar,
      days: [],
      monthLabel: dictionary.booking.experienceStep.availableDates,
      months: [],
    }),
    [content.calendar, dictionary.booking.experienceStep.availableDates],
  );
  const activeCalendar = selectedExperienceId
    ? (selectedExperienceAvailability?.calendar ?? emptyCalendar)
    : content.calendar;
  const activeCalendarDays = activeCalendar.months?.length
    ? activeCalendar.months.flatMap((month) => month.days)
    : activeCalendar.days;
  const activeTimeSlots = selectedDateId
    ? (selectedExperienceAvailability?.timeSlotsByDate[selectedDateId] ?? [])
    : [];
  const availabilityLoading =
    selectedExperienceId === loadingAvailabilityExperienceId;
  const availabilityError =
    selectedExperienceId === availabilityErrorExperienceId
      ? dictionary.booking.experienceStep.availabilityError
      : null;
  const selectedDate =
    activeCalendarDays.find((day) => day.id === selectedDateId) ?? null;
  const selectedTimeSlot =
    activeTimeSlots.find((slot) => slot.id === selectedTimeSlotId) ?? null;
  const compatibleExtras = selectedExperienceId
    ? (content.extrasByExperienceId?.[selectedExperienceId] ?? [])
    : content.extras;
  const activeExtraIds = selectedTimeSlot
    ? new Set(selectedTimeSlot.availableExtraIds)
    : null;
  const activeExtras = activeExtraIds
    ? compatibleExtras.filter((extra) => activeExtraIds.has(extra.id))
    : compatibleExtras;
  const selectedExtras = useMemo(
    () => activeExtras.filter((extra) => selectedExtraIds.includes(extra.id)),
    [activeExtras, selectedExtraIds],
  );
  const extrasAmount = selectedExtras.reduce(
    (sum, extra) => sum + extra.price,
    0,
  );
  const totalAmount = (selectedExperience?.price ?? 0) + extrasAmount;
  const selectedDepositAmount =
    selectedExperience?.depositAmount ?? content.depositAmount;
  const finalTotalAmount = couponPreview?.totalAmount ?? totalAmount;
  const finalDepositAmount =
    couponPreview?.depositAmount ?? selectedDepositAmount;
  const finalDiscountAmount = couponPreview?.discountAmount ?? 0;
  const maxGuestCount = Math.max(selectedExperience?.capacity ?? 1, 1);
  const canContinueExperience = Boolean(
    selectedExperience && selectedDate && selectedTimeSlot,
  );
  const showSummary = activeStep !== "confirmation";
  const summaryAction =
    activeStep === "experience"
      ? {
          disabled: !canContinueExperience,
          label: dictionary.booking.actions.continueToExtras,
          onClick: () => setActiveStep("extras"),
        }
      : activeStep === "extras"
        ? {
            label: dictionary.booking.actions.continueToPayment,
            onClick: () => setActiveStep("payment"),
          }
        : undefined;

  const formatPrice = (amount: number) =>
    `${content.currencySymbol}${amount.toLocaleString(content.locale)}`;
  const trackBookingEvent = useCallback(
    (
      eventName: ClientAnalyticsEventName,
      metadata?: ClientAnalyticsMetadata,
    ) => {
      analytics.track(eventName, {
        currency: "EUR",
        locale: content.locale,
        ...metadata,
      });
    },
    [analytics, content.locale],
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    window.requestAnimationFrame(() => {
      if (
        typeof window.scrollTo === "function" &&
        !window.navigator.userAgent.toLowerCase().includes("jsdom")
      ) {
        window.scrollTo({ behavior: "smooth", top: 0 });
        return;
      }

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, [activeStep]);

  useEffect(() => {
    if (trackedStepRef.current === activeStep) {
      return;
    }

    trackedStepRef.current = activeStep;

    if (activeStep === "extras") {
      trackBookingEvent("booking_extras_viewed", {
        amount_minor: Math.round(totalAmount * 100),
        experience_id: selectedExperienceId ?? "",
        extras_count: activeExtras.length,
      });
    }

    if (activeStep === "payment") {
      trackBookingEvent("booking_payment_viewed", {
        amount_minor: Math.round(finalTotalAmount * 100),
        coupon_applied: Boolean(couponPreview),
        deposit_amount_minor: Math.round(finalDepositAmount * 100),
        experience_id: selectedExperienceId ?? "",
        extras_count: selectedExtras.length,
        guest_count: guestCount,
      });
    }
  }, [
    activeExtras.length,
    activeStep,
    couponPreview,
    finalDepositAmount,
    finalTotalAmount,
    guestCount,
    selectedExperienceId,
    selectedExtras.length,
    totalAmount,
    trackBookingEvent,
  ]);

  useEffect(() => {
    if (!selectedExperienceId) {
      return;
    }

    if (availabilityByExperienceId[selectedExperienceId]) {
      return;
    }

    const controller = new AbortController();
    const availabilityUrl = `/api/public-booking/availability?locale=${encodeURIComponent(
      content.locale,
    )}&experienceId=${encodeURIComponent(selectedExperienceId)}`;

    fetch(availabilityUrl, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Availability request failed.");
        }

        return (await response.json()) as {
          availability?: PublicBookingExperienceAvailability;
        };
      })
      .then((responseBody) => {
        if (!responseBody.availability) {
          throw new Error("Availability response was empty.");
        }

        const availability = responseBody.availability;
        const availableDatesCount = availability.calendar.months?.length
          ? availability.calendar.months.reduce(
              (count, month) => count + month.days.length,
              0,
            )
          : availability.calendar.days.length;

        setAvailabilityByExperienceId((current) => ({
          ...current,
          [selectedExperienceId]: availability,
        }));
        trackBookingEvent("booking_availability_loaded", {
          available_dates_count: availableDatesCount,
          experience_id: selectedExperienceId,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setAvailabilityErrorExperienceId(selectedExperienceId);
        trackBookingEvent("booking_availability_failed", {
          experience_id: selectedExperienceId,
        });
      })
      .finally(() => {
        setLoadingAvailabilityExperienceId((current) =>
          current === selectedExperienceId ? null : current,
        );
      });

    return () => {
      controller.abort();
    };
  }, [
    availabilityByExperienceId,
    content.locale,
    selectedExperienceId,
    trackBookingEvent,
  ]);

  const scrollToBookingSection = (sectionId: string) => {
    window.setTimeout(() => {
      const target = document.getElementById(sectionId);

      if (typeof target?.scrollIntoView !== "function") {
        return;
      }

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const resetBooking = () => {
    setActiveStep("experience");
    setSelectedExperienceId(null);
    setSelectedDateId(null);
    setSelectedTimeSlotId(null);
    setSelectedExtraIds([]);
    setGuestCount(1);
    setCustomer(initialCustomer);
    setConsents(initialConsents);
    setFormError(null);
    resetCoupon();
    setCheckoutClientSecret(null);
    setCheckoutSessionId(null);
    setIsSubmittingPayment(false);
    setLoadingAvailabilityExperienceId(null);
    setAvailabilityErrorExperienceId(null);
  };

  const resetCoupon = () => {
    setCouponCode("");
    setCouponPreview(null);
    setCouponError(null);
    setCouponLoading(false);
  };

  const invalidateCoupon = () => {
    setCouponPreview(null);
    setCouponError(null);
  };

  const toggleExtra = (extraId: string) => {
    const selected = !selectedExtraIds.includes(extraId);

    setCheckoutClientSecret(null);
    setCheckoutSessionId(null);
    invalidateCoupon();
    trackBookingEvent("booking_extra_toggled", {
      extra_id: extraId,
      experience_id: selectedExperienceId ?? "",
      selected,
    });
    setSelectedExtraIds((current) =>
      current.includes(extraId)
        ? current.filter((selectedId) => selectedId !== extraId)
        : [...current, extraId],
    );
  };

  const applyCoupon = async () => {
    if (!selectedExperience || !couponCode.trim()) {
      return;
    }

    trackBookingEvent("booking_coupon_entered", {
      amount_minor: Math.round(totalAmount * 100),
      experience_id: selectedExperience.id,
    });
    setCouponLoading(true);
    setCouponError(null);
    setCouponPreview(null);

    const result = await actions.previewCoupon({
      code: couponCode,
      depositAmountMinor: Math.round(selectedDepositAmount * 100),
      experienceId: selectedExperience.id,
      subtotalAmountMinor: Math.round(totalAmount * 100),
    });

    if (result.ok) {
      setCouponPreview(result.data);
      setCouponCode(result.data.code);
      setCouponLoading(false);
      trackBookingEvent("booking_coupon_applied", {
        coupon_status: "applied",
        deposit_amount_minor: Math.round(result.data.depositAmount * 100),
        discount_amount_minor: Math.round(result.data.discountAmount * 100),
        experience_id: selectedExperience.id,
        total_amount_minor: Math.round(result.data.totalAmount * 100),
      });
      return;
    }

    setCouponError(result.message);
    setCouponLoading(false);
    trackBookingEvent("booking_coupon_failed", {
      coupon_status: "failed",
      experience_id: selectedExperience.id,
    });
  };

  const submitPayment = async () => {
    const fullName = customer.fullName.trim();
    const email = customer.email.trim();
    const phone = customer.phone.trim();

    if (!selectedExperience || !selectedDate || !selectedTimeSlot) {
      setActiveStep("experience");
      setFormError(null);
      trackBookingEvent("booking_validation_failed", {
        reason: "missing_selection",
        step: "payment",
      });
      return;
    }

    if (guestCount < 1 || guestCount > selectedExperience.capacity) {
      setFormError(dictionary.booking.errors.invalidGuests);
      trackBookingEvent("booking_validation_failed", {
        experience_id: selectedExperience.id,
        reason: "invalid_guests",
        step: "payment",
      });
      return;
    }

    if (!fullName || !email) {
      setFormError(dictionary.booking.errors.missingCustomer);
      trackBookingEvent("booking_validation_failed", {
        experience_id: selectedExperience.id,
        reason: "missing_customer",
        step: "payment",
      });
      return;
    }

    if (!consents.ticketEmail && !consents.ticketWhatsapp) {
      setFormError(dictionary.booking.errors.missingDeliveryChannel);
      trackBookingEvent("booking_validation_failed", {
        experience_id: selectedExperience.id,
        reason: "missing_delivery_channel",
        step: "payment",
      });
      return;
    }

    if (consents.ticketWhatsapp && !phone) {
      setFormError(dictionary.booking.errors.missingWhatsappPhone);
      trackBookingEvent("booking_validation_failed", {
        experience_id: selectedExperience.id,
        reason: "missing_whatsapp_phone",
        step: "payment",
      });
      return;
    }

    setFormError(null);
    setIsSubmittingPayment(true);
    setCheckoutClientSecret(null);
    setCheckoutSessionId(null);
    trackBookingEvent("booking_checkout_started", {
      amount_minor: Math.round(finalTotalAmount * 100),
      coupon_applied: Boolean(couponPreview),
      delivery_email_enabled: consents.ticketEmail,
      delivery_whatsapp_enabled: consents.ticketWhatsapp,
      deposit_amount_minor: Math.round(finalDepositAmount * 100),
      experience_id: selectedExperience.id,
      extras_count: selectedExtras.length,
      guest_count: guestCount,
      marketing_consent_enabled: consents.marketing,
    });

    const result = await actions.startCheckout({
      consents,
      couponCode: couponPreview?.code ?? null,
      customer: {
        email,
        fullName,
        phone,
      },
      endTime: selectedTimeSlot.endTime,
      experienceId: selectedExperience.id,
      guestCount,
      localDate: selectedDate.id,
      locale: content.locale,
      selectedExtras: selectedExtras.map((extra) => ({
        extraId: extra.id,
        quantity: 1,
      })),
      slotKey: selectedTimeSlot.slotKey,
      startTime: selectedTimeSlot.startTime,
    });

    if (result.ok) {
      setCheckoutClientSecret(result.data.checkoutClientSecret);
      setCheckoutSessionId(result.data.paymentProviderSessionId);
      setIsSubmittingPayment(false);
      trackBookingEvent("booking_checkout_ready", {
        amount_minor: Math.round(finalTotalAmount * 100),
        coupon_applied: Boolean(couponPreview),
        deposit_amount_minor: Math.round(finalDepositAmount * 100),
        experience_id: selectedExperience.id,
        extras_count: selectedExtras.length,
        guest_count: guestCount,
      });
      scrollToBookingSection("public-booking-embedded-checkout");
      return;
    }

    setFormError(result.message);
    setIsSubmittingPayment(false);
    trackBookingEvent("booking_checkout_failed", {
      experience_id: selectedExperience.id,
      reason: "checkout_action_failed",
    });
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <PublicBookingHeader content={content} currentStepId={activeStep} />
      <main className="pb-36 pt-36 md:pt-40 lg:pb-20">
        <Container className="max-w-7xl">
          <div className="hidden lg:block">
            <PublicBookingStepIndicator
              currentStepId={activeStep}
              steps={content.steps}
            />
          </div>

          <div
            className={cn(
              "grid gap-8 lg:mt-16 lg:gap-12",
              showSummary && "lg:grid-cols-[minmax(0,1fr)_380px]",
            )}
          >
            <div className="min-w-0">
              {activeStep === "experience" ? (
                <PublicBookingExperienceStep
                  calendar={activeCalendar}
                  availabilityError={availabilityError}
                  availabilityLoading={availabilityLoading}
                  content={content}
                  formatPrice={formatPrice}
                  onSelectDate={(dayId) => {
                    trackBookingEvent("booking_date_selected", {
                      date_id: dayId,
                      experience_id: selectedExperienceId ?? "",
                    });
                    setSelectedDateId(dayId);
                    setSelectedTimeSlotId(null);
                    setSelectedExtraIds([]);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
                    invalidateCoupon();
                    scrollToBookingSection(timeSelectionId);
                  }}
                  onSelectExperience={(experienceId) => {
                    const experience = content.experiences.find(
                      (current) => current.id === experienceId,
                    );
                    const availabilityReady = Boolean(
                      availabilityByExperienceId[experienceId],
                    );

                    trackBookingEvent("booking_experience_selected", {
                      amount_minor: Math.round((experience?.price ?? 0) * 100),
                      capacity: experience?.capacity ?? 0,
                      deposit_amount_minor: Math.round(
                        (experience?.depositAmount ?? content.depositAmount) *
                          100,
                      ),
                      experience_id: experienceId,
                    });
                    setSelectedExperienceId(experienceId);
                    setSelectedDateId(null);
                    setSelectedTimeSlotId(null);
                    setSelectedExtraIds([]);
                    setGuestCount(1);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
                    invalidateCoupon();
                    setLoadingAvailabilityExperienceId(
                      availabilityReady ? null : experienceId,
                    );
                    setAvailabilityErrorExperienceId(null);
                    scrollToBookingSection(dateSelectionId);
                  }}
                  onSelectTimeSlot={(timeSlotId) => {
                    const slot = activeTimeSlots.find(
                      (current) => current.id === timeSlotId,
                    );

                    trackBookingEvent("booking_time_selected", {
                      experience_id: selectedExperienceId ?? "",
                      start_time: slot?.startTime ?? "",
                      time_slot_id: timeSlotId,
                    });
                    setSelectedTimeSlotId(timeSlotId);
                    setSelectedExtraIds([]);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
                    invalidateCoupon();
                    scrollToBookingSection(continueAnchorId);
                  }}
                  selectedDateId={selectedDateId}
                  selectedExperienceId={selectedExperienceId}
                  selectedTimeSlotId={selectedTimeSlotId}
                  timeSlots={activeTimeSlots}
                />
              ) : null}

              {activeStep === "extras" ? (
                <PublicBookingExtrasStep
                  content={content}
                  extras={activeExtras}
                  formatPrice={formatPrice}
                  onSkipExtras={() => {
                    setSelectedExtraIds([]);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
                    invalidateCoupon();
                    setActiveStep("payment");
                  }}
                  onToggleExtra={toggleExtra}
                  selectedExtraIds={selectedExtraIds}
                />
              ) : null}

              {activeStep === "payment" ? (
                <>
                  {selectedExperience && selectedDate && selectedTimeSlot ? (
                    <PublicBookingMobileSummary
                      content={content}
                      experience={selectedExperience}
                      extras={selectedExtras}
                      formatPrice={formatPrice}
                      selectedDate={selectedDate}
                      selectedTimeSlot={selectedTimeSlot}
                      totalAmount={finalTotalAmount}
                    />
                  ) : null}
                  <PublicBookingPaymentStep
                    cancellationPolicySummary={
                      selectedExperience?.cancellationPolicySummary ??
                      content.policies.cancellation
                    }
                    checkoutClientSecret={checkoutClientSecret}
                    consents={consents}
                    content={content}
                    couponAppliedCode={couponPreview?.code ?? null}
                    couponCode={couponCode}
                    couponError={couponError}
                    couponLoading={couponLoading}
                    customer={customer}
                    depositAmount={finalDepositAmount}
                    error={formError}
                    formatPrice={formatPrice}
                    formId={paymentFormId}
                    guestCount={guestCount}
                    maxGuestCount={maxGuestCount}
                    onApplyCoupon={applyCoupon}
                    onBack={() => {
                      setFormError(null);
                      setCheckoutClientSecret(null);
                      setCheckoutSessionId(null);
                      setActiveStep("extras");
                    }}
                    onChangeConsents={setConsents}
                    onChangeCouponCode={(code) => {
                      setCouponCode(code);
                      setCouponPreview(null);
                      setCouponError(null);
                      setCheckoutClientSecret(null);
                      setCheckoutSessionId(null);
                    }}
                    onChangeCustomer={setCustomer}
                    onChangeGuestCount={setGuestCount}
                    onRemoveCoupon={resetCoupon}
                    onSubmit={submitPayment}
                    stripePublishableKey={stripePublishableKey}
                    checkoutSessionId={checkoutSessionId}
                    submitting={isSubmittingPayment}
                  />
                </>
              ) : null}

              {activeStep === "confirmation" &&
              selectedExperience &&
              selectedDate &&
              selectedTimeSlot ? (
                <PublicBookingConfirmationStep
                  consents={consents}
                  content={content}
                  customer={customer}
                  depositAmount={finalDepositAmount}
                  experience={selectedExperience}
                  extras={selectedExtras}
                  formatPrice={formatPrice}
                  onStartOver={resetBooking}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  totalAmount={finalTotalAmount}
                />
              ) : null}
            </div>

            {showSummary ? (
              <PublicBookingSummary
                action={summaryAction}
                className="hidden h-fit lg:sticky lg:top-32 lg:block"
                consents={activeStep === "payment" ? consents : undefined}
                content={content}
                depositAmount={finalDepositAmount}
                discountAmount={finalDiscountAmount}
                experience={selectedExperience}
                extras={selectedExtras}
                formatPrice={formatPrice}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                totalAmount={finalTotalAmount}
              />
            ) : null}
          </div>
        </Container>
      </main>
      <PublicBookingBottomBar
        activeStep={activeStep}
        canContinueExperience={canContinueExperience}
        content={content}
        depositAmount={finalDepositAmount}
        experience={selectedExperience}
        formatPrice={formatPrice}
        onContinueExperience={() => setActiveStep("extras")}
        onContinueExtras={() => setActiveStep("payment")}
        paymentCheckoutReady={Boolean(checkoutClientSecret)}
        paymentFormId={paymentFormId}
        paymentSubmitting={isSubmittingPayment}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        totalAmount={finalTotalAmount}
      />
      <PublicBookingFooter content={content} />
    </div>
  );
}

function PublicBookingFooter({ content }: { content: PublicBookingContent }) {
  const dictionary = getPublicDictionary(content.locale);

  return (
    <footer className="border-t border-sand/35 bg-white py-8">
      <Container className="flex flex-col gap-5 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LifeBuoy aria-hidden="true" className="size-4" />
          <span>
            {dictionary.booking.footer.needHelp}{" "}
            <a
              className="font-semibold text-text"
              href={`mailto:${content.support.email}`}
            >
              {content.support.email}
            </a>
          </span>
        </div>
        <nav
          aria-label={dictionary.booking.footer.legalLabel}
          className="flex flex-wrap gap-4"
        >
          {content.footerLinks.map((link) => (
            <a
              className="transition hover:text-text"
              href={link.href}
              key={link.label}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
