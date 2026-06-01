# JimBoats Domain Docs

## Purpose

This folder defines the product domain before implementation.

The docs are organized by module. Each module owns its domain model and its
use cases. Cross-module flows live in `workflows/`. Decisions that affect the
shape of the domain live in `decisions/`.

These docs describe business behavior. They must avoid framework details such
as Next.js routes, Prisma models, database queries, UI component structure, or
deployment mechanics unless a document explicitly says it is an interface or
infrastructure decision.

## Documentation Map

- [Conventions](conventions.md)
- [Modules](modules/index.md)
- [Workflows](workflows/index.md)
- [Persistencia](persistencia/index.md)
- [Decisions](decisions/index.md)
- [Templates](_templates/index.md)

## Modules

- [Shared](modules/shared/index.md)
- [Content](modules/content/index.md)
- [Experience Catalog](modules/experience-catalog/index.md)
- [Booking](modules/booking/index.md)
- [Boat Calendar](modules/boat-calendar/index.md)
- [Notifications](modules/notifications/index.md)
- [Backpanel](modules/backpanel/index.md)
- [Contact](modules/contact/index.md)
- [Media](modules/media/index.md)
- [Localization SEO](modules/localization-seo/index.md)

## Rules

- Domain docs use explicit file suffixes:
  - `<name>.entity.md` for entities.
  - `<name>.vobj.md` for value objects.
  - `<name>.use-case.md` for use cases.
- File names use kebab-case.
- Planned docs do not mean the feature is implemented.
- Implemented behavior must eventually be checked against source code.
- Domain docs must make SEO, GEO, localization, publication state, and content
  quality explicit whenever public pages are affected.
- A use case owns one business intention. If a flow crosses several modules,
  document it as a workflow.
