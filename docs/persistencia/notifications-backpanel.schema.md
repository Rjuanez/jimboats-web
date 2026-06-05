# Notifications And Backpanel Persistence Schema

## Proposito

Persistir usuarios del backpanel, roles, auditoria, plantillas de
notificacion y registros de envio. Los canales de lanzamiento son email y
WhatsApp.

## Estado De Implementacion

La implementacion actual persiste `audit_entries`, `outbox_messages`,
preferencias por booking, reglas, plantillas, traducciones y deliveries.

El publisher de lanzamiento es `notification-worker`, un proceso Docker que
lee PostgreSQL como cola durable. Email se envia mediante Resend y WhatsApp
mediante Prelude Notify cuando `NOTIFICATION_PROVIDER_MODE=external`.

Quedan para slices posteriores: usuarios reales de backpanel y webhooks de
providers para pasar deliveries de `SENT` a `DELIVERED` o estados finales de
rebote/fallo.

## Tables

### `backpanel_users`

Stores staff/admin users.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `email` | string | Login/contact email. |
| `name` | string | Display name. |
| `status` | string | `ACTIVE`, `DISABLED`. |
| `role` | string | `ADMIN` or `STAFF`. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Unique `email`.
- Role must be one of launch roles.

Indexes:

- `backpanel_users_status_idx` on `status`.

### `audit_entries`

Stores sensitive operational changes.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `actor_user_id` | string nullable | FK to `backpanel_users.id`. |
| `action` | string | Business action name. |
| `resource_type` | string | Changed resource type. |
| `resource_id` | string | Changed resource id. |
| `reason` | text nullable | Staff-entered reason when needed. |
| `diff_json` | json nullable | Before/after or normalized diff. |
| `created_at` | timestamp | Creation instant. |

Constraints:

- `action`, `resource_type`, and `resource_id` must be present.

Indexes:

- `audit_entries_resource_idx` on `(resource_type, resource_id)`.
- `audit_entries_actor_idx` on `actor_user_id`.
- `audit_entries_created_at_idx` on `created_at`.

### `outbox_messages`

Stores reliable application events created in the same transaction as business
state changes.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `aggregate_type` | string | Current value `BOOKING`. |
| `aggregate_id` | string | Changed aggregate id. |
| `event_type` | string | Example: `BookingCreated`. |
| `event_version` | integer | Event contract version. |
| `payload` | json | Serializable event payload. |
| `status` | string | `PENDING`, `PUBLISHED`, `FAILED`. |
| `occurred_at` | timestamp | Business event instant. |
| `published_at` | timestamp nullable | Set by future publisher. |
| `failure_reason` | text nullable | Last publisher failure. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- `aggregate_type`, `aggregate_id`, `event_type`, and `payload` must be present.
- Booking lifecycle events use version `1` at launch.

Indexes:

- `outbox_messages_status_created_at_idx` on `(status, created_at)`.
- `outbox_messages_aggregate_idx` on `(aggregate_type, aggregate_id)`.
- `outbox_messages_event_type_idx` on `event_type`.

### `configurable_settings`

Stores small global settings that are not rich domain entities yet.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `key` | string | Stable setting key. |
| `value_json` | json | Typed value payload. |
| `status` | string | `ACTIVE`, `ARCHIVED`. |
| `updated_by_user_id` | string nullable | FK to `backpanel_users.id`. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Unique `key`.
- Settings that become core business concepts should move to dedicated tables.

Indexes:

- `configurable_settings_status_idx` on `status`.

### `booking_notification_preferences`

Stores per-booking operational communication consent and channel choices.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `booking_id` | string | FK to `bookings.id`. |
| `preferred_locale` | string | `en`, `es`, `ca`. |
| `email_enabled` | boolean | Whether email can be used. |
| `email_address` | string nullable | Email destination snapshot. |
| `email_consent_status` | string | `GRANTED`, `REVOKED`, `NOT_ASKED`. |
| `whatsapp_enabled` | boolean | Whether WhatsApp can be used. |
| `whatsapp_phone` | string nullable | WhatsApp destination snapshot. |
| `whatsapp_consent_status` | string | `GRANTED`, `REVOKED`, `NOT_ASKED`. |
| `consent_source` | string | `CHECKOUT`, `BACKPANEL`, `BUYER_ACCESS`. |
| `consent_notes` | text nullable | Staff note when manually changed. |
| `consent_captured_at` | timestamp nullable | Consent capture/change instant. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Unique `booking_id`.
- Enabled email requires `email_address`.
- Enabled WhatsApp requires `whatsapp_phone`.
- A channel can only be used when enabled and consent status is `GRANTED`.
- Contact data without consent must be stored as `NOT_ASKED`, not `GRANTED`.

Indexes:

- `booking_notification_preferences_booking_id_idx` on `booking_id`.
- `booking_notification_preferences_locale_idx` on `preferred_locale`.

### `notification_rules`

Stores backpanel configuration for event-to-message behavior.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `event_type` | string | Example: `BookingCreated`. |
| `notification_type` | string | Example: `BOOKING_CREATED`. |
| `channel` | string | `EMAIL` or `WHATSAPP`. |
| `recipient_type` | string | Launch value `BUYER`. |
| `template_id` | string | FK to `notification_templates.id`. |
| `enabled` | boolean | Whether the rule creates deliveries. |
| `send_mode` | string | `AUTOMATIC` or `MANUAL_REVIEW`. |
| `requires_consent` | boolean | Buyer rules require true at launch. |
| `locale_strategy` | string | Launch value `BOOKING_PREFERRED_LOCALE`. |
| `missing_translation_behavior` | string | Launch value `DO_NOT_SEND`. |
| `status` | string | `ACTIVE`, `ARCHIVED`. |
| `updated_by_user_id` | string nullable | FK to `backpanel_users.id`. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Unique active `(event_type, channel, recipient_type)`.
- Enabled rule requires an active template.
- Buyer rules require consent at launch.

