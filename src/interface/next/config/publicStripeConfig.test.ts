import { afterEach, expect, it, vi } from "vitest";
import { getPublicStripePublishableKey } from "./publicStripeConfig";
afterEach(() => vi.unstubAllEnvs());
it("does not require a Stripe key for isolated local payments", () => {
  vi.stubEnv("JIMBOATS_LOCAL_BOOKINGS", "1");
  vi.stubEnv("JIMBOATS_ADMIN_PREVIEW_DATA", "0");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "");
  expect(getPublicStripePublishableKey()).toBe("");
});
it("still requires a key outside local test modes", () => {
  vi.stubEnv("JIMBOATS_LOCAL_BOOKINGS", "0");
  vi.stubEnv("JIMBOATS_ADMIN_PREVIEW_DATA", "0");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "");
  expect(() => getPublicStripePublishableKey()).toThrow("is required");
});
