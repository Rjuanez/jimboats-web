# Dashboard Screen

> File name: `dashboard.screen.md`

## Purpose

Show the operational state of the business at a glance and direct staff to
urgent work.

## User

- `ADMIN`
- `STAFF`

## Data Shown

- Upcoming confirmed bookings.
- Pending payment holds.
- Bookings requiring action.
- Today's calendar occupancy.
- Failed media processing jobs.
- Missing or outdated translations.
- Notification failures.
- Recent backpanel audit entries.

## Actions

- Open booking detail.
- Open calendar.
- Retry failed notification.
- Open failed media asset.
- Open translation queue.
- Create manual booking.
- Create manual calendar block.

## States

- Loading metrics.
- Empty day with no bookings.
- Normal operational state.
- Warning state with pending issues.
- Error state when operational summary cannot load.

## Domain Rules

- Dashboard must not mutate domain state directly.
- Counts should be derived from booking, calendar, media, localization, and
  notification modules.
- Buyer access pages and checkout pages remain non-indexable and should not be
  linked as public pages from the dashboard.

## Permissions

- `ADMIN` and `STAFF` can view the dashboard at launch.
- Action-level permission differences can be introduced later.

## Open Questions

- Which widgets are mandatory for the first implementation?
- Should dashboard metrics be real-time or refreshed on page load?
