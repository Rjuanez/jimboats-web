# Process Next Notification Work

> File name: `process-next-notification-work.use-case.md`

## Purpose

Process one unit of asynchronous notification work for the notification worker.

The worker does not contain business rules. It repeatedly calls this use case,
logs the result, and sleeps when the use case returns `IDLE`.

## Actor

- `notification-worker` Docker process.

## Command Or Query

- No command input.
- Current time comes from `NotificationClock`.

## Response

- `OUTBOX_PROCESSED`: one booking outbox message was evaluated and delivery
  records may have been created.
- `DELIVERY_SENT`: one pending delivery was accepted by the configured provider.
- `IDLE`: no pending outbox message or delivery was available.

## Ports

- `OutboxRepository`
- `NotificationDeliveryRepository`
- `ProcessOutboxNotificationEventUseCase`
- `NotificationProvider`
- `NotificationClock`

## Rules

- Pending outbox messages are processed before pending deliveries.
- Only one unit of work is processed per execution.
- Pending deliveries are eligible when `status = PENDING` and `sendAfter` is
  empty or already due.
- Provider failures are handled by `SendBookingNotificationUseCase`, which marks
  the delivery failed and leaves it visible in notification logs.
- Manual review deliveries are never sent by the worker.

## Side Effects

- May mark one outbox message as published or failed.
- May create notification deliveries.
- May send one email through Resend.
- May send one WhatsApp message through Prelude Notify.
- May update one delivery status and provider metadata.

## Runtime

- Runs in a dedicated Docker service named `notification-worker`.
- Uses PostgreSQL as the durable queue; no Redis or external broker is required
  for the first implementation.
- Local development defaults to console provider mode.

## Open Questions

- Provider delivery webhooks should become a separate slice so deliveries can
  move from `SENT` to `DELIVERED` or terminal failure states.
