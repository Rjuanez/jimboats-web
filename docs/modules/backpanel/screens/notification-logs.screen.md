# Notification Logs Screen

> File name: `notification-logs.screen.md`

## Purpose

Inspect notification deliveries, failures, manual review items and retryable
messages.

## User

- `ADMIN`
- `STAFF`

## Data Shown

- Delivery list with created time, type, channel, booking reference, recipient,
  locale and status.
- Manual review queue.
- Failed deliveries with failure reason and attempts.
- Rendered subject/body snapshot.
- Provider message id when available.
- Related booking, rule, template and outbox message.

## Actions

- Open booking detail.
- Open delivery detail or preview.
- Retry failed automatic delivery.
- Mark manual WhatsApp as sent.
- Cancel pending delivery.
- Open related rule/template.

## States

- Empty logs.
- Pending automatic send.
- Manual review.
- Sent/delivered.
- Failed retryable.
- Failed permanent.
- Cancelled.

## Domain Rules

- Logs show delivery snapshots, not current template content.
- Retrying a delivery increments attempts and preserves failure history.
- Manual WhatsApp send must be confirmed by staff before marking sent.
- Cancelled deliveries cannot be sent.

## Permissions

- `ADMIN` and `STAFF` can inspect logs.
- Retry/cancel permissions can be restricted later.

## Open Questions

- Do we need a separate detail page for one delivery, or is an inline drawer
  enough at launch?
