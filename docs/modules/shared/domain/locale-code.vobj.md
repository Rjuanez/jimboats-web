# Locale Code

> File name: `locale-code.vobj.md`

## Purpose

Represents a locale supported by public content, checkout, buyer access, and
transactional notifications.

This is important for SEO, GEO, `hreflang`, sitemap entries, and buyer-critical
messages.

## Value

- `value`: supported locale code. Launch locales are `en`, `es`, and `ca`.

## Creation Rules

- Must be one of the supported locales configured for the product.
- Initial supported locales are `en`, `es`, and `ca`.
- Must not silently fall back for indexable public content.
- Transactional content may use explicit fallback only when the business accepts
  the fallback for that message type.

## Normalization

- Trim surrounding whitespace.
- Store in lowercase canonical form.
- Normalize separators consistently if regional locales are introduced later.

## Equality

Two locale codes are equal when their normalized locale value is equal.

## Domain Errors

- `LocaleCodeUnsupported`
- `LocaleCodeMissing`
- `LocaleFallbackNotAllowed`

## Open Questions

- Which locales should be added after launch?
