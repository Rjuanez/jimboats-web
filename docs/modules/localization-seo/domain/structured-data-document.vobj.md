# Structured Data Document

> File name: `structured-data-document.vobj.md`

## Purpose

Represents schema data for a localized public page.

Examples include organization, breadcrumb, service, product, offer, FAQ, and
experience-related schema.

## Value

- `schemaType`: schema family or root type.
- `locale`: `LocaleCode`.
- `payload`: structured schema payload.
- `sourceResourceType`: resource type used to build the schema.
- `sourceResourceId`: resource identifier used to build the schema.

## Creation Rules

- Payload must be valid structured data for the selected schema type.
- Payload must use the same locale as the page when text is included.
- Price, availability, and offer data must match the actual domain state.
- Public indexable pages must not use schema copied from another locale without
  review.

## Normalization

- Store deterministic key order when practical.
- Remove empty optional values.
- Keep generated values reproducible from domain data.

## Equality

Two structured data documents are equal when schema type, locale, source, and
normalized payload are equal.

## Domain Errors

- `StructuredDataInvalid`
- `StructuredDataLocaleMismatch`
- `StructuredDataSourceMismatch`

## Open Questions

- Which schema types are required for experience pages at launch?
