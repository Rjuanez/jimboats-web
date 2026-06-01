# Price Snapshot

> File name: `price-snapshot.vobj.md`

## Purpose

Freezes the commercial price accepted by the buyer when a booking is created.

Future catalog or extra price changes must not alter existing bookings.

## Value

- `currency`: `CurrencyCode`.
- `experienceBaseAmount`: selected experience base `Money`.
- `extras`: selected extras with name, quantity, unit amount, and total amount.
- `subtotalAmount`: `Money` sum before taxes or adjustments.
- `taxAmount`: `Money` tax amount when applicable.
- `discountAmount`: `Money` discount amount when applicable.
- `totalAmount`: final `Money` expected from payment.
- `depositAmount`: configured online deposit `Money`, launch value is
  `100 EUR`.
- `remainingAmount`: `Money` to be paid on the boat in cash.
- `remainingPaymentMethod`: expected to be `CASH_ON_BOARD`.
- `priceCapturedAt`: when the snapshot was created.

## Creation Rules

- Currency must satisfy `CurrencyCode`.
- Amounts must satisfy `Money`.
- Total must be consistent with subtotal, taxes, discounts, and extras.
- Deposit amount must be consistent with `BookingPaymentPlan`.
- Remaining amount must equal total amount minus deposit amount.
- Selected extras must use prices available at booking creation time.

## Normalization

- Amount normalization is delegated to `Money`.
- Currency normalization is delegated to `CurrencyCode`.
- Display formatting is handled outside the value object.

## Equality

Two price snapshots are equal when all amounts, currency, and selected extra
line items are equal.

## Domain Errors

- `InvalidPriceSnapshot`
- `PriceSnapshotTotalMismatch`
- `PriceCurrencyUnsupported`

## Relationships

- `Money`
- `CurrencyCode`
- `BookingPaymentPlan`

## Open Questions

- Are taxes included in displayed prices at launch?
- Are coupons or manual discounts part of the first version?
