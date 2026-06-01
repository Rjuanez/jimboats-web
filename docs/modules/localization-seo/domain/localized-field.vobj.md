# Localized Field

> File name: `localized-field.vobj.md`

## Purpose

Represents one translated field for one locale.

Examples:

- `title`
- `summary`
- `description`
- `h1`
- `faqQuestion`
- `faqAnswer`
- `emailSubject`
- `emailBody`

## Value

- `fieldKey`: stable field name.
- `fieldType`: short text, long text, rich text, markdown, plain text, or list.
- `value`: translated value.
- `qualityState`: optional editorial quality marker.

## Creation Rules

- Field key must be known for the resource type.
- Required fields must not be blank.
- Value must satisfy field type rules.
- Value must satisfy configured minimum and maximum length when defined.
- Rich text and markdown must reject unsafe content.
- Public indexable fields must be real localized content, not silent fallback.

## Normalization

- Trim plain text and short text.
- Preserve intentional paragraph structure for long text and rich text.
- Normalize unsafe or unsupported markup according to field type rules.

## Equality

Two localized fields are equal when field key, field type, and normalized value
are equal.

## Domain Errors

- `LocalizedFieldMissing`
- `LocalizedFieldInvalid`
- `LocalizedFieldTooShort`
- `LocalizedFieldTooLong`
- `LocalizedFieldFallbackNotAllowed`

## Open Questions

- Which fields should allow markdown, and which must stay plain text?
