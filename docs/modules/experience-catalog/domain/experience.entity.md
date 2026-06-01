# Experience

> File name: `experience.entity.md`

## Purpose

Represents a bookable commercial boat experience, such as Party on Boat,
Morning Breeze, Romantic Proposal, or any future public package.

The experience owns the bookable offer: duration, starting price, included
services, optional extras, media references, publication state, and slot policy.
Locale-specific public copy, slugs, metadata, structured data, and GEO content
are owned by Localization SEO as `LocalizedContent`.

## Identity

- `experienceId`: source identity used by localized content and routes.

## Attributes

- `durationMinutes`: planned length of the experience, configurable from the
  backpanel.
- `basePrice`: `Money` shown as the public starting price before selected
  extras, configurable from the backpanel.
- `displayOrder`: ordering value used by admin and public catalog listings.
- `capacity`: passenger or group constraints, configurable from the backpanel.
- `departurePort`: operational meeting/departure point shown to staff and
  public flows when appropriate.
- `includedItems`: items included without extra charge.
- `internalNotes`: staff-only operational notes.
- `slotPolicy`: configurable rules that describe when this experience can be
  booked.
- `bufferMinutes`: operational buffer between selected slots.
- `minimumAdvanceMinutes`: minimum booking notice for this experience.
- `maximumAdvanceMonths`: maximum future booking window. Launch limit is six
  months.
- `allowsManualScheduling`: whether staff can place the experience manually
  outside public slot templates.
- `compatibleExtraIds`: configurable extras that can be selected with this
  experience.
- `primaryImageId`: ready `MediaAsset` used as the main public image.
- `publicationState`: draft, ready, published, or archived.
- `defaultSourceLocale`: locale used as the editorial source for translations.

## Invariants

- A published experience must have at least one public locale ready for SEO and
  GEO.
- A published experience must have a valid `SlotPolicy`.
- A published experience must have a valid `basePrice`.
- A published experience must have a ready primary image.
- A published experience must not reference archived extras as selectable.
- `displayOrder` must be positive.
- `bufferMinutes` and `minimumAdvanceMinutes` must be non-negative.
- `maximumAdvanceMonths` must be between one and six months at launch.
- An experience defines possible slots, but it never guarantees boat
  availability by itself.
- Compatible extras, quantity rules, slot rules, minimum-notice rules, and
  capacity effects are configurable per experience through backpanel-managed
  selection rules.

## State

- `DRAFT`: editable and not public.
- `READY`: complete enough to publish, but not yet public.
- `PUBLISHED`: visible and bookable on public pages.
- `ARCHIVED`: hidden from new bookings, but still available for historical
  bookings.

## Behavior

- Define or change its commercial content.
- Define or change its `SlotPolicy`.
- Attach or detach compatible extras.
- Move through publication states.
- Provide public catalog data for listing and detail pages.

## Relationships

- `SlotPolicy`: owned by the experience.
- `Extra`: referenced as compatible add-ons.
- `Money`: represents base price.
- `Slug`: represents public route segments.
- `LocalizedContent`: owns title, summary, description, translated slugs, SEO
  metadata, GEO metadata, and structured-data inputs per locale.
- `Booking`: references the selected experience, but does not mutate the
  experience.
- `Media`: provides public visual assets.
- `MediaAsset`: provides the primary image for public rendering.
- `Localization SEO`: owns locale readiness, translated routes, metadata,
  `hreflang`, sitemap, and structured data.

## Domain Errors

- `ExperienceNotPublishable`
- `ExperienceSlotPolicyMissing`
- `ExperiencePriceMissing`
- `ExperiencePrimaryImageMissing`
- `ExperiencePrimaryImageNotReady`
- `ExperienceExtraNotCompatible`
- `ExperienceArchived`

## Open Questions

- Which launch extras should be configured to decrease effective capacity, and
  by how much?
- Which launch experiences should be configured with seasonal or weekday
  restrictions?
