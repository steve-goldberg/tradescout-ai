# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeScout AI is a React application that analyzes trading videos (uploads or YouTube URLs) using Google's Gemini AI to extract actionable trade setups, market sentiment, and risk analysis. The AI performs OCR on chart screenshots/videos to extract specific price levels.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run preview      # Preview production build
```

## Environment Setup

Create `.env.local` with:
```
GEMINI_API_KEY=your_key_here
```

The key is exposed to the client via Vite's `define` config as `process.env.API_KEY`.

## Architecture

### Entry Flow
`index.html` → `index.tsx` → `App.tsx`

### Core Components
- **App.tsx**: Main component with state management for analysis results, loading, and error states. Handles video input and displays results.
- **services/geminiService.ts**: Gemini API integration. Handles file uploads, YouTube URL processing, and structured JSON response parsing using Gemini's schema validation.
- **types.ts**: TypeScript interfaces for `TradeIdea`, `MarketAnalysis`, and `AnalysisResult`.

### Component Dependencies (to be created in `components/`)
App.tsx imports these components that need implementation:
- `VideoUpload` - File/URL input handling
- `TradeCard` - Individual trade idea display
- `MarketAnalysisCard` - Market sentiment/analysis display

### AI Model Configuration
- Model: `gemini-3-pro-preview`
- Uses `responseMimeType: "application/json"` with `responseSchema` for structured output
- Media resolution set to `MEDIA_RESOLUTION_HIGH` for video analysis

## Tech Stack

- **React 19** with TypeScript
- **Vite** for bundling
- **Tailwind CSS** via CDN with custom terminal/trading theme
- **@google/genai** for Gemini API
- **lucide-react** for icons
- **Fonts**: JetBrains Mono (code), Space Grotesk (UI)

## Styling

Uses a dark trading terminal aesthetic:
- Background: `#030712` with grid overlay
- Panel: `#0b1121`
- Accent: Cyan (`#06b6d4`)
- Custom CSS scanline animation for retro effect
