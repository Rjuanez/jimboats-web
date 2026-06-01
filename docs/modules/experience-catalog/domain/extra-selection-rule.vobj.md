# Extra Selection Rule

> File name: `extra-selection-rule.vobj.md`

## Purpose

Represents the rules that decide whether an extra can be selected for a booking.

## Value

- `pricingMode`: expected to be `PER_BOOKING` for launch.
- `compatibleExperienceIds`: experiences where the extra is available.
- `slotRules`: selected slots or time windows where the extra is available.
- `minNoticeMinutes`: optional minimum notice required before departure.
- `quantityRulesByExperience`: minimum and maximum quantity per experience.
- `capacityReduction`: optional passenger capacity reduction caused by the
  extra.

## Creation Rules

- Launch pricing mode is per booking.
- Quantity rules can differ by experience.
- Quantity must be inside the configured range for the selected experience.
- An extra can be shown only when compatible with the selected experience and
  selected slot.
- An extra with minimum notice cannot be selected when the booking is too close
  to departure.
- Extras can decrease effective capacity.
- Extras must not increase effective capacity.
- Extras do not affect duration unless a future explicit rule says otherwise.
- These rules are stored as configuration so staff can change compatibility,
  quantities, notice periods, slot dependency, and capacity effects from the
  backpanel.

## Normalization

- Pricing mode is stored as uppercase enum-like value.
- Quantity limits are stored as integers.
- Notice period is stored in minutes.
- Capacity reduction is stored as a non-negative integer.

## Equality

Two extra selection rules are equal when pricing mode, compatibility, slot
rules, notice period, quantity rules, and capacity reduction are equal.

## Domain Errors

- `ExtraSelectionRuleInvalid`
- `ExtraQuantityNotAllowed`
- `ExtraMinimumNoticeNotMet`
- `ExtraSlotNotCompatible`
- `ExtraCapacityReductionInvalid`

## Open Questions

- Which launch extras should be configured to decrease effective capacity, and
  by how much?