Indexes:

- `notification_rules_event_idx` on `event_type`.
- `notification_rules_lookup_idx` on `(event_type, channel, recipient_type, status)`.
- `notification_rules_template_id_idx` on `template_id`.

### `notification_templates`

Stores editable template metadata by notification type and channel.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `notification_type` | string | Example: `BOOKING_CREATED`. |
| `event_type` | string | Example: `BookingCreated`. |
| `channel` | string | `EMAIL` or `WHATSAPP`. |
| `provider_template_id` | string nullable | External template id. Required for automatic WhatsApp through Prelude. |
| `status` | string | `DRAFT`, `READY`, `ACTIVE`, `ARCHIVED`. |
| `allowed_variables_json` | json | Allowed render variables. |
| `required_variables_json` | json | Required variables before publishing. |
| `version` | integer | Template version used for render traceability. |
| `updated_by_user_id` | string nullable | FK to `backpanel_users.id`. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Unique active `(notification_type, channel)`.
- Active templates require at least one published translation.
- Automatic WhatsApp templates require `provider_template_id` before a pending
  delivery can be created.

Indexes:

- `notification_templates_lookup_idx` on `(notification_type, channel, status)`.

### `notification_template_translations`

Stores localized subject/body content for a template.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `template_id` | string | FK to `notification_templates.id`. |
| `locale` | string | `en`, `es`, `ca`. |
| `status` | string | `DRAFT`, `READY`, `PUBLISHED`, `ARCHIVED`. |
| `subject` | string nullable | Required for published email translations. |
| `preview_text` | string nullable | Optional email preview/snippet. |
| `body` | text | Localized body. |
| `variables_used_json` | json | Variables detected in content. |
| `updated_by_user_id` | string nullable | FK to `backpanel_users.id`. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Unique `(template_id, locale)`.
- Published email translations require `subject`.
- Published translations require non-empty `body`.
- Used variables must be allowed by the parent template.

Indexes:

- `notification_template_translations_template_idx` on `template_id`.
- `notification_template_translations_lookup_idx` on `(template_id, locale, status)`.

### `notification_deliveries`

Stores rendered notification send intents and results.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `outbox_message_id` | string nullable | Source outbox message. |
| `rule_id` | string nullable | Rule that created the delivery. |
| `booking_id` | string nullable | FK to `bookings.id`. |
| `notification_type` | string | Notification type. |
| `event_type` | string | Source event type. |
| `channel` | string | `EMAIL` or `WHATSAPP`. |
| `status` | string | `PENDING`, `MANUAL_REVIEW`, `SENT`, `DELIVERED`, `FAILED`, `CANCELLED`. |
| `locale` | string | Render locale. |
| `recipient_type` | string | Launch value `BUYER`. |
| `recipient_name` | string nullable | Recipient snapshot. |
| `recipient_email` | string nullable | Email target. |
| `recipient_phone` | string nullable | WhatsApp target. |
| `template_id` | string nullable | FK to `notification_templates.id`. |
| `template_version` | integer nullable | Version used when rendered. |
| `rendered_subject` | string nullable | Rendered email subject. |
| `rendered_body` | text | Rendered body snapshot. |
| `payload_json` | json | Render payload snapshot. |
| `attempts` | integer | Number of provider/manual send attempts. |
| `provider` | string nullable | External provider when automatic. |
| `provider_message_id` | string nullable | External delivery id. |
| `provider_template_id` | string nullable | External template id snapshot used for provider send. |
| `provider_variables_json` | json | Provider variable snapshot, especially for Prelude strict template variables. |
| `failure_reason` | text nullable | Last failure. |
| `send_after` | timestamp nullable | Delayed send time. |
| `sent_at` | timestamp nullable | Delivery accepted or marked sent instant. |
| `delivered_at` | timestamp nullable | Provider delivery confirmation. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Email channel requires `recipient_email`.
- WhatsApp channel requires `recipient_phone`.
- Booking notification types require `booking_id`.
- Unique `(outbox_message_id, rule_id)` when both are present to keep
  processing idempotent.
- `rendered_body` must be a snapshot and must not be recalculated after send.
- Prelude variables must be snapshotted because provider templates are strict
  about exact variable names.

Indexes:

- `notification_deliveries_status_send_after_idx` on `(status, send_after)`.
- `notification_deliveries_booking_id_idx` on `booking_id`.
- `notification_deliveries_channel_status_idx` on `(channel, status)`.
- `notification_deliveries_outbox_rule_idx` on `(outbox_message_id, rule_id)`.

## Relaciones

- Audit entries can reference backpanel users.
- Outbox messages are consumed by future notification, analytics, or integration
  processes.
- Booking notification preferences belong to one booking.
- Notification rules select templates and create deliveries from outbox events.
- Notification templates can have many translations.
- Notification deliveries may reference bookings and outbox messages.
- The notification worker reads pending outbox messages and pending
  notification deliveries.
- Configurable settings are a last resort for small settings, not a substitute
  for modeled tables.

## Notas Prisma

Authentication provider details are intentionally not modeled here. If auth is
implemented through a library, its required tables should be isolated from the
business tables.
