# Preview Notification Template

> File name: `preview-notification-template.use-case.md`

## Purpose

Render a notification template translation before sending or publishing it.

Preview lets staff verify email and WhatsApp copy with realistic booking data
without creating a delivery.

## Actor

- Backpanel user editing a notification template.

## Command Or Query

- `templateId`
- `locale`
- `bookingId`: optional real booking for preview.
- `fixtureKey`: optional deterministic fixture when no booking is selected.
- `draftSubject`: optional unsaved subject.
- `draftBody`: optional unsaved body.
- `draftPreviewText`: optional unsaved preview text.

## Response

- `renderedSubject`
- `renderedPreviewText`
- `renderedBody`
- `variables`
- `missingVariables`
- `warnings`

## Ports

- `NotificationTemplateRepository`
- `BookingRepository`
- `TemplateRenderer`
- `PreviewFixtureProvider`

## Rules

- Either `bookingId` or `fixtureKey` must be provided.
- Draft content can be previewed even if not publishable.
- Missing variables are reported, not silently replaced with empty strings.
- Preview does not create notification deliveries.
- Preview does not mark templates as ready or published.

## Side Effects

- None.

## Application Errors

- `NotificationTemplateNotFound`
- `BookingNotFound`
- `NotificationPreviewFixtureMissing`
- `NotificationTemplateVariableInvalid`

## Open Questions

- Which fixture bookings should be available by default in the backpanel?
