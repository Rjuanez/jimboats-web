# Persistence Conventions

## Naming

- Table names use snake case and plural nouns.
- Primary keys use `id`.
- Foreign keys use `<entity>_id`.
- Timestamp columns use `created_at` and `updated_at`.
- Lifecycle columns use explicit statuses instead of booleans when transitions
  matter.

## Identifiers

- Application-facing ids are strings.
- Database primary keys should map to string ids in the application layer.
- Public references such as booking references should be separate from internal
  ids.

## Money

- Money is stored as integer minor units.
- Currency is stored as a three-letter code.
- The launch currency is `EUR`.
- A money value normally uses two columns:
  - `amount_minor`
  - `currency`

## Locales

- Launch locales are `en`, `es`, and `ca`.
- Public indexable content must not rely on silent locale fallback.
- Every public locale row stores its own slug, SEO fields, GEO fields and
  publication status.

## Status Fields

Statuses should be stored as enum-like strings and validated by domain or
application code.

PostgreSQL enums may be introduced when the state list is stable. Prisma string
fields are acceptable during early schema iteration if they reduce migration
churn.

## JSON Fields

Use JSON only when the shape is genuinely flexible or generated:

- Structured data documents.
- Provider payload snapshots.
- Audit diffs.
- Notification render context.

Do not use JSON for core relations that need filtering, uniqueness or integrity.

## Archiving

Operational records should not be deleted if they affect audit, bookings,
payments or availability.

Preferred pattern:

- Catalog/config entities use `status = ARCHIVED` or `archived_at`.
- Operational entities use explicit lifecycle status.
- Hard delete is reserved for failed draft data without external meaning.

## Timestamps And Time Zones

- Absolute instants use timestamp with time zone semantics.
- Customer-facing local dates and times are stored separately when needed.
- Boat operations use `Europe/Madrid`.
- Calendar blocks store protected absolute ranges and the visible local slot
  data needed to explain a booking.

## Indexing

Every foreign key used for reads should have an index.

Every unique business rule should have an explicit unique constraint, not only
application validation.

## Prisma Boundary

Prisma models are persistence models only.

- Domain must not import Prisma generated types.
- Application must not import Prisma Client.
- Prisma adapters translate persistence rows into domain entities and DTOs.
- Schema names can be persistence-friendly even when domain names differ.
