"use client";

import { loadStripe } from "@stripe/stripe-js";
import type { StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { useEffect, useId, useMemo, useRef } from "react";

type PublicBookingEmbeddedCheckoutProps = {
  checkoutClientSecret: string;
  checkoutSessionId: string | null;
  returnPath: string;
  securePaymentLabel: string;
  stripePublishableKey: string;
};

export function PublicBookingEmbeddedCheckout({
  checkoutClientSecret,
  checkoutSessionId,
  returnPath,
  securePaymentLabel,
  stripePublishableKey,
}: PublicBookingEmbeddedCheckoutProps) {
  const checkoutContainerId = useId().replace(/:/g, "");
  const completedRef = useRef(false);
  const stripePromise = useMemo(
    () => loadStripe(stripePublishableKey),
    [stripePublishableKey],
  );

  useEffect(() => {
    let mountedCheckout: StripeEmbeddedCheckout | null = null;
    let cancelled = false;

    async function mountCheckout() {
      const stripe = await stripePromise;

      if (!stripe || cancelled) {
        return;
      }

      const checkout = await stripe.createEmbeddedCheckoutPage({
        clientSecret: checkoutClientSecret,
        onComplete: () => {
          if (!checkoutSessionId) {
            return;
          }

          completedRef.current = true;
          window.location.assign(
            `${returnPath}?session_id=${encodeURIComponent(
              checkoutSessionId,
            )}`,
          );
        },
      });

      if (cancelled) {
        checkout.destroy();
        return;
      }

      mountedCheckout = checkout;
      checkout.mount(`#${checkoutContainerId}`);
    }

    void mountCheckout();

    return () => {
      cancelled = true;
      if (checkoutSessionId && !completedRef.current) {
        notifyCheckoutExited(checkoutSessionId);
      }
      mountedCheckout?.destroy();
    };
  }, [
    checkoutClientSecret,
    checkoutContainerId,
    checkoutSessionId,
    returnPath,
    stripePromise,
  ]);

  return (
    <section
      aria-label={securePaymentLabel}
      className="scroll-mt-32 overflow-hidden bg-white lg:scroll-mt-40"
      id="public-booking-embedded-checkout"
    >
      <div id={checkoutContainerId} />
    </section>
  );
}

function notifyCheckoutExited(checkoutSessionId: string) {
  const payload = JSON.stringify({
    providerSessionId: checkoutSessionId,
  });

  if (typeof navigator.sendBeacon === "function") {
    const body = new Blob([payload], {
      type: "application/json",
    });

    navigator.sendBeacon("/api/public-booking/checkout-exit", body);
    return;
  }

  try {
    void fetch("/api/public-booking/checkout-exit", {
      body: payload,
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
      keepalive: true,
      method: "POST",
    }).catch(() => undefined);
  } catch {
    // Best-effort exit signal; checkout teardown must never block the page.
  }
}
