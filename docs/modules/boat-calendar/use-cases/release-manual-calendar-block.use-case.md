# Release Manual Calendar Block

> File name: `release-manual-calendar-block.use-case.md`

## Purpose

Release a manual block so the boat can become bookable again for that time
range.

## Actor

- Backpanel user.

## Command Or Query

- `calendarBlockId`: manual block to release.
- `releasedBy`: backpanel user releasing the block.

## Response

- `calendarBlockId`: released block identifier.
- `status`: expected to be `RELEASED`.

## Ports

- `CalendarBlockRepository`
- `Clock`

## Rules

- Only manual blocks can be released by this use case.
- The block must be active.
- Releasing a block makes the range available again unless another active block
  exists for the same range.

## Side Effects

- Updates calendar block status.
- May emit `ManualCalendarBlockReleased`.

## Application Errors

- `CalendarBlockNotFound`
- `CalendarBlockCannotBeReleased`
- `CalendarBlockAlreadyInactive`

## SEO And GEO Impact

- No direct SEO or GEO impact.

## Open Questions

- Should release reason be stored for audit purposes?
