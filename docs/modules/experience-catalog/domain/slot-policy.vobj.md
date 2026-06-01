# Slot Policy

> File name: `slot-policy.vobj.md`

## Purpose

Describes the possible booking times for one experience.

The policy belongs to the experience. It generates candidate slots, but it does
not reserve the boat and it does not decide final availability.

## Value

- `mode`: fixed slots or flexible start time.
- `timeZone`: `TimeZone`, expected to be `Europe/Madrid`.
- `fixedSlots`: predefined `LocalTime` start and end pairs when the mode is
  fixed.
- `operatingWindow`: allowed `LocalTime` range when the mode is flexible.
- `durationMinutes`: duration used to derive the selected end time.
- `granularityMinutes`: allowed step between flexible start times.
- `minNoticeMinutes`: minimum time before departure required for booking.

## Creation Rules

- The policy must have a valid time zone.
- Fixed policies must contain at least one valid time range.
- Flexible policies must contain an operating window, duration, and granularity.
- A generated candidate slot must have an end time after its start time.
- The policy must not create concrete reservations. Concrete protection belongs
  to `CalendarBlock`.

## Normalization

- Local times are stored without locale-specific formatting.
- Candidate slots are evaluated in the configured time zone.
- Flexible start times are rounded to the configured granularity.

## Equality

Two slot policies are equal when their mode, time zone, time ranges, duration,
granularity, and notice rules are equal.

## Domain Errors

- `InvalidSlotPolicy`
- `InvalidFixedSlotRange`
- `InvalidFlexibleSlotWindow`
- `InvalidSlotGranularity`

## Open Questions

- Do all experiences remain bookable every day, or do some need weekday or
  seasonal restrictions?
- Should overnight experiences ever be allowed?
