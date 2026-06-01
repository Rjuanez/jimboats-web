# Email Address

> File name: `email-address.vobj.md`

## Purpose

Represents an email address that is syntactically valid enough for the system to
store, use for buyer access, and send transactional notifications.

This value object does not prove that the mailbox exists.

## Value

- `value`: normalized email address.

## Creation Rules

- Must not be blank.
- Must contain exactly one local part and one domain part.
- Must have a valid domain-like suffix.
- Must stay within maximum email length accepted by the system.
- Must not contain control characters, spaces, HTML, or unsafe invisible input.

## Normalization

- Trim surrounding whitespace.
- Lowercase the domain part.
- Lowercase the full value only if the implementation chooses case-insensitive
  local parts.
- Preserve no display name; this value contains only the address.

## Equality

Two email addresses are equal when their normalized values are equal.

## Domain Errors

- `EmailAddressMissing`
- `EmailAddressInvalid`
- `EmailAddressTooLong`

## Open Questions

- Should the local part be lowercased, or should only the domain be lowercased?
