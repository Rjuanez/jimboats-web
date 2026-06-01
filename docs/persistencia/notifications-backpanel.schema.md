# Notifications And Backpanel Persistence Schema

## Proposito

Persistir usuarios del backpanel, roles, auditoria, plantillas de
notificacion y registros de envio. Los canales de lanzamiento son email y
WhatsApp.

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

### `notification_templates`

Stores editable templates by type, channel and locale.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `type` | string | Example: `BOOKING_CONFIRMED`. |
| `channel` | string | `EMAIL` or `WHATSAPP`. |
| `locale` | string | `en`, `es`, `ca`. |
| `status` | string | `DRAFT`, `ACTIVE`, `ARCHIVED`. |
| `subject` | string nullable | Required for email. |
| `body` | text | Template body. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Unique `(type, channel, locale)`.
- Active email templates require `subject`.
- Active templates require non-empty body.

Indexes:

- `notification_templates_lookup_idx` on `(type, channel, locale, status)`.

### `notifications`

Stores notification send intents and results.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `type` | string | Notification type. |
| `channel` | string | `EMAIL` or `WHATSAPP`. |
| `status` | string | `PENDING`, `SENT`, `FAILED`, `CANCELLED`. |
| `locale` | string | Render locale. |
| `booking_id` | string nullable | FK to `bookings.id`. |
| `recipient_name` | string nullable | Snapshot. |
| `recipient_email` | string nullable | Email target. |
| `recipient_phone` | string nullable | WhatsApp target. |
| `template_id` | string nullable | FK to `notification_templates.id`. |
| `rendered_subject` | string nullable | Rendered email subject. |
| `rendered_body` | text | Rendered body snapshot. |
| `provider_message_id` | string nullable | External delivery id. |
| `failure_reason` | text nullable | Last failure. |
| `send_after` | timestamp nullable | Delayed send time. |
| `sent_at` | timestamp nullable | Delivery accepted instant. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Email channel requires `recipient_email`.
- WhatsApp channel requires `recipient_phone`.
- Booking notification types require `booking_id`.

Indexes:

- `notifications_status_send_after_idx` on `(status, send_after)`.
- `notifications_booking_id_idx` on `booking_id`.
- `notifications_channel_status_idx` on `(channel, status)`.

## Relaciones

- Audit entries can reference backpanel users.
- Notification templates can be used by many notifications.
- Notifications may reference bookings.
- Configurable settings are a last resort for small settings, not a substitute
  for modeled tables.

## Notas Prisma

Authentication provider details are intentionally not modeled here. If auth is
implemented through a library, its required tables should be isolated from the
business tables.
