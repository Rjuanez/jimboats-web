# Hreflang Set

> File name: `hreflang-set.vobj.md`

## Purpose

Represents the alternate language URLs for one public page family.

## Value

- `canonicalRouteId`: localized route currently being rendered.
- `alternates`: locale and path pairs for published localized routes.
- `xDefaultPath`: optional default route for unspecified locales.

## Creation Rules

- Alternates must point only to published localized routes.
- Each alternate locale must be unique.
- Each alternate path must be canonical for that locale.
- Missing locale versions must not be included.
- Fallback content must not be represented as an alternate.

## Normalization

- Locale values are normalized through `LocaleCode`.
- Paths are stored without domain unless absolute URLs are required by the
  output format.

## Equality

Two hreflang sets are equal when canonical route and alternates are equal.

## Domain Errors

- `HreflangAlternateInvalid`
- `HreflangDuplicateLocale`
- `HreflangRouteNotPublished`

## Open Questions

- Should `x-default` point to English, Spanish, or a locale selector?
