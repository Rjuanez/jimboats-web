# Payments And Cancellations Persistence Schema

## Proposito

Persistir pagos, eventos de proveedor, politicas de cancelacion y tramos
configurables. El pago online inicial cubre solo el deposito.

## Tables

### `payment_records`

Stores payment attempts and confirmations.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `booking_id` | string | FK to `bookings.id`. |
| `provider` | string | Example: `STRIPE` or `MANUAL`. |
| `provider_payment_id` | string nullable | External payment identifier. |
| `provider_checkout_session_id` | string nullable | Stripe Checkout session when used. |
| `status` | string | `PENDING`, `SUCCEEDED`, `FAILED`, `CANCELLED`, `REFUNDED`, `MANUAL_PAID`. |
| `kind` | string | `DEPOSIT`. |
| `amount_minor` | integer | Charged amount. |
| `currency` | string | Launch value `EUR`. |
| `raw_provider_payload` | json nullable | Trusted event snapshot. |
| `paid_at` | timestamp nullable | Payment success instant. |
| `created_by_user_id` | string nullable | FK to `backpanel_users.id` for manual payments. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- `amount_minor >= 0`.
- Successful online payment requires provider identifiers.
- Manual payment requires `created_by_user_id`.

Indexes:

- `payment_records_booking_id_idx` on `booking_id`.
- `payment_records_provider_payment_id_idx` on `provider_payment_id`.
- `payment_records_status_idx` on `status`.

### `cancellation_policies`

Stores configurable cancellation policy headers.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `name` | string | Backpanel label. |
| `status` | string | `ACTIVE`, `ARCHIVED`. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Only one active cancellation policy at launch unless experience-specific
  policies are introduced later.

Indexes:

- `cancellation_policies_status_idx` on `status`.

### `cancellation_policy_tiers`

Stores time-window tiers before departure and deposit outcome.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `cancellation_policy_id` | string | FK to `cancellation_policies.id`. |
| `from_minutes_before_departure` | integer nullable | Inclusive lower bound. |
| `to_minutes_before_departure` | integer nullable | Exclusive upper bound. |
| `deposit_outcome` | string | `FULL_REFUND`, `PARTIAL_REFUND`, `NO_REFUND`, `MANUAL_REVIEW`. |
| `refund_amount_minor` | integer nullable | Optional fixed refund amount. |
| `refund_currency` | string nullable | Required when amount exists. |
| `position` | integer | Sorting order. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Bounds must not overlap inside the same policy.
- Bounds must be non-negative when present.
- `refund_amount_minor >= 0` when present.
- Refund amount and currency are both null or both present.

Indexes:

- `cancellation_policy_tiers_policy_id_idx` on `cancellation_policy_id`.

## Relaciones

- One booking has many payment records.
- One cancellation policy has many tiers.
- Booking cancellation uses the active policy and should persist the outcome in
  booking/audit records when cancellation happens.

## Notas Prisma

Provider payloads can be Prisma `Json`.

Webhook idempotency may need an additional `provider_events` table once Stripe
webhooks are implemented. It is intentionally not part of the first schema
until the payment adapter is designed.
