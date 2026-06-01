# Translation Source

> File name: `translation-source.entity.md`

## Purpose

Represents the source content version used to create or review localized
content.

When source content changes, related translations can be marked as outdated or
needing review.

## Identity

- `translationSourceId`: stable internal identifier.
- `resourceType`: source resource type.
- `resourceId`: source resource identifier.
- `sourceLocale`: `LocaleCode` used as the source language.

## Attributes

- `sourceVersion`: monotonically changing source version.
- `sourceFields`: fields used as translation source.
- `contentHash`: hash of source fields.
- `updatedAt`: when source content changed.
- `changedBy`: actor that changed the source.

## Invariants

- A translation source belongs to exactly one resource and source locale.
- Source version must change when source fields change.
- Content hash must change when normalized source fields change.
- Localized content derived from an older source version is not fully current.

## State

- `CURRENT`: source version is the latest for the resource.
- `SUPERSEDED`: newer source version exists.

## Behavior

- Capture source content version.
- Detect source changes.
- Mark dependent translations as outdated or needing review.

## Relationships

- `LocalizedContent`: records the source version used for translation.
- `LocaleCode`: defines the source locale.
- `LocalizedField`: can be used as source field shape.

## Domain Errors

- `TranslationSourceMissing`
- `TranslationSourceVersionConflict`
- `TranslationSourceLocaleUnsupported`

## Open Questions

- Is the source locale always one global locale, or can each resource choose its
  own source locale?
