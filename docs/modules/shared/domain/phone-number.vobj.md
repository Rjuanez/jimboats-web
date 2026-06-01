# Phone Number

> File name: `phone-number.vobj.md`

## Purpose

Represents a phone number that can be used for support, WhatsApp, or calls.

## Value

- `e164`: canonical phone number when normalization succeeds.
- `displayValue`: optional original or formatted value for support display.
- `countryHint`: country used to interpret local input when needed.

## Creation Rules

- Must not be blank when provided.
- Must be parseable as an international phone number or a valid local number
  with an accepted country hint.
- Default country hint is expected to be `ES` unless another market is selected.
- Must be valid for the intended channel when WhatsApp is required.

## Normalization

- Trim surrounding whitespace.
- Remove visual separators when deriving the canonical value.
- Store canonical value in E.164 format when possible.
- Preserve optional display value separately from the canonical value.

## Equality

Two phone numbers are equal when their canonical E.164 values are equal.

## Domain Errors

- `PhoneNumberInvalid`
- `PhoneNumberCountryUnsupported`
- `PhoneNumberRequiredForChannel`

## Open Questions

- Is phone mandatory for every booking, or only when WhatsApp notifications
  are enabled?
