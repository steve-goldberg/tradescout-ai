<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TradeScout AI Terminal

AI-powered trading video analyzer that extracts actionable trade setups from market analysis content using Google Gemini's vision capabilities.

## Features

- **Video Analysis**: Upload video files or paste YouTube URLs for instant analysis
- **Visual OCR**: AI reads price levels directly from charts (support/resistance, fib levels, entries/exits)
- **Trade Extraction**: Automatically identifies long and short setups with entry, stop loss, and take profit levels
- **Market Sentiment**: Provides macro analysis, sentiment scoring (0-100), and risk assessment
- **Multi-Scenario Detection**: Captures both bullish and bearish conditional setups from a single video
- **Structured Output**: Returns validated JSON with strict schema enforcement

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| AI Model | Google Gemini 3 Pro Preview |
| Icons | Lucide React |
| Fonts | JetBrains Mono, Space Grotesk |

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Output Structure

The AI returns structured data including:

**Market Analysis**
- Sentiment (Bullish/Bearish/Neutral/Uncertain)
- Sentiment score (0-100)
- High timeframe analysis
- Risk factors
- Cycle timing
- Macro outlook

**Trade Ideas**
- Asset & ticker
- Direction (Long/Short)
- Entry price
- Take profit
- Stop loss
- Thesis & invalidation
- Timeframe
- Risk level (Low/Medium/High/Degen)
