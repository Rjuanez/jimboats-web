# Attach Primary Image To Experience

> File name: `attach-primary-image-to-experience.use-case.md`

## Purpose

Attach one ready media asset as the primary image for an experience.

## Actor

- Backpanel user.

## Command Or Query

- `experienceId`: experience to update.
- `mediaAssetId`: ready media asset to attach.
- `updatedBy`: backpanel user making the change.

## Response

- `experienceId`: updated experience.
- `primaryImageId`: attached media asset.

## Ports

- `ExperienceRepository`
- `MediaAssetRepository`
- `AuditLog`
- `Clock`

## Rules

- Media asset must be `READY`.
- Media asset must not be archived.
- Experience has one primary image for launch.
- A published experience must have a ready primary image.
- Change must be audited.

## Side Effects

- Updates experience primary image.
- Records audit entry.

## Application Errors

- `ExperienceNotFound`
- `MediaAssetNotFound`
- `MediaAssetNotReady`
- `MediaAssetArchived`

## SEO And GEO Impact

- Primary image affects public rendering, Open Graph, and visual quality for SEO
  and GEO.

## Open Questions

- Should replacing a published primary image require review before going live?
