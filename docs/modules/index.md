# Modules

## Purpose

Modules are domain ownership boundaries.

Each module owns its entities, value objects, use cases, and internal language.
Other modules should not depend on undocumented internals. If a flow needs more
than one module, document it under `docs/workflows/`.

## Current Modules

| Module | Purpose |
| --- | --- |
| [Shared](shared/index.md) | Shared value objects and IDs that are not owned by a specific module. |
| [Content](content/index.md) | Editable pages and editorial content from the backpanel. |
| [Experience Catalog](experience-catalog/index.md) | Public boat experiences, packages, prices, and extras. |
| [Booking](booking/index.md) | Booking holds, confirmed reservations, buyer access, price snapshots, and payment lifecycle. |
| [Boat Calendar](boat-calendar/index.md) | Single-boat availability, selected time ranges, checkout holds, confirmed blocks, and manual blocks. |
| [Notifications](notifications/index.md) | Booking-related messages across email and WhatsApp. |
| [Backpanel](backpanel/index.md) | Staff roles, operational configuration, and admin-managed business rules. |
| [Contact](contact/index.md) | Contact leads and non-booking inquiries. |
| [Media](media/index.md) | Image assets, variants, alt text, and processing state. |
| [Localization SEO](localization-seo/index.md) | Locales, translated routes, metadata, hreflang, sitemap, structured data, SEO, and GEO rules. |
