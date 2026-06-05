# Create Booking Hold

> File name: `create-booking-hold.use-case.md`

## Purpose

Create a pending booking and an active calendar block while the buyer completes
payment.

## Actor

- Public visitor starting checkout.

## Command Or Query

- `experienceId`: experience being bought.
- `selectedSlot`: concrete date and time range.
- `selectedExtras`: extras selected by the buyer.
- `customerDetails`: buyer details.
- `locale`: locale used for booking access and checkout.

## Response

- `bookingId`: created booking.
- `bookingReference`: public booking reference.
- `depositAmount`: online deposit amount, expected to be `100 EUR`.
- `remainingAmount`: amount to be paid in cash on board.
- `paymentProviderSessionId`: payment provider checkout session reference.
- `checkoutClientSecret`: client secret used by the public page to mount
  embedded checkout.
- `expiresAt`: hold expiration time.

## Ports

- `ExperienceRepository`
- `CalendarBlockRepository`
- `BookingRepository`
- `PaymentProvider`
- `CheckoutHoldPolicy`
- `Clock`

## Rules

- Experience must be published and bookable.
- Selected slot must satisfy the experience slot policy.
- Selected extras must be compatible with the experience.
- Price snapshot is created before the embedded payment form is mounted.
- Price snapshot must include total amount, deposit amount, and remaining
  cash-on-board amount.
- Payment checkout is created for the deposit amount only.
- Checkout hold expires after `30` minutes.
- Selected booking date must be within the maximum advance booking window of `6`
  months.
- Selected booking date must satisfy the minimum advance booking window of `1`
  hour.
- Calendar block source is `BOOKING_HOLD`.
- Calendar block must include required buffer and must not overlap any active
  protected calendar block.
- The overlap check must happen at hold creation time, even if availability was
  shown earlier.
- Selected extras must satisfy quantity, experience compatibility, slot
  compatibility, minimum notice, and capacity reduction rules.

## Side Effects

- Persists a `CalendarBlock`.
- Persists a `Booking` in `PENDING_PAYMENT`.
- Persists or prepares a `PaymentRecord`.
- Creates an embedded payment checkout session for the deposit amount.
- May emit `BookingHoldCreated`.

## Application Errors

- `ExperienceNotFound`
- `ExperienceNotBookable`
- `SelectedSlotOutsidePolicy`
- `CalendarBlockOverlap`
- `ExtraNotCompatibleWithExperience`
- `ExtraQuantityNotAllowed`
- `ExtraMinimumNoticeNotMet`
- `ExtraCapacityReductionInvalid`
- `BookingDateTooFarInFuture`
- `BookingMinimumNoticeNotMet`
- `PaymentCheckoutCouldNotStart`

## SEO And GEO Impact

- Does not create indexable pages.
- Buyer access page must not be added to sitemap and should not be indexed.

## Open Questions

- Should abandoned checkout notifications be sent after hold expiration?
