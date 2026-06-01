# Booking Access

> File name: `booking-access.vobj.md`

## Purpose

Allows a buyer to view their booking without requiring a user account.

## Value

- `bookingReference`: `BookingReference`.
- `accessTokenHash`: `AccessTokenHash` for the secret token used in the access
  link.
- `accessUrlPath`: public path used to open the booking view.
- `issuedAt`: when access was created.
- `expiresAt`: optional expiration time.
- `lastAccessAt`: optional last access timestamp.

## Creation Rules

- Booking reference must satisfy `BookingReference`.
- Access token hash must satisfy `AccessTokenHash`.
- Raw access token must be shown or sent only once and never stored in plain
  text.
- Access path must point to the buyer-safe booking view.

## Normalization

- Booking reference normalization is delegated to `BookingReference`.
- Access path is stored without domain so deployment domains can change.

## Equality

Two booking access values are equal when their booking reference and token hash
are equal.

## Domain Errors

- `BookingReferenceInvalid`
- `BookingAccessTokenInvalid`
- `BookingAccessExpired`

## Relationships

- `BookingReference`
- `AccessTokenHash`

## Open Questions

- Should buyer access links expire, or should they remain valid until a new link
  is issued?
