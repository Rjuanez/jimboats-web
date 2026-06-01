# Customer Details

> File name: `customer-details.vobj.md`

## Purpose

Represents the buyer details needed to create, manage, access, and notify a
booking.

## Value

- `fullName`: `PersonName` for the buyer.
- `email`: primary `EmailAddress`.
- `phone`: optional `PhoneNumber`.
- `preferredLocale`: `LocaleCode` used for booking access and notifications.
- `notes`: optional buyer notes.
- `marketingConsent`: optional consent state when needed.

## Creation Rules

- Full name must satisfy `PersonName`.
- Email must satisfy `EmailAddress`.
- Phone must satisfy `PhoneNumber` when provided.
- Phone is required when a selected notification channel needs it.
- Preferred locale must satisfy `LocaleCode`.

## Normalization

- Email normalization is delegated to `EmailAddress`.
- Full name normalization is delegated to `PersonName`.
- Phone normalization is delegated to `PhoneNumber`.
- Locale normalization is delegated to `LocaleCode`.
- Notes are trimmed.

## Equality

Two customer detail values are equal when all normalized fields are equal.

## Domain Errors

- `CustomerNameMissing`
- `CustomerEmailInvalid`
- `CustomerLocaleUnsupported`
- `CustomerPhoneInvalid`

## Relationships

- `PersonName`
- `EmailAddress`
- `PhoneNumber`
- `LocaleCode`

## Open Questions

- Is phone mandatory because WhatsApp notifications are expected?
