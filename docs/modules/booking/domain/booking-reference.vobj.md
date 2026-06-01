# Booking Reference

> File name: `booking-reference.vobj.md`

## Purpose

Represents the public booking identifier shown to buyers and support.

It is safe to share, but it is not sufficient to access private booking details
without the access token.

## Value

- `value`: public booking reference, for example `JB-2026-000123`.

## Creation Rules

- Must be unique.
- Must be uppercase.
- Must be easy to read over email, WhatsApp, phone, and support conversations.
- Must not reveal internal database ids.

## Normalization

- Trim surrounding whitespace.
- Store uppercase.
- Preserve the configured prefix and numeric format.

## Equality

Two booking references are equal when their normalized values are equal.

## Domain Errors

- `BookingReferenceInvalid`
- `BookingReferenceAlreadyExists`

## Open Questions

- Should the sequence reset every year, or should it be globally increasing?
