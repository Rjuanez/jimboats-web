# Content Module

## What It Is

Owns editable editorial content that can be created or changed from the
backpanel.

This module cares about publication state, content structure, and editorial
quality. SEO-specific metadata and locale routing are coordinated with
[Localization SEO](../localization-seo/index.md).

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Editable Page | Entity | A public or private page managed from the backpanel. |
| Content Block | Entity | A structured block inside editable content. |
| Publication Status | Value Object | Draft, review, published, archived, or equivalent state. |
| Editorial Quality | Value Object | Readiness rules before public publication. |

## Use Case Candidates

- Create editable page.
- Update editable page.
- Publish editable page.
- Archive editable page.
- Get public page content.

## Depends On

- [Media](../media/index.md), when content references images.
- [Localization SEO](../localization-seo/index.md), when content is public and indexable.

