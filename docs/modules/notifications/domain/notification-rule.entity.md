# Notification Rule

> File name: `notification-rule.entity.md`

## Purpose

Configures which booking lifecycle events create notification deliveries, through
which channels, using which template, and whether sending is automatic or
manual.

Rules are business configuration. They must be editable from the backpanel, not
hardcoded in the application.

## Identity

- `notificationRuleId`: stable internal identifier.

## Attributes

- `eventType`: outbox event type, such as `BookingCreated`.
- `notificationType`: business notification type, such as
  `BOOKING_CREATED`.
- `channel`: `EMAIL` or `WHATSAPP`.
- `recipientType`: launch value `BUYER`.
- `templateId`: active template used by this rule.
- `enabled`: whether the rule currently creates deliveries.
- `sendMode`: `AUTOMATIC` or `MANUAL_REVIEW`.
- `requiresConsent`: whether booking channel consent is required.
- `localeStrategy`: launch value `BOOKING_PREFERRED_LOCALE`.
- `missingTranslationBehavior`: launch value `DO_NOT_SEND`.
- `status`: `ACTIVE` or `ARCHIVED`.
- `updatedByUserId`: staff/admin user who last changed the rule.
- `createdAt`: creation time.
- `updatedAt`: last update time.

## Invariants

- A rule has exactly one event type, one channel, and one recipient type.
- Launch buyer rules require consent.
- Buyer rules must use the booking preferred locale.
- If a required template translation is missing or not publishable, the rule
  must not silently send fallback content.
- Archived rules do not create new deliveries.
- Only one active rule should exist per `(eventType, channel, recipientType)`.

## State

- `ACTIVE`: can create notification deliveries.
- `ARCHIVED`: preserved for audit/history, not used for new deliveries.

## Behavior

- Enable or disable a rule.
- Change the template assigned to a rule.
- Change send mode between automatic and manual review.
- Change whether consent is required.
- Archive a rule.

## Relationships

- `OutboxMessage`: source event processed by the publisher.
- `NotificationTemplate`: selected by the rule.
- `BookingNotificationPreferences`: checked before buyer delivery creation.
- `NotificationDelivery`: created when a rule applies.
- `BackpanelUser`: edits rules.

## Domain Errors

- `NotificationRuleDuplicate`
- `NotificationRuleTemplateMissing`
- `NotificationRuleChannelUnsupported`
- `NotificationRuleRecipientUnsupported`

## Open Questions

- Should staff notifications use the same rules later, or a separate recipient
  model?
