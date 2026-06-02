# Agent Guide

**Always start here:** [`components/ARCHITECTURE.md`](./components/ARCHITECTURE.md).

That doc is the canonical explanation of how Contentful sections become
rendered React components — data flow, dispatch logic (switch-case mental
model), variant routing, the six-step recipe for adding a section, theming
rules, locale extension. Read it before changing anything in `lib/sections/`,
`lib/contentful/`, or `components/sections/`.

## What ships in this scaffold

- **FlexiblePage + SEO** — the only Contentful queries the skill installs:
  `lib/contentful/graphql/queries/flexiblePage.ts` and
  `lib/contentful/graphql/fragments/seo.ts`. Everything else (sections,
  reusable entries like Card, Cta, Image, Video) is left to the consuming
  project to add per the recipe in [`components/ARCHITECTURE.md`](./components/ARCHITECTURE.md).
- **Catch-all route** at `app/[[...slug]]/page.tsx` — fetches the
  `FlexiblePage` by slug and hands its sections to `SectionsRenderer`.
- **Section registry** at `lib/sections/registry.ts` — starts empty. Add
  entries here as you build sections.
- **Locale** at `lib/i18n/locale.ts` — English + Spanish by default.

Nothing else ships. There is no Header, Footer, Breadcrumbs, or example
section in the scaffold — those are added per project.

## Reference projects (read-only, outside this repo)

When building features, consult these local checkouts for prior art. They are
**reference only** — never import from them or edit them; copy patterns into
this repo and adapt to the scaffold's conventions.

- **Old Dynamic Fitness site** — `/Users/e25test/Documents/Dump/dynamic-fitness-2026`
  The previous build of *this same site* (Next.js + Supabase, pre-Contentful).
  Refer to it for existing **content, copy, page structure, design, and feature
  behavior** we are re-implementing. Treat its architecture as legacy — the data
  layer here is Contentful, not Supabase.

- **Contentful architecture — T-Mobile POC** — `/Users/e25test/Documents/Repos/cntfl-tmobile-poc`
  **Closest match to this scaffold.** Same structure: `lib/sections/registry.ts`,
  `lib/sections/SectionsRenderer.tsx`, `lib/sections/definitions/`, and
  `components/sections/` (Hero, CardGroups, CtaSection, SideBySide, Slider,
  Accordion, …). Use it as the primary reference for the section registry +
  definition pattern, GraphQL queries, and how a section is wired end-to-end.

- **Contentful architecture — PandaDoc** — `/Users/e25test/Documents/Repos/cntfl-pandadoc`
  A larger, mature Contentful build (many sections, live preview, inspector,
  domain/locale layers under `lib/contentful/`). Refer to it for **advanced
  patterns** — rich section variety, live preview/inspector wiring, and locale
  handling — when the simpler T-Mobile POC doesn't cover a case. Note its
  renderer (`lib/sections/renderSection.tsx`) differs from this scaffold's
  registry approach; prefer the scaffold/T-Mobile pattern here.

## Conventions to follow

- Use **switch-case** for variant routing inside section components (see the
  architecture doc).
- Reference brand colors via CSS variables in `app/globals.css`, not hex
  literals.
- **Always use Rich Text for long-form copy in Contentful — never the Long Text
  (`Text`) field type.** Short, single-line values (titles, labels, eyebrows)
  use `Symbol` (Short text); any multi-line/prose field must be a `RichText`
  field, rendered via `components/common/RichText`.
  - For prose that won't embed entries/assets (descriptions, FAQ answers), query
    it with `richTextJson()` (json only). The full `links` payload multiplies
    across collections and trips Contentful's query-complexity limit.
  - Use `richTextField()` (json + links) only where embedded Cta/Image/Video are
    expected (e.g. the Info `body` content pages), and prepend the matching
    fragment definitions exactly once per query.
