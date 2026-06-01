# Boat Calendar Module

## What It Is

Owns the availability of the single JimBoats boat.

The catalog can say when an experience could be booked. The boat calendar says
whether the boat is actually free for a concrete time range.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Calendar Block | Entity | A concrete occupied range for the only boat. |
| Booking Availability Policy | Value Object | Maximum advance window, minimum notice, and buffer rules. |
| Block Source | Value Object | Booking hold, confirmed booking, or manual block. |
| Block Status | Value Object | Active, released, expired, or cancelled. |

## Use Case Candidates

- Get bookable slots for an experience.
- Create a checkout calendar block.
- Create manual calendar block.
- Release manual calendar block.
- Expire booking hold block.
- Backpanel reschedule booking block.

## Depends On

- [Experience Catalog](../experience-catalog/index.md), for slot policies and experience duration.
- [Booking](../booking/index.md), for booking holds and confirmed bookings.
- [Shared](../shared/index.md), for IDs and time concepts.
