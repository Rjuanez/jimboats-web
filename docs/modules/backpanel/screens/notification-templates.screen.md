# Notification Templates Screen

> File name: `notification-templates.screen.md`

## Purpose

List editable email and WhatsApp templates used by notification rules.

## User

- `ADMIN`
- `STAFF` if allowed later.

## Data Shown

- Template name or notification type.
- Source event type.
- Channel.
- Status.
- Version.
- Translation readiness for EN, ES and CA.
- Number of active rules using the template.
- Last updated user and time.

## Actions

- Create template.
- Open template detail.
- Filter by event, channel, status, or missing translations.
- Archive unused template.

## States

- Empty template catalog.
- Templates ready for all launch locales.
- Templates with draft translations.
- Templates used by active rules.
- Archived templates.

## Domain Rules

- Templates are not sent directly; rules select them.
- Archived templates cannot be selected by rules.
- Missing translations make automatic rules skip that locale.

## Permissions

- `ADMIN` can create/archive templates.
- `STAFF` can edit templates if allowed by future policy.

## Open Questions

- Should template creation be free-form, or generated from supported
  notification types only?
