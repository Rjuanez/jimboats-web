# Update Localized Content

> File name: `update-localized-content.use-case.md`

## Purpose

Update translated fields, SEO metadata, GEO metadata, or structured data for one
localized content document.

## Actor

- Backpanel user.

## Command Or Query

- `localizedContentId`: content to update.
- `fields`: localized fields to replace or patch.
- `seoMetadata`: optional SEO metadata update.
- `geoMetadata`: optional GEO metadata update.
- `structuredData`: optional structured data update.

## Response

- `localizedContentId`: updated content.
- `status`: resulting translation status.
- `validationWarnings`: non-blocking warnings, if any.

## Ports

- `LocalizedContentRepository`
- `LocalizedRouteRepository`
- `Clock`

## Rules

- Updated fields must satisfy `LocalizedField` rules.
- Public indexable content must not use silent fallback.
- If a published page becomes invalid, the system must either block the update
  or move it to a non-publishable state according to the chosen policy.
- Updating content after source changes can move status from `OUTDATED` to
  `NEEDS_REVIEW` or `READY`.

## Side Effects

- Persists updated localized content.
- May recalculate content hash.
- May emit `LocalizedContentUpdated`.

## Application Errors

- `LocalizedContentNotFound`
- `LocalizedFieldInvalid`
- `SeoMetadataInvalid`
- `GeoMetadataInvalid`
- `StructuredDataInvalid`

## SEO And GEO Impact

- Can affect public metadata, schema, answer-engine quality, and indexability.
- Published routes must never start serving fallback content as a result of the
  update.

## Open Questions

- Should updates to published localized content require review before going
  live?
