# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mobile-first PWA that serves as a digital "welcome booklet" for short-stay Paris apartments, branded "Jöro Living" (first building: Haussmann Halévy). Multi-property: each apartment is served from its own sub-URL (e.g. `/haussmann-halevy-1`) and only reachable with a time-boxed **magic link**. Bilingual FR/EN. Generated with [Lovable](https://lovable.dev) — Vite + React 18 + TypeScript + Tailwind + shadcn/ui.

The UI and the Notion-driven content pipeline are ported from the sibling project "Jöro Office" (`welcome-book-digital-office`), which is the most up-to-date reference for look and feel. Living differs on purpose: access codes are protected by magic links, content blocks are apartment-specific (access steps, check-in/out, house rules), and the footer shows only the Jöro Living logo.

## Commands

npm scripts are canonical (both `bun.lockb` and `package-lock.json` are checked in; the repo currently tracks `package-lock.json`).

- `netlify dev` — **preferred local dev.** Runs the app *and* the serverless functions (+ local Blobs) on one origin, so `/api/*` works. Requires the Netlify CLI. `predev` runs the Notion sync first (skipped when `NOTION_API_KEY` / `NOTION_DATABASE_ID` aren't set).
- `npm run dev` — Vite-only dev server on **port 8080**. No `/api/*`; `useProperty` falls back to a dev sample building so UI work still renders (the magic-link flow can't be exercised here).
- `npm run build` — production build (`prebuild` runs the Notion sync); `npm run build:dev` builds in development mode
- `npm run sync:notion` — run the Notion sync by hand
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run test` — Vitest run once; `npm run test:watch` for watch mode
- `npm run preview` — serve the production build

Issue a test magic link locally (needs `ADMIN_KEY` in `.env`): `POST /api/grants` with header `x-admin-key` and body `{"buildingId":"<slug>","days":1}` — the response returns the `/access?token=…` link. `GET /api/grants` (same auth) lists the available apartments.

## Architecture

**Entry & providers.** `src/main.tsx` → `src/App.tsx`. Provider nesting order (outer→inner): `QueryClientProvider` → `ThemeProvider` → `LanguageProvider` → `TooltipProvider` → toasters → `BrowserRouter`.

**Routing.** `src/App.tsx`: `/access` (magic-link landing) and `/admin` are public static routes; `/` shows `AccessExpired` (there is no default apartment); every apartment lives under `/:buildingSlug/*`, rendered by `BuildingGate`, with nested pages `home`, `checkin`, `checkout`, `facilities`, `services`, `explore`, `info`. The index route is `OnboardingGate` (per-slug flag `localStorage["joro_onboarded_<slug>"]`). Static `/access` and `/admin` win over `/:buildingSlug`, so those two words can't be used as slugs. Internal links must stay slug-aware (read `buildingSlug` via `useParams()` and build `` `/${buildingSlug}/...` ``).

**Access (magic links).** No accounts. An admin creates a *grant* (one apartment, one stay) on `/admin`; the guest opens `/access?token=…`, `Access` posts the token to `/api/enter`, which sets the HttpOnly `joro_token` cookie, then redirects to `/<buildingId>`. Backend in `netlify/functions/`: `grants` (admin: `POST` creates a link, `GET` lists apartments), `enter` (token → cookie), `building` (`GET /api/building?slug=` — 401 without a valid session, 403 if the session is for another apartment, 404 unknown slug), `admin-login/logout/check` + `_lib/{admin,grants}.ts`. Grants persist in **Netlify Blobs** (store `grants`, key = SHA-256 of token + `TOKEN_PEPPER`). Env vars (Netlify site settings): `ADMIN_KEY`, `TOKEN_PEPPER`, optional `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`. `buildings.json` is private (`netlify/functions/_data/`) — **never** put it in `public/`.

**Building data (Notion).** `scripts/sync-notion.mjs` runs before every build. It queries the Notion database whose id is in `NOTION_DATABASE_ID` (**no default on purpose** — don't hardcode another project's database) with `NOTION_API_KEY`, one row per apartment (`slug`, `nom_public`, `adresse`, `wifi_reseau`, `wifi_mdp`, optional guest wifi/colors/`background`/`logo`), and writes `buildings.json` + downloads photos into `public/buildings/<slug>/`. Each row is a Notion page holding child databases, found by exact title: `Services`, `Adresses utiles`, `Guide de l'espace (équipement)`, `Guide du logement (pièces)` (or `Guide de l'espace (étage)`), `Accès` (steps; optional untranslated `code` column — access codes are never sent to DeepL), `Infos complémentaires`, `Check-in / Check-out` (`type` select: arrivée/départ/information; lines starting with `- ` render as bullets). Texts are translated FR→EN via DeepL (`DEEPL_API_KEY`, cache in `scripts/.translation-cache.json`, falls back to French). The sync fails soft: any problem leaves the existing `buildings.json` untouched. `useProperty()` reads `buildingSlug` from the route and caches with React Query (key `["building", slug]`).

**Per-building brand colors.** Optional `colors` (hex) are applied by `BuildingGate` onto `--brand-ink` / `--brand-surface`; the `:root` values in `src/index.css` (Living's own `#1c2626` / white) are the fallback. Tailwind consumes them as `brand-ink` / `brand-surface`.

**Adding an apartment.** Add a row to the Notion database (+ its child databases), then publish; it becomes available at `/<slug>`. To let a guest in, create a magic link for that slug on `/admin`.

**i18n (custom, not i18next).** `useLanguage()` returns `{ lang, setLang, t }`. Static strings live in `src/i18n/locales/{en,fr}.yaml`, parsed by `src/i18n/translations.ts`; Notion-driven texts arrive as `{ fr, en }` objects (`Bilingual`) and are picked with `[lang]`.

**Theme (custom, not next-themes).** `useTheme()` toggles `.dark` on `<html>` and persists to `localStorage["theme"]`.

**Styling.** Tailwind with HSL CSS-variable tokens in `src/index.css`; shadcn/ui components in `src/components/ui/`; `cn()` from `src/lib/utils.ts`; alias `@` → `src/`. `.h-app-shell` is the standard full-height page wrapper. Every page implements its own full-bleed layout (hero photo + `h-app-shell`).

**PWA.** `vite-plugin-pwa` (autoUpdate); `src/lib/registerSW.ts` skips the service worker in dev, in iframes, on Lovable preview hosts and with `?sw=off`. A `NetworkFirst` rule caches `GET /api/building` so the booklet stays available offline after the first online load.

**Hosting (Netlify).** `netlify.toml`: `publish = dist`, `functions = netlify/functions`, `/api/*` → functions, SPA fallback. The Netlify site is `welcome-book`; make sure it is linked to this GitHub repo for continuous deployment (it was deployed by hand with the CLI before the port).

## Conventions & gotchas

- **Loose TypeScript.** `strictNullChecks`, `noImplicitAny`, `noUnusedLocals`/`noUnusedParameters` are off — don't rely on them to catch mistakes.
- **Lovable project.** `lovable-tagger` runs in dev only; `.lovable/plan.md` holds Lovable plan state. Images under `src/assets/` have companion `*.asset.json` sidecar files — keep them alongside their image.
- **Access codes are sensitive.** They live in the Notion `Accès` table and in `buildings.json` (private repo). Keep them out of logs, translations and public files.
