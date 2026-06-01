# Localized Route

> File name: `localized-route.entity.md`

## Purpose

Represents the public URL binding for one resource in one locale.

The route owns the localized slug, canonical path, `hreflang` membership,
indexing policy, and sitemap visibility.

## Identity

- `localizedRouteId`: stable internal identifier.

## Attributes

- `resourceType`: type of resource exposed by the route.
- `resourceId`: resource exposed by the route.
- `locale`: `LocaleCode`.
- `slug`: `Slug`.
- `path`: full locale-aware path.
- `canonicalPath`: canonical path for this locale.
- `hreflangGroupId`: group that connects alternate locale versions.
- `indexingPolicy`: `IndexingPolicy`.
- `publishedAt`: when the route became public.

## Invariants

- A public route must have exactly one locale.
- Slug must be unique inside its route scope and locale.
- Canonical path must be explicit for indexable routes.
- Sitemap includes only routes allowed by indexing policy and publication state.
- `hreflang` alternates must point only to published localized routes.
- A localized public route must not render fallback content for indexable pages.

## State

- `DRAFT`: not public.
- `READY`: valid but not published.
- `PUBLISHED`: resolvable publicly.
- `ARCHIVED`: no longer resolvable as current content.

## Behavior

- Reserve or update localized slug.
- Resolve public route by locale and path.
- Provide canonical path.
- Provide hreflang group membership.
- Decide sitemap inclusion through indexing policy.

## Relationships

- `LocalizedContent`: supplies copy, metadata, and publication readiness.
- `Slug`: protects route segment quality.
- `LocaleCode`: protects supported locale.
- `IndexingPolicy`: controls indexability and sitemap inclusion.
- `HreflangSet`: generated from routes in the same group.

## Domain Errors

- `LocalizedRouteAlreadyExists`
- `LocalizedRouteSlugTaken`
- `LocalizedRouteNotPublishable`
- `LocalizedRouteCanonicalMissing`
- `LocalizedRouteFallbackNotAllowed`

## Open Questions

- Should archived routes redirect to a replacement route or return not found?
