# Access Token Hash

> File name: `access-token-hash.vobj.md`

## Purpose

Represents the stored hash of a secret buyer access token.

The raw token is used only in the access link and must not be stored in plain
text.

## Value

- `hash`: stored hash of the raw token.
- `algorithm`: hashing strategy used.

## Creation Rules

- Must be produced from a high-entropy raw token.
- Raw token must be shown or sent only once.
- Hash must not be blank.
- Hash algorithm must be one accepted by the system.

## Normalization

- Store the hash in canonical encoded form.
- Do not normalize or log the raw token.

## Equality

Equality is checked by verifying a raw token against the stored hash, not by
directly comparing raw tokens.

## Domain Errors

- `AccessTokenHashInvalid`
- `AccessTokenVerificationFailed`
- `AccessTokenHashAlgorithmUnsupported`

## Open Questions

- Should buyer access tokens be rotated after support actions or cancellation?
