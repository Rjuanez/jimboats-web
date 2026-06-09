import { describe, expect, it } from "vitest";

import { addNotificationTemplatePayloadAliases } from "./NotificationTemplatePayloadAliases";

describe("addNotificationTemplatePayloadAliases", () => {
  it("adds localized booking date and time aliases for notification templates", () => {
    const payload = addNotificationTemplatePayloadAliases({
      booking: {
        accessUrl: "https://jimboats.test/es/bookings/JB-2026-0001",
        guestCount: 2,
        reference: "JB-2026-0001",
        selectedEndMinutes: 21 * 60 + 30,
        selectedLocalDate: "2026-06-20",
        selectedStartMinutes: 18 * 60 + 30,
      },
      customer: {
        locale: "es",
        name: "Ruben",
      },
      experience: {
        name: "Sunset Private Cruise",
      },
      payment: {
        cashRemainingAmountMinor: 23_000,
        cashRemainingCurrency: "EUR",
        depositAmountMinor: 10_000,
        depositCurrency: "EUR",
      },
    });

    expect(payload).toMatchObject({
      booking_access_url: "https://jimboats.test/es/bookings/JB-2026-0001",
      booking_date: "20/06/2026",
      booking_date_label: "Sábado, 20 de junio",
      booking_reference: "JB-2026-0001",
      booking_time: "18:30",
      booking_time_range: "18:30 - 21:30",
      customer_name: "Ruben",
      deposit_amount: "100 EUR",
      experience_name: "Sunset Private Cruise",
      guest_count: "2",
      remaining_amount: "230 EUR",
    });
  });
});
