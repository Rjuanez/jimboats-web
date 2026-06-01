# Experience Catalog Module

## What It Is

Owns the public catalog of boat experiences: packages, prices, durations,
included items, optional extras, and publication state.

This module is central for SEO and GEO because experience pages are likely to
be indexable commercial pages.

An experience defines what can be bought. It can also define when it can be
bought through its slot policy, but it does not decide whether the only boat is
actually free. Real availability is resolved by the Boat Calendar module.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Experience | Entity | A bookable public boat experience such as Party on Boat, Morning Breeze, or Romantic Proposal. |
| Extra | Entity | Optional add-on available for an experience. |
| Slot Policy | Value Object | Defines fixed or flexible slots for an experience. |
| Experience Price | Value Object | Amount, currency, and pricing display rules. |
| Capacity | Value Object | Passenger or group limit rules. |

## Use Case Candidates

- List public experiences.
- Get public experience detail.
- Create experience.
- Update experience.
- Publish experience.
- Archive experience.

## Depends On

- [Shared](../shared/index.md), for common IDs, money, and date/time concepts.
- [Media](../media/index.md), for public images.
- [Localization SEO](../localization-seo/index.md), for translated slugs, metadata, schema, and sitemap visibility.
