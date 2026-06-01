# Resolve Localized Public Route

> File name: `resolve-localized-public-route.use-case.md`

## Purpose

Resolve a public path into localized content that can be rendered.

## Actor

- Public web request.
- Static generation or cache warmup process.

## Command Or Query

- `locale`: requested `LocaleCode`.
- `path`: requested path.

## Response

- `localizedRoute`: resolved route.
- `localizedContent`: content for the requested locale.
- `seoMetadata`: metadata for the requested locale.
- `hreflangSet`: alternates for the page family.
- `structuredData`: structured data for the requested locale.

## Ports

- `LocalizedRouteRepository`
- `LocalizedContentRepository`
- `HreflangGenerator`

## Rules

- Only published routes can resolve publicly.
- Requested locale must be supported.
- Public indexable routes must return content in the requested locale.
- No silent fallback is allowed for indexable public pages.
- Non-indexable private routes should be owned by their own modules, not by this
  public resolver.

## Side Effects

- None.

## Application Errors

- `LocalizedRouteNotFound`
- `LocalizedContentNotPublished`
- `LocaleCodeUnsupported`
- `LocalizedContentFallbackNotAllowed`

## SEO And GEO Impact

- Controls public rendering of canonical localized pages.
- Protects route resolution from serving the wrong locale to search engines or
  answer engines.

## Open Questions

- Should unknown locale paths redirect to a default locale or return not found?
