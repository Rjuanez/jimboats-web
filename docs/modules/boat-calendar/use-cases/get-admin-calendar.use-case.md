# Get Admin Calendar

> File name: `get-admin-calendar.use-case.md`

## Purpose

Return the operational calendar blocks that the backpanel needs to inspect the
single boat availability.

## Actor

- Backpanel user.

## Command Or Query

- `fromLocalDate`: first local date to inspect.
- `toLocalDate`: last local date to inspect.

## Response

- `blocks`: calendar blocks in the requested range.
- `summary`: active, manual, and released block counters.
- `timeZone`: launch value `Europe/Madrid`.

## Ports

- `CalendarBlockRepository`

## Rules

- The range must use valid local dates.
- The end date must be the same as or after the start date.
- Blocks are ordered by local date and visible start time.
- This admin query is read-only.

## Side Effects

- None.

## Application Errors

- `CalendarDateRangeInvalid`

## SEO And GEO Impact

- No direct SEO or GEO impact. This is an internal operations screen.
