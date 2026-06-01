# Cancellation Policy

> File name: `cancellation-policy.vobj.md`

## Purpose

Represents configurable cancellation rules for bookings.

The policy is evaluated against the time remaining before departure and returns
the deposit outcome for the cancellation.

## Value

- `tiers`: ordered list of `CancellationPolicyTier` values.
- `defaultOutcome`: outcome used when no tier matches.
- `version`: policy version used for audit and historical bookings.

## Creation Rules

- Must contain at least one tier before cancellation automation can rely on it.
- Tiers must not overlap.
- Tiers must cover the ranges the business wants to enforce.
- Outcomes must be explicit.
- A booking snapshots the cancellation policy version at booking creation so
  later configuration changes do not silently alter existing buyer conditions.
- Changing cancellation tiers creates a new policy version.

## Normalization

- Tiers are stored ordered from most restrictive to least restrictive, or by
  descending hours before departure.
- Outcome values are stored as uppercase enum-like values.

## Equality

Two cancellation policies are equal when their tiers, default outcome, and
version are equal.

## Domain Errors

- `CancellationPolicyInvalid`
- `CancellationPolicyTierOverlap`
- `CancellationPolicyOutcomeMissing`
