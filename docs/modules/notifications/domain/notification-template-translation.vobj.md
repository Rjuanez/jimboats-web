# Notification Template Translation

> File name: `notification-template-translation.vobj.md`

## Purpose

Represents localized editable content for one notification template.

Templates are configured by event/channel, while translations own the actual
copy for each supported locale. This keeps email and WhatsApp copy editable
without relying on static source-code dictionaries.

## Value

- `locale`: `en`, `es`, or `ca`.
- `status`: `DRAFT`, `READY`, `PUBLISHED`, or `ARCHIVED`.
- `subject`: required for email, not used for WhatsApp.
- `previewText`: optional email preview/snippet.
- `body`: localized message body.
- `variablesUsed`: variables detected in subject/body.
- `updatedByUserId`: staff/admin user who last changed the translation.
- `updatedAt`: last update time.

## Creation Rules

- Locale must be supported by backpanel locale settings.
- Published email translations require a non-empty subject and body.
- Published WhatsApp translations require a non-empty body.
- Every variable used by the translation must be allowed by the parent
  template.
- Buyer-critical translations cannot publish with missing required variables.
- A translation can be previewed while draft, but only published translations
  can be used for automatic sending.

## Normalization

- Subject, preview text, and body are trimmed.
- Variable names are normalized to the canonical template variable name.

## Equality

Two translations are equal when locale, status, subject, preview text, body, and
variables used are equal.

## Domain Errors

- `NotificationTemplateTranslationMissing`
- `NotificationTemplateTranslationInvalid`
- `NotificationTemplateVariableInvalid`
- `NotificationTemplateSubjectRequired`

## Relationships

- `NotificationTemplate`: owns translations.
- `LocaleCode`: validates locale.
- `NotificationRule`: needs a published translation for the booking locale.

## Open Questions

- Should publication require a second reviewer, or is admin edit enough at
  launch?
