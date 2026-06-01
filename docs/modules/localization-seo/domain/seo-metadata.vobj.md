# SEO Metadata

> File name: `seo-metadata.vobj.md`

## Purpose

Represents the SEO metadata required by one localized public page.

## Value

- `title`: localized page title.
- `description`: localized meta description.
- `h1`: localized primary heading.
- `canonicalPath`: canonical route path.
- `ogTitle`: localized Open Graph title.
- `ogDescription`: localized Open Graph description.
- `ogImageId`: media asset used for social previews.
- `indexingPolicy`: `IndexingPolicy`.

## Creation Rules

- Indexable pages must have title, description, H1, and canonical path.
- Metadata must be in the same locale as the page.
- Public metadata must not silently fall back to another locale.
- Title and description should satisfy length guidance for search previews.
- Open Graph fields may fall back only when fallback is explicit and allowed.

## Normalization

- Trim text values.
- Collapse accidental repeated whitespace.
- Store canonical path without domain.

## Equality

Two SEO metadata values are equal when all normalized fields are equal.

## Domain Errors

- `SeoMetadataMissing`
- `SeoMetadataInvalid`
- `SeoMetadataFallbackNotAllowed`
- `SeoMetadataCanonicalMissing`

## Open Questions

- Should Open Graph fields be mandatory for every published route?
