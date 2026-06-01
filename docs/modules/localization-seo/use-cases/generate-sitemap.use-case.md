# Generate Sitemap

> File name: `generate-sitemap.use-case.md`

## Purpose

Generate sitemap entries from published localized routes.

## Actor

- Build process.
- Scheduled process.
- Backpanel publish workflow.

## Command Or Query

- `locale`: optional locale filter.
- `resourceType`: optional resource type filter.

## Response

- `entries`: sitemap entries with localized paths and metadata.
- `generatedAt`: generation time.

## Ports

- `LocalizedRouteRepository`
- `Clock`

## Rules

- Include only published localized routes.
- Include only routes whose indexing policy allows sitemap inclusion.
- Do not include private buyer access, checkout, payment return, or preview
  routes.
- Do not include locale routes backed by fallback content.

## Side Effects

- May persist generated sitemap artifact.
- May notify deployment or cache layer that sitemap changed.

## Application Errors

- `SitemapGenerationFailed`
- `LocaleCodeUnsupported`

## SEO And GEO Impact

- Directly controls discoverability of localized public pages.
- Protects search engines from indexing unfinished translations.

## Open Questions

- Should sitemap generation happen at publish time, build time, or both?
