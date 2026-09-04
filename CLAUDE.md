# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeScout AI is a SvelteKit application that analyzes trading videos (uploads or YouTube URLs) using Google's Gemini AI to extract actionable trade setups, market sentiment, and risk analysis. The AI performs OCR on chart screenshots/videos to extract specific price levels.

The app was migrated from React 19 to SvelteKit 2 + Svelte 5 in December 2025. The pre-migration React source lives on the `react-legacy` branch; `sveltekit` is the default branch and the only one under active development.

## Reference Docs

`docs/` holds symlinked llms.txt files — the official documentation for this exact stack.

**These are the source of truth, not model recall.** Before writing runes, route files, adapter config, or Gemini calls, grep the relevant file below. Svelte 5, SvelteKit 2, and `@google/genai` all changed APIs recently; recalled signatures are frequently stale or invented. If the docs and your understanding disagree, the docs win — and if the docs don't cover it, say so rather than guessing.

- `docs/svelte-full.txt` — Svelte 5 core: `$state`/`$derived`/`$effect`/`$props`, effect teardown, snippets, event attributes.
- `docs/sveltekit-full.txt` — SvelteKit 2: routing, `+page`/`+layout`/`+server`, load functions, `$app/environment`, and adapter choice — this is where `adapter-node` is documented, not `railway.txt`. Relevant to the adapter gap under "Deployment".
- `docs/railway.txt` — Railway platform only: `start` script, env vars, build config. Says nothing about SvelteKit adapters.
- `docs/gemini.txt` — Gemini API **index only**: model ids, `responseSchema`, file/video upload, media resolution. Each bullet links to a `.md.txt` page that must be fetched for the actual text.

The directory is gitignored — the symlinks resolve to a path outside the repo, so they are local-only. Recreate on a fresh clone with:

