# ADR-0002: Backpanel Configurable Product

## Status

Accepted

## Context

The landing page is important for acquisition, but the core product is the
configurable booking system behind it. Business users must be able to manage
commercial rules, catalog content, availability, translations, and messaging
without changing source code.

## Decision

- Business rules and commercial content must be stored in the database and
  managed from the backpanel whenever practical.
- Experiences are configurable from the backpanel.
- Extras, compatibility, quantity limits, capacity reductions, minimum notice,
  and slot-dependent availability are configurable from the backpanel.
- Experience and extra primary images are configurable from the backpanel.
- Public image paths and variants must come from media configuration, not
  hardcoded source paths.
- Slot policies and booking availability rules are configurable from the
  backpanel.
- Cancellation policy tiers and deposit outcomes are configurable from the
  backpanel.
- Notification templates are configurable from the backpanel by channel and
  locale.
- Public localized content, SEO metadata, GEO metadata, routes, and publication
  status are configurable from the backpanel.
- Static HTML/code is acceptable for structure, layout, shell screens, and
  non-business UI.
- If a public page needs translation, SEO/GEO, backpanel editing, or business
  content, it should be configurable rather than hardcoded.
- Initial supported locales are `en`, `es`, and `ca`.
- Initial backpanel roles are `ADMIN` and `STAFF`.
- `ADMIN` and `STAFF` may share most permissions at launch, but the role model
  must still exist so permissions can diverge later.
- Hardcoded values are acceptable only for technical defaults, migrations,
  bootstrapping, or emergency fallbacks. They must not become the source of
  business truth.

## Consequences

- Implementation should prioritize admin configuration screens earlier than a
  normal marketing-only website would.
- Public pages read from configured domain data instead of static constants.
- Domain models need configuration versioning or audit trails where changes
  affect bookings, payments, availability, or publication.
- Tests should cover configurable behavior instead of only fixed examples.

## Alternatives Considered

- Hardcode launch experiences, extras, copy, and rules first: rejected because
  the product needs day-to-day operational control from the backpanel.
