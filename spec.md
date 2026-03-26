# PokeAtlas

## Overview

Build a production-style PokeAPI explorer that showcases the major capabilities
of a modern Next.js 16 App Router application while still feeling like a real
product instead of a demo sandbox.

The app should let users browse, search, filter, compare, and save Pokemon, and
it should deliberately exercise core Next.js 16 patterns such as Cache
Components, async route APIs, Server Components, Server Actions, Route
Handlers, metadata generation, and modal routing.

## Product Goals

- feel polished enough to use as a public portfolio-quality reference project
- showcase major Next.js 16 capabilities in one coherent app
- keep the architecture aligned with App Router best practices
- remain fast, indexable, resilient, and accessible
- use the public PokeAPI as the main data source

## Non-Goals

- authentication
- payments
- admin back office
- custom database infrastructure
- multiplayer or real-time collaboration
- full offline-first support

## Target Experience

Users should be able to:

- land on a fast home page with featured Pokemon and curated entry points
- browse a searchable and filterable Pokedex
- open a quick-view modal from the list without leaving context
- open a full Pokemon detail page for deep information
- compare multiple Pokemon side by side
- save favorites and a lightweight team draft
- share pages with rich metadata and generated social preview images

## Core Data Sources

Use PokeAPI for:

- pokemon list and pagination
- pokemon detail
- species detail
- evolution chains
- type data
- abilities

The app may derive normalized view models from PokeAPI responses, but the
external source of truth should remain PokeAPI.

## Technical Scope

### Framework and Runtime

- Next.js 16
- React 19
- App Router only
- TypeScript
- Node.js runtime by default

### Required Next.js 16 Capabilities

The implementation must showcase these capabilities in meaningful ways:

- App Router file conventions
- async `params` and async `searchParams`
- Server Components as the default rendering model
- minimal Client Component islands for interactive UI only
- Cache Components enabled via `cacheComponents: true`
- `use cache` with `cacheLife` and `cacheTag` for data and UI caching
- `updateTag` for read-your-writes freshness after user mutations
- streaming and Suspense boundaries for slow sections
- `loading.tsx`, `error.tsx`, `global-error.tsx`, and `not-found.tsx`
- Route Handlers for backend-for-frontend style endpoints
- Server Actions for user mutations such as favorites and team draft changes
- `after()` for non-blocking logging or analytics side effects
- `proxy.ts` instead of deprecated `middleware.ts`
- dynamic metadata with `generateMetadata`
- file-based metadata such as `robots.ts`, `sitemap.ts`, and `manifest.ts`
- generated Open Graph images with `next/og`
- parallel routes and intercepting routes for modal detail views
- `next/image` with `remotePatterns`
- `next/font`
- typed routes enabled in `next.config.ts`

### Do Not Use Deprecated Patterns

- no `middleware.ts` for primary request interception
- no `images.domains`; use `images.remotePatterns`
- no `next/legacy/image`
- no Pages Router for new feature work

## Information Architecture

### Primary Routes

- `/`
  - landing page
  - featured Pokemon
  - featured types or generations
  - prominent entry points into browse and compare flows

- `/pokedex`
  - searchable and filterable Pokemon index
  - filter by name, type, generation, and base stat ranges where practical
  - quick-view modal support from list results

- `/pokemon/[name]`
  - full Pokemon detail page
  - hero section
  - stats
  - abilities
  - type matchups
  - species flavor data
  - evolution chain
  - artwork gallery

- `/compare`
  - compare up to 3 Pokemon
  - search-param driven shareable comparison state

- `/favorites`
  - user-specific saved favorites
  - cookie-backed or server-action-backed persistence without requiring auth

- `/team-builder`
  - lightweight team drafting experience
  - add and remove Pokemon from a six-slot team
  - show type coverage summary

### Modal Routing

Use parallel and intercepting routes so that:

- opening a Pokemon from `/pokedex` can render as a modal quick view
- direct navigation to `/pokemon/[name]` renders the full page
- modal close returns users to the prior browsing context

