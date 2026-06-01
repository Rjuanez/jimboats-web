# Upload Media Asset

> File name: `upload-media-asset.use-case.md`

## Purpose

Register an uploaded image from the backpanel and queue processing for public
variants.

## Actor

- Backpanel user.

## Command Or Query

- `file`: uploaded image file.
- `altText`: optional localized alt text values.
- `uploadedBy`: backpanel user uploading the image.

## Response

- `mediaAssetId`: created asset.
- `status`: expected to be `UPLOADED` or `PROCESSING`.

## Ports

- `MediaAssetRepository`
- `MediaStorage`
- `MediaProcessingQueue`
- `Clock`

## Rules

- File must be an accepted image type.
- Original file is stored privately.
- Media asset is persisted before processing.
- Processing job is queued after registration.
- Public pages must not use the original upload directly.

## Side Effects

- Stores original file.
- Persists media asset.
- Queues media processing job.

## Application Errors

- `MediaAssetInvalidFile`
- `MediaUploadFailed`
- `MediaProcessingQueueUnavailable`

## SEO And GEO Impact

- Alt text can affect accessibility, SEO, and GEO once the asset is used on
  public pages.

## Open Questions

- Should duplicate content hashes reuse existing media assets?
