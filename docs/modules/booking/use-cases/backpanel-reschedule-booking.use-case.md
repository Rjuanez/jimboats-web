# Backpanel Reschedule Booking

> File name: `backpanel-reschedule-booking.use-case.md`

## Purpose

Allow staff to change the date and time of an existing booking from the
backpanel.

There is no fixed limit on the number of reschedules, but every change must be
audited.

## Actor

- Backpanel user.

## Command Or Query

- `bookingId`: booking to reschedule.
- `newSelectedSlot`: new concrete date and time range.
- `reason`: optional staff note explaining the change.
- `changedBy`: backpanel user making the change.

## Response

- `bookingId`: rescheduled booking.
- `oldSelectedSlot`: previous slot.
- `newSelectedSlot`: new slot.
- `oldCalendarBlockId`: previous calendar block.
- `newCalendarBlockId`: new calendar block.

## Ports

- `BookingRepository`
- `CalendarBlockRepository`
- `ExperienceRepository`
- `DomainEventPublisher`
- `Clock`

## Rules

- Public self-service reschedule is not supported.
- There is no fixed maximum number of backpanel reschedules.
- New selected slot must satisfy the experience slot policy.
- New selected slot must satisfy the `6` month maximum advance window.
- New selected slot must satisfy the `1` hour minimum advance booking rule
  unless a future explicit override exists.
- New calendar block must include the required `30` minute buffer.
- New protected range must not overlap any active protected calendar block,
  excluding the booking's current block during the atomic reschedule.
- Old calendar block becomes inactive after the new block is secured.
- Price snapshot remains unchanged unless staff performs a separate documented
  price adjustment.
- A notification should be created for `BOOKING_RESCHEDULED`.

## Side Effects

- Creates new calendar block.
- Releases or cancels old calendar block.
- Updates booking selected slot and calendar block reference.
- Records audit data for the reschedule, including actor, old slot, new slot,
  old calendar block, new calendar block, and optional reason.
- Emits `BookingRescheduled`.

## Application Errors

- `BookingNotFound`
- `BookingCannotBeRescheduled`
- `SelectedSlotOutsidePolicy`
- `BookingDateTooFarInFuture`
- `BookingMinimumNoticeNotMet`
- `CalendarBlockOverlap`

## SEO And GEO Impact

- No direct SEO or GEO impact.
- Buyer access page remains non-indexable.
