# Get Bookable Slots For Experience

> File name: `get-bookable-slots-for-experience.use-case.md`

## Purpose

Return candidate slots where an experience can be booked, filtered by the only
boat's active calendar blocks.

## Actor

- Public visitor browsing an experience.
- Backpanel user checking availability.

## Command Or Query

- `experienceId`: experience to evaluate.
- `dateRange`: local date or range of dates to inspect.
- `locale`: requested locale for display.

## Response

- `slots`: available local date and time ranges.
- `timeZone`: time zone used for all returned local values.
- `experienceId`: evaluated experience.

## Ports

- `ExperienceRepository`
- `CalendarBlockRepository`

## Rules

- Candidate slots come from the experience `SlotPolicy`.
- Candidate slots must be inside the maximum advance booking window of `6`
  months.
- Candidate slots must satisfy the minimum advance booking window of `1` hour.
- Active calendar blocks are subtracted from candidate slots using protected
  ranges.
- A candidate slot is unavailable when its protected range overlaps any active
  calendar block protected range.
- Candidate slots must leave the configured `30` minute buffer between outings.
- The response is informative only. Availability must be checked again when a
  booking hold is created.

## Side Effects

- None.

## Application Errors

- `ExperienceNotFound`
- `ExperienceNotBookable`
- `InvalidDateRange`
- `BookingDateTooFarInFuture`
- `BookingMinimumNoticeNotMet`

## SEO And GEO Impact

- Does not create public URLs.
- May support public availability UI, but should not control canonical,
  sitemap, `hreflang`, or structured data.

## Open Questions

- How far into the future should public availability be exposed?
