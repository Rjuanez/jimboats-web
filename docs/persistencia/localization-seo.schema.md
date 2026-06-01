# Localization SEO Persistence Schema

## Proposito

Persistir contenido traducible, rutas publicas, metadata SEO/GEO y estado
editorial por locale. Este esquema protege que las paginas indexables nunca
dependan de fallback silencioso.

## Tables

### `localized_experience_contents`

Stores one localized public content record for one experience and locale.

| Column                 | Type               | Notes                                                                                       |
| ---------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| `id`                   | string             | Primary key.                                                                                |
| `experience_id`        | string             | FK to `experiences.id`.                                                                     |
| `locale`               | string             | `en`, `es`, `ca`.                                                                           |
| `slug`                 | string             | URL-safe slug for this locale.                                                              |
| `status`               | string             | `DRAFT`, `NEEDS_TRANSLATION`, `NEEDS_REVIEW`, `OUTDATED`, `READY`, `PUBLISHED`, `ARCHIVED`. |
| `public_page_enabled`  | boolean            | Public page switch.                                                                         |
| `indexing_policy`      | string             | `INDEX` or `NOINDEX`.                                                                       |
| `title`                | string             | Public title.                                                                               |
| `h1`                   | string             | Page H1.                                                                                    |
| `summary`              | text               | Card/catalog summary for the locale.                                                        |
| `main_content`         | text               | Main editorial content.                                                                     |
| `included_text`        | text               | Public included-items copy for the locale.                                                  |
| `bring_text`           | text               | Public what-to-bring copy for the locale.                                                   |
| `visible_terms`        | text               | Public payment/weather/booking terms for the locale.                                        |
| `seo_title`            | string             | Metadata title.                                                                             |
| `seo_description`      | string             | Metadata description.                                                                       |
| `geo_summary`          | text               | GEO/local summary.                                                                          |
| `key_facts`            | text               | Concise answer-engine facts for the locale.                                                 |
| `image_alt_text`       | text               | Localized alt text for the primary image context.                                           |
| `og_title`             | string nullable    | Optional Open Graph title.                                                                  |
| `og_description`       | string nullable    | Optional Open Graph description.                                                            |
| `og_media_asset_id`    | string nullable    | FK to `media_assets.id`.                                                                    |
| `structured_data_json` | json nullable      | Generated or curated structured data.                                                       |
| `source_version`       | integer            | Version of source content used for translation.                                             |
| `published_at`         | timestamp nullable | Publication instant.                                                                        |
| `created_at`           | timestamp          | Creation instant.                                                                           |
| `updated_at`           | timestamp          | Last update instant.                                                                        |

Constraints:

- Unique `(experience_id, locale)`.
- Unique `(locale, slug)` for experience pages.
- `locale` must be supported.
- Public published/indexable content must be validated in domain/application
  before status becomes `READY` or `PUBLISHED`.
- Public publishable content requires summary, main content, SEO metadata, GEO
  summary, key facts, image alt text, and at least one complete FAQ.

Indexes:

- `localized_experience_contents_experience_id_idx` on `experience_id`.
- `localized_experience_contents_locale_status_idx` on `(locale, status)`.
- `localized_experience_contents_slug_idx` on `(locale, slug)`.

### `localized_experience_faqs`

Stores GEO/SEO FAQ rows for localized experience pages.

| Column                 | Type      | Notes                                     |
| ---------------------- | --------- | ----------------------------------------- |
| `id`                   | string    | Primary key.                              |
| `localized_content_id` | string    | FK to `localized_experience_contents.id`. |
| `question`             | text      | Localized question.                       |
| `answer`               | text      | Localized answer.                         |
| `position`             | integer   | Sorting order.                            |
| `created_at`           | timestamp | Creation instant.                         |
| `updated_at`           | timestamp | Last update instant.                      |

Constraints:

- `question` and `answer` must be non-empty before publication.
- Unique `(localized_content_id, position)`.

Indexes:

- `localized_experience_faqs_content_id_idx` on `localized_content_id`.

### `localized_routes`

Stores public route bindings by resource and locale.

| Column              | Type      | Notes                               |
| ------------------- | --------- | ----------------------------------- |
| `id`                | string    | Primary key.                        |
| `resource_type`     | string    | Example: `EXPERIENCE`.              |
| `resource_id`       | string    | Id of the target resource.          |
| `locale`            | string    | `en`, `es`, `ca`.                   |
| `path`              | string    | Full locale-aware path.             |
| `canonical_path`    | string    | Canonical path for this locale.     |
| `hreflang_group_id` | string    | Connects alternate locale versions. |
| `indexing_policy`   | string    | `INDEX` or `NOINDEX`.               |
| `status`            | string    | `DRAFT`, `PUBLISHED`, `ARCHIVED`.   |
| `created_at`        | timestamp | Creation instant.                   |
| `updated_at`        | timestamp | Last update instant.                |

Constraints:

- Unique `(locale, path)`.
- Unique `(resource_type, resource_id, locale)`.
- `path` must include locale prefix for public indexable pages.

Indexes:

- `localized_routes_resource_idx` on `(resource_type, resource_id)`.
- `localized_routes_hreflang_group_idx` on `hreflang_group_id`.

### `translation_sources`

Tracks source content versions so translated content can be marked outdated.

| Column          | Type      | Notes                             |
| --------------- | --------- | --------------------------------- |
| `id`            | string    | Primary key.                      |
| `resource_type` | string    | Example: `EXPERIENCE`.            |
| `resource_id`   | string    | Target resource id.               |
| `source_locale` | string    | Editorial source locale.          |
| `version`       | integer   | Monotonic source version.         |
| `source_hash`   | string    | Hash of meaningful source fields. |
| `created_at`    | timestamp | Creation instant.                 |

Constraints:

- Unique `(resource_type, resource_id, version)`.
- `version > 0`.

Indexes:

- `translation_sources_resource_idx` on `(resource_type, resource_id)`.

## Relaciones

- One experience can have one localized content row per locale.
- One localized content row has many FAQ rows.
- One localized route points to one public resource by type and id.
- Translation source versions are referenced logically by localized content.

## Notas Prisma

`structured_data_json` can be Prisma `Json`.

Route uniqueness should be enforced in persistence because it protects SEO and
canonical correctness.
