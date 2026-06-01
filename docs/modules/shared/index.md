# Shared Module

## What It Is

Owns reusable domain concepts that do not belong to a single business module.

Shared must stay small. If a concept carries business behavior for one module,
it belongs in that module instead.

## Domain Candidates

| Concept | Type | Notes |
| --- | --- | --- |
| Entity Id | Value Object | Base identifier rules for domain objects. |
| Money | Value Object | Amount and currency rules used by prices and payments. |
| Currency Code | Value Object | Supported ISO currency codes. |
| Email Address | Value Object | Normalized and validated email address. |
| Phone Number | Value Object | Normalized phone number for calls or WhatsApp. |
| Person Name | Value Object | Human name used for buyers and contacts. |
| Locale Code | Value Object | Supported public and transactional locales. |
| Slug | Value Object | SEO-safe route segment. |
| Time Zone | Value Object | Supported IANA time zone. |
| Local Date | Value Object | Business date without time. |
| Local Time | Value Object | Business local time without date. |
| Time Range | Value Object | Canonical start/end interval and overlap rules. |

## Use Cases

Shared should not own product use cases by default.

## Depends On

No module dependencies.
