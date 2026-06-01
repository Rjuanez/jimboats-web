# Selected Slot

> File name: `selected-slot.vobj.md`

## Purpose

Represents the concrete local date and time range selected by the buyer for a
booking.

This value is customer-facing. The operational lock that protects the only boat
is `CalendarBlock`.

## Value

- `localDate`: `LocalDate` shown to the buyer.
- `startTime`: local departure `LocalTime`.
- `endTime`: local end `LocalTime`.
- `timeZone`: `TimeZone`, expected to be `Europe/Madrid`.
- `timeRange`: canonical `TimeRange` derived from local date, local times, and
  time zone.
- `durationMinutes`: derived duration.

## Creation Rules

- Time range must satisfy `TimeRange`.
- The selected slot must come from the experience slot policy or be valid under
  the experience flexible policy.
- The selected slot must be checked against calendar blocks before creating a
  booking hold.

## Normalization

- Local date and local times are stored in canonical machine-readable form.
- Display formatting is handled outside the value object.
- Time zone conversion must be deterministic.

## Equality

Two selected slots are equal when their canonical `startAt`, `endAt`, and
`timeZone` are equal.

## Domain Errors

- `InvalidSelectedSlot`
- `SelectedSlotOutsidePolicy`
- `SelectedSlotInvalidTimeZone`

## Relationships

- `LocalDate`
- `LocalTime`
- `TimeZone`
- `TimeRange`

## Open Questions

- Should selected slots be allowed to cross midnight?
