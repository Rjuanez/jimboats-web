# Media Persistence Schema

## Proposito

Persistir metadata de media, variantes publicas, textos alt localizados y jobs
del worker. PostgreSQL guarda metadata, nunca binarios.

## Tables

### `media_assets`

Stores one uploaded or managed media source.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `status` | string | `PROCESSING`, `READY`, `FAILED`, `ARCHIVED`. |
| `kind` | string | Example: `IMAGE`. |
| `original_private_path` | string | Private filesystem path. |
| `original_filename` | string | Original client filename. |
| `mime_type` | string | Uploaded MIME type. |
| `format` | string | Normalized image format. |
| `width` | integer nullable | Original width when known. |
| `height` | integer nullable | Original height when known. |
| `size_bytes` | integer | Original size. |
| `content_hash` | string | Hash of original content. |
| `failure_reason` | text nullable | Last processing error. |
| `created_by_user_id` | string nullable | FK to `backpanel_users.id`. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- `size_bytes > 0`.
- `width` and `height` are positive when present.
- `content_hash` must be present.

Indexes:

- `media_assets_status_idx` on `status`.
- `media_assets_content_hash_idx` on `content_hash`.

### `media_variants`

Stores public optimized files generated from an asset.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `media_asset_id` | string | FK to `media_assets.id`. |
| `variant_key` | string | Example: `640w`, `1280w`, `1920w`. |
| `public_path` | string | Public immutable `/media/*` path. |
| `format` | string | Example: `webp`. |
| `width` | integer | Variant width. |
| `height` | integer | Variant height. |
| `size_bytes` | integer | Variant file size. |
| `content_hash` | string | Hash in public filename. |
| `created_at` | timestamp | Creation instant. |

Constraints:

- Unique `(media_asset_id, variant_key)`.
- Unique `public_path`.
- `width > 0`.
- `height > 0`.
- `size_bytes > 0`.

Indexes:

- `media_variants_asset_id_idx` on `media_asset_id`.

### `media_alt_texts`

Stores localized alt text for public assets.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `media_asset_id` | string | FK to `media_assets.id`. |
| `locale` | string | `en`, `es`, `ca`. |
| `alt_text` | text | Localized alt text. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- Unique `(media_asset_id, locale)`.
- `alt_text` must be non-empty when the image is informative.

Indexes:

- `media_alt_texts_asset_id_idx` on `media_asset_id`.

### `media_processing_jobs`

Stores local queue jobs for the media worker.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | string | Primary key. |
| `media_asset_id` | string | FK to `media_assets.id`. |
| `status` | string | `PENDING`, `RUNNING`, `DONE`, `FAILED`. |
| `attempts` | integer | Number of attempts. |
| `max_attempts` | integer | Retry limit. |
| `available_at` | timestamp | Earliest processing instant. |
| `locked_at` | timestamp nullable | Worker lock time. |
| `locked_by` | string nullable | Worker identifier. |
| `last_error` | text nullable | Last failure. |
| `created_at` | timestamp | Creation instant. |
| `updated_at` | timestamp | Last update instant. |

Constraints:

- `attempts >= 0`.
- `max_attempts > 0`.
- Job must reference an existing asset.

Indexes:

- `media_processing_jobs_pick_idx` on `(status, available_at)`.
- `media_processing_jobs_asset_id_idx` on `media_asset_id`.

## Relaciones

- One media asset has many variants.
- One media asset has many localized alt text rows.
- One media asset can have many processing jobs over time.
- Experience and extra primary image columns reference `media_assets.id`.

## Notas Prisma

The worker should claim jobs with a transaction or equivalent locking strategy.

The public variant URL is immutable. Replacing an image creates a new file and
usually a new media asset or new variants with new hashes.
