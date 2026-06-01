# Attach Primary Image To Extra

> File name: `attach-primary-image-to-extra.use-case.md`

## Purpose

Attach one ready media asset as the primary image for an extra.

## Actor

- Backpanel user.

## Command Or Query

- `extraId`: extra to update.
- `mediaAssetId`: ready media asset to attach.
- `updatedBy`: backpanel user making the change.

## Response

- `extraId`: updated extra.
- `primaryImageId`: attached media asset.

## Ports

- `ExtraRepository`
- `MediaAssetRepository`
- `AuditLog`
- `Clock`

## Rules

- Media asset must be `READY`.
- Media asset must not be archived.
- Extra has one primary image for launch.
- A public visible extra should have a ready primary image.
- Change must be audited.

## Side Effects

- Updates extra primary image.
- Records audit entry.

## Application Errors

- `ExtraNotFound`
- `MediaAssetNotFound`
- `MediaAssetNotReady`
- `MediaAssetArchived`

## SEO And GEO Impact

- Extra primary image affects public rendering and buyer confidence.

## Open Questions

- Should every active extra require a primary image, or only extras shown on
  public pages?
