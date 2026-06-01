# Money

> File name: `money.vobj.md`

## Purpose

Represents an exact monetary amount and currency.

Money values must avoid floating-point arithmetic.

## Value

- `amountMinor`: amount in minor units, such as cents.
- `currency`: `CurrencyCode`.

## Creation Rules

- Currency must be supported.
- Amount must be an integer in minor units.
- Amount must be non-negative unless a specific use case allows negative values
  for adjustments or refunds.

## Normalization

- Currency is normalized through `CurrencyCode`.
- Amount is stored as an integer minor-unit value.
- Display formatting is handled outside the value object.

## Equality

Two money values are equal when amount and currency are equal.

## Domain Errors

- `MoneyAmountInvalid`
- `MoneyCurrencyInvalid`
- `MoneyNegativeAmountNotAllowed`

## Open Questions

- Should tax-inclusive and tax-exclusive amounts be represented by separate
  value objects later?
