# ADR-0003: Client Analytics With Statsig

## Status

Proposed

## Context

JimBoats needs visibility into how public visitors move from acquisition pages
to booking completion. The first analytics need is not broad business
intelligence or admin usage tracking. It is understanding the client-facing
journey:

- Which traffic sources and locales bring qualified visitors.
- Which landing page calls to action lead visitors into booking.
- Where visitors drop during the booking flow.
- Which experiences, dates, times, extras, and coupons are associated with
  stronger conversion.
- Which support links are used when visitors need help.

Statsig is a suitable initial product analytics tool because it can receive
client events and build funnels from those events. Its official documentation
covers Next.js integration, event logging, and funnel charts:

- https://docs.statsig.com/client/Next
- https://docs.statsig.com/guides/logging-events
- https://docs.statsig.com/product-analytics/funnels

Marketing campaign attribution should start with UTM metadata attached to
events. Advertising-specific systems such as GA4, Google Ads, or Meta Pixel are
not part of this decision and should be considered separately when paid
campaigns require them.

## Decision

- Use Statsig first for client-facing product analytics and booking funnels.
- Do not instrument the admin backpanel in the initial Statsig scope.
- Do not send personal data, booking access tokens, Stripe identifiers, or
  private booking references to Statsig.
- Attach UTM metadata to public analytics events when present.
- Prefer explicit business events over relying only on automatic click or page
  capture.
- Treat client-side success events as useful funnel signals, not final financial
  truth.
- Add server-side confirmation events later if JimBoats needs reliable revenue
  and completed-booking analytics.

## Client Pages In Scope

- `/{locale}`: localized public landing page.
- `/{locale}/book`: public booking flow.
- `/{locale}/book/success`: Stripe return and booking finalization page.
- `/{locale}/bookings/{reference}`: customer booking access page.

## Pages Out Of Scope

- `/admin/*`
- Stripe dashboards or external checkout internals.
- Internal worker processes.
- Operational backpanel metrics.

## Event Naming

Event names should be stable, lowercase, and domain-oriented.

Recommended public landing events:

- `landing_viewed`
- `booking_cta_clicked`
- `landing_section_viewed`
- `contact_link_clicked`
- `social_link_clicked`

Recommended booking flow events:

- `booking_page_viewed`
- `booking_experience_selected`
- `booking_availability_loaded`
- `booking_availability_failed`
- `booking_date_selected`
- `booking_time_selected`
- `booking_extras_viewed`
- `booking_extra_toggled`
- `booking_payment_viewed`
- `booking_coupon_entered`
- `booking_coupon_applied`
- `booking_coupon_failed`
- `booking_validation_failed`
- `booking_checkout_started`
- `booking_checkout_failed`
- `booking_checkout_ready`
- `booking_success_viewed`

Recommended customer access events:

- `booking_access_viewed`
- `booking_access_failed`
- `booking_access_support_clicked`
- `booking_access_home_clicked`

## Common Event Metadata

Allowed metadata:

- `locale`
- `path`
- `referrer`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `cta_location`
- `section_id`
- `experience_id`
- `experience_slug`
- `step`
- `currency`
- `amount_minor`
- `deposit_amount_minor`
- `extras_count`
- `extra_id`
- `coupon_applied`
- `coupon_status`
- `guest_count`
- `delivery_email_enabled`
- `delivery_whatsapp_enabled`
- `marketing_consent_enabled`
- `device_type`

The metadata should describe behavior, commercial context, and funnel position.
It must not identify the customer personally.

## Prohibited Analytics Data

Never send:

- Customer name.
- Email address.
- Phone number.
- Free-text customer messages.
- Booking reference.
- Booking access token.
- Stripe Checkout Session ID.
- Stripe Payment Intent ID.
- Raw coupon codes if they can identify a private promotion or customer.
- IP address collected manually by application code.
- Any secret, credential, or backend token.

If a coupon needs analysis, send a non-identifying status or campaign grouping
instead of the raw code unless the business explicitly approves sending coupon
codes to Statsig.

## Primary Funnels

### Landing To Booking

