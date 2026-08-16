# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository context

This is the Next.js frontend for kite spot weather forecasts in Rogaland, Norway, and is the
primary active app. It depends on a separately-deployed Azure Function App (.NET) that it never
calls directly — the two only share state through Azure Blob Storage.

Weather data flows one-way and asynchronously:
a separate Azure Function App fetches forecasts from Yr/MET Norway hourly and writes a
provider-independent `WeatherData` JSON contract to Azure Blob Storage; this app reads that blob
server-side. There is no direct API call between the two repos — they only share Blob Storage
state.

## Commands

```bash
npm install
npm run dev                 # dev server (Next.js Pages Router)
npm run build                # production build
npm run lint                  # next lint / ESLint
npm run test                   # vitest run (all tests)
npx vitest run path/to/file.test.ts       # single test file
npx vitest run -t "test name substring"    # single test by name
npx tsc --noEmit             # type-check only
npm run migrate:location-images   # one-off/re-runnable image seeding script (see below)
```

Copy `.env.example` to `.env` and fill in real values before running locally — every variable's
purpose and security boundary is documented inline in that file.

Tests are colocated as `*.test.ts`/`*.test.tsx` next to the file under test (jsdom environment,
config in `vitest.config.ts`, `@/` aliased to `src/`).

## Architecture

### Layering (strict — respect this when adding code)

```
src/repository/*   raw I/O: Azure Blob Storage (@azure/storage-blob), external calls
      ↓
src/service/*        business logic, concurrency control, orchestration
      ↓
src/pages/api/*        Next.js API routes — the ONLY callers of repository/service code
      ↓
src/store/*            Zustand client state
      ↓
src/components/*    React UI
```

`src/domain/*` holds pure logic with no I/O (`windCondition.ts`, `kiteConditionsMatcher.ts`,
`locationValidation.ts`, `adminAuthorization.ts`, `chartDateAxis.ts`) — it's the most heavily
unit-tested layer and the right place for new business rules that don't need to touch storage.

### Security boundary — do not break this

The Azure Storage connection string (`AZURE_KITESPOTSAD77_CONNECTION_STRING`) and other secrets in
`.env.example` must only ever be read by server-side code (`src/repository/*.ts`,
`src/service/*.ts`), only ever imported from `src/pages/api/*.ts`. Never give a secret a
`NEXT_PUBLIC_` name, pass it as a Docker build `ARG`, or reference it from a React component —
`NEXT_PUBLIC_*` vars get inlined into the client bundle at build time. The intended flow is always:

```
Browser -> same-origin Next.js API route -> server-only env var -> @azure/storage-blob -> Azure Blob Storage
```

### Locations are config, not code

`locations.json` in the `weatherdata` Blob Storage container is the single authoritative source of
kite spot locations — there is no hardcoded location list anywhere in production code. It's
downloaded and re-validated on every request; nothing is cached, so an admin edit is visible
immediately.

- `src/repository/LocationsRepository.ts` — read (`fetchLocations`)
- `src/service/LocationsService.ts` — authenticated read-modify-write via Blob ETag optimistic
  concurrency (concurrent edits 409 instead of clobbering each other)
- `src/repository/LocationImagesRepository.ts` — resolves a location's `imageBlobName` to a
  directly-fetchable public URL (the public `location-images` container allows anonymous *blob*
  reads only, no container listing); the browser fetches images straight from Blob Storage, not
  through a Next.js proxy
- `scripts/migrate-location-images.mjs` — one-off/re-runnable script that seeds `location-images`
  from the static photos in `src/assets/images/`; only needed if that container is ever recreated

Admins manage locations at `/Settings`, gated by the `NEXT_PUBLIC_KITESPOTS_ADMIN_EMAILS`
allowlist but **authorized server-side** (`src/util/auth/requireSession.ts` +
`src/domain/adminAuthorization.ts` are the source of truth — the client-side allowlist is only a
UI hint). Admin actions go through `POST`/`DELETE /api/locations` and
`POST /api/locations/[id]/image`. Deleting a location also deletes its image and
`weather/<id>.json` so nothing reappears as an orphaned "phantom" location.

### Weather data

`src/repository/WeatherDataRepository.ts` reads `weather/<locationId>.json` blobs;
`src/service/WeatherDataService.ts` sits above it. The frontend's copy of the `WeatherData`
contract lives in `src/types/model/WeatherData.ts` — it must be kept in sync with the Function
App's C# DTO if the contract ever changes (no shared package enforces this across the two repos).

Known quirks, not bugs: `windGustMs` is `null` once the forecast horizon passes Yr's short-range
window (~2.3 days); `precipitationMm` is `null` only for the trailing boundary timestamp.

### Auth

NextAuth with Azure AD (`src/pages/api/auth/[...nextauth].ts`), session secret via
`KITESPOTS_SECRET`. `src/util/auth/requireSession.ts` is the server-side gate API routes use to
enforce both "signed in" and "on the admin allowlist."

### Chat assistant

`src/components/chat/*` (widget UI) → `src/pages/api/chat.ts` → `src/service/ChatService.ts` →
Anthropic Claude API (`ANTHROPIC_API_KEY`, server-only). Gives kitesurfing condition advice
grounded in the current weather data for the selected location.

### State

Zustand stores in `src/store/*`: `locationsStore`, `weatherDataStore`, `chatStore`, `themeStore`,
`i18languageStore`, plus the `useSelectedLocation` hook. Localization uses `next-i18next` (English
and Norwegian).

## Docker / deployment

Runtime secrets must be injected as **container environment variables at run time**
(`docker run -e ...`), never as build args — see comments in `Dockerfile`. On Azure Static Web
Apps / App Service, set them under **Configuration > Application settings**, again as plain
(non-`NEXT_PUBLIC_`) settings. See `README.md` for full Docker build/run examples.
