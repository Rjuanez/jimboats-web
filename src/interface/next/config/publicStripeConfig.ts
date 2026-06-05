export function getPublicStripePublishableKey() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required.");
  }

  return publishableKey;
}
