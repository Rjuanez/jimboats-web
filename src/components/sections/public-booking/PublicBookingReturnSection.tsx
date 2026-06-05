"use client";

import { CheckCircle2, Clock3, Mail, Sailboat, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/design/variants";

type PublicBookingReturnStatus =
  | "CANCELLED"
  | "CONFIRMED"
  | "EXPIRED"
  | "PAYMENT_FAILED"
  | "PENDING_PAYMENT";

export type PublicBookingReturnContent = {
  customerEmail: string;
  experienceTitle: string;
  paidDepositAmount: number;
  reference: string;
  remainingAmount: number;
  status: PublicBookingReturnStatus;
};

type PublicBookingReturnSectionProps = {
  content: PublicBookingReturnContent | null;
  sessionId?: string;
};

export function PublicBookingReturnSection({
  content,
  sessionId,
}: PublicBookingReturnSectionProps) {
  const [currentContent, setCurrentContent] = useState(content);
  const [timedOut, setTimedOut] = useState(false);
  const waitingForFinalStatus =
    currentContent?.status === "PENDING_PAYMENT" && !timedOut;
  const state = currentContent
    ? stateForStatus(currentContent.status, timedOut)
    : missingState;
  const showBookingDetails =
    currentContent !== null && currentContent.status !== "PENDING_PAYMENT";

  useEffect(() => {
    if (!sessionId || currentContent?.status !== "PENDING_PAYMENT") {
      return;
    }

    const encodedSessionId = encodeURIComponent(sessionId);
    let cancelled = false;

    async function waitForFinalStatus() {
      for (let attempt = 0; attempt < 4 && !cancelled; attempt += 1) {
        try {
          const response = await fetch(
            `/api/public-booking/checkout-return/wait?session_id=${encodedSessionId}`,
            {
              cache: "no-store",
            },
          );

          if (!response.ok) {
            continue;
          }

          const payload = (await response.json()) as {
            content: PublicBookingReturnContent | null;
            timedOut?: boolean;
          };

          if (cancelled) {
            return;
          }

          if (payload.content) {
            setCurrentContent(payload.content);
          }

          if (payload.content?.status !== "PENDING_PAYMENT") {
            setTimedOut(false);
            return;
          }

          if (payload.timedOut) {
            setTimedOut(true);
            return;
          }
        } catch {
          await delay(1500);
        }
      }

      if (!cancelled) {
        setTimedOut(true);
      }
    }

    void waitForFinalStatus();

    return () => {
      cancelled = true;
    };
  }, [currentContent?.status, sessionId]);

  return (
    <main className="min-h-screen bg-background py-16 text-text lg:py-24">
      <Container className="max-w-3xl">
        <div className="mb-8">
          <Button href="/en" shape="pill" size="md" variant="secondary">
            Back to JimBoats
          </Button>
        </div>

        <section className="overflow-hidden rounded-3xl border border-sand/35 bg-white shadow-soft lg:rounded-[2rem]">
          <div className={cn("px-6 py-8 lg:px-10 lg:py-10", state.surface)}>
            <state.icon aria-hidden="true" className="size-10" />
            <h1 className="mt-5 font-display text-4xl leading-tight lg:text-6xl">
              {state.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-light leading-7 text-text-muted lg:text-lg lg:leading-8">
              {state.description}
            </p>
          </div>

          {waitingForFinalStatus ? (
            <div className="border-y border-sand/20 bg-white px-6 py-5 lg:px-10">
              <div className="h-2 overflow-hidden rounded-full bg-sand/35">
                <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
              </div>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                This usually takes a few seconds. Please keep this page open.
              </p>
            </div>
          ) : null}

          {showBookingDetails ? (
            <div className="grid gap-px bg-sand/20 md:grid-cols-2">
              <ReturnMetric
                label="Reference"
                value={currentContent.reference}
              />
              <ReturnMetric
                label="Experience"
                value={currentContent.experienceTitle}
              />
              <ReturnMetric
                label="Deposit paid"
                value={formatPrice(currentContent.paidDepositAmount)}
              />
              <ReturnMetric
                label="Remaining onboard"
                value={formatPrice(currentContent.remainingAmount)}
              />
            </div>
          ) : null}

          <div className="space-y-4 px-6 py-6 lg:px-10 lg:py-8">
            {showBookingDetails ? (
              <div className="flex items-start gap-3 rounded-2xl bg-sky-light/45 p-4">
                <Mail aria-hidden="true" className="mt-0.5 size-5 text-primary" />
                <p className="text-sm leading-6 text-text-muted">
                  We will send the booking pass and payment details to{" "}
                  <span className="font-semibold text-text">
                    {currentContent.customerEmail}
                  </span>
                  .
                </p>
              </div>
            ) : null}

            <div
              className={cn(
                "flex flex-col gap-3 sm:flex-row",
                waitingForFinalStatus && "hidden",
              )}
            >
              <Button href="/en/book" shape="pill" size="lg" variant="accent">
                Book another experience
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
          </div>
        </section>
      </Container>
    </main>
  );
}

function ReturnMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-6 py-5 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl leading-tight text-text">
        {value}
      </p>
    </div>
  );
}

function stateForStatus(status: PublicBookingReturnStatus, timedOut = false) {
  if (status === "CONFIRMED") {
    return {
      description:
        "Your deposit has been received and your boat experience is confirmed.",
      icon: CheckCircle2,
      surface: "bg-emerald-50 text-emerald-900",
      title: "Booking confirmed",
    };
  }

  if (status === "PENDING_PAYMENT") {
    if (timedOut) {
      return {
        description:
          "We are still finalizing the payment with Stripe. If this page does not update soon, contact us and we will verify the booking manually.",
        icon: Clock3,
        surface: "bg-amber-50 text-amber-900",
        title: "Still finalizing your booking",
      };
    }

    return {
      description:
        "We are securely closing your reservation and waiting for the final payment confirmation.",
      icon: Clock3,
      surface: "bg-amber-50 text-amber-900",
      title: "Finalizing your booking",
    };
  }

  return {
    description:
      "The checkout was not completed. Your boat slot has not been confirmed.",
    icon: XCircle,
    surface: "bg-rose-50 text-rose-900",
    title: "Payment not completed",
  };
}

const missingState = {
  description:
    "We could not find a checkout session for this return page. Please contact support if you already paid.",
  icon: Sailboat,
  surface: "bg-sky-light/45 text-text",
  title: "Checkout session not found",
};

function formatPrice(amountMinor: number) {
  return `€${(amountMinor / 100).toLocaleString("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
