# Update Notification Rule

> File name: `update-notification-rule.use-case.md`

## Purpose

Create or update the backpanel configuration that decides which event sends
which message, through which channel, with which template.

## Actor

- `ADMIN`
- `STAFF` if allowed by future permission policy.

## Command Or Query

- `ruleId`: existing rule id, or absent when creating.
- `eventType`: source outbox event.
- `notificationType`: business notification type.
- `channel`: `EMAIL` or `WHATSAPP`.
- `recipientType`: launch value `BUYER`.
- `templateId`: selected template.
- `enabled`: boolean.
- `sendMode`: `AUTOMATIC` or `MANUAL_REVIEW`.
- `requiresConsent`: boolean.
- `missingTranslationBehavior`: launch value `DO_NOT_SEND`.
- `updatedByUserId`: backpanel actor.

## Response

- Updated rule DTO.
- Readiness warnings, such as missing template translations.

## Ports

- `NotificationRuleRepository`
- `NotificationTemplateRepository`
- `AuditRepository`
- `Clock`

## Rules

- Only one active rule can exist for `(eventType, channel, recipientType)`.
- Buyer rules require `requiresConsent = true` at launch.
- A rule cannot be enabled without an active template.
- A rule in automatic mode should warn if any launch locale lacks a published
  translation.
- Missing translation behavior is `DO_NOT_SEND` at launch.
- Changes to enabled state, template, send mode, or consent requirement are
  audited.

## Side Effects

- Persists rule configuration.
- Records audit entry for operational changes.

## Application Errors

- `NotificationRuleDuplicate`
- `NotificationTemplateMissing`
- `NotificationRuleCannotEnable`
- `NotificationRuleChannelUnsupported`

## Open Questions

- Should `STAFF` be allowed to change rules, or only `ADMIN`?
