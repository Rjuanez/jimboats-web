# Audit Entry

> File name: `audit-entry.entity.md`

## Purpose

Records important backpanel changes for traceability.

Audit matters when staff change bookings, payments, cancellation rules,
availability, publication state, notification templates, or commercial
configuration.

## Identity

- `auditEntryId`: stable internal identifier.

## Attributes

- `actorUserId`: backpanel user who performed the action.
- `action`: action name.
- `resourceType`: changed resource type.
- `resourceId`: changed resource identifier.
- `beforeValue`: optional previous value.
- `afterValue`: optional new value.
- `reason`: optional staff reason.
- `createdAt`: when the action happened.

## Invariants

- Audit entries are append-only.
- Actor, action, resource type, and timestamp are required.
- Sensitive values must be redacted or summarized.

## State

- Audit entries do not have a lifecycle state by default.

## Behavior

- Record operational change.
- Provide change history for support and accountability.

## Relationships

- `BackpanelUser`: actor who made the change.
- Operational modules: provide changed resource references.

## Domain Errors

- `AuditEntryInvalid`
- `AuditEntrySensitiveValueNotAllowed`

## Open Questions

- How long should audit entries be retained?
