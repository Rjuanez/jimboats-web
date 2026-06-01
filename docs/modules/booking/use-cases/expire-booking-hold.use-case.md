# Expire Booking Hold

> File name: `expire-booking-hold.use-case.md`

## Purpose

Expire unpaid checkout holds so the selected time range becomes bookable again.

## Actor

- Scheduled process.
- System cleanup job.

## Command Or Query

- `now`: current time.
- `limit`: optional maximum records to process.

## Response

- `expiredBookingIds`: bookings moved to expired.
- `expiredCalendarBlockIds`: calendar blocks moved to expired.

## Ports

- `BookingRepository`
- `CalendarBlockRepository`
- `PaymentRecordRepository`
- `Clock`

## Rules

- Only pending bookings whose hold expiration is in the past can expire.
- Public checkout holds expire after `15` minutes.
- A booking with successful deposit payment must not be expired.
- Expiring a hold makes its calendar block inactive.

## Side Effects

- Updates booking status to `EXPIRED`.
- Updates calendar block status to `EXPIRED`.
- May mark payment record as cancelled or failed depending on provider state.
- May emit `BookingHoldExpired`.

## Application Errors

- `BookingHoldNotFound`
- `BookingHoldCannotExpire`

## SEO And GEO Impact

- No direct SEO or GEO impact.

## Open Questions

- Should expired bookings remain visible to buyers through their access link?
