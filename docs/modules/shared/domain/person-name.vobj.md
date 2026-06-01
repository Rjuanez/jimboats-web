# Person Name

> File name: `person-name.vobj.md`

## Purpose

Represents a human name used for buyers, contacts, and operational users.

## Value

- `value`: normalized display name.

## Creation Rules

- Must not be blank.
- Must fit within the maximum configured length.
- Must contain visible text after trimming.
- Must not contain HTML or control characters.

## Normalization

- Trim surrounding whitespace.
- Collapse repeated internal whitespace.
- Preserve letter casing supplied by the person.

## Equality

Two person names are equal when their normalized values are equal.

## Domain Errors

- `PersonNameMissing`
- `PersonNameTooLong`
- `PersonNameInvalid`

## Open Questions

- Do we need separate first name and last name, or is one full name enough?
