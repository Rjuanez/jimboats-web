# Booking Detail Screen

> File name: `booking-detail.screen.md`

## Purpose

Manage one booking from the backpanel: operational details, selected slot,
extras, cancellation, audit, buyer communication preferences, and notification
history.

## User

- `ADMIN`
- `STAFF`

## Data Shown

- Booking reference, status, experience, date/time and guest count.
- Customer contact details and preferred locale.
- Selected extras and price snapshot.
- Payment/deposit snapshot.
- Internal notes.
- Communication preferences:
  - email destination, enabled flag and consent status.
  - WhatsApp destination, enabled flag and consent status.
  - consent source, captured time and staff notes.
- Notification delivery history:
  - type, event, channel, status, locale.
  - rendered subject/body preview.
  - send mode and provider/manual status.
  - failure reason and attempts.
- Audit activity.

## Actions

- Edit operational booking details.
- Reschedule booking.
- Cancel booking.
- Edit communication preferences for the booking.
- Preview a notification delivery.
- Retry failed delivery.
- For WhatsApp manual review, open/copy prepared message and mark as sent.
- Open related notification rule or template.

## States

- Normal confirmed booking.
- Cancelled booking.
- Booking with no notification preferences yet.
- Channel consent not asked.
- Channel consent granted.
- Channel consent revoked.
- Delivery pending automatic send.
- Delivery waiting manual review.
- Delivery sent/delivered.
- Delivery failed and retryable.

## Domain Rules

- Contact data does not imply consent.
- Buyer email can only be sent when email is enabled and consent is granted.
- Buyer WhatsApp can only be sent when WhatsApp is enabled and consent is
  granted.
- Staff edits to consent should be audited.
- Notification history displays rendered snapshots, not newly rendered template
  output.
- Manual WhatsApp actions do not bypass delivery state transitions.

## Permissions

- `ADMIN` and `STAFF` can view booking communication state at launch.
- Changing consent and marking manual WhatsApp as sent may later be restricted
  to `ADMIN`.

## Open Questions

- Should buyer consent edits require a reason field in the UI?
- Should staff be allowed to revoke buyer consent, or only disable the channel
  operationally?
