# Configurable Setting

> File name: `configurable-setting.entity.md`

## Purpose

Represents an operational setting managed from the backpanel instead of source
code.

This entity is a generic boundary for configuration that does not yet have a
more specific domain owner. When a setting becomes rich enough, it should move
into its owning module as a proper entity or value object.

## Identity

- `settingId`: stable internal identifier.
- `key`: unique setting key.

## Attributes

- `key`: unique machine-readable setting name.
- `value`: structured setting value.
- `ownerModule`: module that owns the business meaning.
- `version`: current version.
- `updatedBy`: backpanel user who last changed the setting.
- `updatedAt`: last change time.

## Invariants

- Setting key must be unique.
- Setting value must be validated by the owning module before activation.
- Changes to important settings must be audited.
- Configurable settings must not bypass module invariants.

## State

- `DRAFT`: setting value is being edited.
- `ACTIVE`: setting value is used by the system.
- `ARCHIVED`: setting value is no longer active.

## Behavior

- Update setting value.
- Validate through owning module.
- Activate setting version.
- Archive old setting versions.

## Relationships

- `BackpanelUser`: changes settings.
- `AuditEntry`: records setting changes.
- Owning module: validates and interprets the setting.

## Domain Errors

- `ConfigurableSettingInvalid`
- `ConfigurableSettingKeyTaken`
- `ConfigurableSettingOwnerMissing`

## Open Questions

- Which settings deserve first-class screens instead of a generic settings UI?
