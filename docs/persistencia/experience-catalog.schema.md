# Experience Catalog Persistence Schema

## Proposito

Persistir experiencias, extras, politicas de slots y compatibilidad entre
experiencias y extras. Estos datos son configurables desde el backpanel.

## Tables

### `experiences`

Stores the configurable product that can be booked.

| Column                         | Type             | Notes                                                            |
| ------------------------------ | ---------------- | ---------------------------------------------------------------- |
| `id`                           | string           | Primary key.                                                     |
| `internal_name`                | string           | Backpanel label.                                                 |
| `type`                         | string           | Commercial category or internal type.                            |
| `status`                       | string           | `DRAFT`, `READY`, `PUBLISHED`, `ARCHIVED`.                       |
| `display_order`                | integer          | Positive listing order for admin/public sorting.                 |
| `base_price_amount_minor`      | integer          | Price per booking.                                               |
| `base_price_currency`          | string           | Launch value `EUR`.                                              |
| `deposit_amount_minor`         | integer          | Launch value `10000`.                                            |
| `deposit_currency`             | string           | Launch value `EUR`.                                              |
| `duration_minutes`             | integer          | Positive duration.                                               |
| `capacity`                     | integer          | Positive base capacity.                                          |
| `departure_port`               | string           | Operational departure point.                                     |
| `included_items`               | text             | Internal/commercial notes.                                       |
| `internal_notes`               | text             | Staff-only notes.                                                |
| `buffer_minutes`               | integer          | Operational buffer around selected slots.                        |
| `minimum_advance_minutes`      | integer          | Minimum booking notice.                                          |
| `maximum_advance_months`       | integer          | Maximum future booking window. Launch max is `6`.                |
| `allows_manual_scheduling`     | boolean          | Staff can place the experience outside public slot templates.    |
| `primary_media_asset_id`       | string nullable  | Logical reference to media; FK when media schema is implemented. |
| `primary_media_status`         | string           | `MISSING`, `PROCESSING`, `READY`, `FAILED`.                      |
| `slot_policy_mode`             | string           | `FIXED_SLOTS`, `ANY_AVAILABLE`, `MANUAL_APPROVAL`.               |
| `slot_policy_timezone`         | string           | Launch value `Europe/Madrid`.                                    |
| `slot_operating_start_minutes` | integer nullable | Required for `ANY_AVAILABLE`.                                    |
| `slot_operating_end_minutes`   | integer nullable | Required for `ANY_AVAILABLE`.                                    |
| `slot_granularity_minutes`     | integer nullable | Required for `ANY_AVAILABLE`.                                    |
| `created_at`                   | timestamp        | Creation instant.                                                |
| `updated_at`                   | timestamp        | Last update instant.                                             |

Constraints:

- `duration_minutes > 0`.
- `capacity > 0`.
- `display_order > 0`.
- `buffer_minutes >= 0`.
- `minimum_advance_minutes >= 0`.
- `maximum_advance_months` between `1` and `6` for launch.
- money amounts are non-negative integers.
- `deposit_amount_minor = 10000` is a launch expectation, not necessarily a
  database constraint.
- `slot_policy_timezone = 'Europe/Madrid'` at launch.
- `primary_media_asset_id` may be nullable while the experience is draft.

Indexes:

- `experiences_status_idx` on `status`.
- `experiences_display_order_idx` on `display_order`.
- `experiences_primary_media_asset_id_idx` on `primary_media_asset_id`.

### `experience_fixed_slots`

Stores fixed bookable slot definitions for one experience.

| Column          | Type      | Notes                                                |
| --------------- | --------- | ---------------------------------------------------- |
| `id`            | string    | Primary key.                                         |
| `experience_id` | string    | FK to `experiences.id`.                              |
| `slot_key`      | string    | Stable key inside the experience.                    |
| `label`         | string    | Backpanel/display label.                             |
| `enabled`       | boolean   | Disabled slots remain for history/config continuity. |
| `start_minutes` | integer   | Minutes after local midnight.                        |
| `end_minutes`   | integer   | Minutes after local midnight.                        |
| `position`      | integer   | Sorting order.                                       |
| `created_at`    | timestamp | Creation instant.                                    |
| `updated_at`    | timestamp | Last update instant.                                 |

Constraints:

- Unique `(experience_id, slot_key)`.
- `start_minutes >= 0`.
- `end_minutes <= 1440`.
- `end_minutes > start_minutes`.
- Enabled slots for the same experience must not overlap. This is enforced in
  domain/application because PostgreSQL exclusion constraints are optional for
  the first implementation.

Indexes:

- `experience_fixed_slots_experience_id_idx` on `experience_id`.

### `extras`

Stores configurable extras that can be attached to bookings.

| Column                   | Type            | Notes                                                            |
| ------------------------ | --------------- | ---------------------------------------------------------------- |
| `id`                     | string          | Primary key.                                                     |
| `name`                   | string          | Internal/backpanel label.                                        |
| `status`                 | string          | `DRAFT`, `ACTIVE`, `ARCHIVED`.                                   |
| `price_amount_minor`     | integer         | Default price per booking.                                       |
| `price_currency`         | string          | Launch value `EUR`.                                              |
| `default_notice_minutes` | integer         | Minimum default notice.                                          |
| `primary_media_asset_id` | string nullable | Logical reference to media; FK when media schema is implemented. |
| `created_at`             | timestamp       | Creation instant.                                                |
| `updated_at`             | timestamp       | Last update instant.                                             |

Constraints:

- `price_amount_minor >= 0`.
- `default_notice_minutes >= 0`.
- Active extras require a price greater than zero in domain/application.

Indexes:

- `extras_status_idx` on `status`.
- `extras_primary_media_asset_id_idx` on `primary_media_asset_id`.

### `experience_extra_rules`

Stores compatibility and per-experience extra configuration.

| Column                        | Type             | Notes                            |
| ----------------------------- | ---------------- | -------------------------------- |
| `id`                          | string           | Primary key.                     |
| `experience_id`               | string           | FK to `experiences.id`.          |
| `extra_id`                    | string           | FK to `extras.id`.               |
| `enabled`                     | boolean          | Whether buyers can select it.    |
| `limit_per_booking`           | integer          | Maximum quantity.                |
| `notice_minutes`              | integer          | Override or effective notice.    |
| `price_override_amount_minor` | integer nullable | Optional price override.         |
| `price_override_currency`     | string nullable  | Required when override exists.   |
| `capacity_reduction`          | integer          | Capacity decrease when selected. |
| `slot_key`                    | string nullable  | Optional fixed-slot dependency.  |
| `created_at`                  | timestamp        | Creation instant.                |
| `updated_at`                  | timestamp        | Last update instant.             |

Constraints:

- Unique `(experience_id, extra_id, slot_key)`.
- `limit_per_booking >= 0`.
- `notice_minutes >= 0`.
- `capacity_reduction >= 0`.
- price override amount and currency are both null or both present.

Indexes:

- `experience_extra_rules_experience_id_idx` on `experience_id`.
- `experience_extra_rules_extra_id_idx` on `extra_id`.
- `experience_extra_rules_slot_key_idx` on `slot_key`.

## Relaciones

- One experience has many fixed slots.
- One experience has many extra rules.
- One extra can be referenced by many experience extra rules.
- Experience and extra each may reference one primary media asset.

## Notas Prisma

`slot_policy_mode` can be a Prisma enum once stable.

The overlap rule for enabled fixed slots should stay in domain/application for
the first implementation and be backed by tests.
