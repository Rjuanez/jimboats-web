# Backpanel Role

> File name: `backpanel-role.vobj.md`

## Purpose

Represents the staff role used by the backpanel.

## Value

- `ADMIN`
- `STAFF`

## Creation Rules

- Role must be one of the supported values.
- `ADMIN` and `STAFF` can share most permissions at launch.
- The role model must exist even if permissions are initially similar.

## Normalization

- Stored as uppercase enum-like values.

## Equality

Two backpanel roles are equal when their role value is equal.

## Domain Errors

- `BackpanelRoleUnsupported`

## Open Questions

- Which operations should become admin-only after launch?
