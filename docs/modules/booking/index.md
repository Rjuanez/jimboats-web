# Booking Module

## What It Is

Owns reservation intent and booking lifecycle.

The booking module represents a buyer's reservation for one experience, one
selected slot, selected extras, buyer details, a frozen price, buyer access, and
payment state.

The booking module does not own boat availability. It asks the Boat Calendar
module to create or release a calendar block for the only boat.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Booking | Entity | Reservation lifecycle from checkout hold to confirmed or cancelled booking. |
| Payment Record | Entity | Payment state and provider reference without making Stripe part of the domain model. |
| Selected Slot | Value Object | Concrete local date and time range selected by the buyer. |
| Customer Details | Value Object | Buyer contact details, language, and booking notes. |
| Booking Access | Value Object | Public booking reference and secure access token metadata. |
| Price Snapshot | Value Object | Frozen base price, extras price, total, currency, and tax assumptions. |
| Booking Payment Plan | Value Object | Fixed online deposit and remaining cash-on-board amount. |
| Cancellation Policy | Value Object | Configurable cancellation tiers and deposit outcome rules. |
| Booking Status | Value Object | Pending payment, confirmed, expired, cancelled, or failed lifecycle state. |

## Use Case Candidates

- Create booking hold.
- Confirm booking payment.
- Expire booking hold.
- View booking by access token.
- Cancel booking.
- Backpanel create booking.
- Backpanel reschedule booking.

## Depends On

- [Experience Catalog](../experience-catalog/index.md), for selected experience and package data.
- [Boat Calendar](../boat-calendar/index.md), for the calendar block that protects the only boat.
- [Notifications](../notifications/index.md), for booking confirmation, failure, reminder, and cancellation messages.
- [Shared](../shared/index.md), for IDs and time concepts.
