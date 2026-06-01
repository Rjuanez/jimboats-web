# Publish Localized Content

> File name: `publish-localized-content.use-case.md`

## Purpose

Publish one localized content document and its public route.

## Actor

- Backpanel user.

## Command Or Query

- `localizedContentId`: content to publish.
- `route`: localized route configuration when not already present.
- `indexingPolicy`: desired indexing behavior.

## Response

- `localizedContentId`: published content.
- `localizedRouteId`: published route.
- `status`: expected to be `PUBLISHED`.
- `path`: public localized path.

## Ports

- `LocalizedContentRepository`
- `LocalizedRouteRepository`
- `SitemapPublisher`
- `HreflangGenerator`
- `Clock`

## Rules

- Content must pass publishable validation.
- Public indexable content must not use fallback.
- Route slug must be unique within locale and route scope.
- Canonical path must be explicit.
- Hreflang alternates can include only published localized routes.
- Sitemap inclusion follows `IndexingPolicy`.

## Side Effects

- Publishes localized content.
- Publishes or updates localized route.
- May update sitemap and route cache.
- May emit `LocalizedContentPublished`.

## Application Errors

- `LocalizedContentNotPublishable`
- `LocalizedRouteSlugTaken`
- `LocalizedRouteCanonicalMissing`
- `IndexingPolicyInvalid`

## SEO And GEO Impact

- Creates or updates an indexable public URL when indexing policy allows it.
- Updates canonical, sitemap, hreflang, structured data, and GEO-visible public
  content.

## Open Questions

- Should publishing be immediate or go through scheduled publication windows?
