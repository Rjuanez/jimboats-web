# Localized Content

> File name: `localized-content.entity.md`

## Purpose

Represents the locale-specific content for a resource managed by the product.

Examples of resources:

- Experience
- Extra
- Editable Page
- Notification Template
- Future Blog Post or FAQ

For public indexable pages, localized content is the source of truth for copy,
SEO metadata, GEO metadata, structured-data inputs, and publication readiness in
one locale.

## Identity

- `localizedContentId`: stable internal identifier.
- `resourceType`: type of resource being localized.
- `resourceId`: identifier of the resource being localized.
- `locale`: `LocaleCode`.

## Attributes

- `status`: `TranslationStatus`.
- `fields`: list of `LocalizedField` values.
- `seoMetadata`: `SeoMetadata` when the resource is public or indexable.
- `geoMetadata`: `GeoMetadata` when the resource is public or answer-engine
  relevant.
- `structuredData`: `StructuredDataDocument` when schema is required.
- `localizedRouteId`: route used when the resource has a public URL.
- `sourceVersion`: source version this translation was derived from.
- `contentHash`: hash of the localized fields for change detection.
- `reviewedAt`: when editorial review happened.
- `publishedAt`: when this locale became public.

## Invariants

- A resource can have at most one localized content document per locale.
- Public indexable localized content must not use silent fallback.
- `PUBLISHED` localized content must have valid localized fields required by its
  resource type.
- `PUBLISHED` localized content must have valid SEO metadata when it has a
  public route.
- `PUBLISHED` localized content must have valid GEO metadata when the resource
  is part of answer-engine strategy.
- If the source version changes, dependent translations must be reviewed or
  marked outdated.

## State

- `DRAFT`: being edited.
- `NEEDS_TRANSLATION`: missing required locale content.
- `NEEDS_REVIEW`: translated but not reviewed.
- `READY`: validated and publishable.
- `PUBLISHED`: visible according to its indexing policy.
- `OUTDATED`: source changed after this translation was created or reviewed.
- `ARCHIVED`: no longer used for new public output.

## Behavior

- Store translated fields for one locale.
- Validate required fields for a resource type.
- Attach SEO, GEO, and structured-data content.
- Move through translation and publication states.
- Detect when a source version makes the translation outdated.

## Relationships

- `LocaleCode`: defines the locale.
- `LocalizedRoute`: owns public path and canonical behavior.
- `TranslationSource`: provides source version and change detection.
- `LocalizedField`: stores each translated field.
- `SeoMetadata`: protects SEO readiness.
- `GeoMetadata`: protects GEO readiness.
- `StructuredDataDocument`: protects schema readiness.

## Domain Errors

- `LocalizedContentAlreadyExists`
- `LocalizedContentMissingRequiredField`
- `LocalizedContentFallbackNotAllowed`
- `LocalizedContentNotPublishable`
- `LocalizedContentOutdated`

## Open Questions

- Which resource types need GEO metadata at launch?
- Should transactional notification templates use the same status lifecycle as
  public pages?
