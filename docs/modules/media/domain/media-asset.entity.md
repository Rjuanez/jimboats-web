# Media Asset

> File name: `media-asset.entity.md`

## Purpose

Represents the original image uploaded or managed from the backpanel.

The media asset is the source from which public optimized variants are
generated.

## Identity

- `mediaAssetId`: stable internal identifier.

## Attributes

- `status`: uploaded, processing, ready, failed, or archived.
- `originalFileName`: original uploaded filename.
- `mimeType`: uploaded file MIME type.
- `contentHash`: immutable file identity for cache and duplicate detection.
- `originalStoragePath`: private path for the original file.
- `variants`: generated public `MediaVariant` records.
- `altText`: localized `AltText` values.
- `uploadedBy`: backpanel user who uploaded the asset.
- `uploadedAt`: upload time.

## Invariants

- Original file must be an accepted image type.
- Original file path is private by default.
- Public pages should use ready variants, not original uploads.
- A ready asset must have all required launch variants generated.
- Archived assets cannot be attached to newly published catalog items.
- Publicly attached assets should have alt text for supported public locales.

## State

- `UPLOADED`: original file is registered but variants are not complete.
- `PROCESSING`: worker is generating variants.
- `READY`: required variants are available for public rendering.
- `FAILED`: processing failed and asset is not publishable.
- `ARCHIVED`: no longer attachable for new public content.

## Behavior

- Register uploaded original image.
- Start processing.
- Mark ready when required variants exist.
- Mark failed with processing reason.
- Archive asset.

## Relationships

- `MediaVariant`: optimized public outputs generated from the asset.
- `MediaProcessingJob`: worker job that creates variants.
- `AltText`: localized accessibility and SEO text.
- `Experience`: can reference one ready asset as primary image.
- `Extra`: can reference one ready asset as primary image.

## Domain Errors

- `MediaAssetInvalidFile`
- `MediaAssetNotReady`
- `MediaAssetArchived`
- `MediaAssetMissingRequiredVariant`
- `MediaAssetAltTextMissing`

## Open Questions

- Which exact image formats are accepted at upload?
