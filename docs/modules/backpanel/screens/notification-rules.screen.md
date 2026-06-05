# Notification Rules Screen

> File name: `notification-rules.screen.md`

## Purpose

Configure which booking events generate messages, through which channels, using
which templates, and whether delivery is automatic or manual review.

## User

- `ADMIN`
- `STAFF` if allowed later.

## Data Shown

- Rule list grouped by event type.
- Event type and notification type.
- Channel: email or WhatsApp.
- Recipient type: buyer at launch.
- Enabled state.
- Send mode: automatic or manual review.
- Consent requirement.
- Assigned template.
- Translation readiness for EN, ES and CA.
- Last updated user and time.

## Actions

- Enable or disable a rule.
- Change assigned template.
- Change send mode.
- Open template detail.
- Preview with a fixture booking.
- Archive a rule.

## States

- No rules configured.
- Rule enabled and ready.
- Rule disabled.
- Rule warning because template is missing.
- Rule warning because one or more locale translations are not published.
- Rule archived.

## Domain Rules

- Only one active rule can exist for `(eventType, channel, recipientType)`.
- Buyer rules require consent at launch.
- Automatic rules should not be enabled when all required launch translations
  are missing.
- Missing translation behavior is `DO_NOT_SEND`.
- Rule changes are audited.

## Permissions

- `ADMIN` can change rules.
- `STAFF` can view rules at launch unless restricted later.

## Open Questions

- Should `STAFF` be able to change manual/automatic mode?
