# Alt Text

> File name: `alt-text.vobj.md`

## Purpose

Represents localized alternative text for an image.

Alt text supports accessibility, SEO, and GEO. It should describe the useful
content of the image without stuffing keywords.

## Value

- `locale`: `LocaleCode`.
- `text`: localized alt text.

## Creation Rules

- Public assets should have alt text for supported public locales.
- Text must not be blank when required for publication.
- Text must be in the selected locale.
- Text should describe the actual image.
- Text must not contain HTML.

## Normalization

- Trim surrounding whitespace.
- Collapse accidental repeated whitespace.

## Equality

Two alt text values are equal when locale and normalized text are equal.

## Domain Errors

- `AltTextMissing`
- `AltTextInvalid`
- `AltTextLocaleUnsupported`

## Open Questions

- Should alt text be mandatory for all public media or only for indexable pages?
