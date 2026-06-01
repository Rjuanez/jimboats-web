# Translation Status

> File name: `translation-status.vobj.md`

## Purpose

Represents the editorial and publication state of localized content.

## Value

- `DRAFT`: being edited.
- `NEEDS_TRANSLATION`: required fields are missing in this locale.
- `NEEDS_REVIEW`: translated content needs human review.
- `READY`: validated and publishable.
- `PUBLISHED`: visible according to route and indexing policy.
- `OUTDATED`: source changed after translation or review.
- `ARCHIVED`: no longer used for new public output.

## Creation Rules

- New localized content starts as `DRAFT` or `NEEDS_TRANSLATION`.
- `READY` requires all required fields and metadata checks to pass.
- `PUBLISHED` requires `READY` content and a publishable route when public.
- Source changes can move translated content to `OUTDATED`.
- Archived content cannot be served as current public content.

## Normalization

- Stored as uppercase enum-like values.

## Equality

Two translation statuses are equal when their status value is equal.

## Domain Errors

- `TranslationStatusInvalid`
- `TranslationStatusTransitionInvalid`

## Open Questions

- Should `OUTDATED` immediately unpublish a page, or keep it live while warning
  editors?
