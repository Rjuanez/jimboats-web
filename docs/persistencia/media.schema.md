# Media Persistence Schema

## Proposito

Persistir metadata de media, variantes publicas, textos alt localizados y jobs
del worker. PostgreSQL guarda metadata, nunca binarios.

## Tables

### `media_assets`

Stores one uploaded or managed media source.

| Column                  | Type          | Notes                                        |
| ----------------------- | ------------- | -------------------------------------------- |
| `id`                    | string        | Primary key.                                 |
| `title`                 | string        | Admin-facing media title.                    |
| `collection`            | string        | `EXPERIENCES`, `EXTRAS`, `GALLERY`, `PAGES`. |
| `status`                | string        | `PROCESSING`, `READY`, `FAILED`.             |
| `original_private_path` | string        | Private filesystem path.                     |
| `original_filename`     | string        | Original client filename.                    |
| `mime_type`             | string        | Uploaded MIME type.                          |
| `original_width`        | integer       | Original width.                              |
| `original_height`       | integer       | Original height.                             |
| `original_size_bytes`   | integer       | Original size.                               |
| `original_content_hash` | string        | Hash of original content.                    |
| `failure_reason`        | text nullable | Last processing error.                       |
| `created_at`            | timestamp     | Creation instant.                            |
| `updated_at`            | timestamp     | Last update instant.                         |

Constraints:

- `title` must be present.
- `original_size_bytes > 0`.
- `original_width` and `original_height` must be positive.
- `original_content_hash` must be present.
- `original_private_path` must not be a public `/media/*` path.

Indexes:

- `media_assets_status_idx` on `status`.
- `media_assets_collection_idx` on `collection`.
- `media_assets_original_content_hash_idx` on `original_content_hash`.
- `media_assets_updated_at_idx` on `updated_at`.

### `media_asset_variants`

Stores public optimized files generated from an asset.

| Column           | Type      | Notes                                                 |
| ---------------- | --------- | ----------------------------------------------------- |
| `id`             | string    | Primary key.                                          |
| `media_asset_id` | string    | FK to `media_assets.id`.                              |
| `variant_key`    | string    | Domain variant id. Example: `640w`, `1280w`, `1920w`. |
| `public_path`    | string    | Public immutable `/media/*` path.                     |
| `format`         | string    | Example: `webp`.                                      |
| `width`          | integer   | Variant width.                                        |
| `height`         | integer   | Variant height.                                       |
| `size_bytes`     | integer   | Variant file size.                                    |
| `content_hash`   | string    | Hash in public filename.                              |
| `created_at`     | timestamp | Creation instant.                                     |

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

| Column           | Type      | Notes                    |
| ---------------- | --------- | ------------------------ |
| `id`             | string    | Primary key.             |
| `media_asset_id` | string    | FK to `media_assets.id`. |
| `locale`         | string    | `en`, `es`, `ca`.        |
| `alt_text`       | text      | Localized alt text.      |
| `created_at`     | timestamp | Creation instant.        |
| `updated_at`     | timestamp | Last update instant.     |

Constraints:

- Unique `(media_asset_id, locale)`.
- `alt_text` must be non-empty when the image is informative.

Indexes:

- `media_alt_texts_asset_id_idx` on `media_asset_id`.

### `media_processing_jobs`

Stores local queue jobs for the media worker.

| Column           | Type               | Notes                                        |
| ---------------- | ------------------ | -------------------------------------------- |
| `id`             | string             | Primary key.                                 |
| `media_asset_id` | string             | FK to `media_assets.id`.                     |
| `status`         | string             | `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`. |
| `attempts`       | integer            | Number of attempts.                          |
| `started_at`     | timestamp nullable | When the current processing attempt started. |
| `completed_at`   | timestamp nullable | When the job completed or failed.            |
| `last_error`     | text nullable      | Last failure.                                |
| `created_at`     | timestamp          | Creation instant.                            |
| `updated_at`     | timestamp          | Last update instant.                         |

Constraints:

- `attempts >= 0`.
- Job must reference an existing asset.

Indexes:

- `media_processing_jobs_pick_idx` on `(status, created_at)`.
- `media_processing_jobs_asset_id_idx` on `media_asset_id`.

## Relaciones

- One media asset has many variants.
- One media asset has many localized alt text rows.
- One media asset can have many processing jobs over time.
- Experience and extra primary image columns reference `media_assets.id`.

## Notas Prisma y worker

The first worker implementation persists jobs with a simple `PENDING` to
`RUNNING` to `COMPLETED` / `FAILED` lifecycle. The initial runtime uses one
Docker `media-worker` process polling PostgreSQL, so advanced multi-worker
locking, retry delay, worker id and max attempts are intentionally deferred.

The public variant URL is immutable. Replacing an image creates a new file and
usually a new media asset or new variants with new hashes.
