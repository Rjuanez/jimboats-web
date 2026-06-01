# Validate Publishable Localized Content

> File name: `validate-publishable-localized-content.use-case.md`

## Purpose

Check whether localized content can be published for one locale.

## Actor

- Backpanel user.
- Publish workflow.
- Automated quality check.

## Command Or Query

- `localizedContentId`: localized content to validate.

## Response

- `isPublishable`: whether publication is allowed.
- `blockingIssues`: issues that prevent publishing.
- `warnings`: issues that should be reviewed but do not necessarily block.

## Ports

- `LocalizedContentRepository`
- `LocalizedRouteRepository`
- `MediaRepository`

## Rules

- Required localized fields must be present.
- Public indexable content must not use silent fallback.
- SEO metadata must be complete for public indexable routes.
- GEO metadata must be complete for page types that require it.
- Structured data must be valid when required by page type.
- Route slug must be valid and unique.
- Canonical path must be defined.
- Open Graph media must be valid when required.

## Side Effects

- None by default.
- May persist validation report if the backpanel needs audit history.

## Application Errors

- `LocalizedContentNotFound`
- `LocalizedRouteNotFound`
- `MediaAssetNotFound`

## SEO And GEO Impact

- This use case is the gatekeeper before a localized page can become indexable.

## Open Questions

- Should validation include automated content quality scoring, or only hard
  structural rules?
