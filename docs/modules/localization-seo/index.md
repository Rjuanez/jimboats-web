# Localization SEO Module

## What It Is

Owns locale-aware public routing, translated slugs, metadata, canonical rules,
`hreflang`, sitemap generation, structured data, SEO, and GEO publication
discipline.

This module exists because editable backpanel text cannot be handled as static
translations only. Public pages must be explicit per locale and must protect
indexability.

The core rule is:

Public indexable content exists per locale. There is no silent fallback for SEO
or GEO pages.

If a public URL is available in a locale, that locale must have real route,
copy, metadata, structured data, and publication readiness.

Initial supported locales are `en`, `es`, and `ca`. Supported locales are
business configuration and should be manageable from the backpanel.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Localized Content | Entity | Locale-specific content for a resource such as an experience, page, extra, or notification template. |
| Localized Route | Entity | Public route binding a resource to locale, slug, canonical, and publication state. |
| Translation Source | Entity | Source version used to know when translations are outdated. |
| Localized Field | Value Object | One translated field with type, validation, and quality rules. |
| SEO Metadata | Value Object | Title, description, H1, canonical, Open Graph, and indexing flags. |
| GEO Metadata | Value Object | Factual summaries, FAQs, claims, and entity hints for AI answer engines. |
| Hreflang Set | Value Object | Alternate language URLs for a public page. |
| Structured Data Document | Value Object | JSON-LD or equivalent schema payload for SEO and GEO. |
| Translation Status | Value Object | Draft, needs translation, needs review, ready, published, outdated, or archived. |
| Indexing Policy | Value Object | Whether a localized page can be indexed and included in sitemap. |

## Use Case Candidates

- Create localized content.
- Update localized content.
- Mark translations outdated after source changes.
- Validate publishable localized content.
- Publish localized content.
- Resolve localized public route.
- Generate sitemap.
- Generate hreflang alternates.
- Generate structured data.

## Depends On

- [Content](../content/index.md), for editable pages.
- [Experience Catalog](../experience-catalog/index.md), for commercial public pages.
- [Notifications](../notifications/index.md), for transactional message templates.
- [Media](../media/index.md), for Open Graph and image metadata.
