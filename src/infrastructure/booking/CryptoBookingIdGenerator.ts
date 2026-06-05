import { randomUUID } from "node:crypto";

import type { BookingIdGenerator } from "@/modules/booking/application/ports/BookingIdGenerator";

export class CryptoBookingIdGenerator implements BookingIdGenerator {
  newBookingExtraLineId(input: { bookingId: string; extraId: string }) {
    return `booking-extra-${input.bookingId}-${input.extraId}`;
  }

  newBookingId() {
    return `booking-${randomUUID()}`;
  }

  newBookingReference(input: { now: Date }) {
    const year = input.now.getUTCFullYear();
    const suffix = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();

    return `JB-${year}-${suffix}`;
  }

  newCalendarBlockId(input: { bookingId: string }) {
    return `block-${input.bookingId}`;
  }

  newPaymentRecordId(input: { bookingId: string }) {
    return `payment-${input.bookingId}`;
  }
}
