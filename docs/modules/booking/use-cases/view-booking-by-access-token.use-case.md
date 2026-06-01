# View Booking By Access Token

> File name: `view-booking-by-access-token.use-case.md`

## Purpose

Allow a buyer to view their booking without creating an account.

## Actor

- Buyer using a secure booking access link.

## Command Or Query

- `bookingReference`: public booking reference.
- `accessToken`: raw token from access link.

## Response

- `bookingReference`: public reference.
- `status`: booking state.
- `experience`: buyer-safe experience summary.
- `selectedSlot`: date and time range.
- `selectedExtras`: selected extras.
- `priceSnapshot`: buyer-safe price summary.
- `customerDetails`: buyer-safe contact details.

## Ports

- `BookingRepository`
- `Clock`

## Rules

- Raw token must be compared against the stored hash.
- Expired or invalid access must be rejected.
- Response must not expose internal provider identifiers or internal notes.

## Side Effects

- May update `lastAccessAt`.

## Application Errors

- `BookingNotFound`
- `BookingAccessInvalid`
- `BookingAccessExpired`

## SEO And GEO Impact

- Booking access pages must not be indexed.
- Booking access pages must not be included in sitemap.
- Canonical metadata should prevent accidental duplicate public content.

## Open Questions

- Should buyers be able to request a fresh access link by email?
