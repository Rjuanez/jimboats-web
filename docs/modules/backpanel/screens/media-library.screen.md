# Media Library Screen

> File name: `media-library.screen.md`

## Purpose

Let staff browse uploaded media assets, inspect processing status, and start new
uploads.

## User

- `ADMIN`
- `STAFF`

## Data Shown

- Asset thumbnail when a ready variant exists.
- Original filename.
- Media status.
- Variant readiness.
- Alt text completeness.
- Usage count.
- Upload date.
- Last processing error when failed.

## Actions

- Upload media.
- Open media asset detail.
- Filter by status.
- Filter by missing alt text.
- Filter by failed processing.
- Archive unused asset.
- Retry processing for failed asset.

## States

- Loading library.
- Empty library.
- Normal grid or list.
- Processing assets visible.
- Failed assets visible.
- Error loading media.

## Domain Rules

- Media assets are configurable from the backpanel.
- Public pages should use ready variants, not original uploads.
- Original uploads are private.
- Failed processing must be visible to staff.
- Archiving an asset should not break already published content without
  validation.

## Permissions

- `ADMIN` and `STAFF` can upload and inspect at launch.
- Archive may become admin-only later.

## Open Questions

- Should media default to grid, table, or both?
- Should duplicate uploads be detected by content hash?
