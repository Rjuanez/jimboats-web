# Backpanel User

> File name: `backpanel-user.entity.md`

## Purpose

Represents a staff user who can access the operational backpanel.

## Identity

- `backpanelUserId`: stable internal identifier.

## Attributes

- `email`: staff `EmailAddress`.
- `name`: staff `PersonName`.
- `role`: `BackpanelRole`.
- `status`: active, invited, suspended, or archived.
- `lastLoginAt`: optional last login time.

## Invariants

- A backpanel user must have exactly one role.
- Suspended or archived users cannot perform operational changes.
- Staff actions that affect booking, payment, availability, publication, or
  templates should create audit entries.

## State

- `INVITED`: user has been invited but has not activated access.
- `ACTIVE`: user can use the backpanel.
- `SUSPENDED`: user cannot access the backpanel.
- `ARCHIVED`: historical user record.

## Behavior

- Assign role.
- Activate user.
- Suspend user.
- Record operational actions through audit entries.

## Relationships

- `BackpanelRole`: controls initial permission group.
- `AuditEntry`: records important changes made by the user.

## Domain Errors

- `BackpanelUserNotActive`
- `BackpanelUserRoleMissing`
- `BackpanelUserPermissionDenied`

## Open Questions

- Which authentication provider will be used for staff login?
