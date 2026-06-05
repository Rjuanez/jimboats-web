export function getPublicStripePublishableKey() {
  if (process.env.JIMBOATS_ADMIN_PREVIEW_DATA === "1") {
    return "pk_test_jimboats_preview";
  }

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();

  if (!publishableKey) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required.");
  }

  return publishableKey;
}
