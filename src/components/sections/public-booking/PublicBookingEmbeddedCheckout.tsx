"use client";

import { loadStripe } from "@stripe/stripe-js";
import type { StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { useEffect, useId, useMemo } from "react";

type PublicBookingEmbeddedCheckoutProps = {
  checkoutClientSecret: string;
  checkoutSessionId: string | null;
  stripePublishableKey: string;
};

export function PublicBookingEmbeddedCheckout({
  checkoutClientSecret,
  checkoutSessionId,
  stripePublishableKey,
}: PublicBookingEmbeddedCheckoutProps) {
  const checkoutContainerId = useId().replace(/:/g, "");
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

          window.location.assign(
            `/en/book/success?session_id=${encodeURIComponent(
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
      mountedCheckout?.destroy();
    };
  }, [
    checkoutClientSecret,
    checkoutContainerId,
    checkoutSessionId,
    stripePromise,
  ]);

  return (
    <section
      aria-label="Secure Stripe payment"
      className="scroll-mt-32 overflow-hidden bg-white lg:scroll-mt-40"
      id="public-booking-embedded-checkout"
    >
      <div id={checkoutContainerId} />
    </section>
  );
}
