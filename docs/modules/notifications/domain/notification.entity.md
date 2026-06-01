# Notification

> File name: `notification.entity.md`

## Purpose

Represents one message that should be sent, has been sent, or failed to send
through a specific channel.

Notifications are separate from bookings so booking logic does not depend on
email, WhatsApp, or future delivery providers.

## Identity

- `notificationId`: stable internal identifier.

## Attributes

- `type`: `NotificationType`.
- `status`: pending, sent, failed, delivered, or cancelled.
- `channel`: `NotificationChannel`.
- `recipient`: `NotificationRecipient`.
- `locale`: `LocaleCode` used for message content.
- `bookingId`: related booking when applicable.
- `templateId`: published `NotificationTemplate` used to render the message.
- `payload`: business data needed by the template.
- `provider`: external provider used, if any.
- `providerMessageId`: external provider reference, if any.
- `attempts`: number of send attempts.
- `lastError`: last error message or code.
- `scheduledFor`: when the notification should be sent.
- `sentAt`: when the provider accepted the message.
- `deliveredAt`: when delivery was confirmed, if available.

## Invariants

- A notification has exactly one `NotificationChannel`.
- Recipient must satisfy `NotificationRecipient`.
- Booking-related notification types must reference a booking.
- Failed notifications must record enough error context for support.
- Provider references must not become domain identity.

## State

- `PENDING`: waiting to be sent.
- `SENT`: provider accepted the message.
- `DELIVERED`: delivery confirmation received.
- `FAILED`: sending failed.
- `CANCELLED`: notification should no longer be sent.

## Behavior

- Schedule message.
- Mark message as sent.
- Mark message as delivered.
- Mark message as failed and increment attempts.
- Cancel unsent message.

## Relationships

- `Booking`: booking lifecycle events create notification needs.
- `CustomerDetails`: provides recipient and preferred locale.
- `NotificationRecipient`: protects channel-specific recipient validity.
- `NotificationType`: protects supported booking and admin notification reasons.
- `NotificationChannel`: protects supported delivery channels.
- `LocaleCode`: selects the language for message content.
- `Localization SEO`: message content should use supported locale and avoid
  silent fallback for buyer-critical content.
- `LocalizedContent`: may own transactional template copy by locale when
  templates are editable from the backpanel.
- `NotificationTemplate`: owns editable message content by type, channel, and
  locale.

## Domain Errors

- `NotificationRecipientInvalid`
- `NotificationTemplateMissing`
- `NotificationCannotBeSent`
- `NotificationAlreadyFinalized`

## Open Questions

- Which reminder timings are required before departure?
