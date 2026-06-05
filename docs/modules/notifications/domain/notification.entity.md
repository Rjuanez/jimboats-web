# Notification

> File name: `notification.entity.md`

## Purpose

Represents one concrete notification delivery that should be sent, has been
sent, requires manual review, or failed through a specific channel.

Notification deliveries are separate from bookings so booking logic does not
depend on email, WhatsApp, or future delivery providers.

## Identity

- `notificationDeliveryId`: stable internal identifier.

## Attributes

- `type`: `NotificationType`.
- `eventType`: source outbox event type.
- `status`: pending, manual review, sent, failed, delivered, or cancelled.
- `channel`: `NotificationChannel`.
- `recipient`: `NotificationRecipient`.
- `locale`: `LocaleCode` used for message content.
- `bookingId`: related booking when applicable.
- `outboxMessageId`: source outbox message that created this delivery.
- `ruleId`: notification rule that matched the event.
- `templateId`: active `NotificationTemplate` used to render the message.
- `templateVersion`: version used when the message was rendered.
- `payload`: business data needed by the template.
- `renderedSubject`: email subject snapshot.
- `renderedBody`: rendered message body snapshot.
- `provider`: external provider used, if any.
- `providerMessageId`: external provider reference, if any.
- `providerTemplateId`: external template id snapshot used for provider send,
  especially Prelude WhatsApp.
- `providerVariables`: external provider variables snapshot.
- `attempts`: number of send attempts.
- `lastError`: last error message or code.
- `sendAfter`: when the notification should be sent.
- `sentAt`: when the provider accepted the message.
- `deliveredAt`: when delivery was confirmed, if available.

## Invariants

- A notification has exactly one `NotificationChannel`.
- Recipient must satisfy `NotificationRecipient`.
- Booking-related notification types must reference a booking.
- Failed notifications must record enough error context for support.
- Provider references must not become domain identity.
- Automatic WhatsApp pending deliveries require a provider template id.
- Automatic buyer deliveries require booking channel consent unless the rule
  explicitly does not require consent.
- Manual review deliveries can be created without provider send, but still need
  a valid rendered message and recipient snapshot.

## State

- `PENDING`: waiting to be sent.
- `MANUAL_REVIEW`: waiting for staff action.
- `SENT`: provider accepted the message.
- `DELIVERED`: delivery confirmation received.
- `FAILED`: sending failed.
- `CANCELLED`: notification should no longer be sent.

## Behavior

- Schedule message.
- Mark message as manual review.
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
- `NotificationRule`: determines whether the delivery is automatic or manual.
- `OutboxMessage`: source event processed by the notification publisher.
- `BookingNotificationPreferences`: controls buyer channel permission.

## Domain Errors

- `NotificationRecipientInvalid`
- `NotificationTemplateMissing`
- `NotificationCannotBeSent`
- `NotificationAlreadyFinalized`
- `NotificationConsentMissing`

## Open Questions

- Which reminder timings are required before departure?
