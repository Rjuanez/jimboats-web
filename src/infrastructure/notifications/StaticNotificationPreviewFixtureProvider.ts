import type { NotificationPreviewFixtureProvider } from "@/modules/notifications/application/ports/NotificationPreviewFixtureProvider";
import type { NotificationPayload } from "@/modules/notifications/domain/NotificationDelivery";

const bookingCreatedFixture: NotificationPayload = {
  booking: {
    guestCount: 4,
    id: "booking-preview",
    reference: "JB-2026-PREVIEW",
    selectedEndMinutes: 14 * 60,
    selectedLocalDate: "2026-06-10",
    selectedSlotKey: "morning",
    selectedStartMinutes: 10 * 60,
    status: "CONFIRMED",
    timeZone: "Europe/Madrid",
  },
  customer: {
    email: "guest@example.com",
    locale: "en",
    name: "Sailor Guest",
    phone: "+34 600 000 000",
  },
  experience: {
    id: "sunset-cruise",
    name: "Sunset Cruise",
  },
  payment: {
    cashRemainingAmountMinor: 119_000,
    cashRemainingCurrency: "EUR",
    depositAmountMinor: 10_000,
    depositCurrency: "EUR",
    totalAmountMinor: 129_000,
    totalCurrency: "EUR",
  },
};

export class StaticNotificationPreviewFixtureProvider
  implements NotificationPreviewFixtureProvider
{
  private readonly fixtures = new Map<string, NotificationPayload>([
    ["booking-created", bookingCreatedFixture],
    ["booking-updated", bookingCreatedFixture],
    ["booking-rescheduled", bookingCreatedFixture],
    ["booking-cancelled", bookingCreatedFixture],
    ["booking-deposit-paid", bookingCreatedFixture],
    ["booking-payment-failed", bookingCreatedFixture],
    ["booking-expired", bookingCreatedFixture],
    ["booking-reminder-due", bookingCreatedFixture],
  ]);

  async findByKey(key: string) {
    return this.fixtures.get(key) ?? null;
  }
}
