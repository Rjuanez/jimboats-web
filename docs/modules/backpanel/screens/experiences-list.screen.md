# Experiences List Screen

> File name: `experiences-list.screen.md`

## Purpose

Let staff browse, search, filter, and create configurable experiences.

## User

- `ADMIN`
- `STAFF`

## Data Shown

- Experience name or internal label.
- Publication state.
- Base price.
- Duration.
- Capacity.
- Primary image status.
- Slot policy summary.
- Translation readiness by locale.
- SEO/GEO readiness.
- Last updated time.

## Actions

- Create experience.
- Open experience detail.
- Filter by publication state.
- Filter by missing image.
- Filter by translation readiness.
- Filter by SEO/GEO readiness.
- Archive experience.

## States

- Loading list.
- Empty catalog.
- Filtered empty result.
- Normal list.
- Error loading experiences.

## Domain Rules

- Experiences are configurable from the backpanel and stored in the database.
- Published experiences must have valid price, slot policy, ready primary image,
  and at least one publishable locale.
- Archived experiences are not selectable for new public bookings but remain
  available for historical bookings.

## Permissions

- `ADMIN` and `STAFF` can view and edit at launch.
- Archiving may become admin-only later.

## Open Questions

- Should list sorting default to manual display order or last updated time?
- Do we need a duplicate experience action for faster setup?
