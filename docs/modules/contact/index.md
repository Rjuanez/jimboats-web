# Contact Module

## What It Is

Owns non-booking inquiries and lead capture.

This module should remain simple: validate contact intent, store or forward the
message, and expose controlled backpanel views when needed.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Contact Message | Entity | A visitor message submitted from the public site. |
| Contact Details | Value Object | Name, email, phone, and preferred channel. |
| Lead Source | Value Object | Where the inquiry came from. |

## Use Case Candidates

- Submit contact message.
- List contact messages.
- Mark contact message as handled.

## Depends On

- [Shared](../shared/index.md), for IDs and time concepts.

