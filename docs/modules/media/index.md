# Media Module

## What It Is

Owns uploaded or managed media assets, image variants, alt text, and processing
state.

Media is configurable from the backpanel. Public pages should read image asset
references and generated variant URLs from persisted media data, not hardcoded
paths in source code.

The initial catalog model supports one primary image for each public experience
and each public extra.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Media Asset | Entity | Original uploaded or managed image asset. |
| Media Variant | Entity | Public optimized version of an asset. |
| Media Processing Job | Entity | Worker job that generates optimized variants. |
| Media Status | Value Object | Processing, ready, failed, archived, or equivalent state. |
| Media Path | Value Object | Public or private filesystem path rules. |
| Alt Text | Value Object | Accessibility and SEO text for images. |
| Content Hash | Value Object | Immutable file identity for cacheable variants. |

## Use Case Candidates

- Register media asset.
- Upload media asset.
- Process media variants.
- Get public media asset.
- Archive media asset.
- Attach primary image to experience.
- Attach primary image to extra.

## Depends On

- [Shared](../shared/index.md), for IDs and time concepts.
- [Experience Catalog](../experience-catalog/index.md), for primary images on experiences and extras.
- [Localization SEO](../localization-seo/index.md), for localized alt text, Open Graph, and image metadata.
