# Experience Detail Screen

> File name: `experience-detail.screen.md`

## Purpose

Edit the core configurable data for one experience.

This is one parent workspace opened from the experiences list. It is not a
top-level sidebar destination.

The workspace can use section navigation or tabs, but the product concept is
one configurable experience. Subroutes can be introduced later only if the
screen becomes too large to use comfortably.

## User

- `ADMIN`
- `STAFF`

## Data Shown

- Internal label.
- Publication state.
- Duration.
- Base price.
- Capacity.
- Included items.
- Primary image summary.
- Slot policy summary.
- Compatible extras summary.
- Translation readiness by locale.
- SEO/GEO readiness.
- Audit summary.

## Workspace Areas

- `Overview`: internal label, core configurable offer data, base price,
  duration, capacity, included items, and primary image summary.
- `Booking setup`: slot policy, selected-slot overlap rule, booking buffer,
  booking window, deposit/cash remainder copy, compatible extras, extra notice
  windows, and cancellation tiers.
- `Content & SEO/GEO`: localized copy, translated slugs/routes, title,
  description, H1, FAQ, GEO question coverage, key facts, structured data, and
  readiness by locale.
- `Publish`: publication state, validation issues, readiness score, and recent
  audit summary.

## Actions

- Save core configuration.
- Change publication state.
- Attach or replace primary image.
- Edit slot policy.
- Edit compatible extras.
- Edit translations.
- Edit SEO/GEO metadata and FAQ content.
- Archive experience.
- View public page when published.

## States

- Loading experience.
- Draft.
- Ready but unpublished.
- Published.
- Archived.
- Invalid configuration.
- Save error.

## Domain Rules

- Base price is configurable and stored as `Money`.
- Duration and capacity are configurable.
- Slot policy is configurable.
- One primary image is supported for launch.
- Payment plan is configurable at product/settings level, but launch behavior is
  EUR 100 online deposit and remaining amount paid on board in cash.
- Selected slots and manual calendar blocks must not overlap because there is
  only one boat.
- Backpanel users can create, reschedule, modify, and cancel bookings.
- Published experience requires ready primary image.
- Published experience requires at least one locale ready for SEO and GEO.
- Public website must read this configuration instead of hardcoded experience
  data.

## Permissions

- `ADMIN` and `STAFF` can edit at launch.
- Publication and archive actions may become admin-only later.

## Open Questions

- Should changes to a published experience require review before going live?
- Should price changes affect existing draft or pending bookings?
