# Media Asset Detail Screen

> File name: `media-asset-detail.screen.md`

## Purpose

Inspect one media asset, its processing lifecycle, generated variants, alt text,
and usage across experiences or extras.

## User

- `ADMIN`
- `STAFF`

## Data Shown

- Original file metadata.
- Current media status.
- Processing job history.
- Generated variants with dimensions and public paths.
- Localized alt text.
- Attached experiences.
- Attached extras.
- Last processing error.
- Audit entries.

## Actions

- Edit localized alt text.
- Retry processing.
- Archive asset.
- Attach to experience as primary image.
- Attach to extra as primary image.
- Open attached experience or extra.

## States

- Loading asset.
- Uploaded but not processed.
- Processing.
- Ready.
- Failed.
- Archived.
- Save error.

## Domain Rules

- Asset must be `READY` before it can be used as a published primary image.
- Public variants must have dimensions for layout stability.
- Original upload remains private.
- Public visible assets should have alt text for `en`, `es`, and `ca`.
- Attaching or replacing a primary image must create an audit entry.

## Permissions

- `ADMIN` and `STAFF` can edit alt text and attach at launch.
- Archive may become admin-only later.

## Open Questions

- Which variant keys should be shown in the first implementation?
- Should staff be allowed to attach an asset before all alt text is complete?
