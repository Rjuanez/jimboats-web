# Indexing Policy

> File name: `indexing-policy.vobj.md`

## Purpose

Represents whether a localized public route can be indexed and included in
discovery outputs.

## Value

- `indexable`: whether search engines may index the route.
- `includeInSitemap`: whether the route should appear in sitemap.
- `followLinks`: whether crawlers should follow links from the page.
- `reason`: optional explanation when non-indexable.

## Creation Rules

- Sitemap inclusion requires `indexable`.
- Buyer access, checkout, payment return, and private booking pages must not be
  indexable.
- Public commercial pages can be indexable only when localized content is
  publishable and not fallback.

## Normalization

- Store booleans explicitly.
- Store reason as trimmed text when present.

## Equality

Two indexing policies are equal when all normalized values are equal.

## Domain Errors

- `IndexingPolicyInvalid`
- `SitemapRequiresIndexableRoute`

## Open Questions

- Should draft preview routes always be noindex, even behind authentication?
