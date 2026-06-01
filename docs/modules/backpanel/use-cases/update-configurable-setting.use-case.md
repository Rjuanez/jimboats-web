# Update Configurable Setting

> File name: `update-configurable-setting.use-case.md`

## Purpose

Update an operational setting from the backpanel while preserving module
validation and auditability.

## Actor

- Backpanel user.

## Command Or Query

- `key`: setting key.
- `value`: structured setting value.
- `updatedBy`: backpanel user making the change.
- `reason`: optional reason for the change.

## Response

- `settingId`: updated setting.
- `version`: new setting version.
- `status`: resulting setting status.

## Ports

- `ConfigurableSettingRepository`
- `OwningModuleValidator`
- `AuditLog`
- `Clock`

## Rules

- Actor must be active and allowed to update the setting.
- Owning module must validate the value before activation.
- Important setting changes must create audit entries.
- Updating configuration must not bypass domain invariants.

## Side Effects

- Persists setting version.
- Records audit entry.
- May emit `ConfigurableSettingUpdated`.

## Application Errors

- `BackpanelUserPermissionDenied`
- `ConfigurableSettingInvalid`
- `ConfigurableSettingOwnerMissing`

## SEO And GEO Impact

- Depends on the setting. Publication, locale, route, SEO, and GEO settings can
  affect public indexability and must be validated by Localization SEO.

## Open Questions

- Which launch settings should use dedicated screens instead of this generic
  flow?