```bash
/generate-llms add sveltekit-full svelte-full railway gemini
```

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000 (host 0.0.0.0)
npm run build        # Production build
npm run preview      # Preview production build
```

## Environment Setup

Create `.env.local` with:

```
CHART_IMG_API_KEY=your_key_here
SUPADATA_API_KEY=your_key_here
PUBLIC_GEMINI_API_KEY=
DEBUG=true
```

`CHART_IMG_API_KEY` and `SUPADATA_API_KEY` are inlined into the client bundle by Vite's `define` config (`vite.config.ts`) and read as `process.env.*` inside services. There is no server-side route protecting them — see "Known Gaps".

**Gemini key resolution** lives in `src/lib/utils/apiKeyStorage.ts`. `PUBLIC_GEMINI_API_KEY` (read at runtime via `$env/dynamic/public`; set as a Railway service variable) is used first. When it is empty, as it should be locally, the app falls back to the key the user pastes into `ApiKeyModal`, stored in `localStorage` under `tradescout_gemini_api_key`. Either way the key is passed explicitly into `analyzeVideoForTrades`. The `process.env.GEMINI_API_KEY` entry in `vite.config.ts` is unused.

## Architecture

### Entry Flow

`src/app.html` → `src/routes/+layout.svelte` (imports `app.css`, renders children) → `src/routes/+page.svelte`

### Routes

- **src/routes/+page.svelte**: The whole app. Holds all state via Svelte 5 runes (`result`, `isLoading`, `error`, `showApiKeyModal`, `pendingInput`, `analysisCount`, `videoMetadata`), orchestrates the analysis pipeline, and renders results. This is the direct port of the old `App.tsx`.

### Components (`src/lib/components/`)

- **VideoUpload.svelte** — file/URL input handling
- **TradeCard.svelte** — individual trade idea display
- **MarketAnalysisCard.svelte** — market sentiment/analysis display
- **VideoMetadataCard.svelte** — YouTube video title/author/date, shown as soon as metadata resolves
- **ApiKeyModal.svelte** — prompts for and persists the Gemini key
- **AnalysisLogStream.svelte** — live log stream during analysis (timer-heavy; clean up in `$effect` teardown)

### Services (`src/lib/services/`)

- **geminiService.ts** — Gemini API integration. File uploads, YouTube URL processing, structured JSON parsing via Gemini's schema validation.
- **chartSymbolService.ts** — enriches trades with TradingView symbols using Gemini Flash
- **chartImgService.ts** — renders charts through the Chart-IMG API
- **supadataService.ts** — fetches YouTube video metadata (used for the chart vertical line)

### Utils (`src/lib/utils/`)

- **apiKeyStorage.ts** — `localStorage` access for the Gemini key and analysis count, guarded by `browser` from `$app/environment`
- **debugLogger.ts** — debug logging and `exportLogs`, also `browser`-guarded

### Types

`src/lib/types.ts` — `TradeIdea`, `MarketAnalysis`, `AnalysisResult`, `VideoMetadata`. Import via `$lib/types`.

### Analysis Pipeline

`handleInputSelected` → (URL only) start the Supadata metadata fetch without awaiting it → `analyzeVideoForTrades` → `enrichTradesWithSymbols` → await the metadata promise → `generateChartsForTrades` → render. `VideoMetadataCard` appears as soon as the metadata promise resolves, while Gemini is still running. The key badge in the top bar mirrors a `$state` (`hasKey`) that is set when the modal saves a key; a bare `hasApiKey()` call in the template would never re-render.

### AI Model Configuration

- Model: `gemini-3.1-pro-preview` for video analysis (`gemini-3-pro-preview` was retired); `gemini-3.5-flash` for symbol enrichment
- Uses `responseMimeType: "application/json"` with `responseSchema` for structured output
- `mediaResolution: "MEDIA_RESOLUTION_HIGH"` for video analysis

## Tech Stack

- **SvelteKit 2** with **Svelte 5** (runes: `$state`, `$derived`, `$effect`, `$props`) and TypeScript
- **Vite 6** for bundling
- **Tailwind CSS 3** via PostCSS (`tailwind.config.js`, imported in `src/app.css`)
- **@google/genai** for Gemini API
- **lucide-svelte** for icons
- **zod** + **zod-to-json-schema** for schema work
- **Fonts**: JetBrains Mono (`font-mono`), Space Grotesk (`font-sans`)

## Conventions

- SSR safety: anything touching `localStorage`, `window`, or `document` must be behind `import { browser } from '$app/environment'`.
- Imports use the `$lib` alias (configured in both `svelte.config.js` and `tsconfig.json`).
- Icons: `import { IconName } from 'lucide-svelte'`.

## Deployment

Pushing to the `sveltekit` branch on the `main` remote (github.com/steve-goldberg/tradescout-ai) triggers an autodeploy on Railway.

`svelte.config.js` uses `@sveltejs/adapter-node`. `npm run build` writes a standalone server to `build/` (gitignored) and `npm start` runs it with `node build`, listening on Railway's `PORT`. Railway's Railpack builder runs `npm run build` followed by `npm start`.

## Styling

Dark trading terminal aesthetic:

- Background: `#030712` with grid overlay
- Panel: `#0b1121`
- Accent: Cyan (`#06b6d4`)
- Custom scrollbar and cyan selection styling in `src/app.css`; scanline animation for retro effect

## Known Gaps

Tracked in `migration.json` (phase status) and GitHub issues:

- **Phase 4.5 deferred**: no `src/routes/api/*/+server.ts` proxies, so `CHART_IMG_API_KEY` and `SUPADATA_API_KEY` ship in the client bundle.
- **Phase 9.4 skipped**: chart generation is not verified. Chart-IMG returned 403 during the September 2026 sign-off; trade cards render without chart images. Tracked separately from the migration.
- **Symbol enrichment is best-effort**: `gemini-3.5-flash` occasionally returns 503; the failure is caught and `chartImgService` falls back to its own ticker mapping.
