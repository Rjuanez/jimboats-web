# Notifications Module

## What It Is

Owns messages created from booking lifecycle events and operational triggers.

Bookings do not send emails or WhatsApp messages directly. Booking
changes create events or intentions, and this module records and sends the
notifications.

Launch buyer channels are email and WhatsApp.

Notifications are configurable:

- booking-level consent decides whether the buyer can receive email and/or
  WhatsApp for that reservation.
- notification rules decide which outbox events create messages, on which
  channels, and whether they are automatic or manual review.
- templates and translations are edited from the backpanel for `en`, `es`, and
  `ca`.
- deliveries store rendered snapshots and provider/manual status.

External delivery providers are infrastructure concerns:

- Email automatic delivery uses Resend.
- WhatsApp automatic delivery uses Prelude Notify.
- Local development can run in console provider mode to avoid sending real
  messages.
- Provider webhooks are not part of the first provider slice; accepted messages
  are marked `SENT`, and delivery/failure callbacks will be modeled in a later
  slice.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Notification | Entity | A concrete delivery to one recipient through one channel. |
| Notification Rule | Entity | Configures event, channel, template and send mode. |
| Notification Template | Entity | Editable template by type and channel. |
| Notification Template Translation | Value Object | Localized subject/body by locale. |
| Notification Channel | Value Object | Email or WhatsApp. |
| Notification Type | Value Object | Booking and admin notification reason. |
| Notification Status | Value Object | Pending, manual review, sent, failed, delivered, or cancelled. |

## Use Case Candidates

- Process booking outbox notification event.
- Update notification rule.
- Update notification template.
- Preview notification template.
- Send booking notification.
- Process next notification worker item.
- Retry failed notification.
- Record provider delivery update.

## Implementation Plan

- [Notifications Implementation Plan](implementation-plan.md)

## Depends On

- [Booking](../booking/index.md), for booking lifecycle events and buyer details.
- [Localization SEO](../localization-seo/index.md), for locale-aware message content.
