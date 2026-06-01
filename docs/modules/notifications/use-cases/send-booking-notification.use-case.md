# Send Booking Notification

> File name: `send-booking-notification.use-case.md`

## Purpose

Create and send a booking-related notification through the selected channel.

## Actor

- Booking lifecycle event.
- Scheduled reminder process.
- Backpanel user, when manually resending a message.

## Command Or Query

- `bookingId`: related booking.
- `type`: `NotificationType`.
- `channel`: `NotificationChannel`.
- `recipient`: destination address or phone.
- `locale`: language for rendered content.
- `templateKey`: template to render.

## Response

- `notificationId`: created or reused notification.
- `status`: resulting notification status.

## Ports

- `BookingRepository`
- `NotificationRepository`
- `TemplateRenderer`
- `NotificationProvider`
- `Clock`

## Rules

- Booking must exist.
- Recipient must be valid for the selected channel.
- Type must be valid for the booking event.
- Buyer-critical notifications must use the buyer's locale when content exists.
- Sending must be idempotent for the same booking event when needed.
- Failed attempts must be recorded.

## Side Effects

- Persists notification.
- Sends message through provider.
- Updates notification status and attempts.

## Application Errors

- `BookingNotFound`
- `NotificationRecipientInvalid`
- `NotificationTemplateMissing`
- `NotificationProviderFailed`

## SEO And GEO Impact

- No indexable public URLs are created.
- Notification copy should respect locale and avoid silent fallback for
  transactional buyer content.

## Open Questions

- Should provider delivery webhooks be a separate use case from sending?
