export type BookingIdGenerator = {
  newBookingExtraLineId(input: { bookingId: string; extraId: string }): string;
  newBookingId(): string;
  newBookingReference(input: { now: Date }): string;
  newCalendarBlockId(input: { bookingId: string }): string;
  newPaymentRecordId(input: { bookingId: string }): string;
};
