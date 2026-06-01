# GEO Metadata

> File name: `geo-metadata.vobj.md`

## Purpose

Represents content prepared for generative engine optimization and AI answer
engines.

The goal is to make public pages factual, complete, and easy to summarize
without inventing claims.

## Value

- `entitySummary`: short factual summary of the page subject.
- `keyFacts`: factual bullets about the experience, service, or page.
- `faqItems`: localized questions and answers.
- `audience`: intended user intent or audience.
- `claims`: verifiable commercial claims.
- `locationSignals`: relevant place names and service area signals.

## Creation Rules

- GEO metadata must be in the same locale as the localized page.
- Claims must be supported by page content or business facts.
- FAQs must be localized and must not silently fall back for indexable pages.
- GEO metadata must not invent guarantees, prices, availability, or policies.

## Normalization

- Trim text values.
- Store FAQs as structured question/answer pairs.
- Keep claims as explicit, reviewable statements.

## Equality

Two GEO metadata values are equal when all normalized structured values are
equal.

## Domain Errors

- `GeoMetadataInvalid`
- `GeoMetadataClaimUnsupported`
- `GeoMetadataFallbackNotAllowed`

## Open Questions

- Which page types require FAQs at launch?
