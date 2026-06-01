# Mark Translations Outdated

> File name: `mark-translations-outdated.use-case.md`

## Purpose

Mark localized content as outdated when the source content changes.

## Actor

- System process triggered by source content update.
- Backpanel action that updates the source locale.

## Command Or Query

- `resourceType`: source resource type.
- `resourceId`: source resource identifier.
- `sourceLocale`: source `LocaleCode`.
- `newSourceVersion`: updated source version.
- `contentHash`: normalized hash of new source fields.

## Response

- `outdatedLocalizedContentIds`: translations marked outdated.
- `unchangedLocalizedContentIds`: translations left unchanged.

## Ports

- `TranslationSourceRepository`
- `LocalizedContentRepository`
- `Clock`

## Rules

- Source version must change when source fields change.
- Localized content derived from an older source version must become `OUTDATED`
  or `NEEDS_REVIEW`.
- Source-locale content can remain current when it is the edited content.
- The process must not silently overwrite translated fields.

## Side Effects

- Persists new translation source version.
- Updates translation status for affected localized content.
- May emit `TranslationsMarkedOutdated`.

## Application Errors

- `TranslationSourceVersionConflict`
- `ResourceNotFound`
- `LocaleCodeUnsupported`

## SEO And GEO Impact

- Published outdated pages may remain live only if the business accepts that
  policy.
- Editors must be able to see that SEO/GEO content may no longer match the
  source.

## Open Questions

- Should outdated published pages stay indexed until reviewed, or become
  temporarily non-indexable?
