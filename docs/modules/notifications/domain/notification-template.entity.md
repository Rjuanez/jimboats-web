# Notification Template

> File name: `notification-template.entity.md`

## Purpose

Represents an editable message template used to render notifications for one
notification type and one channel. Localized copy lives in template
translations.

Templates are business content and should be managed from the backpanel, not
hardcoded in source code.

## Identity

- `notificationTemplateId`: stable internal identifier.

## Attributes

- `notificationType`: `NotificationType`.
- `eventType`: source outbox event that normally creates this message.
- `channel`: `NotificationChannel`.
- `providerTemplateId`: optional external template id used by providers such as
  Prelude for WhatsApp.
- `status`: draft, ready, active, or archived.
- `translations`: localized subject/body records.
- `allowedVariables`: variables that may be inserted at render time.
- `requiredVariables`: variables required before a translation can publish.
- `version`: template version for audit and rendering traceability.
- `updatedBy`: backpanel user who last changed the template.
- `updatedAt`: last change time.

## Invariants

- An active template must have publishable translations for every locale that
  the related rule can send automatically.
- Launch buyer channels are `EMAIL` and `WHATSAPP`.
- Launch locales are `en`, `es`, and `ca`.
- Template variables must be from the allowed variable list.
- Buyer-critical templates must not silently fall back unless the business
  explicitly allows fallback for that notification type.
- Archived templates cannot be used for new notifications.
- Email templates require translation subjects.
- Automatic WhatsApp templates require a provider template id before a pending
  delivery can be created.

## State

- `DRAFT`: being edited.
- `READY`: valid but not active.
- `ACTIVE`: can be selected by notification rules.
- `ARCHIVED`: not used for new notifications.

## Behavior

- Add or update localized body and subject.
- Validate required variables.
- Activate template.
- Archive old template version.
- Render preview using a booking fixture or real booking.

## Relationships

- `NotificationDelivery`: stores rendered output from an active template and a
  published translation.
- `NotificationRule`: selects the template for an event and channel.
- `NotificationProvider`: sends the rendered delivery through Resend or Prelude.
- `NotificationType`: selects the business event.
- `NotificationChannel`: selects delivery channel.
- `LocaleCode`: selects language.
- `BackpanelUser`: edits and publishes templates.

## Domain Errors

- `NotificationTemplateMissing`
- `NotificationTemplateInvalid`
- `NotificationTemplateVariableInvalid`
- `NotificationTemplateFallbackNotAllowed`
- `NotificationTemplateTranslationMissing`

## Open Questions

- Which buyer-critical notification types require all three launch locales
  before the rule can be enabled automatically?
