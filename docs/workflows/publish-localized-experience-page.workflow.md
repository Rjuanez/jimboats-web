# Publish Localized Experience Page

> File name: `publish-localized-experience-page.workflow.md`

## Purpose

Describe how an experience becomes a public indexable page in one locale while
protecting SEO, GEO, canonical URLs, `hreflang`, sitemap, and translation
quality.

## Participating Modules

- Experience Catalog
- Localization SEO
- Media

## Trigger

A backpanel user wants to publish or update an experience page for a specific
locale.

## Steps

1. Experience Catalog confirms the experience exists and is commercially
   publishable.
2. Localization SEO loads or creates `LocalizedContent` for the experience and
   locale.
3. Editor fills required localized fields: title, summary, description, H1, and
   any required FAQs or page blocks.
4. Editor defines localized SEO metadata.
5. Editor defines GEO metadata for answer-engine quality.
6. Editor defines or confirms structured-data inputs.
7. Localization SEO creates or validates `LocalizedRoute` with locale slug,
   canonical path, and indexing policy.
8. Media validates required public images and Open Graph image.
9. Localization SEO validates the localized content as publishable.
10. Localization SEO publishes the localized content and route.
11. Hreflang alternates are regenerated using only published locale variants.
12. Sitemap entries are regenerated for routes allowed by indexing policy.

## Failure And Compensation

- If required localized fields are missing, publication is blocked.
- If SEO metadata is missing, publication is blocked for indexable pages.
- If GEO metadata is required and missing, publication is blocked or marked with
  a warning according to page-type policy.
- If slug is already taken, publication is blocked until a unique slug is
  chosen.
- If source content changes after translation, the localized page becomes
  `OUTDATED` or `NEEDS_REVIEW` according to policy.

## Consistency Rules

- Public indexable pages must not render fallback content.
- A locale can be published independently from other locales.
- Hreflang alternates include only published localized routes.
- Sitemap includes only published and indexable routes.
- Canonical path is always explicit for indexable routes.

## Events

- `LocalizedContentCreated`
- `LocalizedContentUpdated`
- `LocalizedContentValidated`
- `LocalizedContentPublished`
- `TranslationsMarkedOutdated`
- `SitemapRegenerated`

## SEO And GEO Impact

- This workflow is the main gate for public localized experience pages.
- The published URL becomes eligible for indexing only after localized content,
  metadata, route, schema, and indexing policy pass validation.

## Open Questions

- Which fields are required for each experience page type?
- Should GEO metadata be mandatory on day one or introduced as a readiness
  level?
