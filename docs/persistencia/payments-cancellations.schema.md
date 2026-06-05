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
| `provider_session_id` | string nullable | Stripe Checkout session when used. |
| `provider_payment_intent_id` | string nullable | Stripe payment intent when available. |
| `status` | string | `PENDING`, `SUCCEEDED`, `MANUALLY_PAID`, `FAILED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`. |
| `amount_minor` | integer | Charged amount. |
| `currency` | string | Launch value `EUR`. |
| `failure_reason` | text nullable | Provider failure or cancellation reason. |
| `paid_at` | timestamp nullable | Payment success instant. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- `amount_minor >= 0`.
- Successful online payment requires provider identifiers.
- Public checkout payment records use provider `STRIPE`.
- Backpanel manual deposit records use provider `MANUAL`.

Indexes:

- `payment_records_booking_id_idx` on `booking_id`.
- `payment_records_provider_session_id_idx` on `provider_session_id`.
- `payment_records_provider_payment_intent_id_idx` on `provider_payment_intent_id`.
- `payment_records_status_idx` on `status`.

### `payment_provider_events`

Stores trusted provider events once they have been parsed and accepted for
processing. This is the idempotency boundary for Stripe webhook retries.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `provider` | string | Launch value `STRIPE`. |
| `provider_event_id` | string | Unique event id from the provider. |
| `event_type` | string | Example: `checkout.session.completed`. |
| `status` | string | `PROCESSED`, `FAILED`, `IGNORED`. |
| `booking_id` | string nullable | FK to `bookings.id` when resolved. |
| `payment_record_id` | string nullable | FK to `payment_records.id` when resolved. |
| `payload` | json | Trusted event payload snapshot. |
| `received_at` | timestamp | Provider event creation instant. |
| `processed_at` | timestamp | Local processing instant. |

Constraints:

- Unique `(provider, provider_event_id)`.
- Payload is stored only after signature validation.

Indexes:

- `payment_provider_events_provider_event_id_idx` on `(provider, provider_event_id)`.
- `payment_provider_events_booking_id_idx` on `booking_id`.
- `payment_provider_events_payment_record_id_idx` on `payment_record_id`.

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
- One payment provider event may resolve to one booking and one payment record.
- One cancellation policy has many tiers.
- Booking cancellation uses the active policy and should persist the outcome in
  booking/audit records when cancellation happens.

## Notas Prisma

Provider payloads can be Prisma `Json`.