```txt
landing_viewed
booking_cta_clicked
booking_page_viewed
booking_success_viewed
```

Questions answered:

- Which landing calls to action lead to booking.
- Which locales and campaigns create booking intent.
- Whether visitors drop before reaching the booking flow.

### Booking Completion

```txt
booking_page_viewed
booking_experience_selected
booking_date_selected
booking_time_selected
booking_payment_viewed
booking_checkout_started
booking_success_viewed
```

Questions answered:

- Where customers abandon the booking flow.
- Whether availability selection creates friction.
- Whether the customer details and payment step blocks conversion.

### Extras Impact

```txt
booking_extras_viewed
booking_extra_toggled
booking_checkout_started
booking_success_viewed
```

Questions answered:

- Which extras are attractive.
- Whether extras increase or reduce conversion.
- Whether extras correlate with higher booking value.

### Coupon Impact

```txt
booking_coupon_entered
booking_coupon_applied
booking_checkout_started
booking_success_viewed
```

Questions answered:

- Whether coupons help conversion.
- Whether coupon failures create drop-off.
- Whether coupon users complete checkout at a different rate.

### Support Friction

```txt
booking_page_viewed
contact_link_clicked
```

or:

```txt
booking_page_viewed
booking_access_support_clicked
```

Questions answered:

- Which steps cause customers to ask for help.
- Whether support clicks happen before checkout abandonment.
- Whether post-booking access is clear enough.

## Metrics To Review

Conversion metrics:

- Landing to booking page rate.
- Booking page to checkout started rate.
- Checkout started to success page rate.
- Booking completion rate by locale.
- Booking completion rate by experience.
- Booking completion rate by campaign.

Commercial metrics:

- Average booking amount started.
- Average deposit amount started.
- Extras selected per checkout.
- Extra attach rate by experience.
- Coupon application rate.
- Conversion with coupon compared to conversion without coupon.

Friction metrics:

- Availability failure rate.
- Validation failure rate by step.
- Checkout creation failure rate.
- Support click rate during booking.
- Drop-off after date selection.
- Drop-off after payment step view.

Marketing metrics:

- Conversion by `utm_source`.
- Conversion by `utm_medium`.
- Conversion by `utm_campaign`.
- Conversion by landing CTA location.
- Conversion by locale and campaign combination.

## Implementation Phases

### Phase 1: Client Analytics

- Add Statsig only to public/client pages.
- Capture page views for scoped public routes.
- Persist UTM metadata for the browsing session where allowed.
- Log explicit booking and landing events.
- Respect analytics consent requirements before sending non-essential events.
- Keep the implementation small and reversible.

### Phase 2: Server-Side Confirmation

- Add backend events only if reliable revenue analytics are required.
- Emit confirmed booking events from the trusted booking or payment
  finalization path.
- Avoid sending Stripe identifiers or customer personal data.
- Use internal booking data only to derive non-identifying metadata.

### Phase 3: Advertising Attribution

- Consider GA4, Google Ads, Meta Pixel, or other ad tooling only when paid
  campaigns require platform-specific attribution, remarketing, or audience
  synchronization.
- Keep that decision separate from Statsig product analytics.

## Consequences

- JimBoats can analyze the customer funnel without instrumenting the backpanel.
- Booking behavior becomes measurable before adding heavier marketing tooling.
- UTM metadata provides a simple first layer of campaign attribution.
- Strict data minimization reduces privacy and operational risk.
- Client-side analytics may miss blocked scripts, consent-denied sessions, or
  users who complete payment but do not return to the success page.
- Server-side confirmation remains necessary for authoritative completed
  booking and revenue reporting.

## Alternatives Considered

- Use only GA4: rejected for the initial product funnel because JimBoats needs
  explicit booking-step analytics, not only website traffic reporting.
- Use PostHog or Mixpanel instead of Statsig: possible, but not selected for
  this decision because the desired initial tool is Statsig.
- Track admin and client behavior together: rejected for launch because it
  mixes operational activity with customer conversion analytics.
- Send raw customer identifiers to analytics: rejected because public funnel
  analysis does not require personal data.
