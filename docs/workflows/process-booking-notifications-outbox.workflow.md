# Process Booking Notifications Outbox Workflow

> File name: `process-booking-notifications-outbox.workflow.md`

## Purpose

Turn reliable booking lifecycle outbox events into configurable notification
deliveries.

Bookings emit outbox messages in the same transaction as booking changes. This
workflow processes those messages later, evaluates notification rules, checks
booking-level consent, renders localized templates, and creates or sends
deliveries.

## Trigger

- Periodic worker loop reads `outbox_messages` with `status = PENDING`.
- Manual backpanel action can retry a failed outbox message.

## Participating Modules

- Booking: owns booking data and booking notification preferences.
- Notifications: owns rules, templates, rendering, deliveries and providers.
- Backpanel: exposes rule/template/log screens and manual actions.

## Input

- `OutboxMessage`
  - `aggregateType = BOOKING`
  - `aggregateId = bookingId`
  - `eventType`
  - `eventVersion`
  - `payload`

Supported launch events:

- `BookingCreated`
- `BookingUpdated`
- `BookingRescheduled`
- `BookingCancelled`
- `BookingDepositPaid`
- `BookingPaymentFailed`
- `BookingExpired`
- `BookingReminderDue`

## Steps

1. Load the pending outbox message.
2. Validate that the event type is supported by the notifications workflow.
3. Load the booking and its notification preferences.
4. Load active notification rules matching the event type.
5. For each matching rule:
   - skip if disabled or archived.
   - skip buyer channel if consent is required and not granted.
   - resolve locale from booking preferred locale.
   - load active template and published translation for rule channel and locale.
   - render subject/body with booking event payload.
   - for automatic WhatsApp, require the selected template to have a Prelude
     provider template id and snapshot provider variables.
   - create an idempotent delivery for `(outboxMessageId, ruleId)`.
   - set delivery status to `PENDING` for automatic rules.
   - set delivery status to `MANUAL_REVIEW` for manual rules.
6. Mark the outbox message as `PUBLISHED` when all rules were evaluated.
7. Mark the outbox message as `FAILED` only when processing cannot complete and
   should be retried.
8. On the next worker iteration, load one due `PENDING` delivery.
9. Send email deliveries through Resend and WhatsApp deliveries through Prelude
   Notify.
10. Mark accepted messages as `SENT` and store provider metadata.

## Consistency

- Booking writes and outbox writes are atomic in the booking use case.
- Notification processing is eventually consistent.
- Delivery creation is idempotent through `(outboxMessageId, ruleId)`.
- Provider sending happens after delivery creation and can be retried.
- Provider webhooks are deliberately outside this workflow slice.

## Failure Handling

- Missing consent: skip rule with business reason, do not fail outbox.
- Missing translation: skip rule with business reason, do not fail outbox.
- Missing Prelude template id for automatic WhatsApp: skip rule with business
  reason, do not fail outbox.
- Missing booking: fail outbox because the event cannot be processed.
- Repository/provider infrastructure error: fail or leave retryable.
- Duplicate processing: reuse existing delivery and continue.

## Manual Review

WhatsApp can start as manual review:

1. Workflow creates rendered delivery in `MANUAL_REVIEW`.
2. Staff opens booking detail or notification logs.
3. Staff copies/opens prepared WhatsApp message.
4. Staff confirms it was sent.
5. Delivery becomes `SENT`.

WhatsApp can also be automatic:

1. Backpanel template stores the Prelude `providerTemplateId`.
2. Workflow snapshots provider variables from the rendered message payload.
3. Worker sends the delivery through Prelude Notify.
4. Delivery becomes `SENT` when Prelude accepts the message.

## Audit

- Rule and template changes are audited.
- Staff changes to booking notification preferences are audited.
- Manual send/cancel actions may create audit entries when they affect buyer
  communication.

## Open Questions

- Should skipped business reasons be stored in a separate outbox processing log?
- Should automatic WhatsApp be delayed until a provider is chosen, keeping all
  WhatsApp in manual review at launch?
