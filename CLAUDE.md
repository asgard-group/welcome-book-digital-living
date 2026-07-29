# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mobile-first PWA that serves as a digital "welcome booklet" for a short-stay Paris apartment (branded "Jöro" / "Haussmann Mogador"). Bilingual FR/EN. Generated with [Lovable](https://lovable.dev) — Vite + React 18 + TypeScript + Tailwind + shadcn/ui.

## Commands

npm scripts are canonical (both `bun.lockb` and `package-lock.json` are checked in; the repo currently tracks `package-lock.json`).

- `netlify dev` — **preferred local dev.** Runs the app *and* the serverless functions (+ local Blobs) on one origin, so `/api/*` works. Requires the Netlify CLI.
- `npm run dev` — Vite-only dev server on **port 8080**, host `::`. No `/api/*`; `useProperty` falls back to a dev sample building so UI work still renders (auth can't be exercised here).
- `npm run build` — production build; `npm run build:dev` builds in development mode
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run test` — Vitest run once; `npm run test:watch` for watch mode
- `npx vitest run src/test/example.test.ts` — run a single test file; add `-t "name"` to filter by test name
- `npm run preview` — serve the production build

Issue a test magic link (needs `ADMIN_KEY` set): `POST /api/grants` with header `x-admin-key` and body `{"buildingId","days","email?"}` — the response returns the `/access?token=…` link (and emails it when `RESEND_API_KEY` is set).

## Architecture

**Entry & providers.** `src/main.tsx` → `src/App.tsx`. Provider nesting order (outer→inner): `QueryClientProvider` → `ThemeProvider` → `LanguageProvider` → `TooltipProvider` → toasters → `BrowserRouter`.

**Routing.** All routes live in `src/App.tsx`, one page component per route under `src/pages/`. `react-router-dom` v6. `/access` is public (magic-link landing); **every other route is nested under `<AuthGate>`** and requires a valid access grant. `/` is an `OnboardingGate`: if `localStorage["joro_onboarded"] === "1"` it redirects to `/home` (the `Welcome` page), otherwise it shows `Onboarding` (which sets that flag on "start").

**Auth & building data (magic-link grants).** There are no user accounts — access is a time-boxed *grant* to one building, keyed by an unguessable token.
- **Backend:** Netlify Functions in `netlify/functions/` (`grants` = admin issues a grant + link; `enter` = exchanges the link token for an HttpOnly `joro_token` cookie; `building` = returns the guest's building data iff the cookie maps to a currently-valid grant). Shared helpers in `_lib/grants.ts`; grants persist in **Netlify Blobs** (store name `grants`, key = SHA-256 of the token). Building content is private in `_data/buildings.json` — **never** put it back in `public/`. Env vars: `ADMIN_KEY`, `TOKEN_PEPPER`, `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL`.
- **Frontend:** `useProperty()` (`src/property/useProperty.ts`) fetches `GET /api/building` via React Query (query key `["building"]`); the client never sends a building id (server derives it). `AuthGate` (`src/components/AuthGate.tsx`) shows a splash while loading and an "expired link" screen on 401. `Access` (`src/pages/Access.tsx`) posts the token to `/api/enter`, strips it from the URL, then redirects to `/`.

**i18n (custom, not i18next).** `useLanguage()` from `src/i18n/LanguageContext.tsx` returns `{ lang, setLang, t }`. All strings live in the nested `en`/`fr` object in `src/i18n/translations.ts`; access via `t.section.key`. Language persists to `localStorage["lang"]` and falls back to `navigator.language`.

**Theme (custom, not next-themes).** `useTheme()` from `src/theme/ThemeContext.tsx` toggles the `.dark` class on `<html>` and persists to `localStorage["theme"]`. `next-themes` is a dependency but is **not** used for theming.

**Styling.** Tailwind with HSL CSS-variable design tokens defined in `src/index.css` (`:root` for light, `.dark` for dark). shadcn/ui components live in `src/components/ui/`. Use the `cn()` helper (`src/lib/utils.ts`) to compose classes. Path alias `@` → `src/` is configured in `vite.config.ts`, `vitest.config.ts`, and `tsconfig.json`.

**PWA.** `vite-plugin-pwa` (autoUpdate). Registration logic in `src/lib/registerSW.ts` deliberately **skips** the service worker in non-production builds, inside iframes, on Lovable preview/dev hostnames, and when `?sw=off` is present — and unregisters stale SWs in those cases. Expect no SW during local `dev`. A `NetworkFirst` runtime rule (in `vite.config.ts`) caches `GET /api/building` so entry codes / Wi-Fi stay available **offline** after the first online load.

**Hosting (Netlify).** `netlify.toml` sets `publish = dist`, `functions = netlify/functions`, redirects `/api/*` → functions, and adds the SPA fallback (`/*` → `/index.html`) so deep links like `/access` survive a hard refresh.

**Layout.** Single-column, mobile-first, capped at `max-w-[760px]`. `AppLayout` (`PageHeader` + `BottomTabBar`) exists but is only used by `Rules` and `QrPage`; most pages implement their own full-bleed layout.

## Conventions & gotchas

- **Two coexisting page styles.** Match whichever the page you're editing already uses:
  - *Template pages* use i18n `t` and the CSS design tokens: `Facilities`, `Rules`, `InfoPage`, `QrPage`, `Explore`.
  - *Rebranded "Jöro" pages* hardcode **French** strings (no `t`), hardcode a dark-teal hex palette (`#1c2626`, `#2E3F3E`, `#323E3E`), and use hero-image backgrounds: `Welcome`, `Onboarding`, `Checkin`, `Checkout`, `Thanks`. Don't retrofit i18n here unless deliberately converting the page.
- **`src/components/LanguageToggle.tsx` is dead code.** It's imported nowhere and imports two deleted assets (`flag-fr.svg`, `flag-gb.svg`). It was superseded by `SettingsPopover` (language + theme, used on `Welcome`). Don't re-import it without restoring the flag assets.
- **Loose TypeScript.** `strictNullChecks`, `noImplicitAny`, `noUnusedLocals`/`noUnusedParameters` are all off, and `@typescript-eslint/no-unused-vars` is disabled — don't rely on strict null/unused checking to catch mistakes.
- **Lovable project.** `lovable-tagger`'s `componentTagger` runs in dev mode only; `.lovable/plan.md` holds project plan state. Images under `src/assets/` have companion `*.asset.json` sidecar files (Lovable asset metadata) — keep them alongside their image.
