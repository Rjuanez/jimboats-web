# Notifications Module

## What It Is

Owns messages created from booking lifecycle events and operational triggers.

Bookings do not send emails or WhatsApp messages directly. Booking
changes create events or intentions, and this module records and sends the
notifications.

Launch buyer channels are email and WhatsApp.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Notification | Entity | A message to one recipient through one channel. |
| Notification Template | Entity | Editable template by type, channel, and locale. |
| Notification Channel | Value Object | Email or WhatsApp. |
| Notification Type | Value Object | Booking and admin notification reason. |
| Notification Status | Value Object | Pending, sent, failed, delivered, or cancelled. |

## Use Case Candidates

- Send booking notification.
- Update notification template.
- Retry failed notification.
- Record provider delivery update.

## Depends On

- [Booking](../booking/index.md), for booking lifecycle events and buyer details.
- [Localization SEO](../localization-seo/index.md), for locale-aware message content.
