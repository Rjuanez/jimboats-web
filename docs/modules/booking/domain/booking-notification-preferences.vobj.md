# Booking Notification Preferences

> File name: `booking-notification-preferences.vobj.md`

## Purpose

Represents the buyer communication permissions for one booking.

JimBoats does not register buyer accounts at launch, so notification consent and
channel choices belong to the booking snapshot. A buyer may allow operational
email, WhatsApp, both, or neither for that reservation.

This is not marketing consent. It is consent and operational preference for
booking-related messages such as confirmation, reschedule, cancellation, and
reminders.

## Value

- `preferredLocale`: `LocaleCode` used for notification content.
- `email`: channel preference for email.
- `whatsapp`: channel preference for WhatsApp.
- `consentCapturedAt`: when the consent state was captured or last changed.
- `consentSource`: `CHECKOUT`, `BACKPANEL`, or `BUYER_ACCESS`.
- `consentNotes`: optional staff note when edited manually.

Each channel preference contains:

- `enabled`: whether the channel may be used for this booking.
- `destination`: normalized email address or phone number.
- `consentStatus`: `GRANTED`, `REVOKED`, or `NOT_ASKED`.

## Creation Rules

- Email destination must satisfy `EmailAddress` when email is enabled.
- WhatsApp destination must satisfy `PhoneNumber` when WhatsApp is enabled.
- A channel can only be used when `enabled = true` and
  `consentStatus = GRANTED`.
- `preferredLocale` must be one of the enabled launch locales: `en`, `es`,
  `ca`.
- Backpanel-created bookings may set consent from staff input, but must keep
  `consentSource = BACKPANEL`.
- If a booking has contact data but no explicit consent, channel status is
  `NOT_ASKED`, not `GRANTED`.

## Normalization

- Email normalization is delegated to `EmailAddress`.
- Phone normalization is delegated to `PhoneNumber`.
- Locale normalization is delegated to `LocaleCode`.
- Notes are trimmed.

## Equality

Two preference values are equal when locale, channel states, destinations,
consent source, captured time, and notes are equal.

## Domain Errors

- `BookingNotificationConsentMissing`
- `BookingNotificationChannelNotAllowed`
- `BookingNotificationDestinationMissing`
- `BookingNotificationLocaleUnsupported`

## Relationships

- `Booking`: owns the preference snapshot.
- `CustomerDetails`: provides contact details, but not consent by itself.
- `NotificationRule`: decides which events want to send a message.
- `NotificationDelivery`: may only be created for a buyer channel allowed by
  these preferences.

## Open Questions

- Should buyer access let the customer revoke a channel after booking?
- Should staff edits require a reason for audit on every consent change?
