# Backpanel Screens

## Purpose

This document maps the administration panel before visual design and
implementation.

The goal is to see the full operational surface, detect missing domain rules,
and keep the product configurable from the backpanel instead of hardcoded in the
public website.

Each screen should eventually define:

- Purpose.
- User.
- Data shown.
- Actions.
- States.
- Domain rules.
- Permissions.
- Open questions.

## Navigation Map

Routes below describe the information architecture. Some nested entries are
tabs or sections inside a parent detail screen, not necessarily separate pages.

```txt
/admin
  /login

  /dashboard

  /calendar
  /calendar/blocks/new

  /bookings
  /bookings/new
  /bookings/:bookingId

  /experiences
  /experiences/new
  /experiences/:experienceId
    areas: overview, booking-setup, content-seo-geo, publish

  /extras
  /extras/new
  /extras/:extraId
    tabs: general, media, rules, translations, seo-geo, audit

  /media
  /media/upload
  /media/:mediaAssetId

  /content
  /content/landing
  /content/pages
  /content/pages/:pageId

  /localization
  /localization/translations
  /localization/routes
  /localization/seo-geo

  /notifications
  /notifications/rules
  /notifications/templates
  /notifications/templates/:templateId
  /notifications/logs

  /settings
  /settings/booking
  /settings/cancellation
  /settings/locales
  /settings/integrations
  /settings/users
  /settings/audit
```

## Screen Groups

| Group         | Screen                | Purpose                                                                                                 |
| ------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| Access        | Login                 | Let staff enter the backpanel.                                                                          |
| Operations    | Dashboard             | Show operational health and urgent work.                                                                |
| Operations    | Calendar              | Show boat availability, bookings, holds, buffers, and manual blocks.                                    |
| Operations    | New Manual Block      | Create operational calendar blocks.                                                                     |
| Bookings      | Bookings List         | Search, filter, and inspect reservations.                                                               |
| Bookings      | Create Booking        | Create a booking manually from the backpanel.                                                           |
| Bookings      | Booking Detail        | Manage customer, slot, extras, deposit, cash remainder, notifications, cancellation, and reschedule.    |
| Catalog       | Experiences List      | Manage configurable public experiences.                                                                 |
| Catalog       | Experience Detail     | Edit one experience through workspace areas: overview, booking setup, content and SEO/GEO, and publish. |
| Catalog       | Extras List           | Manage configurable add-ons.                                                                            |
| Catalog       | Extra Detail          | Edit one extra through tabs: general, media, rules, translations, SEO/GEO, and audit.                   |
| Media         | Media Library         | Browse uploaded assets, processing status, and usage.                                                   |
| Media         | Upload Media          | Upload original images and queue processing.                                                            |
| Media         | Media Asset Detail    | Inspect asset, variants, alt text, failures, and attached resources.                                    |
| Content       | Landing Editor        | Configure landing sections, order, CTAs, featured experiences, and content.                             |
| Content       | Pages List            | Manage editable pages.                                                                                  |
| Content       | Page Detail           | Edit a page and its publication state.                                                                  |
| Localization  | Translations Queue    | Review missing, outdated, and publishable localized content.                                            |
| Localization  | Routes                | Manage localized routes, slugs, canonicals, and hreflang groups.                                        |
| Localization  | SEO GEO               | Review metadata, structured data, and GEO readiness.                                                    |
| Notifications | Templates List        | Manage editable email and WhatsApp templates.                                                           |
| Notifications | Template Detail       | Edit template by type, channel, and locale.                                                             |
| Notifications | Rules                 | Configure which booking events send messages, by channel, mode, and template.                           |
| Notifications | Logs                  | Inspect sent, failed, delivered, and retryable notifications.                                           |
| Settings      | Booking Settings      | Configure deposit, checkout hold, advance windows, buffer, and manual deposit rules.                    |
| Settings      | Cancellation Settings | Configure cancellation tiers and deposit outcomes.                                                      |
| Settings      | Locales               | Configure supported locales and fallback rules.                                                         |
| Settings      | Integrations          | Configure Stripe, email, WhatsApp, media storage, and worker status.                                    |
| Settings      | Users                 | Manage backpanel users and roles.                                                                       |
| Settings      | Audit                 | Review important configuration and operational changes.                                                 |

## Detailed Screens

- The first implemented backpanel slice is the Experiences workspace. It is a
  functional local facade backed by browser storage until database use cases are
  connected.
- [Dashboard](dashboard.screen.md)
- [Booking Detail](booking-detail.screen.md)
- [Experiences List](experiences-list.screen.md)
- [Experience Detail](experience-detail.screen.md)
- [Media Library](media-library.screen.md)
- [Media Asset Detail](media-asset-detail.screen.md)
- [Notification Rules](notification-rules.screen.md)
- [Notification Templates](notification-templates.screen.md)
- [Notification Template Detail](notification-template-detail.screen.md)
- [Notification Logs](notification-logs.screen.md)

## Implementation Notes

- Public website screens should read configured data created here.
- Static HTML/code is acceptable for structure, layout, shell screens, and
  non-business UI.
- If a public page needs translation, SEO/GEO, backpanel editing, or business
  content, it should be configurable rather than hardcoded.
- Backpanel actions should preserve domain invariants; screens must not bypass
  use cases.
- Important changes should create audit entries.
- SEO/GEO publication states must remain visible in catalog and localization
  screens.
- Media screens must make processing state and failures obvious before public
  publication.
- The Experiences workspace is split into list, create, overview, content,
  availability, extras, media, and publish routes because each area has enough
  operational density to deserve a direct URL while still belonging to one
  experience detail workspace.

## Open Questions

- Should settings be one grouped area or split into module-specific settings
  screens from day one?
