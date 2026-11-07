export function getHourlyBookingConfig() {
  return {
    simulation: process.env.JIMBOATS_LOCAL_BOOKINGS === "1",
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  };
}
