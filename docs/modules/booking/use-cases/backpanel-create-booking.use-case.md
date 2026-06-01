# Backpanel Create Booking

> File name: `backpanel-create-booking.use-case.md`

## Purpose

Allow staff to create a booking from the backpanel.

This supports operational bookings, phone/WhatsApp bookings, and bookings where
the deposit is marked as manually paid.

## Actor

- `ADMIN` backpanel user.
- `STAFF` backpanel user.

## Command Or Query

- `experienceId`: experience being booked.
- `selectedSlot`: concrete date and time range.
- `selectedExtras`: extras selected by staff.
- `customerDetails`: buyer details.
- `depositPaymentMode`: online checkout or manual deposit paid.
- `notes`: internal booking notes.
- `createdBy`: backpanel user creating the booking.

## Response

- `bookingId`: created booking.
- `bookingReference`: public booking reference.
- `status`: resulting booking status.
- `calendarBlockId`: block protecting the boat.
- `depositAmount`: deposit amount, expected to be `100 EUR`.
- `remainingAmount`: amount to be paid in cash on board.

## Ports

- `ExperienceRepository`
- `CalendarBlockRepository`
- `BookingRepository`
- `PaymentRecordRepository`
- `DomainEventPublisher`
- `Clock`

## Rules

- Backpanel booking must still satisfy experience, slot, extra, quantity,
  capacity, and calendar overlap rules.
- Selected date must be within the `6` month maximum advance window unless a
  future explicit override exists.
- Selected date must satisfy the `1` hour minimum advance booking rule unless a
  future explicit override exists.
- Calendar block must include the required `30` minute buffer.
- If deposit is marked manually paid, payment record status becomes
  `MANUALLY_PAID` and booking can be `CONFIRMED`.
- `ADMIN` and `STAFF` can mark the deposit as manually paid at launch.
- If deposit is not manually paid, booking may remain pending or create a future
  payment flow, depending on the selected mode.

## Side Effects

- Persists booking.
- Persists calendar block.
- Persists payment record when deposit is manually paid or payment flow starts.
- Records audit data when staff marks the deposit as manually paid.
- Emits `AdminBookingCreated`.

## Application Errors

- `ExperienceNotFound`
- `ExperienceNotBookable`
- `SelectedSlotOutsidePolicy`
- `CalendarBlockOverlap`
- `ExtraNotCompatibleWithExperience`
- `ExtraQuantityNotAllowed`
- `ExtraMinimumNoticeNotMet`
- `ExtraCapacityReductionInvalid`
- `ManualDepositPaymentInvalid`

## SEO And GEO Impact

- Does not create indexable pages.
- Buyer access page remains non-indexable.
