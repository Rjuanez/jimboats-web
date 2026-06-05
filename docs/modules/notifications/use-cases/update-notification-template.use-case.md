# Update Notification Template

> File name: `update-notification-template.use-case.md`

## Purpose

Edit notification template metadata and localized email/WhatsApp copy from the
backpanel.

## Actor

- `ADMIN`
- `STAFF` if allowed by future permission policy.

## Command Or Query

- `templateId`
- `notificationType`
- `eventType`
- `channel`
- `allowedVariables`
- `requiredVariables`
- `status`
- `translations`
  - `locale`
  - `status`
  - `subject`
  - `previewText`
  - `body`
- `updatedByUserId`

## Response

- Updated template DTO.
- Validation report by locale.

## Ports

- `NotificationTemplateRepository`
- `TemplateVariableValidator`
- `AuditRepository`
- `Clock`

## Rules

- Email translations require `subject` before publishing.
- WhatsApp translations ignore `subject`.
- Published translations require non-empty body.
- All used variables must be allowed by the template.
- Required variables must be present before a translation can publish.
- Active templates should keep at least one published translation.
- Template changes are versioned for rendering traceability.
- Publishing or archiving translations creates audit entries.

## Side Effects

- Persists template and translations.
- Records audit entry for important template changes.

## Application Errors

- `NotificationTemplateNotFound`
- `NotificationTemplateInvalid`
- `NotificationTemplateVariableInvalid`
- `NotificationTemplateSubjectRequired`

## Open Questions

- Should published translations become immutable snapshots, with edits creating
  a new version?
