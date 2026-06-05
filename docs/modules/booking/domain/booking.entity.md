# Booking

> File name: `booking.entity.md`

## Purpose

Represents a buyer's reservation for one experience, one selected slot, selected
extras, customer details, notification preferences, price snapshot, buyer
access, and payment state.

## Identity

- `bookingId`: stable internal identifier.
- `bookingReference`: public reference used by the buyer and support team.

## Attributes

- `status`: current booking lifecycle state.
- `experienceId`: purchased experience.
- `selectedSlot`: concrete local date and time range selected by the buyer.
- `calendarBlockId`: block that protects the only boat.
- `selectedExtras`: chosen extras with frozen names, prices, and quantities when
  applicable.
- `customerDetails`: buyer contact details, language, and notes.
- `notificationPreferences`: per-booking consent and destination preferences
  for operational email and WhatsApp notifications.
- `bookingAccess`: public reference and secure access metadata.
- `priceSnapshot`: frozen base price, extras price, total, currency, and tax
  assumptions.
- `paymentPlan`: deposit, remaining amount, and payment method rules for the
  booking.
- `paymentRecordId`: payment state associated with the booking.
- `createdAt`: creation time.
- `expiresAt`: hold expiration time while pending payment.

## Invariants

- A booking must reference exactly one experience.
- A booking must have exactly one selected slot.
- A pending or confirmed booking must have an active calendar block.
- A confirmed public booking must have a successful deposit payment record or an
  explicit backpanel override.
- A backpanel booking can be confirmed when deposit is marked as manually paid.
- A public booking is confirmed by deposit payment, not by full payment.
- A booking must keep its price snapshot unchanged after creation unless a
  documented adjustment is made.
- A buyer-access token must not be stored in plain text.
- Selected extras must be compatible with the selected experience at booking
  creation time.
- Contact data alone does not authorize notifications. A buyer channel can only
  receive operational messages when the booking notification preferences allow
  that channel.

## State

- `PENDING_PAYMENT`: checkout hold exists and payment is not confirmed.
- `CONFIRMED`: deposit payment succeeded or a valid backpanel override confirmed
  the reservation.
- `EXPIRED`: payment was not completed before hold expiration.
- `PAYMENT_FAILED`: deposit payment failed and the hold should be released or
  expired.
- `CANCELLED`: booking was cancelled after creation.

## Behavior

- Create a pending booking from a selected experience, selected slot, extras,
  customer details, price snapshot, and calendar block.
- Confirm the booking after successful deposit payment.
- Expire the booking when checkout time runs out.
- Cancel the booking and release or cancel its calendar block.
- Reschedule the booking only from the backpanel while recording the previous
  slot, new slot, actor, and audit note when provided.
- Provide buyer-safe booking details through `BookingAccess`.

## Relationships

- `Experience`: selected product from the catalog.
- `CalendarBlock`: protects the only boat for the selected slot.
- `PaymentRecord`: tracks payment lifecycle without coupling the domain to
  Stripe.
- `BookingPaymentPlan`: defines online deposit and cash-on-board remaining
  amount.
- `CancellationPolicy`: evaluates cancellation rules and deposit outcome.
- `Notification`: messages may be created from booking lifecycle events.
- `BookingNotificationPreferences`: controls whether buyer email and WhatsApp
  notification deliveries may be created for this booking.

## Domain Errors

- `BookingExperienceMissing`
- `BookingSlotMissing`
- `BookingCalendarBlockMissing`
- `BookingCannotBeConfirmed`
- `BookingCannotBeCancelled`
- `BookingCancellationPolicyMissing`
- `BookingHoldExpired`
- `BookingExtraNotCompatible`

## Open Questions

- What exact refund and cancellation rules apply to the deposit?
