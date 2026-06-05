# Notifications Implementation Plan

## Purpose

Implement configurable booking notifications after the booking audit/outbox slice.

The implementation order follows the project rule for slices:

1. Domain and domain tests.
2. Use cases and use case tests.
3. Infrastructure.
4. Interface.

## Scope

Implement:

- per-booking notification preferences.
- notification rules by event/channel/template.
- notification templates with EN/ES/CA translations.
- template preview.
- notification deliveries/logs.
- outbox publisher processing booking lifecycle events.
- manual WhatsApp flow.
- notification worker loop.
- Resend email provider.
- Prelude WhatsApp provider.

Do not implement yet:

- provider delivery webhooks.
- marketing notifications.
- customer accounts.

## Phase 1: Domain

### Files Expected

```txt
src/modules/booking/domain/BookingNotificationPreferences.ts
src/modules/booking/domain/BookingNotificationPreferences.test.ts
src/modules/notifications/domain/NotificationRule.ts
src/modules/notifications/domain/NotificationRule.test.ts
src/modules/notifications/domain/NotificationTemplate.ts
src/modules/notifications/domain/NotificationTemplate.test.ts
src/modules/notifications/domain/NotificationDelivery.ts
src/modules/notifications/domain/NotificationDelivery.test.ts
src/modules/notifications/domain/NotificationChannel.ts
src/modules/notifications/domain/NotificationType.ts
```

### Work

- Model channel consent per booking.
- Validate email and WhatsApp destinations.
- Model rule state, send mode and consent requirement.
- Model template translations and variable validation.
- Model delivery states: `PENDING`, `MANUAL_REVIEW`, `SENT`, `DELIVERED`,
  `FAILED`, `CANCELLED`.

### Verification

- Domain unit tests for consent, rule readiness, template translation
  publication, variable validation and delivery transitions.

## Phase 2: Application

### Files Expected

```txt
src/modules/notifications/application/NotificationDtos.ts
src/modules/notifications/application/ProcessOutboxNotificationEventUseCase.ts
src/modules/notifications/application/UpdateNotificationRuleUseCase.ts
src/modules/notifications/application/UpdateNotificationTemplateUseCase.ts
src/modules/notifications/application/PreviewNotificationTemplateUseCase.ts
src/modules/notifications/application/SendBookingNotificationUseCase.ts
src/modules/notifications/application/ProcessNextNotificationWorkUseCase.ts
src/modules/notifications/application/ports/NotificationRuleRepository.ts
src/modules/notifications/application/ports/NotificationTemplateRepository.ts
src/modules/notifications/application/ports/NotificationDeliveryRepository.ts
src/modules/notifications/application/ports/OutboxRepository.ts
src/modules/notifications/application/ports/NotificationProvider.ts
src/modules/notifications/application/ports/TemplateRenderer.ts
src/modules/notifications/application/ports/NotificationClock.ts
src/modules/notifications/application/ports/NotificationIdGenerator.ts
```

### Work

- Add use case to process one outbox message.
- Add rule update use case with audit records.
- Add template update and preview use cases.
- Add send/mark-sent use case for deliveries.
- Add worker use case that processes one pending outbox message or one pending
  delivery.
- Keep application dependent on ports, not Prisma or providers.
- Keep publisher idempotent by `(outboxMessageId, ruleId)`.

### Verification

- Use case tests with in-memory repositories.
- Tests for skip reasons:
  - no consent.
  - missing translation.
  - disabled rule.
  - duplicate processing.
- Tests for outbox success/failure marking.

## Phase 3: Infrastructure

### Files Expected

```txt
prisma/schema.prisma
prisma/migrations/<timestamp>_notification_rules_templates_deliveries/migration.sql
src/infrastructure/db/prisma/PrismaNotificationRuleRepository.ts
src/infrastructure/db/prisma/PrismaNotificationTemplateRepository.ts
src/infrastructure/db/prisma/PrismaNotificationDeliveryRepository.ts
src/infrastructure/db/prisma/PrismaOutboxRepository.ts
src/infrastructure/notifications/ConsoleNotificationProvider.ts
src/infrastructure/notifications/ResendEmailNotificationProvider.ts
src/infrastructure/notifications/PreludeWhatsappNotificationProvider.ts
src/infrastructure/notifications/ExternalNotificationProvider.ts
```

### Work

- Add persistence tables from
  `docs/persistencia/notifications-backpanel.schema.md`.
- Add Prisma adapters for rules, templates, deliveries and outbox.
- Add providers:
  - console provider for local development.
  - Resend provider for automatic email.
  - Prelude provider for automatic WhatsApp.
- Add container wiring.

### Verification

- Prisma adapter tests with Prisma-shaped fakes or integration tests if useful.
- Migration deploy in Docker.
- Idempotent delivery creation test.

## Phase 4: Interface

### Files Expected

```txt
src/app/admin/notifications/rules/page.tsx
src/app/admin/notifications/templates/page.tsx
src/app/admin/notifications/templates/[templateId]/page.tsx
src/app/admin/notifications/logs/page.tsx
src/components/sections/admin-notifications/*
src/interface/next/actions/adminNotificationActions.ts
src/interface/next/presenters/adminNotificationsPresenter.ts
src/interface/next/validators/adminNotificationValidators.ts
```

### Work

- Build rules list/editor.
- Build templates list.
- Build template detail with locale editors and preview.
- Build logs/manual review queue.
- Add booking detail communication preferences and delivery history.
- Keep pages as component composition.
- Validate input in `interface/next/validators`.

### Verification

- Component tests for rules, template editor, preview, logs and booking detail
  communication block.
- Storybook stories for admin notification screens/components.
- Responsive checks at 360, 768 and 1280 widths.
- A11y checks for forms, toggles, tabs and preview panels.
- Visual baseline update if admin notification pages are added to visual tests.

## Phase 5: Worker Loop

### Files Expected

```txt
src/interface/worker/notificationWorker.ts
src/interface/worker/notificationWorkerCli.ts
docker-compose.yml
infra/production/docker-compose.yml
package.json
```

### Work

- Add a notification publisher process that repeatedly processes pending
  outbox messages and sends pending deliveries.
- Keep it as a simple local worker, similar in spirit to media worker.
- Do not introduce Redis, queues or external brokers.
- Add script and Docker service only when implementation reaches this phase.

### Verification

- Worker unit tests for one loop iteration.
- Docker smoke test that pending booking outbox events become deliveries.
- Existing full verification chain.

## Final Verification Chain

When the full slice is implemented:

```txt
pnpm rules:check
pnpm test
pnpm test:ui
pnpm typecheck
pnpm lint
pnpm build-storybook
NODE_ENV=production pnpm build
pnpm test:responsive
pnpm test:a11y
pnpm test:visual --update-snapshots when UI changed intentionally
pnpm test:visual
```

## Implementation Notes

- WhatsApp can be manual review or automatic through Prelude when the template
  stores a provider template id.
- Do not silently fallback between locales for buyer-critical messages.
- Treat template rendering output as immutable delivery snapshots.
- Keep all third-party provider details behind `NotificationProvider`.
- Provider webhooks are a later slice.
- Do not send marketing messages from this module at launch.
