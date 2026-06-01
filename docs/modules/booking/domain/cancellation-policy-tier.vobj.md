# Cancellation Policy Tier

> File name: `cancellation-policy-tier.vobj.md`

## Purpose

Represents one configurable cancellation time window and the deposit outcome for
that window.

## Value

- `minHoursBeforeDeparture`: inclusive lower bound when present.
- `maxHoursBeforeDeparture`: exclusive upper bound when present.
- `depositOutcome`: refundable, partially refundable, non-refundable, or manual
  review.
- `refundAmount`: optional `Money` when the tier defines a fixed refund.
- `refundPercentage`: optional percentage when the tier defines a proportional
  refund.
- `label`: backpanel label for staff.

## Creation Rules

- At least one boundary must be present.
- Maximum boundary must be greater than minimum boundary when both are present.
- Deposit outcome must be explicit.
- Partial refund outcomes must define refund amount or refund percentage.
- Tier boundaries are measured in hours before selected slot departure.
- Deposit outcomes apply only to the online deposit. The cash-on-board
  remaining amount is not treated as an online refund.

## Normalization

- Hour boundaries are stored as integer or decimal hour values.
- Outcome is stored as uppercase enum-like value.
- Label is trimmed.

## Equality

Two cancellation policy tiers are equal when boundaries, outcome, refund value,
and label are equal.

## Domain Errors

- `CancellationPolicyTierInvalid`
- `CancellationPolicyTierBoundaryInvalid`
- `CancellationPolicyTierRefundMissing`
