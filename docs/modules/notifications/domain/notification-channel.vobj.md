# Notification Channel

> File name: `notification-channel.vobj.md`

## Purpose

Represents the channel through which a notification should be delivered.

The domain owns the channel names, but not the external provider used to deliver
the message.

## Value

- `EMAIL`
- `WHATSAPP`

## Creation Rules

- Channel must be one of the supported values.
- Launch buyer notifications use `EMAIL` and `WHATSAPP`.
- Recipient must match the selected channel.
- Provider selection happens outside the domain.

## Normalization

- Stored as uppercase enum-like values.

## Equality

Two notification channels are equal when their channel value is equal.

## Domain Errors

- `NotificationChannelUnsupported`
- `NotificationChannelRecipientMismatch`

## Open Questions

- Are additional operational channels needed after launch?
