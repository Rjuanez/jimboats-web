# Send Booking Notification

> File name: `send-booking-notification.use-case.md`

## Purpose

Send or mark a previously created booking notification delivery through the
selected channel.

## Actor

- Notification publisher process.
- Backpanel user, when manually resending a message.

## Command Or Query

- `notificationDeliveryId`: delivery to send or mark.
- `sentByUserId`: optional backpanel user for manual WhatsApp/send actions.

## Response

- `notificationDeliveryId`: sent or updated delivery.
- `status`: resulting notification status.

## Ports

- `NotificationDeliveryRepository`
- `NotificationProvider`
- `Clock`

## Rules

- Delivery must exist.
- Delivery must not be finalized.
- Automatic email sends use Resend through `NotificationProvider`.
- Automatic WhatsApp sends use Prelude Notify through `NotificationProvider`
  when the delivery is `PENDING` and contains a provider template id.
- WhatsApp can start as `MANUAL_REVIEW`: the backpanel prepares the rendered
  message, staff sends it manually, and marks it as sent.
- Sending must be idempotent for the same delivery.
- Failed attempts must be recorded.
- Provider errors keep the delivery retryable unless the provider reports a
  permanent failure.

## Side Effects

- Sends message through provider when supported.
- Updates delivery status, sent time, attempts, provider id, and failure reason.
- Provider webhooks are not processed in this use case; accepted messages become
  `SENT`, not `DELIVERED`.

## Application Errors

- `NotificationDeliveryNotFound`
- `NotificationProviderFailed`
- `NotificationDeliveryAlreadyFinalized`

## SEO And GEO Impact

- No indexable public URLs are created.
- Notification copy should respect locale and avoid silent fallback for
  transactional buyer content.

## Open Questions

- Should provider delivery webhooks be a separate use case from sending?
- When should manual WhatsApp be considered sent: button click, copied text, or
  staff confirmation?
