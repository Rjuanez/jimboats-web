# Booking Calendar Persistence Schema

## Proposito

Persistir reservas, holds de checkout, selected slots y bloques de calendario.
El calendario es la autoridad para evitar solapes de barco.

## Estado De Implementacion

La implementacion actual persiste `calendar_blocks` para bloqueos manuales y
reservas confirmadas desde backpanel, junto con `bookings`, `booking_extras`,
`payment_records`, `audit_entries` y `outbox_messages`.

Quedan para slices posteriores: holds de checkout publico, tokens de acceso del
comprador, cancelacion configurable, preferencias de notificacion por booking,
publisher de outbox y politicas configurables globales.

## Tables

### `booking_availability_policies`

Stores configurable global booking-window rules.

| Column                        | Type      | Notes                 |
| ----------------------------- | --------- | --------------------- |
| `id`                          | string    | Primary key.          |
| `name`                        | string    | Backpanel label.      |
| `status`                      | string    | `ACTIVE`, `ARCHIVED`. |
| `min_advance_booking_minutes` | integer   | Launch value `60`.    |
| `max_advance_booking_months`  | integer   | Launch value `6`.     |
| `buffer_minutes`              | integer   | Launch value `30`.    |
| `created_at`                  | timestamp | Creation instant.     |
| `updated_at`                  | timestamp | Last update instant.  |

Constraints:

- Only one active policy at a time.
- `min_advance_booking_minutes >= 0`.
- `max_advance_booking_months > 0`.
- `buffer_minutes >= 0`.

Indexes:

- `booking_availability_policies_status_idx` on `status`.

### `bookings`

Stores booking lifecycle and buyer snapshot data.

