# Claude Instructions for photobookers

## Project Overview

`photobookers` is a full-stack TypeScript app for discovering and managing photobooks.

- **Server**: Hono on Node (`src/server.ts` → `src/index.tsx`)
- **Web UI**: Server-rendered **Hono JSX** (`hono/jsx`) with Tailwind CSS + PenguinUI
- **Client interactivity**: Alpine.js (`src/client/`) with `alpine-ajax` for partial updates
- **Mobile**: Separate Expo app in `mobile-expo/` consuming **Hyperview** XML routes under `src/fs-routes/hyperview/`
- **Database**: Postgres via Drizzle ORM (`src/db/schema.ts`)
- **Auth**: Supabase Auth + `@hono/session` middleware

React is used only in a few places (e.g. MJML newsletter templates). Default to Hono JSX for new UI.

## Development Commands

```bash
npm install
npm run dev:all          # recommended: Vite dev server + hono-fsr route watcher
npm run typecheck
npm run lint             # import boundaries on public + hyperview routes
npm run test:run
npm run build
npm start              # production server (uses .env.production)
```

| Command                      | Purpose                                                 |
| ---------------------------- | ------------------------------------------------------- |
| `npm run dev`                | Vite + Hono dev server (port 3000)                      |
| `npm run dev:fsr`            | Regenerate `src/fs-routes.manifest.ts` on route changes |
| `npm run dev:all:production` | Local dev with production env vars                      |
| `npm test`                   | Vitest watch mode                                       |
| `npm run db:generate`        | Generate Drizzle migrations                             |
| `npm run db:migrate`         | Run migrations                                          |
| `npm run db:push`            | Push schema directly (dev)                              |
| `npm run db:studio`          | Open Drizzle Studio                                     |

## Architecture

```
src/
├── index.tsx              # Hono app entry (middleware, static assets, routes)
├── server.ts              # Node serve wrapper
├── routes/index.tsx       # Session, auth middleware, hono-fsr router mount
├── fs-routes/             # File-system routes (pages + API handlers)
├── fs-routes.manifest.ts  # GENERATED — do not edit manually
├── domain/                # Shared business logic (used by multiple surfaces)
├── features/              # Surface-specific UI, services, and components
├── components/            # Shared UI (layouts, forms, app primitives)
├── client/                # Alpine.js bundles (main.js + admin.js)
├── middleware/            # Auth guards, token refresh, etc.
├── lib/                   # Shared utilities (hxml-comps, supabase, etc.)
└── db/                    # Drizzle schema and DB helpers
```

### Domain layer (`src/domain/`)

Shared **business logic** used by more than one surface (public web, Hyperview, creator dashboard, admin, API, cron, auth). Not UI.

| Goes in `domain/` | Stays in `features/` |
| ----------------- | -------------------- |
| DB queries/mutations shared across routes | JSX components, Alpine clients, admin tables/modals |
| Notification creation, cron runners, claim assignment | Admin-only moderation/planner UI |
| Pure helpers used by public + admin (e.g. `newsletterUtils`) | Surface-specific page layout and partials |

**Decision test (in order):**

1. Is it UI (components, Alpine, HTML partials)? → **features**, not domain.
2. Is it imported from outside admin (API, cron, `(app)/`, `hyperview/`, claims, auth)? → **domain** candidate.
3. Does it describe product behavior both apps would need after a future split? → **domain**, even if only admin uses it today.

**Import rules:**

- `(app)/` and `hyperview/` routes must import shared logic from `src/domain/`, never `features/dashboard/admin/**`. Enforced by `npm run lint`.
- `domain/` must not import admin UI. It may import `db/`, `lib/`, and other domain modules; calling admin-only planner helpers from domain is a smell — extract the shared part instead.
- When moving code to domain, leave a re-export in the old admin path if it keeps admin imports stable.

**Current domain modules:** `notifications/`, `claims/owner.ts`, `planner/` (utils + cron services), `creators/books.ts`, `interviews/token.ts`.

**Client bundles:** `main.js` is for public/creator Alpine; `admin.js` loads only on `/dashboard/admin/*` pages.

### Feature modules (`src/features/`)

| Module                                                                   | Purpose                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| `app`                                                                    | Public web pages (books, creators, stores, fairs)    |
| `hyperview`                                                              | Mobile app UI components and Hyperview route helpers |
| `dashboard`                                                              | Creator and admin dashboards                         |
| `auth`                                                                   | Sign-in, registration, email validation              |
| `claims`                                                                 | Creator account claim flow                           |
| `jobs`                                                                   | Background/cron job handlers                         |
| `api`                                                                    | Shared API utilities                                 |
| `book-analytics`, `book-views`, `site-analytics`, `app-store-analytics`  | Analytics                                            |
| `interviews`, `fair-attendees`, `fair-views`, `purchase-clicks`, `legal` | Supporting domains                                   |

### Routing

Routes live in `src/fs-routes/` and are registered via `hono-fsr`. After adding or renaming route files, the manifest must be regenerated (`npm run dev:fsr` or `npm run build`).

Top-level route groups: `(app)/` (public web), `dashboard/`, `hyperview/` (mobile), `auth/`, `api/`, `claims/`, `jobs/`.

### Rendering patterns

- **Web pages**: Hono JSX components return HTML via `c.html(...)`. Use Alpine `x-data` attributes for interactivity; register Alpine components in `src/client/`.
- **Hyperview (mobile)**: Routes return XML using helpers in `src/lib/hxml-comps.tsx` (`View`, `Text`, `Behavior`, etc.) and `hyperview(c)` from `src/lib/hxml`.
- **Forms**: `methodOverride` is enabled (`_method` field). Prefer `alpine-ajax` patterns already used in surrounding code.

### Auth & middleware

- `optionalAuthMiddleware` runs globally; use `requireAuth`, `requireAdmin`, `creatorGuard` on protected routes.
- Session secret: `AUTH_SECRET` env var (required at startup).
- Supabase client helpers: `src/lib/supabase.ts`.

### Path alias

`@/` maps to `src/` (configured in `vite.config.ts` and `vitest.config.ts`).

## Testing

- **Framework**: Vitest (Node environment)
- **Location**: `src/**/*.test.ts` and `src/**/*.spec.ts`
- **Run**: `npm run test:run`

Add or update tests for non-trivial behavior changes.

## Editing Conventions

- Prefer minimal, focused diffs; avoid unrelated refactors.
- Match existing naming and patterns in each folder.
- Do not edit generated artifacts (`src/fs-routes.manifest.ts`).
- Avoid new dependencies unless necessary.
- Hyperview list rows use `key` as an XML attribute (not React's `key` prop) — see `src/lib/hxml-comps.tsx`.

## Safety / Sensitive Areas

- Never commit secrets or raw `.env` values.
- Treat auth/session/middleware changes as high-risk; verify impacted routes.
- Be careful in admin and planner flows, especially `src/features/dashboard/admin/planner/*` (newsletter, social planning, Instagram services).
- `.env.production` contains real credentials — reference env var **names** only in code and docs.

## PR Expectations

- Explain why a change was needed, not only what changed.
- Include a short test plan (`npm run typecheck`, `npm run test:run`, and relevant manual checks).
- Keep commits and PRs small and reviewable.

## Mobile (separate project)

The Expo app in `mobile-expo/` is a separate npm project. Only work on it when explicitly requested. It connects to the Hyperview routes and uses `EXPO_PUBLIC_SERVER_URL` to find the backend.
