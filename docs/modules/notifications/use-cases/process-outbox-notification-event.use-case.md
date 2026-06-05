# Process Outbox Notification Event

> File name: `process-outbox-notification-event.use-case.md`

## Purpose

Consume one pending booking lifecycle outbox message and create notification
deliveries according to configured rules.

This use case is the bridge between reliable booking events and configurable
buyer communications.

## Actor

- Outbox publisher worker/process.
- Backpanel admin action when manually reprocessing a failed outbox message.

## Command Or Query

- `outboxMessageId`: pending or failed outbox message to process.
- `processedAt`: current time from `Clock`.

## Response

- `outboxMessageId`
- `status`: `PUBLISHED` or `FAILED`
- `createdDeliveryIds`: list of created notification delivery ids.
- `skippedRules`: rule ids skipped with reason.

## Ports

- `OutboxRepository`
- `BookingRepository`
- `NotificationRuleRepository`
- `NotificationTemplateRepository`
- `NotificationDeliveryRepository`
- `TemplateRenderer`
- `Clock`
- `IdGenerator`

## Rules

- Outbox message must exist.
- Only supported booking lifecycle event types are processed at launch:
  `BookingCreated`, `BookingUpdated`, `BookingRescheduled`,
  `BookingCancelled`.
- Processing must be idempotent. Reprocessing the same outbox message and rule
  must not create duplicate deliveries.
- Disabled or archived rules are skipped.
- Buyer rules require the booking to exist.
- If the rule requires consent, the booking channel must have
  `consentStatus = GRANTED` and `enabled = true`.
- The booking preferred locale selects the template translation.
- If no published translation exists for that locale, the delivery is not
  created and the skip reason is recorded.
- `AUTOMATIC` rules create `PENDING` deliveries.
- `MANUAL_REVIEW` rules create `MANUAL_REVIEW` deliveries.
- Automatic WhatsApp rules require the selected template to have a Prelude
  `providerTemplateId`; otherwise the rule is skipped with
  `PROVIDER_TEMPLATE_MISSING`.
- Provider variables are snapshotted from the rendered template variables so
  Prelude receives exactly the data intended at creation time.
- The outbox message can be marked `PUBLISHED` once all matching rules were
  evaluated, even if some rules were skipped for documented business reasons.
- The outbox message is marked `FAILED` only for processing failures that should
  be retried, such as infrastructure or repository failures.

## Side Effects

- Creates notification deliveries.
- Marks outbox message as published or failed.
- May write audit entry for manual reprocessing.

## Application Errors

- `OutboxMessageNotFound`
- `OutboxEventUnsupported`
- `BookingNotFound`
- `NotificationRuleInvalid`
- `NotificationTemplateMissing`
- `NotificationTemplateTranslationMissing`
- `NotificationProcessingFailed`

## SEO And GEO Impact

- No public indexable content is created.
- Localized notification copy must not use silent fallback for buyer-critical
  messages.

## Open Questions

- Should skipped rules be persisted in a dedicated processing log table, or is
  outbox failure reason plus deliveries enough at launch?
