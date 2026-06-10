"use client";

import { CheckCircle2, Clock3, Mail, Sailboat, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/design/variants";
import { createLocalizedPath, type PublicLocale } from "@/i18n/locales";
import type { PublicDictionary } from "@/i18n/public";

type PublicBookingReturnStatus =
  | "CANCELLED"
  | "CONFIRMED"
  | "EXPIRED"
  | "PAYMENT_FAILED"
  | "PENDING_PAYMENT";

export type PublicBookingReturnContent = {
  bookingAccessUrl: string | null;
  customerEmail: string;
  experienceTitle: string;
  paidDepositAmount: number;
  reference: string;
  remainingAmount: number;
  status: PublicBookingReturnStatus;
};

type PublicBookingReturnSectionProps = {
  content: PublicBookingReturnContent | null;
  dictionary: PublicDictionary["returnPage"] & {
    backToJimBoats: string;
  };
  locale: PublicLocale;
  sessionId?: string;
};

export function PublicBookingReturnSection({
  content,
  dictionary,
  locale,
  sessionId,
}: PublicBookingReturnSectionProps) {
  const [currentContent, setCurrentContent] = useState(content);
  const [timedOut, setTimedOut] = useState(false);
  const waitingForFinalStatus =
    currentContent?.status === "PENDING_PAYMENT" && !timedOut;
  const state = currentContent
    ? stateForStatus(currentContent.status, timedOut, dictionary)
    : missingState(dictionary);
  const showBookingDetails =
    currentContent !== null && currentContent.status !== "PENDING_PAYMENT";

  useEffect(() => {
    if (currentContent?.status === "CONFIRMED" && currentContent.bookingAccessUrl) {
      window.location.assign(currentContent.bookingAccessUrl);
    }
  }, [currentContent?.bookingAccessUrl, currentContent?.status]);

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
          <Button
            href={createLocalizedPath(locale)}
            shape="pill"
            size="md"
            variant="secondary"
          >
            {dictionary.backToJimBoats}
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
                {dictionary.keepOpen}
              </p>
            </div>
          ) : null}

          {showBookingDetails ? (
            <div className="grid gap-px bg-sand/20 md:grid-cols-2">
              <ReturnMetric
                label={dictionary.reference}
                value={currentContent.reference}
              />
              <ReturnMetric
                label={dictionary.experience}
                value={currentContent.experienceTitle}
              />
              <ReturnMetric
                label={dictionary.depositPaid}
                value={formatPrice(currentContent.paidDepositAmount)}
              />
              <ReturnMetric
                label={dictionary.remainingOnboard}
                value={formatPrice(currentContent.remainingAmount)}
              />
            </div>
          ) : null}

          <div className="space-y-4 px-6 py-6 lg:px-10 lg:py-8">
            {showBookingDetails ? (
              <div className="flex items-start gap-3 rounded-2xl bg-sky-light/45 p-4">
                <Mail aria-hidden="true" className="mt-0.5 size-5 text-primary" />
                <p className="text-sm leading-6 text-text-muted">
                  {formatWillSendPass(
                    dictionary.willSendPass,
                    currentContent.customerEmail,
                  )}
                </p>
              </div>
            ) : null}

            <div
              className={cn(
                "flex flex-col gap-3 sm:flex-row",
                waitingForFinalStatus && "hidden",
              )}
            >
              <Button
                href={createLocalizedPath(locale, "/book")}
                shape="pill"
                size="lg"
                variant="accent"
              >
                {dictionary.bookAnother}
              </Button>
              <Button
                href="mailto:info@jimboatscharter.com"
                shape="pill"
                size="lg"
                variant="secondary"
              >
                {dictionary.contactSupport}
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

function stateForStatus(
  status: PublicBookingReturnStatus,
  timedOut: boolean,
  dictionary: PublicDictionary["returnPage"],
) {
  if (status === "CONFIRMED") {
    return {
      description: dictionary.confirmedDescription,
      icon: CheckCircle2,
      surface: "bg-emerald-50 text-emerald-900",
      title: dictionary.confirmedTitle,
    };
  }

  if (status === "PENDING_PAYMENT") {
    if (timedOut) {
      return {
        description: dictionary.stillFinalizingDescription,
        icon: Clock3,
        surface: "bg-amber-50 text-amber-900",
        title: dictionary.stillFinalizingTitle,
      };
    }

    return {
      description: dictionary.finalizingDescription,
      icon: Clock3,
      surface: "bg-amber-50 text-amber-900",
      title: dictionary.finalizingTitle,
    };
  }

  return {
    description: dictionary.failedDescription,
    icon: XCircle,
    surface: "bg-rose-50 text-rose-900",
    title: dictionary.failedTitle,
  };
}

function missingState(dictionary: PublicDictionary["returnPage"]) {
  return {
    description: dictionary.missingDescription,
    icon: Sailboat,
    surface: "bg-sky-light/45 text-text",
    title: dictionary.missingTitle,
  };
}

function formatPrice(amountMinor: number) {
  return `€${(amountMinor / 100).toLocaleString("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

function formatWillSendPass(template: string, email: string) {
  return template.replace("{{ email }}", email);
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