## Rendering Model

### Server Components

Use Server Components for:

- home page sections
- Pokedex result rendering
- Pokemon detail data composition
- compare page data composition
- SEO-critical content

### Client Components

Use Client Components only where necessary, for example:

- search input interactions
- filter controls
- modal shell and close behavior
- favorite toggles
- compare selection interactions
- team builder interactions

## Caching Strategy

### Cache Components

Enable `cacheComponents: true` in `next.config.ts`.

Use Cache Components to create:

- a fast static shell for top-level routes
- cached shared data for popular Pokemon and type metadata
- streamed uncached sections for user-specific or highly variable UI

### Caching Expectations

- cache stable list and detail fetches with `use cache`
- apply `cacheLife` to avoid needlessly refetching stable PokeAPI data
- tag cache entries in a way that supports selective invalidation
- use `updateTag` after favorites or team mutations when freshness is expected

## Data and Mutation Design

### Read Flows

- centralize PokeAPI access through server-side data utilities
- normalize raw responses into UI-friendly models
- avoid client-side waterfalls for primary content

### Mutation Flows

Use Server Actions for:

- add favorite
- remove favorite
- add Pokemon to team
- remove Pokemon from team
- clear team

Persistence may be cookie-based for this version as long as the flow is
consistent and demonstrable.

## Route Handlers

Add Route Handlers where they improve the product, for example:

- `/api/search`
  - typeahead search suggestions
  - normalized shape for the client search box

- `/api/team/share`
  - optional share/export endpoint for a drafted team

Route Handlers should behave like backend-for-frontend helpers, not duplicate
the whole app data layer.

## Proxy Behavior

Add a `proxy.ts` that handles a small but meaningful request-layer concern.

Acceptable examples:

- redirecting legacy URLs into the new route structure
- assigning an A/B experiment cookie for alternate home page hero content
- enforcing canonical browse entry points for malformed query patterns

Do not use Proxy for slow data fetching or full authorization logic.

## Metadata and SEO

### Static Metadata

Provide strong root metadata in `app/layout.tsx`.

### Dynamic Metadata

Use `generateMetadata` for:

- Pokemon detail pages
- compare pages

### File-Based Metadata

Include:

- `robots.ts`
- `sitemap.ts`
- `manifest.ts`
- favicon and app icons

### Open Graph

Generate dynamic OG images for Pokemon detail pages using `next/og`.

## Error, Empty, and Loading States

The app must include thoughtful UX for:

- initial loading states
- slow route segments
- failed remote fetches
- empty search results
- invalid Pokemon names or IDs
- global rendering failures

Required file conventions should be used where appropriate:

- `loading.tsx`
- `error.tsx`
- `global-error.tsx`
- `not-found.tsx`

## Media and Assets

- use `next/image` for official Pokemon artwork and sprites
- configure `images.remotePatterns` correctly for all remote image hosts used
- use `next/font` for the primary type system

## Performance Expectations

- first load should present a meaningful shell quickly
- list and detail routes should avoid unnecessary client-side fetching
- streamed content should improve perceived load time for slower sections
- the app should avoid obvious waterfalls in composed detail pages

## Accessibility Expectations

- keyboard-accessible modal interactions
- semantic headings and landmarks
- accessible search and filter controls
- image alt text for Pokemon artwork
- contrast-safe UI

## Suggested Delivery Scope

### Must Have

- home page
- Pokedex page
- Pokemon detail page
- modal quick-view route
- compare page
- favorites
- team builder
- metadata and OG generation
- route handlers
- proxy
- server actions
- loading, error, and not-found states

### Nice to Have

- generation-specific entry pages
- type matchup visualizations
- shareable team card
- daily featured Pokemon

## Acceptance Criteria

The project is complete when:

- all primary routes are functional
- major Next.js 16 features listed above are implemented in meaningful product
  scenarios
- the app works without relying on deprecated Next.js patterns
- PokeAPI data is composed into a coherent, polished user experience
- the project is strong enough to serve as a public showcase of modern Next.js
  16 development
