"use client";

import { LifeBuoy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Container } from "@/components/layout/Container";
import { cn } from "@/design/variants";

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
  PublicBookingCustomer,
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
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState(1);
  const [customer, setCustomer] =
    useState<PublicBookingCustomer>(initialCustomer);
  const [consents, setConsents] =
    useState<PublicBookingConsents>(initialConsents);
  const [formError, setFormError] = useState<string | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<
    string | null
  >(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(
    null,
  );
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const didMountRef = useRef(false);

  const selectedExperience =
    content.experiences.find(
      (experience) => experience.id === selectedExperienceId,
    ) ?? null;
  const selectedExperienceAvailability = selectedExperienceId
    ? content.availabilityByExperienceId?.[selectedExperienceId]
    : null;
  const activeCalendar =
    selectedExperienceAvailability?.calendar ?? content.calendar;
  const activeTimeSlots = selectedDateId
    ? (selectedExperienceAvailability?.timeSlotsByDate[selectedDateId] ?? [])
    : [];
  const selectedDate =
    activeCalendar.days.find((day) => day.id === selectedDateId) ?? null;
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
  const maxGuestCount = Math.max(selectedExperience?.capacity ?? 1, 1);
  const canContinueExperience = Boolean(
    selectedExperience && selectedDate && selectedTimeSlot,
  );
  const showSummary = activeStep !== "confirmation";
  const summaryAction =
    activeStep === "experience"
      ? {
          disabled: !canContinueExperience,
          label: "Continue to extras",
          onClick: () => setActiveStep("extras"),
        }
      : activeStep === "extras"
        ? {
            label: "Continue to payment",
            onClick: () => setActiveStep("payment"),
          }
        : undefined;

  const formatPrice = (amount: number) =>
    `${content.currencySymbol}${amount.toLocaleString("en-US")}`;

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
    setCheckoutClientSecret(null);
    setCheckoutSessionId(null);
    setIsSubmittingPayment(false);
  };

  const toggleExtra = (extraId: string) => {
    setCheckoutClientSecret(null);
    setCheckoutSessionId(null);
    setSelectedExtraIds((current) =>
      current.includes(extraId)
        ? current.filter((selectedId) => selectedId !== extraId)
        : [...current, extraId],
    );
  };

  const submitPayment = async () => {
    const fullName = customer.fullName.trim();
    const email = customer.email.trim();
    const phone = customer.phone.trim();

    if (!selectedExperience || !selectedDate || !selectedTimeSlot) {
      setActiveStep("experience");
      setFormError(null);
      return;
    }

    if (guestCount < 1 || guestCount > selectedExperience.capacity) {
      setFormError("Choose a valid number of guests for this experience.");
      return;
    }

    if (!fullName || !email) {
      setFormError("Add your name and email before confirming.");
      return;
    }

    if (!consents.ticketEmail && !consents.ticketWhatsapp) {
      setFormError("Choose at least one channel for the booking pass.");
      return;
    }

    if (consents.ticketWhatsapp && !phone) {
      setFormError("Add a phone number to receive the pass by WhatsApp.");
      return;
    }

    setFormError(null);
    setIsSubmittingPayment(true);
    setCheckoutClientSecret(null);
    setCheckoutSessionId(null);

    const result = await actions.startCheckout({
      consents,
      customer: {
        email,
        fullName,
        phone,
      },
      endTime: selectedTimeSlot.endTime,
      experienceId: selectedExperience.id,
      guestCount,
      localDate: selectedDate.id,
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
      scrollToBookingSection("public-booking-embedded-checkout");
      return;
    }

    setFormError(result.message);
    setIsSubmittingPayment(false);
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
                  content={content}
                  formatPrice={formatPrice}
                  onSelectDate={(dayId) => {
                    setSelectedDateId(dayId);
                    setSelectedTimeSlotId(null);
                    setSelectedExtraIds([]);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
                    scrollToBookingSection(timeSelectionId);
                  }}
                  onSelectExperience={(experienceId) => {
                    setSelectedExperienceId(experienceId);
                    setSelectedDateId(null);
                    setSelectedTimeSlotId(null);
                    setSelectedExtraIds([]);
                    setGuestCount(1);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
                    scrollToBookingSection(dateSelectionId);
                  }}
                  onSelectTimeSlot={(timeSlotId) => {
                    setSelectedTimeSlotId(timeSlotId);
                    setSelectedExtraIds([]);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
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
                  extras={activeExtras}
                  formatPrice={formatPrice}
                  onSkipExtras={() => {
                    setSelectedExtraIds([]);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
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
                      totalAmount={totalAmount}
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
                    customer={customer}
                    depositAmount={selectedDepositAmount}
                    error={formError}
                    formatPrice={formatPrice}
                    formId={paymentFormId}
                    guestCount={guestCount}
                    maxGuestCount={maxGuestCount}
                    onBack={() => {
                      setFormError(null);
                    setCheckoutClientSecret(null);
                    setCheckoutSessionId(null);
                    setActiveStep("extras");
                    }}
                    onChangeConsents={setConsents}
                    onChangeCustomer={setCustomer}
                    onChangeGuestCount={setGuestCount}
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
                  depositAmount={selectedDepositAmount}
                  experience={selectedExperience}
                  extras={selectedExtras}
                  formatPrice={formatPrice}
                  onStartOver={resetBooking}
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  totalAmount={totalAmount}
                />
              ) : null}
            </div>

            {showSummary ? (
              <PublicBookingSummary
                action={summaryAction}
                className="hidden h-fit lg:sticky lg:top-32 lg:block"
                consents={activeStep === "payment" ? consents : undefined}
                content={content}
                depositAmount={selectedDepositAmount}
                experience={selectedExperience}
                extras={selectedExtras}
                formatPrice={formatPrice}
                selectedDate={selectedDate}
                selectedTimeSlot={selectedTimeSlot}
                totalAmount={totalAmount}
              />
            ) : null}
          </div>
        </Container>
      </main>
      <PublicBookingBottomBar
        activeStep={activeStep}
        canContinueExperience={canContinueExperience}
        depositAmount={selectedDepositAmount}
        experience={selectedExperience}
        formatPrice={formatPrice}
        onContinueExperience={() => setActiveStep("extras")}
        onContinueExtras={() => setActiveStep("payment")}
        paymentCheckoutReady={Boolean(checkoutClientSecret)}
        paymentFormId={paymentFormId}
        paymentSubmitting={isSubmittingPayment}
        selectedDate={selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        totalAmount={totalAmount}
      />
      <PublicBookingFooter content={content} />
    </div>
  );
}

function PublicBookingFooter({ content }: { content: PublicBookingContent }) {
  return (
    <footer className="border-t border-sand/35 bg-white py-8">
      <Container className="flex flex-col gap-5 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <LifeBuoy aria-hidden="true" className="size-4" />
          <span>
            Need help?{" "}
            <a
              className="font-semibold text-text"
              href={`mailto:${content.support.email}`}
            >
              {content.support.email}
            </a>
          </span>
        </div>
        <nav aria-label="Booking legal links" className="flex flex-wrap gap-4">
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
