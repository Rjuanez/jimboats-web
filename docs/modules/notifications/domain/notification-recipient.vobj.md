# Notification Recipient

> File name: `notification-recipient.vobj.md`

## Purpose

Represents the destination for a notification in a specific channel.

The same buyer may have different valid recipients depending on whether the
message is sent by email or WhatsApp.

## Value

- `channel`: `NotificationChannel`.
- `email`: `EmailAddress` when channel is email.
- `phone`: `PhoneNumber` when channel is WhatsApp.

## Creation Rules

- Email channel requires `EmailAddress`.
- WhatsApp channel requires `PhoneNumber`.
- Recipient must match the selected channel.

## Normalization

- Email normalization is delegated to `EmailAddress`.
- Phone normalization is delegated to `PhoneNumber`.

## Equality

Two notification recipients are equal when their channel and normalized
destination are equal.

## Domain Errors

- `NotificationRecipientInvalid`
- `NotificationRecipientChannelMismatch`
- `NotificationRecipientMissing`

## Open Questions

- Should WhatsApp require an extra capability check beyond phone validation?
