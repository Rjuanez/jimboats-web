# Backpanel Update Booking

> File name: `backpanel-update-booking.use-case.md`

## Purpose

Allow staff to edit the operational data of a confirmed booking from the
backpanel.

This v2 lifecycle update covers customer details, guest count, selected extras,
internal notes, and date/time reschedule in a single save.

## Implementation Status

Implemented in the admin bookings v2 slice.

The implementation updates the booking, rewrites selected extras, refreshes the
price snapshot, updates the existing confirmed booking calendar block, records
audit entries, and stores outbox messages in one persistence operation.

Notifications, buyer access changes, payment provider adjustments, and outbox
publishing remain outside this slice.

## Actor

- `ADMIN` backpanel user.
- `STAFF` backpanel user.

## Command Or Query

- `bookingId`: booking to update.
- `customerDetails`: current buyer contact and notes.
- `selectedSlot`: concrete local date and time range.
- `guestCount`: number of guests.
- `selectedExtras`: selected extras and quantities.
- `internalNotes`: staff-only operational notes.
- `updatedBy`: backpanel user saving the change.

## Response

- Updated booking DTO.
- Updated selected slot and price snapshot.
- Current calendar block id.
- Current booking status.

## Ports

- `BookingRepository`
- `Clock`
- `BookingIdGenerator`

## Rules

- Only confirmed bookings can be edited in this slice.
- Cancelled, expired, failed, or pending payment bookings are not editable here.
- The selected slot must satisfy the current experience slot policy.
- The selected date must satisfy the maximum advance window.
- The selected date must satisfy the minimum advance booking rule.
- Selected extras must be active and compatible with the booking experience.
- Extra quantities must respect configured per-booking limits.
- Extra notice requirements are validated against the new selected slot.
- Guest count must fit the effective capacity after selected extras.
- The protected calendar range includes the experience buffer.
- The new protected range must not overlap any active calendar block except the
  booking's own current block.
- Saving selected extras refreshes the price snapshot used by the admin detail.

## Side Effects

- Updates booking.
- Deletes and recreates booking extra lines.
- Updates the existing `BOOKING_CONFIRMED` calendar block.
- Records `BOOKING_UPDATED` audit data and stores `BookingUpdated` in the
  outbox.
- If the selected slot changes, also records `BOOKING_RESCHEDULED` audit data
  and stores `BookingRescheduled` in the outbox.

## Application Errors

- `BOOKING_NOT_FOUND`
- `BOOKING_ALREADY_CANCELLED`
- `BOOKING_NOT_EDITABLE`
- `EXPERIENCE_NOT_FOUND`
- `BOOKING_SELECTED_SLOT_OUTSIDE_POLICY`
- `BOOKING_DATE_TOO_FAR_IN_FUTURE`
- `BOOKING_MINIMUM_NOTICE_NOT_MET`
- `BOOKING_EXTRA_NOT_COMPATIBLE`
- `BOOKING_EXTRA_QUANTITY_NOT_ALLOWED`
- `BOOKING_EXTRA_MINIMUM_NOTICE_NOT_MET`
- `BOOKING_GUEST_CAPACITY_EXCEEDED`
- `CALENDAR_BLOCK_OVERLAP`

## SEO And GEO Impact

- No direct SEO or GEO impact.
- Buyer access pages remain non-indexable when implemented.
