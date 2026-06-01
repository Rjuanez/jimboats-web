# Domain Documentation Conventions

## Folder Shape

```txt
docs/
  modules/
    <module>/
      index.md
      domain/
        index.md
        <name>.entity.md
        <name>.vobj.md
      use-cases/
        index.md
        <name>.use-case.md
  workflows/
    <name>.workflow.md
  decisions/
    0001-<decision>.md
  _templates/
```

## Naming

- Module folders use kebab-case: `experience-catalog`.
- Entity docs end in `.entity.md`: `experience.entity.md`.
- Value object docs end in `.vobj.md`: `slug.vobj.md`.
- Use case docs end in `.use-case.md`: `publish-experience.use-case.md`.
- Workflow docs end in `.workflow.md`.
- Decision docs start with a numeric prefix: `0001-public-locales.md`.

## Entity Docs

Entity docs describe objects with identity and lifecycle.

They should answer:

- What identity does this object have?
- Which attributes belong to it?
- Which invariants must always hold?
- Which state transitions are allowed?
- Which relationships are owned by this module?
- Which domain errors can happen?

## Value Object Docs

Value object docs describe immutable concepts identified by value.

They should answer:

- What value is wrapped?
- How is the value validated?
- How is the value normalized?
- How is equality defined?
- Which domain errors can happen?

## Use Case Docs

Use case docs describe application intentions.

They should answer:

- Who or what triggers the use case?
- What command/query input is accepted?
- What response is returned?
- Which ports are needed?
- Which rules are enforced?
- Which side effects happen?
- Which application errors can happen?

## SEO And GEO Discipline

Public, indexable content must document:

- Canonical URL.
- Locale-specific slug.
- `title`, `description`, `h1`, Open Graph, and structured data needs.
- Whether fallback content is allowed.
- How `hreflang` and sitemap entries are derived.
- Whether the content is ready for publication in each locale.

No indexable page should rely on silent translation fallback.

