# Process Media Variants

> File name: `process-media-variants.use-case.md`

## Purpose

Generate optimized image variants for an uploaded media asset.

## Actor

- Media worker.

## Command Or Query

- `mediaProcessingJobId`: job to process.

## Response

- `mediaAssetId`: processed asset.
- `generatedVariantIds`: generated variants.
- `status`: resulting asset status.

## Ports

- `MediaAssetRepository`
- `MediaVariantRepository`
- `MediaStorage`
- `ImageProcessor`
- `Clock`

## Rules

- Job must be pending or retryable.
- Required variants must be generated before asset becomes `READY`.
- Generated variants must store dimensions and public paths.
- Original upload remains private.
- Processing failure must be recorded with enough detail for backpanel support.

## Side Effects

- Reads original file.
- Writes optimized public variants.
- Persists media variants.
- Updates processing job status.
- Updates media asset status.

## Application Errors

- `MediaProcessingJobNotFound`
- `MediaAssetNotFound`
- `MediaProcessingJobAlreadyRunning`
- `MediaVariantGenerationFailed`

## SEO And GEO Impact

- Ready variants enable stable public rendering, Open Graph images, and
  indexable visual content.

## Open Questions

- Which image processor and storage backend will be used in production?
