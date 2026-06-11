# Agent Guide

**Always start here:** [`components/ARCHITECTURE.md`](./components/ARCHITECTURE.md).

That doc is the canonical explanation of how Contentstack entries become
rendered React components — data flow, dispatch logic (switch-case mental
model), variant routing, the six-step recipe for adding a section, theming
rules, locale extension. Read it before changing anything in `lib/sections/`,
`lib/contentstack/`, or `components/sections/`.

## What ships in this scaffold

- **FlexiblePage + SEO** — the only Contentstack content types the skill
  installs, queried via `lib/contentstack/graphql/queries/flexiblePage.ts` and
  `lib/contentstack/graphql/fragments/seo.ts`. Everything else (sections,
  reusable entries like Card, Cta, Image, Video) is left to the consuming
  project to add per the recipe in [`components/ARCHITECTURE.md`](./components/ARCHITECTURE.md).
- **Catch-all route** at `app/[[...slug]]/page.tsx` — fetches the
  `flexible_page` by url and hands its sections to `SectionsRenderer`.
- **Section registry** at `lib/sections/registry.ts` — starts empty. Add
  entries here as you build sections; each entry contributes a GraphQL fragment
  that is composed into the page query automatically.
- **Locale** at `lib/i18n/locale.ts` — English + Spanish by default.

Nothing else ships. There is no Header, Footer, Breadcrumbs, or example
section in the scaffold — those are added per project.

## Conventions to follow

- Use **switch-case** for variant routing inside section components (see the
  architecture doc).
- Model section variants with a `front_end_component` **Select (dropdown)**
  field whose choices match the switch-case labels, and add **field visibility
  rules** so editors only see the fields relevant to the chosen variant. The
  delivery API still returns every field — rules are authoring UX only. See the
  architecture doc.
- Reference brand colors via CSS variables in `app/globals.css`, not hex
  literals.
- Contentstack content-type and field uids are **snake_case**; the GraphQL
  type name is the **PascalCase** form of the content-type uid (e.g.
  `flexible_page` → `FlexiblePage`). Reference and file fields are exposed as
  `<field>Connection { edges { node { ... } } }`.
- Put long-form copy in a Rich Text Editor field (HTML RTE or JSON RTE), never
  a plain multi-line text field, and render it through a shared RichText
  component.
