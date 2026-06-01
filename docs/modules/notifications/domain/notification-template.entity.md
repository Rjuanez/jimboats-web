# Notification Template

> File name: `notification-template.entity.md`

## Purpose

Represents an editable message template used to render notifications by type,
channel, and locale.

Templates are business content and should be managed from the backpanel, not
hardcoded in source code.

## Identity

- `notificationTemplateId`: stable internal identifier.

## Attributes

- `type`: `NotificationType`.
- `channel`: `NotificationChannel`.
- `locale`: `LocaleCode`.
- `status`: draft, ready, published, or archived.
- `subject`: optional localized subject for email-like channels.
- `body`: localized template body.
- `variables`: allowed variables that may be inserted at render time.
- `version`: template version for audit and rendering traceability.
- `updatedBy`: backpanel user who last changed the template.
- `updatedAt`: last change time.

## Invariants

- A published template must exist for each required launch buyer channel and
  supported locale for buyer-critical notification types.
- Launch buyer channels are `EMAIL` and `WHATSAPP`.
- Launch locales are `en`, `es`, and `ca`.
- Template variables must be from the allowed variable list.
- Buyer-critical templates must not silently fall back unless the business
  explicitly allows fallback for that notification type.
- Archived templates cannot be used for new notifications.

## State

- `DRAFT`: being edited.
- `READY`: valid but not published.
- `PUBLISHED`: can be used for notification rendering.
- `ARCHIVED`: not used for new notifications.

## Behavior

- Update localized body and subject.
- Validate required variables.
- Publish template.
- Archive old template version.

## Relationships

- `Notification`: uses a published template to render message content.
- `NotificationType`: selects the business event.
- `NotificationChannel`: selects delivery channel.
- `LocaleCode`: selects language.
- `BackpanelUser`: edits and publishes templates.

## Domain Errors

- `NotificationTemplateMissing`
- `NotificationTemplateInvalid`
- `NotificationTemplateVariableInvalid`
- `NotificationTemplateFallbackNotAllowed`

## Open Questions

- Which buyer-critical notification types require templates at launch?