| Column                        | Type               | Notes                                                                |
| ----------------------------- | ------------------ | -------------------------------------------------------------------- |
| `id`                          | string             | Primary key.                                                         |
| `reference`                   | string             | Public/support booking reference.                                    |
| `status`                      | string             | `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `EXPIRED`, `PAYMENT_FAILED`. |
| `source`                      | string             | `PUBLIC_CHECKOUT` or `BACKPANEL`.                                    |
| `experience_id`               | string             | Selected experience id snapshot.                                     |
| `experience_name_snapshot`    | string             | Experience name shown in admin after catalog changes.                |
| `calendar_block_id`           | string             | Calendar block protecting the booking.                               |
| `payment_record_id`           | string             | Deposit payment record associated with confirmation.                 |
| `guest_count`                 | integer            | Number of guests for capacity checks.                                |
| `customer_name`               | string             | Buyer name snapshot.                                                 |
| `customer_email`              | string             | Buyer email snapshot.                                                |
| `customer_phone`              | string nullable    | Buyer phone snapshot.                                                |
| `customer_locale`             | string             | Preferred locale.                                                    |
| `customer_notes`              | text               | Buyer-facing or staff-entered customer notes.                        |
| `selected_local_date`         | date               | Customer-facing local date.                                          |
| `selected_start_minutes`      | integer            | Customer-facing local start time.                                    |
| `selected_end_minutes`        | integer            | Customer-facing local end time.                                      |
| `selected_slot_key`           | string nullable    | Fixed slot key when applicable.                                      |
| `timezone`                    | string             | Launch value `Europe/Madrid`.                                        |
| `total_amount_minor`          | integer            | Price snapshot total.                                                |
| `total_currency`              | string             | Launch value `EUR`.                                                  |
| `deposit_amount_minor`        | integer            | Online deposit snapshot.                                             |
| `deposit_currency`            | string             | Launch value `EUR`.                                                  |
| `cash_remaining_amount_minor` | integer            | Remaining cash payment snapshot.                                     |
| `cash_remaining_currency`     | string             | Launch value `EUR`.                                                  |
| `price_captured_at`           | timestamp          | When the price snapshot was frozen.                                  |
| `hold_expires_at`             | timestamp nullable | Required for public pending payment.                                 |
| `confirmed_at`                | timestamp nullable | Confirmation instant.                                                |
| `cancelled_at`                | timestamp nullable | Cancellation instant.                                                |
| `internal_notes`              | text               | Backpanel-only operational notes.                                    |
| `created_by_user_id`          | string nullable    | FK to `backpanel_users.id` for admin bookings.                       |
| `created_at`                  | timestamp          | Creation instant.                                                    |
| `updated_at`                  | timestamp          | Last update instant.                                                 |

Constraints:

- Unique `reference`.
- `guest_count > 0`.
- selected end must be after selected start.
- money amounts are non-negative.
- `cash_remaining_amount_minor = total_amount_minor - deposit_amount_minor`
  is enforced by domain, application, and database checks.
- Public pending bookings require `hold_expires_at`.

Indexes:

- `bookings_status_idx` on `status`.
- `bookings_experience_id_idx` on `experience_id`.
- `bookings_customer_email_idx` on `customer_email`.
- `bookings_selected_date_idx` on `selected_local_date`.

### `booking_extras`

Stores selected extras and price snapshots for a booking.

| Column               | Type      | Notes                       |
| -------------------- | --------- | --------------------------- |
| `id`                 | string    | Primary key.                |
| `booking_id`         | string    | FK to `bookings.id`.        |
| `extra_id`           | string    | FK to `extras.id`.          |
| `name_snapshot`      | string    | Name shown at booking time. |
| `quantity`           | integer   | Selected quantity.          |
| `unit_amount_minor`  | integer   | Unit price snapshot.        |
| `unit_currency`      | string    | Launch value `EUR`.         |
| `total_amount_minor` | integer   | Quantity times unit price.  |
| `total_currency`     | string    | Launch value `EUR`.         |
| `created_at`         | timestamp | Creation instant.           |

Constraints:

- Unique `(booking_id, extra_id)`.
- `quantity > 0`.
- money amounts are non-negative.

Indexes:

- `booking_extras_booking_id_idx` on `booking_id`.
- `booking_extras_extra_id_idx` on `extra_id`.

### `payment_records`

Stores deposit payment state without coupling the domain to Stripe.

| Column                       | Type               | Notes                                      |
| ---------------------------- | ------------------ | ------------------------------------------ |
| `id`                         | string             | Primary key.                               |
| `booking_id`                 | string             | FK to `bookings.id`.                       |
| `status`                     | string             | `PENDING`, `SUCCEEDED`, `MANUALLY_PAID`, `FAILED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`. |
| `amount_minor`               | integer            | Deposit amount snapshot.                   |
| `currency`                   | string             | Launch value `EUR`.                        |
| `provider`                   | string             | `MANUAL` for backpanel bookings, `STRIPE` for public checkout. |
| `provider_session_id`        | string nullable    | Stripe Checkout session id.                |
| `provider_payment_intent_id` | string nullable    | Stripe payment intent id.                  |
| `failure_reason`             | text nullable      | Failure or manual review reason.           |
| `paid_at`                    | timestamp nullable | Set when deposit is paid or manually paid. |
| `created_at`                 | timestamp          | Creation instant.                          |
| `updated_at`                 | timestamp          | Last update instant.                       |

Constraints:

- Payment amount is non-negative.
- Provider is required.
- Payment record belongs to a booking.

Indexes:

- `payment_records_booking_id_idx` on `booking_id`.
- `payment_records_provider_session_id_idx` on `provider_session_id`.
- `payment_records_provider_payment_intent_id_idx` on `provider_payment_intent_id`.
- `payment_records_status_idx` on `status`.

### `calendar_blocks`

Stores protected availability ranges for the single boat.

| Column                  | Type               | Notes                                                                               |
| ----------------------- | ------------------ | ----------------------------------------------------------------------------------- |
| `id`                    | string             | Primary key.                                                                        |
| `source`                | string             | `MANUAL_BLOCK`, `BOOKING_HOLD`, `BOOKING_CONFIRMED`.                                |
| `status`                | string             | Launch implementation: `ACTIVE`, `RELEASED`. Future: `CANCELLED`, `EXPIRED`.        |
| `booking_id`            | string nullable    | FK to `bookings.id`.                                                                |
| `experience_id`         | string nullable    | FK to `experiences.id`.                                                             |
| `local_date`            | date               | Operational local date.                                                             |
| `visible_start_minutes` | integer            | Customer-facing outing start.                                                       |
| `visible_end_minutes`   | integer            | Customer-facing outing end.                                                         |
| `protected_start_at`    | timestamp          | Includes buffer.                                                                    |
| `protected_end_at`      | timestamp          | Includes buffer.                                                                    |
| `timezone`              | string             | Launch value `Europe/Madrid`.                                                       |
| `expires_at`            | timestamp nullable | Required for booking holds.                                                         |
| `reason`                | text nullable      | Required for manual blocks.                                                         |
| `created_by_user_id`    | string nullable    | FK to `backpanel_users.id`.                                                         |
| `created_at`            | timestamp          | Creation instant.                                                                   |
| `updated_at`            | timestamp          | Last update instant.                                                                |

Constraints:

- `protected_end_at > protected_start_at`.
- `visible_end_minutes > visible_start_minutes`.
- Active protected ranges must not overlap; this is enforced with a PostgreSQL
  exclusion constraint.
- Manual blocks require `reason`.
- `BOOKING_CONFIRMED` requires `booking_id` and `experience_id` in domain and application.
- `BOOKING_HOLD` requires `booking_id`, `experience_id`, and `expires_at`.
- Manual blocks use source `MANUAL_BLOCK`.

Indexes:

- `calendar_blocks_status_source_idx` on `(status, source)`.
- `calendar_blocks_booking_id_idx` on `booking_id`.
- `calendar_blocks_experience_id_idx` on `experience_id`.
- `calendar_blocks_protected_range_idx` on `(protected_start_at, protected_end_at)`.

### `booking_access_tokens`

Stores hashed buyer access tokens for private booking pages.

| Column         | Type               | Notes                           |
| -------------- | ------------------ | ------------------------------- |
| `id`           | string             | Primary key.                    |
| `booking_id`   | string             | FK to `bookings.id`.            |
| `token_hash`   | string             | Hash only, never raw token.     |
| `status`       | string             | `ACTIVE`, `REVOKED`, `EXPIRED`. |
| `expires_at`   | timestamp nullable | Optional expiry.                |
| `last_used_at` | timestamp nullable | Last access instant.            |
| `created_at`   | timestamp          | Creation instant.               |

Constraints:

- Unique `token_hash`.
- Active token must reference an existing booking.

Indexes:

- `booking_access_tokens_booking_id_idx` on `booking_id`.
- `booking_access_tokens_status_idx` on `status`.

## Relaciones

- One booking references one experience.
- One booking can own one active calendar block at a time.
- One booking has many booking extras.
- One booking has many access tokens over time.
- One booking has one notification preference record when notification
  processing is implemented.
- Calendar blocks are the source of truth for overlap prevention.

## Notas Prisma

The active range overlap rule is stronger than normal Prisma constraints. Use a
PostgreSQL exclusion constraint in a manual migration when implementing real
availability.
