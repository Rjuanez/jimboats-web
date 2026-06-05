# Notification Template Detail Screen

> File name: `notification-template-detail.screen.md`

## Purpose

Edit one notification template, its localized copy, allowed variables, and
preview output before it is used by rules.

## User

- `ADMIN`
- `STAFF` if allowed later.

## Data Shown

- Template metadata: notification type, event type, channel, status and version.
- Allowed variables and required variables.
- Translation editors for EN, ES and CA.
- Email fields: subject, preview text and body.
- WhatsApp fields: body.
- Validation report per locale.
- Live preview rendered with a booking fixture or selected real booking.
- Active rules using this template.

## Actions

- Edit allowed and required variables.
- Edit localized subject/body.
- Validate variables.
- Preview with fixture booking.
- Preview with a real booking.
- Mark translation ready.
- Publish translation.
- Activate or archive template.

## States

- Draft template.
- Ready template.
- Active template.
- Archived template.
- Translation missing required subject.
- Translation has unknown variable.
- Preview missing variable data.
- Preview rendered successfully.

## Domain Rules

- Email translations require subject before publishing.
- WhatsApp translations do not use subject.
- Published translations must have non-empty body.
- Variables must belong to the allowed list.
- Required variables must be present before publishing.
- Preview does not create deliveries.
- Publishing changes should be audited.

## Permissions

- `ADMIN` can activate/archive templates.
- `STAFF` can edit copy if allowed by future policy.

## Open Questions

- Should template activation require every launch locale, or can rules decide
  readiness per locale?
