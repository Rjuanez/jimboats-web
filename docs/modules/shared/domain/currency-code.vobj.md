# Currency Code

> File name: `currency-code.vobj.md`

## Purpose

Represents a currency accepted by catalog prices, bookings, payments, refunds,
and notifications.

## Value

- `value`: ISO-like uppercase currency code.

## Creation Rules

- Must be one of the supported currencies.
- Launch currency is expected to be `EUR`.
- Must not be blank.

## Normalization

- Trim surrounding whitespace.
- Store uppercase.

## Equality

Two currency codes are equal when their normalized code is equal.

## Domain Errors

- `CurrencyCodeUnsupported`
- `CurrencyCodeMissing`

## Open Questions

- Will prices always be charged in `EUR`, or should other currencies be shown
  for international visitors?
