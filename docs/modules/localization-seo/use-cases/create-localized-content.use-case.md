# Create Localized Content

> File name: `create-localized-content.use-case.md`

## Purpose

Create the localized content record for one resource and one locale.

## Actor

- Backpanel user.
- System process creating locale placeholders after a source resource is
  created.

## Command Or Query

- `resourceType`: type of resource being localized.
- `resourceId`: resource identifier.
- `locale`: target `LocaleCode`.
- `sourceVersion`: optional source version used to initialize the translation.
- `initialFields`: optional localized fields.

## Response

- `localizedContentId`: created localized content.
- `status`: initial translation status.

## Ports

- `LocalizedContentRepository`
- `TranslationSourceRepository`
- `Clock`

## Rules

- Resource and locale pair must be unique.
- Locale must be supported.
- If initial fields are missing, status should be `NEEDS_TRANSLATION`.
- Public indexable localized content cannot be marked ready during creation
  unless all required validation already passes.

## Side Effects

- Persists localized content.
- May reserve a localized route later through a publishing use case.

## Application Errors

- `LocalizedContentAlreadyExists`
- `LocaleCodeUnsupported`
- `ResourceNotFound`

## SEO And GEO Impact

- Does not publish a route.
- Creates the object that will later be validated for SEO and GEO readiness.

## Open Questions

- Should creating a new experience automatically create localized content for
  every enabled locale?
