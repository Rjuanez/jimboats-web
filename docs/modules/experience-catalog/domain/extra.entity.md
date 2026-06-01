# Extra

> File name: `extra.entity.md`

## Purpose

Represents an optional add-on that can be added to a boat experience, such as a
professional photographer, food, premium champagne, decoration, or another
service.

## Identity

- `extraId`: stable internal identifier.

## Attributes

- `name`: customer-facing name.
- `description`: explains what the buyer receives.
- `price`: current public `Money` price for the extra.
- `pricingMode`: how the price is applied. Launch mode is `PER_BOOKING`.
- `availabilityState`: active, draft, or archived.
- `compatibleExperienceIds`: experiences where the extra can be selected.
- `selectionRules`: `ExtraSelectionRule` values such as minimum notice, maximum
  quantity by experience, slot compatibility, or mutually exclusive options.
- `primaryImageId`: ready `MediaAsset` used as the main public image when the
  extra is shown publicly.
- `defaultSourceLocale`: locale used as the editorial source when public
  translations are needed.

## Invariants

- An active extra must have a valid price.
- An archived extra cannot be selected for new bookings.
- An extra can be selected only for compatible experiences.
- A public visible extra should have a ready primary image.
- Extra price is per booking for launch.
- Extra quantity limits can differ by experience.
- Extras can require minimum notice.
- Extras can depend on selected slot.
- Extras can decrease effective capacity.
- Compatibility, quantity, minimum notice, slot dependency, and capacity
  reduction are configurable rules, not hardcoded behavior.
- Extras do not affect duration unless a future explicit rule says otherwise.
- A booking must store a price snapshot of selected extras, because future extra
  price changes must not alter existing bookings.

## State

- `DRAFT`: not selectable.
- `ACTIVE`: selectable when compatible with an experience.
- `ARCHIVED`: not selectable for new bookings.

## Behavior

- Change customer-facing content.
- Change price for future bookings.
- Define compatibility with experiences.
- Define selection rules.
- Archive the extra without changing existing bookings.

## Relationships

- `Experience`: declares which extras are compatible.
- `Money`: represents the current extra price.
- `ExtraSelectionRule`: protects compatibility, quantity, slot, and notice
  rules.
- `Booking`: stores selected extras and their frozen prices.
- `Localization SEO`: provides public translations when extras appear on public
  indexable content.
- `LocalizedContent`: owns translated name, description, metadata, and route
  information when an extra becomes public indexable content.
- `MediaAsset`: provides the primary image for public rendering.

## Domain Errors

- `ExtraNotSelectable`
- `ExtraNotCompatibleWithExperience`
- `ExtraPriceMissing`
- `ExtraPrimaryImageMissing`
- `ExtraPrimaryImageNotReady`
- `ExtraSelectionRuleViolated`
- `ExtraQuantityNotAllowed`
- `ExtraMinimumNoticeNotMet`
- `ExtraCapacityReductionInvalid`

## Open Questions

- Which launch extras should be configured as slot-dependent?
- What initial quantity limits should be configured per experience for each
  launch extra?
- Which launch extras should be configured to decrease effective capacity?
