# Backpanel Module

## What It Is

Owns staff access, role concepts, and operational configuration boundaries.

The backpanel is not just an internal add-on. It is where the business manages
the rules and content that drive the public website and booking system.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Backpanel User | Entity | Staff account allowed to access operational tools. |
| Backpanel Role | Value Object | Initial roles are `ADMIN` and `STAFF`. |
| Configurable Setting | Entity | Named operational setting that can be managed without code changes. |
| Audit Entry | Entity | Record of staff changes to important operational data. |

## Use Case Candidates

- Manage backpanel user.
- Update configurable setting.
- Record audit entry.
- List configuration changes.

## Screen Map

- [Backpanel Screens](screens/index.md)

## Depends On

- [Booking](../booking/index.md), for booking configuration and operations.
- [Boat Calendar](../boat-calendar/index.md), for availability rules.
- [Experience Catalog](../experience-catalog/index.md), for experiences and extras.
- [Localization SEO](../localization-seo/index.md), for translations and publication.
- [Notifications](../notifications/index.md), for editable templates and channels.
