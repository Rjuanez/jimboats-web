# Media Variant

> File name: `media-variant.entity.md`

## Purpose

Represents an optimized public image generated from a media asset.

Variants let the public website load the right image size and format for each
use case without hardcoded paths.

## Identity

- `mediaVariantId`: stable internal identifier.

## Attributes

- `mediaAssetId`: source asset.
- `variantKey`: usage key such as card, detail, mobile, thumbnail, or open graph.
- `format`: output image format.
- `width`: output width.
- `height`: output height.
- `publicPath`: public path or URL for rendering.
- `contentHash`: immutable variant identity.
- `generatedAt`: generation time.

## Invariants

- Variant must belong to exactly one media asset.
- Public path must not point to the private original upload.
- Variant dimensions must match the configured variant key.
- Content hash should change when generated output changes.

## State

- Variants are immutable after generation by default.
- New processing creates new variants rather than mutating old public outputs
  when cache safety matters.

## Behavior

- Provide public render path.
- Provide dimensions for layout stability.
- Support cacheable public image rendering.

## Relationships

- `MediaAsset`: owns the source image and required variants.

## Domain Errors

- `MediaVariantInvalid`
- `MediaVariantPathInvalid`
- `MediaVariantDimensionsInvalid`

## Open Questions

- Which launch variant keys are required for cards, detail pages, mobile, and
  Open Graph?
