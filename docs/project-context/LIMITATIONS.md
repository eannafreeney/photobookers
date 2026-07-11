# Current limitations & pain points

Edit this file to document known constraints. The generator includes it in the LLM summary.

## Architecture

- **Monolith**: Web, admin, Hyperview mobile API, and cron jobs share one Node process and Postgres database.
- **Dual UI stacks**: Hono JSX + Alpine.js on web; Hyperview XML for mobile — features often need two implementations.
- **Domain vs features boundary**: Import lint enforces `(app)/` and `hyperview/` routes to use `src/domain/`, but some cron logic still lives in `features/`.
- **Generated routes**: `src/fs-routes.manifest.ts` must be regenerated after route file changes (`npm run dev:fsr` or build).

## Product & ops

- **Feature flags** (`featureFlags.json`): interviews and other surfaces can be off in production while code ships.
- **Staging sync**: Staging DB/storage sync is a separate workflow; not all production data is mirrored locally.
- **Admin planner complexity**: Newsletter, Instagram (Buffer), and spotlight flows are powerful but operationally heavy.
- **Mobile app**: Expo project in `mobile-expo/` is a separate deploy; backend changes require Hyperview route updates.

## Technical

- **README is minimal**: Onboarding docs live mainly in `CLAUDE.md` / this summary pipeline.
- **React scope**: React is limited to email templates (MJML/React Email); do not assume React for new web UI.
- **Secrets**: Many integrations (Supabase, Brevo, Buffer, Google Analytics, App Store Connect) require env vars — names only in docs, never values.
