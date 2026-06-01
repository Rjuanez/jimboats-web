# Create Manual Calendar Block

> File name: `create-manual-calendar-block.use-case.md`

## Purpose

Allow a backpanel user to block the only boat for an operational reason that is
not a customer booking.

## Actor

- Backpanel user.

## Command Or Query

- `startAt`: canonical instant when the block starts.
- `endAt`: canonical instant when the block ends.
- `timeZone`: time zone used for local display.
- `reason`: business reason for the block.
- `createdBy`: backpanel user creating the block.

## Response

- `calendarBlockId`: created block identifier.
- `status`: expected to be `ACTIVE`.

## Ports

- `CalendarBlockRepository`
- `Clock`

## Rules

- The block source is `MANUAL_BLOCK`.
- The new block must not overlap any active calendar block.
- Manual blocks protect availability exactly like confirmed bookings and active
  checkout holds.

## Side Effects

- Persists a calendar block.
- May emit `ManualCalendarBlockCreated`.

## Application Errors

- `CalendarBlockOverlap`
- `InvalidCalendarBlockRange`
- `MissingManualBlockReason`

## SEO And GEO Impact

- No direct SEO or GEO impact.

## Open Questions

- Should manual blocks notify internal staff when created or released?
