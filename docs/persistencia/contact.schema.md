# Contact Persistence Schema

## Proposito

Persistir consultas que no llegan como booking. Este modulo permite gestionar
leads, preguntas y solicitudes manuales sin mezclarlas con reservas confirmadas.

## Tables

### `contact_inquiries`

Stores non-booking contact submissions.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `status` | string | `NEW`, `IN_REVIEW`, `RESOLVED`, `ARCHIVED`. |
| `name` | string | Contact name. |
| `email` | string | Contact email. |
| `phone` | string nullable | Contact phone. |
| `locale` | string nullable | Page/request locale. |
| `message` | text | Submitted message. |
| `source_path` | string nullable | Page where the lead came from. |
| `related_experience_id` | string nullable | FK to `experiences.id`. |
| `assigned_user_id` | string nullable | FK to `backpanel_users.id`. |
| `resolved_at` | timestamp nullable | Resolution instant. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- `name`, `email`, and `message` must be present.
- `locale` must be supported when present.

Indexes:

- `contact_inquiries_status_idx` on `status`.
- `contact_inquiries_email_idx` on `email`.
- `contact_inquiries_related_experience_id_idx` on `related_experience_id`.

## Relaciones

- A contact inquiry may reference an experience.
- A contact inquiry may be assigned to a backpanel user.

## Notas Prisma

If a contact inquiry turns into a booking, create a booking through the booking
use case and keep the original inquiry as lead history.
