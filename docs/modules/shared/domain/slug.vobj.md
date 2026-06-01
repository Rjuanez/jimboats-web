# Slug

> File name: `slug.vobj.md`

## Purpose

Represents an SEO-safe public route segment.

Slugs are critical for canonical URLs, localized routes, sitemap entries,
`hreflang`, and GEO-friendly public content.

## Value

- `value`: normalized slug segment.
- `locale`: optional `LocaleCode` when the slug is locale-specific.

## Creation Rules

- Must not be blank.
- Must be lowercase.
- Must use URL-safe route characters.
- Must not contain path separators.
- Must be unique in its route scope and locale.
- Must not silently fall back for indexable translated pages.

## Normalization

- Trim surrounding whitespace.
- Lowercase.
- Convert spaces to hyphens when generated from text.
- Remove or transliterate unsupported characters according to SEO rules.
- Collapse repeated hyphens.
- Trim leading and trailing hyphens.

## Equality

Two slugs are equal when normalized value and locale are equal.

## Domain Errors

- `SlugMissing`
- `SlugInvalid`
- `SlugAlreadyExists`
- `SlugLocaleUnsupported`

## Open Questions

- Which transliteration rules should be used for accented characters in Spanish
  and Catalan slugs?
